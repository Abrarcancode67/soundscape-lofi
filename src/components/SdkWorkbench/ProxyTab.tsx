import React, { useState } from 'react';
import { fasSdk } from '../../services/fasSdk';
import { ProxyRule } from '../../types/fas';
import { Globe, ArrowRight, ShieldCheck, Play, CheckCircle2 } from 'lucide-react';

export const ProxyTab: React.FC = () => {
  const [rules] = useState<ProxyRule[]>(fasSdk.getProxyRules());
  const [selectedRule, setSelectedRule] = useState<ProxyRule>(rules[0]);
  const [requestPath, setRequestPath] = useState('data/2.5/weather?q=London&units=metric');
  const [isExecuting, setIsExecuting] = useState(false);
  const [responseLog, setResponseLog] = useState<any>(null);

  const handleExecute = () => {
    setIsExecuting(true);
    fasSdk.log('info', `fas.proxy.fetch("${selectedRule.urlPrefix}${requestPath}")`);

    setTimeout(() => {
      setIsExecuting(false);
      setResponseLog({
        status: 200,
        ok: true,
        injectedSecurity: {
          secret: selectedRule.secretName,
          mode: selectedRule.injectionMode,
          injectedAt: 'Platform Edge Worker (CF D1/AES-256)',
          clientLeaked: false
        },
        payload: {
          coord: { lon: -0.1257, lat: 51.5085 },
          weather: [{ id: 800, main: 'Clear', description: 'clear sky' }],
          main: { temp: 18.4, feels_like: 18.1, humidity: 62 },
          name: 'London',
          cod: 200
        }
      });
      fasSdk.log('info', `Proxy request succeeded (200 OK) for ${selectedRule.urlPrefix}`);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[var(--line)] gap-2">
          <div>
            <h3 className="text-base font-bold text-[var(--ink-strong)] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[var(--accent)]" />
              <span>fas.proxy (Secret-Injecting Developer Proxy)</span>
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              The developer registers secrets via CLI; Cloudflare platform Workers inject keys server-side before reaching upstream APIs.
            </p>
          </div>
          <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-[var(--panel-secondary)] border border-[var(--line)] text-[var(--muted)]">
            Limits: 5 secrets · 10,000 req/day
          </span>
        </div>

        {/* Allowlist Rules */}
        <div className="mt-6 space-y-3">
          <div className="text-xs font-bold text-[var(--muted)] uppercase font-mono-code">
            Active Allowlist Rules (fas proxy list)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {rules.map(rule => (
              <div
                key={rule.id}
                onClick={() => {
                  setSelectedRule(rule);
                  setResponseLog(null);
                  if (rule.secretName === 'OPENWEATHER_KEY') {
                    setRequestPath('data/2.5/weather?q=London&units=metric');
                  } else if (rule.secretName === 'SPOTIFY_SECRET') {
                    setRequestPath('browse/new-releases?limit=5');
                  } else {
                    setRequestPath('users?page=1');
                  }
                }}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                  selectedRule.id === rule.id
                    ? 'bg-[var(--accent-soft)] border-[var(--accent)] shadow-xs'
                    : 'bg-[var(--panel-secondary)] border-[var(--line)] hover:border-[var(--accent)]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono-code font-bold text-[var(--ink-strong)] truncate">
                    {rule.secretName}
                  </span>
                  <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-[var(--panel)] border border-[var(--line)] text-[var(--accent)]">
                    {rule.injectionMode}
                  </span>
                </div>
                <div className="text-[11px] font-mono-code text-[var(--muted)] truncate">
                  {rule.urlPrefix}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Request Simulator */}
        <div className="mt-6 p-5 rounded-xl bg-[var(--panel-secondary)] border border-[var(--line)] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--ink-strong)]">
              Simulate Proxy Call in Browser Client
            </span>
            <span className="text-[11px] font-mono-code text-[var(--muted)]">
              fas.proxy.fetch(url)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono-code text-xs px-2.5 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-lg text-[var(--muted)] shrink-0 truncate max-w-xs">
              {selectedRule.urlPrefix}
            </span>
            <input
              type="text"
              value={requestPath}
              onChange={e => setRequestPath(e.target.value)}
              className="flex-1 text-xs font-mono-code px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
            />
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-bold rounded-lg hover:opacity-95 transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isExecuting ? 'Injecting...' : 'Dispatch'}</span>
            </button>
          </div>

          {/* Architecture Visualization Flow */}
          <div className="p-3 bg-[var(--panel)] rounded-xl border border-[var(--line)] text-xs grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
            <div className="p-2 space-y-1">
              <div className="font-semibold text-[var(--ink)]">1. Browser SDK Call</div>
              <div className="text-[11px] text-[var(--muted)]">Plain URL without secret token</div>
            </div>
            <div className="p-2 space-y-1 border-y md:border-y-0 md:border-x border-[var(--line)]">
              <div className="font-semibold text-emerald-500">2. CF Platform Worker</div>
              <div className="text-[11px] text-[var(--muted)]">Decrypts AES-256 key & injects into request</div>
            </div>
            <div className="p-2 space-y-1">
              <div className="font-semibold text-[var(--ink)]">3. Upstream API</div>
              <div className="text-[11px] text-[var(--muted)]">Authenticates request and returns data</div>
            </div>
          </div>

          {/* Response Payload */}
          {responseLog && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>200 OK — Decrypted & Injected Server-side</span>
                </span>
                <span className="text-[11px] font-mono-code text-[var(--muted)]">
                  Zero Client Leakage
                </span>
              </div>
              <pre className="p-3 bg-[#090d16] text-emerald-400 font-mono-code text-xs rounded-xl overflow-x-auto max-h-48 leading-relaxed">
                {JSON.stringify(responseLog, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
