import React, { useState } from 'react';
import { OFFICIAL_TEMPLATES } from '../../services/templatesData';
import { TemplateDefinition, TemplateId, TemplateFile } from '../../types/fas';
import { 
  StandaloneDemo, 
  ConnectedDemo, 
  CanvasGameDemo, 
  GridGameDemo, 
  ThreeDGameDemo 
} from './TemplatePreviews';
import { 
  Layers, 
  Copy, 
  Check, 
  Terminal, 
  Smartphone, 
  Cloud, 
  Gamepad2, 
  Grid3X3, 
  Box, 
  FileCode, 
  Play, 
  Folder 
} from 'lucide-react';

export const TemplateExplorer: React.FC = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>('standalone');
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [selectedFilePath, setSelectedFilePath] = useState<string>('web/src/App.tsx');
  const [copiedCli, setCopiedCli] = useState(false);
  const [copiedFile, setCopiedFile] = useState(false);

  const template = OFFICIAL_TEMPLATES.find(t => t.id === selectedTemplateId) || OFFICIAL_TEMPLATES[0];

  const getTemplateIcon = (id: TemplateId) => {
    switch (id) {
      case 'standalone':
        return <Smartphone className="w-4 h-4 text-emerald-500" />;
      case 'connected':
        return <Cloud className="w-4 h-4 text-indigo-500" />;
      case 'game-canvas':
        return <Gamepad2 className="w-4 h-4 text-rose-500" />;
      case 'game-grid':
        return <Grid3X3 className="w-4 h-4 text-amber-500" />;
      case 'game-3d':
        return <Box className="w-4 h-4 text-sky-500" />;
    }
  };

  const currentFile = template.files.find(f => f.path === selectedFilePath) || template.files[0];

  const cliCommand = selectedTemplateId === 'standalone'
    ? 'fas init my-cool-app'
    : `fas init my-cool-app --template ${selectedTemplateId}`;

  const copyCli = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const copyFileContent = () => {
    if (currentFile) {
      navigator.clipboard.writeText(currentFile.content);
      setCopiedFile(true);
      setTimeout(() => setCopiedFile(false), 2000);
    }
  };

  const renderLiveDemo = () => {
    switch (selectedTemplateId) {
      case 'standalone':
        return <StandaloneDemo />;
      case 'connected':
        return <ConnectedDemo />;
      case 'game-canvas':
        return <CanvasGameDemo />;
      case 'game-grid':
        return <GridGameDemo />;
      case 'game-3d':
        return <ThreeDGameDemo />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-[var(--line)]">
        <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-mono-code mb-1">
          <span>fas init &lt;id&gt; --template &lt;name&gt;</span>
          <span aria-hidden="true">·</span>
          <span>Official Starter Blueprints</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--ink-strong)] tracking-tight font-serif-display">
          Template Scaffolder & Visual Inspector
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1 max-w-3xl">
          Inspect, test in-browser, and scaffold the 5 official FreeAppStore architecture templates.
          Each template is fully compliant, PWA-configured, and deploys to Cloudflare R2 via GitHub Actions.
        </p>
      </div>

      {/* Template Card Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {OFFICIAL_TEMPLATES.map(t => {
          const isSelected = t.id === selectedTemplateId;
          return (
            <button
              key={t.id}
              onClick={() => {
                setSelectedTemplateId(t.id);
                setSelectedFilePath(t.files[0]?.path || 'web/src/App.tsx');
              }}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-[var(--accent-soft)] border-[var(--accent)] shadow-xs'
                  : 'bg-[var(--panel)] border-[var(--line)] hover:border-[var(--accent)]/40 hover:bg-[var(--panel-secondary)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-[var(--panel)] border border-[var(--line)] shadow-xs">
                    {getTemplateIcon(t.id)}
                  </div>
                  <span className={`text-[10px] font-mono-code px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-[var(--accent)] text-white' : 'bg-[var(--panel-secondary)] text-[var(--muted)]'
                  }`}>
                    {t.id}
                  </span>
                </div>
                <div className="font-bold text-sm text-[var(--ink-strong)] mb-1">
                  {t.name}
                </div>
                <p className="text-[11px] text-[var(--muted)] line-clamp-2 leading-relaxed">
                  {t.tagline}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Scaffolding Terminal Bar */}
      <div className="p-4 bg-[var(--panel)] border border-[var(--line)] rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono-code text-[var(--ink)]">
          <Terminal className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-[var(--muted)]">$</span>
          <span className="font-bold">{cliCommand}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyCli}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--panel-secondary)] hover:bg-[var(--line)]/50 border border-[var(--line)] rounded-lg text-xs font-semibold text-[var(--ink)] transition"
          >
            {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCli ? 'Copied to Clipboard!' : 'Copy Command'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Tabs for Preview vs Code */}
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
        {/* Toggle Bar */}
        <div className="p-3 border-b border-[var(--line)] bg-[var(--panel-secondary)] flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'preview'
                  ? 'bg-[var(--panel)] text-[var(--ink-strong)] shadow-xs border border-[var(--line)]'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-500" />
              <span>Interactive Live Preview</span>
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'code'
                  ? 'bg-[var(--panel)] text-[var(--ink-strong)] shadow-xs border border-[var(--line)]'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-500" />
              <span>Inspect Source Files ({template.files.length})</span>
            </button>
          </div>

          <span className="text-xs font-mono-code text-[var(--muted)] hidden sm:inline">
            Template: {template.name} ({template.badgeText})
          </span>
        </div>

        {/* View Mode Content */}
        <div className="p-6">
          {viewMode === 'preview' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span>Playable in-browser simulation of template runtime:</span>
                <span className="font-mono-code">Responsive Viewport</span>
              </div>
              <div className="max-w-2xl mx-auto shadow-xl rounded-2xl overflow-hidden border border-[var(--line)]">
                {renderLiveDemo()}
              </div>
              <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {template.features.map((feat, i) => (
                  <div key={i} className="text-xs text-[var(--muted)] flex items-start gap-2">
                    <span className="text-[var(--accent)] font-bold">✓</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* File tree */}
              <div className="lg:col-span-3 space-y-1">
                <div className="text-xs font-mono-code font-bold uppercase tracking-wider text-[var(--muted)] mb-2 px-2">
                  Project Files
                </div>
                <div className="border border-[var(--line)] rounded-xl overflow-hidden divide-y divide-[var(--line)] bg-[var(--panel-secondary)]">
                  {template.files.map(f => (
                    <button
                      key={f.path}
                      onClick={() => setSelectedFilePath(f.path)}
                      className={`w-full text-left p-2.5 text-xs font-mono-code flex items-center gap-2 transition ${
                        currentFile.path === f.path
                          ? 'bg-[var(--panel)] text-[var(--accent)] font-bold'
                          : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)]/50'
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
                      <span className="truncate">{f.path}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Code viewer */}
              <div className="lg:col-span-9 bg-[#090d16] text-slate-100 rounded-xl overflow-hidden border border-slate-800">
                <div className="px-4 py-2.5 bg-[#0d1322] border-b border-slate-800 text-xs font-mono-code text-slate-400 flex items-center justify-between">
                  <span>{currentFile.path}</span>
                  <button
                    onClick={copyFileContent}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-[11px]"
                  >
                    {copiedFile ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedFile ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono-code overflow-x-auto leading-relaxed max-h-[460px]">
                  <code>{currentFile.content}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
