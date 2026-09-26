import React, { useState, useEffect } from 'react';
import { fasSdk } from '../../services/fasSdk';
import { LogEntry } from '../../types/fas';
import { Terminal, Trash2, UploadCloud, Play, Filter, AlertTriangle, AlertCircle, Info, Bug } from 'lucide-react';

export const LogsTab: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>(fasSdk.getLogs());
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [flushedMsg, setFlushedMsg] = useState(false);

  useEffect(() => {
    return fasSdk.onLogsChange(updated => {
      setLogs(updated);
    });
  }, []);

  const handleClear = () => {
    fasSdk.clearLogs();
  };

  const handleFlush = () => {
    setFlushedMsg(true);
    fasSdk.log('info', 'fas.log.flush() dispatched to Cloudflare D1 app_logs');
    setTimeout(() => setFlushedMsg(false), 2500);
  };

  const emitSample = (level: 'debug' | 'info' | 'warn' | 'error') => {
    if (level === 'debug') fasSdk.log('debug', 'State synced to memory buffer', { delta: 14 });
    if (level === 'info') fasSdk.log('info', 'User performed action in UI', { component: 'Workbench' });
    if (level === 'warn') fasSdk.log('warn', 'Approaching per-user KV limit (78% of 1MB quota)');
    if (level === 'error') fasSdk.log('error', 'Third-party upstream timed out after 5000ms');
  };

  const filteredLogs = levelFilter === 'all'
    ? logs
    : logs.filter(l => l.level === levelFilter);

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <span className="inline-flex items-center gap-1 text-rose-500 font-bold"><AlertCircle className="w-3 h-3" /> ERROR</span>;
      case 'warn':
        return <span className="inline-flex items-center gap-1 text-amber-500 font-bold"><AlertTriangle className="w-3 h-3" /> WARN</span>;
      case 'info':
        return <span className="inline-flex items-center gap-1 text-sky-500 font-bold"><Info className="w-3 h-3" /> INFO</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-slate-400 font-bold"><Bug className="w-3 h-3" /> DEBUG</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[var(--line)] gap-2">
          <div>
            <h3 className="text-base font-bold text-[var(--ink-strong)] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[var(--accent)]" />
              <span>fas.log (3-Layer Logging Console)</span>
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              3-tier pipeline: Memory buffer → localStorage retention → Cloudflare D1 server flush with 7-day retention.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFlush}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--panel-secondary)] border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--line)]/50 transition"
              title="Flush buffered logs to server"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{flushedMsg ? 'Flushed to Server!' : 'fas.log.flush()'}</span>
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-600 border border-rose-500/30 hover:bg-rose-500/20 transition"
              title="Clear log buffer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Emitter test buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
          <div className="flex items-center gap-1 bg-[var(--panel-secondary)] p-1 rounded-xl border border-[var(--line)]">
            {['all', 'debug', 'info', 'warn', 'error'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition ${
                  levelFilter === lvl
                    ? 'bg-[var(--panel)] text-[var(--ink-strong)] shadow-xs border border-[var(--line)]'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted)]">Emit sample:</span>
            <button
              onClick={() => emitSample('debug')}
              className="px-2 py-1 bg-[var(--panel-secondary)] hover:bg-[var(--line)] text-[11px] font-mono-code rounded border border-[var(--line)]"
            >
              debug()
            </button>
            <button
              onClick={() => emitSample('info')}
              className="px-2 py-1 bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 text-[11px] font-mono-code rounded border border-sky-500/30"
            >
              info()
            </button>
            <button
              onClick={() => emitSample('warn')}
              className="px-2 py-1 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 text-[11px] font-mono-code rounded border border-amber-500/30"
            >
              warn()
            </button>
            <button
              onClick={() => emitSample('error')}
              className="px-2 py-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-[11px] font-mono-code rounded border border-rose-500/30"
            >
              error()
            </button>
          </div>
        </div>

        {/* Terminal Stream */}
        <div className="mt-4 bg-[#090d16] text-slate-200 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
          <div className="p-3 bg-[#0d1322] border-b border-slate-800 text-xs font-mono-code text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Structured App Log Feed ({filteredLogs.length} events)</span>
            </div>
            <span>Retention: 7 days</span>
          </div>

          <div className="p-4 space-y-2 h-96 overflow-y-auto font-mono-code text-xs divide-y divide-slate-800/60">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Log stream is currently empty
              </div>
            ) : (
              filteredLogs.map(item => (
                <div key={item.id} className="pt-2 first:pt-0 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-[11px] text-slate-500 shrink-0">
                      {item.timestamp}
                    </span>
                    <span className="text-[11px] shrink-0">
                      {getLevelBadge(item.level)}
                    </span>
                    <span className="text-slate-200 font-medium break-all">
                      {item.message}
                    </span>
                    {item.data && (
                      <span className="text-[11px] text-slate-400 font-normal">
                        {JSON.stringify(item.data)}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-slate-800/80 shrink-0 uppercase">
                    {item.layer}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
