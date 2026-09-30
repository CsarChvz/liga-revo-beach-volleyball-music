/**
 * Web Audio API Synthesizer Service for generating demo stadium audio effects
 * and party rhythms without requiring external MP3 files.
 */

class SyntheticAudioService {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Super Spike: High energy stadium blast + power impact
   */
  public playSuperSpike(masterGainNode?: GainNode): () => void {
    const ctx = this.getContext();
    const output = masterGainNode || ctx.destination;

    const now = ctx.currentTime;
    const duration = 2.5;

    // Laser / Synth Drop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.4);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(gain);
    gain.connect(output);

    osc.start(now);
    osc.stop(now + duration);

    // Horn Chords (Stadium Brass)
    const freqs = [440, 554.37, 659.25, 880]; // A major
    freqs.forEach((freq) => {
      const hornOsc = ctx.createOscillator();
      const hornGain = ctx.createGain();
      hornOsc.type = 'triangle';
      hornOsc.frequency.setValueAtTime(freq, now);
      hornGain.gain.setValueAtTime(0.3, now);
      hornGain.gain.linearRampToValueAtTime(0.5, now + 0.2);
      hornGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      hornOsc.connect(hornGain);
      hornGain.connect(output);

      hornOsc.start(now);
      hornOsc.stop(now + duration);
    });

    // Explosive noise snare/impact
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(2000, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(200, now + 0.5);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(output);

    noise.start(now);

    return () => {
      try {
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      } catch {
        // ignore
      }
    };
  }

  /**
   * Monster Block: Heavy sub bass boom + defensive siren
   */
  public playMonsterBlock(masterGainNode?: GainNode): () => void {
    const ctx = this.getContext();
    const output = masterGainNode || ctx.destination;
    const now = ctx.currentTime;
    const duration = 2.8;

    // Heavy Sub Bass Drop
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.8);

    subGain.gain.setValueAtTime(1.0, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    subOsc.connect(subGain);
    subGain.connect(output);
    subOsc.start(now);
    subOsc.stop(now + duration);

    // Defense Siren Wail
    const sirenOsc = ctx.createOscillator();
    const sirenGain = ctx.createGain();
    sirenOsc.type = 'square';
    sirenOsc.frequency.setValueAtTime(300, now);
    sirenOsc.frequency.linearRampToValueAtTime(600, now + 0.3);
    sirenOsc.frequency.linearRampToValueAtTime(300, now + 0.6);
    sirenOsc.frequency.linearRampToValueAtTime(700, now + 0.9);

    sirenGain.gain.setValueAtTime(0.2, now);
    sirenGain.gain.exponentialRampToValueAtTime(0.01, now + 1.8);

    sirenOsc.connect(sirenGain);
    sirenGain.connect(output);
    sirenOsc.start(now);
    sirenOsc.stop(now + 1.8);

    return () => {
      try {
        subGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      } catch {
        // ignore
      }
    };
  }

  /**
   * Fire Ball: Explosive fire whoosh + rising pitch impact
   */
  public playFireBall(masterGainNode?: GainNode): () => void {
    const ctx = this.getContext();
    const output = masterGainNode || ctx.destination;
    const now = ctx.currentTime;
    const duration = 2.6;

    // Rising fire whoosh — sawtooth sweep up
    const whooshOsc = ctx.createOscillator();
    const whooshGain = ctx.createGain();
    whooshOsc.type = 'sawtooth';
    whooshOsc.frequency.setValueAtTime(80, now);
    whooshOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.5);
    whooshOsc.frequency.exponentialRampToValueAtTime(200, now + duration);

    whooshGain.gain.setValueAtTime(0.7, now);
    whooshGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    whooshOsc.connect(whooshGain);
    whooshGain.connect(output);
    whooshOsc.start(now);
    whooshOsc.stop(now + duration);

    // Impact crack at peak (noise burst at 0.5s)
    const bufferSize = Math.floor(ctx.sampleRate * 0.3);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const crack = ctx.createBufferSource();
    crack.buffer = buffer;
    const crackFilter = ctx.createBiquadFilter();
    crackFilter.type = 'bandpass';
    crackFilter.frequency.setValueAtTime(3000, now + 0.5);
    const crackGain = ctx.createGain();
    crackGain.gain.setValueAtTime(0, now);
    crackGain.gain.setValueAtTime(0.9, now + 0.5);
    crackGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5 + 0.3);

    crack.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(output);
    crack.start(now + 0.5);

    // Fire chord — warm harmonics (D major)
    const fireFreqs = [146.83, 185.00, 220.00, 293.66]; // D3, F#3, A3, D4
    fireFreqs.forEach((freq) => {
      const harmOsc = ctx.createOscillator();
      const harmGain = ctx.createGain();
      harmOsc.type = 'triangle';
      harmOsc.frequency.setValueAtTime(freq, now + 0.3);
      harmGain.gain.setValueAtTime(0.0, now + 0.3);
      harmGain.gain.linearRampToValueAtTime(0.35, now + 0.6);
      harmGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      harmOsc.connect(harmGain);
      harmGain.connect(output);
      harmOsc.start(now + 0.3);
      harmOsc.stop(now + duration);
    });

    return () => {
      try {
        whooshGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      } catch {
        // ignore
      }
    };
  }

  /**
   * Upbeat Fiesta Rhythm (Entrepuntos 12s / Cumbia Style synth loop)
   */
  public createFiestaLoop(durationSeconds: number = 12, masterGainNode?: GainNode): { stop: () => void } {
    const ctx = this.getContext();
    const output = masterGainNode || ctx.destination;
    const now = ctx.currentTime;

    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.7, now);
    mainGain.connect(output);

    const bpm = 132;
    const secondsPerBeat = 60 / bpm;
    const totalBeats = Math.floor(durationSeconds / secondsPerBeat);

    const activeSources: Array<OscillatorNode | AudioBufferSourceNode> = [];

    // Simple energetic cumbia / party melody notes (C, E, G, A, C)
    const melodyNotes = [261.63, 329.63, 392.00, 440.00, 523.25, 440.00, 392.00, 329.63];

    for (let beat = 0; beat < totalBeats; beat++) {
      const beatTime = now + beat * secondsPerBeat;
      if (beatTime > now + durationSeconds) break;

      // Bass synth on beat
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(beat % 2 === 0 ? 130.81 : 164.81, beatTime);
      bassGain.gain.setValueAtTime(0.4, beatTime);
      bassGain.gain.exponentialRampToValueAtTime(0.01, beatTime + secondsPerBeat * 0.8);

      bassOsc.connect(bassGain);
      bassGain.connect(mainGain);
      bassOsc.start(beatTime);
      bassOsc.stop(beatTime + secondsPerBeat * 0.8);
      activeSources.push(bassOsc);

      // Party melody synth (off-beat cumbia style)
      const noteFreq = melodyNotes[beat % melodyNotes.length];
      const melOsc = ctx.createOscillator();
      const melGain = ctx.createGain();
      melOsc.type = 'sawtooth';
      melOsc.frequency.setValueAtTime(noteFreq, beatTime + secondsPerBeat * 0.5);

      melGain.gain.setValueAtTime(0.25, beatTime + secondsPerBeat * 0.5);
      melGain.gain.exponentialRampToValueAtTime(0.01, beatTime + secondsPerBeat * 0.9);

      melOsc.connect(melGain);
      melGain.connect(mainGain);
      melOsc.start(beatTime + secondsPerBeat * 0.5);
      melOsc.stop(beatTime + secondsPerBeat * 0.9);
      activeSources.push(melOsc);
    }

    return {
      stop: () => {
        try {
          mainGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          setTimeout(() => {
            activeSources.forEach((s) => {
              try { s.stop(); } catch {}
            });
          }, 250);
        } catch {}
      }
    };
  }
}

export const syntheticAudio = new SyntheticAudioService();
