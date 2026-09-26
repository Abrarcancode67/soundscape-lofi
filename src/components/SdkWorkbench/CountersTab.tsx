import React, { useState, useEffect } from 'react';
import { fasSdk } from '../../services/fasSdk';
import { CounterEntry } from '../../types/fas';
import { Hash, Plus, Minus, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';

export const CountersTab: React.FC = () => {
  const [counters, setCounters] = useState<CounterEntry[]>([]);
  const [newCounterName, setNewCounterName] = useState('');
  const [initialValue, setInitialValue] = useState<number>(0);
  const [customDelta, setCustomDelta] = useState<number>(1);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const refresh = () => {
    setCounters(fasSdk.getCounters());
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleIncrement = (name: string, delta: number) => {
    try {
      fasSdk.incrementCounter(name, delta);
      refresh();
      setStatusMsg(`Incremented "${name}" by ${delta > 0 ? '+' + delta : delta}`);
      setTimeout(() => setStatusMsg(null), 2500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateCounter = () => {
    if (!newCounterName.trim()) return;
    fasSdk.setCounter(newCounterName.trim(), initialValue);
    setNewCounterName('');
    setInitialValue(0);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[var(--line)] gap-2">
          <div>
            <h3 className="text-base font-bold text-[var(--ink-strong)] flex items-center gap-2">
              <Hash className="w-4 h-4 text-[var(--accent)]" />
              <span>fas.counters (Shared App-Wide Atomic Counters)</span>
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Atomic increment counters backed by Cloudflare D1. Anyone can read; authenticated users can increment/decrement.
            </p>
          </div>
          <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-[var(--panel-secondary)] border border-[var(--line)] text-[var(--muted)]">
            Limits: 1,000 counters · Delta ±1000
          </span>
        </div>

        {statusMsg && (
          <div className="mt-4 p-2.5 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-xs font-semibold text-[var(--ink)] flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Counter Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {counters.map(c => (
            <div
              key={c.name}
              className="p-5 rounded-xl bg-[var(--panel-secondary)] border border-[var(--line)] space-y-4 hover:border-[var(--accent)]/40 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono-code font-bold text-sm text-[var(--ink-strong)] truncate">
                  {c.name}
                </span>
                <span className="text-[10px] text-[var(--muted)] font-mono-code">
                  {new Date(c.lastUpdated).toLocaleTimeString()}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-extrabold font-mono-code tabular-nums text-[var(--accent)]">
                  {c.value.toLocaleString()}
                </div>
                <TrendingUp className="w-4 h-4 text-[var(--muted)] opacity-60" />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-[var(--line)]">
                <button
                  onClick={() => handleIncrement(c.name, 1)}
                  className="py-1.5 text-xs font-mono-code font-bold bg-[var(--panel)] hover:bg-[var(--accent)] hover:text-white border border-[var(--line)] rounded-lg text-[var(--ink)] transition"
                  title="fas.counters.increment(name, 1)"
                >
                  +1
                </button>
                <button
                  onClick={() => handleIncrement(c.name, 10)}
                  className="py-1.5 text-xs font-mono-code font-bold bg-[var(--panel)] hover:bg-[var(--accent)] hover:text-white border border-[var(--line)] rounded-lg text-[var(--ink)] transition"
                  title="fas.counters.increment(name, 10)"
                >
                  +10
                </button>
                <button
                  onClick={() => handleIncrement(c.name, -1)}
                  className="py-1.5 text-xs font-mono-code font-bold bg-[var(--panel)] hover:bg-rose-500 hover:text-white border border-[var(--line)] rounded-lg text-[var(--ink)] transition"
                  title="fas.counters.increment(name, -1)"
                >
                  -1
                </button>
                <button
                  onClick={() => handleIncrement(c.name, -10)}
                  className="py-1.5 text-xs font-mono-code font-bold bg-[var(--panel)] hover:bg-rose-500 hover:text-white border border-[var(--line)] rounded-lg text-[var(--ink)] transition"
                  title="fas.counters.increment(name, -10)"
                >
                  -10
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Counter Section */}
        <div className="mt-8 pt-6 border-t border-[var(--line)] p-4 bg-[var(--panel-secondary)] rounded-xl space-y-3">
          <div className="text-xs font-bold text-[var(--ink-strong)]">
            Create or Initialize a Counter
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Counter name (e.g. global_downloads, stars, active_users)"
              value={newCounterName}
              onChange={e => setNewCounterName(e.target.value)}
              className="flex-1 text-xs font-mono-code px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
            />
            <input
              type="number"
              placeholder="Initial Value"
              value={initialValue}
              onChange={e => setInitialValue(Number(e.target.value))}
              className="w-32 text-xs font-mono-code px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
            />
            <button
              onClick={handleCreateCounter}
              className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-bold rounded-lg hover:opacity-95 transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Initialize Counter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
