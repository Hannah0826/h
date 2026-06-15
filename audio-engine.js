class CatAudioEngine {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.master = null;
    this.filter = null;
  }

  init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.9;
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 5200;
    this.filter.Q.value = 0.6;
    this.filter.connect(this.master);
    this.master.connect(this.ctx.destination);
    this.initialized = true;
  }

  ensureContext() {
    this.init();
    if (this.ctx.state === 'suspended') {
      return this.ctx.resume();
    }
    return Promise.resolve();
  }

  async playMeow(emotionId, variant = 0) {
    await this.ensureContext();
    const cfg = this._meowCfg(emotionId, variant);
    this._playCatMeow(cfg);
  }

  async playCatVoice(voiceId, variant = 0) {
    await this.ensureContext();
    const map = {
      comfort: { freq: 280, duration: 0.9, repeats: 1, gap: 0, volume: 0.26, purr: true, smooth: true },
      call: { freq: 430, duration: 0.35, repeats: 3, gap: 0.22, volume: 0.4 },
      play: { freq: 620, duration: 0.12, repeats: 6, gap: 0.06, volume: 0.35, sharp: true },
      feed: { freq: 380, duration: 0.42, repeats: 2, gap: 0.18, volume: 0.42 }
    };
    const cfg = { ...(map[voiceId] || map.comfort) };
    cfg.freq += variant * 20;
    this._blip(cfg);
  }

  _meowCfg(id, variant) {
    const shift = variant * 28 - 12;
    const presets = {
      hungry: {
        syllables: [[760, 360, 0.34], [700, 300, 0.3]],
        gap: 0.11,
        volume: 0.44,
        breath: true
      },
      affectionate: {
        syllables: [[620, 290, 0.58]],
        gap: 0,
        volume: 0.36,
        purr: true,
        breath: true
      },
      irritable: {
        syllables: [[880, 430, 0.16], [820, 360, 0.14], [760, 300, 0.12]],
        gap: 0.05,
        volume: 0.4,
        breath: true
      },
      lonely: {
        syllables: [[540, 240, 0.78]],
        gap: 0,
        volume: 0.3,
        purr: true
      },
      alert: {
        syllables: [[920, 520, 0.2], [860, 460, 0.16]],
        gap: 0.06,
        volume: 0.41,
        breath: true
      }
    };
    const cfg = JSON.parse(JSON.stringify(presets[id] || presets.affectionate));
    cfg.syllables = cfg.syllables.map(([start, end, dur]) => [
      start + shift,
      end + shift * 0.45,
      dur
    ]);
    return cfg;
  }

  _playCatMeow(cfg) {
    const now = this.ctx.currentTime;
    let t = now;
    cfg.syllables.forEach(([startFreq, endFreq, duration], index) => {
      if (cfg.breath && index === 0) this._meowBreath(t, duration, cfg.volume);
      this._meowSyllable(t, startFreq, endFreq, duration, cfg.volume);
      t += duration + (index < cfg.syllables.length - 1 ? cfg.gap : 0);
    });
    if (cfg.purr) this._meowPurr(now, t - now + 0.15, cfg.volume * 0.55);
  }

  _meowSyllable(t, startFreq, endFreq, duration, volume) {
    const end = Math.max(140, endFreq);
    const start = Math.max(end + 40, startFreq);
    const oscA = this.ctx.createOscillator();
    const oscB = this.ctx.createOscillator();
    const mix = this.ctx.createGain();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    oscA.type = 'sine';
    oscB.type = 'sine';
    oscA.frequency.setValueAtTime(start, t);
    oscA.frequency.exponentialRampToValueAtTime(end, t + duration * 0.9);
    oscB.frequency.setValueAtTime(start * 1.008, t);
    oscB.frequency.exponentialRampToValueAtTime(end * 1.005, t + duration * 0.9);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(start * 1.08, t);
    filter.frequency.exponentialRampToValueAtTime(end * 1.25, t + duration);
    filter.Q.value = 6;

    mix.gain.value = 0.52;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.02);
    gain.gain.linearRampToValueAtTime(volume * 0.72, t + duration * 0.48);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration + 0.04);

    oscA.connect(mix);
    oscB.connect(mix);
    mix.connect(filter);
    filter.connect(gain);
    gain.connect(this.filter);

    oscA.start(t);
    oscB.start(t);
    oscA.stop(t + duration + 0.05);
    oscB.stop(t + duration + 0.05);
  }

  _meowBreath(t, duration, volume) {
    const length = Math.floor(this.ctx.sampleRate * 0.035);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      samples[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1100;
    filter.Q.value = 0.9;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + Math.min(0.05, duration * 0.2));
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.filter);
    noise.start(t);
    noise.stop(t + 0.06);
  }

  _meowPurr(t, duration, volume) {
    const osc = this.ctx.createOscillator();
    const trem = this.ctx.createOscillator();
    const tremGain = this.ctx.createGain();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 26;
    trem.type = 'sine';
    trem.frequency.value = 14;
    tremGain.gain.value = 4;
    trem.connect(tremGain);
    tremGain.connect(osc.frequency);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(this.filter);
    osc.start(t);
    trem.start(t);
    osc.stop(t + duration + 0.02);
    trem.stop(t + duration + 0.02);
  }

  _cfg(id, variant) {
    const base = {
      hungry: { freq: 390, duration: 0.35, repeats: 2, gap: 0.12, volume: 0.42 },
      affectionate: { freq: 520, duration: 0.48, repeats: 1, gap: 0, volume: 0.38, smooth: true },
      irritable: { freq: 260, duration: 0.22, repeats: 3, gap: 0.08, volume: 0.48, harsh: true },
      lonely: { freq: 350, duration: 0.72, repeats: 1, gap: 0, volume: 0.3, purr: true },
      alert: { freq: 680, duration: 0.18, repeats: 2, gap: 0.08, volume: 0.42, sharp: true }
    };
    const cfg = { ...(base[id] || base.affectionate) };
    cfg.freq += variant * 20 - 10;
    return cfg;
  }

  _blip(cfg) {
    const { freq, duration, repeats, gap, volume, purr, smooth, harsh, sharp } = cfg;
    const now = this.ctx.currentTime;
    for (let i = 0; i < repeats; i += 1) {
      const t = now + i * (duration + gap);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();

      osc.type = harsh ? 'sawtooth' : sharp ? 'square' : smooth ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(90, freq - 55), t + duration * 0.78);
      vibrato.type = 'sine';
      vibrato.frequency.setValueAtTime(7 + (i % 2), t);
      vibratoGain.gain.setValueAtTime(freq * 0.02, t);
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);

      filter.type = 'bandpass';
      filter.frequency.value = freq * 1.2;
      filter.Q.value = 7;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(volume, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.filter);
      osc.start(t);
      osc.stop(t + duration + 0.03);
      vibrato.start(t);
      vibrato.stop(t + duration + 0.03);

      if (purr) {
        const p = this.ctx.createOscillator();
        const pg = this.ctx.createGain();
        p.type = 'sine';
        p.frequency.value = 28;
        pg.gain.setValueAtTime(0, t);
        pg.gain.linearRampToValueAtTime(0.1, t + 0.08);
        pg.gain.exponentialRampToValueAtTime(0.001, t + duration + 0.18);
        p.connect(pg);
        pg.connect(this.filter);
        p.start(t);
        p.stop(t + duration + 0.2);
      }
    }
  }
}

window.CatAudioEngine = CatAudioEngine;
