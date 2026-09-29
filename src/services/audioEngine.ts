import type { AudioTrack, PlayingState, PlaylistCategory } from '../types/audio';
import { syntheticAudio } from './syntheticAudio';

type StateListener = (state: PlayingState) => void;

export class AudioEngineService {
  private currentHtmlAudio: HTMLAudioElement | null = null;
  private syntheticStopFn: (() => void) | null = null;
  private masterVolume: number = 1.0; // 0.0 to 1.0

  // Timers & Fade Interval
  private fadeInterval: number | null = null;
  private autoFadeTimer: number | null = null;
  private totalStopTimer: number | null = null;
  private progressInterval: number | null = null;

  private audioPool: Map<string, HTMLAudioElement> = new Map();
  private naturalEndCallback: ((category: PlaylistCategory) => void) | null = null;

  // State
  private state: PlayingState = {
    trackId: null,
    trackTitle: null,
    category: null,
    isPlaying: false,
    currentTime: 0,
    totalDuration: 0,
    volume: 1.0,
    isFading: false,
    fadeTimeRemaining: 0,
    jingleActive: false,
  };

  private listeners: Set<StateListener> = new Set();

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn({ ...this.state }));
  }

  /**
   * Pre-load an audio URL into memory pool for instant zero-latency playback
   */
  public preloadAudio(url: string): void {
    if (!url || this.audioPool.has(url)) return;
    try {
      const audio = new Audio(url);
      audio.preload = 'auto';
      this.audioPool.set(url, audio);
    } catch (e) {
      console.warn('Failed to preload audio:', url, e);
    }
  }

  public setMasterVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    this.state.volume = this.masterVolume;
    if (this.currentHtmlAudio && !this.state.isFading) {
      this.currentHtmlAudio.volume = this.masterVolume;
    }
    this.notify();
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Registers a callback fired when a track ends naturally (not via emergencyStop/user action).
   * Used to auto-advance continuous playlists (e.g. TIME-OUT) without the engine knowing playlist contents.
   */
  public setNaturalEndCallback(cb: ((category: PlaylistCategory) => void) | null): void {
    this.naturalEndCallback = cb;
  }

  public getCurrentState(): PlayingState {
    return { ...this.state };
  }

  /**
   * Emergency Stop: Instantly stops all playing channels (0ms cutoff, NO overlap)
   */
  public emergencyStop(): void {
    this.clearAllTimers();

    if (this.currentHtmlAudio) {
      try {
        this.currentHtmlAudio.pause();
        this.currentHtmlAudio.currentTime = 0;
      } catch (e) {
        console.warn(e);
      }
      this.currentHtmlAudio = null;
    }

    if (this.syntheticStopFn) {
      this.syntheticStopFn();
      this.syntheticStopFn = null;
    }

    this.state = {
      ...this.state,
      trackId: null,
      trackTitle: null,
      category: null,
      isPlaying: false,
      currentTime: 0,
      totalDuration: 0,
      isFading: false,
      fadeTimeRemaining: 0,
      jingleActive: false,
    };

    this.notify();
  }

  private clearAllTimers(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    if (this.autoFadeTimer) {
      clearTimeout(this.autoFadeTimer);
      this.autoFadeTimer = null;
    }
    if (this.totalStopTimer) {
      clearTimeout(this.totalStopTimer);
      this.totalStopTimer = null;
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  /**
   * Main Play function according to module category and source type.
   * ABSOLUTE ZERO OVERLAP: Stops any active sound before starting the new one!
   */
  public async playTrack(track: AudioTrack): Promise<void> {
    // 1. Stop any currently playing audio completely to prevent overlapping!
    this.emergencyStop();

    // 2. Set active track state for Header Banner and Stream Deck OLED Display
    this.state.trackId = track.id;
    this.state.trackTitle = track.title;
    this.state.category = track.category;
    this.state.isPlaying = true;
    this.state.currentTime = 0;
    this.state.isFading = false;
    this.state.fadeTimeRemaining = 0;
    this.state.jingleActive = track.category === 'super_spike' || track.category === 'monster_block' || track.category === 'ace';

    const categoryDurations: Record<PlaylistCategory, number> = {
      presentation: track.duration || 180,
      point_intros: 12,
      technical_timeouts: 60,
      super_spike: 12,
      monster_block: 12,
      ace: 12,
      timeout_continuous: track.duration || 180,
      awards: Infinity,
    };

    this.state.totalDuration = categoryDurations[track.category] || 12;

    // Launch Audio Provider (Local HTML5 Audio or Synthetic Fallback)
    if (track.sourceType === 'local' && track.url) {
      this.playLocalAudio(track.url, track.category === 'awards');
    } else {
      this.playSyntheticTrack(track);
    }

    // Start UI Progress Tracker (throttled to 250ms for smooth 60fps UI)
    const startTime = Date.now();
    this.progressInterval = window.setInterval(() => {
      if (!this.state.isPlaying) return;
      const elapsed = (Date.now() - startTime) / 1000;
      this.state.currentTime = Math.min(elapsed, this.state.totalDuration);
      this.notify();
    }, 250);

    // Apply Specific Module Automation (Point Intros, Super Spike, Monster Block, Ace: 12s; Technical Timeout: 60s)
    if (
      track.category === 'point_intros' ||
      track.category === 'super_spike' ||
      track.category === 'monster_block' ||
      track.category === 'ace'
    ) {
      // 9s play at 100% volume + 3s fade out -> stop at 12s
      this.autoFadeTimer = window.setTimeout(() => {
        this.fadeOutAndStop(3000);
      }, 9000);
    } else if (track.category === 'technical_timeouts') {
      // 50s play at 100% volume + 10s fade out -> stop at 60s
      this.autoFadeTimer = window.setTimeout(() => {
        this.fadeOutAndStop(10000);
      }, 50000);
    }

    this.notify();
  }

  /**
   * HTML5 Audio Player (Local MP3/WAV with Instant Cache Reuse)
   */
  private playLocalAudio(url: string, loop: boolean = false): void {
    let audio = this.audioPool.get(url);
    if (!audio) {
      audio = new Audio(url);
      audio.preload = 'auto';
      this.audioPool.set(url, audio);
    } else {
      try {
        audio.currentTime = 0;
      } catch (e) {
        console.warn(e);
      }
    }
    audio.volume = this.masterVolume;
    audio.loop = loop;
    this.currentHtmlAudio = audio;
    audio.onended = () => {
      const endedCategory = this.state.category;
      this.emergencyStop();
      if (endedCategory && this.naturalEndCallback) {
        this.naturalEndCallback(endedCategory);
      }
    };
    audio.play().catch((err) => console.warn('HTML5 Audio playback error:', err));
  }

  /**
   * Synthetic Audio Provider for Built-in Demo tracks
   */
  private playSyntheticTrack(track: AudioTrack): void {
    if (track.syntheticType === 'spike_synth' || track.jingleType === 'super_spike') {
      this.syntheticStopFn = syntheticAudio.playSuperSpike();
    } else if (track.syntheticType === 'block_synth' || track.jingleType === 'monster_block') {
      this.syntheticStopFn = syntheticAudio.playMonsterBlock();
    } else {
      const loop = syntheticAudio.createFiestaLoop(this.state.totalDuration);
      this.syntheticStopFn = loop.stop;
    }
  }

  /**
   * Transition out presentation / warmup with 3s fade
   */
  public transitionOutPresentation(durationMs: number = 3000): void {
    if (this.state.category === 'presentation' && this.state.isPlaying) {
      this.fadeOutAndStop(durationMs);
    }
  }

  /**
   * Algorithmic Fade Out & Stop Implementation
   */
  public fadeOutAndStop(durationMs: number = 3000): Promise<void> {
    return new Promise((resolve) => {
      if (!this.state.isPlaying || this.state.isFading) {
        resolve();
        return;
      }

      this.state.isFading = true;
      this.notify();

      const startTime = Date.now();
      const intervalMs = 40;
      const initialVol = this.currentHtmlAudio ? this.currentHtmlAudio.volume : this.masterVolume;
      const steps = durationMs / intervalMs;
      const volStep = initialVol / steps;
      let tick = 0;

      this.fadeInterval = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        this.state.fadeTimeRemaining = Math.max(0, (durationMs - elapsed) / 1000);
        tick++;

        if (this.currentHtmlAudio) {
          if (this.currentHtmlAudio.volume - volStep > 0) {
            this.currentHtmlAudio.volume -= volStep;
          } else {
            this.currentHtmlAudio.volume = 0;
          }
        }

        if (elapsed >= durationMs) {
          this.emergencyStop();
          resolve();
        } else if (tick % 5 === 0) {
          // Notify UI every 200ms
          this.notify();
        }
      }, intervalMs);
    });
  }
}

export const audioEngine = new AudioEngineService();
