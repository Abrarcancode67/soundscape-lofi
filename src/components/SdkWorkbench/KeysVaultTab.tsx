import React, { useState, useEffect } from 'react';
import { fasSdk } from '../../services/fasSdk';
import { KeyVaultStatus, KeyVaultProvider } from '../../types/fas';
import { KeyRound, Shield, CheckCircle2, XCircle, Lock, RefreshCw, Sparkles } from 'lucide-react';

export const KeysVaultTab: React.FC = () => {
  const [statuses, setStatuses] = useState<KeyVaultStatus[]>([]);
  const [editingProvider, setEditingProvider] = useState<KeyVaultStatus | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);

  const refresh = () => {
    setStatuses(fasSdk.getKeyVaultStatuses());
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleSaveKey = () => {
    if (!editingProvider || !keyInput.trim()) return;
    fasSdk.setVaultKey(editingProvider.provider, keyInput.trim());
    setKeyInput('');
    setEditingProvider(null);
    refresh();
  };

  const handleRevoke = (provider: KeyVaultProvider) => {
    fasSdk.removeVaultKey(provider);
    refresh();
  };

  const testHasKey = (provider: KeyVaultProvider) => {
    const item = statuses.find(s => s.provider === provider);
    const has = Boolean(item?.configured);
    setTestResult(`fas.keys.has("${provider}") === ${has}`);
    setTimeout(() => setTestResult(null), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[var(--line)] gap-2">
          <div>
            <h3 className="text-base font-bold text-[var(--ink-strong)] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[var(--accent)]" />
              <span>fas.keys (User-Owned Encrypted API Key Vault)</span>
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Zero plaintext leakage. End users configure their own AI keys once; the platform proxy injects them server-side.
            </p>
          </div>
          <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-[var(--panel-secondary)] border border-[var(--line)] text-[var(--muted)]">
            AES-256-GCM Envelope Encryption
          </span>
        </div>

        {testResult && (
          <div className="mt-4 p-3 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-xs font-mono-code font-bold text-[var(--ink)] flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>{testResult}</span>
          </div>
        )}

        {/* Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {statuses.map(item => (
            <div
              key={item.provider}
              className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                item.configured
                  ? 'bg-[var(--panel-secondary)] border-emerald-500/30'
                  : 'bg-[var(--panel-secondary)] border-[var(--line)] opacity-85'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono-code text-xs font-bold text-[var(--ink-strong)] truncate">
                    {item.provider}
                  </span>
                  {item.configured ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" /> Configured
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--muted)] bg-[var(--line)]/50 px-1.5 py-0.5 rounded">
                      <XCircle className="w-3 h-3" /> Not Set
                    </span>
                  )}
                </div>

                <div className="text-xs text-[var(--muted)] line-clamp-1 mb-3">
                  {item.name}
                </div>

                {item.maskedKey && (
                  <div className="text-[11px] font-mono-code text-[var(--ink)] p-1.5 bg-[var(--panel)] rounded border border-[var(--line)] mb-3">
                    {item.maskedKey}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[var(--line)]/50">
                <button
                  onClick={() => testHasKey(item.provider)}
                  className="flex-1 py-1 text-[11px] font-mono-code font-semibold rounded bg-[var(--panel)] hover:bg-[var(--line)]/50 border border-[var(--line)] text-[var(--ink)] transition"
                  title="Check has() in SDK"
                >
                  has()
                </button>
                <button
                  onClick={() => setEditingProvider(item)}
                  className="flex-1 py-1 text-[11px] font-semibold rounded bg-[var(--accent)] hover:opacity-95 text-white transition"
                >
                  {item.configured ? 'Update' : 'Configure'}
                </button>
                {item.configured && (
                  <button
                    onClick={() => handleRevoke(item.provider)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                    title="Revoke key"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal for setting key */}
        {editingProvider && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                <h4 className="text-sm font-bold text-[var(--ink-strong)] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[var(--accent)]" />
                  <span>Configure {editingProvider.name}</span>
                </h4>
                <button
                  onClick={() => setEditingProvider(null)}
                  className="text-xs text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Enter your personal API key. On the real FreeAppStore platform, keys are encrypted at rest with AES-256-GCM. 
                Third-party apps cannot inspect plaintext keys.
              </p>

              <div className="space-y-1">
                <label className="text-[11px] font-mono-code text-[var(--muted)]">API Key Secret</label>
                <input
                  type="password"
                  placeholder="sk-proj-..."
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  className="w-full text-xs font-mono-code px-3 py-2 bg-[var(--panel-secondary)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingProvider(null)}
                  className="px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--ink)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveKey}
                  className="px-4 py-1.5 bg-[var(--accent)] text-white text-xs font-bold rounded-lg hover:opacity-95"
                >
                  Save to Vault
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
