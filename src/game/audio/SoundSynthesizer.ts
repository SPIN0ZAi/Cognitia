/**
 * Cognitia Chase: Procedural Chiptune Web Audio Synthesizer
 * 
 * 100% original, procedural client-side audio synthesis using standard Web Audio API.
 * Emulates the warmth and punch of classic 1980 arcade sound hardware (square, triangle waves)
 * with zero external audio assets, zero copyrighted samples, and zero network requests.
 * Muted by default on first visit, resumes on first user gesture.
 */

export class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private masterGain: GainNode | null = null;
  private munchAlternator: boolean = false;
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private frightenedOsc: OscillatorNode | null = null;
  private frightenedGain: GainNode | null = null;

  constructor(initialMuted: boolean = true) {
    this.isMuted = initialMuted;
  }

  public initContext(): void {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.28, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.28, this.ctx.currentTime);
    }
    if (muted) {
      this.stopSiren();
      this.stopFrightenedLoop();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.initContext();
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public playPelletChirp(): void {
    this.playMunch();
  }

  public playPlayerCaught(): void {
    this.playDeathSequence();
  }

  public playLevelClear(): void {
    this.playExtraLife();
  }

  /**
   * Continuous alternating two-tone munch pattern when eating dots
   */
  public playMunch(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Alternate between low and high munch frequencies
      this.munchAlternator = !this.munchAlternator;
      const startFreq = this.munchAlternator ? 290 : 440;
      const endFreq = this.munchAlternator ? 420 : 310;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.linearRampToValueAtTime(endFreq, now + 0.055);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.055);
    } catch {
      // AudioContext policy
    }
  }

  /**
   * Power Pellet acquisition pulse
   */
  public playPowerPulse(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.16);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // AudioContext policy
    }
  }

  /**
   * Ambient rising siren background tone whose pitch rises as dots are eaten
   * dotRatio: 0.0 (all dots remaining) to 1.0 (last dot remaining)
   */
  public updateSiren(dotRatio: number): void {
    if (this.isMuted) {
      this.stopSiren();
      return;
    }
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = 160 + dotRatio * 180; // Rises from 160Hz up to 340Hz

      if (!this.sirenOsc || !this.sirenGain) {
        this.sirenOsc = this.ctx.createOscillator();
        this.sirenGain = this.ctx.createGain();

        this.sirenOsc.type = 'triangle';
        this.sirenGain.gain.setValueAtTime(0.06, now);

        this.sirenOsc.connect(this.sirenGain);
        this.sirenGain.connect(this.masterGain);
        this.sirenOsc.start();
      }

      this.sirenOsc.frequency.setValueAtTime(baseFreq, now);
    } catch {
      // AudioContext policy
    }
  }

  public stopSiren(): void {
    if (this.sirenOsc) {
      try {
        this.sirenOsc.stop();
        this.sirenOsc.disconnect();
      } catch {}
      this.sirenOsc = null;
    }
    if (this.sirenGain) {
      this.sirenGain.disconnect();
      this.sirenGain = null;
    }
  }

  /**
   * Distinct frightened-mode bubbling bass loop
   */
  public startFrightenedLoop(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.stopSiren();
    if (this.frightenedOsc) return;

    try {
      const now = this.ctx.currentTime;
      this.frightenedOsc = this.ctx.createOscillator();
      this.frightenedGain = this.ctx.createGain();

      this.frightenedOsc.type = 'sawtooth';
      this.frightenedOsc.frequency.setValueAtTime(110, now);

      this.frightenedGain.gain.setValueAtTime(0.08, now);

      this.frightenedOsc.connect(this.frightenedGain);
      this.frightenedGain.connect(this.masterGain);
      this.frightenedOsc.start();
    } catch {}
  }

  public stopFrightenedLoop(): void {
    if (this.frightenedOsc) {
      try {
        this.frightenedOsc.stop();
        this.frightenedOsc.disconnect();
      } catch {}
      this.frightenedOsc = null;
    }
    if (this.frightenedGain) {
      this.frightenedGain.disconnect();
      this.frightenedGain = null;
    }
  }

  /**
   * Rapid ascending frequency sweep when capturing a frightened ghost
   */
  public playGhostEaten(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.28);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch {}
  }

  /**
   * Fruit eaten chime
   */
  public playFruitEaten(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [987, 1318]; // B5, E6
      notes.forEach((freq, idx) => {
        const noteTime = now + idx * 0.08;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.2, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(noteTime);
        osc.stop(noteTime + 0.12);
      });
    } catch {}
  }

  /**
   * Original, upbeat 4-bar chiptune intro fanfare
   */
  public playIntroJingle(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      // Original 8-note arpeggio motif
      const notes = [
        { f: 261.63, d: 0.12 }, // C4
        { f: 329.63, d: 0.12 }, // E4
        { f: 392.00, d: 0.12 }, // G4
        { f: 523.25, d: 0.16 }, // C5
        { f: 392.00, d: 0.10 }, // G4
        { f: 523.25, d: 0.24 }, // C5
        { f: 659.25, d: 0.20 }, // E5
        { f: 783.99, d: 0.35 }, // G5
      ];

      let offset = 0;
      notes.forEach((n) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(n.f, now + offset);

        gain.gain.setValueAtTime(0.18, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + n.d);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + offset);
        osc.stop(now + offset + n.d);

        offset += n.d;
      });
    } catch {}
  }

  /**
   * Classic descending chromatic death whistle and pop
   */
  public playDeathSequence(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.stopSiren();
    this.stopFrightenedLoop();

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.65);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.65);

      // Final pop
      setTimeout(() => {
        if (!this.ctx || !this.masterGain) return;
        try {
          const popTime = this.ctx.currentTime;
          const popOsc = this.ctx.createOscillator();
          const popGain = this.ctx.createGain();

          popOsc.type = 'triangle';
          popOsc.frequency.setValueAtTime(75, popTime);
          popGain.gain.setValueAtTime(0.3, popTime);
          popGain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.08);

          popOsc.connect(popGain);
          popGain.connect(this.masterGain);
          popOsc.start(popTime);
          popOsc.stop(popTime + 0.08);
        } catch {}
      }, 660);
    } catch {}
  }

  /**
   * Extra life fanfare
   */
  public playExtraLife(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523, 659, 783, 1046]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const time = now + idx * 0.09;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.22, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(time);
        osc.stop(time + 0.12);
      });
    } catch {}
  }
}
