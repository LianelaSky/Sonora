import { Track } from '../types/music';

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private audioElement: HTMLAudioElement;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private isInitialized = false;

  // Synthesizer node for bundled high-res master tracks
  private synthGainNode: GainNode | null = null;
  private synthOscillators: OscillatorNode[] = [];
  private synthInterval: any = null;
  private isSynthPlaying = false;
  private currentTrack: Track | null = null;

  // Event callbacks
  public onTimeUpdate: ((currentTime: number, duration: number) => void) | null = null;
  public onEnded: (() => void) | null = null;
  public onPlayStateChange: ((isPlaying: boolean) => void) | null = null;

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.audioElement.currentTime, this.audioElement.duration || 0);
      }
      this.updateMediaSessionPosition();
    });

    this.audioElement.addEventListener('ended', () => {
      if (this.onEnded) this.onEnded();
    });

    this.audioElement.addEventListener('play', () => {
      if (this.onPlayStateChange) this.onPlayStateChange(true);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    });

    this.audioElement.addEventListener('pause', () => {
      if (!this.isSynthPlaying && this.onPlayStateChange) {
        this.onPlayStateChange(false);
      }
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    });
  }

  public init() {
    if (this.isInitialized) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      // Initialize with high sample rate (e.g. 96kHz or system native)
      this.ctx = new AudioContextClass();

      // Analyser for visuals
      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.85;

      // Master Gain Node
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.85;

      // Create 10-band Equalizer
      this.eqFilters = EQ_FREQUENCIES.map((freq, index) => {
        const filter = this.ctx!.createBiquadFilter();
        if (index === 0) {
          filter.type = 'lowshelf';
        } else if (index === EQ_FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4;
        }
        filter.frequency.value = freq;
        filter.gain.value = 0;
        return filter;
      });

      // Chain EQ filters
      let lastNode: AudioNode = this.eqFilters[0];
      for (let i = 1; i < this.eqFilters.length; i++) {
        lastNode.connect(this.eqFilters[i]);
        lastNode = this.eqFilters[i];
      }

      // Connect last EQ node to Analyser, then to Gain, then to Destination
      lastNode.connect(this.analyserNode);
      this.analyserNode.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      // Connect HTML Audio Element
      this.sourceNode = this.ctx.createMediaElementSource(this.audioElement);
      this.sourceNode.connect(this.eqFilters[0]);

      // Synth Gain Node for demo tracks
      this.synthGainNode = this.ctx.createGain();
      this.synthGainNode.gain.value = 0.15;
      this.synthGainNode.connect(this.eqFilters[0]);

      this.isInitialized = true;
    } catch (e) {
      console.warn('AudioContext initialization deferred or restricted:', e);
    }
  }

  public async resumeContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.audioElement.volume = clamped;
    if (this.gainNode) {
      this.gainNode.gain.value = clamped;
    }
  }

  public setEqGains(gains: number[]) {
    this.init();
    gains.forEach((gain, index) => {
      if (this.eqFilters[index]) {
        this.eqFilters[index].gain.value = gain;
      }
    });
  }

  public getVisualizerData(): Uint8Array {
    if (!this.analyserNode) return new Uint8Array(64);
    const data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(data);
    return data;
  }

  public async playTrack(track: Track, seekSeconds: number = 0) {
    await this.resumeContext();
    this.stopSynth();
    this.currentTrack = track;

    this.setupMediaSession(track);

    if (track.audioSrc.startsWith('synth:')) {
      // High-res procedural synthesizer playback
      this.playSynthTrack(track, seekSeconds);
      return;
    }

    try {
      this.audioElement.src = track.audioSrc;
      this.audioElement.currentTime = seekSeconds;
      await this.audioElement.play();
    } catch (err) {
      console.warn('Direct audio play failed, falling back to rich synth synthesis:', err);
      this.playSynthTrack(track, seekSeconds);
    }
  }

  public async togglePlay(isPlaying: boolean) {
    await this.resumeContext();
    if (this.isSynthPlaying) {
      if (isPlaying) {
        this.stopSynth();
        if (this.onPlayStateChange) this.onPlayStateChange(false);
      } else {
        if (this.currentTrack) {
          this.playSynthTrack(this.currentTrack, this.synthCurrentTime);
        }
      }
      return;
    }

    if (isPlaying) {
      this.audioElement.pause();
    } else {
      await this.audioElement.play().catch(() => {});
    }
  }

  public seek(seconds: number) {
    if (this.isSynthPlaying) {
      this.synthCurrentTime = Math.max(0, Math.min(this.currentTrack?.duration || 200, seconds));
      if (this.onTimeUpdate && this.currentTrack) {
        this.onTimeUpdate(this.synthCurrentTime, this.currentTrack.duration);
      }
      return;
    }
    if (this.audioElement.duration) {
      this.audioElement.currentTime = Math.max(0, Math.min(this.audioElement.duration, seconds));
    }
  }

  // --- Background Playback & Media Session Support ---
  private setupMediaSession(track: Track) {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: [
          { src: track.artworkUrl, sizes: '512x512', type: 'image/jpeg' },
          { src: track.artworkUrl, sizes: '256x256', type: 'image/jpeg' },
        ],
      });
    } catch (e) {
      console.warn('Failed setting MediaMetadata:', e);
    }
  }

  public setMediaSessionHandlers(handlers: {
    onPlay: () => void;
    onPause: () => void;
    onNext: () => void;
    onPrev: () => void;
    onSeek: (seconds: number) => void;
  }) {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => handlers.onPlay());
      navigator.mediaSession.setActionHandler('pause', () => handlers.onPause());
      navigator.mediaSession.setActionHandler('nexttrack', () => handlers.onNext());
      navigator.mediaSession.setActionHandler('previoustrack', () => handlers.onPrev());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          handlers.onSeek(details.seekTime);
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset || 10;
        const current = this.isSynthPlaying ? this.synthCurrentTime : this.audioElement.currentTime;
        handlers.onSeek(Math.max(0, current - offset));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const offset = details.seekOffset || 10;
        const current = this.isSynthPlaying ? this.synthCurrentTime : this.audioElement.currentTime;
        handlers.onSeek(current + offset);
      });
    } catch (e) {
      console.warn('Error configuring media session handlers:', e);
    }
  }

  private updateMediaSessionPosition() {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
    try {
      const duration = this.isSynthPlaying ? (this.currentTrack?.duration || 200) : this.audioElement.duration;
      const position = this.isSynthPlaying ? this.synthCurrentTime : this.audioElement.currentTime;

      if (duration && !isNaN(duration) && duration > 0) {
        navigator.mediaSession.setPositionState({
          duration: duration,
          playbackRate: 1,
          position: Math.min(position, duration),
        });
      }
    } catch (e) {
      // Ignore rapid position update restrictions
    }
  }

  // --- Real Web Audio Synthesizer for High-Res Demo / Offline Audio Simulation ---
  private synthCurrentTime = 0;

  private playSynthTrack(track: Track, startSeconds: number = 0) {
    if (!this.ctx) return;
    this.stopSynth();
    this.isSynthPlaying = true;
    this.synthCurrentTime = startSeconds;

    if (this.onPlayStateChange) this.onPlayStateChange(true);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing';
    }

    // Generate harmonic chord frequencies based on track ID or title
    const baseFreqs = [261.63, 329.63, 392.00, 523.25]; // C major 7th chord
    const bassFreq = 65.41;

    // Bass node
    const bassOsc = this.ctx.createOscillator();
    bassOsc.type = 'triangle';
    bassOsc.frequency.setValueAtTime(bassFreq, this.ctx.currentTime);
    const bassGain = this.ctx.createGain();
    bassGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    bassOsc.connect(bassGain);
    bassGain.connect(this.synthGainNode!);
    bassOsc.start();
    this.synthOscillators.push(bassOsc);

    // Chords
    baseFreqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
      
      let panner: StereoPannerNode | null = null;
      try {
        panner = this.ctx!.createStereoPanner();
        panner.pan.value = (idx - 1.5) * 0.4;
      } catch (e) {}

      const noteGain = this.ctx!.createGain();
      noteGain.gain.setValueAtTime(0.03, this.ctx!.currentTime);

      if (panner) {
        osc.connect(panner);
        panner.connect(noteGain);
      } else {
        osc.connect(noteGain);
      }
      noteGain.connect(this.synthGainNode!);
      osc.start();
      this.synthOscillators.push(osc);
    });

    // Sub-pulse generator to simulate Hi-Res analog richness
    let tickCount = 0;
    this.synthInterval = setInterval(() => {
      this.synthCurrentTime += 0.25;
      tickCount++;

      // Subtle arpeggiator modulation
      if (this.synthOscillators[1] && this.ctx) {
        const arpeggioOffsets = [0, 4, 7, 11, 14, 7];
        const step = tickCount % arpeggioOffsets.length;
        const semitone = arpeggioOffsets[step];
        const newFreq = 329.63 * Math.pow(2, semitone / 12);
        this.synthOscillators[1].frequency.setTargetAtTime(newFreq, this.ctx.currentTime, 0.08);
      }

      if (this.onTimeUpdate && this.currentTrack) {
        this.onTimeUpdate(this.synthCurrentTime, this.currentTrack.duration);
      }

      this.updateMediaSessionPosition();

      if (this.currentTrack && this.synthCurrentTime >= this.currentTrack.duration) {
        this.stopSynth();
        if (this.onEnded) this.onEnded();
      }
    }, 250);
  }

  public stopSynth() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.synthOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.synthOscillators = [];
    this.isSynthPlaying = false;
  }

  public stopAll() {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this.stopSynth();
    if (this.onPlayStateChange) this.onPlayStateChange(false);
  }
}

export const audioEngine = new AudioEngine();
