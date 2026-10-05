/* ================================================================
   Front-end scenes: boot gate, MTEC Labs intro, title/splash,
   main menu, player slots, name keyboard, adoption centre
   ================================================================ */

/* ---------- shared dreamy background ---------- */
const BG = { key: '', sky: null, clouds: [], cloudCv: [], parade: [], stars: [] };
function withCtx(ctx, fn) { const old = g; g = ctx; try { fn(); } finally { g = old; } }
function makeCloud(seed) {
  const [c, x] = makeCanvas(64, 28);
  const r = mulberry(seed * 99 + 5);
  const blobs = [];
  for (let i = 0; i < 6; i++) blobs.push([12 + r() * 40, 17 - (i % 3) * 3 + r() * 3, 5 + r() * 6]);
  withCtx(x, () => {
    for (const [bx, by, br] of blobs) disc(bx, by, br + 1, '#9ab8e8');
    for (const [bx, by, br] of blobs) disc(bx, by + 1, br, '#dfeaff');
    for (const [bx, by, br] of blobs) disc(bx - 1, by - 1, br - 1, '#ffffff');
    rect(4, 22, 56, 6, 'rgba(0,0,0,0)');
  });
  x.clearRect(0, 23, 64, 5);
  return c;
}
function ensureBG() {
  const key = W + 'x' + H;
  if (BG.key === key) return;
  BG.key = key;
  BG.sky = gradientCanvas(W, H, ['#5f7dff', '#8fb2ff', '#c4defd', '#ffe0f0', '#ffd0e4']);
  BG.night = gradientCanvas(W, H, ['#120a2e', '#2a1a5a', '#5a3a8a', '#9a5aa0']);
  BG.cloudCv = [0, 1, 2].map(makeCloud);
  BG.clouds = Array.from({ length: Math.ceil(W / 60) + 2 }, (_, i) => ({ x: rnd(-60, W), y: rnd(6, H * 0.42), v: rnd(3, 9), c: i % 3 }));
  BG.parade = Array.from({ length: Math.max(4, Math.round(W / 70)) }, () => ({
    b: rndi(0, 11), lv: pick([1, 5, 10]), x: rnd(-40, W + 40), v: rnd(16, 30), dir: Math.random() < 0.5 ? 1 : -1, ph: rnd(8), hop: rnd(TAU),
  }));
  BG.stars = Array.from({ length: 40 }, () => [rnd(W), rnd(H * 0.6), rnd(TAU)]);
}
function drawDreamBG(dt, opts) {
  opts = opts || {};
  ensureBG();
  g.drawImage(BG.sky, 0, 0);
  // twinkles
  for (const [sx, sy, ph] of BG.stars) {
    const k = Math.sin(T * 2 + ph);
    if (k > 0.75) { rect(sx, sy, 1, 1, '#ffffff'); if (k > 0.93) { rect(sx - 1, sy, 3, 1, '#ffffff'); rect(sx, sy - 1, 1, 3, '#ffffff'); } }
  }
  // clouds
  for (const c of BG.clouds) {
    c.x += c.v * dt;
    if (c.x > W + 10) { c.x = -70; c.y = rnd(6, H * 0.42); }
    g.drawImage(BG.cloudCv[c.c], Math.round(c.x), Math.round(c.y));
  }
  // hills
  const base = H - 30;
  for (let x = 0; x < W; x++) {
    const y1 = Math.round(base - 34 + Math.sin(x * 0.022 + 1) * 10 + Math.sin(x * 0.051) * 4);
    rect(x, y1, 1, H - y1, (x + y1) % 2 ? '#b8e8c4' : '#acdeb8');
  }
  for (let x = 0; x < W; x++) {
    const y2 = Math.round(base - 12 + Math.sin(x * 0.03 + 3) * 7 + Math.sin(x * 0.09) * 2);
    rect(x, y2, 1, H - y2, '#7fd492');
    rect(x, y2, 1, 1, '#a8eab4');
  }
  // little flowers
  for (let i = 0; i < W / 18; i++) {
    const fx = Math.floor(hash2(i, 1, 4) * W), fy = base - 4 + Math.floor(hash2(i, 2, 4) * 10);
    rect(fx, fy, 1, 1, ['#ffffff', '#ffd84a', '#ff9ac8'][i % 3]);
  }
  // ground
  rect(0, base, W, H - base, '#5cbf6a');
  rect(0, base, W, 2, '#8ee08a');
  for (let x = 0; x < W; x += 4) rect(x + ((x / 4) % 2), base + 2 + ((x * 7) % 5), 1, 2, '#4aa858');
  // parade of pets
  if (opts.parade !== false) {
    for (const p of BG.parade) {
      p.x += p.v * p.dir * dt; p.ph += dt * p.v * 0.35;
      if (p.dir > 0 && p.x > W + 40) { p.x = -40; p.b = rndi(0, 11); p.lv = pick([1, 5, 10]); }
      if (p.dir < 0 && p.x < -40) { p.x = W + 40; p.b = rndi(0, 11); p.lv = pick([1, 5, 10]); }
      const pet = { b: p.b, lv: p.lv, eq: {} };
      drawPet(pet, p.x, H - 10, 1, { pose: 'run', legs: Math.floor(p.ph) % 8, flip: p.dir < 0, expr: 'open' });
    }
  }
}

function drawLogo(cx, cy, scale, opts) {
  opts = opts || {};
  const ow = Math.max(1, Math.round(scale / 2));
  // peeking kitten behind the logo
  if (opts.peek !== false) {
    const pk = { b: opts.peekBreed != null ? opts.peekBreed : 0, lv: 1, eq: {} };
    const blink = Math.floor(T * 1.3) % 5 === 0 && (T * 1.3) % 1 < 0.15;
    drawPet(pk, cx + scale * 9, cy + scale * 2 + Math.sin(T * 2) * 1, Math.max(1, Math.round(scale / 2.5)), { expr: blink ? 'blink' : 'happy', pawR: 0, tail: Math.round(Math.sin(T * 3) * 2) });
  }
  fancyText('KITTAY', cx + scale * 0.5, cy + scale * 1.2, scale, ['#3a1a5a'], '#3a1a5a', { ow, depth: scale, wave: scale * 0.4, waveSpeed: 3 });
  fancyText('KITTAY', cx, cy, scale, ['#fff0f8', '#ffc0de', '#ff8ac0', '#ff6fa8', '#f0509a', '#d0408a', '#b0307a'], '#2a1a3a', { ow, wave: scale * 0.4, waveSpeed: 3, shine: '#ffffff' });
}

function backButton(id, x, y) {
  return button(id || 'back', x, y, 26, 22, { label: '←', color: 'paper', sfx: 'back' });
}
function coinLabel(x, y, n, align) {
  const s = String(n);
  const w = textWidth(s) + 13;
  let lx = x;
  if (align === 'right') lx = x - w; else if (align === 'center') lx = x - w / 2;
  iconC('coin', lx + 5, y + 3, 1);
  text(s, lx + 13, y, { color: '#ffffff', outline: COL.ink });
  return w;
}

/* ---------- boot: tap to start (needed to unlock iPad audio) ---------- */
Scenes.boot = {
  enter() { this.t = 0; },
  update(dt) {
    this.t += dt;
    if (I.released && this.t > 0.2) { Snd.unlock(); go('intro'); }
  },
  draw() {
    rect(0, 0, W, H, '#120a1e');
    for (let i = 0; i < 30; i++) {
      const x = hash2(i, 1, 2) * W, y = hash2(i, 3, 2) * H;
      if (Math.sin(T * 2 + i) > 0.6) rect(x, y, 1, 1, '#6a5a9a');
    }
    const s = 3 + Math.sin(T * 4) * 0.2;
    iconC('paw', W / 2, H / 2 - 14, Math.round(s));
    if (Math.floor(T * 2) % 2 === 0) text('TAP TO START', W / 2, H / 2 + 20, { color: '#ffffff', align: 'center', shadow: '#5a3a8a' });
    text('Turn your sound on!  ♪', W / 2, H - 22, { color: '#8a7ab0', align: 'center' });
  },
};

/* ---------- MTEC Labs intro ---------- */
Scenes.intro = {
  enter() { this.t = 0; this.stage = 0; this.bubbles = []; this.done = false; },
  update(dt) {
    this.t += dt;
    const t = this.t;
    if (t > 0.5 && t < 2.0 && Math.random() < dt * 10) {
      this.bubbles.push({ x: rnd(-6, 6), y: 0, v: rnd(10, 22), r: rnd(1, 2.5), w: rnd(TAU) });
      if (Math.random() < 0.5) Snd.play('bubble');
    }
    for (const b of this.bubbles) { b.y -= b.v * dt; b.w += dt * 6; }
    this.bubbles = this.bubbles.filter((b) => b.y > -70);
    const marks = [[1.7, 'flash'], [1.75, 'm0'], [1.87, 'm1'], [1.99, 'm2'], [2.11, 'm3'], [2.5, 'labs'], [3.1, 'chime']];
    for (const [tm, name] of marks) {
      if (t >= tm && !this['_' + name]) {
        this['_' + name] = true;
        if (name === 'flash') Snd.play('whoosh');
        else if (name[0] === 'm') Snd.tone(300 + parseInt(name[1], 10) * 120, 0.08, { vol: 0.15, type: 'square' });
        else if (name === 'chime') { Snd.play('chime'); burst('sparkle', W / 2, H / 2, 24, { speed: 90, props: { size: 3, color: '#a8f0d4' }, life: 1.2 }); }
      }
    }
    if (t > 2.5 && t < 3.0 && Math.random() < dt * 12) Snd.play('type');
    if ((t > 5 || (I.released && t > 0.6)) && !this.done) { this.done = true; go('title'); }
  },
  draw() {
    const t = this.t;
    rect(0, 0, W, H, '#0c0816');
    // subtle grid
    g.globalAlpha = 0.18;
    for (let x = (T * 6) % 16; x < W; x += 16) rect(x, 0, 1, H, '#2a5a6a');
    for (let y = (T * 6) % 16; y < H; y += 16) rect(0, y, W, 1, '#2a5a6a');
    g.globalAlpha = 1;
    const cx = W / 2, top = H / 2 - 66;
    // flask
    const appear = clamp(t / 0.5, 0, 1);
    const level = clamp((t - 0.4) / 1.2, 0, 1);
    const fh = 44, neck = 14;
    const liquid = ['#4fd1a5', '#5ad8ff', '#c3a8ff', '#ff8ac0'][Math.floor(t * 3) % 4];
    for (let y = 0; y < fh; y++) {
      if (hash2(y, 0, 3) > appear) continue;
      const hw = y < neck ? 4 : Math.min(15, 4 + (y - neck) * 0.62);
      const yy = top + y;
      rect(cx - hw - 2, yy, hw * 2 + 4, 1, '#ffffff');
      rect(cx - hw - 1, yy, hw * 2 + 2, 1, '#1a2a3a');
      const filled = y > fh - 2 - (fh - neck - 2) * level;
      if (filled) {
        rect(cx - hw - 1, yy, hw * 2 + 2, 1, liquid);
        if (y % 3 === 0) rect(cx - hw, yy, 1, 1, '#ffffff');
      }
    }
    rect(cx - 7, top - 2, 14, 3, '#ffffff');
    rect(cx - 6, top - 1, 12, 1, '#a8f0ff');
    rect(cx - 10, top + fh, 20, 2, '#ffffff');
    // glass shine
    if (appear >= 1) for (let y = neck + 4; y < fh - 6; y++) rect(cx - 4 - (y - neck) * 0.5, top + y, 1, 1, 'rgba(255,255,255,0.7)');
    for (const b of this.bubbles) ring(cx + b.x + Math.sin(b.w) * 2, top + b.y, b.r, liquid);
    // flash
    if (t > 1.7 && t < 2.0) { g.globalAlpha = 1 - (t - 1.7) / 0.3; rect(0, 0, W, H, '#ffffff'); g.globalAlpha = 1; }
    // MTEC letters drop in
    const letters = 'MTEC';
    const sc = W < 280 ? 4 : 5;
    const lw = 6 * sc;
    const startX = cx - (lw * 4 - sc) / 2;
    const ly = top + fh + 14;
    for (let i = 0; i < 4; i++) {
      const lt = t - 1.75 - i * 0.12;
      if (lt < 0) continue;
      const k = Ease.outBounce(clamp(lt / 0.45, 0, 1));
      const yy = lerp(ly - 60, ly, k);
      fancyText(letters[i], startX + i * lw, yy, sc, ['#ffffff', '#c8f6ff', '#7ae0ff', '#4fb4ff', '#3a8ae0'], '#0c2a4a', { align: 'left', ow: 2, depth: 2, shine: '#ffffff' });
    }
    // LABS types in
    if (t > 2.5) {
      const n = Math.min(4, Math.floor((t - 2.5) / 0.12) + 1);
      const s = 'LABS'.slice(0, n).split('').join(' ');
      text(s, cx, ly + 7 * sc + 8, { color: '#4fd1a5', align: 'center', scale: 2, shadow: '#0c3a2a' });
    }
    if (t > 3.2) {
      g.globalAlpha = clamp((t - 3.2) / 0.5, 0, 1);
      text('p r e s e n t s', cx, ly + 7 * sc + 34, { color: '#8a9ab8', align: 'center' });
      g.globalAlpha = 1;
    }
  },
};

/* ---------- title / splash ---------- */
Scenes.title = {
  enter() { this.t = 0; Music.play('title'); this.peek = rndi(0, 7); },
  update(dt) {
    this.t += dt;
    if (I.released && this.t > 0.4) { Snd.play('click'); go('menu'); }
    if (Math.random() < dt * 2) Particles.add({ type: 'sparkle', x: rnd(W), y: rnd(H * 0.6), life: 0.8, size: 2, color: '#ffffff' });
  },
  draw(dt) {
    drawDreamBG(dt);
    const sc = clamp(Math.floor(W / 52), 4, 8);
    const k = Ease.outBack(clamp(this.t / 0.8, 0, 1));
    const ly = lerp(-60, H * 0.3, k);
    drawLogo(W / 2, ly, sc, { peekBreed: this.peek });
    text('a cozy 8-bit pet game', W / 2, ly + sc * 7 + 12, { color: '#ffffff', align: 'center', outline: '#5a3a8a' });
    if (this.t > 0.9 && Math.floor(T * 1.8) % 2 === 0) {
      iconC('paw', W / 2 - 50, H * 0.66 + 3, 1);
      iconC('paw', W / 2 + 50, H * 0.66 + 3, 1);
      text('TAP TO PLAY', W / 2, H * 0.66, { color: '#ffffff', align: 'center', outline: COL.ink, shadow: COL.ink });
    }
    text('© MTEC Labs', W - 4, 4, { color: '#ffffff', align: 'right', shadow: '#5a6ac8' });
  },
};

/* ---------- main menu ---------- */
Scenes.menu = {
  enter() { this.t = 0; Music.play('title'); },
  update(dt) { this.t += dt; },
  draw(dt) {
    drawDreamBG(dt);
    const sc = clamp(Math.floor(W / 64), 3, 6);
    drawLogo(W / 2, 14 + sc, sc, { peek: false });
    const bw = Math.min(170, W - 60), bh = PORTRAIT ? 32 : 26;
    const items = [
      ['▶  PLAY', 'pink', () => go('slots')],
      ['How to Play', 'sky', () => go('help')],
      ['Settings', 'mint', () => go('settings', { from: 'menu' })],
      ['Credits', 'sun', () => go('credits')],
    ];
    const top = Math.max(sc * 7 + 40, H * 0.36);
    items.forEach(([lab, col, fn], i) => {
      const k = Ease.outBack(clamp((this.t - i * 0.07) / 0.35, 0, 1));
      const x = W / 2 - bw / 2 + (1 - k) * (i % 2 ? 1 : -1) * W;
      if (button('menu' + i, x, top + i * (bh + 8), bw, bh + (i === 0 ? 4 : 0), { label: lab, color: col, scale: i === 0 ? 2 : 1 })) fn();
    });
    text('v' + VERSION, 4, 4, { color: '#ffffff', shadow: '#5a6ac8' });
  },
};

/* ---------- player slots ---------- */
let PENDING = null; // a brand-new save waiting for its first pet
Scenes.slots = {
  enter() { this.t = 0; this.data = [0, 1, 2].map(slotSummary); Music.play('title'); },
  update(dt) { this.t += dt; },
  draw(dt) {
    drawDreamBG(dt, { parade: false });
    rect(0, 0, W, H, 'rgba(40,20,70,0.25)');
    ribbon(W / 2, 8, "Who's playing?", 'purple');
    if (backButton('sback', 6, 6)) go('menu');
    const port = PORTRAIT;
    const n = 3, gap = 8;
    let cw, ch;
    if (port) { cw = W - 30; ch = Math.min(92, (H - 60 - gap * 2) / 3); } else { cw = Math.min(140, (W - 30 - gap * 2) / 3); ch = Math.min(170, H - 64); }
    const totalW = port ? cw : cw * 3 + gap * 2;
    const totalH = port ? ch * 3 + gap * 2 : ch;
    const x0 = W / 2 - totalW / 2, y0 = Math.max(34, (H - totalH) / 2 + 10);
    for (let i = 0; i < n; i++) {
      const x = port ? x0 : x0 + i * (cw + gap), y = port ? y0 + i * (ch + gap) : y0;
      const s = this.data[i];
      const k = Ease.outBack(clamp((this.t - i * 0.08) / 0.4, 0, 1));
      const yy = y + (1 - k) * 40;
      g.globalAlpha = clamp(k, 0, 1);
      const st = uiLogic('slot' + i, x, yy, cw, ch);
      const col = ['pink', 'sky', 'mint'][i];
      const pal = BTN[col];
      rrect(x + 2, yy + 3 + (st.down ? 1 : 0), cw, ch, 'rgba(30,10,40,0.3)', 4);
      rrect(x, yy + (st.down ? 1 : 0), cw, ch, COL.ink, 4);
      rrect(x + 1, yy + 1 + (st.down ? 1 : 0), cw - 2, ch - 2, COL.paper, 3);
      rrect(x + 1, yy + 1 + (st.down ? 1 : 0), cw - 2, port ? ch - 2 : 18, pal.m, 3);
      if (port) rect(x + 1, yy + 1 + (st.down ? 1 : 0), 6, ch - 2, pal.m);
      if (s) {
        const pet = s.p[s.ap] || s.p[0];
        if (port) {
          rrect(x + 8, yy + 4, ch - 8, ch - 8, pal.l, 3);
          if (pet) drawPet(pet, x + 8 + (ch - 8) / 2, yy + ch - 8, ch > 80 ? 2 : 1, { expr: 'happy' });
          const tx = x + ch + 8;
          text(s.n, tx, yy + 10, { color: COL.ink, scale: 2 });
          text('★ Star Level ' + s.ol, tx, yy + 32, { color: COL.purpleD });
          text('♥ ' + s.p.length + (s.p.length === 1 ? ' pet' : ' pets') + (pet ? ' - ' + pet.n : ''), tx, yy + 44, { color: COL.pinkD });
          coinLabel(tx, yy + 56, s.c);
          if (button('del' + i, x + cw - 30, yy + 6, 24, 20, { icon: 'trash', color: 'paper' })) this.askDelete(i);
        } else {
          text(s.n, x + cw / 2, yy + 6, { color: '#ffffff', align: 'center', shadow: pal.d });
          rrect(x + 8, yy + 24, cw - 16, 70, pal.l, 3);
          if (pet) drawPet(pet, x + cw / 2, yy + 92, 2, { expr: 'happy', tail: Math.round(Math.sin(T * 3 + i) * 2) });
          text('★ Star Level ' + s.ol, x + cw / 2, yy + 102, { color: COL.purpleD, align: 'center' });
          text(s.p.length + (s.p.length === 1 ? ' pet' : ' pets'), x + cw / 2, yy + 114, { color: COL.pinkD, align: 'center' });
          coinLabel(x + cw / 2, yy + 126, s.c, 'center');
          if (button('del' + i, x + cw / 2 - 12, yy + ch - 28, 24, 20, { icon: 'trash', color: 'paper' })) this.askDelete(i);
        }
      } else {
        const cx = port ? x + cw / 2 : x + cw / 2, cy = port ? yy + ch / 2 : yy + ch / 2 + 6;
        disc(cx, cy - 6, 12, pal.l);
        text('+', cx + 1, cy - 13, { color: pal.d, align: 'center', scale: 2 });
        text('New Player', cx, cy + 12, { color: COL.ink, align: 'center' });
        if (!port) text('Player ' + (i + 1), x + cw / 2, yy + 6, { color: '#ffffff', align: 'center', shadow: pal.d });
      }
      g.globalAlpha = 1;
      if (st.click && !UI.blockClick) {
        Snd.play('click');
        if (s) { Game.start(i, s); go('home'); }
        else this.newPlayer(i);
      }
    }
  },
  newPlayer(i) {
    go('name', {
      title: "What's your name?", initial: '', random: () => pick(OWNER_NAMES), max: 10,
      onBack: () => go('slots'),
      onDone: (nm) => { PENDING = { slot: i, save: newSave(nm) }; go('adopt', { first: true }); },
    });
  },
  askDelete(i) {
    const s = this.data[i];
    const self = this;
    const ov = pushOverlay({
      draw(dt) {
        g.fillStyle = 'rgba(18,10,30,0.65)'; g.fillRect(0, 0, W, H);
        const w = Math.min(W - 30, 230), h = 112, x = W / 2 - w / 2, y = H / 2 - h / 2;
        panel(x, y, w, h, { title: 'Delete player?', color: 'red' });
        wrapText('Delete ' + s.n + ' and all of their pets? This can NOT be undone!', w - 24).forEach((l, k) => text(l, W / 2, y + 18 + k * 10, { align: 'center' }));
        text('Hold the red button', W / 2, y + 52, { align: 'center', color: COL.redD });
        if (holdButton('holddel', x + 14, y + h - 34, w / 2 - 20, 24, 'Hold...', 'red', dt)) {
          SaveIO.remove(SLOT_KEYS[i]); self.data[i] = null; popOverlay(ov); Snd.play('whoosh');
        }
        if (button('keep', x + w / 2 + 6, y + h - 34, w / 2 - 20, 24, { label: 'Keep', color: 'mint' })) popOverlay(ov);
      },
    });
  },
};

/* ---------- name entry with on-screen keyboard ---------- */
Scenes.name = {
  enter(a) { this.a = a; this.val = a.initial || ''; this.t = 0; },
  update(dt) {
    this.t += dt;
    const k = I.keyPressed;
    if (k) {
      if (k === 'Backspace') this.val = this.val.slice(0, -1);
      else if (k === 'Enter') this.done();
      else if (k.length === 1 && /[a-zA-Z ]/.test(k)) this.type(k);
    }
  },
  type(ch) {
    const max = this.a.max || 10;
    if (this.val.length >= max) { Snd.play('error'); return; }
    if (ch === ' ' && (!this.val || this.val.endsWith(' '))) return;
    const cap = !this.val || this.val.endsWith(' ');
    this.val += cap ? ch.toUpperCase() : ch.toLowerCase();
    Snd.play('type');
  },
  done() {
    const v = this.val.trim();
    if (!v) { Snd.play('error'); this.shake = 0.4; return; }
    Snd.play('coin');
    this.a.onDone(v);
  },
  draw(dt) {
    drawDreamBG(dt, { parade: false });
    rect(0, 0, W, H, 'rgba(40,20,70,0.3)');
    if (this.a.onBack && backButton('nback', 6, 6)) this.a.onBack();
    const a = this.a;
    ribbon(W / 2, 8, a.title, 'pink');
    const kw = Math.min(28, Math.floor((W - 16) / 10) - 2), kh = Math.min(26, Math.floor((H - 120) / 4) - 4);
    const keysTop = H - (kh + 4) * 4 - 6;
    // preview + field
    const fieldW = Math.min(W - 40, 200);
    let fy = Math.max(34, keysTop - 46);
    if (a.pet) {
      const avail = keysTop - 30 - 40;
      const sc = avail > 90 ? 2 : 1;
      drawPet(a.pet, W / 2, 30 + Math.min(avail, 60 * sc) + 2, sc, { expr: 'happy', tail: Math.round(Math.sin(T * 3) * 2) });
      fy = keysTop - 34;
    }
    const sh = this.shake > 0 ? Math.sin(T * 60) * 3 : 0;
    this.shake = Math.max(0, (this.shake || 0) - dt);
    rrect(W / 2 - fieldW / 2 + sh, fy, fieldW, 26, COL.ink, 3);
    rrect(W / 2 - fieldW / 2 + 1 + sh, fy + 1, fieldW - 2, 24, '#ffffff', 2);
    const tw = textWidth(this.val, 2);
    text(this.val, W / 2 + sh, fy + 6, { color: COL.ink, align: 'center', scale: 2 });
    if (Math.floor(T * 2.5) % 2 === 0) rect(W / 2 + tw / 2 + 2 + sh, fy + 5, 2, 15, COL.pink);
    if (!this.val) text('Type a name!', W / 2, fy + 9, { color: '#b8a8c8', align: 'center' });
    // keyboard
    const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
    rows.forEach((row, r) => {
      const n = row.length + (r === 2 ? 1.5 : 0);
      const rw = n * (kw + 2) - 2;
      let x = W / 2 - rw / 2;
      for (const ch of row) {
        if (button('k' + ch, x, keysTop + r * (kh + 4), kw, kh, { label: ch, color: 'paper', sfx: 'none' })) this.type(ch);
        x += kw + 2;
      }
      if (r === 2 && button('kbs', x, keysTop + r * (kh + 4), kw * 1.5 + 1, kh, { label: '←', color: 'orange', sfx: 'back' })) this.val = this.val.slice(0, -1);
    });
    const by = keysTop + 3 * (kh + 4);
    const bw = Math.min(70, (W - 30) / 3.6);
    if (a.random && button('krand', W / 2 - bw * 1.75 - 6, by, bw, kh, { label: 'Random', color: 'sky' })) { this.val = a.random(); }
    if (button('kspace', W / 2 - bw * 0.75, by, bw * 1.5, kh, { label: 'space', color: 'paper', sfx: 'none' })) this.type(' ');
    if (button('kok', W / 2 + bw * 0.75 + 6, by, bw, kh, { label: 'OK ✓', color: 'mint', sfx: 'none' })) this.done();
  },
};

/* ---------- adoption centre ---------- */
Scenes.adopt = {
  enter(a) {
    this.first = !!(a && a.first);
    this.i = a && a.dogs ? 8 : 0; this.slide = 0; this.t = 0;
    Music.play(this.first ? 'title' : 'home');
  },
  ownerLv() { return this.first ? 1 : SAVE.ol; },
  locked(i) { return BREEDS[i].kind === 'dog' && this.ownerLv() < DOG_LEVEL; },
  price(i) { return this.first ? 0 : ADOPT_PRICE[BREEDS[i].kind]; },
  update(dt) {
    this.t += dt;
    this.slide = lerp(this.slide, 0, Math.min(1, dt * 12));
    if (UI.on && I.released && Math.abs(I.x - I.sx) > 40 && Math.abs(I.x - I.sx) > Math.abs(I.y - I.sy) * 1.5 && I.sy > 30 && I.sy < H - 40) {
      this.move(I.x < I.sx ? 1 : -1);
    }
  },
  move(d) { this.i = mod(this.i + d, BREEDS.length); this.slide = d; Snd.play('tab'); },
  draw(dt) {
    drawDreamBG(dt, { parade: false });
    rect(0, 0, W, H, 'rgba(40,20,70,0.2)');
    const def = BREEDS[this.i], locked = this.locked(this.i);
    ribbon(W / 2, 8, this.first ? 'Choose your first pet!' : 'Adoption Center', 'pink');
    if (!this.first && backButton('aback', 6, 6)) go('store', { tab: 3 });
    if (!this.first) coinLabel(W - 8, 10, SAVE.c, 'right');
    const port = PORTRAIT;
    const petX = port ? W / 2 : W * 0.3, groundY = port ? H * 0.46 : H * 0.62;
    // spotlight + pedestal
    g.globalAlpha = 0.22;
    for (let y = 30; y < groundY; y++) {
      const hw = 8 + (y - 30) * 0.45;
      rect(petX - hw, y, hw * 2, 1, '#fff8c0');
    }
    g.globalAlpha = 1;
    ellipseFill(petX, groundY + 4, 40, 9, COL.ink);
    ellipseFill(petX, groundY + 3, 39, 8, '#ff9ac8');
    ellipseFill(petX, groundY + 1, 36, 6, '#ffc0de');
    const sx = this.slide * 80;
    const pet = { b: this.i, lv: 1, eq: {} };
    const sc = port ? (H > 400 ? 4 : 3) : H > 300 ? 4 : 3;
    if (locked) {
      drawPet(pet, petX + sx, groundY + 2, sc, { sil: '#3a2a5a', noAcc: true });
      text('?', petX + sx, groundY - 26 * sc / 2 - 6, { color: '#ffffff', scale: 3, align: 'center', outline: COL.ink });
    } else {
      const blink = (T % 4) < 0.12;
      drawPet(pet, petX + sx, groundY + 2, sc, { expr: blink ? 'blink' : this.t % 6 > 4.5 ? 'happy' : 'open', tail: Math.round(Math.sin(T * 3) * 2), breath: Math.floor(T * 1.5) % 2 });
    }
    // arrows
    const ay = groundY - 30;
    if (button('al', 6, ay, 26, 30, { label: '<', color: 'purple', scale: 2 })) this.move(-1);
    if (button('ar', port ? W - 32 : W * 0.6 - 32, ay, 26, 30, { label: '>', color: 'purple', scale: 2 })) this.move(1);
    // dots
    const dotsX = petX - (BREEDS.length * 6) / 2;
    BREEDS.forEach((b, i) => rect(dotsX + i * 6, groundY + 16, 4, 4, i === this.i ? '#ffffff' : b.kind === 'dog' ? '#7a5ab0' : '#b89ad8'));
    // info panel
    let px, py, pw, ph;
    if (port) { px = 10; py = groundY + 26; pw = W - 20; ph = H - py - 44; } else { px = W * 0.6; py = 34; pw = W * 0.4 - 10; ph = H - 34 - 44; }
    panel(px, py, pw, ph);
    let ty = py + 8;
    text(def.name, px + pw / 2, ty, { color: COL.ink, align: 'center', scale: pw > 150 ? 2 : 1 });
    ty += pw > 150 ? 18 : 12;
    const kindLabel = def.kind === 'dog' ? 'Puppy' : 'Kitten';
    text(kindLabel, px + pw / 2, ty, { color: def.kind === 'dog' ? COL.skyD : COL.pinkD, align: 'center' });
    ty += 13;
    if (locked) {
      wrapText('Puppies unlock at Star Level ' + DOG_LEVEL + '! Take care of your pets to earn stars.', pw - 16).forEach((l) => { text(l, px + pw / 2, ty, { align: 'center', color: COL.grayD }); ty += 10; });
    } else {
      wrapText(def.desc, pw - 16).forEach((l) => { text(l, px + pw / 2, ty, { align: 'center' }); ty += 10; });
      ty += 4;
      const fv = FOOD_BY_ID[def.fave];
      const lab = 'Loves: ' + fv.name;
      const lw = textWidth(lab) + 16;
      iconC(fv.icon, px + pw / 2 - lw / 2 + 6, ty + 3, 1);
      text(lab, px + pw / 2 - lw / 2 + 16, ty, { color: COL.purpleD });
      ty += 14;
      if (ty + 40 < py + ph) {
        text('Grows into:', px + pw / 2, ty, { align: 'center', color: COL.grayD });
        drawPet({ b: this.i, lv: 10, eq: {} }, px + pw / 2, Math.min(py + ph - 6, ty + 50), 1, { expr: 'open' });
      }
    }
    // adopt button
    const price = this.price(this.i);
    const full = !this.first && SAVE.p.length >= MAX_PETS;
    let lab = this.first ? 'Adopt me!' : 'Adopt  ' + price + '¢';
    let dis = false;
    if (locked) { lab = '★ Level ' + DOG_LEVEL; dis = true; }
    else if (full) { lab = 'Home is full!'; dis = true; }
    else if (!this.first && SAVE.c < price) { lab = 'Need ' + price + '¢'; dis = true; }
    const bw = Math.min(160, W - 40);
    if (button('adopt', W / 2 - bw / 2, H - 36, bw, 28, { label: lab, color: 'pink', disabled: dis, scale: 2, glow: !dis })) this.adopt();
  },
  adopt() {
    const i = this.i, def = BREEDS[i];
    const self = this;
    go('name', {
      title: 'Name your ' + (def.kind === 'dog' ? 'puppy' : 'kitten') + '!', initial: def.pname, max: 10,
      pet: { b: i, lv: 1, eq: {} }, random: () => pick(NAMES),
      onBack: () => go('adopt', { first: self.first }),
      onDone: (nm) => {
        const pet = newPet(i, nm);
        if (self.first) {
          PENDING.save.p.push(pet);
          Game.start(PENDING.slot, PENDING.save);
          PENDING = null;
          go('home', { welcome: true });
        } else {
          if (!Game.spend(self.price(i))) { go('store', { tab: 3 }); return; }
          SAVE.p.push(pet);
          SAVE.ap = SAVE.p.length - 1;
          Game.stat('adopted');
          Game.checkAdventures();
          Game.save();
          go('home', { welcome: true });
        }
      },
    });
  },
};
