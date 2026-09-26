import React, { useState } from 'react';
import { CuratedPreset, CustomMix } from '../../types/soundscape';
import { MarqueeText } from '../Common/MarqueeText';
import { ProtocolDetailModal } from './ProtocolDetailModal';
import { 
  Sparkles, 
  BookmarkPlus, 
  Trash2, 
  Brain, 
  Compass, 
  Share2, 
  Info, 
  Play 
} from 'lucide-react';

export const CURATED_ENVIRONMENTS: CuratedPreset[] = [
  {
    id: 'deep_focus',
    name: 'Deep Focus',
    tagline: 'Brown noise with 10Hz Alpha binaural entrainment and soft wind',
    icon: '⚡',
    category: 'environment',
    channels: {
      brown_noise: { volume: 0.65, pan: 0 },
      binaural: { volume: 0.45, pan: 0 },
      wind: { volume: 0.25, pan: 0.2 }
    },
    binauralSettings: { carrier: 216, beat: 10, mode: 'binaural' }
  },
  {
    id: 'rainy_midnight',
    name: 'Rainy Midnight',
    tagline: 'Heavy downpour with distant rolling thunder echoes and soft pink noise',
    icon: '🌧️',
    category: 'environment',
    channels: {
      heavy_downpour: { volume: 0.70, pan: 0 },
      thunder: { volume: 0.45, pan: -0.25 },
      pink_noise: { volume: 0.25, pan: 0.1 }
    }
  },
  {
    id: 'cozy_campfire',
    name: 'Cozy Campfire',
    tagline: 'Warm woody crackles with low rumble and wandering forest breeze',
    icon: '🔥',
    category: 'environment',
    channels: {
      campfire: { volume: 0.75, pan: 0 },
      brown_noise: { volume: 0.35, pan: 0 },
      wind: { volume: 0.30, pan: -0.2 }
    }
  },
  {
    id: 'coastal_calm',
    name: 'Coastal Calm',
    tagline: 'Dual-phase ocean wave swell, light wind, and 6Hz Theta drift',
    icon: '🌊',
    category: 'environment',
    channels: {
      ocean: { volume: 0.75, pan: 0 },
      wind: { volume: 0.35, pan: 0.3 },
      binaural: { volume: 0.30, pan: 0 }
    },
    binauralSettings: { carrier: 136.1, beat: 6, mode: 'binaural' }
  },
  {
    id: 'coffee_vinyl',
    name: 'Cozy Coffeehouse',
    tagline: 'Warm human murmur with 33-RPM vinyl static and gentle rain on glass',
    icon: '☕',
    category: 'environment',
    channels: {
      coffee_shop: { volume: 0.65, pan: 0 },
      vinyl: { volume: 0.40, pan: 0.2 },
      rain_leaves: { volume: 0.35, pan: -0.2 }
    }
  }
];

export const NEURO_PROTOCOLS: CuratedPreset[] = [
  {
    id: 'clear_brain_fog',
    name: 'Clear Brain Fog & Peak Focus',
    tagline: '40Hz Gamma entrainment + Blue Noise + 14Hz Beta Beats + Mountain Stream',
    icon: '🧠',
    category: 'neuro',
    channels: {
      gamma_pulse: { volume: 0.55, pan: 0 },
      blue_noise: { volume: 0.35, pan: 0 },
      binaural: { volume: 0.50, pan: 0 },
      stream: { volume: 0.30, pan: 0.25 }
    },
    binauralSettings: { carrier: 216, beat: 14, mode: 'binaural' }
  },
  {
    id: 'cortisol_reduction',
    name: 'Cortisol Reduction & Deep Calm',
    tagline: '528Hz Solfeggio tone + 174Hz base + Pink Noise + Ocean Surf + Tibetan Bowl',
    icon: '🕊️',
    category: 'neuro',
    channels: {
      solfeggio_528: { volume: 0.65, pan: 0 },
      pink_noise: { volume: 0.30, pan: 0 },
      ocean: { volume: 0.45, pan: 0.2 },
      tibetan_bowl: { volume: 0.35, pan: -0.2 }
    }
  },
  {
    id: 'adhd_hyperfocus',
    name: 'ADHD Hyperfocus Lock',
    tagline: 'Brown Noise at 70% + 40Hz Gamma subtle pulse + Heavy Downpour + Vinyl Crackle',
    icon: '🎯',
    category: 'neuro',
    channels: {
      brown_noise: { volume: 0.70, pan: 0 },
      gamma_pulse: { volume: 0.35, pan: 0 },
      heavy_downpour: { volume: 0.40, pan: -0.2 },
      vinyl: { volume: 0.25, pan: 0.3 }
    }
  },
  {
    id: 'cognitive_renewal',
    name: 'Cognitive De-Stress & Renewal',
    tagline: '7.83Hz Schumann Resonance pulse + Green Noise + Wandering Wind + Rain on Leaves',
    icon: '🌿',
    category: 'neuro',
    channels: {
      binaural: { volume: 0.55, pan: 0 },
      green_noise: { volume: 0.40, pan: 0 },
      wind: { volume: 0.30, pan: 0.2 },
      rain_leaves: { volume: 0.35, pan: -0.25 }
    },
    binauralSettings: { carrier: 136.1, beat: 7.83, mode: 'binaural' }
  },
  {
    id: 'rapid_sleep',
    name: 'Rapid Sleep Inducer',
    tagline: '2.5Hz Delta beat + Sub-Bass Drone + Distant Rolling Thunder + Campfire',
    icon: '💤',
    category: 'neuro',
    channels: {
      binaural: { volume: 0.60, pan: 0 },
      sub_bass: { volume: 0.45, pan: 0 },
      thunder: { volume: 0.30, pan: -0.3 },
      campfire: { volume: 0.25, pan: 0.2 }
    },
    binauralSettings: { carrier: 108, beat: 2.5, mode: 'binaural' }
  },
  {
    id: 'deep_delta_somnolence',
    name: 'Deep Delta Somnolence (Stage 3 NREM Sleep)',
    tagline: '1.5Hz–2.0Hz (1.8Hz Delta) Entrainment + 1.2kHz Pink Noise (65%) + Ocean Waves (35%) + Sub-Bass 43.65Hz (20%) + Auto 45m Sleep Fade',
    icon: '🌙',
    category: 'neuro',
    channels: {
      pink_noise: { volume: 0.65, pan: 0 },
      binaural: { volume: 0.40, pan: 0 },
      delta_sleep: { volume: 0.40, pan: 0 },
      ocean: { volume: 0.35, pan: 0 },
      sub_bass: { volume: 0.20, pan: 0 }
    },
    binauralSettings: { carrier: 108, beat: 1.8, mode: 'binaural' },
    sleepTimerMinutes: 45,
    sleepFadeSeconds: 60
  }
];

interface PresetSelectorProps {
  activePresetId: string | null;
  onSelectPreset: (preset: CuratedPreset) => void;
  onSaveCurrentMix: (name: string) => void;
  customMixes: CustomMix[];
  onLoadCustomMix: (mix: CustomMix) => void;
  onDeleteCustomMix: (id: string) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  activePresetId,
  onSelectPreset,
  onSaveCurrentMix,
  customMixes,
  onLoadCustomMix,
  onDeleteCustomMix
}) => {
  const [activeTab, setActiveTab] = useState<'neuro' | 'environments'>('neuro');
  const [isSaving, setIsSaving] = useState(false);
  const [newMixName, setNewMixName] = useState('');
  const [shareFeedback, setShareFeedback] = useState(false);
  const [inspectPreset, setInspectPreset] = useState<CuratedPreset | null>(null);

  const handleSave = () => {
    if (!newMixName.trim()) return;
    onSaveCurrentMix(newMixName.trim());
    setNewMixName('');
    setIsSaving(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 2000);
  };

  const activePresetsList = activeTab === 'neuro' ? NEURO_PROTOCOLS : CURATED_ENVIRONMENTS;

  return (
    <div className="space-y-2.5 sm:space-y-4 p-2.5 sm:p-4 lg:p-5 bg-[var(--paper-card)] border border-[var(--border)] rounded-xl sm:rounded-2xl shadow-sm">
      {/* Top Header Bar with Segmented Switcher & Save */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 pb-2.5 sm:pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-1 sm:gap-1.5 bg-[var(--paper-elevated)] p-1 sm:p-1.5 rounded-xl border border-[var(--border)]">
          <button
            onClick={() => setActiveTab('neuro')}
            className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center gap-1.5 sm:gap-2 ${
              activeTab === 'neuro'
                ? 'bg-violet-500 text-white shadow-md'
                : 'text-[var(--ink-muted)] hover:text-white'
            }`}
          >
            <Brain className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Neuroscience ({NEURO_PROTOCOLS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('environments')}
            className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center gap-1.5 sm:gap-2 ${
              activeTab === 'environments'
                ? 'bg-[var(--accent)] text-slate-950 shadow-md font-extrabold'
                : 'text-[var(--ink-muted)] hover:text-white'
            }`}
          >
            <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Acoustic ({CURATED_ENVIRONMENTS.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!isSaving ? (
            <button
              onClick={() => setIsSaving(true)}
              className="text-[11px] sm:text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1 sm:gap-1.5"
            >
              <BookmarkPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Save Mix</span>
            </button>
          ) : (
            <button
              onClick={() => setIsSaving(false)}
              className="text-[11px] sm:text-xs text-[var(--ink-muted)] hover:text-white"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleShare}
            className="text-[11px] sm:text-xs text-[var(--ink-muted)] hover:text-[var(--accent)] flex items-center gap-1 sm:gap-1.5 font-mono transition px-2 py-1 rounded-lg bg-[var(--paper-elevated)] border border-[var(--border)]"
            title="Copy shareable link"
          >
            <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{shareFeedback ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Preset Cards Grid: 2 columns on mobile, 3 on tablet, 6 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3">
        {activePresetsList.map(preset => {
          const isSelected = activePresetId === preset.id;
          return (
            <div
              key={preset.id}
              title={`${preset.name} — ${preset.tagline}`}
              className={`group relative p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between min-h-[72px] sm:min-h-[88px] ${
                isSelected
                  ? activeTab === 'neuro'
                    ? 'bg-violet-950/40 border-violet-400 ring-2 ring-violet-400 shadow-lg shadow-violet-500/20'
                    : 'bg-sky-950/40 border-[var(--accent)] ring-2 ring-[var(--accent)] shadow-lg shadow-sky-500/20'
                  : 'bg-[var(--paper-elevated)] border-[var(--border)] hover:border-slate-500 hover:shadow-md'
              }`}
            >
              <div 
                onClick={() => onSelectPreset(preset)}
                className="cursor-pointer"
              >
                {/* Header: Icon + Title + Active Pulse */}
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span className="text-lg sm:text-2xl shrink-0 drop-shadow-xs">{preset.icon}</span>
                    <span className={`text-xs sm:text-sm font-bold truncate leading-snug ${
                      isSelected 
                        ? activeTab === 'neuro' ? 'text-violet-300 font-extrabold' : 'text-[var(--accent)] font-extrabold' 
                        : 'text-[var(--ink)]'
                    }`}>
                      {preset.name}
                    </span>
                  </div>

                  {/* Active Indicator Pulse */}
                  {isSelected && (
                    <span className="shrink-0 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse ${
                        activeTab === 'neuro' ? 'bg-violet-400' : 'bg-[var(--accent)]'
                      }`} />
                    </span>
                  )}
                </div>

                {/* Subtitle / Recipe Marquee Container */}
                <div className="mt-0.5 sm:mt-1">
                  <MarqueeText
                    text={preset.tagline}
                    isActive={isSelected}
                    className="text-[10px] sm:text-xs text-[var(--ink-muted)] group-hover:text-slate-200 transition-colors"
                    speed={11}
                  />
                </div>
              </div>

              {/* Bottom Card Controls: Inspect info button */}
              <div className="pt-1.5 mt-1.5 sm:pt-2 sm:mt-2 border-t border-[var(--border)]/70 flex items-center justify-between text-[10px] sm:text-[11px]">
                <button
                  onClick={() => onSelectPreset(preset)}
                  className={`font-semibold flex items-center gap-1 transition ${
                    isSelected 
                      ? activeTab === 'neuro' ? 'text-violet-300' : 'text-[var(--accent)]'
                      : 'text-[var(--ink-muted)] hover:text-white'
                  }`}
                >
                  <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                  <span>{isSelected ? 'Active' : 'Apply'}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectPreset(preset);
                  }}
                  className="p-0.5 sm:p-1 rounded-md text-[var(--ink-muted)] hover:text-[var(--accent)] hover:bg-[var(--paper-card)] flex items-center gap-1 transition"
                  title="Inspect scientific rationale & channel breakdown"
                >
                  <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="text-[9px] sm:text-[10px] font-mono">Dossier</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Input Bar */}
      {isSaving && (
        <div className="flex gap-2 p-3 bg-[var(--paper-elevated)] rounded-xl border border-[var(--border)]">
          <input
            type="text"
            placeholder="Name your custom mix (e.g. Deep Focus Flow, Rain & Warm Hearth)..."
            value={newMixName}
            onChange={e => setNewMixName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            className="flex-1 text-xs px-3.5 py-2 bg-[var(--paper-card)] border border-[var(--border)] rounded-lg text-white outline-none"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[var(--accent)] text-slate-950 font-bold text-xs rounded-lg hover:opacity-90 transition"
          >
            Save Mix
          </button>
        </div>
      )}

      {/* Saved Custom Mixes Row */}
      {customMixes.length > 0 && (
        <div className="pt-3 border-t border-[var(--border)] flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-mono text-[var(--ink-muted)] uppercase font-semibold shrink-0">
            Custom Saved ({customMixes.length}):
          </span>
          {customMixes.map(mix => (
            <div
              key={mix.id}
              className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-[var(--paper-elevated)] border border-[var(--border)] text-xs shrink-0 hover:border-slate-500 transition"
            >
              <button
                onClick={() => onLoadCustomMix(mix)}
                className="font-bold text-[var(--ink)] hover:text-[var(--accent)] transition text-xs"
              >
                {mix.name}
              </button>
              <button
                onClick={() => onDeleteCustomMix(mix.id)}
                className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                title="Delete mix"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Protocol Dossier / Scientific Rationale Drawer Modal */}
      <ProtocolDetailModal
        preset={inspectPreset}
        onClose={() => setInspectPreset(null)}
        onActivate={(preset) => {
          onSelectPreset(preset);
          setInspectPreset(null);
        }}
        isActive={activePresetId === inspectPreset?.id}
      />
    </div>
  );
};
