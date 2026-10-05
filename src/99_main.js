/* ================================================================
   Main loop & boot
   ================================================================ */
let DT = 1 / 60;
let lastTs = 0;
let errCount = 0, lastErr = '';
const QS = new URLSearchParams(location.search);

function frame(ts) {
  requestAnimationFrame(frame);
  let dt = (ts - lastTs) / 1000;
  lastTs = ts;
  if (!(dt > 0)) dt = 1 / 60;
  dt = Math.min(dt, 0.05);
  DT = dt; T += dt;
  try {
    updateTransition(dt);
    if (SAVE && scene && scene.sim) Game.tick(dt);
    Particles.update(dt);
    Toasts.update(dt);
    if (scene && scene.update) scene.update(dt);
    for (const o of overlays.slice()) if (o.update) o.update(dt);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    UI.justOpened = false;
    UI.on = overlays.length === 0 && Trans.dir === 0;
    UI.clip = null;
    if (scene) scene.draw(dt);
    Particles.draw(0);
    Particles.draw(1);
    const ovs = overlays.slice();
    for (let i = 0; i < ovs.length; i++) {
      UI.on = i === ovs.length - 1 && Trans.dir === 0 && overlays.includes(ovs[i]) && !UI.justOpened;
      ovs[i].draw(dt);
    }
    UI.on = true;
    Toasts.draw();
    drawTransition();
  } catch (e) {
    errCount++;
    lastErr = String(e && e.stack || e);
    if (errCount < 5) console.error(e);
  }
  if (QS.has('debug') && lastErr) text(lastErr.slice(0, 80), 2, H - 9, { color: '#ff0', shadow: '#000' });
  if (I.released) UI.active = null;
  endInputFrame();
  vctx.imageSmoothingEnabled = false;
  vctx.drawImage(buf, 0, 0, view.width, view.height);
}

/* dev-only sprite sheet for checking the art: index.html?test=sheet */
Scenes.sheet = {
  draw() {
    rect(0, 0, W, H, '#bfe0c8');
    const exprs = ['open', 'happy', 'love', 'sad', 'eat', 'sleep', 'star', 'grumpy'];
    const page = parseInt(QS.get('page') || '0', 10);
    if (page === 0) {
      BREEDS.forEach((b, i) => {
        const col = i % 6, row = Math.floor(i / 6);
        for (let s = 0; s < 3; s++) {
          const pet = { b: i, lv: [1, 5, 10][s], eq: {} };
          drawPet(pet, 22 + col * 52 + (s - 1) * 0, 60 + row * 120 + s * 0 - (2 - s) * 0, 1, { stage: s, expr: 'open' });
        }
      });
    } else if (page === 1) {
      BREEDS.forEach((b, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        drawPet({ b: i, lv: 1, eq: {} }, 20 + col * 80, 60 + row * 75, 1, { stage: 0, expr: exprs[i % 8] });
        drawPet({ b: i, lv: 10, eq: {} }, 55 + col * 80, 60 + row * 75, 1, { stage: 2, expr: 'open' });
      });
    } else if (page === 2) {
      BREEDS.forEach((b, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        drawPet({ b: i, lv: 10, eq: {} }, 25 + col * 80, 60 + row * 75, 1, { pose: 'run', legs: Math.floor(T * 10) % 8, expr: 'open' });
        drawPet({ b: i, lv: 10, eq: {} }, 60 + col * 80, 60 + row * 75, 1, { pose: 'lie', expr: 'sleep' });
      });
    } else if (page === 3) {
      const names = Object.keys(ICON_ART);
      names.forEach((n, i) => {
        const col = i % 12, row = Math.floor(i / 12);
        iconC(n, 14 + col * 26, 14 + row * 24, 1);
      });
    } else if (page === 4) {
      const hats = ACCS.filter((a) => a.slot === 'h'), necks = ACCS.filter((a) => a.slot === 'n'), faces = ACCS.filter((a) => a.slot === 'f');
      hats.forEach((a, i) => {
        drawPet({ b: i % 12, lv: i % 2 ? 10 : 1, eq: { h: a.id, n: necks[i % necks.length].id, f: i % 3 === 0 ? faces[(i / 3) % 4 | 0].id : '' } },
          30 + (i % 5) * 60, 75 + Math.floor(i / 5) * 90, 1, { expr: 'happy' });
      });
    } else if (page === 5) {
      drawPet({ b: 0, lv: 10, eq: { h: 'crown' } }, W / 2 - 60, H - 30, 2, { expr: 'open', tail: Math.round(Math.sin(T * 3) * 2) });
      drawPet({ b: 8, lv: 1, eq: { n: 'bandana' } }, W / 2 + 60, H - 30, 2, { expr: 'happy', pawR: 1 });
    }
  },
};

/* dev-only: jump into a prepared save. index.html?test=devhome&b=0&lv=1&furn=1 */
Scenes.devhome = {
  enter() {
    const s = newSave('Tester');
    const lv = parseInt(QS.get('lv') || '1', 10);
    const pet = newPet(parseInt(QS.get('b') || '0', 10), 'Mango'); pet.lv = lv;
    s.p.push(pet);
    if (QS.get('pets')) for (let i = 1; i < parseInt(QS.get('pets'), 10); i++) { const q = newPet(i * 3 % 12, 'Pet' + i); q.lv = i * 3; s.p.push(q); }
    s.c = parseInt(QS.get('c') || '500', 10); s.ol = parseInt(QS.get('ol') || '4', 10);
    s.tut = QS.get('tut') ? 0 : 1; s.gift = QS.get('gift') ? '' : dayKey();
    if (QS.get('furn')) { s.room = ROOM.map((r) => r.id); }
    if (QS.get('wall')) s.wall = QS.get('wall');
    if (QS.get('floor')) s.floor = QS.get('floor');
    if (QS.get('mess')) s.mess = [[0.2, 0.5], [0.7, 0.3]];
    if (QS.get('acc')) { s.acc = ACCS.map((a) => a.id); pet.eq = { h: 'crown', n: 'collar', f: '' }; }
    if (QS.get('tricks')) pet.tr = TRICKS.map(() => 2);
    if (QS.get('low')) pet.s = [10, 20, 12, 15, 30];
    Game.start(0, s);
    if (QS.get('night')) RT.sleeping = true;
    const to = QS.get('to') || 'home';
    go(to, QS.get('welcome') ? { welcome: true } : null, true);
  },
  draw() {},
};

/* promo art: index.html?test=thumb (1200x630) and ?test=icon (square) */
Scenes.thumb = {
  draw(dt) {
    drawDreamBG(0.016, { parade: false });
    // soft rays behind the logo
    g.globalAlpha = 0.18;
    for (let i = 0; i < 18; i++) {
      const a = (i * TAU) / 18 + 0.1;
      line(W / 2, H * 0.32, W / 2 + Math.cos(a) * W, H * 0.32 + Math.sin(a) * W, '#ffffff', 10);
    }
    g.globalAlpha = 1;
    const sc = Math.floor(W / 60);
    const T0 = T; T = 0.35;
    drawLogo(W / 2, H * 0.1, sc, { peek: false });
    T = T0;
    text('Adopt  •  Feed  •  Brush  •  Play  •  Grow!', W / 2, H * 0.1 + sc * 8 + 6, { align: 'center', color: '#ffffff', outline: '#7a3a9a', scale: 2 });
    const order = [0, 8, 1, 2, 9, 3, 4, 10, 5, 6, 11, 7];
    const eqs = [{ h: 'bow' }, { n: 'bandana' }, { h: 'crown' }, { h: 'flower' }, {}, { n: 'bowtie' }, { h: 'witch' }, { h: 'party' }, { h: 'bunny' }, { f: 'shades' }, { n: 'collar' }, { h: 'tophat' }];
    const n = order.length, gap = (W - 40) / n;
    order.forEach((b, i) => {
      const lv = i % 3 === 1 ? 10 : 1;
      const x = 20 + gap * (i + 0.5);
      const y = H - 10 - (i % 2) * 6;
      shadowEllipse(x, y, 14, 3, 0.25);
      drawPet({ b, lv, eq: eqs[i] }, x, y, 2, { expr: ['happy', 'open', 'love', 'star'][i % 4], tail: (i % 5) - 2 });
    });
    for (let i = 0; i < 26; i++) {
      const x = hash2(i, 1, 77) * W, y = hash2(i, 2, 77) * H * 0.62;
      if (Math.abs(x - W / 2) < W * 0.32 && y > H * 0.08 && y < H * 0.45) continue;
      if (i % 3 === 0) iconC('heart', x, y, 1); else { rect(x - 2, y, 5, 1, '#ffffff'); rect(x, y - 2, 1, 5, '#ffffff'); }
    }
    text('MTEC LABS', W - 6, 6, { align: 'right', color: '#ffffff', outline: '#5a6ac8' });
  },
};
Scenes.icon = {
  draw() {
    const bg = gradientCanvasCached('icon', ['#ffb3d8', '#ff8ac0', '#c88aff', '#8a6cff']);
    g.drawImage(bg, 0, 0);
    g.globalAlpha = 0.25;
    for (let i = 0; i < 12; i++) { const a = (i * TAU) / 12; line(W / 2, H * 0.55, W / 2 + Math.cos(a) * W, H * 0.55 + Math.sin(a) * W, '#ffffff', Math.max(2, Math.round(W / 40))); }
    g.globalAlpha = 1;
    const pet = { b: parseInt(QS.get('b') || '0', 10), lv: 1, eq: {} };
    const sc = Math.max(2, Math.floor((H * 0.7) / 32));
    ellipseFill(W / 2, H * 0.86, 16 * sc / 2 + 4, 3 * sc / 2 + 1, 'rgba(60,20,90,0.3)');
    drawPet(pet, W / 2, H * 0.86, sc, { expr: 'happy', tail: 2 });
    const s2 = Math.max(1, Math.round(W / 90));
    for (const [fx, fy] of [[0.18, 0.2], [0.82, 0.26], [0.86, 0.66], [0.14, 0.62]]) {
      rect(W * fx - 2 * s2, H * fy, 5 * s2, s2, '#ffffff'); rect(W * fx, H * fy - 2 * s2, s2, 5 * s2, '#ffffff');
    }
    iconC('heart', W * 0.8, H * 0.42, s2);
  },
};

function saveNow() { try { if (SAVE && SLOT >= 0) Game.save(); } catch (e) { /* ignore */ } }
document.addEventListener('visibilitychange', () => { if (document.hidden) saveNow(); });
window.addEventListener('pagehide', saveNow);

function boot() {
  loadCfg();
  const t = QS.get('test');
  if (t && Scenes[t]) { go(t, null, true); }
  else go('boot', null, true);
  requestAnimationFrame(frame);
}
if (QS.has('test') || QS.has('debug')) window.KT = { get W() { return W; }, get H() { return H; }, R: UI_RECTS, get scene() { return scene; }, get RT() { return RT; }, go, Scenes, Game, get SAVE() { return SAVE; }, set SAVE(v) { SAVE = v; }, I, overlays, newSave, newPet, Snd };
boot();
