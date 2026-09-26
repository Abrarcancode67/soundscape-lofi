import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, Terminal, Code, ShieldCheck, Layers } from 'lucide-react';
import { GUIDE_SECTIONS } from '../../services/guideData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, targetId?: string) => void;
}

interface SearchItem {
  id: string;
  category: 'guide' | 'sdk' | 'cli' | 'template' | 'limits';
  title: string;
  description: string;
  tab: string;
  targetId?: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);

  // Build searchable index
  const index: SearchItem[] = [
    // Guide sections
    ...GUIDE_SECTIONS.flatMap(s => [
      {
        id: s.id,
        category: 'guide' as const,
        title: s.title,
        description: s.description,
        tab: 'guide',
        targetId: s.id,
      },
      ...s.subsections.map((sub, i) => ({
        id: `${s.id}-${i}`,
        category: 'guide' as const,
        title: `${s.title}: ${sub.title}`,
        description: sub.content.slice(0, 140) + '...',
        tab: 'guide',
        targetId: s.id,
      })),
    ]),
    // SDK methods
    { id: 'sdk-auth', category: 'sdk', title: 'fas.auth (GitHub, Google, Apple, Email)', description: 'OAuth redirect authentication, user session, and date of birth.', tab: 'sdk', targetId: 'auth' },
    { id: 'sdk-kv', category: 'sdk', title: 'fas.kv (Per-user Key-Value store)', description: 'Per-user, per-app storage on Cloudflare D1. 1MB limit, 64KB per key.', tab: 'sdk', targetId: 'kv' },
    { id: 'sdk-counters', category: 'sdk', title: 'fas.counters (Shared Atomic Counters)', description: 'App-wide atomic counters for likes, views, scores. -1000 to +1000 increment.', tab: 'sdk', targetId: 'counters' },
    { id: 'sdk-db', category: 'sdk', title: 'fas.db (Document Collections)', description: 'Public queryable document store with auth-based write permissions.', tab: 'sdk', targetId: 'db' },
    { id: 'sdk-rooms', category: 'sdk', title: 'fas.rooms (Realtime Ephemeral WebSocket Rooms)', description: 'Durable-Object-backed fan-out. 32 peers per room, 100 msgs/sec.', tab: 'sdk', targetId: 'rooms' },
    { id: 'sdk-proxy', category: 'sdk', title: 'fas.proxy (Secret-Injecting Proxy)', description: 'Call third-party APIs without leaking developer API keys in the browser.', tab: 'sdk', targetId: 'proxy' },
    { id: 'sdk-keys', category: 'sdk', title: 'fas.keys (User API Key Vault)', description: 'Encrypted AES-256-GCM vault for user OpenAI, Claude, Gemini keys.', tab: 'sdk', targetId: 'keys' },
    { id: 'sdk-roles', category: 'sdk', title: 'fas.roles & fas.friends', description: 'Per-app RBAC roles and platform-level friendship graph.', tab: 'sdk', targetId: 'roles' },
    { id: 'sdk-log', category: 'sdk', title: 'fas.log (3-Layer Logging)', description: 'Memory, localStorage, and server-side log streaming.', tab: 'sdk', targetId: 'logs' },

    // CLI commands
    { id: 'cli-init', category: 'cli', title: 'fas init <id> --template <name>', description: 'Scaffold new standalone, connected, or game app.', tab: 'scaffolder' },
    { id: 'cli-check', category: 'cli', title: 'fas check (Compliance Gate)', description: 'Audit code for placeholders, trackers, brand fonts, tokens, manifest, size.', tab: 'compliance' },
    { id: 'cli-publish', category: 'cli', title: 'fas publish', description: 'Provisions GitHub repo, R2 route, and deploys live in 30 seconds.', tab: 'terminal' },
    { id: 'cli-screencheck', category: 'cli', title: 'fas screencheck', description: 'Responsive multi-device viewport testing across iPhone and iPad.', tab: 'terminal' },
    { id: 'cli-secret', category: 'cli', title: 'fas secret set|list|rm', description: 'Manage server-side encrypted developer API keys.', tab: 'terminal' },
    { id: 'cli-proxy', category: 'cli', title: 'fas proxy allow|list|deny', description: 'Manage URL allowlist and parameter injection for proxy.', tab: 'terminal' },

    // Templates
    { id: 'tmpl-standalone', category: 'template', title: 'Template: standalone (Default PWA)', description: 'LocalStorage only, zero backend dependency, works offline.', tab: 'scaffolder', targetId: 'standalone' },
    { id: 'tmpl-connected', category: 'template', title: 'Template: connected (Full Platform SDK)', description: 'Connected backend with auth, KV, counters, and rooms.', tab: 'scaffolder', targetId: 'connected' },
    { id: 'tmpl-canvas', category: 'template', title: 'Template: game-canvas (60fps Canvas Loop)', description: 'Arcade games with 2D physics and particle explosions.', tab: 'scaffolder', targetId: 'game-canvas' },
    { id: 'tmpl-grid', category: 'template', title: 'Template: game-grid (Turn-based)', description: 'Chess, puzzles, checkers with state machine and turn replay.', tab: 'scaffolder', targetId: 'game-grid' },
    { id: 'tmpl-3d', category: 'template', title: 'Template: game-3d (Three.js WebGL)', description: '3D game scene with camera, lighting, and low-poly shaders.', tab: 'scaffolder', targetId: 'game-3d' },

    // Limits
    { id: 'lim-kv', category: 'limits', title: 'KV Quotas: 1MB, 100 Keys, 64KB Value', description: 'Breach status 413 Payload Too Large.', tab: 'guide', targetId: 'platform-limits' },
    { id: 'lim-rooms', category: 'limits', title: 'Realtime Limits: 32 Peers, 4KB Message', description: 'Breach status 503 Room Full; 24h idle eviction.', tab: 'guide', targetId: 'platform-limits' },
  ];

  useEffect(() => {
    if (!query.trim()) {
      setResults(index.slice(0, 8));
    } else {
      const q = query.toLowerCase();
      const filtered = index.filter(
        item => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      );
      setResults(filtered.slice(0, 12));
    }
  }, [query]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onNavigate(window.location.hash || 'guide');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigate]);

  if (!isOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'guide':
        return <BookOpen className="w-4 h-4 text-sky-500" />;
      case 'sdk':
        return <Code className="w-4 h-4 text-emerald-500" />;
      case 'cli':
        return <Terminal className="w-4 h-4 text-amber-500" />;
      case 'template':
        return <Layers className="w-4 h-4 text-indigo-500" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-rose-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[var(--panel)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[var(--line)] gap-3 bg-[var(--panel-secondary)]">
          <Search className="w-5 h-5 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search FreeAppStore guide, SDK methods, CLI, limits, templates..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--ink-strong)] placeholder-[var(--muted)] font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-[var(--muted)] hover:text-[var(--ink)]">
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="text-xs text-[var(--muted)] hover:text-[var(--ink)] px-2 py-1 rounded bg-[var(--panel)] border border-[var(--line)]"
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-[var(--line)]/50">
          {results.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--muted)]">
              No results found for "<span className="font-semibold text-[var(--ink)]">{query}</span>"
            </div>
          ) : (
            results.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.tab, item.targetId);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-[var(--panel-secondary)] transition flex items-start gap-3 group"
              >
                <div className="p-2 rounded-lg bg-[var(--panel)] border border-[var(--line)] mt-0.5 group-hover:border-[var(--accent)]/40 transition">
                  {getCategoryIcon(item.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--ink-strong)] group-hover:text-[var(--accent)] transition truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono-code uppercase px-1.5 py-0.2 rounded bg-[var(--panel-secondary)] border border-[var(--line)] text-[var(--muted)]">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[var(--panel-secondary)] border-t border-[var(--line)] text-[11px] text-[var(--muted)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono-code font-bold">↵</kbd> Select</span>
            <span><kbd className="font-mono-code font-bold">Esc</kbd> Close</span>
          </div>
          <span className="font-mono-code">FreeAppStore Platform Knowledge Base</span>
        </div>
      </div>
    </div>
  );
};
