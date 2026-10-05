/* ================================================================
   Audio: tiny chiptune synth (Web Audio) - SFX + music sequencer
   ================================================================ */
const Snd = {
  ctx: null, master: null, sfxGain: null, musGain: null, noiseBuf: null, waves: {},
  sfxOn: true, musicOn: true, unlocked: false,
  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { this.ctx = new AC(); } catch (e) { this.ctx = null; return; }
    const c = this.ctx;
    this.master = c.createGain(); this.master.gain.value = 0.9; this.master.connect(c.destination);
    this.sfxGain = c.createGain(); this.sfxGain.gain.value = this.sfxOn ? 0.55 : 0; this.sfxGain.connect(this.master);
    this.musGain = c.createGain(); this.musGain.gain.value = this.musicOn ? 0.32 : 0; this.musGain.connect(this.master);
    const len = c.sampleRate;
    this.noiseBuf = c.createBuffer(1, len, c.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    for (const duty of [0.125, 0.25]) {
      const n = 48, real = new Float32Array(n), imag = new Float32Array(n);
      for (let k = 1; k < n; k++) real[k] = (2 * Math.sin(k * Math.PI * duty)) / (k * Math.PI);
      this.waves[duty] = c.createPeriodicWave(real, imag);
    }
  },
  unlock() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (!this.unlocked) {
      const b = this.ctx.createBuffer(1, 1, 22050), s = this.ctx.createBufferSource();
      s.buffer = b; s.connect(this.ctx.destination); s.start(0);
      this.unlocked = true;
      Music.kick();
    }
  },
  setSfx(on) { this.sfxOn = on; if (this.sfxGain) this.sfxGain.gain.value = on ? 0.55 : 0; },
  setMusic(on) { this.musicOn = on; if (this.musGain) this.musGain.gain.value = on ? 0.32 : 0; },
  ok() { return this.ctx && this.ctx.state === 'running'; },
  osc(type, out) {
    const o = this.ctx.createOscillator();
    if (type === 'p25') o.setPeriodicWave(this.waves[0.25]);
    else if (type === 'p12') o.setPeriodicWave(this.waves[0.125]);
    else o.type = type;
    return o;
  },
  // simple tone with optional pitch slide
  tone(f, dur, o) {
    if (!this.ok()) return;
    o = o || {};
    const c = this.ctx, t = c.currentTime + (o.delay || 0);
    const os = this.osc(o.type || 'square');
    const gn = c.createGain();
    const v = (o.vol != null ? o.vol : 0.25);
    os.frequency.setValueAtTime(f, t);
    if (o.slide) os.frequency.exponentialRampToValueAtTime(Math.max(20, o.slide), t + dur * (o.slideT || 1));
    if (o.vib) {
      const l = c.createOscillator(), lg = c.createGain();
      l.frequency.value = o.vib; lg.gain.value = f * 0.03; l.connect(lg); lg.connect(os.frequency); l.start(t); l.stop(t + dur + 0.05);
    }
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(v, t + (o.att || 0.005));
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    os.connect(gn); gn.connect(o.dest || this.sfxGain);
    os.start(t); os.stop(t + dur + 0.02);
  },
  noise(dur, o) {
    if (!this.ok()) return;
    o = o || {};
    const c = this.ctx, t = c.currentTime + (o.delay || 0);
    const s = c.createBufferSource(); s.buffer = this.noiseBuf;
    s.loop = true;
    const f = c.createBiquadFilter(); f.type = o.ftype || 'bandpass'; f.frequency.setValueAtTime(o.freq || 1000, t);
    f.Q.value = o.q || 1;
    if (o.slide) f.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
    const gn = c.createGain();
    const v = o.vol != null ? o.vol : 0.3;
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(v, t + (o.att || 0.004));
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(gn); gn.connect(o.dest || this.sfxGain);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  },
  // "meow": sawtooth through a moving formant filter
  meow(pitch, delay) {
    if (!this.ok()) return;
    pitch = pitch || 1;
    const c = this.ctx, t = c.currentTime + (delay || 0);
    const dur = 0.5 / Math.sqrt(pitch);
    const o = c.createOscillator(); o.type = 'sawtooth';
    const f0 = 420 * pitch;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.linearRampToValueAtTime(f0 * 1.45, t + dur * 0.28);
    o.frequency.linearRampToValueAtTime(f0 * 0.95, t + dur);
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 3.5;
    bp.frequency.setValueAtTime(900 * pitch, t);
    bp.frequency.linearRampToValueAtTime(2200 * pitch, t + dur * 0.3);
    bp.frequency.linearRampToValueAtTime(800 * pitch, t + dur);
    const gn = c.createGain();
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(0.5, t + 0.04);
    gn.gain.setValueAtTime(0.5, t + dur * 0.6);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(bp); bp.connect(gn); gn.connect(this.sfxGain);
    o.start(t); o.stop(t + dur + 0.05);
  },
  bark(pitch, delay) {
    pitch = pitch || 1;
    const d = delay || 0;
    this.tone(330 * pitch, 0.13, { type: 'square', vol: 0.22, slide: 150 * pitch, delay: d });
    this.noise(0.1, { freq: 1300 * pitch, q: 2, vol: 0.25, delay: d });
    this.tone(300 * pitch, 0.11, { type: 'square', vol: 0.18, slide: 140 * pitch, delay: d + 0.19 });
    this.noise(0.08, { freq: 1200 * pitch, q: 2, vol: 0.2, delay: d + 0.19 });
  },
  purr(dur) {
    if (!this.ok()) return;
    const c = this.ctx, t = c.currentTime;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260;
    const gn = c.createGain(); gn.gain.value = 0;
    const lfo = c.createOscillator(); lfo.frequency.value = 24;
    const lg = c.createGain(); lg.gain.value = 0.22;
    lfo.connect(lg); lg.connect(gn.gain);
    const env = c.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(1, t + 0.15);
    env.gain.setValueAtTime(1, t + dur - 0.2);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(gn); gn.connect(env); env.connect(this.sfxGain);
    s.start(t); lfo.start(t); s.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
  },
  play(name, arg) {
    if (!this.ok() || !this.sfxOn) return;
    const f = SFX[name];
    if (f) f(arg);
  },
};

const NOTE_IDX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function noteFreq(n) {
  if (typeof n === 'number') return 440 * Math.pow(2, (n - 69) / 12);
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(n);
  if (!m) return 440;
  let s = NOTE_IDX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  const midi = 12 * (parseInt(m[3], 10) + 1) + s;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const SFX = {
  click: () => { Snd.tone(900, 0.05, { vol: 0.12, slide: 1300 }); },
  back: () => { Snd.tone(700, 0.06, { vol: 0.12, slide: 420 }); },
  tab: () => { Snd.tone(1200, 0.04, { vol: 0.1, type: 'triangle' }); },
  coin: () => { Snd.tone(988, 0.07, { vol: 0.16 }); Snd.tone(1319, 0.22, { vol: 0.16, delay: 0.07 }); },
  buy: () => { SFX.coin(); [1568, 2093, 2637].forEach((f, i) => Snd.tone(f, 0.12, { type: 'triangle', vol: 0.12, delay: 0.18 + i * 0.06 })); },
  error: () => { Snd.tone(196, 0.12, { vol: 0.15 }); Snd.tone(147, 0.18, { vol: 0.15, delay: 0.12 }); },
  pop: (p) => { Snd.tone(380 * (p || rnd(0.8, 1.4)), 0.06, { type: 'sine', vol: 0.25, slide: 900 * (p || 1) }); },
  sparkle: () => { [1568, 2093, 2637, 3136].forEach((f, i) => Snd.tone(f, 0.1, { type: 'triangle', vol: 0.09, delay: i * 0.045 })); },
  eat: () => { for (let i = 0; i < 3; i++) Snd.noise(0.06, { freq: 2200, q: 0.8, vol: 0.28, delay: i * 0.2, ftype: 'highpass' }); Snd.tone(220, 0.05, { vol: 0.08, delay: 0.1 }); },
  slurp: () => { Snd.tone(300, 0.15, { type: 'sine', vol: 0.2, slide: 700 }); Snd.tone(320, 0.15, { type: 'sine', vol: 0.2, slide: 720, delay: 0.22 }); },
  splash: () => { Snd.noise(0.45, { freq: 3000, slide: 400, ftype: 'lowpass', vol: 0.3 }); },
  water: () => { Snd.noise(0.12, { freq: 4000, q: 0.5, vol: 0.06, ftype: 'highpass' }); },
  swish: () => { Snd.noise(0.12, { freq: 2600, q: 1.5, vol: 0.14, att: 0.04 }); },
  jump: () => { Snd.tone(330, 0.14, { vol: 0.14, slide: 760 }); },
  land: () => { Snd.noise(0.05, { freq: 300, vol: 0.2, ftype: 'lowpass' }); },
  hurt: () => { Snd.noise(0.18, { freq: 800, vol: 0.3, slide: 200 }); Snd.tone(240, 0.22, { vol: 0.16, slide: 80 }); },
  catch: () => { Snd.tone(660, 0.06, { type: 'triangle', vol: 0.2 }); Snd.tone(990, 0.1, { type: 'triangle', vol: 0.2, delay: 0.05 }); },
  boop: () => { Snd.tone(620, 0.08, { vol: 0.16, slide: 300 }); Snd.tone(1800, 0.07, { type: 'sine', vol: 0.12, slide: 2600, delay: 0.05 }); },
  squeak: () => { Snd.tone(1900, 0.06, { type: 'sine', vol: 0.08, slide: 2500 }); },
  tick: () => { Snd.tone(1500, 0.02, { vol: 0.07, type: 'square' }); },
  type: () => { Snd.tone(rnd(1100, 1400), 0.025, { vol: 0.06 }); },
  bubble: () => { Snd.tone(rnd(200, 500), 0.05, { type: 'sine', vol: 0.14, slide: rnd(600, 1200) }); },
  hearts: () => { Snd.tone(784, 0.08, { type: 'triangle', vol: 0.12 }); Snd.tone(1047, 0.14, { type: 'triangle', vol: 0.12, delay: 0.08 }); },
  clean: () => { SFX.sparkle(); Snd.noise(0.2, { freq: 5000, ftype: 'highpass', vol: 0.06 }); },
  lamp: () => { Snd.tone(500, 0.04, { vol: 0.1 }); Snd.noise(0.03, { freq: 3000, vol: 0.1 }); },
  whoosh: () => { Snd.noise(0.35, { freq: 400, slide: 3000, q: 1.2, vol: 0.12 }); },
  snore: () => { Snd.noise(0.9, { freq: 220, ftype: 'lowpass', vol: 0.05, att: 0.5 }); },
  levelup: () => {
    const n = ['C5', 'E5', 'G5', 'C6', 'E6', 'G6'];
    n.forEach((x, i) => Snd.tone(noteFreq(x), 0.12, { type: 'p25', vol: 0.14, delay: i * 0.07 }));
    ['C6', 'E6', 'G6'].forEach((x) => Snd.tone(noteFreq(x), 0.6, { type: 'triangle', vol: 0.12, delay: 0.45 }));
  },
  fanfare: () => {
    const seq = [['G4', 0, 0.12], ['C5', 0.12, 0.12], ['E5', 0.24, 0.12], ['G5', 0.36, 0.3], ['E5', 0.68, 0.1], ['G5', 0.8, 0.6]];
    seq.forEach(([nn, d, l]) => { Snd.tone(noteFreq(nn), l, { type: 'p25', vol: 0.15, delay: d }); Snd.tone(noteFreq(nn) / 2, l, { type: 'triangle', vol: 0.15, delay: d }); });
  },
  quest: () => { ['E5', 'G5', 'C6', 'G5', 'C6', 'E6'].forEach((x, i) => Snd.tone(noteFreq(x), 0.1, { type: 'p25', vol: 0.12, delay: i * 0.08 })); },
  gift: () => { SFX.whoosh(); setTimeout(() => SFX.fanfare(), 250); },
  chime: () => {
    ['C6', 'E6', 'G6', 'C7'].forEach((x, i) => {
      Snd.tone(noteFreq(x), 1.4, { type: 'sine', vol: 0.18, delay: i * 0.12, att: 0.01 });
      Snd.tone(noteFreq(x) * 2, 0.6, { type: 'triangle', vol: 0.05, delay: i * 0.12 });
    });
  },
  simon: (i) => { const f = [330, 440, 554, 659][i]; Snd.tone(f, 0.3, { type: 'p25', vol: 0.14 }); Snd.tone(f / 2, 0.3, { type: 'triangle', vol: 0.14 }); },
  wrong: () => { Snd.tone(150, 0.4, { type: 'sawtooth', vol: 0.1, slide: 100 }); },
  evolve: () => { for (let i = 0; i < 10; i++) Snd.tone(300 + i * 90, 0.08, { type: 'p25', vol: 0.1, delay: i * 0.09 }); },
  meow: (p) => Snd.meow(p),
  bark: (p) => Snd.bark(p),
};

/* ---------- music sequencer ---------- */
function parseTrack(str) {
  const ev = [];
  let step = 0;
  for (const tok of str.trim().split(/[\s|]+/)) {
    if (!tok) continue;
    const [n, l] = tok.split(':');
    const len = parseInt(l || '1', 10);
    if (n !== '-') ev.push({ s: step, n, l: len });
    step += len;
  }
  return { ev, len: step };
}
const SONGS = {
  title: {
    bpm: 132,
    tracks: [
      { w: 'p25', v: 0.13, s: `E5:2 G5:2 C6:3 B5:1 A5:2 G5:2 E5:4 | F5:2 A5:2 C6:3 A5:1 G5:4 -:4 |
        E5:2 G5:2 C6:3 B5:1 A5:2 G5:2 E5:2 C5:2 | D5:2 E5:2 F5:2 D5:2 C5:4 -:4 |
        A4:2 C5:2 F5:3 E5:1 D5:2 C5:2 A4:4 | G4:2 B4:2 D5:3 C5:1 B4:4 -:4 |
        C5:2 E5:2 A5:3 G5:1 F5:2 E5:2 D5:2 C5:2 | D5:2 G5:2 B5:2 D6:2 C6:6 -:2` },
      { w: 'triangle', v: 0.22, s: `C3:2 C4:2 G3:2 C4:2 C3:2 C4:2 G3:2 C4:2 | F2:2 F3:2 C3:2 F3:2 F2:2 F3:2 C3:2 F3:2 |
        C3:2 C4:2 G3:2 C4:2 C3:2 C4:2 G3:2 C4:2 | G2:2 G3:2 D3:2 G3:2 G2:2 G3:2 D3:2 G3:2 |
        F2:2 F3:2 C3:2 F3:2 F2:2 F3:2 C3:2 F3:2 | G2:2 G3:2 D3:2 G3:2 G2:2 G3:2 D3:2 G3:2 |
        A2:2 A3:2 E3:2 A3:2 F2:2 F3:2 C3:2 F3:2 | G2:2 G3:2 D3:2 G3:2 C3:2 C4:2 G3:2 C4:2` },
      { w: 'drum', v: 0.12, s: 'k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 '.repeat(8) },
    ],
  },
  home: {
    bpm: 100,
    tracks: [
      { w: 'p25', v: 0.09, s: `A4:4 C5:2 A4:2 G4:4 F4:4 | G4:2 A4:2 Bb4:2 C5:2 D5:4 C5:4 | A4:4 C5:2 F5:2 E5:4 D5:4 | C5:2 D5:2 C5:2 Bb4:2 A4:8 |
        Bb4:4 D5:2 Bb4:2 A4:4 C5:4 | G4:2 A4:2 Bb4:2 A4:2 G4:8 | A4:4 C5:2 F5:2 E5:2 D5:2 C5:4 | G4:4 E5:4 F5:8` },
      { w: 'triangle', v: 0.2, s: `F2:4 C3:4 F2:4 C3:4 | G2:4 D3:4 G2:4 D3:4 | F2:4 C3:4 A2:4 C3:4 | C3:4 G2:4 F2:4 C3:4 |
        Bb2:4 F3:4 Bb2:4 F3:4 | C3:4 G2:4 C3:4 E3:4 | F2:4 C3:4 D3:4 A2:4 | C3:4 G2:4 F2:8` },
      { w: 'drum', v: 0.06, s: 'k:4 h:4 k:4 h:4 '.repeat(8) },
    ],
  },
  game: {
    bpm: 150,
    tracks: [
      { w: 'p25', v: 0.12, s: `A4:2 C5:2 E5:2 A5:2 G5:2 E5:2 C5:2 E5:2 | F5:2 E5:2 D5:2 C5:2 B4:2 C5:2 D5:4 |
        A4:2 C5:2 E5:2 A5:2 G5:2 E5:2 C5:2 E5:2 | F5:2 G5:2 A5:2 B5:2 C6:6 -:2` },
      { w: 'triangle', v: 0.22, s: `A2:2 A3:2 A2:2 A3:2 A2:2 A3:2 A2:2 A3:2 | D3:2 D4:2 D3:2 D4:2 G2:2 G3:2 G2:2 G3:2 |
        A2:2 A3:2 A2:2 A3:2 A2:2 A3:2 A2:2 A3:2 | F2:2 F3:2 F2:2 F3:2 G2:2 G3:2 C3:2 C4:2` },
      { w: 'drum', v: 0.13, s: 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 '.repeat(4) },
    ],
  },
  night: {
    bpm: 66,
    tracks: [
      { w: 'triangle', v: 0.14, s: 'E5:4 D5:4 C5:8 | E5:4 D5:4 C5:8 | G4:4 A4:4 C5:4 D5:4 | E5:4 D5:4 C5:8' },
      { w: 'sine', v: 0.12, s: 'C3:8 G3:8 | A2:8 E3:8 | F2:8 G2:8 | C3:16' },
    ],
  },
};
for (const k in SONGS) for (const tr of SONGS[k].tracks) Object.assign(tr, parseTrack(tr.s));

const Music = {
  cur: null, want: null, step: 0, next: 0, timer: null,
  play(name) {
    this.want = name;
    if (this.cur === name) return;
    this.cur = name; this.step = 0;
    if (Snd.ok()) this.next = Snd.ctx.currentTime + 0.08;
    this.ensure();
  },
  stop() { this.cur = null; this.want = null; },
  kick() { if (this.want) { const w = this.want; this.cur = null; this.play(w); } },
  ensure() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), 30);
  },
  tick() {
    if (!this.cur || !Snd.ok()) return;
    const song = SONGS[this.cur];
    const c = Snd.ctx;
    const spb = 60 / song.bpm / 4; // seconds per 16th
    if (this.next < c.currentTime - 0.5) this.next = c.currentTime + 0.05;
    const loopLen = Math.max(...song.tracks.map((t) => t.len));
    while (this.next < c.currentTime + 0.15) {
      const st = this.step % loopLen;
      for (const tr of song.tracks) {
        for (const e of tr.ev) if (e.s === st) this.note(tr, e, this.next, spb);
      }
      this.step++;
      this.next += spb;
    }
  },
  note(tr, e, t, spb) {
    const c = Snd.ctx, dest = Snd.musGain;
    if (tr.w === 'drum') {
      const g2 = c.createGain();
      if (e.n === 'k') {
        const o = c.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
        g2.gain.setValueAtTime(tr.v * 3, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
        o.connect(g2); g2.connect(dest); o.start(t); o.stop(t + 0.16);
      } else {
        const s = c.createBufferSource(); s.buffer = Snd.noiseBuf;
        const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = e.n === 's' ? 1200 : 7000;
        const d = e.n === 's' ? 0.12 : 0.035;
        g2.gain.setValueAtTime(tr.v * (e.n === 's' ? 1.6 : 0.9), t); g2.gain.exponentialRampToValueAtTime(0.0001, t + d);
        s.connect(f); f.connect(g2); g2.connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.01);
      }
      return;
    }
    const o = Snd.osc(tr.w);
    o.frequency.setValueAtTime(noteFreq(e.n), t);
    const g2 = c.createGain();
    const dur = e.l * spb;
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(tr.v, t + 0.01);
    g2.gain.setValueAtTime(tr.v, t + Math.max(0.02, dur * 0.6));
    g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.98);
    o.connect(g2); g2.connect(dest);
    o.start(t); o.stop(t + dur + 0.02);
  },
};

document.addEventListener('visibilitychange', () => {
  if (!Snd.ctx) return;
  if (document.hidden) Snd.ctx.suspend();
  else Snd.ctx.resume();
});
