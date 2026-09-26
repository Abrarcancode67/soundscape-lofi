import React, { useState } from 'react';
import { fasSdk } from '../../services/fasSdk';
import { 
  Component, 
  Palette, 
  Check, 
  Copy, 
  Sparkles, 
  Sliders, 
  Search, 
  Heart, 
  User, 
  Volume2 
} from 'lucide-react';

export const UiComponentGallery: React.FC = () => {
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [progressVal, setProgressVal] = useState(65);
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  const copyImport = (name: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 2000);
  };

  const user = fasSdk.getUser();

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[var(--line)] gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-mono-code mb-1">
            <span>@freeappstore/sdk/ui</span>
            <span aria-hidden="true">·</span>
            <span>Living Design System & Component Library</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--ink-strong)] tracking-tight font-serif-display">
            Official UI Component Showcase
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1 max-w-2xl">
            Drop-in React components tailored for FreeAppStore apps. Designed to blend seamlessly 
            with platform tokens (<code>--ink</code>, <code>--accent</code>, <code>--line</code>) and brand fonts.
          </p>
        </div>

        <span className="text-xs font-mono-code px-3 py-1.5 rounded-xl bg-[var(--panel)] border border-[var(--line)] text-[var(--muted)]">
          18 Drop-in Components
        </span>
      </div>

      {/* Grid of Component Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. FasShell / Shell */}
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono-code font-bold text-xs text-[var(--ink-strong)]">
                &lt;FasShell /&gt;
              </span>
              <button
                onClick={() => copyImport('FasShell', "import { FasShell } from '@freeappstore/sdk/ui';")}
                className="text-[11px] text-[var(--muted)] hover:text-[var(--accent)] font-mono-code"
              >
                {copiedName === 'FasShell' ? 'Copied!' : 'Copy import'}
              </button>
            </div>
            <p className="text-xs text-[var(--muted)] mb-3">
              Zero-config responsive app shell featuring sticky navigation, profile menu, and platform footer.
            </p>
            <div className="p-3 bg-[var(--panel-secondary)] rounded-xl border border-[var(--line)] text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-1.5">
                <span className="font-bold text-[var(--accent)]">Free</span>
                <span className="text-[11px] text-[var(--muted)]">Demo App</span>
                <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center">
                  A
                </div>
              </div>
              <div className="text-[11px] text-slate-500 py-1 text-center font-mono-code">
                [Children mounted inside ErrorBoundary]
              </div>
            </div>
          </div>
          <div className="text-[11px] font-mono-code text-[var(--muted)] pt-2 border-t border-[var(--line)]">
            Props: app, appName, requireAuth
          </div>
        </div>

        {/* 2. Avatar & SignInButton */}
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono-code font-bold text-xs text-[var(--ink-strong)]">
                &lt;Avatar /&gt; & &lt;SignInButton /&gt;
              </span>
              <button
                onClick={() => copyImport('Avatar', "import { Avatar, SignInButton } from '@freeappstore/sdk/ui';")}
                className="text-[11px] text-[var(--muted)] hover:text-[var(--accent)] font-mono-code"
              >
                {copiedName === 'Avatar' ? 'Copied!' : 'Copy import'}
              </button>
            </div>
            <p className="text-xs text-[var(--muted)] mb-3">
              Branded authentication affordances with fallback initial circles.
            </p>
            <div className="p-3 bg-[var(--panel-secondary)] rounded-xl border border-[var(--line)] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {user?.login.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-xs">
                  <div className="font-bold text-[var(--ink)]">{user?.login || 'alex-dev'}</div>
                  <div className="text-[10px] text-[var(--muted)] font-mono-code">GitHub OAuth</div>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-[var(--accent)] text-white text-xs font-bold rounded-lg shadow-xs hover:opacity-95">
                Sign in
              </button>
            </div>
          </div>
          <div className="text-[11px] font-mono-code text-[var(--muted)] pt-2 border-t border-[var(--line)]">
            Props: user, size, app, label
          </div>
        </div>

        {/* 3. Status Badges & Progress */}
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono-code font-bold text-xs text-[var(--ink-strong)]">
                &lt;Badge /&gt; & &lt;ProgressBar /&gt;
              </span>
              <button
                onClick={() => copyImport('Badge', "import { Badge, ProgressBar } from '@freeappstore/sdk/ui';")}
                className="text-[11px] text-[var(--muted)] hover:text-[var(--accent)] font-mono-code"
              >
                {copiedName === 'Badge' ? 'Copied!' : 'Copy import'}
              </button>
            </div>
            <p className="text-xs text-[var(--muted)] mb-3">
              Feedback indicators for quota limits, system status, and task completion.
            </p>
            <div className="p-3 bg-[var(--panel-secondary)] rounded-xl border border-[var(--line)] space-y-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                  success
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-600 border border-amber-500/30">
                  warning
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/15 text-rose-600 border border-rose-500/30">
                  danger
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[var(--muted)]">
                  <span>Quota Used</span>
                  <span>{progressVal}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--line)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] transition-all"
                    style={{ width: `${progressVal}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="text-[11px] font-mono-code text-[var(--muted)] pt-2 border-t border-[var(--line)]">
            Props: variant, value, label
          </div>
        </div>

        {/* 4. SearchInput & ListRow */}
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono-code font-bold text-xs text-[var(--ink-strong)]">
                &lt;SearchInput /&gt; & &lt;ListRow /&gt;
              </span>
              <button
                onClick={() => copyImport('SearchInput', "import { SearchInput, ListRow } from '@freeappstore/sdk/ui';")}
                className="text-[11px] text-[var(--muted)] hover:text-[var(--accent)] font-mono-code"
              >
                {copiedName === 'SearchInput' ? 'Copied!' : 'Copy import'}
              </button>
            </div>
            <p className="text-xs text-[var(--muted)] mb-3">
              Standardized query input with icon prefix and unified row containers.
            </p>
            <div className="p-3 bg-[var(--panel-secondary)] rounded-xl border border-[var(--line)] space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-[var(--panel)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
                />
              </div>
              <div className="p-2 bg-[var(--panel)] border border-[var(--line)] rounded-lg text-xs flex justify-between items-center">
                <div>
                  <div className="font-semibold text-[var(--ink)]">Item Row Title</div>
                  <div className="text-[10px] text-[var(--muted)]">Subtitle / metadata</div>
                </div>
                <span className="text-[10px] font-mono-code text-[var(--accent)]">Active</span>
              </div>
            </div>
          </div>
          <div className="text-[11px] font-mono-code text-[var(--muted)] pt-2 border-t border-[var(--line)]">
            Props: value, onChange, title, subtitle
          </div>
        </div>

        {/* 5. VoiceButton & VoiceTextArea */}
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono-code font-bold text-xs text-[var(--ink-strong)]">
                &lt;VoiceButton /&gt;
              </span>
              <button
                onClick={() => copyImport('Voice', "import { VoiceButton, VoiceTextArea } from '@freeappstore/sdk/ui';")}
                className="text-[11px] text-[var(--muted)] hover:text-[var(--accent)] font-mono-code"
              >
                {copiedName === 'Voice' ? 'Copied!' : 'Copy import'}
              </button>
            </div>
            <p className="text-xs text-[var(--muted)] mb-3">
              Push-to-talk speech transcription using browser Web Speech API.
            </p>
            <div className="p-4 bg-[var(--panel-secondary)] rounded-xl border border-[var(--line)] flex items-center justify-center gap-3">
              <button
                onClick={() => alert('Push-to-talk initialized')}
                className="p-3 bg-[var(--accent)] hover:opacity-90 text-white rounded-full shadow-md transition"
              >
                <Volume2 className="w-5 h-5" />
              </button>
              <div className="text-xs text-[var(--muted)]">
                Push-to-talk Voice Input
              </div>
            </div>
          </div>
          <div className="text-[11px] font-mono-code text-[var(--muted)] pt-2 border-t border-[var(--line)]">
            Props: onResult, onVoiceResult
          </div>
        </div>

        {/* 6. Tabs & Segmented Navigation */}
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono-code font-bold text-xs text-[var(--ink-strong)]">
                &lt;Tabs /&gt;
              </span>
              <button
                onClick={() => copyImport('Tabs', "import { Tabs } from '@freeappstore/sdk/ui';")}
                className="text-[11px] text-[var(--muted)] hover:text-[var(--accent)] font-mono-code"
              >
                {copiedName === 'Tabs' ? 'Copied!' : 'Copy import'}
              </button>
            </div>
            <p className="text-xs text-[var(--muted)] mb-3">
              Accessible segmented controls compliant with anti-slop zero-pill guidelines.
            </p>
            <div className="p-3 bg-[var(--panel-secondary)] rounded-xl border border-[var(--line)] space-y-2">
              <div className="flex bg-[var(--panel)] p-1 rounded-lg border border-[var(--line)]">
                {['Overview', 'Metrics', 'Settings'].map((t, idx) => (
                  <button
                    key={t}
                    onClick={() => setActiveTabIdx(idx)}
                    className={`flex-1 py-1 text-xs font-semibold rounded-md transition ${
                      activeTabIdx === idx
                        ? 'bg-[var(--accent)] text-white shadow-xs'
                        : 'text-[var(--muted)] hover:text-[var(--ink)]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-[var(--muted)] text-center py-1">
                Active tab index: {activeTabIdx}
              </div>
            </div>
          </div>
          <div className="text-[11px] font-mono-code text-[var(--muted)] pt-2 border-t border-[var(--line)]">
            Props: tabs, active, onChange
          </div>
        </div>
      </div>
    </div>
  );
};
