import React, { useState } from 'react';
import { runComplianceAudit, CodeProjectInput } from '../../services/compliance';
import { ComplianceAuditReport } from '../../types/fas';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Wrench, 
  Play, 
  RefreshCw, 
  FileCode, 
  Sparkles 
} from 'lucide-react';

const PRESET_CLEAN: CodeProjectInput = {
  appName: 'social-board',
  indexHtml: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Social Board</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Manrope:wght@400;600;700&display=swap" rel="stylesheet" />
    <link rel="manifest" href="/manifest.json" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
  globalCss: `@import "tailwindcss";
:root {
  --accent: #10b981;
}`,
  manifestJson: `{
  "name": "Social Board",
  "short_name": "SocialBoard",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981"
}`,
  appCode: `import { initApp } from '@freeappstore/sdk';
const fas = initApp({ appId: 'social-board' });
console.log('App ready');`,
  bundleSizeKb: 84.5
};

const PRESET_DIRTY: CodeProjectInput = {
  appName: 'my-broken-app',
  indexHtml: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>APPNAME</title>
    <!-- Banned Third-Party Analytics Trackers -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC12345"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-ABC12345');
    </script>
    <!-- Missing Fraunces Font -->
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
  globalCss: `@import "tailwindcss";
/* Destructive platform token overrides */
:root {
  --ink: red;
  --ink-strong: yellow;
}`,
  manifestJson: `{
  "name": "APPNAME",
  "missing_display_field": true
}`,
  appCode: `const APPNAME = 'APPNAME';
console.log(APPNAME);`,
  bundleSizeKb: 345.0
};

export const ComplianceChecker: React.FC = () => {
  const [project, setProject] = useState<CodeProjectInput>(PRESET_DIRTY);
  const [activePreset, setActivePreset] = useState<'dirty' | 'clean' | 'custom'>('dirty');
  const [auditReport, setAuditReport] = useState<ComplianceAuditReport>(() => runComplianceAudit(PRESET_DIRTY));
  const [activeTab, setActiveTab] = useState<'indexHtml' | 'manifestJson' | 'globalCss' | 'appCode'>('indexHtml');

  const handleRunAudit = (p: CodeProjectInput = project) => {
    const report = runComplianceAudit(p);
    setAuditReport(report);
  };

  const handleSelectPreset = (preset: 'dirty' | 'clean') => {
    setActivePreset(preset);
    const chosen = preset === 'clean' ? PRESET_CLEAN : PRESET_DIRTY;
    setProject(chosen);
    handleRunAudit(chosen);
  };

  const handleAutoFix = () => {
    // 1-Click remediation: sanitize placeholders, remove trackers, inject fonts, fix manifest, fix tokens
    const fixed: CodeProjectInput = {
      ...project,
      appName: 'my-cool-app',
      indexHtml: project.indexHtml
        .replace(/APPNAME/g, 'my-cool-app')
        .replace(/<script async src="https:\/\/www\.googletagmanager\.com[\s\S]*?<\/script>/gi, '<!-- Trackers stripped per FAS Compliance -->')
        .replace(/<script>\s*window\.dataLayer[\s\S]*?<\/script>/gi, '')
        .replace(/family=Manrope:wght@400;600/g, 'family=Fraunces:wght@600;700&family=Manrope:wght@400;600;700'),
      globalCss: `@import "tailwindcss";
:root {
  --accent: #10b981;
}`,
      manifestJson: `{
  "name": "My Cool App",
  "short_name": "MyCoolApp",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981"
}`,
      appCode: project.appCode.replace(/APPNAME/g, 'my-cool-app'),
      bundleSizeKb: 142.0
    };

    setProject(fixed);
    setActivePreset('clean');
    handleRunAudit(fixed);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[var(--line)] gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-mono-code mb-1">
            <span>fas check</span>
            <span aria-hidden="true">·</span>
            <span>Platform Compliance & Verification Gate</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--ink-strong)] tracking-tight font-serif-display">
            Compliance Auditor
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1 max-w-2xl">
            Audit your app against the 6 platform compliance rules before publishing to FreeAppStore.
            Enforces zero-tracking, brand typography, valid PWA manifest, and strict bundle size limits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSelectPreset('dirty')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activePreset === 'dirty'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-[var(--panel)] text-[var(--muted)] border border-[var(--line)] hover:text-[var(--ink)]'
            }`}
          >
            Violating App
          </button>
          <button
            onClick={() => handleSelectPreset('clean')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activePreset === 'clean'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[var(--panel)] text-[var(--muted)] border border-[var(--line)] hover:text-[var(--ink)]'
            }`}
          >
            Clean App (100%)
          </button>
        </div>
      </div>

      {/* Audit Scorecard Banner */}
      <div className={`p-6 rounded-2xl border transition-all ${
        auditReport.passed
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-rose-500/10 border-rose-500/30'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${
              auditReport.passed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}>
              {auditReport.passed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[var(--muted)]">
                  Audit Result
                </span>
                <span className={`text-xs font-mono-code font-bold px-2 py-0.5 rounded ${
                  auditReport.passed ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                }`}>
                  {auditReport.checksPassed} of {auditReport.checksTotal} Checks Passed
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[var(--ink-strong)] mt-1 font-serif-display">
                {auditReport.passed ? '100% Platform Compliant' : `${auditReport.violations.length} Compliance Violations Found`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!auditReport.passed && (
              <button
                onClick={handleAutoFix}
                className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                <Wrench className="w-4 h-4" />
                <span>1-Click Auto-Fix All</span>
              </button>
            )}
            <button
              onClick={() => handleRunAudit()}
              className="flex items-center gap-1.5 px-3 py-2 bg-[var(--panel)] border border-[var(--line)] text-[var(--ink)] text-xs font-semibold rounded-xl hover:bg-[var(--panel-secondary)] transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-run Audit</span>
            </button>
          </div>
        </div>

        {/* 6 Checks Checklist Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-6 pt-4 border-t border-[var(--line)]/50">
          {[
            { name: 'No Placeholders', pass: auditReport.details.noPlaceholders },
            { name: 'No Tracking SDKs', pass: auditReport.details.noTrackingSdk },
            { name: 'Brand Fonts', pass: auditReport.details.brandFontsPresent },
            { name: 'No Token Overrides', pass: auditReport.details.noBrandOverrides },
            { name: 'PWA Manifest', pass: auditReport.details.pwaManifestValid },
            { name: 'Bundle < 300KB', pass: auditReport.details.bundleUnder300kb },
          ].map(c => (
            <div
              key={c.name}
              className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                c.pass
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300'
              }`}
            >
              {c.pass ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />}
              <span className="font-semibold truncate">{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Violations & Remediation Report */}
      {auditReport.violations.length > 0 && (
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="text-xs font-bold text-[var(--ink-strong)] uppercase font-mono-code">
            Detected Violations ({auditReport.violations.length})
          </div>
          <div className="space-y-3">
            {auditReport.violations.map(v => (
              <div
                key={v.id}
                className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{v.ruleName}</span>
                  </span>
                  <span className="text-[11px] font-mono-code text-[var(--muted)]">
                    File: {v.file}
                  </span>
                </div>
                <p className="text-[var(--ink)] leading-relaxed">
                  {v.description}
                </p>
                <div className="p-2.5 bg-[var(--panel)] rounded-lg border border-[var(--line)] text-[11px] text-[var(--muted)] flex items-start gap-2">
                  <span className="font-bold text-[var(--accent)] shrink-0">Remediation:</span>
                  <span>{v.remediation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Editor & Tester */}
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-3 bg-[var(--panel-secondary)] border-b border-[var(--line)] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {[
              { id: 'indexHtml', label: 'index.html' },
              { id: 'manifestJson', label: 'manifest.json' },
              { id: 'globalCss', label: 'index.css' },
              { id: 'appCode', label: 'App.tsx' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-code transition ${
                  activeTab === tab.id
                    ? 'bg-[var(--panel)] text-[var(--accent)] font-bold shadow-xs border border-[var(--line)]'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted)] font-mono-code">
              Simulated Gzip Size:
            </span>
            <input
              type="number"
              value={project.bundleSizeKb}
              onChange={e => {
                const next = { ...project, bundleSizeKb: Number(e.target.value) };
                setProject(next);
                handleRunAudit(next);
              }}
              className="w-20 text-xs font-mono-code px-2 py-1 bg-[var(--panel)] border border-[var(--line)] rounded text-[var(--ink)] font-bold"
            />
            <span className="text-xs font-mono-code text-[var(--muted)]">KB (max 300)</span>
          </div>
        </div>

        <div className="p-4 bg-[#090d16]">
          <textarea
            rows={12}
            value={project[activeTab]}
            onChange={e => {
              const next = { ...project, [activeTab]: e.target.value };
              setProject(next);
              setActivePreset('custom');
              handleRunAudit(next);
            }}
            className="w-full bg-transparent text-slate-100 font-mono-code text-xs outline-none leading-relaxed resize-y border-none"
          />
        </div>
      </div>
    </div>
  );
};
