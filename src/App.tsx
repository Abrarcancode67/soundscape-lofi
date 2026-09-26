import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { soundScapeEngine } from './audio/SoundScapeEngine';
import { 
  SoundChannelState, 
  ChannelId, 
  ChannelCategory,
  CuratedPreset, 
  CustomMix, 
  VisualizerMode 
} from './types/soundscape';
import { SoundVisualizer } from './components/Visualizer/SoundVisualizer';
import { ChannelCard } from './components/Mixer/ChannelCard';
import { MasterControls } from './components/Mixer/MasterControls';
import { PresetSelector, CURATED_ENVIRONMENTS, NEURO_PROTOCOLS } from './components/Presets/PresetSelector';
import { FocusSleepTimer } from './components/Timers/FocusSleepTimer';
import { 
  Headphones, 
  Moon, 
  Sun, 
  Timer, 
  ExternalLink, 
  RotateCcw,
  X,
  Radio,
  CloudRain,
  Coffee,
  Brain,
  Layers
} from 'lucide-react';

const INITIAL_23_CHANNELS: SoundChannelState[] = [
  // [NOISE & DRONES] (6)
  { id: 'brown_noise', name: 'Brown Noise', category: 'noise', icon: 'Radio', description: 'Deep low-frequency rumble', volume: 0.65, pan: 0, muted: false, solo: false, active: true, color: '#f59e0b' },
  { id: 'pink_noise', name: 'Pink Noise', category: 'noise', icon: 'Radio', description: '1/f soothing natural spectrum', volume: 0, pan: 0, muted: false, solo: false, active: false, color: '#ec4899' },
  { id: 'white_noise', name: 'White Noise', category: 'noise', icon: 'Radio', description: 'Crisp masking hiss', volume: 0, pan: 0, muted: false, solo: false, active: false, color: '#94a3b8' },
  { id: 'blue_noise', name: 'Blue Noise', category: 'noise', icon: 'Radio', description: 'High-frequency focus texture', volume: 0, pan: 0, muted: false, solo: false, active: false, color: '#38bdf8' },
  { id: 'green_noise', name: 'Green Noise', category: 'noise', icon: 'Radio', description: '500Hz natural ambiance', volume: 0, pan: 0, muted: false, solo: false, active: false, color: '#10b981' },
  { id: 'sub_bass', name: 'Sub-Bass Drone', category: 'noise', icon: 'Disc', description: 'Warm 55Hz grounding tone', volume: 0, pan: 0, muted: false, solo: false, active: false, color: '#6366f1' },

  // [NATURE & WEATHER] (8)
  { id: 'rain_leaves', name: 'Rain on Leaves', category: 'nature', icon: 'Droplets', description: 'Filtered droplet taps', volume: 0, pan: 0, muted: false, solo: false, active: false, color: '#14b8a6' },
  { id: 'heavy_downpour', name: 'Heavy Downpour', category: 'nature', icon: 'CloudRain', description: 'Dense cascading waterfall', volume: 0, pan: 0, muted: false, solo: false, active: false, color: '#0ea5e9' },
  { id: 'thunder', name: 'Rolling Thunder', category: 'nature', icon: 'Zap', description: 'Physical strike & rolling echo', volume: 0, pan: -0.3, muted: false, solo: false, active: false, color: '#eab308' },
  { id: 'campfire', name: 'Campfire', category: 'nature', icon: 'Flame', description: 'Deep crackles & wood pops', volume: 0, pan: 0, muted: false, solo: false, active: false, color: '#f97316' },
  { id: 'ocean', name: 'Ocean Surf', category: 'nature', icon: 'Waves', description: 'LFO dual-phase tidal swell', volume: 0, pan: 0, muted: false, solo: false, active: false, color: '#06b6d4' },
  { id: 'stream', name: 'Mountain Stream', category: 'nature', icon: 'Droplets', description: 'Dual-band bubbling harmonics', volume: 0, pan: -0.2, muted: false, solo: false, active: false, color: '#60a5fa' },
  { id: 'wind', name: 'Wandering Wind', category: 'nature', icon: 'Wind', description: 'Resonant whistling breeze', volume: 0.25, pan: 0.2, muted: false, solo: false, active: true, color: '#2dd4bf' },
  { id: 'crickets', name: 'Night Crickets', category: 'nature', icon: 'Sparkles', description: 'Cadenced FM chirps', volume: 0, pan: 0.3, muted: false, solo: false, active: false, color: '#84cc16' },

  // [AMBIENCE & URBAN] (5)
  { id: 'coffee_shop', name: 'Cozy Coffee Shop', category: 'ambience', icon: 'Coffee', description: 'Muffled murmur & cup clatter', volume: 0, pan: 0, muted: false, solo: false, active: false, color: '#d97706' },
  { id: 'vinyl', name: 'Vinyl Crackle', category: 'ambience', icon: 'Disc', description: '33-RPM dust pops & surface static', volume: 0, pan: 0.2, muted: false, solo: false, active: false, color: '#fb7185' },
  { id: 'train', name: 'Train on Tracks', category: 'ambience', icon: 'Train', description: 'Rhythmic click-clack transients', volume: 0, pan: 0, muted: false, solo: false, active: false, color: '#a8a29e' },
  { id: 'airplane', name: 'Airplane Cabin', category: 'ambience', icon: 'Plane', description: 'Ventilation & engine cruise hum', volume: 0, pan: 0, muted: false, solo: false, active: false, color: '#7dd3fc' },
  { id: 'clock', name: 'Clock Ticking', category: 'ambience', icon: 'Clock', description: 'Analog pendulum tick-tock', volume: 0, pan: 0, muted: false, solo: false, active: false, color: '#fde047' },

  // [NEUROSCIENCE & HARMONICS] (5)
  { id: 'tibetan_bowl', name: 'Tibetan Bowl', category: 'neuro', icon: 'Bell', description: 'Harmonic overtone resonant drone', volume: 0, pan: 0, muted: false, solo: false, active: false, color: '#c084fc' },
  { id: 'gamma_pulse', name: '40Hz Gamma Pulse', category: 'neuro', icon: 'Cpu', description: 'Cognitive binding entrainment', volume: 0, pan: 0, muted: false, solo: false, active: false, color: '#a78bfa', customOptions: { gammaPulseRate: 40 } },
  { id: 'solfeggio_528', name: 'Solfeggio 528Hz', category: 'neuro', icon: 'Music', description: 'Cortisol reduction healing tone', volume: 0, pan: 0, muted: false, solo: false, active: false, color: '#6ee7b7', customOptions: { solfeggioFreq: 528 } },
  { id: 'binaural', name: 'Binaural Beats', category: 'neuro', icon: 'Brain', description: '10Hz Alpha brainwave sync', volume: 0.45, pan: 0, muted: false, solo: false, active: true, color: '#818cf8', customOptions: { binauralCarrier: 216, binauralBeat: 10, binauralMode: 'binaural' } },
  { id: 'delta_sleep', name: 'Delta Sleep Sync (1.8Hz)', category: 'neuro', icon: 'Moon', description: '1.8Hz slow-wave delta carrier to stimulate restorative NREM deep sleep', volume: 0, pan: 0, muted: false, solo: false, active: false, color: '#6366f1' }
];

export default function App() {
  const [channels, setChannels] = useState<SoundChannelState[]>(INITIAL_23_CHANNELS);
  const [selectedCategory, setSelectedCategory] = useState<'all' | ChannelCategory>('all');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [masterVolume, setMasterVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string | null>('deep_focus');
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('wave');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showTimerModal, setShowTimerModal] = useState<boolean>(false);

  // Sleep Timer Auto-arm state
  const [sleepTimerSecondsLeft, setSleepTimerSecondsLeft] = useState<number | null>(null);
  const [isSleepTimerActive, setIsSleepTimerActive] = useState<boolean>(false);
  const [isSleepTimerFading, setIsSleepTimerFading] = useState<boolean>(false);

  // Custom Saved Mixes in localStorage
  const [customMixes, setCustomMixes] = useState<CustomMix[]>(() => {
    try {
      const saved = localStorage.getItem('soundscape_custom_mixes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  // Dynamic Zoom & App Scale State (75%, 100%, 125%)
  // Default is strictly 100% (1.0) on mobile and all other devices
  const [appScale, setAppScale] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('soundscape_app_scale_v2');
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && (parsed === 0.75 || parsed === 1.0 || parsed === 1.25)) {
          return parsed;
        }
      }
      // Migrate and ensure 100% default
      localStorage.removeItem('soundscape_app_scale');
      localStorage.setItem('soundscape_app_scale_v2', '1.0');
      return 1.0;
    } catch {
      return 1.0;
    }
  });

  const handleSetZoom = (scale: number) => {
    setAppScale(scale);
    try {
      localStorage.setItem('soundscape_app_scale_v2', scale.toString());
    } catch {}
    document.documentElement.style.setProperty('--app-scale', scale.toString());
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.style.setProperty('--app-scale', scale.toString());
    }
  };

  useEffect(() => {
    handleSetZoom(appScale);
  }, []);

  // Prevent background scrolling & support Escape key when timer modal is open
  useEffect(() => {
    if (!showTimerModal) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTimerModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showTimerModal]);

  // Sync Web MediaSession API for background / lockscreen playback
  useEffect(() => {
    if ('mediaSession' in navigator) {
      const allPresets = [...CURATED_ENVIRONMENTS, ...NEURO_PROTOCOLS];
      const activePreset = allPresets.find(p => p.id === activePresetId);
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'SoundScape Lo-Fi',
        artist: 'Procedural Ambient Generator',
        album: activePreset ? activePreset.name : 'Custom Ambient Focus Mix'
      });

      navigator.mediaSession.setActionHandler('play', () => {
        soundScapeEngine.start();
        setIsPlaying(true);
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        soundScapeEngine.pause();
        setIsPlaying(false);
      });
    }
  }, [activePresetId]);

  // Ensure AudioContext is unlocked on first touch/click in mobile Safari/Chrome
  useEffect(() => {
    const handleFirstTouchUnlock = () => {
      soundScapeEngine.resumeContext();
    };
    window.addEventListener('touchstart', handleFirstTouchUnlock, { passive: true, once: true });
    window.addEventListener('click', handleFirstTouchUnlock, { passive: true, once: true });
    return () => {
      window.removeEventListener('touchstart', handleFirstTouchUnlock);
      window.removeEventListener('click', handleFirstTouchUnlock);
    };
  }, []);

  // Handle Play / Pause toggle
  const handleTogglePlay = async () => {
    await soundScapeEngine.resumeContext();
    if (isPlaying) {
      soundScapeEngine.pause();
      setIsPlaying(false);
    } else {
      await soundScapeEngine.start();
      setIsPlaying(true);
      syncAudioNodes(channels);
    }
  };

  // Synchronize state with Web Audio Engine
  const syncAudioNodes = useCallback((currentChannels: SoundChannelState[]) => {
    const hasSolo = currentChannels.some(c => c.solo);

    currentChannels.forEach(c => {
      let targetVolume = c.volume;
      if (c.muted || (hasSolo && !c.solo)) {
        targetVolume = 0;
      }
      soundScapeEngine.setChannelVolume(c.id, targetVolume);
      soundScapeEngine.setChannelPan(c.id, c.pan);

      if (c.id === 'binaural' && c.customOptions) {
        soundScapeEngine.updateBinauralSettings(
          c.customOptions.binauralCarrier || 216,
          c.customOptions.binauralBeat || 10,
          c.customOptions.binauralMode || 'binaural'
        );
      } else if (c.id === 'solfeggio_528' && c.customOptions?.solfeggioFreq) {
        soundScapeEngine.updateSolfeggio(c.customOptions.solfeggioFreq);
      } else if (c.id === 'gamma_pulse' && c.customOptions?.gammaPulseRate) {
        soundScapeEngine.updateGammaPulseRate(c.customOptions.gammaPulseRate);
      } else if (c.id === 'sub_bass' && c.customOptions?.subBassFreq) {
        soundScapeEngine.updateSubBass(c.customOptions.subBassFreq);
      }
    });
  }, []);

  // Sleep Timer Countdown & 60-Second Exponential Fade
  useEffect(() => {
    let interval: any;
    if (isSleepTimerActive && sleepTimerSecondsLeft !== null && sleepTimerSecondsLeft > 0) {
      interval = setInterval(() => {
        setSleepTimerSecondsLeft(prev => {
          if (prev === null) return null;
          const next = prev - 1;
          const fadeSecs = 60;
          if (next === fadeSecs && !isSleepTimerFading) {
            setIsSleepTimerFading(true);
            soundScapeEngine.executeSleepFadeOut(fadeSecs, () => {
              setIsPlaying(false);
              setIsSleepTimerActive(false);
              setIsSleepTimerFading(false);
              setSleepTimerSecondsLeft(null);
            });
          }
          if (next <= 0) {
            setIsSleepTimerActive(false);
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSleepTimerActive, sleepTimerSecondsLeft, isSleepTimerFading]);

  const handleCancelSleepTimer = () => {
    setIsSleepTimerActive(false);
    setIsSleepTimerFading(false);
    setSleepTimerSecondsLeft(null);
  };

  // Channel volume change
  const handleChannelVolumeChange = (id: ChannelId, vol: number) => {
    setChannels(prev => {
      const next = prev.map(c => c.id === id ? { ...c, volume: vol, muted: vol === 0 ? c.muted : false } : c);
      syncAudioNodes(next);
      return next;
    });
    setActivePresetId(null);
  };

  // Channel pan change
  const handleChannelPanChange = (id: ChannelId, pan: number) => {
    setChannels(prev => {
      const next = prev.map(c => c.id === id ? { ...c, pan } : c);
      syncAudioNodes(next);
      return next;
    });
  };

  // Channel mute toggle
  const handleChannelMuteToggle = (id: ChannelId) => {
    setChannels(prev => {
      const next = prev.map(c => c.id === id ? { ...c, muted: !c.muted } : c);
      syncAudioNodes(next);
      return next;
    });
  };

  // Channel solo toggle
  const handleChannelSoloToggle = (id: ChannelId) => {
    setChannels(prev => {
      const current = prev.find(c => c.id === id);
      const isSoloing = !current?.solo;
      const next = prev.map(c => c.id === id ? { ...c, solo: isSoloing } : { ...c, solo: false });
      syncAudioNodes(next);
      return next;
    });
  };

  // Binaural tuning change
  const handleBinauralChange = (carrier: number, beat: number, mode: 'binaural' | 'isochronic') => {
    setChannels(prev => {
      const next = prev.map(c => c.id === 'binaural' ? {
        ...c,
        customOptions: { ...c.customOptions, binauralCarrier: carrier, binauralBeat: beat, binauralMode: mode }
      } : c);
      soundScapeEngine.updateBinauralSettings(carrier, beat, mode);
      return next;
    });
  };

  // Solfeggio tuning change
  const handleSolfeggioChange = (freq: number) => {
    setChannels(prev => {
      const next = prev.map(c => c.id === 'solfeggio_528' ? {
        ...c,
        customOptions: { ...c.customOptions, solfeggioFreq: freq }
      } : c);
      soundScapeEngine.updateSolfeggio(freq);
      return next;
    });
  };

  // Gamma pulse rate change
  const handleGammaChange = (rate: number) => {
    setChannels(prev => {
      const next = prev.map(c => c.id === 'gamma_pulse' ? {
        ...c,
        customOptions: { ...c.customOptions, gammaPulseRate: rate }
      } : c);
      soundScapeEngine.updateGammaPulseRate(rate);
      return next;
    });
  };

  // Apply a curated preset
  const handleSelectPreset = async (preset: CuratedPreset) => {
    setActivePresetId(preset.id);
    
    if (!isPlaying) {
      await soundScapeEngine.start();
      setIsPlaying(true);
    }

    setChannels(prev => {
      const next = prev.map(c => {
        const config = preset.channels[c.id];
        if (config) {
          return {
            ...c,
            volume: config.volume,
            pan: config.pan ?? c.pan,
            muted: false,
            solo: false
          };
        } else {
          return {
            ...c,
            volume: 0,
            muted: false,
            solo: false
          };
        }
      });

      if (preset.binauralSettings) {
        soundScapeEngine.updateBinauralSettings(
          preset.binauralSettings.carrier,
          preset.binauralSettings.beat,
          preset.binauralSettings.mode
        );
      }

      // Grounding sub-bass tuning: 43.65 Hz F1 resonant tone for Deep Delta Somnolence
      if (preset.id === 'deep_delta_somnolence') {
        soundScapeEngine.updateSubBass(43.65);
      } else {
        soundScapeEngine.updateSubBass(55);
      }

      syncAudioNodes(next);
      return next;
    });

    // Auto-arm sleep timer if preset specifies sleepTimerMinutes (e.g. 45-min for Deep Delta Somnolence)
    if (preset.sleepTimerMinutes) {
      const durationSecs = preset.sleepTimerMinutes * 60;
      setSleepTimerSecondsLeft(durationSecs);
      setIsSleepTimerActive(true);
      setIsSleepTimerFading(false);
    } else {
      setIsSleepTimerActive(false);
      setIsSleepTimerFading(false);
      setSleepTimerSecondsLeft(null);
    }
  };

  // Save current mix to localStorage
  const handleSaveMix = (name: string) => {
    const channelMap: Record<string, { volume: number; pan: number; muted: boolean }> = {};
    channels.forEach(c => {
      channelMap[c.id] = { volume: c.volume, pan: c.pan, muted: c.muted };
    });

    const binauralChannel = channels.find(c => c.id === 'binaural');
    const newMix: CustomMix = {
      id: 'mix_' + Date.now(),
      name,
      createdAt: new Date().toISOString(),
      channels: channelMap,
      binauralSettings: {
        carrier: binauralChannel?.customOptions?.binauralCarrier || 216,
        beat: binauralChannel?.customOptions?.binauralBeat || 10,
        mode: binauralChannel?.customOptions?.binauralMode || 'binaural'
      }
    };

    const updated = [newMix, ...customMixes];
    setCustomMixes(updated);
    try {
      localStorage.setItem('soundscape_custom_mixes', JSON.stringify(updated));
    } catch {}
  };

  // Load a saved custom mix
  const handleLoadCustomMix = async (mix: CustomMix) => {
    if (!isPlaying) {
      await soundScapeEngine.start();
      setIsPlaying(true);
    }
    setActivePresetId(null);

    setChannels(prev => {
      const next = prev.map(c => {
        const saved = mix.channels[c.id];
        if (saved) {
          return {
            ...c,
            volume: saved.volume,
            pan: saved.pan,
            muted: saved.muted,
            solo: false
          };
        }
        return { ...c, volume: 0, solo: false };
      });

      if (mix.binauralSettings) {
        soundScapeEngine.updateBinauralSettings(
          mix.binauralSettings.carrier,
          mix.binauralSettings.beat,
          mix.binauralSettings.mode
        );
      }

      syncAudioNodes(next);
      return next;
    });
  };

  // Delete a saved mix
  const handleDeleteCustomMix = (id: string) => {
    const updated = customMixes.filter(m => m.id !== id);
    setCustomMixes(updated);
    try {
      localStorage.setItem('soundscape_custom_mixes', JSON.stringify(updated));
    } catch {}
  };

  // Reset all channels to 0
  const handleResetMix = () => {
    setChannels(prev => {
      const next = prev.map(c => ({ ...c, volume: 0, muted: false, solo: false }));
      syncAudioNodes(next);
      return next;
    });
    setActivePresetId(null);
  };

  const hasSolo = channels.some(c => c.solo);
  const activeCount = channels.filter(c => c.volume > 0 && !c.muted).length;

  // Filtered channel view
  const visibleChannels = useMemo(() => {
    if (selectedCategory === 'all') return channels;
    return channels.filter(c => c.category === selectedCategory);
  }, [channels, selectedCategory]);

  const categoryCounts = useMemo(() => {
    return {
      all: channels.length,
      noise: channels.filter(c => c.category === 'noise').length,
      nature: channels.filter(c => c.category === 'nature').length,
      ambience: channels.filter(c => c.category === 'ambience').length,
      neuro: channels.filter(c => c.category === 'neuro').length,
    };
  }, [channels]);

  return (
    <div className="w-full min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)] font-sans select-none overflow-x-hidden relative text-[13px] sm:text-sm">
      {/* 1. Header (Natural Document Flow, non-sticky) */}
      <header className="h-12 sm:h-14 px-2.5 sm:px-6 border-b border-[var(--border)] bg-[var(--paper-card)] flex items-center justify-between shrink-0 relative z-10 gap-2">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[var(--accent)] text-slate-950 flex items-center justify-center font-bold shadow-xs">
            <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="font-serif-heading text-base sm:text-lg lg:text-xl font-bold tracking-tight text-[var(--ink)]">
              SoundScape
            </span>
            <span className="hidden sm:inline text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[var(--accent)] font-semibold">
              Lo-Fi Focus ({channels.length})
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation / Info */}
        <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)] font-mono">
          {isSleepTimerActive && sleepTimerSecondsLeft !== null ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 shadow-sm text-[10px] sm:text-xs animate-in fade-in">
              <Moon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400 ${isSleepTimerFading ? 'animate-pulse text-amber-300' : ''}`} />
              <span className="font-semibold text-slate-100">
                Sleep: {Math.floor(sleepTimerSecondsLeft / 60)}:{(sleepTimerSecondsLeft % 60).toString().padStart(2, '0')}
              </span>
              {isSleepTimerFading && (
                <span className="hidden sm:inline text-[10px] text-amber-300 font-bold animate-pulse">
                  (Fading 60s...)
                </span>
              )}
              <button
                onClick={handleCancelSleepTimer}
                className="text-[9px] sm:text-[10px] text-rose-300 hover:text-rose-100 px-1 py-0.2 rounded bg-rose-500/20 hover:bg-rose-500/40 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              <span>{channels.length} Procedural Channels</span>
              <span aria-hidden="true">·</span>
              <span>Delta Sleep Entrainment (1.8Hz)</span>
              <span aria-hidden="true">·</span>
              <span>Neuroscience Protocols</span>
            </div>
          )}
        </div>

        {/* Zone 3: Primary Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Dynamic Zoom Toggle (Accessibility & Mobile Scale) */}
          <div className="flex items-center bg-[var(--paper-elevated)] p-0.5 rounded-lg border border-[var(--border)] text-[10px] sm:text-[11px] font-mono shrink-0">
            <span className="hidden md:inline px-1.5 text-[10px] text-[var(--ink-muted)] font-semibold select-none">
              Zoom:
            </span>
            <button
              onClick={() => handleSetZoom(0.75)}
              className={`px-1.5 py-0.5 rounded transition ${
                appScale === 0.75
                  ? 'bg-[var(--accent)] text-slate-950 font-bold shadow-xs'
                  : 'text-[var(--ink-muted)] hover:text-white'
              }`}
              title="Zoom out: 75% scale"
            >
              75%
            </button>
            <span className="text-[var(--border)] select-none">|</span>
            <button
              onClick={() => handleSetZoom(1.0)}
              className={`px-1.5 py-0.5 rounded transition ${
                appScale === 1.0
                  ? 'bg-[var(--accent)] text-slate-950 font-bold shadow-xs'
                  : 'text-[var(--ink-muted)] hover:text-white'
              }`}
              title="100% default zoom (Standard)"
            >
              100%
            </button>
            <span className="text-[var(--border)] select-none">|</span>
            <button
              onClick={() => handleSetZoom(1.25)}
              className={`px-1.5 py-0.5 rounded transition ${
                appScale === 1.25
                  ? 'bg-[var(--accent)] text-slate-950 font-bold shadow-xs'
                  : 'text-[var(--ink-muted)] hover:text-white'
              }`}
              title="Zoom in: 125% scale for readability"
            >
              125%
            </button>
          </div>

          {/* Timer Drawer Button */}
          <div className="relative">
            <button
              onClick={() => setShowTimerModal(!showTimerModal)}
              aria-expanded={showTimerModal}
              aria-haspopup="dialog"
              className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition border ${
                showTimerModal
                  ? 'bg-[var(--accent)] text-slate-950 border-[var(--accent)] shadow-xs'
                  : 'bg-[var(--paper-elevated)] border-[var(--border)] text-[var(--ink)] hover:border-slate-500'
              }`}
            >
              <Timer className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Focus Timers</span>
            </button>
            {showTimerModal && (
              <div 
                className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-[var(--accent)] z-50 pointer-events-none hidden sm:block" 
                aria-hidden="true" 
              />
            )}
          </div>

          {/* Reset All Audio */}
          <button
            onClick={handleResetMix}
            title="Reset all channel volumes to zero"
            className="p-1 sm:p-1.5 rounded-lg bg-[var(--paper-elevated)] border border-[var(--border)] text-[var(--ink-muted)] hover:text-white transition"
          >
            <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1 sm:p-1.5 rounded-lg bg-[var(--paper-elevated)] border border-[var(--border)] text-[var(--ink-muted)] hover:text-white transition"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </header>

      {/* 2. Visualizer Ribbon (Anchored naturally in document flow without blocking canvas) */}
      <div className="h-12 sm:h-16 w-full bg-[var(--paper)] border-b border-[var(--border)]/60 relative shrink-0 overflow-hidden">
        <SoundVisualizer
          mode={visualizerMode}
          isPlaying={isPlaying}
          accentColor={theme === 'dark' ? '#38bdf8' : '#0284c7'}
        />
        <div className="absolute top-1 left-3 sm:top-1.5 sm:left-4 text-[9px] sm:text-[10px] font-mono text-[var(--ink-muted)] opacity-60 pointer-events-none z-10">
          Live AnalyserNode FFT
        </div>
      </div>

      {/* 3. Main Viewport & Channels Grid */}
      <main className="flex-1 p-2 sm:p-4 lg:p-6 space-y-2.5 sm:space-y-4 max-w-7xl mx-auto w-full">
        {/* Master Transport Controls */}
        <MasterControls
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          masterVolume={masterVolume}
          onMasterVolumeChange={vol => {
            setMasterVolume(vol);
            soundScapeEngine.setMasterVolume(vol);
          }}
          isMuted={isMuted}
          onToggleMute={() => {
            const muted = soundScapeEngine.toggleMasterMute();
            setIsMuted(muted);
          }}
          visualizerMode={visualizerMode}
          onVisualizerModeChange={setVisualizerMode}
          activeCount={activeCount}
        />

        {/* 1-Click Mood Presets & Neuro-Protocols */}
        <PresetSelector
          activePresetId={activePresetId}
          onSelectPreset={handleSelectPreset}
          onSaveCurrentMix={handleSaveMix}
          customMixes={customMixes}
          onLoadCustomMix={handleLoadCustomMix}
          onDeleteCustomMix={handleDeleteCustomMix}
        />

        {/* Channel Categories Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 sm:pt-2">
          <div className="flex items-center gap-1 bg-[var(--paper-card)] p-1 rounded-xl border border-[var(--border)] overflow-x-auto scrollbar-none max-w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-[var(--accent)] text-slate-950 shadow-xs'
                  : 'text-[var(--ink-muted)] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All ({categoryCounts.all})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('noise')}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'noise'
                  ? 'bg-[var(--accent)] text-slate-950 shadow-xs'
                  : 'text-[var(--ink-muted)] hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Noise ({categoryCounts.noise})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('nature')}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'nature'
                  ? 'bg-[var(--accent)] text-slate-950 shadow-xs'
                  : 'text-[var(--ink-muted)] hover:text-white'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>Nature ({categoryCounts.nature})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('ambience')}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'ambience'
                  ? 'bg-[var(--accent)] text-slate-950 shadow-xs'
                  : 'text-[var(--ink-muted)] hover:text-white'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Ambience ({categoryCounts.ambience})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('neuro')}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'neuro'
                  ? 'bg-[var(--accent)] text-slate-950 shadow-xs'
                  : 'text-[var(--ink-muted)] hover:text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Neuroscience ({categoryCounts.neuro})</span>
            </button>
          </div>

          <div className="text-[10px] sm:text-[11px] font-mono text-[var(--ink-muted)] block">
            Showing {visibleChannels.length} of {channels.length} Procedural Channels
          </div>
        </div>

        {/* Multi-Track Soundboard Grid: Responsive 2-Column Mobile, 3-Column Tablet, 4-Column Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 pb-6">
          {visibleChannels.map(channel => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onVolumeChange={vol => handleChannelVolumeChange(channel.id, vol)}
              onPanChange={pan => handleChannelPanChange(channel.id, pan)}
              onToggleMute={() => handleChannelMuteToggle(channel.id)}
              onToggleSolo={() => handleChannelSoloToggle(channel.id)}
              onBinauralChange={handleBinauralChange}
              onSolfeggioChange={handleSolfeggioChange}
              onGammaChange={handleGammaChange}
              isSoloedByOther={hasSolo && !channel.solo}
            />
          ))}
        </div>
      </main>

      {/* 4. Timer Overlay Drawer Modal (Top Viewport, Scroll-Locked & Mobile-Optimized) */}
      {showTimerModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto pt-4 px-3 pb-6 sm:pt-16 sm:px-4 sm:pb-8 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowTimerModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="timer-modal-title"
        >
          <div 
            className="relative w-full max-w-md mx-auto my-0 max-h-[90vh] overflow-y-auto bg-[var(--paper-card)] border border-[var(--border)] rounded-2xl shadow-2xl p-4 sm:p-5 space-y-4 text-[var(--ink)] focus:outline-hidden"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent rounded-t-2xl" />

            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border)]">
              <span id="timer-modal-title" className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
                  <Timer className="w-4 h-4" />
                </span>
                <span>Productivity & Rest Timers</span>
              </span>
              <button
                onClick={() => setShowTimerModal(false)}
                className="p-1.5 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--paper-elevated)] transition"
                aria-label="Close timers modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <FocusSleepTimer
              onTimerEnd={() => setIsPlaying(false)}
              accentColor={theme === 'dark' ? '#38bdf8' : '#0284c7'}
              isModal
            />
          </div>
        </div>,
        document.body
      )}

      {/* 5. Minimalist FreeAppStore Compliant Footer (Document Flow) */}
      <footer className="h-9 sm:h-10 px-3 sm:px-6 border-t border-[var(--border)] bg-[var(--paper-card)] flex items-center justify-between text-[10px] sm:text-[11px] text-[var(--ink-muted)] shrink-0 font-mono mt-auto relative z-10 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 truncate">
          <span>SoundScape Lo-Fi ({channels.length} Channels)</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Zero external assets or CDNs</span>
        </div>
        <div className="shrink-0">
          <a
            href="https://freeappstore.online"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--accent)] flex items-center gap-1 transition"
          >
            <span className="hidden sm:inline">Built for freeappstore.online</span>
            <span className="sm:hidden">freeappstore</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}
