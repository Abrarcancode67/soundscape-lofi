import React, { useState, useEffect } from 'react';
import { fasSdk } from '../../services/fasSdk';
import { KvEntry } from '../../types/fas';
import { Database, Plus, Trash2, Search, HardDrive, RefreshCw, AlertCircle } from 'lucide-react';

export const KvTab: React.FC = () => {
  const [entries, setEntries] = useState<KvEntry[]>([]);
  const [filterPrefix, setFilterPrefix] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<KvEntry | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const refresh = () => {
    const list = fasSdk.getKvEntries();
    setEntries(list);
    if (selectedEntry) {
      const updated = list.find(e => e.key === selectedEntry.key);
      setSelectedEntry(updated || null);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const totalBytes = entries.reduce((acc, e) => acc + e.sizeBytes, 0);
  const totalKb = (totalBytes / 1024).toFixed(2);
  const percentBytes = Math.min(100, (totalBytes / (1024 * 1024)) * 100);
  const percentKeys = (entries.length / 100) * 100;

  const handleSave = () => {
    if (!newKey.trim()) return;

    let parsedVal = newVal;
    try {
      parsedVal = JSON.parse(newVal);
    } catch {
      // keep as string
    }

    const res = fasSdk.kvSet(newKey.trim(), parsedVal);
    if (!res.success) {
      setStatusMsg({ text: res.error || 'Failed to save', error: true });
    } else {
      setStatusMsg({ text: `Key "${newKey}" saved successfully` });
      setNewKey('');
      setNewVal('');
      refresh();
    }
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleDelete = (key: string) => {
    fasSdk.kvDelete(key);
    refresh();
    if (selectedEntry?.key === key) setSelectedEntry(null);
  };

  const filtered = filterPrefix
    ? entries.filter(e => e.key.startsWith(filterPrefix))
    : entries;

  return (
    <div className="space-y-6">
      {/* Platform Quotas Overview */}
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[var(--line)] gap-2">
          <div>
            <h3 className="text-base font-bold text-[var(--ink-strong)] flex items-center gap-2">
              <Database className="w-4 h-4 text-[var(--accent)]" />
              <span>fas.kv (Per-User Key-Value Store)</span>
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Isolated per (appId, userId) on Cloudflare D1. Atomic server-side updates with client AbortController support.
            </p>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--panel-secondary)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Quota Progress Meters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-[var(--panel-secondary)] border border-[var(--line)] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--muted)]">Storage Quota (1MB)</span>
              <span className="font-mono-code font-bold text-[var(--ink)] tabular-nums">{totalKb} KB / 1024 KB</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--line)] overflow-hidden">
              <div
                className="h-full bg-[var(--accent)] transition-all duration-300"
                style={{ width: `${Math.max(2, percentBytes)}%` }}
              />
            </div>
            <div className="text-[11px] text-[var(--muted)] font-mono-code">
              Breach status: 413 Payload Too Large
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--panel-secondary)] border border-[var(--line)] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--muted)]">Keys Count (100 max)</span>
              <span className="font-mono-code font-bold text-[var(--ink)] tabular-nums">{entries.length} / 100</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--line)] overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${Math.max(2, percentKeys)}%` }}
              />
            </div>
            <div className="text-[11px] text-[var(--muted)] font-mono-code">
              Breach status: 413 Key limit reached
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--panel-secondary)] border border-[var(--line)] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--muted)]">Max Value Size (64KB)</span>
              <span className="font-mono-code font-bold text-emerald-500">Strictly Enforced</span>
            </div>
            <div className="text-[11px] text-[var(--muted)] leading-relaxed">
              Every value is validated before dispatch. Supports strings, booleans, and JSON structures.
            </div>
          </div>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
            statusMsg.error ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{statusMsg.text}</span>
          </div>
        )}

        {/* KV Management Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 pt-6 border-t border-[var(--line)]">
          {/* Left: Keys Explorer */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="Filter keys (e.g. note: or theme)..."
                  value={filterPrefix}
                  onChange={e => setFilterPrefix(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-[var(--panel-secondary)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
                />
              </div>
              <span className="text-xs text-[var(--muted)] font-mono-code shrink-0">
                {filtered.length} keys
              </span>
            </div>

            <div className="border border-[var(--line)] rounded-xl overflow-hidden divide-y divide-[var(--line)] bg-[var(--panel)] max-h-80 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--muted)]">
                  No keys matching filter
                </div>
              ) : (
                filtered.map(entry => (
                  <div
                    key={entry.key}
                    onClick={() => {
                      setSelectedEntry(entry);
                      setNewKey(entry.key);
                      setNewVal(typeof entry.value === 'object' ? JSON.stringify(entry.value, null, 2) : String(entry.value));
                    }}
                    className={`p-3 flex items-center justify-between text-xs cursor-pointer transition ${
                      selectedEntry?.key === entry.key ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--panel-secondary)]'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-mono-code font-bold text-[var(--ink-strong)] truncate">
                        {entry.key}
                      </div>
                      <div className="text-[11px] text-[var(--muted)] truncate">
                        {typeof entry.value === 'object' ? JSON.stringify(entry.value) : String(entry.value)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono-code text-[10px] text-[var(--muted)] px-1.5 py-0.5 rounded bg-[var(--line)]/50">
                        {entry.sizeBytes} B
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(entry.key);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Key Editor / Creator */}
          <div className="lg:col-span-6 bg-[var(--panel-secondary)] border border-[var(--line)] rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--ink-strong)]">
                {selectedEntry ? 'Edit Key (fas.kv.set)' : 'Create New Key'}
              </span>
              {selectedEntry && (
                <button
                  onClick={() => {
                    setSelectedEntry(null);
                    setNewKey('');
                    setNewVal('');
                  }}
                  className="text-xs text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono-code text-[var(--muted)]">Key Name</label>
              <input
                type="text"
                placeholder="e.g. user_prefs, note:142, state"
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                className="w-full text-xs font-mono-code px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono-code text-[var(--muted)]">Value (JSON or String)</label>
              <textarea
                rows={5}
                placeholder='{"color": "plum", "notifications": true}'
                value={newVal}
                onChange={e => setNewVal(e.target.value)}
                className="w-full text-xs font-mono-code px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full py-2 bg-[var(--accent)] text-white font-bold text-xs rounded-lg hover:opacity-95 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>await fas.kv.set('{newKey || "key"}', value)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
