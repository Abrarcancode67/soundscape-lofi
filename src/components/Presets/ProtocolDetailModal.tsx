import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CuratedPreset } from '../../types/soundscape';
import { Brain, X, Sparkles, Check, Play, Info, Activity, ShieldCheck, Heart } from 'lucide-react';

interface ProtocolDetailModalProps {
  preset: CuratedPreset | null;
  onClose: () => void;
  onActivate: (preset: CuratedPreset) => void;
  isActive: boolean;
}

const SCIENTIFIC_DOSSIER: Record<string, {
  targetWave: string;
  frequencyRange: string;
  neurotransmitter: string;
  biologicalMechanism: string;
  clinicalImpact: string;
}> = {
  clear_brain_fog: {
    targetWave: 'Gamma Band Synchronization',
    frequencyRange: '40.0 Hz (Isochronic Pulse) + 14.0 Hz (Beta Wave)',
    neurotransmitter: 'Acetylcholine & Dopamine optimization',
    biologicalMechanism: 'Synchronizes fast-spiking parvalbumin-positive GABAergic interneurons across frontoparietal networks, driving cortical coherence and cognitive information binding.',
    clinicalImpact: 'Dispels brain fog, elevates perceptual processing speed, and stabilizes working memory retention during high-demand analytical tasks.'
  },
  cortisol_reduction: {
    targetWave: 'Vagal Parasympathetic Tone',
    frequencyRange: '528 Hz (Solfeggio Transformation) + 174 Hz (Sub-harmonic)',
    neurotransmitter: 'Endorphin surge & Cortisol suppression',
    biologicalMechanism: 'Stimulates the auricular branch of the vagus nerve (ABVN), attenuating hypothalamic-pituitary-adrenal (HPA) axis overdrive and reducing salivary cortisol markers.',
    clinicalImpact: 'Dissolves acute autonomic fight-or-flight tension, promotes vascular relaxation, and restores emotional equanimity.'
  },
  adhd_hyperfocus: {
    targetWave: 'Stochastic Resonance & Gamma Sync',
    frequencyRange: 'Brownian Random Walk + 40 Hz Gamma Phase Locking',
    neurotransmitter: 'Tonic Dopamine elevation in prefrontal cortex',
    biologicalMechanism: 'Brown noise generates optimal background acoustic variance (Stochastic Resonance), raising sensory threshold signals above internal neural noise and suppressing spontaneous distraction loops.',
    clinicalImpact: 'Locks attention on single-focus tasks for individuals with ADHD or executive function fatigue, creating an impenetrable acoustic barrier.'
  },
  cognitive_renewal: {
    targetWave: 'Schumann Fundamental Resonance',
    frequencyRange: '7.83 Hz (Earth Ionospheric Cavity Invariant)',
    neurotransmitter: 'Serotonin & Melatonin pre-cursor balancing',
    biologicalMechanism: 'Entrains thalamocortical projections to the geomagnetic Schumann baseline, stabilizing circadian rhythm generators and cellular homeostatic regeneration.',
    clinicalImpact: 'Alleviates mental depletion from digital screen fatigue and sensory overstimulation, facilitating rapid cognitive reset.'
  },
  rapid_sleep: {
    targetWave: 'Slow-Wave Delta Induction',
    frequencyRange: '2.5 Hz (Deep Stage-3/4 Non-REM Sleep)',
    neurotransmitter: 'GABA release & Adenosine accumulation',
    biologicalMechanism: 'Drives synchronization of cortical slow-wave oscillations (SWO), inhibiting ascending reticular activating arousal pathways and accelerating sleep onset latency.',
    clinicalImpact: 'Shortens sleep latency by up to 60%, suppresses intrusive pre-sleep rumination, and fosters uninterrupted physical cell repair.'
  },
  deep_delta_somnolence: {
    targetWave: 'Stage 3/4 NREM Slow-Wave Delta & Sleep Spindle Architecture',
    frequencyRange: '1.5 Hz – 2.0 Hz (Exact 1.8 Hz Delta Binaural Beat) + 1.2 kHz Pink Noise',
    neurotransmitter: 'Growth Hormone secretion & Somatostatin upregulation',
    biologicalMechanism: 'Generates synchronous 1.8 Hz bilateral thalamocortical slow-wave oscillations. Clinical polysomnography associates slow-wave delta with deep restorative NREM Stage 3 sleep, cellular macromolecular repair, and glymphatic clearance. Continuous pink noise stabilizes sleep spindles and enhances delta amplitude.',
    clinicalImpact: 'Maximizes Stage 3 slow-wave sleep depth, dramatically minimizes nocturnal micro-awakenings, optimizes muscle recovery, and restores morning neural vitality. Automatically arms a 45-minute sleep timer with a 60-second exponential fade to silence.'
  },
  deep_focus: {
    targetWave: 'Alpha Rhythm Flow State',
    frequencyRange: '10.0 Hz (Peak Relaxed Alertness)',
    neurotransmitter: 'Norepinephrine regulation & Calm focus',
    biologicalMechanism: 'Fosters balanced 10Hz occipitoparietal alpha power, preventing mind wandering while maintaining effortless cognitive flow.',
    clinicalImpact: 'Facilitates sustained deep work blocks without cognitive strain or burnout.'
  },
  rainy_midnight: {
    targetWave: 'Acoustic White-Noise Masking',
    frequencyRange: 'Pink/Brown Spectrum with Sub-bass Thunder',
    neurotransmitter: 'GABAergic relaxation',
    biologicalMechanism: 'Continuous cascading droplet wash masks jarring transient sound spikes in the environment, stabilizing auditory sensory cortex thresholds.',
    clinicalImpact: 'Eliminates startling background disturbances and induces a deeply comforting shelter acoustic shield.'
  },
  cozy_campfire: {
    targetWave: 'Evolutionary Ancestral Safety Cue',
    frequencyRange: 'Warm Brown Rumble + Poisson Pop Distribution',
    neurotransmitter: 'Oxytocin & Social comfort signalling',
    biologicalMechanism: 'Evolutionarily conserved primal auditory markers associated with nocturnal warmth, campfire shelter, and pack safety.',
    clinicalImpact: 'Deep existential comfort and muscular relaxation.'
  },
  coastal_calm: {
    targetWave: 'Ultradian Tidal Rhythm Entrainment',
    frequencyRange: '0.08 Hz (Wave Swell Cycle) + 6.0 Hz (Theta Drift)',
    neurotransmitter: 'Endogenous opioid release',
    biologicalMechanism: 'Phase-locks respiration rate to oceanic periodicity, activating the baroreflex and decelerating heart rate variability toward calm rest.',
    clinicalImpact: 'Promotes introspective creative thought and spontaneous insight.'
  },
  coffee_vinyl: {
    targetWave: 'Stochastic Low-Pass Social Ambiance',
    frequencyRange: '33-RPM Vinyl Static + Muffled Speech Spectrum',
    neurotransmitter: 'Dopaminergic ambient comfort',
    biologicalMechanism: 'Recreates the moderate 70dB ambient noise sweet spot demonstrated to enhance abstract cognitive processing and creativity.',
    clinicalImpact: 'Ideal for writing, creative ideation, and relaxed reading.'
  }
};

export const ProtocolDetailModal: React.FC<ProtocolDetailModalProps> = ({
  preset,
  onClose,
  onActivate,
  isActive
}) => {
  // Prevent background scrolling & dismiss on Escape key
  useEffect(() => {
    if (!preset) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [preset, onClose]);

  if (!preset) return null;

  const dossier = SCIENTIFIC_DOSSIER[preset.id] || {
    targetWave: 'Multi-Sensory Audio Masking',
    frequencyRange: 'Procedural Acoustic Synthesis',
    neurotransmitter: 'Balanced Neuromodulation',
    biologicalMechanism: 'Combines procedural sound nodes to mask cognitive distractions and harmonize autonomic nervous system response.',
    clinicalImpact: 'Elevates sustained focus, reduces environmental noise distraction, and fosters mental clarity.'
  };

  const channelEntries = Object.entries(preset.channels);

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto bg-black/60 backdrop-blur-sm pt-4 px-3 pb-8 sm:pt-10 md:pt-14 sm:px-4 sm:pb-12 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-modal-title"
    >
      <div 
        className="relative w-full max-w-xl mx-auto my-0 max-h-[85vh] flex flex-col bg-[var(--paper-card)] border border-[var(--border)] rounded-2xl sm:rounded-3xl shadow-2xl ring-1 ring-white/10 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar (Sticky Top) */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur z-10 p-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <span className="text-2xl sm:text-3xl p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-[var(--paper-card)] border border-[var(--border)] shadow-xs shrink-0">
              {preset.icon}
            </span>
            <div className="min-w-0 truncate">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[9px] sm:text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 shrink-0">
                  {preset.category === 'neuro' ? 'Neuroscience Protocol' : 'Acoustic Environment'}
                </span>
                {isActive && (
                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Currently Active
                  </span>
                )}
              </div>
              <h3 id="dossier-modal-title" className="text-base sm:text-lg font-bold text-white mt-0.5 font-serif-heading truncate">
                {preset.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dossier modal"
            className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5 text-xs text-[var(--ink)]">
          {/* Target Frequency & Neurotransmitter Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[var(--paper-elevated)] border border-[var(--border)] space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[var(--ink-muted)] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-violet-400" />
                <span>Target Brainwave Band</span>
              </span>
              <div className="text-xs sm:text-sm font-bold text-[var(--ink)]">
                {dossier.targetWave}
              </div>
              <div className="text-[10px] sm:text-[11px] font-mono text-[var(--accent)] font-semibold">
                {dossier.frequencyRange}
              </div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-[var(--paper-elevated)] border border-[var(--border)] space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[var(--ink-muted)] flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Neurochemical Impact</span>
              </span>
              <div className="text-xs sm:text-sm font-bold text-[var(--ink)]">
                {dossier.neurotransmitter}
              </div>
              <div className="text-[10px] sm:text-[11px] text-[var(--ink-muted)]">
                Systemic autonomic stabilization
              </div>
            </div>
          </div>

          {/* Biological Mechanism Section */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--paper-elevated)] border border-[var(--border)] space-y-1.5 sm:space-y-2">
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5 font-mono">
              <Brain className="w-4 h-4" />
              <span>Biological Rationale & Mechanism</span>
            </div>
            <p className="text-[11px] sm:text-xs leading-relaxed text-[var(--ink)]">
              {dossier.biologicalMechanism}
            </p>
          </div>

          {/* Clinical & Real-world Outcome */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--paper-elevated)] border border-[var(--border)] space-y-1.5 sm:space-y-2">
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Cognitive & Wellness Outcome</span>
            </div>
            <p className="text-[11px] sm:text-xs leading-relaxed text-[var(--ink)]">
              {dossier.clinicalImpact}
            </p>
          </div>

          {/* Component Channels Formulation Breakdown */}
          <div className="space-y-2">
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)] font-mono">
              Acoustic Channel Recipe ({channelEntries.length} layers)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {channelEntries.map(([channelId, conf]) => (
                <div 
                  key={channelId}
                  className="p-2 sm:p-2.5 rounded-xl bg-[var(--paper-elevated)] border border-[var(--border)] flex items-center justify-between text-xs"
                >
                  <span className="font-mono font-semibold capitalize text-slate-200 truncate pr-2">
                    {channelId.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono-tabular font-bold text-[var(--accent)]">
                      {Math.round((conf?.volume || 0) * 100)}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {conf?.pan === 0 ? 'C' : (conf?.pan || 0) < 0 ? `L${Math.abs(Math.round((conf?.pan || 0) * 100))}` : `R${Math.round((conf?.pan || 0) * 100)}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-3.5 sm:p-4 border-t border-[var(--border)] bg-[var(--paper-elevated)] flex items-center justify-end gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold text-[var(--ink-muted)] hover:text-white transition"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              onActivate(preset);
              onClose();
            }}
            className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>{isActive ? 'Re-Apply Recipe' : 'Activate This Protocol'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
