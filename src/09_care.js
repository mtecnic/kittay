/* ================================================================
   Care scenes: Brush, Bath (groom), Training (trick school)
   ================================================================ */
Object.assign(ICON_ART, {
  soap: ['..pppppp..', '.pwpppppp.', 'pwppppppPp', 'ppppppppPP', '.PPPPPPPP.'],
  duck: ['..yy....', '.yyyy...', '.yKyyoo.', '.yyyy...', 'yyyyyyyy', 'yyyyyyyY', '.yyyyyY.'],
  shower: ['..ssssss..', '.sWWWWWWs.', 'sSSSSSSSSs', '.b.b.b.b..'],
  towel: ['pppppppppp', 'pwwwwwwwwp', 'pppppppppp', 'ppPPppPPpp', 'pppppppppp', 'ppPPppPPpp', 'pppppppppp', 'pwwwwwwwwp', 'pppppppppp'],
});

function careStage() {
  // geometry shared by brush & bath: big pet in the middle
  const sc = Math.min(H, W) >= 300 ? 4 : 3;
  const gy = PORTRAIT ? Math.round(H * 0.62) : H - 34;
  return { sc, x: Math.round(W / 2), gy };
}
// list of opaque sprite pixels (in sprite space), used to place tangles / bubbles on the pet
function spritePixels(pet, st) {
  const c = petSprite(pet, st);
  const d = c.getContext('2d').getImageData(0, 0, PW, PH).data;
  const pts = [];
  for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) if (d[(y * PW + x) * 4 + 3] > 0) pts.push([x, y]);
  return pts;
}
function careDone(title, lines, onOk) {
  const ov = pushOverlay({
    t: 0, update(dt) { this.t += dt; },
    draw() {
      g.fillStyle = 'rgba(18,10,30,0.45)'; g.fillRect(0, 0, W, H);
      const k = Ease.outBack(clamp(this.t / 0.3, 0, 1));
      const w = Math.min(W - 30, 200), h = 58 + lines.length * 11, x = W / 2 - w / 2, y = 30 + (1 - k) * -80;
      panel(x, y, w, h, { title, color: 'mint' });
      lines.forEach((l, i) => text(l, W / 2, y + 14 + i * 11, { align: 'center', color: COL.ink }));
      if (button('cdok', W / 2 - 40, y + h - 30, 80, 22, { label: 'Done', color: 'pink' })) { popOverlay(ov); onOk(); }
    },
  });
}

/* ---------- Brush ---------- */
Scenes.brush = {
  sim: true,
  enter() {
    const pet = Game.pet();
    this.t = 0; this.done = false; this.swT = 0; this.startCoat = pet.s[4];
    const n = clamp(Math.round((100 - pet.s[4]) / 12) + 3, 3, 9);
    const pts = spritePixels(pet, { expr: 'open', noAcc: true }).filter(([x, y]) => y < POY - 3);
    this.tangles = [];
    let guard = 0;
    while (this.tangles.length < n && guard++ < 500) {
      const [px, py] = pick(pts);
      if (this.tangles.some((t) => Math.hypot(t.px - px, t.py - py) < 6)) continue;
      this.tangles.push({ px, py, hp: 1, seed: rnd(10) });
    }
    this.total = this.tangles.length;
    Music.play('home');
  },
  leave() { Game.save(); },
  scr(t) { const S = careStage(); return [S.x + (t.px - POX) * S.sc, S.gy + (t.py - POY) * S.sc]; },
  update(dt) {
    this.t += dt;
    if (this.done || overlays.length) return;
    const pet = Game.pet();
    if (I.down && UI.on) {
      const sp = Math.hypot(I.dx, I.dy);
      if (sp > 0.5) {
        this.swT -= dt;
        if (this.swT <= 0) { this.swT = 0.16; Snd.play('swish'); }
        for (const tg of this.tangles) {
          if (tg.hp <= 0) continue;
          const [sx, sy] = this.scr(tg);
          if (Math.hypot(I.x - sx, I.y - sy) < 14) {
            tg.hp -= sp * 0.012;
            if (Math.random() < 0.4) Particles.add({ type: 'pixel', x: sx, y: sy, vx: rnd(-30, 30), vy: rnd(-40, -10), g: 60, life: 0.8, size: 2, color: BREEDS[pet.b].fur[0], layer: 1 });
            if (tg.hp <= 0) {
              Snd.play('pop');
              burst('pixel', sx, sy, 10, { speed: 60, props: { size: 2, color: BREEDS[pet.b].fur[1], g: 80, layer: 1 } });
              burst('sparkle', sx, sy, 3, { speed: 30, props: { size: 3, color: '#ffffff', layer: 1 } });
            }
          }
        }
      }
    }
    const left = this.tangles.filter((t) => t.hp > 0).length;
    if (left === 0 && !this.done) {
      this.done = true;
      const S = careStage();
      Snd.play('sparkle'); Snd.purr(1.5);
      burst('sparkle', S.x, S.gy - 40 * S.sc / 2, 24, { speed: 100, props: { size: 4, color: '#ffffff', layer: 1 }, life: 1.4 });
      const need = 100 - this.startCoat;
      pet.s[4] = 100;
      Game.boost(1, 8);
      const xp = 8 + Math.round(need / 10);
      Game.addXP(xp);
      Game.addCoins(4, S.x, S.gy - 60);
      Game.track('brush'); Game.stat('brushes');
      setTimeout(() => careDone('So fluffy!', [pet.n + ' looks amazing!', 'Fluff 100%   +' + xp + ' XP'], () => go('home')), 900);
    }
  },
  draw(dt) {
    const pet = Game.pet(), S = careStage();
    // salon background
    rect(0, 0, W, H, '#ffe6f2');
    for (let y = 0; y < S.gy; y += 16) for (let x = (y / 16) % 2 ? 8 : 0; x < W; x += 16) rect(x + 6, y + 6, 3, 3, '#ffd0e6');
    rect(0, S.gy - 6, W, H - S.gy + 6, '#c3a8ff');
    for (let x = 0; x < W; x += 12) rect(x, S.gy - 6, 6, H - S.gy + 6, '#b498f4');
    rect(0, S.gy - 7, W, 2, COL.ink);
    // little pedestal
    ellipseFill(S.x, S.gy, 18 * S.sc, 3 * S.sc, COL.ink);
    ellipseFill(S.x, S.gy - 1, 18 * S.sc - 1, 3 * S.sc - 1, '#ffffff');
    const brushing = I.down && UI.on && !this.done;
    drawPet(pet, S.x, S.gy, S.sc, { expr: this.done ? 'love' : brushing ? 'purr' : 'open', tail: Math.round(Math.sin(T * (brushing ? 8 : 2)) * 2), noAcc: true });
    // tangles
    const fur = BREEDS[pet.b];
    for (const tg of this.tangles) {
      if (tg.hp <= 0) continue;
      const [sx, sy] = this.scr(tg);
      const r = 3 + tg.hp * 4;
      const wob = Math.sin(T * 6 + tg.seed) * 0.5;
      for (let k = 0; k < 9; k++) {
        const a = tg.seed + k * 2.3 + wob;
        const rr = r * (0.4 + (k % 3) * 0.3);
        rect(sx + Math.cos(a) * rr - 1, sy + Math.sin(a * 1.3) * rr - 1, 3, 3, fur.outline);
      }
      for (let k = 0; k < 9; k++) {
        const a = tg.seed + k * 2.3 + wob;
        const rr = r * (0.4 + (k % 3) * 0.3);
        rect(sx + Math.cos(a) * rr - 1, sy + Math.sin(a * 1.3) * rr - 1, 2, 2, k % 2 ? fur.fur[1] : (fur.pat || fur.fur)[1]);
      }
    }
    ribbon(W / 2, 6, 'Brush Time!', 'mint');
    const left = this.tangles.filter((t) => t.hp > 0).length;
    const prog = 1 - left / Math.max(1, this.total);
    bar(W / 2 - 60, 26, 120, 8, prog, '#c3a8ff');
    if (!this.done && this.t < 4) text('Brush away the tangles!', W / 2, 38, { align: 'center', color: COL.ink });
    if (backButton('bback', 6, 6)) {
      pet.s[4] = clamp(this.startCoat + (100 - this.startCoat) * prog, 0, 100);
      go('home');
    }
    // the brush follows your finger
    if (I.x > -100) {
      const bx = I.x + 4, by = I.y - 6;
      iconC('brush', bx, by, 2);
    }
  },
};

/* ---------- Bath (Groom) ---------- */
Scenes.bath = {
  sim: true,
  enter() {
    this.t = 0; this.step = 0; this.bubbles = []; this.drops = []; this.wet = 1; this.acc = 0; this.done = false; this.sfxT = 0;
    this.pts = spritePixels(Game.pet(), { expr: 'open', noAcc: true }).filter(([x, y]) => y < POY - 2);
    this.maxBubbles = 30;
    this.startClean = Game.pet().s[3];
    Music.play('home');
  },
  leave() { Game.save(); },
  onPet(x, y) {
    const S = careStage();
    const px = Math.round((x - S.x) / S.sc + POX), py = Math.round((y - S.gy) / S.sc + POY);
    return this.pts.some(([a, b]) => Math.abs(a - px) <= 1 && Math.abs(b - py) <= 1);
  },
  update(dt) {
    this.t += dt;
    if (this.done || overlays.length) return;
    const S = careStage(), pet = Game.pet();
    const moving = I.down && UI.on && Math.hypot(I.dx, I.dy) > 0.5;
    if (this.step === 0) {
      if (moving && this.onPet(I.x, I.y)) {
        this.acc += Math.hypot(I.dx, I.dy);
        if (this.acc > 7 && this.bubbles.length < 40) {
          this.acc = 0;
          this.bubbles.push({ x: (I.x - S.x) / S.sc + rnd(-2, 2), y: (I.y - S.gy) / S.sc + rnd(-2, 2), r: rnd(2, 4.5) });
          Snd.play('bubble');
        }
      }
      if (this.bubbles.length >= this.maxBubbles) { this.step = 1; Snd.play('sparkle'); this.total = this.bubbles.length; }
    } else if (this.step === 1) {
      if (I.down && UI.on) {
        this.sfxT -= dt;
        if (this.sfxT <= 0) { this.sfxT = 0.12; Snd.play('water'); }
        for (let k = 0; k < 3; k++) this.drops.push({ x: I.x + rnd(-8, 8), y: I.y + 8, vy: rnd(120, 180) });
      }
      for (const d of this.drops) {
        d.y += d.vy * dt;
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
          const b = this.bubbles[i];
          const bx = S.x + b.x * S.sc, by = S.gy + b.y * S.sc;
          if (Math.hypot(d.x - bx, d.y - by) < b.r * S.sc * 0.5 + 3) {
            this.bubbles.splice(i, 1);
            Snd.play('pop');
            Particles.add({ type: 'ring', x: bx, y: by, r: 6, life: 0.25, color: '#ffffff', layer: 1 });
            d.y = H + 10;
            break;
          }
        }
      }
      this.drops = this.drops.filter((d) => d.y < S.gy + 6);
      if (this.bubbles.length === 0) { this.step = 2; Snd.play('sparkle'); this.drops = []; }
    } else if (this.step === 2) {
      if (moving && this.onPet(I.x, I.y)) {
        this.wet -= Math.hypot(I.dx, I.dy) / 600;
        this.sfxT -= dt;
        if (this.sfxT <= 0) { this.sfxT = 0.2; Snd.play('swish'); }
      }
      if (Math.random() < dt * 6 * this.wet) Particles.add({ type: 'drop', x: S.x + rnd(-14, 14) * S.sc, y: S.gy - rnd(5, 30) * S.sc, vy: 40, g: 200, life: 0.6, layer: 1 });
      if (this.wet <= 0) {
        this.done = true; this.step = 3;
        const need = 100 - this.startClean;
        pet.s[3] = 100;
        Game.boost(1, 5);
        const xp = 10 + Math.round(need / 10);
        Game.addXP(xp);
        Game.addCoins(5, S.x, S.gy - 60);
        Game.track('bath'); Game.stat('baths');
        Snd.play('clean'); Game.voice(pet);
        burst('sparkle', S.x, S.gy - 60, 26, { speed: 110, props: { size: 4, color: '#ffffff', layer: 1 }, life: 1.4 });
        setTimeout(() => careDone('Squeaky clean!', [pet.n + ' smells so nice!', 'Clean 100%   +' + xp + ' XP'], () => go('home')), 900);
      }
    }
  },
  draw(dt) {
    const pet = Game.pet(), S = careStage();
    const dog = Game.isDog(pet);
    // tiles
    rect(0, 0, W, H, '#bfe6ff');
    for (let y = 0; y < H; y += 12) rect(0, y, W, 1, '#e8f6ff');
    for (let x = 0; x < W; x += 12) rect(x, 0, 1, H, '#e8f6ff');
    rect(0, S.gy + 4, W, H - S.gy, '#7ab8e8');
    for (let x = 0; x < W; x += 16) rect(x, S.gy + 4, 8, H - S.gy, '#6aa8dc');
    // tub back
    const tw = 30 * S.sc, ty = S.gy - 8 * S.sc;
    rrect(S.x - tw / 2 - 2, ty - 3, tw + 4, 10, COL.ink, 3);
    rrect(S.x - tw / 2, ty - 2, tw, 6, '#e8e8f8', 2);
    // pet
    let expr = 'open';
    if (this.step === 0) expr = dog ? 'happy' : 'wow';
    else if (this.step === 1) expr = dog ? 'happy' : 'grumpy';
    else if (this.step === 2) expr = 'happy';
    else expr = 'love';
    drawPet(pet, S.x, S.gy, S.sc, { expr, noAcc: true, wet: this.step >= 1 && this.step < 3, tail: Math.round(Math.sin(T * 3) * 2) });
    // bubbles on the pet
    for (const b of this.bubbles) {
      const bx = S.x + b.x * S.sc, by = S.gy + b.y * S.sc + Math.sin(T * 3 + b.r) * 1;
      disc(bx, by, b.r * S.sc * 0.5 + 1, '#a8d8ff');
      disc(bx, by, b.r * S.sc * 0.5, '#ffffff');
      rect(bx - 2, by - 3, 2, 2, '#e0f4ff');
    }
    // tub front
    rrect(S.x - tw / 2 - 3, ty, tw + 6, 9 * S.sc, COL.ink, 4);
    rrect(S.x - tw / 2 - 2, ty + 1, tw + 4, 9 * S.sc - 2, '#ffffff', 3);
    rect(S.x - tw / 2 + 2, ty + 3, tw - 4, 2, '#e0e0f0');
    rect(S.x - tw / 2 + 4, ty + 9 * S.sc - 6, tw - 8, 2, '#d0d0e8');
    for (const fx of [-tw / 2 + 6, tw / 2 - 10]) { rrect(S.x + fx, ty + 9 * S.sc - 2, 6, 6, COL.ink, 1); rect(S.x + fx + 1, ty + 9 * S.sc - 1, 4, 4, '#ffd84a'); }
    iconC('duck', S.x + tw / 2 - 14, ty - 6 + Math.sin(T * 3) * 1, 2);
    // water drops
    for (const d of this.drops) rect(d.x, d.y, 1, 3, '#4fb4ff');
    // instructions & progress
    const steps = ['Scrub with soap!', 'Rinse off the bubbles!', 'Dry with the towel!', 'All clean!'];
    ribbon(W / 2, 6, 'Bath Time', 'sky');
    const prog = this.step === 0 ? this.bubbles.length / this.maxBubbles : this.step === 1 ? 1 - this.bubbles.length / Math.max(1, this.total) : this.step === 2 ? 1 - this.wet : 1;
    [0, 1, 2].forEach((i) => {
      const cx = W / 2 - 30 + i * 30, cy = 32;
      disc(cx, cy, 9, COL.ink);
      disc(cx, cy, 8, i < this.step ? '#4fd1a5' : i === this.step ? '#ffd84a' : '#d8d0e8');
      iconC(['soap', 'shower', 'towel'][i], cx, cy, 1);
    });
    bar(W / 2 - 50, 44, 100, 6, prog, '#4fb4ff');
    text((this.step + 1 > 3 ? '' : this.step + 1 + '. ') + steps[this.step], W / 2, 54, { align: 'center', color: COL.ink, outline: '#ffffff' });
    if (backButton('baback', 6, 6)) {
      if (this.step > 0) pet.s[3] = clamp(this.startClean + (100 - this.startClean) * (this.step / 3), 0, 100);
      go('home');
    }
    // tool at finger
    if (I.x > -100 && this.step < 3) {
      if (this.step === 0) iconC('soap', I.x, I.y - 4, 2);
      if (this.step === 1) { iconC('shower', I.x, I.y, 2); rect(I.x - 1, I.y - 30, 3, 24, '#a8a0b8'); }
      if (this.step === 2) iconC('towel', I.x, I.y - 4, 2);
    }
  },
};

/* ---------- Training: repeat the commands (Simon says) ---------- */
const COMMANDS = [
  { name: 'Sit', icon: '↓', color: 'sky', pose: 'sit' },
  { name: 'Paw', icon: 'paw', color: 'pink', pose: 'paw' },
  { name: 'Spin', icon: 'star', color: 'sun', pose: 'spin' },
  { name: 'Jump', icon: '↑', color: 'mint', pose: 'jump' },
];
Scenes.train = {
  sim: true,
  enter() {
    const pet = Game.pet();
    this.trick = pet.tr.findIndex((v) => v < TRICK_SESSIONS);
    this.practice = this.trick < 0;
    this.target = this.practice ? 6 : 3 + Math.floor(this.trick / 2);
    this.newSession();
    Music.play('game');
  },
  leave() { Game.save(); },
  newSession() {
    this.seq = [rndi(0, 3), rndi(0, 3)];
    this.phase = 'intro'; this.pt = 0; this.idx = 0; this.inIdx = 0; this.anim = null; this.lit = -1; this.charged = false;
  },
  act(i) {
    this.anim = { pose: COMMANDS[i].pose, t: 0 };
    this.lit = i; this.litT = 0.35;
    Snd.play('simon', i);
  },
  update(dt) {
    const pet = Game.pet();
    this.pt += dt;
    if (this.anim) { this.anim.t += dt; if (this.anim.t > 0.6) this.anim = null; }
    if (this.litT > 0) { this.litT -= dt; if (this.litT <= 0) this.lit = -1; }
    switch (this.phase) {
      case 'intro': if (this.pt > 1.2) { this.phase = 'show'; this.pt = 0; this.idx = 0; } break;
      case 'show':
        if (this.pt > 0.3 + this.idx * 0.75 && this.idx < this.seq.length) { this.act(this.seq[this.idx]); this.idx++; }
        if (this.idx >= this.seq.length && this.pt > 0.3 + this.seq.length * 0.75) { this.phase = 'input'; this.pt = 0; this.inIdx = 0; }
        break;
      case 'good':
        if (this.pt > 1.0) {
          if (this.seq.length >= this.target) this.finish(true);
          else { this.seq.push(rndi(0, 3)); this.phase = 'show'; this.pt = 0; this.idx = 0; }
        }
        break;
    }
  },
  press(i) {
    if (this.phase !== 'input') return;
    this.act(i);
    if (this.seq[this.inIdx] === i) {
      this.inIdx++;
      if (this.inIdx >= this.seq.length) {
        this.phase = 'good'; this.pt = 0;
        Snd.play('catch');
        burst('star', W / 2, H * 0.4, 6, { speed: 60, props: { layer: 1 } });
      }
    } else {
      Snd.play('wrong');
      this.anim = { pose: 'dizzy', t: 0 };
      this.finish(false);
    }
  },
  finish(ok) {
    const pet = Game.pet();
    this.phase = ok ? 'win' : 'fail'; this.pt = 0;
    Game.track('train'); Game.stat('trains');
    Game.boost(2, ok ? -10 : -5);
    let learned = null;
    if (ok) {
      Game.addXP(15); Game.boost(1, 6);
      Game.addCoins(5, W / 2, H / 2);
      if (!this.practice) {
        pet.tr[this.trick]++;
        if (pet.tr[this.trick] >= TRICK_SESSIONS) learned = TRICKS[this.trick];
      }
      Snd.play(learned ? 'fanfare' : 'levelup');
      confetti(learned ? 90 : 40);
    } else Game.addXP(5);
    Game.checkAdventures();
    Game.save();
    this.learned = learned;
  },
  draw(dt) {
    const pet = Game.pet();
    // stage background
    const bg = gradientCanvasCached('train', ['#3a2a6a', '#6a4aa8', '#a87ad8']);
    g.drawImage(bg, 0, 0);
    const port = PORTRAIT;
    const btnH = port ? 46 : 40;
    const btnTop = port ? H - btnH * 2 - 16 : H - btnH - 10;
    const gy = btnTop - 14;
    // spotlight + mat
    g.globalAlpha = 0.18;
    for (let y = 40; y < gy; y++) { const hw = 10 + (y - 40) * 0.5; rect(W / 2 - hw, y, hw * 2, 1, '#fff8c0'); }
    g.globalAlpha = 1;
    ellipseFill(W / 2, gy, 52, 9, COL.ink); ellipseFill(W / 2, gy - 1, 51, 8, '#ff6fa8'); ellipseFill(W / 2, gy - 1, 40, 5, '#ff9ac8');
    // pet animation
    let st = { expr: 'open', tail: Math.round(Math.sin(T * 3) * 2), breath: Math.floor(T * 1.6) % 2 }, dx = 0, dy = 0;
    if (this.anim) {
      const k = clamp(this.anim.t / 0.6, 0, 1);
      if (this.anim.pose === 'dizzy') { st.expr = 'dizzy'; dx = Math.sin(k * 30) * 2; }
      else if (this.anim.pose === 'jump') { dy = -Math.sin(k * Math.PI) * 26; st.expr = 'happy'; }
      else { const tp = trickPose(this.anim.pose, k, pet); Object.assign(st, tp.st); dx = tp.dx; dy = tp.dy; }
    }
    if (this.phase === 'win') { st.expr = 'star'; dy = -Math.abs(Math.sin(this.pt * 6)) * 10; }
    if (this.phase === 'fail') st.expr = 'sad';
    if (this.phase === 'input' && !this.anim) st.expr = 'open';
    const sc = gy - 64 >= petHeight(pet, 'sit') * 3 + 10 ? 3 : 2;
    shadowEllipse(W / 2, gy, 18, 3, 0.25);
    drawPet(pet, W / 2 + dx, gy + dy, sc, st);
    // header
    ribbon(W / 2, 6, this.practice ? 'Practice Time!' : 'Trick School', 'sun');
    if (backButton('tback', 6, 6)) go('home');
    if (!this.practice) {
      const tr = TRICKS[this.trick];
      text('Learning: ' + tr.name, W / 2, 26, { align: 'center', color: '#ffffff', outline: COL.ink });
      for (let i = 0; i < TRICK_SESSIONS; i++) iconC('star', W / 2 - (TRICK_SESSIONS - 1) * 7 + i * 14, 42, 1, i < pet.tr[this.trick] ? {} : { sil: '#5a4a8a' });
    } else text('You know every trick! Keep practicing.', W / 2, 26, { align: 'center', color: '#ffffff', outline: COL.ink });
    // round pips
    for (let i = 0; i < this.target; i++) {
      const filled = i < this.seq.length - (this.phase === 'show' || this.phase === 'intro' || this.phase === 'input' ? 0 : 0);
      disc(W / 2 - (this.target - 1) * 5 + i * 10, 54, 3, COL.ink);
      disc(W / 2 - (this.target - 1) * 5 + i * 10, 54, 2, i < this.seq.length ? '#ffd84a' : '#5a4a8a');
      void filled;
    }
    // speech
    const bubbleY = gy - petHeight(pet, 'sit') * sc - 6;
    const msg = { intro: 'Watch me!', show: 'Watch me!', input: 'Your turn!', good: 'Yay!', win: 'I did it!', fail: 'Oops!' }[this.phase];
    drawBubble(W / 2 + 16, bubbleY, null, msg);
    if (this.phase === 'input') text('Tap ' + (this.inIdx + 1) + ' of ' + this.seq.length, W / 2, gy + 6, { align: 'center', color: '#ffffff', outline: COL.ink });
    // command buttons
    const cols = port ? 2 : 4;
    const bw = Math.floor((W - 20 - (cols - 1) * 6) / cols);
    COMMANDS.forEach((c, i) => {
      const r = Math.floor(i / cols), cI = i % cols;
      const bx = 10 + cI * (bw + 6), by = btnTop + r * (btnH + 6);
      const lit = this.lit === i;
      const isIcon = c.icon.length > 1;
      if (button('cmd' + i, bx, by, bw, btnH, { label: c.name, icon: isIcon ? c.icon : null, color: c.color, stack: isIcon, disabled: this.phase !== 'input' && !lit, bg: lit ? '#ffffff' : null, sfx: 'none', scale: isIcon ? 1 : 1 })) this.press(i);
      if (!isIcon) text(c.icon, bx + bw / 2, by + 6, { align: 'center', color: lit ? BTN[c.color].d : '#ffffff', scale: 2, shadow: lit ? null : BTN[c.color].d });
    });
    // end panels
    if (this.phase === 'win' || this.phase === 'fail') {
      const w = Math.min(W - 30, 220), h = 92, x = W / 2 - w / 2, y = 64;
      panel(x, y, w, h, { title: this.phase === 'win' ? (this.learned ? 'NEW TRICK!' : 'Great job!') : 'Almost!', color: this.phase === 'win' ? 'pink' : 'sky' });
      let l1, l2;
      if (this.phase === 'win') {
        if (this.learned) { l1 = pet.n + ' learned ' + this.learned.name + '!'; l2 = 'Show it off with the wand button!'; }
        else if (this.practice) { l1 = 'Super practice!'; l2 = '+15 XP'; }
        else { const left = TRICK_SESSIONS - pet.tr[this.trick]; l1 = '+15 XP'; l2 = left + ' more class' + (left > 1 ? 'es' : '') + ' to learn ' + TRICKS[this.trick].name; }
      } else { l1 = 'That was a tricky one!'; l2 = 'Want to try again?'; }
      text(l1, W / 2, y + 16, { align: 'center', color: COL.ink });
      wrapText(l2, w - 20).forEach((l, i) => text(l, W / 2, y + 30 + i * 10, { align: 'center', color: COL.grayD }));
      const bw2 = (w - 30) / 2;
      const again = this.phase === 'fail' || !this.learned;
      if (again && pet.s[2] >= 10) { if (button('tagain', x + 10, y + h - 30, bw2, 22, { label: 'Again', color: 'sun' })) { this.enter(); } }
      if (button('tdone', again && pet.s[2] >= 10 ? x + 20 + bw2 : W / 2 - bw2 / 2, y + h - 30, bw2, 22, { label: 'Done', color: 'pink' })) go('home');
    }
  },
};
const _gradCache = {};
function gradientCanvasCached(name, stops) {
  const key = name + W + 'x' + H;
  if (!_gradCache[key]) _gradCache[key] = gradientCanvas(W, H, stops);
  return _gradCache[key];
}
