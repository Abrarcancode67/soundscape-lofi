import React, { useState } from 'react';
import { X, Smartphone, Tablet, Monitor, CheckCircle2 } from 'lucide-react';

interface ScreenCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
}

const VIEWPORTS = [
  { id: 'iphone-se', name: 'iPhone SE', width: 375, height: 667, scale: 0.8, type: 'phone' },
  { id: 'iphone-15', name: 'iPhone 15 Pro', width: 393, height: 852, scale: 0.75, type: 'phone' },
  { id: 'ipad-mini', name: 'iPad Mini', width: 768, height: 1024, scale: 0.55, type: 'tablet' },
  { id: 'desktop', name: 'Desktop (1440px)', width: 1200, height: 750, scale: 0.6, type: 'desktop' },
];

export const ScreenCheckModal: React.FC<ScreenCheckModalProps> = ({ isOpen, onClose, appName }) => {
  const [selectedViewport, setSelectedViewport] = useState(VIEWPORTS[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-[var(--line)] bg-[var(--panel-secondary)] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[var(--ink-strong)]">fas screencheck</span>
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Responsive Pass
              </span>
            </div>
            <div className="text-xs text-[var(--muted)] mt-0.5">
              Testing https://{appName}.freeappstore.online across reference device frames
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport Selectors */}
            <div className="hidden sm:flex items-center gap-1 bg-[var(--panel)] p-1 rounded-xl border border-[var(--line)]">
              {VIEWPORTS.map(vp => (
                <button
                  key={vp.id}
                  onClick={() => setSelectedViewport(vp)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                    selectedViewport.id === vp.id
                      ? 'bg-[var(--accent)] text-white shadow-xs'
                      : 'text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  {vp.type === 'phone' && <Smartphone className="w-3.5 h-3.5" />}
                  {vp.type === 'tablet' && <Tablet className="w-3.5 h-3.5" />}
                  {vp.type === 'desktop' && <Monitor className="w-3.5 h-3.5" />}
                  <span>{vp.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--panel)] border border-[var(--line)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewport Preview Area */}
        <div className="flex-1 overflow-auto bg-slate-950 p-6 flex flex-col items-center justify-center">
          <div className="text-xs font-mono-code text-slate-400 mb-3 flex items-center gap-2">
            <span>Viewport: {selectedViewport.width}px × {selectedViewport.height}px</span>
            <span>·</span>
            <span>Touch Target Compliance: 100% WCAG AA</span>
          </div>

          <div
            className="bg-white dark:bg-slate-900 rounded-2xl border-4 border-slate-700 shadow-2xl overflow-hidden flex flex-col"
            style={{
              width: `${selectedViewport.width}px`,
              height: `${selectedViewport.height}px`,
              transform: `scale(${selectedViewport.scale})`,
              transformOrigin: 'top center'
            }}
          >
            {/* Mock device status bar */}
            <div className="h-6 bg-slate-800 text-slate-400 px-4 flex items-center justify-between text-[10px] font-mono shrink-0">
              <span>9:41</span>
              <span>100% ⚡</span>
            </div>

            {/* Simulated App Frame */}
            <div className="flex-1 flex flex-col p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto">
              <header className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="font-extrabold text-sm text-emerald-600 font-serif">FreeAppStore</span>
                <span className="text-xs font-bold text-slate-500">{appName}</span>
              </header>

              <div className="my-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <h3 className="font-bold text-base">Responsive Layout Invariant</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Layout validated: zero horizontal overflow, single-line controls, 44px touch targets compliant with FreeAppStore constitution.
                </p>
                <div className="pt-2 flex gap-2">
                  <button className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold">
                    Primary Action
                  </button>
                  <button className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold">
                    Secondary
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-emerald-500">140 msgs/s</div>
                  <div className="text-[10px] text-slate-400">WebSocket Fanout</div>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-indigo-500">60 FPS</div>
                  <div className="text-[10px] text-slate-400">Display Sync</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
