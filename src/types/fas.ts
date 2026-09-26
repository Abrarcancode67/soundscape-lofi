/**
 * Types for FreeAppStore Developer Studio & Guide Explorer
 */

export type AuthProvider = 'github' | 'google' | 'apple' | 'email';

export interface FasUser {
  id: string;
  login: string;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  provider: AuthProvider;
  email?: string;
  token?: string;
}

export interface KvEntry {
  key: string;
  value: any;
  updatedAt: string;
  sizeBytes: number;
}

export interface CounterEntry {
  name: string;
  value: number;
  lastUpdated: string;
}

export interface DocumentEntry {
  id: string;
  collection: string;
  data: Record<string, any>;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomPeer {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  joinedAt: string;
}

export interface RoomMessage {
  id: string;
  from: string;
  senderName: string;
  data: any;
  timestamp: string;
}

export type KeyVaultProvider = 
  | 'openai'
  | 'anthropic'
  | 'google_ai'
  | 'openrouter'
  | 'replicate'
  | 'stability'
  | 'elevenlabs'
  | 'stripe';

export interface KeyVaultStatus {
  provider: KeyVaultProvider;
  name: string;
  configured: boolean;
  maskedKey?: string;
  lastChecked?: string;
}

export type ProxyInjectionMode = 'query' | 'header' | 'bearer' | 'oauth2_cc';

export interface ProxyRule {
  id: string;
  urlPrefix: string;
  secretName: string;
  injectionMode: ProxyInjectionMode;
  paramName?: string;
  dailyCount: number;
}

export interface RoleAssignment {
  userId: string;
  userName: string;
  role: 'owner' | 'member' | 'moderator' | 'editor' | 'viewer' | string;
  assignedAt: string;
}

export interface FriendEntry {
  userId: string;
  username: string;
  avatarUrl: string;
  status: 'accepted' | 'pending_incoming' | 'pending_outgoing' | 'blocked';
  since: string;
}

export interface LogEntry {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
  timestamp: string;
  layer: 'memory' | 'localStorage' | 'server';
}

export type TemplateId = 'standalone' | 'connected' | 'game-canvas' | 'game-grid' | 'game-3d';

export interface TemplateFile {
  name: string;
  path: string;
  language: string;
  content: string;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  features: string[];
  files: TemplateFile[];
  badgeText: string;
  demoComponent: string;
}

export interface ComplianceViolation {
  id: string;
  ruleName: string;
  description: string;
  severity: 'error' | 'warning';
  file?: string;
  line?: number;
  fixable: boolean;
  remediation: string;
  autoFix?: () => void;
}

export interface ComplianceAuditReport {
  timestamp: string;
  appName: string;
  passed: boolean;
  score: number;
  checksTotal: number;
  checksPassed: number;
  violations: ComplianceViolation[];
  details: {
    noPlaceholders: boolean;
    noTrackingSdk: boolean;
    brandFontsPresent: boolean;
    noBrandOverrides: boolean;
    pwaManifestValid: boolean;
    bundleUnder300kb: boolean;
  };
}

export interface McpToolDefinition {
  name: string;
  category: 'build' | 'read' | 'inspect' | 'agent';
  authRequired: boolean;
  description: string;
  params: Record<string, string>;
  exampleUsage: string;
}
