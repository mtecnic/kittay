/* ================================================================
   Mini-games: Treat Catch, Mouse Pop, Kitty Run
   ================================================================ */
const MG = {
  // shared helpers
  start(sc) { sc.t = 0; sc.cd = 3.4; sc.score = 0; sc.over = false; sc.lastCd = 4; Music.play('game'); },
  countdown(sc, dt) {
    if (sc.cd > 0) {
      sc.cd -= dt;
      const n = Math.ceil(sc.cd - 0.4);
      if (n !== sc.lastCd) { sc.lastCd = n; if (n > 0) Snd.tone(440, 0.1, { vol: 0.15 }); else Snd.tone(880, 0.25, { vol: 0.18 }); }
      return true;
    }
    return false;
  },
  drawCountdown(sc) {
    if (sc.cd <= 0) return;
    const n = Math.ceil(sc.cd - 0.4);
    const k = 1 - ((sc.cd - 0.4) % 1);
    const s = n > 0 ? String(n) : 'GO!';
    const scl = Math.max(2, Math.round(lerp(7, 4, Ease.outQuad(clamp(k, 0, 1)))));
    fancyText(s, W / 2, H / 2 - scl * 4, scl, ['#ffffff', '#ffe8a0', '#ffd84a', '#ff9a3c'], COL.ink, { ow: 2, depth: 2 });
  },
  hud(sc, opts) {
    rrect(4, 4, 74, 18, COL.ink, 3); rrect(5, 5, 72, 16, '#5a3a8a', 2);
    iconC('star', 14, 13, 1);
    text(String(sc.score), 24, 9, { color: '#ffffff' });
    if (opts.time != null) {
      const tl = Math.max(0, Math.ceil(opts.time));
      rrect(W / 2 - 22, 4, 44, 18, COL.ink, 3); rrect(W / 2 - 21, 5, 42, 16, tl <= 5 ? '#c8407a' : '#5a3a8a', 2);
      text(tl + 's', W / 2, 9, { color: '#ffffff', align: 'center' });
    }
    if (opts.lives != null) for (let i = 0; i < 3; i++) iconC('heart', W - 70 + i * 12, 13, 1, i < opts.lives ? {} : { sil: '#5a4a6a' });
    if (button('mgquit', W - 28, 3, 24, 20, { label: '✗', color: 'red', sfx: 'back' })) {
      dialog({ title: 'Quit game?', text: 'Your score will not count.', buttons: [{ label: 'Quit', color: 'red', cb: () => go('home') }, { label: 'Keep playing', color: 'mint' }] });
    }
  },
  finish(id, sc) {
    if (sc.over) return;
    sc.over = true;
    const pet = Game.pet();
    const score = sc.score;
    const best = SAVE.best[id] || 0;
    const newBest = score > best;
    if (newBest) SAVE.best[id] = score;
    const coins = Math.min(80, Math.floor(score / 2) + (newBest && score > 0 ? 5 : 0) + 2);
    const xp = Math.min(40, 6 + Math.floor(score / 2));
    Game.boost(1, 20); Game.boost(2, -12);
    Game.addXP(xp);
    Game.track('play'); Game.stat('games'); Game.track('s_' + id, score);
    Game.checkAdventures();
    Snd.play(newBest ? 'fanfare' : 'levelup');
    if (newBest) confetti(70);
    const ov = pushOverlay({
      t: 0, paid: false, update(dt) { this.t += dt; },
      draw() {
        g.fillStyle = 'rgba(18,10,30,0.6)'; g.fillRect(0, 0, W, H);
        const k = Ease.outBack(clamp(this.t / 0.3, 0, 1));
        const w = Math.min(W - 30, 220), h = 150, x = W / 2 - w / 2, y = H / 2 - h / 2 + (1 - k) * 60;
        panel(x, y, w, h, { title: newBest ? 'NEW BEST!' : 'Great game!', color: newBest ? 'sun' : 'purple' });
        drawPet(pet, x + 30, y + 64, 1, { expr: newBest ? 'star' : 'happy', tail: Math.round(Math.sin(T * 6) * 2) });
        text('Score', x + 64, y + 18, { color: COL.grayD });
        text(String(score), x + 64, y + 28, { color: COL.ink, scale: 3 });
        text('Best: ' + Math.max(best, score), x + 64, y + 56, { color: COL.purpleD });
        coinLabel(x + 20, y + 76, '+' + coins);
        text('+' + xp + ' XP', x + 90, y + 79, { color: '#ffffff', outline: COL.ink });
        text('Fun +20', x + 140, y + 79, { color: '#ff9ac8', outline: COL.ink });
        if (!this.paid && this.t > 0.4) { this.paid = true; Game.addCoins(coins, x + 26, y + 80); Game.save(); }
        const bw = (w - 30) / 2;
        const tired = pet.s[2] < 15;
        if (button('mgagain', x + 10, y + h - 32, bw, 24, { label: tired ? 'Too tired' : 'Again!', color: 'mint', disabled: tired })) { popOverlay(ov); go(id); }
        if (button('mgdone', x + 20 + bw, y + h - 32, bw, 24, { label: 'Home', color: 'pink' })) { popOverlay(ov); go('home'); }
      },
    });
  },
};

/* ---------- Treat Catch ---------- */
Scenes.yarn = {
  sim: false,
  enter() {
    MG.start(this);
    this.items = []; this.spawnT = 0.5; this.lives = 3; this.time = 45; this.px = W / 2; this.hitT = 0; this.happyT = 0;
    this.dog = Game.isDog();
  },
  leave() { Game.save(); },
  update(dt) {
    if (MG.countdown(this, dt) || this.over) return;
    this.t += dt; this.time -= dt;
    this.hitT = Math.max(0, this.hitT - dt); this.happyT = Math.max(0, this.happyT - dt);
    if (I.down && UI.on && I.y > 26) this.px = lerp(this.px, clamp(I.x, 20, W - 20), Math.min(1, dt * 14));
    if (I.keys.ArrowLeft) this.px -= 160 * dt;
    if (I.keys.ArrowRight) this.px += 160 * dt;
    this.px = clamp(this.px, 20, W - 20);
    const diff = Math.min(1, this.t / 40);
    this.spawnT -= dt;
    if (this.spawnT <= 0) {
      this.spawnT = lerp(0.95, 0.42, diff) * rnd(0.7, 1.2);
      const r = Math.random();
      let type;
      if (r < 0.06) type = 'star'; else if (r < 0.32 - diff * 0.05) type = 'fish'; else if (r < 0.75 - diff * 0.1) type = 'yarn'; else type = 'drop';
      this.items.push({ type, x: rnd(16, W - 16), y: 20, vy: lerp(55, 120, diff) * rnd(0.85, 1.2), sw: rnd(TAU) });
    }
    const pet = Game.pet();
    const gy = H - 22, headY = gy - petHeight(pet, 'sit') * 2 + 10;
    for (const it of this.items) {
      it.y += it.vy * dt; it.sw += dt * 3;
      const ix = it.x + Math.sin(it.sw) * 4;
      if (!it.done && it.y > headY - 4 && it.y < headY + 18 && Math.abs(ix - this.px) < 22) {
        it.done = true;
        if (it.type === 'drop') {
          this.lives--; this.hitT = 0.8;
          Snd.play('splash');
          burst('drop', ix, it.y, 10, { speed: 60, props: { g: 200, layer: 1 } });
          if (this.lives <= 0) MG.finish('yarn', this);
        } else {
          const pts = { yarn: 1, fish: 2, star: 5 }[it.type];
          this.score += pts; this.happyT = 0.4;
          Snd.play(it.type === 'star' ? 'sparkle' : 'catch');
          floatText('+' + pts, ix, it.y - 8, '#ffffff');
          burst('sparkle', ix, it.y, 4, { speed: 40, props: { color: '#ffffff', size: 2, layer: 1 } });
        }
      }
    }
    this.items = this.items.filter((it) => !it.done && it.y < H + 10);
    if (this.time <= 0) MG.finish('yarn', this);
  },
  draw(dt) {
    drawDreamBG(dt, { parade: false });
    const pet = Game.pet();
    for (const it of this.items) {
      const ix = it.x + Math.sin(it.sw) * 4;
      const name = it.type === 'fish' ? (this.dog ? 'bone' : 'fish') : it.type;
      iconC(name, ix, it.y, it.type === 'drop' ? 2 : 2);
    }
    const gy = H - 22;
    shadowEllipse(this.px, gy, 18, 3, 0.25);
    const expr = this.hitT > 0 ? 'grumpy' : this.happyT > 0 ? 'happy' : 'open';
    if (!(this.hitT > 0 && Math.floor(this.hitT * 16) % 2)) drawPet(pet, this.px, gy, 2, { expr, tail: Math.round(Math.sin(T * 5) * 2), pawL: this.happyT > 0 ? 0.8 : 0, pawR: this.happyT > 0 ? 0.8 : 0 });
    MG.hud(this, { time: this.time, lives: this.lives });
    if (this.t < 3 && this.cd <= 0) text('Slide to catch treats! Dodge water!', W / 2, 30, { align: 'center', color: '#ffffff', outline: COL.ink });
    MG.drawCountdown(this);
  },
};

/* ---------- Mouse Pop ---------- */
function drawMouseHead(x, y, kind, dizzy) {
  // front-facing mouse popping out of a hole (2x pixel art)
  if (kind === 'cucumber') {
    rrect(x - 7, y - 26, 14, 30, COL.ink, 5);
    rrect(x - 6, y - 25, 12, 28, '#4cbc5c', 4);
    for (let i = 0; i < 5; i++) rect(x - 3 + (i % 2) * 4, y - 20 + i * 5, 2, 2, '#8ee88a');
    rect(x - 4, y - 24, 2, 20, '#7ee08a');
    rect(x - 3, y - 14, 2, 2, COL.ink); rect(x + 2, y - 14, 2, 2, COL.ink);
    rect(x - 2, y - 9, 5, 1, COL.ink);
    return;
  }
  const gold = kind === 'gold';
  const body = gold ? '#ffd84a' : '#b8b0c8', shade = gold ? '#e0a020' : '#8a80a0', inner = '#ff9ab8';
  for (const s of [-1, 1]) { disc(x + s * 9, y - 18, 6, COL.ink); disc(x + s * 9, y - 18, 5, body); disc(x + s * 9, y - 18, 3, inner); }
  ellipseFill(x, y - 6, 12, 11, COL.ink);
  ellipseFill(x, y - 6, 11, 10, body);
  ellipseFill(x + 2, y - 2, 8, 5, shade);
  ellipseFill(x, y - 4, 9, 7, body);
  if (dizzy) {
    for (const s of [-1, 1]) { rect(x + s * 4 - 1, y - 10, 1, 1, COL.ink); rect(x + s * 4 + 1, y - 10, 1, 1, COL.ink); rect(x + s * 4, y - 9, 1, 1, COL.ink); rect(x + s * 4 - 1, y - 8, 1, 1, COL.ink); rect(x + s * 4 + 1, y - 8, 1, 1, COL.ink); }
  } else {
    for (const s of [-1, 1]) { rect(x + s * 4 - 1, y - 10, 3, 3, COL.ink); rect(x + s * 4 - 1, y - 10, 1, 1, '#ffffff'); }
  }
  rect(x - 1, y - 5, 3, 2, '#ff6f9a');
  for (const s of [-1, 1]) { rect(x + s * 5, y - 4, s * 6, 1, '#ffffff'); rect(x + s * 5, y - 2, s * 6, 1, '#ffffff'); }
  rect(x - 1, y - 2, 1, 2, '#ffffff'); rect(x + 1, y - 2, 1, 2, '#ffffff');
  if (gold && Math.sin(T * 10) > 0.5) { rect(x + 10, y - 26, 1, 3, '#ffffff'); rect(x + 9, y - 25, 3, 1, '#ffffff'); }
}
Scenes.mouse = {
  sim: false,
  enter() {
    MG.start(this);
    this.time = 40; this.spawnT = 0.4;
    const cols = PORTRAIT ? 2 : 3, rows = PORTRAIT ? 3 : 2;
    this.holes = [];
    const top = 46, bottom = H - 70;
    const cw = (W - 40) / cols, rh = (bottom - top) / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) this.holes.push({ x: 20 + cw * (c + 0.5), y: top + rh * (r + 0.75), kind: null, t: 0, life: 0, hit: false });
    this.petJump = 0; this.petExpr = 'open'; this.exprT = 0;
  },
  leave() { Game.save(); },
  update(dt) {
    if (MG.countdown(this, dt) || this.over) return;
    this.t += dt; this.time -= dt;
    this.exprT -= dt; if (this.exprT <= 0) this.petExpr = 'open';
    this.petJump = Math.max(0, this.petJump - dt * 3);
    const diff = Math.min(1, this.t / 35);
    this.spawnT -= dt;
    if (this.spawnT <= 0) {
      this.spawnT = lerp(0.85, 0.42, diff) * rnd(0.7, 1.2);
      const free = this.holes.filter((h) => !h.kind);
      if (free.length) {
        const h = pick(free);
        const r = Math.random();
        h.kind = r < 0.1 ? 'gold' : r < 0.1 + 0.12 + diff * 0.1 ? 'cucumber' : 'mouse';
        h.t = 0; h.life = lerp(1.4, 0.75, diff) * rnd(0.9, 1.15); h.hit = false;
        if (h.kind !== 'cucumber') Snd.play('squeak');
      }
    }
    for (const h of this.holes) {
      if (!h.kind) continue;
      h.t += dt;
      if (h.t > h.life + 0.2) h.kind = null;
    }
    if (I.pressed && UI.on) {
      for (const h of this.holes) {
        if (!h.kind || h.hit || h.t > h.life) continue;
        if (Math.abs(I.x - h.x) < 18 && I.y > h.y - 36 && I.y < h.y + 8) {
          h.hit = true; h.t = Math.max(h.t, h.life - 0.05);
          if (h.kind === 'cucumber') {
            this.score = Math.max(0, this.score - 2);
            Snd.play('hurt'); floatText('-2', h.x, h.y - 30, '#ff8a8a');
            this.petExpr = 'wow'; this.exprT = 0.8; this.petJump = 1;
          } else {
            const pts = h.kind === 'gold' ? 3 : 1;
            this.score += pts;
            Snd.play('boop'); floatText('+' + pts, h.x, h.y - 30, '#ffffff');
            burst('star', h.x, h.y - 16, 4, { speed: 50, props: { layer: 1 } });
            this.petExpr = 'happy'; this.exprT = 0.5;
          }
          break;
        }
      }
    }
    if (this.time <= 0) MG.finish('mouse', this);
  },
  draw(dt) {
    // cozy wall + baseboard background
    rect(0, 0, W, H, '#ffe0c0');
    for (let x = 0; x < W; x += 14) rect(x, 0, 7, H, '#ffd4b0');
    const pet = Game.pet();
    for (const h of this.holes) {
      // baseboard strip & hole
      rrect(h.x - 26, h.y - 6, 52, 14, COL.ink, 2); rect(h.x - 25, h.y - 5, 50, 12, '#ffffff'); rect(h.x - 25, h.y + 5, 50, 2, '#e0d0e0');
      ellipseFill(h.x, h.y - 2, 16, 14, COL.ink);
      ellipseFill(h.x, h.y - 2, 14, 12, '#2a1a3a');
      if (h.kind) {
        let up;
        if (h.t < 0.12) up = h.t / 0.12; else if (h.t > h.life) up = 1 - (h.t - h.life) / 0.2; else up = 1;
        up = clamp(up, 0, 1);
        g.save(); g.beginPath(); g.rect(h.x - 30, h.y - 50, 60, 50); g.clip();
        drawMouseHead(h.x, h.y + 4 + (1 - up) * 30, h.kind, h.hit);
        g.restore();
        if (h.hit && h.kind !== 'cucumber') for (let i = 0; i < 3; i++) { const a = T * 6 + (i * TAU) / 3; iconC('star', h.x + Math.cos(a) * 12, h.y - 30 + Math.sin(a) * 4, 1); }
      }
      rect(h.x - 16, h.y + 4, 32, 4, '#ffffff');
    }
    // pet cheering at the bottom
    const gy = H - 6;
    rect(0, H - 22, W, 22, '#c8864a'); rect(0, H - 22, W, 2, '#a86a36');
    drawPet(pet, 40, gy - Math.sin(this.petJump * Math.PI) * 14, 2, { expr: this.petExpr, tail: Math.round(Math.sin(T * 5) * 2), pawR: this.petExpr === 'happy' ? 1 : 0 });
    MG.hud(this, { time: this.time });
    if (this.t < 3 && this.cd <= 0) text('Tap the mice! Not the cucumbers!', W / 2, 30, { align: 'center', color: '#ffffff', outline: COL.ink });
    MG.drawCountdown(this);
  },
};

/* ---------- Kitty Run ---------- */
Scenes.run = {
  sim: false,
  enter() {
    MG.start(this);
    this.dist = 0; this.speed = 110; this.lives = 3; this.y = 0; this.vy = 0; this.jumps = 0; this.inv = 0;
    this.obs = []; this.treats = []; this.nextObs = 220; this.nextTreat = 120; this.legs = 0; this.treatCount = 0;
    this.dog = Game.isDog();
  },
  leave() { Game.save(); },
  ground() { return H - 34; },
  jump() {
    if (this.jumps < 2) {
      this.vy = this.jumps === 0 ? -300 : -250; this.jumps++;
      Snd.play('jump');
      if (this.jumps === 2) burst('dust', W * 0.22, this.ground() - this.y, 4, { speed: 20, props: { r: 3, layer: 1 } });
    }
  },
  update(dt) {
    if (MG.countdown(this, dt) || this.over) return;
    this.t += dt;
    if ((I.pressed && UI.on && !(I.x > W - 32 && I.y < 26)) || I.keyPressed === ' ' || I.keyPressed === 'ArrowUp') this.jump();
    this.speed = Math.min(270, 110 + this.t * 4);
    const dx = this.speed * dt;
    this.dist += dx;
    this.legs += dt * this.speed * 0.12;
    // physics
    this.vy += 900 * dt; this.y -= this.vy * dt;
    if (this.y <= 0) { if (this.vy > 200) Snd.play('land'); this.y = 0; this.vy = 0; this.jumps = 0; }
    this.inv = Math.max(0, this.inv - dt);
    // spawn
    this.nextObs -= dx;
    if (this.nextObs <= 0) {
      const kind = pick(['box', 'box', 'pot', 'puddle', this.t > 15 ? 'tall' : 'box']);
      this.obs.push({ kind, x: W + 20 });
      this.nextObs = rnd(150, 260) * (this.speed / 150);
    }
    this.nextTreat -= dx;
    if (this.nextTreat <= 0) {
      const hgt = pick([10, 30, 55, 70]);
      for (let i = 0; i < (Math.random() < 0.3 ? 3 : 1); i++) this.treats.push({ x: W + 20 + i * 18, h: hgt });
      this.nextTreat = rnd(90, 180);
    }
    const px = W * 0.22, gy = this.ground();
    for (const o of this.obs) {
      o.x -= dx;
      const box = this.obsBox(o);
      if (!o.hit && this.inv <= 0 && px + 10 > box.x && px - 10 < box.x + box.w && gy - this.y > box.y + 2) {
        o.hit = true; this.lives--; this.inv = 1.4;
        Snd.play('hurt'); burst('dust', box.x + box.w / 2, gy - 6, 10, { speed: 50, props: { r: 5, layer: 1 } });
        if (this.lives <= 0) { this.score = Math.floor(this.dist / 40) + this.treatCount * 3; MG.finish('run', this); }
      }
    }
    for (const t of this.treats) {
      t.x -= dx;
      if (!t.got && Math.abs(t.x - px) < 14 && Math.abs((gy - t.h) - (gy - this.y - 14)) < 18) {
        t.got = true; this.treatCount++;
        Snd.play('catch'); floatText('+3', t.x, gy - t.h - 10, '#ffffff');
        burst('sparkle', t.x, gy - t.h, 4, { speed: 40, props: { color: '#ffffff', size: 2, layer: 1 } });
      }
    }
    this.obs = this.obs.filter((o) => o.x > -40);
    this.treats = this.treats.filter((t) => t.x > -20 && !t.got);
    if (!this.over) this.score = Math.floor(this.dist / 40) + this.treatCount * 3;
  },
  obsBox(o) {
    const gy = this.ground();
    switch (o.kind) {
      case 'pot': return { x: o.x - 10, y: gy - 22, w: 20, h: 22 };
      case 'puddle': return { x: o.x - 16, y: gy - 3, w: 32, h: 3 };
      case 'tall': return { x: o.x - 12, y: gy - 30, w: 24, h: 30 };
      default: return { x: o.x - 12, y: gy - 16, w: 24, h: 16 };
    }
  },
  draw(dt) {
    const gy = this.ground();
    const sky = gradientCanvasCached('runsky', ['#ff9ac8', '#ffc0a0', '#ffe8b0', '#fff4d8']);
    g.drawImage(sky, 0, 0);
    disc(W * 0.75, gy - 90, 16, '#fff4a0'); disc(W * 0.75, gy - 90, 12, '#ffffff');
    const d = this.dist;
    // far hills
    for (let x = 0; x < W; x++) {
      const wx = x + d * 0.15;
      const hy = Math.round(gy - 60 + Math.sin(wx * 0.02) * 14 + Math.sin(wx * 0.047) * 6);
      rect(x, hy, 1, gy - hy, '#c8a0e0');
    }
    // houses
    const off = (d * 0.45) % 90;
    for (let i = -1; i < W / 90 + 2; i++) {
      const hx = Math.round(i * 90 - off);
      const idx = Math.floor((d * 0.45) / 90) + i;
      const hc = ['#ff9ac8', '#9ad0ff', '#ffd84a', '#a8f0d4'][mod(idx, 4)];
      const hh = 26 + Math.floor(hash2(idx, 1, 3) * 16);
      rect(hx, gy - hh, 40, hh, COL.ink); rect(hx + 1, gy - hh + 1, 38, hh - 1, hc);
      for (let k = 0; k < 10; k++) rect(hx - 2 + k * 2, gy - hh - 10 + Math.abs(5 - k) * 2, 44 - k * 4 > 0 ? 4 : 0, 2, '#c8407a');
      for (let k = 0; k < 6; k++) { const w2 = 44 - k * 8; rect(hx + 20 - w2 / 2, gy - hh - 2 - k * 2, w2, 2, k % 2 ? '#d0508a' : '#e0609a'); }
      rect(hx + 6, gy - hh + 6, 8, 8, '#fff8c0'); rect(hx + 26, gy - hh + 6, 8, 8, '#fff8c0');
      rect(hx + 16, gy - 14, 8, 14, '#8a5a3a');
    }
    // fence
    const foff = (d * 0.8) % 12;
    for (let x = -foff; x < W; x += 12) { rect(x, gy - 14, 6, 14, COL.ink); rect(x + 1, gy - 13, 4, 13, '#ffffff'); }
    rect(0, gy - 10, W, 2, '#ffffff'); rect(0, gy - 11, W, 1, COL.ink);
    // ground
    rect(0, gy, W, H - gy, '#a86a36');
    rect(0, gy, W, 4, '#5cbf6a'); rect(0, gy, W, 1, '#8ee08a');
    const goff = d % 16;
    for (let x = -goff; x < W; x += 16) { rect(x, gy + 8, 3, 2, '#8a5228'); rect(x + 8, gy + 14, 2, 2, '#c8864a'); }
    // treats
    for (const t of this.treats) iconC(this.dog ? 'bone' : 'fish', t.x, gy - t.h + Math.sin(T * 6 + t.x) * 2, 1);
    // obstacles
    for (const o of this.obs) {
      if (o.hit) continue;
      if (o.kind === 'box') iconC('box', o.x, gy - 9, 2);
      else if (o.kind === 'tall') { iconC('box', o.x, gy - 9, 2); iconC('box', o.x, gy - 25, 2); }
      else if (o.kind === 'pot') iconC('pot', o.x, gy - 12, 2);
      else { ellipseFill(o.x, gy + 1, 17, 3, COL.ink); ellipseFill(o.x, gy + 1, 16, 2, '#4fb4ff'); rect(o.x - 8, gy, 4, 1, '#ffffff'); }
    }
    // pet
    const pet = Game.pet(), px = W * 0.22;
    shadowEllipse(px, gy, 14 - Math.min(8, this.y / 8), 2, 0.25);
    if (!(this.inv > 0 && Math.floor(this.inv * 14) % 2)) {
      const air = this.y > 2;
      drawPet(pet, px, gy - this.y, 2, { pose: air ? 'leap' : 'run', legs: Math.floor(this.legs) % 8, expr: this.inv > 0 ? 'grumpy' : air ? 'happy' : 'open' });
    }
    MG.hud(this, { lives: this.lives });
    if (this.t < 3 && this.cd <= 0) text('Tap to jump! Tap twice for a double jump!', W / 2, 30, { align: 'center', color: '#ffffff', outline: COL.ink });
    MG.drawCountdown(this);
  },
};
