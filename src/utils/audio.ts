// Web Audio API Synthesizer for tactile calculator feedback & business shop cash register sounds

class SoundEffects {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // Lazy initialize upon first user gesture
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('shopcalc_sound_enabled');
      if (stored !== null) {
        this.isEnabled = stored === 'true';
      }
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleSound(): boolean {
    this.isEnabled = !this.isEnabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('shopcalc_sound_enabled', String(this.isEnabled));
    }
    if (this.isEnabled) {
      this.playKeypadClick();
    }
    return this.isEnabled;
  }

  public getSoundEnabled(): boolean {
    return this.isEnabled;
  }

  // Crisp mechanical key press click
  public playKeypadClick(frequency = 1200, duration = 0.02) {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore audio context autoplay limitations safely
    }
  }

  // Deep function / operator button clack
  public playOperatorClick() {
    this.playKeypadClick(850, 0.035);
  }

  // Clear / Delete sound
  public playClearClick() {
    this.playKeypadClick(480, 0.04);
  }

  // Mechanical Paper Feed / Thermal roll print ratchet tick
  public playPaperFeed() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // 3 rapid micro ratchet clicks
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const clickTime = now + i * 0.04;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1800 - i * 150, clickTime);

        gain.gain.setValueAtTime(0.08, clickTime);
        gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.02);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(clickTime);
        osc.stop(clickTime + 0.02);
      }
    } catch {
      // Ignore
    }
  }

  // Classic Retail Cash Register "Ka-Ching / Bell Chime" on Completed Sale
  public playCashRegisterChime() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Harmonic cash drawer chime: 2489 Hz (D#7)
      osc.frequency.setValueAtTime(2489, now);
      osc.frequency.setValueAtTime(2637, now + 0.08); // ramp up to E7

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.65);
    } catch {
      // Ignore
    }
  }
}

export const sounds = new SoundEffects();
