import React from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { soundScapeEngine } from '../../audio/SoundScapeEngine';
import { VisualizerMode } from '../../types/soundscape';

interface MasterControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  masterVolume: number;
  onMasterVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  visualizerMode: VisualizerMode;
  onVisualizerModeChange: (mode: VisualizerMode) => void;
  activeCount: number;
}

export const MasterControls: React.FC<MasterControlsProps> = ({
  isPlaying,
  onTogglePlay,
  masterVolume,
  onMasterVolumeChange,
  isMuted,
  onToggleMute,
  visualizerMode,
  onVisualizerModeChange,
  activeCount
}) => {
  const handleTouchUnlock = () => {
    // Mobile autoplay policy: resume AudioContext immediately on touch
    soundScapeEngine.resumeContext();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 p-2.5 sm:p-3.5 bg-[var(--paper-card)] border border-[var(--border)] rounded-xl sm:rounded-2xl shadow-xs relative">
      {/* Left: Play/Pause button + Active Sounds Pill */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onTogglePlay}
          onTouchStart={handleTouchUnlock}
          className={`px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-xs flex items-center gap-1.5 sm:gap-2 transition shadow-md ${
            isPlaying
              ? 'bg-rose-500 hover:bg-rose-600 text-white'
              : 'bg-[var(--accent)] hover:opacity-90 text-slate-950 font-extrabold'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
              <span>Pause Mix</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-slate-950" />
              <span>Start Ambient Mix</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isPlaying && activeCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <span className="text-[10px] sm:text-xs font-mono text-[var(--ink-muted)]">
            {activeCount} {activeCount === 1 ? 'channel' : 'channels'} active
          </span>
        </div>
      </div>

      {/* Center: Visualizer Mode Selector - Always visible */}
      <div className="flex items-center gap-0.5 sm:gap-1 bg-[var(--paper-elevated)] p-0.5 sm:p-1 rounded-lg sm:rounded-xl">
        <button
          onClick={() => onVisualizerModeChange('wave')}
          onTouchStart={handleTouchUnlock}
          className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-md sm:rounded-lg transition ${
            visualizerMode === 'wave' ? 'bg-[var(--accent)] text-slate-950 font-bold' : 'text-[var(--ink-muted)] hover:text-white'
          }`}
        >
          Waveform
        </button>
        <button
          onClick={() => onVisualizerModeChange('bars')}
          onTouchStart={handleTouchUnlock}
          className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-md sm:rounded-lg transition ${
            visualizerMode === 'bars' ? 'bg-[var(--accent)] text-slate-950 font-bold' : 'text-[var(--ink-muted)] hover:text-white'
          }`}
        >
          Spectrum
        </button>
        <button
          onClick={() => onVisualizerModeChange('radial')}
          onTouchStart={handleTouchUnlock}
          className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-md sm:rounded-lg transition ${
            visualizerMode === 'radial' ? 'bg-[var(--accent)] text-slate-950 font-bold' : 'text-[var(--ink-muted)] hover:text-white'
          }`}
        >
          Zen Ripple
        </button>
      </div>

      {/* Right: Master Volume Slider & Master Mute */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleMute}
          onTouchStart={handleTouchUnlock}
          className={`p-1.5 sm:p-2 rounded-lg transition ${
            isMuted
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'bg-[var(--paper-elevated)] text-[var(--ink-muted)] hover:text-white'
          }`}
          title={isMuted ? 'Unmute master' : 'Mute master'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 w-24 sm:w-36">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : masterVolume}
            onChange={e => onMasterVolumeChange(parseFloat(e.target.value))}
            onTouchStart={handleTouchUnlock}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-[10px] sm:text-[11px] font-mono-tabular text-[var(--ink-muted)] w-7 sm:w-8 text-right">
            {isMuted ? '0%' : `${Math.round(masterVolume * 100)}%`}
          </span>
        </div>
      </div>
    </div>
  );
};
