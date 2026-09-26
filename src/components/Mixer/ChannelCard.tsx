import React, { useState, useEffect } from 'react';
import { SoundChannelState } from '../../types/soundscape';
import { soundScapeEngine } from '../../audio/SoundScapeEngine';
import { MarqueeText } from '../Common/MarqueeText';
import { 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Flame, 
  Waves, 
  Wind, 
  Activity, 
  Sparkles, 
  Disc, 
  Zap, 
  Radio, 
  Bell, 
  Droplets,
  Coffee,
  Plane,
  Clock,
  Train,
  Music,
  Brain,
  ChevronDown,
  ChevronUp,
  Cpu,
  Moon
} from 'lucide-react';

interface ChannelCardProps {
  channel: SoundChannelState;
  onVolumeChange: (vol: number) => void;
  onPanChange: (pan: number) => void;
  onToggleMute: () => void;
  onToggleSolo: () => void;
  onBinauralChange?: (carrier: number, beat: number, mode: 'binaural' | 'isochronic') => void;
  onSolfeggioChange?: (freq: number) => void;
  onGammaChange?: (rate: number) => void;
  isSoloedByOther: boolean;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  onVolumeChange,
  onPanChange,
  onToggleMute,
  onToggleSolo,
  onBinauralChange,
  onSolfeggioChange,
  onGammaChange,
  isSoloedByOther
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [strikeFeedback, setStrikeFeedback] = useState(false);
  const [isLightningFlashing, setIsLightningFlashing] = useState(false);
  const [lastStrikeType, setLastStrikeType] = useState<'direct' | 'distant' | 'ambient' | null>(null);
  const [thunderMode, setThunderMode] = useState<'direct' | 'distant' | 'ambient'>('direct');

  // Listen to engine thunder strikes (automatic interval or manual)
  useEffect(() => {
    if (channel.id !== 'thunder') return;
    const unsubscribe = soundScapeEngine.onThunderStrike((intensity) => {
      setLastStrikeType(intensity);
      setIsLightningFlashing(true);
      setTimeout(() => {
        setIsLightningFlashing(false);
      }, 1000);
    });
    return unsubscribe;
  }, [channel.id]);

  const getChannelIcon = (id: string) => {
    switch (id) {
      // Noise & Drones
      case 'brown_noise': return <Radio className="w-4 h-4 text-amber-500" />;
      case 'pink_noise': return <Radio className="w-4 h-4 text-pink-400" />;
      case 'white_noise': return <Radio className="w-4 h-4 text-slate-300" />;
      case 'blue_noise': return <Radio className="w-4 h-4 text-cyan-400" />;
      case 'green_noise': return <Radio className="w-4 h-4 text-emerald-400" />;
      case 'sub_bass': return <Disc className="w-4 h-4 text-indigo-400" />;

      // Nature & Weather
      case 'rain_leaves': return <Droplets className="w-4 h-4 text-teal-400" />;
      case 'heavy_downpour': return <CloudRain className="w-4 h-4 text-sky-400" />;
      case 'thunder': return <Zap className={`w-4 h-4 ${isLightningFlashing ? 'text-yellow-200 fill-yellow-200 animate-bounce' : 'text-yellow-400'}`} />;
      case 'campfire': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'ocean': return <Waves className="w-4 h-4 text-blue-400" />;
      case 'stream': return <Droplets className="w-4 h-4 text-cyan-300" />;
      case 'wind': return <Wind className="w-4 h-4 text-teal-300" />;
      case 'crickets': return <Sparkles className="w-4 h-4 text-lime-400" />;

      // Ambience & Urban
      case 'coffee_shop': return <Coffee className="w-4 h-4 text-amber-600" />;
      case 'vinyl': return <Disc className="w-4 h-4 text-rose-400" />;
      case 'train': return <Train className="w-4 h-4 text-stone-400" />;
      case 'airplane': return <Plane className="w-4 h-4 text-sky-300" />;
      case 'clock': return <Clock className="w-4 h-4 text-amber-300" />;

      // Neuroscience & Harmonics
      case 'tibetan_bowl': return <Bell className="w-4 h-4 text-purple-400" />;
      case 'gamma_pulse': return <Cpu className="w-4 h-4 text-violet-400" />;
      case 'solfeggio_528': return <Music className="w-4 h-4 text-emerald-300" />;
      case 'binaural': return <Brain className="w-4 h-4 text-indigo-400" />;
      case 'delta_sleep': return <Moon className="w-4 h-4 text-indigo-300" />;

      default: return <Radio className="w-4 h-4 text-slate-300" />;
    }
  };

  const handleManualThunderStrike = async (intensity: 'direct' | 'distant' | 'ambient' = thunderMode) => {
    // If volume is currently 0 or muted, turn it on so the user immediately hears thunder
    if (channel.volume === 0) {
      onVolumeChange(0.70);
    }
    if (channel.muted) {
      onToggleMute();
    }
    if (!soundScapeEngine.getIsRunning()) {
      await soundScapeEngine.start();
    }
    await soundScapeEngine.triggerThunderStrike(intensity);
    setLastStrikeType(intensity);
    setStrikeFeedback(true);
    setIsLightningFlashing(true);
    setTimeout(() => {
      setStrikeFeedback(false);
      setIsLightningFlashing(false);
    }, 1200);
  };

  const isAudible = channel.volume > 0 && !channel.muted && !isSoloedByOther;
  const panLabel = channel.pan === 0 
    ? 'Center' 
    : channel.pan < 0 
    ? `L ${Math.abs(Math.round(channel.pan * 100))}%` 
    : `R ${Math.round(channel.pan * 100)}%`;

  return (
    <div
      title={`${channel.name} — ${channel.description}`}
      className={`group relative p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
        isLightningFlashing
          ? 'bg-amber-950/40 border-yellow-400 ring-2 ring-yellow-400/80 shadow-2xl shadow-yellow-500/40'
          : isAudible
          ? 'bg-[var(--paper-card)] border-[var(--accent)] ring-1 ring-[var(--accent)]/30 shadow-md is-active-card'
          : 'bg-[var(--paper-card)] border-[var(--border)] opacity-90 hover:opacity-100 hover:border-slate-500'
      }`}
    >
      {/* Top Row: Icon + Title + Mute/Solo */}
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-1.5 sm:mb-2">
          <button
            onClick={() => {
              if (channel.volume === 0) onVolumeChange(0.65);
              else onToggleMute();
            }}
            className="flex items-center gap-2 sm:gap-2.5 text-left group min-w-0"
          >
            <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition shrink-0 ${
              isAudible
                ? 'bg-[var(--accent-soft)] border-[var(--accent)]/40 shadow-xs'
                : 'bg-[var(--paper-elevated)] border-transparent text-slate-400'
            }`}>
              {getChannelIcon(channel.id)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition truncate leading-snug">
                {channel.name}
              </div>
              <div className="mt-0.5">
                <MarqueeText
                  text={channel.description}
                  isActive={isAudible}
                  className="text-[10px] sm:text-xs text-[var(--ink-muted)] group-hover:text-slate-300 transition-colors"
                  speed={8}
                />
              </div>
            </div>
          </button>

          {/* Mute & Solo buttons with enhanced touch targets */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onToggleSolo}
              title={channel.solo ? 'Unsolo channel' : 'Solo this channel'}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-mono font-bold transition flex items-center justify-center ${
                channel.solo
                  ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-[var(--paper-elevated)] text-[var(--ink-muted)] hover:text-white border border-[var(--border)]'
              }`}
            >
              S
            </button>
            <button
              onClick={onToggleMute}
              title={channel.muted ? 'Unmute channel' : 'Mute channel'}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg transition flex items-center justify-center ${
                channel.muted
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-[var(--paper-elevated)] text-[var(--ink-muted)] hover:text-white border border-[var(--border)]'
              }`}
            >
              {channel.muted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>

        {/* Volume Slider with Increased Contrast & Thumb */}
        <div className="space-y-1 my-1.5 sm:space-y-1.5 sm:my-3">
          <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono-tabular">
            <span className="text-[var(--ink-muted)] font-semibold">Volume</span>
            <span className={`text-xs sm:text-sm font-extrabold ${isAudible ? 'text-[var(--accent)]' : 'text-slate-400'}`}>
              {Math.round(channel.volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={channel.volume}
            onChange={e => onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1.5 sm:h-2 bg-slate-700/80 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Stereo Pan Slider */}
        <div className="space-y-0.5 sm:space-y-1">
          <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-mono-tabular text-[var(--ink-muted)]">
            <span className="font-medium">Stereo Pan</span>
            <button
              onClick={() => onPanChange(0)}
              title="Reset stereo pan to center"
              className="hover:text-[var(--accent)] font-semibold transition"
            >
              {panLabel}
            </button>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={channel.pan}
            onChange={e => onPanChange(parseFloat(e.target.value))}
            className="w-full h-1 sm:h-1.5 bg-slate-700/60 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Special Channel Extensions */}

      {/* 1. Thunder Strike Trigger & Acoustic Controls */}
      {channel.id === 'thunder' && (
        <div className="mt-2 pt-1.5 sm:mt-3.5 sm:pt-2.5 border-t border-[var(--border)] space-y-1.5 sm:space-y-2">
          {/* Mode Selector */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono">
            <span className="text-[var(--ink-muted)]">Strike Mode</span>
            {isLightningFlashing && (
              <span className="text-yellow-400 font-bold animate-pulse flex items-center gap-1 text-[9px] sm:text-[10px]">
                <Zap className="w-3 h-3 fill-yellow-400" />
                {lastStrikeType === 'direct' ? 'Overhead Crack!' : lastStrikeType === 'distant' ? 'Rolling Echo!' : 'Atmospheric Swell!'}
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1 text-[10px] sm:text-[11px] font-mono">
            {(['direct', 'distant', 'ambient'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setThunderMode(mode)}
                className={`py-0.5 sm:py-1 px-1 rounded-md sm:rounded-lg border text-center transition ${
                  thunderMode === mode
                    ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300 font-bold'
                    : 'bg-[var(--paper-elevated)] border-[var(--border)] text-[var(--ink-muted)] hover:text-slate-200'
                }`}
              >
                {mode === 'direct' ? '⚡ Direct' : mode === 'distant' ? '🏔️ Rolling' : '🌫️ Horizon'}
              </button>
            ))}
          </div>

          {/* Trigger Button */}
          <button
            onClick={() => handleManualThunderStrike(thunderMode)}
            className={`w-full py-1.5 sm:py-2 px-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition ${
              isLightningFlashing || strikeFeedback
                ? 'bg-yellow-400 text-slate-950 scale-[0.98] shadow-lg shadow-yellow-400/40 ring-2 ring-yellow-300'
                : 'bg-[var(--paper-elevated)] text-yellow-400 hover:bg-slate-700/80 border border-yellow-400/40 shadow-xs'
            }`}
          >
            <Zap className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isLightningFlashing || strikeFeedback ? 'fill-slate-950' : 'fill-yellow-400'}`} />
            <span>{strikeFeedback ? '⚡ Strike Dispatched!' : `Trigger ${thunderMode.toUpperCase()} Strike`}</span>
          </button>

          {/* Storm Bed & Timing Status */}
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-[var(--ink-muted)] font-mono pt-0.5">
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isAudible ? 'bg-yellow-400 animate-ping' : 'bg-slate-600'}`} />
              {isAudible ? 'Bed Active' : 'Bed Idle'}
            </span>
            <span>{isAudible ? 'Auto: 18s-42s' : '0% Vol'}</span>
          </div>
        </div>
      )}

      {/* 2. Binaural Beats Specific Controls Toggle */}
      {channel.id === 'binaural' && (
        <div className="mt-2 pt-1.5 sm:mt-3.5 sm:pt-2.5 border-t border-[var(--border)]">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="w-full flex items-center justify-between text-[11px] sm:text-xs text-[var(--accent)] font-bold hover:underline"
          >
            <span>Wave Tuning ({channel.customOptions?.binauralBeat || 10}Hz)</span>
            {showOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showOptions && (
            <div className="mt-2 space-y-2 p-2 bg-[var(--paper-elevated)] rounded-xl text-[11px] sm:text-xs border border-[var(--border)]">
              <div className="text-[10px] text-[var(--ink-muted)] font-mono font-semibold">Brainwave Entrainment</div>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { name: 'Delta', beat: 2.5 },
                  { name: 'Theta', beat: 6 },
                  { name: 'Alpha', beat: 10 },
                  { name: 'Beta', beat: 15 }
                ].map(b => (
                  <button
                    key={b.name}
                    onClick={() => {
                      if (onBinauralChange) {
                        onBinauralChange(
                          channel.customOptions?.binauralCarrier || 216,
                          b.beat,
                          channel.customOptions?.binauralMode || 'binaural'
                        );
                      }
                    }}
                    className={`py-0.5 sm:py-1 px-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold transition text-center ${
                      (channel.customOptions?.binauralBeat || 10) === b.beat
                        ? 'bg-[var(--accent)] text-slate-950 shadow-xs'
                        : 'bg-[var(--paper-card)] text-[var(--ink-muted)] hover:text-white'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] sm:text-xs pt-1 border-t border-slate-700/60 font-mono">
                <span className="text-[var(--ink-muted)]">Carrier:</span>
                <div className="flex gap-1">
                  {[136.1, 216, 432, 528].map(c => (
                    <button
                      key={c}
                      onClick={() => {
                        if (onBinauralChange) {
                          onBinauralChange(
                            c,
                            channel.customOptions?.binauralBeat || 10,
                            channel.customOptions?.binauralMode || 'binaural'
                          );
                        }
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono ${
                        (channel.customOptions?.binauralCarrier || 216) === c
                          ? 'bg-[var(--accent)] text-slate-950 font-bold'
                          : 'bg-[var(--paper-card)] text-slate-400'
                      }`}
                    >
                      {c}Hz
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Solfeggio 528Hz Controls Toggle */}
      {channel.id === 'solfeggio_528' && (
        <div className="mt-2 pt-1.5 sm:mt-3.5 sm:pt-2.5 border-t border-[var(--border)]">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-[var(--ink-muted)] mb-1">
            <span>Solfeggio Tone:</span>
            <span className="text-emerald-400 font-bold">{channel.customOptions?.solfeggioFreq || 528}Hz</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {[174, 396, 432, 528].map(f => (
              <button
                key={f}
                onClick={() => {
                  if (onSolfeggioChange) onSolfeggioChange(f);
                }}
                className={`py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-mono font-bold transition text-center ${
                  (channel.customOptions?.solfeggioFreq || 528) === f
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-[var(--paper-elevated)] text-slate-400 hover:text-white'
                }`}
              >
                {f}Hz
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Gamma Pulse 40Hz Controls */}
      {channel.id === 'gamma_pulse' && (
        <div className="mt-2 pt-1.5 sm:mt-3.5 sm:pt-2.5 border-t border-[var(--border)]">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-[var(--ink-muted)] mb-1">
            <span>Gamma Rate:</span>
            <span className="text-violet-400 font-bold">{channel.customOptions?.gammaPulseRate || 40}Hz</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[38, 40, 43.2].map(r => (
              <button
                key={r}
                onClick={() => {
                  if (onGammaChange) onGammaChange(r);
                }}
                className={`py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-mono font-bold transition text-center ${
                  (channel.customOptions?.gammaPulseRate || 40) === r
                    ? 'bg-violet-400 text-slate-950'
                    : 'bg-[var(--paper-elevated)] text-slate-400 hover:text-white'
                }`}
              >
                {r}Hz
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Delta Sleep Sync 1.8Hz Controls */}
      {channel.id === 'delta_sleep' && (
        <div className="mt-2 pt-1.5 sm:mt-3.5 sm:pt-2.5 border-t border-[var(--border)] text-[10px] sm:text-[11px] font-mono space-y-1">
          <div className="flex items-center justify-between text-indigo-300 font-semibold">
            <span className="flex items-center gap-1">
              <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400" />
              <span>1.8 Hz Delta</span>
            </span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Stage 3 NREM
            </span>
          </div>
          <div className="text-[9px] sm:text-[10px] text-[var(--ink-muted)] flex justify-between bg-[var(--paper-elevated)] p-1 sm:p-1.5 rounded-lg border border-[var(--border)]/60">
            <span>L: 108.0 Hz</span>
            <span>Δ 1.8 Hz</span>
            <span>R: 109.8 Hz</span>
          </div>
        </div>
      )}
    </div>
  );
};
