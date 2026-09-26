import React from 'react';
import { Search, Terminal, Palette, Sun, Moon, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appId: string;
  setAppId: (id: string) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  onOpenSearch: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const ACCENT_COLORS = [
  { name: 'Emerald', value: '#10b981' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Cyan', value: '#06b6d4' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  appId,
  setAppId,
  accentColor,
  setAccentColor,
  onOpenSearch,
  theme,
  setTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[var(--panel)] border-b border-[var(--line)] px-4 lg:px-8 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('guide')}
            className="text-lg lg:text-xl font-extrabold tracking-tight text-[var(--ink-strong)] flex items-center gap-2 hover:opacity-90 transition text-left"
          >
            <span className="text-[var(--accent)] font-serif-display text-2xl font-bold">Free</span>
            <span className="font-sans">AppStore Studio</span>
          </button>
          <span className="hidden sm:inline-flex text-[11px] font-mono-code font-semibold px-2 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20">
            SDK v0.14
          </span>
        </div>

        {/* Zone 2: Navigation Links / Segmented Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[var(--panel-secondary)] p-1 rounded-xl border border-[var(--line)]">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-[var(--panel)] text-[var(--ink-strong)] shadow-xs border border-[var(--line)]'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            Guide & Reference
          </button>
          <button
            onClick={() => setActiveTab('sdk')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === 'sdk'
                ? 'bg-[var(--panel)] text-[var(--ink-strong)] shadow-xs border border-[var(--line)]'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            SDK Simulator
          </button>
          <button
            onClick={() => setActiveTab('scaffolder')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === 'scaffolder'
                ? 'bg-[var(--panel)] text-[var(--ink-strong)] shadow-xs border border-[var(--line)]'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            Scaffolder (fas init)
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === 'compliance'
                ? 'bg-[var(--panel)] text-[var(--ink-strong)] shadow-xs border border-[var(--line)]'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            Compliance (fas check)
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === 'terminal'
                ? 'bg-[var(--panel)] text-[var(--ink-strong)] shadow-xs border border-[var(--line)]'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            CLI & MCP
          </button>
          <button
            onClick={() => setActiveTab('ui')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === 'ui'
                ? 'bg-[var(--panel)] text-[var(--ink-strong)] shadow-xs border border-[var(--line)]'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            UI Showcase
          </button>
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs bg-[var(--panel-secondary)] hover:bg-[var(--line)]/50 text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)] rounded-lg transition"
            title="Search documentation & APIs (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Search Guide</span>
            <kbd className="hidden lg:inline text-[10px] font-mono-code bg-[var(--panel)] px-1.5 py-0.5 rounded border border-[var(--line)]">
              ⌘K
            </kbd>
          </button>

          {/* Accent Color Picker dropdown / dots */}
          <div className="hidden sm:flex items-center gap-1 bg-[var(--panel-secondary)] px-2 py-1 rounded-lg border border-[var(--line)]">
            {ACCENT_COLORS.map(c => (
              <button
                key={c.name}
                onClick={() => setAccentColor(c.value)}
                title={`Accent: ${c.name}`}
                className={`w-3.5 h-3.5 rounded-full transition-transform ${
                  accentColor === c.value ? 'scale-125 ring-2 ring-[var(--ink-strong)]' : 'hover:scale-110 opacity-70'
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>

          {/* Theme switcher */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--panel-secondary)] hover:bg-[var(--line)]/50 border border-[var(--line)] rounded-lg transition"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden items-center gap-1 overflow-x-auto pt-2 pb-1 text-xs border-t border-[var(--line)]/50 mt-2">
        {[
          { id: 'guide', label: 'Guide' },
          { id: 'sdk', label: 'SDK Simulator' },
          { id: 'scaffolder', label: 'Scaffolder' },
          { id: 'compliance', label: 'Compliance' },
          { id: 'terminal', label: 'CLI & MCP' },
          { id: 'ui', label: 'UI Showcase' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--muted)] hover:bg-[var(--panel-secondary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
