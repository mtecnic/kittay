/* ================================================================
   Game state: save model, simulation, progression, quests
   ================================================================ */
let SAVE = null;   // current player's data
let SLOT = -1;     // 0..2
const SLOT_KEYS = ['s1', 's2', 's3'];
const CFG = { sfx: true, mus: true };
const RT = { pets: [], events: [], notified: new Set(), sleeping: false, messT: 200, lastSave: 0, giftChecked: false };

function loadCfg() {
  const c = SaveIO.read('cfg');
  if (c) { CFG.sfx = c.sfx !== false; CFG.mus = c.mus !== false; }
  Snd.setSfx(CFG.sfx); Snd.setMusic(CFG.mus);
}
function saveCfg() { SaveIO.write('cfg', { sfx: CFG.sfx, mus: CFG.mus, t: Date.now() }); }

function newPet(breed, name) {
  return { n: name, b: breed, lv: 1, xp: 0, s: [80, 80, 90, 85, 75], tr: TRICKS.map(() => 0), eq: { h: '', n: '', f: '' }, born: Date.now() };
}
function newSave(ownerName) {
  return {
    v: 1, t: Date.now(), n: ownerName, c: 60, ol: 1, ox: 0, ap: 0, p: [],
    inv: { fish: 2, milk: 1, cookie: 1 }, acc: [], room: ['wall_cream', 'floor_wood', 'bed', 'rug'], wall: 'wall_cream', floor: 'floor_wood', hide: [],
    st: {}, best: { yarn: 0, mouse: 0, run: 0 }, dq: null, aq: [], gift: '', streak: 0, mess: [], tut: 0, created: Date.now(),
  };
}
function fixSave(s) {
  // make older / partial saves safe to use
  const d = newSave(s.n || 'Player');
  for (const k in d) if (s[k] === undefined) s[k] = d[k];
  s.p = (s.p || []).filter((p) => p && BREEDS[p.b]);
  for (const p of s.p) {
    if (!p.s || p.s.length < 5) p.s = [80, 80, 80, 80, 80];
    if (!p.tr) p.tr = TRICKS.map(() => 0);
    while (p.tr.length < TRICKS.length) p.tr.push(0);
    if (!p.eq) p.eq = { h: '', n: '', f: '' };
    p.lv = p.lv || 1; p.xp = p.xp || 0;
  }
  if (s.ap >= s.p.length) s.ap = 0;
  return s;
}
function slotSummary(i) {
  const s = SaveIO.read(SLOT_KEYS[i]);
  if (!s || !s.p) return null;
  return fixSave(s);
}

const Game = {
  pet() { return SAVE && SAVE.p[SAVE.ap]; },
  rt(i) {
    if (i == null) i = SAVE.ap;
    if (!RT.pets[i]) RT.pets[i] = makePetRT();
    return RT.pets[i];
  },
  start(slot, save) {
    SLOT = slot; SAVE = fixSave(save);
    RT.pets = []; RT.events = []; RT.notified = new Set(); RT.sleeping = false; RT.giftChecked = false;
    this.applyOffline();
    this.refreshDaily();
    this.save();
  },
  save() {
    if (!SAVE || SLOT < 0) return;
    SAVE.t = Date.now();
    SaveIO.write(SLOT_KEYS[SLOT], SAVE);
    RT.lastSave = T;
  },
  applyOffline() {
    const e = clamp((Date.now() - (SAVE.t || Date.now())) / 1000, 0, 3 * 86400);
    if (e < 30) return;
    SAVE.p.forEach((p) => {
      const s = p.s;
      s[0] = Math.max(Math.min(s[0], 12), s[0] - (e / 40) * 0.12);
      s[1] = Math.max(Math.min(s[1], 20), s[1] - (e / 55) * 0.1);
      s[3] = Math.max(Math.min(s[3], 15), s[3] - (e / 110) * 0.15);
      s[4] = Math.max(Math.min(s[4], 15), s[4] - (e / 95) * 0.15);
      s[2] = Math.min(100, s[2] + e / 20);
    });
    const add = Math.min(3 - SAVE.mess.length, Math.floor(e / 2400));
    for (let i = 0; i < add; i++) SAVE.mess.push([rnd(0.12, 0.88), rnd(0.25, 0.85)]);
    RT.awayMins = Math.round(e / 60);
  },
  // simulation tick (only while actually playing)
  tick(dt) {
    if (!SAVE) return;
    const sleeping = RT.sleeping;
    const hasToys = this.hasFurn('toys');
    SAVE.p.forEach((p, i) => {
      const s = p.s;
      const act = i === SAVE.ap ? 1 : 0.5;
      const low = s[0] < 20 || s[3] < 20 || s[2] < 15;
      const messK = 1 + SAVE.mess.length * 0.4;
      if (sleeping && i === SAVE.ap) {
        s[2] = Math.min(100, s[2] + dt * (this.hasFurn('bed') ? 3 : 2));
        s[0] -= (dt / 40) * 0.5;
        s[1] -= (dt / 55) * 0.3;
      } else {
        s[0] -= (dt / 40) * act;
        s[1] -= (dt / 55) * act * (hasToys ? 0.75 : 1) * (low ? 1.6 : 1) * (1 + SAVE.mess.length * 0.2);
        s[2] -= (dt / 75) * act;
      }
      s[3] -= (dt / 110) * act * messK;
      s[4] -= (dt / 95) * act;
      for (let k = 0; k < 5; k++) s[k] = clamp(s[k], 0, 100);
    });
    if (!sleeping) {
      RT.messT -= dt;
      if (RT.messT <= 0) {
        RT.messT = rnd(160, 320);
        if (SAVE.mess.length < 3) SAVE.mess.push([rnd(0.12, 0.88), rnd(0.25, 0.85)]);
      }
    }
    if (T - RT.lastSave > 8) this.save();
  },
  hasFurn(id) { return SAVE.room.includes(id) && !SAVE.hide.includes(id); },
  addCoins(n, fx, fy) {
    if (n <= 0) return;
    SAVE.c += n;
    this.stat('coinsMax', Math.max(this.statv('coinsMax'), SAVE.c), true);
    this.track('coins', n);
    if (fx != null) {
      const k = Math.min(10, Math.ceil(n / 4));
      for (let i = 0; i < k; i++) {
        Particles.add({ type: 'coin', x0: fx + rnd(-6, 6), y0: fy + rnd(-6, 6), tx: HUD_COIN.x, ty: HUD_COIN.y, arc: rnd(-20, 20), life: 0.6 + i * 0.06, layer: 1 });
      }
      setTimeout(() => Snd.play('coin'), 500);
    }
  },
  spend(n) {
    if (SAVE.c < n) return false;
    SAVE.c -= n;
    return true;
  },
  statv(k) { return SAVE.st[k] || 0; },
  stat(k, v, set) {
    SAVE.st[k] = set ? v : (SAVE.st[k] || 0) + (v == null ? 1 : v);
    this.checkAdventures();
  },
  addXP(n, petIdx) {
    const p = petIdx != null ? SAVE.p[petIdx] : this.pet();
    if (!p) return;
    const oldStage = stageOf(p);
    p.xp += n;
    while (p.xp >= petXpNeed(p.lv) && p.lv < 99) {
      p.xp -= petXpNeed(p.lv); p.lv++;
      RT.events.push({ type: 'level', pet: p });
    }
    const ns = stageOf(p);
    if (ns !== oldStage) RT.events.push({ type: 'grow', pet: p, from: oldStage, to: ns });
    SAVE.ox += n;
    while (SAVE.ox >= ownerXpNeed(SAVE.ol)) {
      SAVE.ox -= ownerXpNeed(SAVE.ol); SAVE.ol++;
      RT.events.push({ type: 'star', lv: SAVE.ol });
    }
    this.stat('maxLv', Math.max(...SAVE.p.map((q) => q.lv)), true);
    this.stat('ownerLv', SAVE.ol, true);
  },
  // need changes with floating feedback
  boost(idx, amt, x, y, petIdx) {
    const p = petIdx != null ? SAVE.p[petIdx] : this.pet();
    const before = p.s[idx];
    p.s[idx] = clamp(p.s[idx] + amt, 0, 100);
    const d = Math.round(p.s[idx] - before);
    if (x != null && d !== 0) {
      Particles.add({ type: 'icon', icon: NEEDS[idx].icon, x: x - 10, y, vy: -22, life: 1.2, layer: 1 });
      floatText((d > 0 ? '+' : '') + d, x + 4, y - 3, d > 0 ? '#ffffff' : '#ff8a8a');
    }
    return d;
  },
  /* ---- quests ---- */
  refreshDaily() {
    const dk = dayKey();
    if (SAVE.dq && SAVE.dq.d === dk) return;
    const rng = mulberry(daySeed() * 7 + SLOT * 101 + SAVE.created % 997);
    const hasTrick = SAVE.p.some((p) => p.tr.some((v) => v >= TRICK_SESSIONS));
    const pool = DAILY.map((q, i) => i).filter((i) => (DAILY[i].lv || 1) <= SAVE.ol && (!DAILY[i].needTrick || hasTrick));
    const chosen = [];
    while (chosen.length < 3 && pool.length) chosen.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
    SAVE.dq = { d: dk, q: chosen.map((i) => [i, 0, 0]), bonus: 0 };
  },
  track(ev, n) {
    if (!SAVE) return;
    n = n == null ? 1 : n;
    this.refreshDaily();
    for (const q of SAVE.dq.q) {
      const def = DAILY[q[0]];
      if (def.ev !== ev || q[2]) continue;
      const was = q[1] >= def.n;
      q[1] = def.max ? Math.max(q[1], n) : q[1] + n;
      if (!was && q[1] >= def.n) { Toasts.add('Quest done: ' + def.text + '! Claim it in Quests.', 'scroll', 'sun'); Snd.play('quest'); }
    }
  },
  advProgress(a) {
    let v;
    switch (a.stat) {
      case 'accs': v = SAVE.acc.length; break;
      case 'decor': v = SAVE.room.filter((r) => ROOM_BY_ID[r] && ROOM_BY_ID[r].price > 0).length; break;
      case 'petCount': v = SAVE.p.length; break;
      case 'dogs': v = SAVE.p.filter((p) => BREEDS[p.b].kind === 'dog').length; break;
      case 'best_run': v = SAVE.best.run; break;
      case 'tricksLearned': v = Math.max(0, ...SAVE.p.map((p) => p.tr.filter((x) => x >= TRICK_SESSIONS).length)); break;
      case 'streak': v = SAVE.streak; break;
      case 'ownerLv': v = SAVE.ol; break;
      case 'maxLv': v = Math.max(...SAVE.p.map((p) => p.lv), 1); break;
      default: v = SAVE.st[a.stat] || 0;
    }
    return Math.min(v, a.n);
  },
  checkAdventures() {
    for (const a of ADVENTURES) {
      if (SAVE.aq.includes(a.id) || RT.notified.has(a.id)) continue;
      if (this.advProgress(a) >= a.n) {
        RT.notified.add(a.id);
        Toasts.add('Adventure complete: ' + a.text + '!', 'trophy', 'sun');
      }
    }
  },
  claimableCount() {
    if (!SAVE) return 0;
    let n = 0;
    if (SAVE.dq) for (const q of SAVE.dq.q) if (!q[2] && q[1] >= DAILY[q[0]].n) n++;
    if (SAVE.dq && !SAVE.dq.bonus && SAVE.dq.q.every((q) => q[2])) n++;
    for (const a of ADVENTURES) if (!SAVE.aq.includes(a.id) && this.advProgress(a) >= a.n) n++;
    return n;
  },
  learnedTricks(p) { p = p || this.pet(); return TRICKS.filter((t, i) => p.tr[i] >= TRICK_SESSIONS); },
  isDog(p) { p = p || this.pet(); return BREEDS[p.b].kind === 'dog'; },
  voice(p, pitchMul) {
    p = p || this.pet();
    const pitch = [1.35, 1.15, 1][stageOf(p)] * (pitchMul || 1);
    if (this.isDog(p)) Snd.play('bark', pitch); else Snd.play('meow', pitch);
  },
};
let HUD_COIN = { x: 300, y: 10 };

/* runtime (non-saved) state for a pet in the room */
function makePetRT() {
  return {
    x: W / 2, y: 0, tx: W / 2, state: 'idle', t: 0, dur: 2, face: 1, expr: 'open', blinkT: rnd(2, 4), blink: 0,
    jump: 0, jumpV: 0, bubble: null, bubbleT: 6, legs: 0, onDone: null, petting: 0, trick: null, sayT: 0, say: '', squash: 0,
  };
}
