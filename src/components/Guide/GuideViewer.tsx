import React, { useState } from 'react';
import { GUIDE_SECTIONS } from '../../services/guideData';
import { Copy, Check, Play, Terminal, ArrowRight, BookOpen, Layers, ShieldCheck, Cpu } from 'lucide-react';

interface GuideViewerProps {
  onNavigateTab: (tab: string, targetId?: string) => void;
  targetSectionId?: string;
}

export const GuideViewer: React.FC<GuideViewerProps> = ({ onNavigateTab, targetSectionId }) => {
  const [activeSection, setActiveSection] = useState<string>(targetSectionId || 'getting-started');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const getSectionIcon = (id: string) => {
    switch (id) {
      case 'getting-started':
        return <Play className="w-4 h-4 text-emerald-500" />;
      case 'sdk-reference':
        return <BookOpen className="w-4 h-4 text-sky-500" />;
      case 'cli-reference':
        return <Terminal className="w-4 h-4 text-amber-500" />;
      case 'publishing':
        return <Layers className="w-4 h-4 text-purple-500" />;
      case 'proxy-and-keys':
        return <ShieldCheck className="w-4 h-4 text-rose-500" />;
      default:
        return <Cpu className="w-4 h-4 text-indigo-500" />;
    }
  };

  const currentSection = GUIDE_SECTIONS.find(s => s.id === activeSection) || GUIDE_SECTIONS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      {/* Editorial Header */}
      <div className="mb-8 pb-6 border-b border-[var(--line)]">
        <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-mono-code mb-2">
          <span>freeappstore.online</span>
          <span aria-hidden="true">·</span>
          <span>Platform Documentation & Developer Manual</span>
          <span aria-hidden="true">·</span>
          <span>SDK v0.14</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-[var(--ink-strong)] tracking-tight font-serif-display">
          FreeAppStore Platform Guide
        </h1>
        <p className="text-sm lg:text-base text-[var(--muted)] mt-2 max-w-3xl leading-relaxed">
          The complete guide to scaffolding, developing, testing, and deploying zero-cost web applications, 
          realtime multiplayer rooms, canvas games, and connected PWA software on Cloudflare D1 and R2.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Navigation Sidebar */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] px-3 mb-2 font-mono-code">
            Documentation Chapters
          </div>
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-2 space-y-1 shadow-xs">
            {GUIDE_SECTIONS.map((sec, idx) => {
              const isSelected = sec.id === activeSection;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between text-xs font-semibold ${
                    isSelected
                      ? 'bg-[var(--panel-secondary)] text-[var(--ink-strong)] shadow-xs border border-[var(--line)]'
                      : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel-secondary)]/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="font-mono-code text-[11px] text-[var(--muted)] opacity-80">
                      0{idx + 1}.
                    </span>
                    <span className="truncate">{sec.title.split('(')[0].trim()}</span>
                  </div>
                  <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-[var(--line)]/50 text-[var(--muted)] shrink-0">
                    {sec.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Action shortcuts box */}
          <div className="p-4 bg-[var(--panel)] border border-[var(--line)] rounded-2xl space-y-3 mt-4">
            <div className="text-xs font-bold text-[var(--ink)]">Interactive Workbenches</div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Test APIs live without leaving this guide:
            </p>
            <div className="space-y-1.5">
              <button
                onClick={() => onNavigateTab('sdk')}
                className="w-full text-left text-xs p-2 rounded-lg bg-[var(--panel-secondary)] hover:bg-[var(--line)]/60 text-[var(--ink)] font-semibold transition flex items-center justify-between group"
              >
                <span>Launch SDK Simulator</span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)] group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => onNavigateTab('scaffolder')}
                className="w-full text-left text-xs p-2 rounded-lg bg-[var(--panel-secondary)] hover:bg-[var(--line)]/60 text-[var(--ink)] font-semibold transition flex items-center justify-between group"
              >
                <span>Explore 5 Starter Templates</span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)] group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => onNavigateTab('compliance')}
                className="w-full text-left text-xs p-2 rounded-lg bg-[var(--panel-secondary)] hover:bg-[var(--line)]/60 text-[var(--ink)] font-semibold transition flex items-center justify-between group"
              >
                <span>Run Compliance Audit (fas check)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="lg:col-span-8 space-y-8">
          {/* Active Section Banner */}
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 lg:p-8 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              {getSectionIcon(currentSection.id)}
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[var(--accent)]">
                {currentSection.badge}
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-[var(--ink-strong)] tracking-tight font-serif-display">
              {currentSection.title}
            </h2>
            <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">
              {currentSection.description}
            </p>
          </div>

          {/* Subsections List */}
          <div className="space-y-6">
            {currentSection.subsections.map((sub, idx) => {
              const snippetId = `${currentSection.id}-${idx}`;
              return (
                <div
                  key={idx}
                  className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[var(--line)]/60 pb-3">
                    <h3 className="text-lg font-bold text-[var(--ink-strong)] font-sans">
                      {sub.title}
                    </h3>
                    <span className="text-xs font-mono-code text-[var(--muted)]">
                      § {idx + 1}
                    </span>
                  </div>

                  <div className="text-sm text-[var(--ink)] leading-relaxed whitespace-pre-line">
                    {sub.content}
                  </div>

                  {sub.tip && (
                    <div className="p-3 bg-[var(--accent-soft)] border border-[var(--accent)]/30 rounded-xl text-xs text-[var(--ink)] flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 shrink-0" />
                      <div className="font-medium">{sub.tip}</div>
                    </div>
                  )}

                  {sub.codeSnippet && (
                    <div className="rounded-xl overflow-hidden border border-[var(--line)] bg-[#090d16] text-slate-100">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#0d1322] text-xs font-mono-code text-slate-400">
                        <span>{sub.codeSnippet.language}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(sub.codeSnippet!.code, snippetId)}
                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-[11px]"
                          >
                            {copiedSnippet === snippetId ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>

                          {/* Quick try-it button */}
                          {currentSection.id === 'sdk-reference' && (
                            <button
                              onClick={() => onNavigateTab('sdk')}
                              className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 transition text-[11px] border border-emerald-500/40"
                              title="Try in live SDK Simulator"
                            >
                              <Play className="w-3 h-3" />
                              <span>Simulate</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <pre className="p-4 text-xs font-mono-code overflow-x-auto leading-relaxed text-slate-200">
                        <code>{sub.codeSnippet.code}</code>
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Pagination */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--line)]">
            {(() => {
              const currentIdx = GUIDE_SECTIONS.findIndex(s => s.id === activeSection);
              const prev = GUIDE_SECTIONS[currentIdx - 1];
              const next = GUIDE_SECTIONS[currentIdx + 1];

              return (
                <>
                  {prev ? (
                    <button
                      onClick={() => setActiveSection(prev.id)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--panel-secondary)] text-[var(--ink)] transition flex items-center gap-2"
                    >
                      <span>← {prev.title.split('(')[0]}</span>
                    </button>
                  ) : <div />}
                  {next && (
                    <button
                      onClick={() => setActiveSection(next.id)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--panel-secondary)] text-[var(--ink)] transition flex items-center gap-2"
                    >
                      <span>{next.title.split('(')[0]} →</span>
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </main>
      </div>
    </div>
  );
};
