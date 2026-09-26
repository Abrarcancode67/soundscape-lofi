/**
 * Pure Synthetic Web Audio Engine for SoundScape Lo-Fi
 * 100% Client-side procedural acoustic modeling for 23 ambient & neuro channels.
 * Zero external audio files or streaming CDNs.
 */

import { ChannelId } from '../types/soundscape';

interface ChannelAudioNodes {
  gainNode: GainNode;
  pannerNode: StereoPannerNode;
  sourceNode?: AudioNode;
  extraNodes?: AudioNode[];
  cleanup?: () => void;
}

export class SoundScapeAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private channels: Map<ChannelId, ChannelAudioNodes> = new Map();
  private isMuted: boolean = false;
  private masterVolume: number = 0.8;
  private isRunning: boolean = false;

  // Thunder state & listeners
  private thunderTimer: any = null;
  private thunderGain: GainNode | null = null;
  private thunderVolume: number = 0;
  private thunderListeners: Set<(intensity: 'direct' | 'distant' | 'ambient') => void> = new Set();

  // Binaural state
  private binauralCarrier: number = 216;
  private binauralBeat: number = 10; // Alpha
  private binauralMode: 'binaural' | 'isochronic' = 'binaural';

  // Solfeggio state
  private solfeggioFreq: number = 528;

  // Gamma state
  private gammaPulseRate: number = 40;

  // Sub-bass state (43.65Hz for F1 sleep resonant grounding or 55Hz default)
  private subBassFreq: number = 55;

  constructor() {}

  public async initAudioContext(): Promise<boolean> {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.85;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.isRunning = true;
    return true;
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  public async resumeContext(): Promise<void> {
    if (!this.ctx) {
      await this.initAudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (e) {
        console.warn('AudioContext resume error:', e);
      }
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public setMasterVolume(vol: number, smooth: boolean = true) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      const target = this.isMuted ? 0 : this.masterVolume;
      if (smooth) {
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.linearRampToValueAtTime(target, now + 0.05);
      } else {
        this.masterGain.gain.setValueAtTime(target, now);
      }
    }
  }

  public toggleMasterMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setMasterVolume(this.masterVolume);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public onThunderStrike(listener: (intensity: 'direct' | 'distant' | 'ambient') => void): () => void {
    this.thunderListeners.add(listener);
    return () => {
      this.thunderListeners.delete(listener);
    };
  }

  public async start() {
    await this.initAudioContext();
    this.isRunning = true;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : this.masterVolume, now + 0.1);
    }
    // Resume thunder interval if thunder is enabled (gentle immediate roll on playback start)
    if (this.thunderVolume > 0 && !this.thunderTimer) {
      this.startThunderInterval(true);
    }
  }

  public pause() {
    this.isRunning = false;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(0, now + 0.15);
    }
    if (this.thunderTimer) {
      clearTimeout(this.thunderTimer);
      this.thunderTimer = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Channel Routing & Control
  // ---------------------------------------------------------------------------
  private getOrCreateChannelNodes(channelId: ChannelId): ChannelAudioNodes {
    if (!this.ctx || !this.masterGain) {
      throw new Error('AudioContext not initialized');
    }

    if (this.channels.has(channelId)) {
      return this.channels.get(channelId)!;
    }

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);

    const pannerNode = this.ctx.createStereoPanner();
    pannerNode.pan.setValueAtTime(0, this.ctx.currentTime);

    gainNode.connect(pannerNode);
    pannerNode.connect(this.masterGain);

    const nodes: ChannelAudioNodes = { gainNode, pannerNode };
    this.channels.set(channelId, nodes);

    // Setup procedural audio source
    this.setupChannelSource(channelId, nodes);

    return nodes;
  }

  public setChannelVolume(channelId: ChannelId, volume: number) {
    // Track volume state even if context is not yet initialized
    if (channelId === 'thunder') {
      const prevVolume = this.thunderVolume;
      this.thunderVolume = volume;
      if (volume > 0 && this.isRunning && this.ctx) {
        if (!this.thunderTimer || prevVolume <= 0) {
          // Immediately schedule an initial thunder roll/strike on activation!
          this.startThunderInterval(true);
        }
      } else if (volume <= 0 && this.thunderTimer) {
        clearTimeout(this.thunderTimer);
        this.thunderTimer = null;
      }
    }

    if (!this.ctx || !this.masterGain) return;
    const nodes = this.getOrCreateChannelNodes(channelId);
    const now = this.ctx.currentTime;
    
    // Perceptual exponential gain curve (v^1.8)
    const expGain = volume <= 0 ? 0 : Math.pow(volume, 1.8);
    nodes.gainNode.gain.cancelScheduledValues(now);
    nodes.gainNode.gain.linearRampToValueAtTime(expGain, now + 0.08);
  }

  public setChannelPan(channelId: ChannelId, pan: number) {
    if (!this.ctx) return;
    const nodes = this.getOrCreateChannelNodes(channelId);
    const now = this.ctx.currentTime;
    nodes.pannerNode.pan.cancelScheduledValues(now);
    nodes.pannerNode.pan.linearRampToValueAtTime(Math.max(-1, Math.min(1, pan)), now + 0.05);
  }

  public updateBinauralSettings(carrier: number, beat: number, mode: 'binaural' | 'isochronic') {
    this.binauralCarrier = carrier;
    this.binauralBeat = beat;
    this.binauralMode = mode;

    if (this.channels.has('binaural')) {
      const nodes = this.channels.get('binaural')!;
      if (nodes.cleanup) nodes.cleanup();
      this.setupChannelSource('binaural', nodes);
    }
  }

  public updateSolfeggio(freq: number) {
    this.solfeggioFreq = freq;
    if (this.channels.has('solfeggio_528')) {
      const nodes = this.channels.get('solfeggio_528')!;
      if (nodes.cleanup) nodes.cleanup();
      this.setupChannelSource('solfeggio_528', nodes);
    }
  }

  public updateGammaPulseRate(rate: number) {
    this.gammaPulseRate = rate;
    if (this.channels.has('gamma_pulse')) {
      const nodes = this.channels.get('gamma_pulse')!;
      if (nodes.cleanup) nodes.cleanup();
      this.setupChannelSource('gamma_pulse', nodes);
    }
  }

  public updateSubBass(freq: number) {
    this.subBassFreq = freq;
    if (this.channels.has('sub_bass')) {
      const nodes = this.channels.get('sub_bass')!;
      if (nodes.cleanup) nodes.cleanup();
      this.setupChannelSource('sub_bass', nodes);
    }
  }

  // ---------------------------------------------------------------------------
  // Loop buffer generator helper
  // ---------------------------------------------------------------------------
  private createLoopingBuffer(durationSec: number, generator: (i: number, len: number, sr: number) => number): AudioBuffer {
    const sr = this.ctx!.sampleRate;
    const len = Math.floor(sr * durationSec);
    const buf = this.ctx!.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);

    for (let i = 0; i < len; i++) {
      data[i] = generator(i, len, sr);
    }

    // 0.12s linear crossfade at loop boundary
    const crossfade = Math.floor(sr * 0.12);
    for (let i = 0; i < crossfade; i++) {
      const ratio = i / crossfade;
      const endIdx = len - crossfade + i;
      const startSample = data[i];
      const endSample = data[endIdx];
      data[i] = startSample * ratio + endSample * (1 - ratio);
      data[endIdx] = data[i];
    }

    return buf;
  }

  // ---------------------------------------------------------------------------
  // 23 Procedural Channel Synthesizers
  // ---------------------------------------------------------------------------
  private setupChannelSource(channelId: ChannelId, nodes: ChannelAudioNodes) {
    if (!this.ctx) return;

    switch (channelId) {
      // [NOISE & DRONES]
      case 'brown_noise': this.setupBrownNoise(nodes); break;
      case 'pink_noise': this.setupPinkNoise(nodes); break;
      case 'white_noise': this.setupWhiteNoise(nodes); break;
      case 'blue_noise': this.setupBlueNoise(nodes); break;
      case 'green_noise': this.setupGreenNoise(nodes); break;
      case 'sub_bass': this.setupSubBassDrone(nodes); break;

      // [NATURE & WEATHER]
      case 'rain_leaves': this.setupRainLeaves(nodes); break;
      case 'heavy_downpour': this.setupHeavyDownpour(nodes); break;
      case 'thunder': this.setupThunder(nodes); break;
      case 'campfire': this.setupCampfire(nodes); break;
      case 'ocean': this.setupOceanWaves(nodes); break;
      case 'stream': this.setupStream(nodes); break;
      case 'wind': this.setupWind(nodes); break;
      case 'crickets': this.setupCrickets(nodes); break;

      // [AMBIENCE & URBAN]
      case 'coffee_shop': this.setupCoffeeShop(nodes); break;
      case 'vinyl': this.setupVinyl(nodes); break;
      case 'train': this.setupTrain(nodes); break;
      case 'airplane': this.setupAirplane(nodes); break;
      case 'clock': this.setupClock(nodes); break;

      // [NEUROSCIENCE & HARMONICS]
      case 'tibetan_bowl': this.setupTibetanBowl(nodes); break;
      case 'gamma_pulse': this.setupGammaPulse(nodes); break;
      case 'solfeggio_528': this.setupSolfeggio(nodes); break;
      case 'binaural': this.setupBinaural(nodes); break;
      case 'delta_sleep': this.setupDeltaSleepSync(nodes); break;
    }
  }

  // 1. Brown Noise
  private setupBrownNoise(nodes: ChannelAudioNodes) {
    let lastOut = 0.0;
    const buffer = this.createLoopingBuffer(6, () => {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      return lastOut * 3.5;
    });

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(520, this.ctx!.currentTime);

    source.connect(filter);
    filter.connect(nodes.gainNode);
    source.start();

    nodes.sourceNode = source;
    nodes.cleanup = () => { try { source.stop(); } catch {} source.disconnect(); };
  }

  // 2. Pink Noise (1/f spectral density)
  private setupPinkNoise(nodes: ChannelAudioNodes) {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    const buffer = this.createLoopingBuffer(6, () => {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const out = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
      return out;
    });

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Smooth low-pass filter at 1.2kHz for soft, non-fatiguing acoustic masking
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx!.currentTime);
    filter.Q.setValueAtTime(0.7, this.ctx!.currentTime);

    source.connect(filter);
    filter.connect(nodes.gainNode);
    source.start();

    nodes.sourceNode = source;
    nodes.extraNodes = [filter];
    nodes.cleanup = () => {
      try { source.stop(); } catch {}
      source.disconnect();
      filter.disconnect();
    };
  }

  // 3. White Noise
  private setupWhiteNoise(nodes: ChannelAudioNodes) {
    const buffer = this.createLoopingBuffer(5, () => Math.random() * 2 - 1);
    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(250, this.ctx!.currentTime);

    source.connect(filter);
    filter.connect(nodes.gainNode);
    source.start();

    nodes.sourceNode = source;
    nodes.cleanup = () => { try { source.stop(); } catch {} source.disconnect(); };
  }

  // 4. Blue Noise (+3dB/octave high-frequency focused hiss)
  private setupBlueNoise(nodes: ChannelAudioNodes) {
    let lastSample = 0;
    const buffer = this.createLoopingBuffer(5, () => {
      const white = Math.random() * 2 - 1;
      const out = white - lastSample;
      lastSample = white;
      return out * 0.5;
    });

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, this.ctx!.currentTime);

    source.connect(filter);
    filter.connect(nodes.gainNode);
    source.start();

    nodes.sourceNode = source;
    nodes.cleanup = () => { try { source.stop(); } catch {} source.disconnect(); };
  }

  // 5. Green Noise (Mid-frequency 500Hz natural ambiance bandpass)
  private setupGreenNoise(nodes: ChannelAudioNodes) {
    let b0 = 0, b1 = 0, b2 = 0;
    const buffer = this.createLoopingBuffer(6, () => {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099;
      b1 = 0.96300 * b1 + white * 0.296;
      b2 = 0.57000 * b2 + white * 1.052;
      return (b0 + b1 + b2) * 0.12;
    });

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, this.ctx!.currentTime);
    filter.Q.setValueAtTime(1.1, this.ctx!.currentTime);

    source.connect(filter);
    filter.connect(nodes.gainNode);
    source.start();

    nodes.sourceNode = source;
    nodes.cleanup = () => { try { source.stop(); } catch {} source.disconnect(); };
  }

  // 6. Sub-Bass Drone (grounding sine with subtle harmonic, default 55Hz or 43.65Hz F1 sleep tone)
  private setupSubBassDrone(nodes: ChannelAudioNodes) {
    const baseFreq = this.subBassFreq || 55;
    const osc1 = this.ctx!.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, this.ctx!.currentTime);

    const osc2 = this.ctx!.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 2 + 0.15, this.ctx!.currentTime); // Harmonic with 0.15Hz detune for beating

    const g1 = this.ctx!.createGain();
    g1.gain.setValueAtTime(0.7, this.ctx!.currentTime);

    const g2 = this.ctx!.createGain();
    g2.gain.setValueAtTime(0.25, this.ctx!.currentTime);

    osc1.connect(g1);
    osc2.connect(g2);
    g1.connect(nodes.gainNode);
    g2.connect(nodes.gainNode);

    osc1.start();
    osc2.start();

    nodes.cleanup = () => {
      try { osc1.stop(); osc2.stop(); } catch {}
      osc1.disconnect(); osc2.disconnect();
    };
  }

  // 7. Rain on Leaves (Crisp high-frequency foliage droplet taps)
  private setupRainLeaves(nodes: ChannelAudioNodes) {
    const buffer = this.createLoopingBuffer(6, () => {
      let sample = (Math.random() * 2 - 1) * 0.08;
      // High frequency droplet impact spikes
      if (Math.random() > 0.992) {
        sample += (Math.random() * 2 - 1) * 0.9;
      }
      return sample;
    });

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bp = this.ctx!.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(2400, this.ctx!.currentTime);
    bp.Q.setValueAtTime(1.4, this.ctx!.currentTime);

    source.connect(bp);
    bp.connect(nodes.gainNode);
    source.start();

    nodes.sourceNode = source;
    nodes.cleanup = () => { try { source.stop(); } catch {} source.disconnect(); };
  }

  // 8. Heavy Downpour (Dense cascading rainfall + splashing wash)
  private setupHeavyDownpour(nodes: ChannelAudioNodes) {
    let b0 = 0, b1 = 0, b2 = 0;
    const buffer = this.createLoopingBuffer(8, () => {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.12;
      b1 = 0.96300 * b1 + white * 0.35;
      b2 = 0.57000 * b2 + white * 1.15;
      return (b0 + b1 + b2) * 0.15;
    });

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const lp = this.ctx!.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(3200, this.ctx!.currentTime);

    source.connect(lp);
    lp.connect(nodes.gainNode);
    source.start();

    nodes.sourceNode = source;
    nodes.cleanup = () => { try { source.stop(); } catch {} source.disconnect(); };
  }

  // 9. REALISTIC ROLLING THUNDER PHYSICAL MODELING
  private setupThunder(nodes: ChannelAudioNodes) {
    this.thunderGain = nodes.gainNode;

    // Continuous atmospheric storm bed & low-frequency sky turbulence
    // Dual-layer Brownian / Pink air turbulence filtered through resonant lowpass
    let lastOut1 = 0, lastOut2 = 0;
    const bedBuffer = this.createLoopingBuffer(8, () => {
      const white1 = Math.random() * 2 - 1;
      const white2 = Math.random() * 2 - 1;
      lastOut1 = (lastOut1 + 0.02 * white1) / 1.02;
      lastOut2 = (lastOut2 + 0.01 * white2) / 1.01;
      return lastOut1 * 1.8 + lastOut2 * 1.2;
    });

    const bedSource = this.ctx!.createBufferSource();
    bedSource.buffer = bedBuffer;
    bedSource.loop = true;

    // Resonant lowpass filter to capture atmospheric pressure rumble (50Hz - 160Hz)
    const bedFilter = this.ctx!.createBiquadFilter();
    bedFilter.type = 'lowpass';
    bedFilter.frequency.setValueAtTime(115, this.ctx!.currentTime);
    bedFilter.Q.setValueAtTime(2.0, this.ctx!.currentTime);

    // Slow atmospheric rolling LFO (0.08Hz) modulating the filter frequency
    const bedLfo = this.ctx!.createOscillator();
    bedLfo.type = 'sine';
    bedLfo.frequency.setValueAtTime(0.08, this.ctx!.currentTime);

    const bedLfoGain = this.ctx!.createGain();
    bedLfoGain.gain.setValueAtTime(45, this.ctx!.currentTime); // Modulates 115Hz +/- 45Hz (70Hz to 160Hz)

    bedLfo.connect(bedLfoGain);
    bedLfoGain.connect(bedFilter.frequency);

    // Bed volume gain (gentle atmospheric carpet so the channel is alive between strikes)
    const bedGain = this.ctx!.createGain();
    bedGain.gain.setValueAtTime(0.40, this.ctx!.currentTime);

    bedSource.connect(bedFilter);
    bedFilter.connect(bedGain);
    bedGain.connect(nodes.gainNode);

    bedSource.start();
    bedLfo.start();

    nodes.sourceNode = bedSource;
    nodes.extraNodes = [bedFilter, bedLfo, bedLfoGain, bedGain];
    nodes.cleanup = () => {
      try {
        bedSource.stop();
        bedLfo.stop();
      } catch {}
      bedSource.disconnect();
      bedLfo.disconnect();
      bedFilter.disconnect();
      bedGain.disconnect();
    };
  }

  public startThunderInterval(immediateFirst: boolean = false) {
    if (this.thunderTimer) {
      clearTimeout(this.thunderTimer);
      this.thunderTimer = null;
    }

    const triggerNext = (isFirst: boolean) => {
      // If it's the very first trigger after enabling or preset switch, fire quickly within 800ms - 1500ms
      const delayMs = isFirst 
        ? Math.floor(Math.random() * 700) + 800 
        : Math.floor(Math.random() * 24000) + 18000; // 18s to 42s

      this.thunderTimer = setTimeout(() => {
        if (!this.isRunning || this.thunderVolume <= 0) return;
        
        // Randomize intensity based on natural distribution
        const rand = Math.random();
        const intensity: 'direct' | 'distant' | 'ambient' = rand < 0.35 
          ? 'direct' 
          : rand < 0.78 
          ? 'distant' 
          : 'ambient';

        this.triggerThunderStrike(intensity);
        triggerNext(false);
      }, delayMs);
    };

    triggerNext(immediateFirst);
  }

  public async triggerThunderStrike(intensity: 'direct' | 'distant' | 'ambient' = 'direct') {
    // 1. Ensure AudioContext is ready and resumed
    if (!this.ctx) {
      await this.initAudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    if (!this.ctx || !this.masterGain) return;

    // 2. Ensure thunder channel audio nodes exist
    const thunderNodes = this.getOrCreateChannelNodes('thunder');
    this.thunderGain = thunderNodes.gainNode;

    // 3. Notify UI listeners immediately
    this.thunderListeners.forEach(cb => {
      try { cb(intensity); } catch (e) { console.error(e); }
    });

    // 4. Reschedule periodic strike timer if channel is active so manual strikes don't collide with periodic timer
    if (this.thunderVolume > 0 && this.isRunning && this.thunderTimer) {
      this.startThunderInterval(false);
    }

    const now = this.ctx.currentTime;
    const isDirect = intensity === 'direct';
    const isDistant = intensity === 'distant';

    // Track all nodes created during this strike for full lifecycle cleanup
    const tempStrikeNodes: AudioNode[] = [];

    // Output target: connect to thunder channel's gain node, 
    // AND if thunder channel volume is currently set to 0 or muted,
    // audition through a dedicated audition gain to masterGain so the manual click is never silent!
    const strikeDest = this.ctx.createGain();
    strikeDest.gain.setValueAtTime(1.0, now);
    strikeDest.connect(this.thunderGain);
    tempStrikeNodes.push(strikeDest);

    if (this.thunderVolume <= 0.01) {
      const auditionGain = this.ctx.createGain();
      auditionGain.gain.setValueAtTime(0.75, now);
      auditionGain.connect(this.masterGain);
      strikeDest.connect(auditionGain);
      tempStrikeNodes.push(auditionGain);
    }

    // -------------------------------------------------------------
    // LAYER A: Pre-rumble & Sharp Lightning Discharge Crack
    // -------------------------------------------------------------
    const strikeTime = now + (isDirect ? 0.12 : isDistant ? 0.18 : 0.08);

    // Pre-rumble swell before the strike
    const preRumbleDur = strikeTime - now;
    if (preRumbleDur > 0.02) {
      const preBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.25), this.ctx.sampleRate);
      const preData = preBuffer.getChannelData(0);
      let pLast = 0;
      for (let i = 0; i < preData.length; i++) {
        const white = Math.random() * 2 - 1;
        pLast = (pLast + 0.04 * white) / 1.04;
        const progress = i / preData.length;
        preData[i] = pLast * Math.pow(progress, 2) * 1.5;
      }
      const preSource = this.ctx.createBufferSource();
      preSource.buffer = preBuffer;
      const preFilter = this.ctx.createBiquadFilter();
      preFilter.type = 'lowpass';
      preFilter.frequency.setValueAtTime(180, now);
      const preGain = this.ctx.createGain();
      preGain.gain.setValueAtTime(0.35, now);
      preSource.connect(preFilter);
      preFilter.connect(preGain);
      preGain.connect(strikeDest);
      preSource.start(now);
      preSource.stop(strikeTime);
      tempStrikeNodes.push(preSource, preFilter, preGain);
    }

    // Lightning Crack: sharp electric transient (prominent on direct, gentle on distant)
    if (isDirect || isDistant) {
      const crackDur = isDirect ? 0.09 : 0.06;
      const crackBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * crackDur), this.ctx.sampleRate);
      const crackData = crackBuffer.getChannelData(0);
      const decayTime = isDirect ? 0.018 : 0.012;
      for (let i = 0; i < crackData.length; i++) {
        const t = i / this.ctx.sampleRate;
        const env = Math.exp(-t / decayTime);
        crackData[i] = (Math.random() * 2 - 1) * env;
      }
      const crackSource = this.ctx.createBufferSource();
      crackSource.buffer = crackBuffer;

      // Highpass for lightning electric snap
      const crackHp = this.ctx.createBiquadFilter();
      crackHp.type = 'highpass';
      crackHp.frequency.setValueAtTime(isDirect ? 1400 : 900, now);

      // Bandpass for mid body punch
      const crackBp = this.ctx.createBiquadFilter();
      crackBp.type = 'bandpass';
      crackBp.frequency.setValueAtTime(isDirect ? 2800 : 1600, now);
      crackBp.Q.setValueAtTime(1.8, now);

      const crackGain = this.ctx.createGain();
      crackGain.gain.setValueAtTime(0.0001, now);
      crackGain.gain.setValueAtTime(isDirect ? 1.0 : 0.45, strikeTime);
      crackGain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + crackDur);

      crackSource.connect(crackHp);
      crackHp.connect(crackBp);
      crackBp.connect(crackGain);
      crackGain.connect(strikeDest);
      crackSource.start(strikeTime);
      tempStrikeNodes.push(crackSource, crackHp, crackBp, crackGain);
    }

    // -------------------------------------------------------------
    // LAYER B: Deep Sub-bass Impact (sine sweep starting at 95Hz down to 32Hz over 350ms)
    // -------------------------------------------------------------
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    const startFreq = isDirect ? 100 : isDistant ? 80 : 68;
    subOsc.frequency.setValueAtTime(startFreq, now);
    subOsc.frequency.setValueAtTime(startFreq, strikeTime);
    subOsc.frequency.exponentialRampToValueAtTime(32, strikeTime + 0.38);

    // Harmonic presence oscillator (starts at 200Hz -> 64Hz) to ensure rich audibility on laptops & headphones!
    const harmOsc = this.ctx.createOscillator();
    harmOsc.type = 'triangle';
    harmOsc.frequency.setValueAtTime(startFreq * 2, now);
    harmOsc.frequency.setValueAtTime(startFreq * 2, strikeTime);
    harmOsc.frequency.exponentialRampToValueAtTime(64, strikeTime + 0.38);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.linearRampToValueAtTime(isDirect ? 1.0 : isDistant ? 0.75 : 0.5, strikeTime + 0.04);
    subGain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 0.85);

    const harmGain = this.ctx.createGain();
    harmGain.gain.setValueAtTime(0.0001, now);
    harmGain.gain.linearRampToValueAtTime(isDirect ? 0.35 : 0.22, strikeTime + 0.03);
    harmGain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 0.5);

    subOsc.connect(subGain);
    harmOsc.connect(harmGain);
    subGain.connect(strikeDest);
    harmGain.connect(strikeDest);

    subOsc.start(strikeTime);
    harmOsc.start(strikeTime);
    subOsc.stop(strikeTime + 0.9);
    harmOsc.stop(strikeTime + 0.6);
    tempStrikeNodes.push(subOsc, harmOsc, subGain, harmGain);

    // -------------------------------------------------------------
    // LAYER C: Rolling Tail & Reverberation (Brown noise with sweeping LPF + ping-pong stereo echo)
    // -------------------------------------------------------------
    const tailDur = isDirect ? 7.0 : isDistant ? 5.8 : 4.5;
    const tailSampleCount = Math.floor(this.ctx.sampleRate * tailDur);
    const tailBuffer = this.ctx.createBuffer(1, tailSampleCount, this.ctx.sampleRate);
    const tailData = tailBuffer.getChannelData(0);

    let brownAcc = 0;
    for (let i = 0; i < tailSampleCount; i++) {
      const white = Math.random() * 2 - 1;
      brownAcc = (brownAcc + 0.03 * white) / 1.03;
      const t = i / this.ctx.sampleRate;
      
      // Multi-wave reflections: primary crash, secondary cloud reflection (~1.5s), tertiary mountain echo (~3.1s)
      const roll1 = Math.exp(-t * 0.65);
      const roll2 = 0.55 * Math.exp(-Math.pow((t - 1.5) / 0.65, 2));
      const roll3 = 0.35 * Math.exp(-Math.pow((t - 3.1) / 0.9, 2));
      const env = roll1 + roll2 + roll3;
      
      tailData[i] = brownAcc * 2.8 * env;
    }

    const tailSource = this.ctx.createBufferSource();
    tailSource.buffer = tailBuffer;

    // Automated sweeping low-pass filter (cutoff modulating between 180Hz and 45Hz)
    const sweepLp = this.ctx.createBiquadFilter();
    sweepLp.type = 'lowpass';
    const initCutoff = isDirect ? 180 : 130;
    sweepLp.frequency.setValueAtTime(initCutoff, now);
    sweepLp.frequency.setValueAtTime(initCutoff, strikeTime);
    sweepLp.frequency.exponentialRampToValueAtTime(45, strikeTime + tailDur);
    sweepLp.Q.setValueAtTime(2.8, now);

    const tailGain = this.ctx.createGain();
    tailGain.gain.setValueAtTime(0.0001, now);
    tailGain.gain.setValueAtTime(0.9, strikeTime);
    tailGain.gain.linearRampToValueAtTime(0.0001, strikeTime + tailDur);

    tailSource.connect(sweepLp);
    sweepLp.connect(tailGain);
    tailGain.connect(strikeDest);

    // Stereo ping-pong delay simulation (echoing between 400ms and 1800ms)
    const delayL = this.ctx.createDelay(2.5);
    delayL.delayTime.setValueAtTime(0.48, now);
    const delayR = this.ctx.createDelay(2.5);
    delayR.delayTime.setValueAtTime(0.88, now);

    // Damping filter in feedback loop to simulate atmospheric absorption of high frequencies over distance
    const dampFilter = this.ctx.createBiquadFilter();
    dampFilter.type = 'lowpass';
    dampFilter.frequency.setValueAtTime(220, now);

    const feedbackGain = this.ctx.createGain();
    feedbackGain.gain.setValueAtTime(0.38, now);

    const pannerL = this.ctx.createStereoPanner();
    pannerL.pan.setValueAtTime(-0.65, now);
    const pannerR = this.ctx.createStereoPanner();
    pannerR.pan.setValueAtTime(0.65, now);

    // Routing ping-pong delay
    sweepLp.connect(delayL);
    delayL.connect(pannerL);
    pannerL.connect(strikeDest);

    delayL.connect(dampFilter);
    dampFilter.connect(delayR);
    delayR.connect(pannerR);
    pannerR.connect(strikeDest);

    delayR.connect(feedbackGain);
    feedbackGain.connect(delayL);

    tailSource.start(strikeTime + 0.02);
    tempStrikeNodes.push(
      tailSource, sweepLp, tailGain,
      delayL, delayR, dampFilter, feedbackGain, pannerL, pannerR
    );

    // Lifecycle cleanup after reverberation completely decays
    const cleanupMs = Math.ceil((tailDur + 2.5) * 1000);
    setTimeout(() => {
      tempStrikeNodes.forEach(node => {
        try {
          if ('stop' in node && typeof (node as any).stop === 'function') {
            (node as any).stop();
          }
        } catch {}
        try {
          node.disconnect();
        } catch {}
      });
    }, cleanupMs);
  }

  // 10. Campfire
  private setupCampfire(nodes: ChannelAudioNodes) {
    let lastOut = 0;
    const buffer = this.createLoopingBuffer(8, () => {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      let s = lastOut * 1.8;
      if (Math.random() > 0.9982) s += (Math.random() * 2 - 1) * 2.2;
      return s;
    });

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bp = this.ctx!.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1800, this.ctx!.currentTime);
    bp.Q.setValueAtTime(0.8, this.ctx!.currentTime);

    source.connect(bp);
    bp.connect(nodes.gainNode);
    source.start();

    nodes.sourceNode = source;
    nodes.cleanup = () => { try { source.stop(); } catch {} source.disconnect(); };
  }

  // 11. Ocean Waves
  private setupOceanWaves(nodes: ChannelAudioNodes) {
    let b0 = 0, b1 = 0, b2 = 0;
    const buffer = this.createLoopingBuffer(10, () => {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099;
      b1 = 0.96300 * b1 + white * 0.296;
      b2 = 0.57000 * b2 + white * 1.052;
      return (b0 + b1 + b2) * 0.12;
    });

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const swellGain = this.ctx!.createGain();
    swellGain.gain.setValueAtTime(0.4, this.ctx!.currentTime);

    const lfo = this.ctx!.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, this.ctx!.currentTime);

    const lfoDepth = this.ctx!.createGain();
    lfoDepth.gain.setValueAtTime(0.35, this.ctx!.currentTime);

    lfo.connect(lfoDepth);
    lfoDepth.connect(swellGain.gain);

    const lp = this.ctx!.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(550, this.ctx!.currentTime);

    source.connect(swellGain);
    swellGain.connect(lp);
    lp.connect(nodes.gainNode);

    source.start();
    lfo.start();

    nodes.sourceNode = source;
    nodes.cleanup = () => {
      try { source.stop(); lfo.stop(); } catch {}
      source.disconnect(); lfo.disconnect();
    };
  }

  // 12. Mountain Stream
  private setupStream(nodes: ChannelAudioNodes) {
    let b0 = 0, b1 = 0;
    const buffer = this.createLoopingBuffer(6, (i, len, sr) => {
      const white = Math.random() * 2 - 1;
      b0 = 0.98 * b0 + white * 0.2;
      b1 = 0.94 * b1 + white * 0.4;
      const t = i / sr;
      const bubble = Math.sin(t * 7.5) * Math.sin(t * 13.2) * 0.4;
      return (b0 + b1) * 0.12 * (1 + bubble);
    });

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bp = this.ctx!.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(850, this.ctx!.currentTime);
    bp.Q.setValueAtTime(1.2, this.ctx!.currentTime);

    source.connect(bp);
    bp.connect(nodes.gainNode);
    source.start();

    nodes.sourceNode = source;
    nodes.cleanup = () => { try { source.stop(); } catch {} source.disconnect(); };
  }

  // 13. Wandering Wind
  private setupWind(nodes: ChannelAudioNodes) {
    let lastOut = 0;
    const buffer = this.createLoopingBuffer(8, () => {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      return lastOut * 2.5;
    });

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bp = this.ctx!.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(450, this.ctx!.currentTime);
    bp.Q.setValueAtTime(2.2, this.ctx!.currentTime);

    const lfo = this.ctx!.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx!.currentTime);
    const lfoGain = this.ctx!.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx!.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(bp.frequency);

    source.connect(bp);
    bp.connect(nodes.gainNode);

    source.start();
    lfo.start();

    nodes.sourceNode = source;
    nodes.cleanup = () => {
      try { source.stop(); lfo.stop(); } catch {}
      source.disconnect(); lfo.disconnect();
    };
  }

  // 14. Night Crickets
  private setupCrickets(nodes: ChannelAudioNodes) {
    const buffer = this.createLoopingBuffer(4, (i, len, sr) => {
      const t = i / sr;
      const cycle = t % 0.8;
      let envelope = 0;
      if (cycle < 0.06 || (cycle > 0.12 && cycle < 0.18) || (cycle > 0.24 && cycle < 0.30)) {
        envelope = Math.sin((cycle % 0.06) / 0.06 * Math.PI);
      }
      const chirp = Math.sin(2 * Math.PI * 4600 * t + Math.sin(2 * Math.PI * 80 * t));
      return chirp * envelope * 0.25;
    });

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(nodes.gainNode);
    source.start();

    nodes.sourceNode = source;
    nodes.cleanup = () => { try { source.stop(); } catch {} source.disconnect(); };
  }

  // 15. Cozy Coffee Shop (Muffled crowd murmur + subtle cup clatter transients)
  private setupCoffeeShop(nodes: ChannelAudioNodes) {
    let lastOut = 0;
    const buffer = this.createLoopingBuffer(8, (i, len, sr) => {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.03 * white) / 1.03;
      const t = i / sr;
      // Low-frequency human murmur modulation
      const murmur = (1 + 0.3 * Math.sin(t * 1.8) * Math.cos(t * 0.7));
      let sample = lastOut * 1.6 * murmur;

      // Occasional ceramic cup clatter transient
      if (Math.random() > 0.9994) {
        sample += (Math.random() * 2 - 1) * 1.4;
      }
      return sample;
    });

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const lp = this.ctx!.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(650, this.ctx!.currentTime);

    source.connect(lp);
    lp.connect(nodes.gainNode);
    source.start();

    nodes.sourceNode = source;
    nodes.cleanup = () => { try { source.stop(); } catch {} source.disconnect(); };
  }

  // 16. Vinyl Crackle (33-RPM dust pops + warm static)
  private setupVinyl(nodes: ChannelAudioNodes) {
    const buffer = this.createLoopingBuffer(5, (i, len, sr) => {
      const white = Math.random() * 2 - 1;
      let sample = white * 0.04; // Surface static hiss

      // Periodic 33-RPM dust pop (every ~1.8s)
      const t = i / sr;
      const revPhase = (t % 1.81);
      if (revPhase < 0.001 || Math.random() > 0.9985) {
        sample += (Math.random() * 2 - 1) * 0.65;
      }
      return sample;
    });

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Turntable warmth lowpass
    const lp = this.ctx!.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(4500, this.ctx!.currentTime);

    source.connect(lp);
    lp.connect(nodes.gainNode);
    source.start();

    nodes.sourceNode = source;
    nodes.cleanup = () => { try { source.stop(); } catch {} source.disconnect(); };
  }

  // 17. Train on Tracks (Rhythmic click-clack filtered transients)
  private setupTrain(nodes: ChannelAudioNodes) {
    const buffer = this.createLoopingBuffer(4, (i, len, sr) => {
      const t = i / sr;
      const beat = (t % 1.4); // Rail junction rhythm
      let impulse = 0;
      // "Click-clack... click-clack" pair
      if (beat < 0.04 || (beat > 0.12 && beat < 0.16) || (beat > 0.55 && beat < 0.59) || (beat > 0.67 && beat < 0.71)) {
        impulse = (Math.random() * 2 - 1) * 0.85;
      }
      const trackHum = Math.sin(2 * Math.PI * 65 * t) * 0.15;
      return impulse + trackHum;
    });

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bp = this.ctx!.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(380, this.ctx!.currentTime);
    bp.Q.setValueAtTime(1.8, this.ctx!.currentTime);

    source.connect(bp);
    bp.connect(nodes.gainNode);
    source.start();

    nodes.sourceNode = source;
    nodes.cleanup = () => { try { source.stop(); } catch {} source.disconnect(); };
  }

  // 18. Airplane Cabin (Broadband ventilation + 160Hz engine cabin hum)
  private setupAirplane(nodes: ChannelAudioNodes) {
    let lastOut = 0;
    const buffer = this.createLoopingBuffer(6, (i, len, sr) => {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.04 * white) / 1.04;
      const t = i / sr;
      const engineTone = (Math.sin(2 * Math.PI * 155 * t) + Math.sin(2 * Math.PI * 77.5 * t) * 0.5) * 0.12;
      return lastOut * 1.5 + engineTone;
    });

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const lp = this.ctx!.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(420, this.ctx!.currentTime);

    source.connect(lp);
    lp.connect(nodes.gainNode);
    source.start();

    nodes.sourceNode = source;
    nodes.cleanup = () => { try { source.stop(); } catch {} source.disconnect(); };
  }

  // 19. Clock Ticking (Alternating tick-tock cadence at 1Hz)
  private setupClock(nodes: ChannelAudioNodes) {
    const buffer = this.createLoopingBuffer(2, (i, len, sr) => {
      const t = i / sr;
      const sec = t % 1.0;
      let click = 0;
      if (sec < 0.008) {
        // Tick (higher pitch)
        click = Math.sin(2 * Math.PI * 1800 * sec) * Math.exp(-sec / 0.003);
      } else if (t >= 1.0 && t < 1.008) {
        // Tock (lower pitch)
        click = Math.sin(2 * Math.PI * 1400 * (t - 1.0)) * Math.exp(-(t - 1.0) / 0.003);
      }
      return click * 0.7;
    });

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(nodes.gainNode);
    source.start();

    nodes.sourceNode = source;
    nodes.cleanup = () => { try { source.stop(); } catch {} source.disconnect(); };
  }

  // 20. Tibetan Singing Bowl
  private setupTibetanBowl(nodes: ChannelAudioNodes) {
    const baseFreq = 144;
    const freqs = [baseFreq, baseFreq * 2.76, baseFreq * 5.4, baseFreq * 8.1];
    const oscs: OscillatorNode[] = [];
    const subGain = this.ctx!.createGain();
    subGain.gain.setValueAtTime(0.28, this.ctx!.currentTime);

    freqs.forEach((f, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      const detune = idx === 0 ? 0.35 : idx * 0.4;
      osc.frequency.setValueAtTime(f + detune, this.ctx!.currentTime);

      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(1 / (idx + 1.2), this.ctx!.currentTime);

      osc.connect(g);
      g.connect(subGain);
      osc.start();
      oscs.push(osc);
    });

    subGain.connect(nodes.gainNode);

    nodes.cleanup = () => {
      oscs.forEach(o => { try { o.stop(); } catch {} o.disconnect(); });
    };
  }

  // 21. 40Hz Gamma Isochronic Pulse (Entrainment pulses for focus & binding)
  private setupGammaPulse(nodes: ChannelAudioNodes) {
    const carrier = 220; // A3 soothing carrier
    const pulseRate = this.gammaPulseRate; // 40Hz

    const carrierOsc = this.ctx!.createOscillator();
    carrierOsc.type = 'sine';
    carrierOsc.frequency.setValueAtTime(carrier, this.ctx!.currentTime);

    const pulseGain = this.ctx!.createGain();
    pulseGain.gain.setValueAtTime(0.5, this.ctx!.currentTime);

    const pulseLfo = this.ctx!.createOscillator();
    pulseLfo.type = 'sine';
    pulseLfo.frequency.setValueAtTime(pulseRate, this.ctx!.currentTime);

    const pulseDepth = this.ctx!.createGain();
    pulseDepth.gain.setValueAtTime(0.48, this.ctx!.currentTime);

    pulseLfo.connect(pulseDepth);
    pulseDepth.connect(pulseGain.gain);

    carrierOsc.connect(pulseGain);
    pulseGain.connect(nodes.gainNode);

    carrierOsc.start();
    pulseLfo.start();

    nodes.cleanup = () => {
      try { carrierOsc.stop(); pulseLfo.stop(); } catch {}
      carrierOsc.disconnect(); pulseLfo.disconnect();
    };
  }

  // 22. Solfeggio 528Hz Tone (Transformation / Cortisol reduction)
  private setupSolfeggio(nodes: ChannelAudioNodes) {
    const mainFreq = this.solfeggioFreq; // 528Hz
    const baseFreq = 174; // Grounding sub-harmonic

    const oscMain = this.ctx!.createOscillator();
    oscMain.type = 'sine';
    oscMain.frequency.setValueAtTime(mainFreq, this.ctx!.currentTime);

    const oscBase = this.ctx!.createOscillator();
    oscBase.type = 'sine';
    oscBase.frequency.setValueAtTime(baseFreq, this.ctx!.currentTime);

    const gMain = this.ctx!.createGain();
    gMain.gain.setValueAtTime(0.45, this.ctx!.currentTime);

    const gBase = this.ctx!.createGain();
    gBase.gain.setValueAtTime(0.2, this.ctx!.currentTime);

    oscMain.connect(gMain);
    oscBase.connect(gBase);

    gMain.connect(nodes.gainNode);
    gBase.connect(nodes.gainNode);

    oscMain.start();
    oscBase.start();

    nodes.cleanup = () => {
      try { oscMain.stop(); oscBase.stop(); } catch {}
      oscMain.disconnect(); oscBase.disconnect();
    };
  }

  // 23. Binaural Beat Synthesizer (Carrier + beat separation)
  private setupBinaural(nodes: ChannelAudioNodes) {
    const carrier = this.binauralCarrier;
    const beat = this.binauralBeat;

    if (this.binauralMode === 'binaural') {
      const oscLeft = this.ctx!.createOscillator();
      oscLeft.type = 'sine';
      oscLeft.frequency.setValueAtTime(carrier, this.ctx!.currentTime);

      const oscRight = this.ctx!.createOscillator();
      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(carrier + beat, this.ctx!.currentTime);

      const panLeft = this.ctx!.createStereoPanner();
      panLeft.pan.setValueAtTime(-1, this.ctx!.currentTime);

      const panRight = this.ctx!.createStereoPanner();
      panRight.pan.setValueAtTime(1, this.ctx!.currentTime);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.5, this.ctx!.currentTime);

      oscLeft.connect(panLeft);
      oscRight.connect(panRight);
      panLeft.connect(gain);
      panRight.connect(gain);
      gain.connect(nodes.gainNode);

      oscLeft.start();
      oscRight.start();

      nodes.cleanup = () => {
        try { oscLeft.stop(); oscRight.stop(); } catch {}
        oscLeft.disconnect(); oscRight.disconnect();
      };
    } else {
      const carrierOsc = this.ctx!.createOscillator();
      carrierOsc.type = 'sine';
      carrierOsc.frequency.setValueAtTime(carrier, this.ctx!.currentTime);

      const pulseGain = this.ctx!.createGain();
      pulseGain.gain.setValueAtTime(0.5, this.ctx!.currentTime);

      const pulseLfo = this.ctx!.createOscillator();
      pulseLfo.type = 'sine';
      pulseLfo.frequency.setValueAtTime(beat, this.ctx!.currentTime);

      const pulseDepth = this.ctx!.createGain();
      pulseDepth.gain.setValueAtTime(0.45, this.ctx!.currentTime);

      pulseLfo.connect(pulseDepth);
      pulseDepth.connect(pulseGain.gain);

      carrierOsc.connect(pulseGain);
      pulseGain.connect(nodes.gainNode);

      carrierOsc.start();
      pulseLfo.start();

      nodes.cleanup = () => {
        try { carrierOsc.stop(); pulseLfo.stop(); } catch {}
        carrierOsc.disconnect(); pulseLfo.disconnect();
      };
    }
  }

  // 24. Delta Sleep Sync (1.8Hz binaural slow-wave carrier)
  private setupDeltaSleepSync(nodes: ChannelAudioNodes) {
    if (!this.ctx) return;

    // Pure dual-sine wave oscillator routed through stereo panner nodes
    // Left: 108.0 Hz, Right: 109.8 Hz to generate exact 1.8 Hz binaural entrainment
    const oscL = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(108.0, this.ctx.currentTime);

    const oscR = this.ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(109.8, this.ctx.currentTime);

    // Stereo Panner Nodes: Left hard-panned (-1), Right hard-panned (+1)
    const pannerL = this.ctx.createStereoPanner();
    pannerL.pan.setValueAtTime(-1, this.ctx.currentTime);

    const pannerR = this.ctx.createStereoPanner();
    pannerR.pan.setValueAtTime(1, this.ctx.currentTime);

    const gainL = this.ctx.createGain();
    gainL.gain.setValueAtTime(0.5, this.ctx.currentTime);

    const gainR = this.ctx.createGain();
    gainR.gain.setValueAtTime(0.5, this.ctx.currentTime);

    oscL.connect(gainL);
    gainL.connect(pannerL);
    pannerL.connect(nodes.gainNode);

    oscR.connect(gainR);
    gainR.connect(pannerR);
    pannerR.connect(nodes.gainNode);

    oscL.start();
    oscR.start();

    nodes.sourceNode = oscL;
    nodes.extraNodes = [oscR, pannerL, pannerR, gainL, gainR];
    nodes.cleanup = () => {
      try { oscL.stop(); oscR.stop(); } catch {}
      oscL.disconnect();
      oscR.disconnect();
      pannerL.disconnect();
      pannerR.disconnect();
      gainL.disconnect();
      gainR.disconnect();
    };
  }

  // ---------------------------------------------------------------------------
  // Gentle Chime Notification
  // ---------------------------------------------------------------------------
  public playGentleChime() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);

      gain.gain.setValueAtTime(0, now + idx * 0.18);
      gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.18 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.18 + 1.8);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx!.destination);

      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 2.0);
    });
  }

  // ---------------------------------------------------------------------------
  // Sleep Timer Fade Out (Gentle 60-second exponential master volume taper)
  // ---------------------------------------------------------------------------
  public executeSleepFadeOut(durationSec: number = 60, onComplete?: () => void) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    const currentGain = Math.max(0.0001, this.masterGain.gain.value);
    this.masterGain.gain.setValueAtTime(currentGain, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    setTimeout(() => {
      this.pause();
      if (onComplete) onComplete();
    }, durationSec * 1000);
  }
}

export const soundScapeEngine = new SoundScapeAudioEngine();
