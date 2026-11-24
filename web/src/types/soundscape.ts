/**
 * Type definitions for SoundScape Lo-Fi — Ambient Focus & Noise Mixer
 */

export type ChannelCategory = 'noise' | 'nature' | 'ambience' | 'neuro';

export type ChannelId = 
  // [NOISE & DRONES] (6)
  | 'brown_noise'
  | 'pink_noise'
  | 'white_noise'
  | 'blue_noise'
  | 'green_noise'
  | 'sub_bass'
  // [NATURE & WEATHER] (8)
  | 'rain_leaves'
  | 'heavy_downpour'
  | 'thunder'
  | 'campfire'
  | 'ocean'
  | 'stream'
  | 'wind'
  | 'crickets'
  // [AMBIENCE & URBAN] (5)
  | 'coffee_shop'
  | 'vinyl'
  | 'train'
  | 'airplane'
  | 'clock'
  // [NEUROSCIENCE & HARMONICS] (5)
  | 'tibetan_bowl'
  | 'gamma_pulse'
  | 'solfeggio_528'
  | 'binaural'
  | 'delta_sleep';

export interface SoundChannelState {
  id: ChannelId;
  name: string;
  category: ChannelCategory;
  icon: string;
  description: string;
  volume: number; // 0 to 1
  pan: number; // -1 (left) to 1 (right)
  muted: boolean;
  solo: boolean;
  active: boolean; // volume > 0 && !muted
  color: string;
  customOptions?: {
    binauralCarrier?: number; // e.g. 216Hz
    binauralBeat?: number; // e.g. 10Hz (Alpha)
    binauralMode?: 'binaural' | 'isochronic';
    solfeggioFreq?: number; // e.g. 528Hz, 432Hz, 174Hz
    gammaPulseRate?: number; // e.g. 40Hz
    thunderIntensity?: 'ambient' | 'distant' | 'direct';
    subBassFreq?: number; // e.g. 43.65Hz for F1
    deltaFreq?: number; // e.g. 1.8Hz
  };
}

export interface CuratedPreset {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  category: 'environment' | 'neuro';
  channels: Partial<Record<ChannelId, { volume: number; pan?: number }>>;
  binauralSettings?: {
    carrier: number;
    beat: number;
    mode: 'binaural' | 'isochronic';
  };
  sleepTimerMinutes?: number;
  sleepFadeSeconds?: number;
}

export interface CustomMix {
  id: string;
  name: string;
  createdAt: string;
  channels: Record<string, { volume: number; pan: number; muted: boolean }>;
  binauralSettings?: {
    carrier: number;
    beat: number;
    mode: 'binaural' | 'isochronic';
  };
}

export type TimerType = 'none' | 'pomodoro_work' | 'pomodoro_break' | 'sleep';

export type VisualizerMode = 'wave' | 'bars' | 'radial';
