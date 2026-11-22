// GILDED — sound, all synthesized with Web Audio: no audio files, no network.
// Footsteps, coin chimes, the camera warning beep, the alarm siren, the EMP
// zap, the lockpick click and the getaway fanfare.
export function makeAudio() {
  const api = {
    ctx: null,
    master: null,
    enabled: true,
    ensure() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return;
      }
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.16;
        this.master.connect(this.ctx.destination);
      } catch (e) {
        this.enabled = false;
      }
    },
    tone(freq, dur, type, vol, slideTo) {
      if (!this.enabled || !this.ctx) return;
      const t0 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      g.gain.setValueAtTime(vol || 0.5, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(g);
      g.connect(this.master);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    },
    noise(dur, vol, low) {
      if (!this.enabled || !this.ctx) return;
      const t0 = this.ctx.currentTime;
      const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = low || 1200;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol || 0.4, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      src.connect(filt);
      filt.connect(g);
      g.connect(this.master);
      src.start(t0);
    },
    step() { this.tone(90 + Math.random() * 30, 0.06, 'triangle', 0.12); },
    coin() { this.tone(1180, 0.09, 'sine', 0.4); setTimeout(() => this.tone(1560, 0.14, 'sine', 0.35), 70); },
    grab() {
      [523, 659, 784].forEach((f, i) => setTimeout(() => this.tone(f, 0.16, 'sine', 0.4), i * 80));
    },
    warn() { this.tone(880, 0.12, 'square', 0.22); setTimeout(() => this.tone(880, 0.12, 'square', 0.22), 160); },
    alert() { this.tone(660, 0.18, 'sawtooth', 0.3, 440); this.noise(0.2, 0.25, 900); },
    siren() {
      this.tone(520, 0.5, 'sawtooth', 0.28, 980);
      setTimeout(() => this.tone(980, 0.5, 'sawtooth', 0.28, 520), 500);
    },
    emp() { this.tone(1400, 0.35, 'sawtooth', 0.3, 120); this.noise(0.25, 0.3, 3000); },
    smoke() { this.noise(0.5, 0.4, 700); },
    pick() { this.tone(1900, 0.05, 'square', 0.3); setTimeout(() => this.tone(2400, 0.05, 'square', 0.3), 90); },
    deny() { this.tone(180, 0.16, 'square', 0.3, 120); },
    caught() {
      [392, 311, 233].forEach((f, i) => setTimeout(() => this.tone(f, 0.3, 'sawtooth', 0.3), i * 180));
    },
    fanfare() {
      [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.35, 'triangle', 0.4), i * 130));
      setTimeout(() => this.tone(1318, 0.6, 'triangle', 0.35), 560);
    },
  };
  return api;
}
