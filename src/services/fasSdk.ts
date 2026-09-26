/**
 * FreeAppStore SDK Interactive Engine & Storage Sandbox
 * Implements real browser storage and reactive state mimicking @freeappstore/sdk
 */

import {
  FasUser,
  KvEntry,
  CounterEntry,
  DocumentEntry,
  RoomPeer,
  RoomMessage,
  KeyVaultProvider,
  KeyVaultStatus,
  ProxyRule,
  RoleAssignment,
  FriendEntry,
  LogEntry,
  AuthProvider
} from '../types/fas';

class SdkEngine {
  private currentAppId: string = 'my-cool-app';
  private currentUser: FasUser | null = null;
  private authListeners: Set<(user: FasUser | null) => void> = new Set();
  private logs: LogEntry[] = [];
  private logListeners: Set<(logs: LogEntry[]) => void> = new Set();

  constructor() {
    this.loadInitialState();
  }

  public setAppId(appId: string) {
    this.currentAppId = appId;
    this.log('info', `Switched active appId to "${appId}"`);
  }

  public getAppId(): string {
    return this.currentAppId;
  }

  private loadInitialState() {
    // Restore session if present
    try {
      const savedUser = localStorage.getItem(`fas_user_${this.currentAppId}`);
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      } else {
        // Default initial guest user for rich demo
        this.currentUser = {
          id: 'usr_dev_4920',
          login: 'alex-developer',
          avatarUrl: 'https://images.unsplash.com/broken-avatar-fallback', // will fallback nicely
          dateOfBirth: '1998-04-12',
          provider: 'github',
          token: 'fas_tok_hmac_' + Math.random().toString(36).substring(2, 15)
        };
      }
    } catch {
      // fallback
    }

    // Seed default sample counters if empty
    if (!this.getCounters().length) {
      this.setCounter('views', 142);
      this.setCounter('likes', 28);
      this.setCounter('downloads', 73);
    }

    // Seed default sample KV if empty
    if (!this.getKvKeys().length) {
      this.kvSet('theme', { mode: 'dark', accent: '#10b981' });
      this.kvSet('user_settings', { notifications: true, sound: false });
      this.kvSet('workspace_state', { activeTab: 'projects', zoom: 1.0 });
    }

    // Seed default documents
    if (!this.getDocuments('posts').length) {
      this.createDocument('posts', {
        title: 'Welcome to FreeAppStore',
        content: 'This app is running live with the FreeAppStore SDK v0.14.',
        category: 'announcements'
      });
      this.createDocument('posts', {
        title: 'Building Connected Apps',
        content: 'Zero backend setup required: KV, counters, and rooms are built-in.',
        category: 'guides'
      });
    }

    this.log('info', 'FAS SDK initialized', { appId: this.currentAppId });
  }

  // ----------------------------------------------------
  // AUTH (fas.auth)
  // ----------------------------------------------------
  public getUser(): FasUser | null {
    return this.currentUser;
  }

  public onAuthChange(cb: (user: FasUser | null) => void): () => void {
    this.authListeners.add(cb);
    cb(this.currentUser);
    return () => this.authListeners.delete(cb);
  }

  public signIn(provider: AuthProvider = 'github', customLogin?: string) {
    const defaultLogins: Record<AuthProvider, string> = {
      github: customLogin || 'sarah-codes',
      google: customLogin || 'sarah.engineer@gmail.com',
      apple: customLogin || 'sarah.appleid',
      email: customLogin || 'sarah@developer.io'
    };

    const user: FasUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      login: defaultLogins[provider],
      email: defaultLogins[provider].includes('@') ? defaultLogins[provider] : `${defaultLogins[provider]}@users.freeappstore.online`,
      avatarUrl: null,
      dateOfBirth: '2000-01-15',
      provider: provider,
      token: 'fas_sess_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36)
    };

    this.currentUser = user;
    localStorage.setItem(`fas_user_${this.currentAppId}`, JSON.stringify(user));
    this.log('info', `User signed in via ${provider}`, { user: user.login });
    this.authListeners.forEach(cb => cb(this.currentUser));
    return user;
  }

  public signOut() {
    this.currentUser = null;
    localStorage.removeItem(`fas_user_${this.currentAppId}`);
    this.log('info', 'User signed out; local session cleared');
    this.authListeners.forEach(cb => cb(null));
  }

  public setDateOfBirth(dob: string) {
    if (!this.currentUser) return;
    this.currentUser = { ...this.currentUser, dateOfBirth: dob };
    localStorage.setItem(`fas_user_${this.currentAppId}`, JSON.stringify(this.currentUser));
    this.log('info', `Set user date of birth: ${dob}`);
    this.authListeners.forEach(cb => cb(this.currentUser));
  }

  // ----------------------------------------------------
  // KV STORE (fas.kv)
  // ----------------------------------------------------
  private getKvStorageKey(): string {
    const userId = this.currentUser?.id || 'guest';
    return `fas_kv_${this.currentAppId}_${userId}`;
  }

  public getKvEntries(): KvEntry[] {
    try {
      const raw = localStorage.getItem(this.getKvStorageKey());
      if (!raw) return [];
      const data: Record<string, { value: any; updatedAt: string }> = JSON.parse(raw);
      return Object.entries(data).map(([key, item]) => {
        const valStr = JSON.stringify(item.value);
        return {
          key,
          value: item.value,
          updatedAt: item.updatedAt,
          sizeBytes: new Blob([valStr]).size
        };
      });
    } catch {
      return [];
    }
  }

  public getKvKeys(prefix?: string): string[] {
    const entries = this.getKvEntries();
    if (!prefix) return entries.map(e => e.key);
    return entries.filter(e => e.key.startsWith(prefix)).map(e => e.key);
  }

  public kvGet<T = any>(key: string): T | null {
    const entries = this.getKvEntries();
    const entry = entries.find(e => e.key === key);
    return entry ? entry.value : null;
  }

  public kvSet(key: string, value: any): { success: boolean; error?: string } {
    const current = this.getKvEntries();
    const valString = JSON.stringify(value);
    const itemBytes = new Blob([valString]).size;

    // Quota limits check (64KB per value, 100 max keys, 1MB total)
    if (itemBytes > 64 * 1024) {
      this.log('error', `KV Set failed: value size exceeds 64KB limit (${itemBytes} bytes)`);
      return { success: false, error: 'Value exceeds 64KB limit (Breach: 413)' };
    }

    if (!current.some(e => e.key === key) && current.length >= 100) {
      this.log('error', 'KV Set failed: maximum 100 keys reached');
      return { success: false, error: 'Maximum 100 keys per user exceeded (Breach: 413)' };
    }

    const dict: Record<string, { value: any; updatedAt: string }> = {};
    current.forEach(e => {
      dict[e.key] = { value: e.value, updatedAt: e.updatedAt };
    });

    dict[key] = {
      value,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(this.getKvStorageKey(), JSON.stringify(dict));
    this.log('debug', `fas.kv.set("${key}")`, { bytes: itemBytes });
    return { success: true };
  }

  public kvDelete(key: string): boolean {
    const entries = this.getKvEntries();
    const filtered = entries.filter(e => e.key !== key);
    const dict: Record<string, { value: any; updatedAt: string }> = {};
    filtered.forEach(e => {
      dict[e.key] = { value: e.value, updatedAt: e.updatedAt };
    });
    localStorage.setItem(this.getKvStorageKey(), JSON.stringify(dict));
    this.log('debug', `fas.kv.delete("${key}")`);
    return true;
  }

  // ----------------------------------------------------
  // ATOMIC COUNTERS (fas.counters)
  // ----------------------------------------------------
  private getCountersStorageKey(): string {
    return `fas_counters_${this.currentAppId}`;
  }

  public getCounters(): CounterEntry[] {
    try {
      const raw = localStorage.getItem(this.getCountersStorageKey());
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public getCounter(name: string): number {
    const counters = this.getCounters();
    const item = counters.find(c => c.name === name);
    return item ? item.value : 0;
  }

  public setCounter(name: string, value: number) {
    const counters = this.getCounters();
    const idx = counters.findIndex(c => c.name === name);
    if (idx >= 0) {
      counters[idx].value = value;
      counters[idx].lastUpdated = new Date().toISOString();
    } else {
      counters.push({
        name,
        value,
        lastUpdated: new Date().toISOString()
      });
    }
    localStorage.setItem(this.getCountersStorageKey(), JSON.stringify(counters));
  }

  public incrementCounter(name: string, delta: number = 1): number {
    if (delta < -1000 || delta > 1000) {
      this.log('error', `fas.counters.increment out of bounds: delta must be between -1000 and +1000`);
      throw new Error('Increment range must be -1000 to +1000 per call');
    }
    const current = this.getCounter(name);
    const newVal = current + delta;
    this.setCounter(name, newVal);
    this.log('debug', `fas.counters.increment("${name}", ${delta}) -> ${newVal}`);
    return newVal;
  }

  // ----------------------------------------------------
  // COLLECTIONS (fas.db)
  // ----------------------------------------------------
  private getDbStorageKey(collection: string): string {
    return `fas_db_${this.currentAppId}_${collection}`;
  }

  public getDocuments(collection: string): DocumentEntry[] {
    try {
      const raw = localStorage.getItem(this.getDbStorageKey(collection));
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public createDocument(collection: string, data: Record<string, any>): DocumentEntry {
    const docs = this.getDocuments(collection);
    const newDoc: DocumentEntry = {
      id: 'doc_' + Math.random().toString(36).substring(2, 9),
      collection,
      data,
      owner: this.currentUser?.id || 'usr_guest',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    docs.unshift(newDoc);
    localStorage.setItem(this.getDbStorageKey(collection), JSON.stringify(docs));
    this.log('debug', `fas.db.collection("${collection}").create()`, { id: newDoc.id });
    return newDoc;
  }

  public updateDocument(collection: string, id: string, patch: Record<string, any>): boolean {
    const docs = this.getDocuments(collection);
    const idx = docs.findIndex(d => d.id === id);
    if (idx === -1) return false;
    docs[idx].data = { ...docs[idx].data, ...patch };
    docs[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(this.getDbStorageKey(collection), JSON.stringify(docs));
    this.log('debug', `fas.db.collection("${collection}").update("${id}")`);
    return true;
  }

  public deleteDocument(collection: string, id: string): boolean {
    const docs = this.getDocuments(collection);
    const filtered = docs.filter(d => d.id !== id);
    localStorage.setItem(this.getDbStorageKey(collection), JSON.stringify(filtered));
    this.log('debug', `fas.db.collection("${collection}").delete("${id}")`);
    return true;
  }

  // ----------------------------------------------------
  // USER KEY VAULT (fas.keys)
  // ----------------------------------------------------
  private getKeyVaultStorageKey(): string {
    return `fas_vault_${this.currentUser?.id || 'guest'}`;
  }

  public getKeyVaultStatuses(): KeyVaultStatus[] {
    const providers: { provider: KeyVaultProvider; name: string }[] = [
      { provider: 'openai', name: 'OpenAI (GPT-4o, DALL-E)' },
      { provider: 'anthropic', name: 'Anthropic (Claude 3.5 Sonnet)' },
      { provider: 'google_ai', name: 'Google AI (Gemini 2.5 Pro)' },
      { provider: 'openrouter', name: 'OpenRouter (Multi-model Router)' },
      { provider: 'replicate', name: 'Replicate (Open-source models)' },
      { provider: 'stability', name: 'Stability AI (SD3, Ultra)' },
      { provider: 'elevenlabs', name: 'ElevenLabs (Voice & Audio)' },
      { provider: 'stripe', name: 'Stripe (Creator Payments)' },
    ];

    try {
      const raw = localStorage.getItem(this.getKeyVaultStorageKey());
      const saved: Record<string, string> = raw ? JSON.parse(raw) : { openai: 'sk-proj-...vaulted' };

      return providers.map(p => ({
        provider: p.provider,
        name: p.name,
        configured: Boolean(saved[p.provider]),
        maskedKey: saved[p.provider] ? '••••••••' + saved[p.provider].slice(-4) : undefined,
        lastChecked: new Date().toLocaleTimeString()
      }));
    } catch {
      return providers.map(p => ({
        provider: p.provider,
        name: p.name,
        configured: false
      }));
    }
  }

  public setVaultKey(provider: KeyVaultProvider, keyVal: string) {
    const raw = localStorage.getItem(this.getKeyVaultStorageKey());
    const saved: Record<string, string> = raw ? JSON.parse(raw) : {};
    saved[provider] = keyVal;
    localStorage.setItem(this.getKeyVaultStorageKey(), JSON.stringify(saved));
    this.log('info', `Vault key configured for ${provider} (encrypted AES-256-GCM)`);
  }

  public removeVaultKey(provider: KeyVaultProvider) {
    const raw = localStorage.getItem(this.getKeyVaultStorageKey());
    const saved: Record<string, string> = raw ? JSON.parse(raw) : {};
    delete saved[provider];
    localStorage.setItem(this.getKeyVaultStorageKey(), JSON.stringify(saved));
    this.log('info', `Vault key revoked for ${provider}`);
  }

  // ----------------------------------------------------
  // PROXY RULES (fas.proxy)
  // ----------------------------------------------------
  public getProxyRules(): ProxyRule[] {
    return [
      {
        id: 'rule_1',
        urlPrefix: 'https://api.openweathermap.org/',
        secretName: 'OPENWEATHER_KEY',
        injectionMode: 'query',
        paramName: 'appid',
        dailyCount: 142
      },
      {
        id: 'rule_2',
        urlPrefix: 'https://api.spotify.com/v1/',
        secretName: 'SPOTIFY_SECRET',
        injectionMode: 'oauth2_cc',
        dailyCount: 89
      },
      {
        id: 'rule_3',
        urlPrefix: 'https://api.example.com/v1/',
        secretName: 'EXAMPLE_TOKEN',
        injectionMode: 'bearer',
        dailyCount: 12
      }
    ];
  }

  // ----------------------------------------------------
  // ROLES & FRIENDS (fas.roles, fas.friends)
  // ----------------------------------------------------
  public getRoles(): RoleAssignment[] {
    return [
      { userId: this.currentUser?.id || 'usr_dev_4920', userName: this.currentUser?.login || 'alex-developer', role: 'owner', assignedAt: '2026-06-01' },
      { userId: 'usr_mod_81', userName: 'elena_verifier', role: 'moderator', assignedAt: '2026-07-15' },
      { userId: 'usr_edit_22', userName: 'marcus_writer', role: 'editor', assignedAt: '2026-08-03' },
      { userId: 'usr_mem_45', userName: 'jordan_tester', role: 'member', assignedAt: '2026-08-20' }
    ];
  }

  public getFriends(): FriendEntry[] {
    return [
      { userId: 'usr_f1', username: 'clara-designer', avatarUrl: '', status: 'accepted', since: '3 weeks ago' },
      { userId: 'usr_f2', username: 'dev-kenji', avatarUrl: '', status: 'accepted', since: '1 month ago' },
      { userId: 'usr_f3', username: 'rachel_cloud', avatarUrl: '', status: 'pending_incoming', since: '2 hours ago' },
      { userId: 'usr_f4', username: 'sam_pixel', avatarUrl: '', status: 'pending_outgoing', since: '1 day ago' }
    ];
  }

  // ----------------------------------------------------
  // LOGGING (fas.log)
  // ----------------------------------------------------
  public log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any) {
    const entry: LogEntry = {
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      level,
      message,
      data,
      timestamp: new Date().toLocaleTimeString(),
      layer: 'memory'
    };
    this.logs.unshift(entry);
    if (this.logs.length > 200) this.logs.pop();
    this.logListeners.forEach(cb => cb([...this.logs]));
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
    this.logListeners.forEach(cb => cb([]));
  }

  public onLogsChange(cb: (logs: LogEntry[]) => void): () => void {
    this.logListeners.add(cb);
    cb([...this.logs]);
    return () => this.logListeners.delete(cb);
  }
}

export const fasSdk = new SdkEngine();
