import React, { useState } from 'react';
import { AuthTab } from './AuthTab';
import { KvTab } from './KvTab';
import { CountersTab } from './CountersTab';
import { DbTab } from './DbTab';
import { RoomsTab } from './RoomsTab';
import { KeysVaultTab } from './KeysVaultTab';
import { ProxyTab } from './ProxyTab';
import { RolesFriendsTab } from './RolesFriendsTab';
import { LogsTab } from './LogsTab';
import { fasSdk } from '../../services/fasSdk';
import { 
  ShieldCheck, 
  Database, 
  Hash, 
  FolderTree, 
  MessageSquare, 
  KeyRound, 
  Globe, 
  Users, 
  Terminal, 
  Layers 
} from 'lucide-react';

interface SdkSimulatorProps {
  initialSubTab?: string;
  appId: string;
  setAppId: (id: string) => void;
}

export const SdkSimulator: React.FC<SdkSimulatorProps> = ({ initialSubTab = 'auth', appId, setAppId }) => {
  const [subTab, setSubTab] = useState(initialSubTab);
  const [appIdInput, setAppIdInput] = useState(appId);

  const handleAppIdSave = () => {
    if (!appIdInput.trim()) return;
    setAppId(appIdInput.trim());
    fasSdk.setAppId(appIdInput.trim());
  };

  const navItems = [
    { id: 'auth', label: 'fas.auth', icon: ShieldCheck, badge: 'OAuth' },
    { id: 'kv', label: 'fas.kv', icon: Database, badge: '1MB' },
    { id: 'counters', label: 'fas.counters', icon: Hash, badge: 'Atomic' },
    { id: 'db', label: 'fas.db', icon: FolderTree, badge: 'Docs' },
    { id: 'rooms', label: 'fas.rooms', icon: MessageSquare, badge: 'WebSocket' },
    { id: 'keys', label: 'fas.keys', icon: KeyRound, badge: 'Vault' },
    { id: 'proxy', label: 'fas.proxy', icon: Globe, badge: 'Proxy' },
    { id: 'roles', label: 'fas.roles & friends', icon: Users, badge: 'RBAC' },
    { id: 'logs', label: 'fas.log', icon: Terminal, badge: 'Console' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Workbench Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[var(--line)] gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-mono-code mb-1">
            <span>FreeAppStore Browser SDK v0.14.27</span>
            <span aria-hidden="true">·</span>
            <span>Interactive Runtime Sandbox</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--ink-strong)] tracking-tight font-serif-display">
            SDK Interactive Workbench
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1 max-w-2xl">
            Live interactive environment connected directly to real storage and API interfaces. 
            Test authentication, reactive rooms, document stores, and quotas in real-time.
          </p>
        </div>

        {/* Target AppId Switcher */}
        <div className="flex items-center gap-2 p-2 bg-[var(--panel)] border border-[var(--line)] rounded-xl shadow-xs">
          <span className="text-xs font-mono-code text-[var(--muted)] pl-2">appId:</span>
          <input
            type="text"
            value={appIdInput}
            onChange={e => setAppIdInput(e.target.value)}
            className="text-xs font-mono-code px-2.5 py-1.5 bg-[var(--panel-secondary)] border border-[var(--line)] rounded-lg text-[var(--ink)] font-bold outline-none w-36"
          />
          <button
            onClick={handleAppIdSave}
            className="px-3 py-1.5 bg-[var(--accent)] hover:opacity-95 text-white text-xs font-bold rounded-lg transition"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Sub-Client Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--line)]">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = subTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSubTab(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                isActive
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel-secondary)] border border-[var(--line)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              <span className={`text-[10px] font-mono-code px-1.5 py-0.2 rounded ${
                isActive ? 'bg-white/20 text-white' : 'bg-[var(--line)]/50 text-[var(--muted)]'
              }`}>
                {item.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Sub Tab Component */}
      <div className="pt-2">
        {subTab === 'auth' && <AuthTab />}
        {subTab === 'kv' && <KvTab />}
        {subTab === 'counters' && <CountersTab />}
        {subTab === 'db' && <DbTab />}
        {subTab === 'rooms' && <RoomsTab />}
        {subTab === 'keys' && <KeysVaultTab />}
        {subTab === 'proxy' && <ProxyTab />}
        {subTab === 'roles' && <RolesFriendsTab />}
        {subTab === 'logs' && <LogsTab />}
      </div>
    </div>
  );
};
