/* ================================================================
   Home: the pet's room. HUD, needs, pet AI, actions, events.
   ================================================================ */

/* ---------- layout ---------- */
function homeLayout() {
  const L = {};
  L.hudH = 20;
  L.statY = 22; L.statH = 12;
  L.port = PORTRAIT;
  L.actRows = L.port ? 2 : 1;
  L.actH = L.port ? 32 : 34;
  L.barH = L.actRows * (L.actH + 3) + 5;
  L.barY = H - L.barH;
  L.roomTop = L.statY + L.statH + 2;
  L.floorY = Math.round(lerp(L.roomTop, L.barY, L.port ? 0.48 : 0.5));
  L.groundY = Math.round(lerp(L.floorY, L.barY, 0.66));
  L.sideS = 24; L.sideX = W - L.sideS - 4;
  L.minX = 34; L.maxX = W - L.sideS - 34;
  L.bowlX = Math.round(W * (L.port ? 0.2 : 0.22)); L.bowlY = L.groundY + 6;
  L.bedX = Math.round(W * 0.1) + 24; L.bedY = L.groundY + 10;
  return L;
}

/* ---------- room drawing ---------- */
const Room = { key: '', cv: null, fishes: [] };
function wallPaint(L) {
  const wall = SAVE.wall, top = 0, h = L.floorY;
  switch (wall) {
    case 'wall_pink':
      rect(0, top, W, h, '#ffd6ec');
      for (let y = 6; y < h; y += 16) for (let x = ((y / 16) % 2) * 8 + 2; x < W; x += 16) {
        rect(x, y, 2, 1, '#ffaed4'); rect(x + 3, y, 2, 1, '#ffaed4'); rect(x, y + 1, 5, 1, '#ffaed4'); rect(x + 1, y + 2, 3, 1, '#ffaed4'); rect(x + 2, y + 3, 1, 1, '#ffaed4');
      }
      break;
    case 'wall_mint':
      rect(0, top, W, h, '#c8f4e0');
      for (let y = 4; y < h; y += 10) for (let x = ((y / 10) % 2) * 5 + 2; x < W; x += 10) rect(x, y, 2, 2, '#9ae6c6');
      break;
    case 'wall_sky': {
      const c = gradientCanvas(W, h, ['#8ccaff', '#c4e6ff']);
      g.drawImage(c, 0, top);
      for (let i = 0; i < W / 40; i++) {
        const cx = hash2(i, 1, 7) * W, cy = 10 + hash2(i, 2, 7) * (h - 30);
        for (let k = 0; k < 3; k++) disc(cx + k * 5, cy + (k === 1 ? -2 : 0), 4, '#ffffff');
      }
      break;
    }
    case 'wall_star':
      rect(0, top, W, h, '#3a2a6a');
      for (let i = 0; i < W * h / 120; i++) {
        const sx = hash2(i, 3, 9) * W, sy = hash2(i, 4, 9) * h;
        rect(sx, sy, 1, 1, i % 5 === 0 ? '#ffd84a' : '#a89ae0');
        if (i % 17 === 0) { rect(sx - 1, sy, 3, 1, '#ffd84a'); rect(sx, sy - 1, 1, 3, '#ffd84a'); }
      }
      break;
    case 'wall_rainbow': {
      const cols = ['#ffb3c8', '#ffd4a8', '#fff2a8', '#c8f4c0', '#b8e0ff', '#d8c4ff'];
      const bh = Math.ceil(h / cols.length);
      cols.forEach((c, i) => rect(0, top + i * bh, W, bh, c));
      break;
    }
    default:
      rect(0, top, W, h, '#fff0dc');
      for (let x = 0; x < W; x += 12) rect(x, top, 5, h, '#f8e4ca');
      for (let x = 2; x < W; x += 12) rect(x, top, 1, h, '#f2d8b8');
  }
  // trim + baseboard
  rect(0, L.floorY - 5, W, 5, '#ffffff');
  rect(0, L.floorY - 5, W, 1, '#e0d0e8');
  rect(0, L.floorY - 1, W, 1, '#c8b0c8');
}
function floorPaint(L) {
  const y0 = L.floorY, h = H - y0;
  switch (SAVE.floor) {
    case 'floor_check':
      for (let y = 0; y < h; y += 8) for (let x = 0; x < W; x += 8) rect(x, y0 + y, 8, 8, ((x + y) / 8) % 2 ? '#d8c8ff' : '#ffffff');
      break;
    case 'floor_carpet':
      rect(0, y0, W, h, '#ff9ec8');
      patternFill(0, y0, W, h, 'dots', '#ff9ec8', '#ff86ba');
      break;
    case 'floor_grass':
      rect(0, y0, W, h, '#6ad46a');
      for (let i = 0; i < W * h / 20; i++) {
        const gx = Math.floor(hash2(i, 5, 3) * W), gy = y0 + Math.floor(hash2(i, 6, 3) * h);
        rect(gx, gy, 1, 2, i % 3 ? '#52b858' : '#8ee88a');
      }
      break;
    case 'floor_cloud':
      rect(0, y0, W, h, '#d8ecff');
      for (let i = 0; i < W / 14; i++) {
        const cx = hash2(i, 7, 1) * W, cy = y0 + hash2(i, 8, 1) * h;
        disc(cx, cy, 5 + hash2(i, 9, 1) * 4, '#f4faff');
      }
      break;
    default: {
      rect(0, y0, W, h, '#c8864a');
      for (let y = 0, r = 0; y < h; y += 7, r++) {
        rect(0, y0 + y, W, 1, '#a86a36');
        rect(0, y0 + y + 1, W, 1, '#d89a5a');
        for (let x = (r % 3) * 23; x < W; x += 70) rect(x, y0 + y, 1, 7, '#a86a36');
      }
    }
  }
  // soft shadow under the wall
  g.globalAlpha = 0.15; rect(0, y0, W, 3, '#2a1030'); g.globalAlpha = 1;
}
function winRect(L) {
  const ww = L.port ? 48 : 58, wh = Math.min(46, L.floorY - L.roomTop - 22);
  return { x: Math.round(W * (L.port ? 0.1 : 0.12)), y: L.roomTop + 8, w: ww, h: wh };
}
function drawWindowFrame(L) {
  const r = winRect(L);
  rrect(r.x - 4, r.y - 4, r.w + 8, r.h + 8, COL.ink, 2);
  rect(r.x - 3, r.y - 3, r.w + 6, r.h + 6, '#fff8f0');
  rect(r.x - 1, r.y - 1, r.w + 2, r.h + 2, '#d8c0b0');
  g.clearRect(r.x, r.y, r.w, r.h);
  // sill
  rrect(r.x - 7, r.y + r.h + 3, r.w + 14, 5, COL.ink, 1);
  rect(r.x - 6, r.y + r.h + 4, r.w + 12, 3, '#fff8f0');
  // curtains
  for (const side of [-1, 1]) {
    const cx = side < 0 ? r.x - 6 : r.x + r.w + 6;
    for (let y = r.y - 6; y < r.y + r.h + 6; y++) {
      const t = (y - r.y + 6) / (r.h + 12);
      const wdt = Math.round(10 - Math.sin(t * Math.PI) * 4 + (t > 0.6 ? (t - 0.6) * 8 : 0));
      const x = side < 0 ? cx - 2 : cx - wdt + 2;
      rect(x - 1, y, wdt + 2, 1, COL.ink);
      rect(x, y, wdt, 1, '#ff8ac0');
      rect(side < 0 ? x + 2 : x + wdt - 4, y, 1, 1, '#ffb8d8');
      rect(side < 0 ? x + 5 : x + wdt - 7, y, 1, 1, '#e0609a');
    }
  }
  rrect(r.x - 10, r.y - 9, r.w + 20, 4, COL.ink, 1);
  rect(r.x - 9, r.y - 8, r.w + 18, 2, '#c8864a');
}
function drawWindowSky(L) {
  const r = winRect(L);
  const hr = new Date().getHours() + new Date().getMinutes() / 60;
  let stops, night = false;
  if (hr >= 7 && hr < 17.5) stops = ['#4aa8ff', '#9ad4ff', '#d8f0ff'];
  else if (hr >= 17.5 && hr < 20) stops = ['#5a4aa8', '#ff7a9a', '#ffc08a'];
  else if (hr >= 5.5 && hr < 7) stops = ['#7a8ad8', '#ffa8b8', '#ffe0a8'];
  else { stops = ['#0a0c30', '#1c2060', '#2e3478']; night = true; }
  if (RT.sleeping) { stops = ['#0a0c30', '#1c2060', '#2e3478']; night = true; }
  const bh = Math.ceil(r.h / stops.length);
  stops.forEach((c, i) => rect(r.x, r.y + i * bh, r.w, Math.min(bh, r.h - i * bh), c));
  g.save(); g.beginPath(); g.rect(r.x, r.y, r.w, r.h); g.clip();
  if (night) {
    for (let i = 0; i < 14; i++) {
      const sx = r.x + hash2(i, 1, 5) * r.w, sy = r.y + hash2(i, 2, 5) * r.h * 0.8;
      if (Math.sin(T * 2 + i * 1.7) > -0.3) rect(sx, sy, 1, 1, '#ffffff');
    }
    disc(r.x + r.w * 0.72, r.y + 11, 6, '#fff4c0'); disc(r.x + r.w * 0.72 + 3, r.y + 9, 5, stops[0]);
  } else {
    disc(r.x + r.w * 0.75, r.y + 11, 6, '#fff0a0'); disc(r.x + r.w * 0.75, r.y + 11, 4, '#ffffff');
    const cx = r.x + ((T * 4) % (r.w + 40)) - 20;
    for (let k = 0; k < 3; k++) disc(cx + k * 5, r.y + r.h * 0.45 + (k === 1 ? -2 : 0), 4, '#ffffff');
  }
  // far hills
  for (let x = 0; x < r.w; x++) {
    const hy = r.y + r.h - 8 + Math.round(Math.sin((r.x + x) * 0.1) * 3);
    rect(r.x + x, hy, 1, r.y + r.h - hy, night ? '#1e3a3a' : '#7fd492');
  }
  g.restore();
  // bars
  rect(r.x + r.w / 2 - 1, r.y, 2, r.h, '#fff8f0');
  rect(r.x, r.y + r.h / 2 - 1, r.w, 2, '#fff8f0');
}

/* furniture pieces (drawn at a base point) */
const FURN = {
  plant(x, by) {
    // leaves
    const lv = [[0, -30, 6], [-7, -24, 6], [7, -24, 6], [-4, -16, 5], [5, -17, 5], [0, -21, 5]];
    for (const [dx, dy, r] of lv) disc(x + dx, by + dy, r + 1, COL.ink);
    for (const [dx, dy, r] of lv) disc(x + dx, by + dy, r, '#4cbc5c');
    for (const [dx, dy, r] of lv) disc(x + dx - 1, by + dy - 1, r - 2, '#7ee08a');
    // pot
    for (let i = 0; i < 12; i++) {
      const w = 16 - Math.floor(i / 3);
      rect(x - w / 2 - 1, by - 12 + i, w + 2, 1, COL.ink);
      rect(x - w / 2, by - 12 + i, w, 1, i < 3 ? '#ff9a5a' : '#e07a3a');
    }
    rect(x - 8, by - 13, 16, 1, COL.ink);
  },
  lamp(x, by, on) {
    rect(x - 7, by - 2, 14, 3, COL.ink); rect(x - 6, by - 1, 12, 1, '#7a6aa0');
    rect(x - 1, by - 40, 3, 39, COL.ink); rect(x, by - 40, 1, 39, '#b0a0d0');
    for (let i = 0; i < 12; i++) {
      const w = 8 + i;
      rect(x - w / 2 - 1, by - 52 + i, w + 3, 1, COL.ink);
      rect(x - w / 2, by - 52 + i, w + 1, 1, on ? '#fff0a0' : '#ffd84a');
    }
    rect(x - 4, by - 53, 9, 1, COL.ink);
  },
  tree(x, by) {
    const post = (px, top, bot) => { rect(px - 3, top, 7, bot - top, COL.ink); for (let y = top; y < bot; y++) rect(px - 2, y, 5, 1, y % 3 ? '#e8c890' : '#c8a060'); };
    post(x - 8, by - 34, by); post(x + 10, by - 56, by - 30);
    const plat = (px, py, w) => { rrect(px - w / 2 - 1, py - 1, w + 2, 7, COL.ink, 2); rrect(px - w / 2, py, w, 5, '#9a6cff', 1); rect(px - w / 2 + 1, py, w - 2, 1, '#c8b0ff'); };
    rrect(x - 20, by - 4, 40, 5, COL.ink, 1); rect(x - 19, by - 3, 38, 3, '#7a52d0');
    plat(x - 2, by - 36, 30);
    // little house on top
    rrect(x - 3, by - 70, 26, 16, COL.ink, 2); rect(x - 2, by - 69, 24, 14, '#9a6cff');
    disc(x + 10, by - 62, 4, '#3a2060');
    plat(x + 10, by - 56, 30);
    rect(x + 3, by - 72, 14, 3, COL.ink);
  },
  bedBack(x, by) {
    ellipseFill(x, by - 6, 27, 10, COL.ink);
    ellipseFill(x, by - 6, 26, 9, '#9a6cff');
    ellipseFill(x, by - 5, 22, 6, '#ffd6ec');
    ellipseFill(x, by - 6, 20, 4, '#ffe8f4');
  },
  bedFront(x, by) {
    for (let dx = -27; dx <= 27; dx++) {
      const t = 1 - (dx * dx) / (27 * 27);
      const yy = by - 6 + Math.round(Math.sqrt(Math.max(0, t)) * 9);
      rect(x + dx, yy - 3, 1, 4, COL.ink);
      rect(x + dx, yy - 2, 1, 2, '#b088ff');
    }
  },
  rug(x, y) {
    ellipseFill(x, y, 48, 9, COL.ink);
    ellipseFill(x, y, 47, 8, '#ffd84a');
    ellipseFill(x, y, 40, 6, '#ff9ac8');
    ellipseFill(x, y, 32, 4, '#ffd84a');
    ellipseFill(x, y, 24, 3, '#ffffff');
  },
  tankBase(x, by) {
    rrect(x - 20, by - 18, 40, 18, COL.ink, 1); rect(x - 19, by - 17, 38, 16, '#c8864a'); rect(x - 19, by - 17, 38, 2, '#e0a868');
    rect(x - 1, by - 15, 2, 12, '#a86a36'); rect(x - 6, by - 10, 2, 2, '#ffd84a'); rect(x + 4, by - 10, 2, 2, '#ffd84a');
    rrect(x - 20, by - 44, 40, 27, COL.ink, 1); rect(x - 19, by - 43, 38, 25, '#5ac8ff'); rect(x - 19, by - 43, 38, 3, '#a8e8ff');
    rect(x - 19, by - 22, 38, 4, '#ffe0a0'); rect(x - 19, by - 22, 38, 1, '#f0c870');
    for (let i = 0; i < 4; i++) { const px = x - 14 + i * 9; rect(px, by - 30 + (i % 2) * 3, 2, 8 - (i % 2) * 3, '#3cbc6c'); }
    rect(x - 19, by - 43, 2, 25, 'rgba(255,255,255,0.4)');
  },
  toys(x, by) {
    disc(x - 6, by - 14, 5, COL.ink); disc(x - 6, by - 14, 4, '#ff8ac0'); rect(x - 8, by - 16, 1, 1, '#ffffff');
    disc(x + 5, by - 15, 4, COL.ink); disc(x + 5, by - 15, 3, '#4fb4ff');
    rect(x + 10, by - 20, 2, 8, COL.ink); rect(x + 11, by - 26, 1, 8, '#ff5a5a');
    rrect(x - 15, by - 11, 30, 11, COL.ink, 2);
    for (let y = 0; y < 9; y++) rect(x - 14, by - 10 + y, 28, 1, y % 2 ? '#c8864a' : '#e0a868');
    for (let xx = -12; xx < 14; xx += 4) rect(x + xx, by - 10, 1, 9, '#a86a36');
  },
  castle(x, by) {
    rrect(x - 22, by - 30, 44, 30, COL.ink, 1); rect(x - 21, by - 29, 42, 28, '#e8c090');
    for (let i = 0; i < 6; i++) { rect(x - 22 + i * 8, by - 35, 6, 6, COL.ink); rect(x - 21 + i * 8, by - 34, 4, 5, '#e8c090'); }
    rrect(x - 6, by - 16, 12, 16, COL.ink, 3); rect(x - 5, by - 15, 10, 15, '#3a2050');
    rect(x - 16, by - 24, 6, 6, COL.ink); rect(x + 10, by - 24, 6, 6, COL.ink);
    rect(x - 21, by - 12, 42, 1, '#c8a070');
    rect(x - 1, by - 48, 1, 14, COL.ink); rect(x, by - 48, 8, 5, '#ff5a8a');
  },
  bowl(x, by, food) {
    ellipseFill(x, by - 1, 14, 3, 'rgba(40,10,40,0.2)');
    for (let i = 0; i < 8; i++) {
      const w = 26 - (i > 4 ? (i - 4) * 3 : 0);
      rect(x - w / 2 - 1, by - 9 + i, w + 2, 1, COL.ink);
      rect(x - w / 2, by - 9 + i, w, 1, i < 2 ? '#ff8a8a' : '#ff4f5e');
    }
    rect(x - 12, by - 10, 24, 1, COL.ink);
    if (food) iconC(food, x, by - 13, 1);
  },
};

function roomKey(L) {
  return [W, H, layoutVersion, SAVE.wall, SAVE.floor, ...ROOM.filter((r) => r.type === 'furn' && Game.hasFurn(r.id)).map((r) => r.id)].join('|');
}
function buildRoom(L) {
  const [cv, cx] = makeCanvas(W, H);
  withCtx(cx, () => {
    wallPaint(L);
    floorPaint(L);
    drawWindowFrame(L);
    const has = (id) => Game.hasFurn(id);
    if (has('rug')) FURN.rug(W * 0.5, L.groundY + 2);
    if (has('plant')) FURN.plant(14, L.floorY + 8);
    if (has('castle')) FURN.castle(Math.round(W * 0.3), L.floorY + 12);
    if (has('tank')) FURN.tankBase(Math.round(W * 0.6), L.floorY + 10);
    if (has('tree')) FURN.tree(W - L.sideS - 40, L.floorY + 14);
  });
  return cv;
}

function drawRoom(L, dt) {
  const key = roomKey(L);
  if (Room.key !== key) { Room.key = key; Room.cv = buildRoom(L); Room.fishes = [0, 1, 2].map((i) => ({ x: rnd(-14, 14), y: rnd(-38, -26), v: rnd(4, 9) * (i % 2 ? 1 : -1), c: ['#ff9a3c', '#ffd84a', '#ff6fa8'][i] })); }
  drawWindowSky(L);
  g.drawImage(Room.cv, 0, 0);
  const has = (id) => Game.hasFurn(id);
  if (has('tank')) {
    const tx = Math.round(W * 0.6), tb = L.floorY + 10;
    for (const f of Room.fishes) {
      f.x += f.v * dt;
      if (f.x > 14) { f.x = 14; f.v = -Math.abs(f.v); } if (f.x < -15) { f.x = -15; f.v = Math.abs(f.v); }
      const fx = Math.round(tx + f.x), fy = Math.round(tb + f.y + Math.sin(T * 2 + f.v) * 1.5);
      rect(fx - 2, fy, 5, 3, f.c); rect(fx + (f.v > 0 ? -3 : 3), fy + 1, 1, 1, f.c); rect(fx + (f.v > 0 ? 1 : -1), fy, 1, 1, '#1c1024');
    }
    if (Math.random() < dt * 2) Particles.add({ type: 'pixel', x: tx + rnd(-15, 15), y: tb - 22, vy: -8, life: 2.4, color: '#e0f8ff' });
  }
  if (has('portrait')) {
    const px = Math.round(W * 0.68), py = L.roomTop + 8;
    rrect(px - 1, py - 1, 30, 30, COL.ink, 1); rect(px, py, 28, 28, '#ffd84a'); rect(px + 1, py + 1, 26, 26, '#e0a020');
    rect(px + 3, py + 3, 22, 22, '#ffe8f4');
    const pet = Game.pet();
    const spr = petSprite(pet, { expr: 'happy' });
    const hh = petHeight(pet, 'sit');
    g.drawImage(spr, POX - 11, Math.round(POY - hh + 2), 22, 22, px + 3, py + 3, 22, 22);
  }
  if (has('clock')) {
    const cx = Math.round(W * 0.3), cy = L.roomTop + 18;
    disc(cx, cy, 10, COL.ink); disc(cx, cy, 9, '#ff9ac8'); disc(cx, cy, 7, '#ffffff');
    const d = new Date();
    const hA = ((d.getHours() % 12) + d.getMinutes() / 60) / 12 * TAU - Math.PI / 2, mA = d.getMinutes() / 60 * TAU - Math.PI / 2;
    line(cx, cy, cx + Math.cos(hA) * 4, cy + Math.sin(hA) * 4, COL.ink);
    line(cx, cy, cx + Math.cos(mA) * 6, cy + Math.sin(mA) * 6, COL.ink);
    for (let i = 0; i < 12; i += 3) rect(cx + Math.round(Math.cos(i / 12 * TAU) * 6), cy + Math.round(Math.sin(i / 12 * TAU) * 6), 1, 1, '#c8407a');
  }
  if (has('lamp')) FURN.lamp(Math.round(W * 0.45), L.floorY + 6, RT.sleeping);
}
function drawRoomLights(L) {
  const has = (id) => Game.hasFurn(id);
  if (RT.sleeping) {
    g.globalAlpha = 0.55; rect(0, L.roomTop, W, H - L.roomTop, '#0a0828'); g.globalAlpha = 1;
    if (has('lamp')) {
      const lx = Math.round(W * 0.45), ly = L.floorY - 40;
      for (let r = 40; r > 8; r -= 8) { g.globalAlpha = 0.07; disc(lx, ly, r, '#ffe8a0'); }
      g.globalAlpha = 1;
      FURN.lamp(lx, L.floorY + 6, true);
    }
  }
  if (has('lights')) {
    const y0 = L.roomTop + 2;
    for (let x = 0; x < W; x++) {
      const yy = y0 + Math.round(Math.abs(Math.sin(x * Math.PI / 24)) * 4);
      rect(x, yy, 1, 1, '#3a6a3a');
      if (x % 12 === 6) {
        const on = Math.sin(T * 3 + x) > -0.2;
        const c = ['#ff6fa8', '#ffd84a', '#4fd1a5', '#4fb4ff', '#c3a8ff'][(x / 12 | 0) % 5];
        rect(x - 1, yy + 1, 3, 3, on ? c : darken(c, 0.4));
        if (on && RT.sleeping) { g.globalAlpha = 0.3; disc(x, yy + 2, 4, c); g.globalAlpha = 1; }
      }
    }
  }
  if (has('disco')) {
    const cx = Math.round(W * 0.5), cy = L.roomTop + 14;
    rect(cx, L.roomTop, 1, 8, COL.ink);
    disc(cx, cy, 7, COL.ink); disc(cx, cy, 6, '#c8c8e0');
    for (let i = 0; i < 6; i++) rect(cx - 5 + ((i * 3 + Math.floor(T * 6)) % 10), cy - 4 + (i % 4) * 2, 2, 1, i % 2 ? '#ffffff' : '#9a9ab8');
    g.globalAlpha = RT.sleeping ? 0.5 : 0.22;
    for (let i = 0; i < 7; i++) {
      const a = T * 0.6 + i * 0.9;
      const sx = cx + Math.cos(a) * W * 0.4, sy = L.roomTop + 40 + Math.sin(a * 1.3) * 30;
      disc(sx, sy, 3, CONFETTI[i % 6]);
    }
    g.globalAlpha = 1;
  }
}

/* ---------- pet animation helpers ---------- */
function trickPose(id, k, pet) {
  // returns sprite params + offsets for a trick at progress k (0..1)
  const st = { pose: 'sit', expr: 'happy' }; let dx = 0, dy = 0;
  switch (id) {
    case 'sit': dy = -Math.abs(Math.sin(k * Math.PI * 3)) * 3; st.tail = Math.round(Math.sin(k * 20) * 2); break;
    case 'five': st.pawR = k < 0.15 ? k / 0.15 : k > 0.85 ? (1 - k) / 0.15 : 1; st.expr = k > 0.3 && k < 0.8 ? 'star' : 'happy'; break;
    case 'spin': { const c = Math.cos(k * TAU * 2); st.sx = Math.max(0.2, Math.abs(c)); st.flip = c < 0; dy = -Math.sin(k * Math.PI) * 6; break; }
    case 'jump': dy = -Math.sin(k * Math.PI) * 42; st.rot = k > 0.15 && k < 0.85 ? ((k - 0.15) / 0.7) * TAU : 0; st.pivY = -16; st.expr = 'star'; break;
    case 'wave': st.pawR = 0.65 + 0.35 * Math.sin(k * TAU * 4); st.expr = 'happy'; break;
    case 'beg': st.pose = 'stand'; dy = -Math.abs(Math.sin(k * Math.PI * 4)) * 2; st.expr = 'love'; break;
    case 'roll': st.rot = k * TAU; st.pivY = -14; dx = Math.sin(k * Math.PI) * 26; dy = -4 * Math.sin(k * Math.PI); st.expr = 'dizzy'; if (k > 0.85) st.expr = 'happy'; break;
    case 'dance': { const b = Math.floor(k * 8) % 2; st.pawL = b ? 1 : 0.3; st.pawR = b ? 0.3 : 1; dx = Math.sin(k * TAU * 2) * 8; dy = -Math.abs(Math.sin(k * TAU * 4)) * 4; st.expr = 'happy'; break; }
    case 'paw': st.pawR = Math.min(1, k * 4) * (k > 0.8 ? (1 - k) * 5 : 1); break;
  }
  return { st, dx, dy };
}

function drawBubble(x, y, iconName, label) {
  // thought / speech bubble anchored at (x, y) = tip point
  const w = label ? textWidth(label) + 12 : 24, h = 18;
  const bx = Math.round(clamp(x - w / 2, 2, W - w - 2)), by = Math.round(y - h - 6);
  rrect(bx, by, w, h, COL.ink, 4); rrect(bx + 1, by + 1, w - 2, h - 2, '#ffffff', 3);
  disc(x - 2, y - 4, 2, COL.ink); disc(x - 2, y - 4, 1, '#ffffff');
  rect(x - 3, y - 1, 2, 2, COL.ink);
  if (iconName) iconC(iconName, bx + w / 2, by + h / 2, 1);
  if (label) text(label, bx + w / 2, by + 5, { align: 'center', color: COL.ink });
}

/* ---------- the Home scene ---------- */
Scenes.home = {
  sim: true,
  enter(a) {
    a = a || {};
    this.t = 0; this.L = homeLayout(); this.lv = layoutVersion;
    this.food = null; this.loveMeter = 0; this.petMode = false; this.welcome = a.welcome ? { t: 0, opened: false, box: true } : null;
    this.purrT = 0; this.messHint = 0;
    const rt = Game.rt();
    rt.x = W / 2; rt.state = 'idle'; rt.t = 0; rt.dur = 2; rt.jump = 0; rt.jumpV = 0; rt.trick = null; rt.say = '';
    if (RT.sleeping) { rt.state = 'sleep'; rt.x = this.L.bedX; }
    Music.play(RT.sleeping ? 'night' : 'home');
    if (!a.welcome && RT.awayMins > 90) { Toasts.add(Game.pet().n + ' missed you!', 'heart', 'pink'); RT.awayMins = 0; }
    this.toldTired = false;
  },
  leave() { Game.save(); },
  pet() { return Game.pet(); },
  update(dt) {
    this.t += dt;
    if (this.lv !== layoutVersion) { this.L = homeLayout(); this.lv = layoutVersion; }
    const L = this.L, pet = this.pet(), rt = Game.rt();
    // events (level-ups, growing, star levels) & daily gift
    if (!overlays.length && !this.welcome && Trans.dir === 0) {
      if (RT.events.length) showEvent(RT.events.shift());
      else if (!RT.giftChecked) { RT.giftChecked = true; if (SAVE.gift !== dayKey()) showDailyGift(); }
      else if (!SAVE.tut) { SAVE.tut = 1; showTutorial(); }
    }
    if (this.welcome) { this.updateWelcome(dt); return; }
    this.updatePet(dt, pet, rt, L);
    // auto-wake when fully rested
    if (RT.sleeping && pet.s[2] >= 100) { this.setSleep(false); Toasts.add(pet.n + ' is full of energy!', 'bolt', 'sun'); }
  },
  setSleep(on) {
    const rt = Game.rt(), pet = this.pet();
    if (on === RT.sleeping) return;
    RT.sleeping = on;
    Snd.play('lamp');
    if (on) {
      this.napStart = pet.s[2];
      rt.state = 'walk'; rt.tx = Game.hasFurn('bed') ? this.L.bedX : clamp(rt.x, this.L.minX, this.L.maxX);
      rt.onArrive = () => { rt.state = 'sleep'; rt.t = 0; };
      Music.play('night');
    } else {
      if (pet.s[2] - (this.napStart || 0) >= 15) { Game.track('nap'); Game.addXP(5); }
      rt.state = 'react'; rt.t = 0; rt.jumpV = -90; rt.expr = 'happy';
      Music.play('home');
    }
  },
  petBox() {
    const rt = Game.rt(), pet = this.pet();
    const sc = 2, h = petHeight(pet, rt.state === 'sleep' ? 'lie' : 'sit') * sc;
    const w = (rt.state === 'sleep' ? 30 : 20) * sc;
    return { x: rt.x - w / 2, y: this.L.groundY - rt.jump - h, w, h: h + 4 };
  },
  updatePet(dt, pet, rt, L) {
    rt.t += dt;
    // blinking
    rt.blinkT -= dt;
    if (rt.blinkT <= 0) { rt.blink = 0.12; rt.blinkT = rnd(2.5, 5); }
    rt.blink = Math.max(0, rt.blink - dt);
    // jump physics
    if (rt.jump > 0 || rt.jumpV !== 0) {
      rt.jumpV += 420 * dt; rt.jump -= rt.jumpV * dt;
      if (rt.jump <= 0) { rt.jump = 0; if (rt.jumpV > 60) rt.squash = 0.15; rt.jumpV = 0; }
    }
    rt.squash = Math.max(0, rt.squash - dt);
    rt.sayT -= dt;
    // touching the pet: tap = boop, drag = petting
    const box = this.petBox();
    const over = I.x > box.x - 6 && I.x < box.x + box.w + 6 && I.y > box.y - 6 && I.y < box.y + box.h;
    const canTouch = UI.on && !this.welcome && overlays.length === 0;
    if (canTouch && I.down && over && I.moved > 10 && rt.state !== 'sleep' && rt.state !== 'eat') {
      // petting
      if (rt.state !== 'petted') { rt.state = 'petted'; rt.t = 0; }
      rt.petT = 0.4;
      const d = Math.hypot(I.dx, I.dy);
      this.loveMeter += d;
      this.heartAcc = (this.heartAcc || 0) + d;
      if (this.heartAcc > 26) { this.heartAcc = 0; Particles.add({ type: 'heart', x: I.x + rnd(-4, 4), y: I.y - 4, vy: -30, vx: rnd(-10, 10), life: 0.9, layer: 1 }); }
      this.purrT -= dt;
      if (this.purrT <= 0) { this.purrT = 1.3; if (Game.isDog()) Snd.play('hearts'); else Snd.purr(1.2); }
      if (this.loveMeter >= 420) this.finishPetting();
    }
    if (canTouch && I.released && I.tap && over && rt.state !== 'eat') {
      if (rt.state === 'sleep') { rt.say = 'Zzz...'; rt.sayT = 1.2; }
      else {
        rt.state = 'react'; rt.t = 0; rt.jumpV = -110; rt.expr = pick(['happy', 'love', 'wow']);
        Game.voice(pet);
        burst('heart', rt.x, box.y + 10, 3, { speed: 40, props: { vy: -40, layer: 1 }, life: 0.9 });
        if (!this.boopT || T - this.boopT > 3) { Game.boost(1, 2); this.boopT = T; }
      }
    }
    if (rt.state === 'petted') {
      rt.petT -= dt;
      if (rt.petT <= 0 || !I.down) { rt.state = 'idle'; rt.t = 0; rt.dur = 1.5; }
    }
    // mess cleaning
    if (canTouch && I.released && I.tap) {
      for (let i = 0; i < SAVE.mess.length; i++) {
        const [mx, my] = this.messPos(i);
        if (Math.abs(I.x - mx) < 12 && Math.abs(I.y - my) < 12) {
          SAVE.mess.splice(i, 1);
          Snd.play('clean');
          burst('sparkle', mx, my - 4, 10, { speed: 40, props: { size: 3, color: '#ffffff', layer: 1 } });
          Game.addCoins(3, mx, my);
          Game.addXP(2);
          Game.boost(3, 4);
          Game.track('clean'); Game.stat('cleaned');
          floatText('Clean!', mx, my - 12, '#ffffff');
          break;
        }
      }
    }
    // AI
    const stage = stageOf(pet);
    const speed = [34, 40, 46][stage];
    switch (rt.state) {
      case 'idle': {
        rt.expr = 'open';
        if (rt.t > rt.dur) this.chooseIdle(pet, rt, L);
        break;
      }
      case 'walk': {
        const d = rt.tx - rt.x;
        rt.face = d >= 0 ? 1 : -1;
        rt.x += Math.sign(d) * Math.min(Math.abs(d), speed * dt);
        rt.legs = (rt.legs || 0) + dt * speed * 0.3;
        if (Math.abs(d) < 1) {
          rt.x = rt.tx;
          const cb = rt.onArrive; rt.onArrive = null;
          rt.state = 'idle'; rt.t = 0; rt.dur = rnd(1.5, 4);
          if (cb) cb();
        }
        break;
      }
      case 'eat': {
        if (Math.random() < dt * 8) Particles.add({ type: 'pixel', x: L.bowlX + rnd(-6, 6), y: L.bowlY - 12, vx: rnd(-25, 25), vy: rnd(-40, -10), g: 200, life: 0.6, color: '#c8864a', layer: 1 });
        if (rt.t > 2.4) this.finishEating(pet, rt);
        break;
      }
      case 'sleep': {
        rt.expr = 'sleep';
        if (Math.random() < dt * 0.8) Particles.add({ type: 'zzz', x: rt.x - 10, y: L.groundY - 30, vx: -6, vy: -14, life: 2.2, layer: 1 });
        break;
      }
      case 'react': if (rt.t > 0.9 && rt.jump === 0) { rt.state = 'idle'; rt.t = 0; rt.dur = 2; } break;
      case 'groom': if (rt.t > 2.2) { rt.state = 'idle'; rt.t = 0; rt.dur = 2; } break;
      case 'rest': if (rt.t > rt.dur) { rt.state = 'idle'; rt.t = 0; rt.dur = 1; } break;
      case 'play': {
        if (rt.jump === 0 && rt.t < 2.4 && Math.random() < dt * 2) { rt.jumpV = -100; }
        if (rt.t > 2.6) { rt.state = 'idle'; rt.t = 0; rt.dur = 2; }
        break;
      }
      case 'refuse': if (rt.t > 1.2) { rt.state = 'idle'; rt.t = 0; rt.dur = 1; } break;
      case 'trick': {
        if (rt.t > 2) {
          rt.state = 'idle'; rt.t = 0; rt.dur = 2;
          burst('star', rt.x, L.groundY - 40, 6, { speed: 60, props: { layer: 1 } });
          Snd.play('sparkle');
        }
        if (rt.trick === 'dance' && Math.random() < dt * 4) Particles.add({ type: 'note', x: rt.x + rnd(-20, 20), y: L.groundY - 50, vy: -20, life: 1.2, color: pick(CONFETTI), layer: 1 });
        break;
      }
    }
    // needs bubble
    rt.bubbleT -= dt;
    if (rt.bubbleT <= 0) {
      rt.bubbleT = rt.bubble != null ? rnd(6, 10) : 3;
      if (rt.bubble != null) rt.bubble = null;
      else if (rt.state === 'idle' || rt.state === 'walk') {
        let low = -1, lv = 30;
        pet.s.forEach((v, i) => { if (v < lv) { lv = v; low = i; } });
        if (low >= 0) rt.bubble = low;
      }
    }
  },
  chooseIdle(pet, rt, L) {
    const r = Math.random();
    rt.t = 0;
    const tired = pet.s[2] < 30;
    if (r < 0.42) {
      rt.state = 'walk'; rt.tx = rnd(L.minX, L.maxX);
      if (Math.abs(rt.tx - rt.x) < 20) rt.tx = clamp(rt.x + (rt.x < W / 2 ? 50 : -50), L.minX, L.maxX);
    } else if (r < 0.55) { rt.state = 'groom'; }
    else if (r < 0.68 || tired) { rt.state = 'rest'; rt.dur = rnd(3, 6); }
    else if (r < 0.8 && pet.s[1] > 40) { rt.state = 'play'; Particles.add({ type: 'note', x: rt.x, y: L.groundY - 40, vy: -20, life: 1, layer: 1 }); }
    else if (r < 0.9) { rt.state = 'idle'; rt.dur = rnd(2, 4); rt.say = Game.isDog() ? pick(['Woof!', 'Arf!', 'Ruff!']) : pick(['Meow!', 'Mew!', 'Mrrp?']); rt.sayT = 1.4; Game.voice(pet); }
    else { rt.state = 'idle'; rt.dur = rnd(2, 4); }
  },
  finishPetting() {
    const pet = this.pet(), rt = Game.rt();
    this.loveMeter = 0; this.petMode = false;
    const box = this.petBox();
    Game.boost(1, 22, rt.x, box.y - 4);
    Game.addXP(8);
    Game.addCoins(2, rt.x, box.y);
    Game.track('pet'); Game.stat('pets');
    burst('heart', rt.x, box.y + 10, 10, { speed: 70, props: { layer: 1, big: true }, life: 1.2 });
    Snd.play('hearts');
    rt.state = 'react'; rt.t = 0; rt.jumpV = -120; rt.expr = 'love';
  },
  feed(food) {
    const pet = this.pet(), rt = Game.rt(), L = this.L;
    if (RT.sleeping) this.setSleep(false);
    if (pet.s[0] >= 95) {
      rt.state = 'refuse'; rt.t = 0; rt.say = "I'm full!"; rt.sayT = 1.6;
      Snd.play('error');
      return;
    }
    if (food.id !== 'kibble') SAVE.inv[food.id] = (SAVE.inv[food.id] || 0) - 1;
    this.food = food;
    Snd.play('pop');
    rt.state = 'walk'; rt.tx = L.bowlX + 26;
    rt.onArrive = () => { rt.state = 'eat'; rt.t = 0; rt.face = -1; Snd.play('eat'); };
  },
  finishEating(pet, rt) {
    const f = this.food;
    this.food = null;
    rt.state = 'idle'; rt.t = 0; rt.dur = 2;
    if (!f) return;
    const box = this.petBox();
    const hungry = pet.s[0] < 40;
    const fave = BREEDS[pet.b].fave === f.id;
    Game.boost(0, f.hun, rt.x, box.y - 6);
    if (f.hap || fave) Game.boost(1, f.hap + (fave ? 10 : 0));
    if (f.en) Game.boost(2, f.en);
    Game.addXP(4 + (hungry ? 4 : 0) + (fave ? 3 : 0));
    Game.track('feed'); Game.stat('fed');
    if (f.id !== 'kibble') Game.track('treat');
    rt.say = fave ? 'My favorite!' : pick(['Yum!', 'Nom nom!', 'Tasty!']); rt.sayT = 1.6;
    rt.state = 'react'; rt.jumpV = -90; rt.expr = fave ? 'love' : 'happy';
    if (fave) burst('heart', rt.x, box.y, 6, { speed: 50, props: { layer: 1 } });
    Game.voice(pet);
    Game.save();
  },
  doTrick(tr) {
    const rt = Game.rt();
    if (RT.sleeping) this.setSleep(false);
    rt.state = 'trick'; rt.trick = tr.id; rt.t = 0;
    Game.track('trick'); Game.boost(1, 3);
    Snd.play(tr.id === 'jump' || tr.id === 'roll' ? 'jump' : 'sparkle');
    if (tr.id === 'dance') Snd.play('fanfare');
  },
  messPos(i) {
    const [fx, fy] = SAVE.mess[i], L = this.L;
    return [Math.round(L.minX - 10 + fx * (L.maxX - L.minX + 20)), Math.round(L.floorY + 10 + fy * (L.barY - L.floorY - 16))];
  },
  /* ---- welcome: box opening ---- */
  updateWelcome(dt) {
    const w = this.welcome, rt = Game.rt();
    w.t += dt;
    rt.x = W / 2;
    if (!w.opened) {
      if (I.released && I.tap && UI.on) {
        w.opened = true; w.ot = 0;
        Snd.play('gift');
        burst('dust', W / 2, this.L.groundY - 10, 14, { speed: 50, props: { r: 6, layer: 1 } });
        burst('star', W / 2, this.L.groundY - 20, 10, { speed: 90, props: { layer: 1 } });
        rt.state = 'react'; rt.t = 0; rt.jumpV = -160; rt.expr = 'star';
        setTimeout(() => Game.voice(), 300);
      }
    } else {
      w.ot += dt;
      this.updatePet(dt, this.pet(), rt, this.L);
      if (w.ot > 2.2) {
        this.welcome = null;
        Toasts.add('Say hi to ' + this.pet().n + '!', 'heart', 'pink');
        Game.stat('adopted');
      }
    }
  },
  drawWelcomeBox() {
    const w = this.welcome, L = this.L;
    const x = W / 2, by = L.groundY + 4;
    const wig = !w.opened ? Math.sin(w.t * 18) * (Math.sin(w.t * 2) > 0.3 ? 2 : 0) : 0;
    if (w.opened && w.ot > 0.5) return;
    const bw = 44, bh = 34;
    g.save(); g.translate(x + wig, by);
    rrect(-bw / 2 - 1, -bh - 1, bw + 2, bh + 2, COL.ink, 1);
    rect(-bw / 2, -bh, bw, bh, '#e8b878');
    rect(-bw / 2, -bh, bw, 4, '#f8d098');
    rect(-2, -bh, 4, bh, '#c89048');
    rect(-bw / 2 + 6, -bh + 12, 6, 6, COL.ink);
    // flaps
    const open = w.opened ? Math.min(1, w.ot * 4) : 0;
    rect(-bw / 2 - 2 - open * 10, -bh - 6 + open * 4, bw / 2 + 2, 6, COL.ink);
    rect(-bw / 2 - 1 - open * 10, -bh - 5 + open * 4, bw / 2, 4, '#f8d098');
    rect(2 + open * 10, -bh - 6 + open * 4, bw / 2 + 2, 6, COL.ink);
    rect(3 + open * 10, -bh - 5 + open * 4, bw / 2, 4, '#f8d098');
    text('♥', 6, -bh + 14, { color: '#ff6fa8' });
    g.restore();
    if (!w.opened) {
      const ay = by - bh - 22 + Math.sin(T * 6) * 3;
      text('Tap the box!', x, ay - 10, { color: '#ffffff', align: 'center', outline: COL.ink });
      text('↓', x, ay, { color: '#ffffff', align: 'center', outline: COL.ink, scale: 2 });
    }
  },
  /* ---- drawing ---- */
  draw(dt) {
    const L = this.L, pet = this.pet(), rt = Game.rt();
    drawRoom(L, dt);
    const has = (id) => Game.hasFurn(id);
    // messes
    SAVE.mess.forEach((m, i) => {
      const [mx, my] = this.messPos(i);
      iconC('poop', mx, my - 4, 1);
      for (let k = 0; k < 2; k++) {
        const sx = mx - 3 + k * 5, sy = my - 14 - ((T * 8 + k * 4) % 6);
        rect(sx + Math.round(Math.sin(T * 5 + k) * 1), sy, 1, 2, '#8ac860');
      }
    });
    // bed + bowl + toys
    if (has('bed')) FURN.bedBack(L.bedX, L.bedY);
    if (has('toys')) FURN.toys(W - L.sideS - 26, L.groundY + 12);
    // pet
    let pdx = 0, pdy = 0, st;
    const sleepingInBed = rt.state === 'sleep' && has('bed');
    if (this.welcome && !this.welcome.opened) { /* hidden in box */ } else {
      st = this.petState(pet, rt);
      if (rt.state === 'trick') { const tp = trickPose(rt.trick, clamp(rt.t / 2, 0, 1), pet); Object.assign(st, tp.st); pdx = tp.dx; pdy = tp.dy; }
      const gy = sleepingInBed ? L.bedY - 4 : L.groundY;
      if (!st.rot) shadowEllipse(rt.x + pdx, gy, 16 + stageOf(pet) * 4, 3, 0.22);
      drawPet(pet, rt.x + pdx, gy - rt.jump + pdy, 2, st);
    }
    if (this.welcome) this.drawWelcomeBox();
    if (has('bed')) FURN.bedFront(L.bedX, L.bedY);
    FURN.bowl(L.bowlX, L.bowlY, this.food ? this.food.icon : null);
    drawRoomLights(L);
    // bubbles above the pet
    if (!this.welcome) {
      const box = this.petBox();
      if (rt.sayT > 0 && rt.say) drawBubble(rt.x + 6, box.y - 2, null, rt.say);
      else if (rt.bubble != null && rt.state !== 'sleep' && Math.floor(T * 2) % 4 !== 0) drawBubble(rt.x + 6, box.y - 2, NEEDS[rt.bubble].icon);
    }
    this.drawHUD(L, pet);
    this.drawActions(L, pet);
    if (this.petMode || this.loveMeter > 0) {
      const w = 90, x = W / 2 - w / 2, y = L.roomTop + 6;
      rrect(x - 2, y - 2, w + 24, 16, 'rgba(255,255,255,0.85)', 3);
      iconC('heart', x + 6, y + 6, 1);
      bar(x + 14, y + 2, w, 8, this.loveMeter / 420, '#ff6fa8');
      if (this.petMode && this.loveMeter < 30) text('Rub your pet gently!', W / 2 + 10, y + 18, { align: 'center', color: '#ffffff', outline: COL.ink });
    }
  },
  petState(pet, rt) {
    const st = { pose: 'sit', expr: rt.expr || 'open', tail: Math.round(Math.sin(T * (rt.state === 'petted' ? 9 : 2.5)) * 2), breath: Math.floor(T * 1.6) % 2 };
    const sad = pet.s.some((v) => v < 18) || pet.s.reduce((a, b) => a + b, 0) / 5 < 35;
    switch (rt.state) {
      case 'walk': st.pose = 'run'; st.legs = Math.floor(rt.legs) % 8; st.flip = rt.face < 0; st.breath = 0; break;
      case 'eat': st.headDy = 3; st.expr = 'eat'; break;
      case 'sleep': st.pose = 'lie'; st.expr = 'sleep'; st.tail = 0; break;
      case 'rest': st.pose = 'lie'; st.expr = rt.t % 4 > 3.6 ? 'open' : 'blink'; st.tail = Math.round(Math.sin(T) * 1); break;
      case 'groom': st.pawR = 0.55 + Math.sin(rt.t * 10) * 0.08; st.expr = 'happy'; st.headDy = 1; break;
      case 'petted': st.expr = 'purr'; break;
      case 'refuse': st.expr = 'grumpy'; st.flip = Math.floor(rt.t * 8) % 2 === 1; break;
      case 'play': st.expr = 'happy'; st.pawL = rt.jump > 4 ? 0.8 : 0; st.pawR = rt.jump > 4 ? 0.8 : 0; break;
      case 'idle': if (sad) st.expr = 'sad'; break;
    }
    if (rt.blink > 0 && (st.expr === 'open' || st.expr === 'sad')) st.expr = 'blink';
    if (rt.squash > 0) { st.sy = 0.85; st.sx = 1.12; }
    return st;
  },
  drawHUD(L, pet) {
    // pet name / level panel
    const pw = Math.min(150, Math.floor(W * 0.46));
    rrect(2, 2, pw, 18, COL.ink, 3);
    rrect(3, 3, pw - 2, 16, '#5a3a8a', 2);
    const lvTxt = 'Lv' + pet.lv;
    const lvW = textWidth(lvTxt) + 6;
    rrect(5, 5, lvW, 9, '#ffd84a', 1);
    text(lvTxt, 8, 6, { color: '#5a3010' });
    text(pet.n, 9 + lvW, 5, { color: '#ffffff' });
    const sn = stageName(pet);
    if (textWidth(pet.n) + textWidth(sn) + lvW + 20 < pw) text(sn, pw - 2, 5, { color: '#c3a8ff', align: 'right' });
    bar(5, 15, pw - 6, 3, pet.xp / petXpNeed(pet.lv), '#ffd84a', { bg: '#2a1a3a' });
    // right cluster: coins, star level, menu
    const gearX = W - 22;
    if (button('menu', gearX, 2, 20, 18, { icon: 'gear', color: 'dark' })) showPauseMenu();
    const starTxt = '★' + SAVE.ol;
    const sw = textWidth(starTxt) + 10;
    const sx = gearX - sw - 3;
    rrect(sx, 3, sw, 16, COL.ink, 3); rrect(sx + 1, 4, sw - 2, 14, '#7a52d0', 2);
    text(starTxt, sx + 5, 7, { color: '#ffd84a' });
    rect(sx + 2, 16, Math.round((sw - 4) * SAVE.ox / ownerXpNeed(SAVE.ol)), 1, '#ffd84a');
    const ct = String(SAVE.c);
    const cw = textWidth(ct) + 18;
    const cx = sx - cw - 3;
    rrect(cx, 3, cw, 16, COL.ink, 3); rrect(cx + 1, 4, cw - 2, 14, '#5a3a8a', 2);
    iconC('coin', cx + 7, 11, 1);
    text(ct, cx + 14, 7, { color: '#ffffff' });
    HUD_COIN = { x: cx + 7, y: 11 };
    // needs meters
    const n = 5, mw = Math.floor((W - 4) / n);
    for (let i = 0; i < n; i++) {
      const x = 2 + i * mw, y = L.statY;
      const v = pet.s[i] / 100;
      const low = v < 0.25;
      rrect(x, y, mw - 2, 12, COL.ink, 2);
      rrect(x + 1, y + 1, mw - 4, 10, low && Math.floor(T * 3) % 2 ? '#ff8a9a' : '#fff6e6', 1);
      const ic = i === 0 && Game.isDog(pet) ? 'bone' : NEEDS[i].icon;
      iconC(ic, x + 7, y + 6, 1);
      bar(x + 14, y + 3, mw - 18, 6, v, low ? '#ff4f5e' : NEEDS[i].color);
      if (UI.on && I.released && I.tap && I.x >= x && I.x < x + mw && I.y >= y && I.y < y + 12) {
        Toasts.list.length = 0;
        Toasts.add(NEEDS[i].name + ': ' + Math.round(pet.s[i]) + '%  ' + (pet.s[i] < 60 ? NEEDS[i].hint : 'Looking good!'), ic, 'paper');
      }
    }
  },
  drawActions(L, pet) {
    // bottom bar
    rect(0, L.barY, W, H - L.barY, '#3a2858');
    rect(0, L.barY, W, 2, COL.ink);
    rect(0, L.barY + 2, W, 1, '#5a4080');
    const acts = [
      ['Feed', 'bowl', 'orange', () => showFoodTray(this)],
      ['Pet', 'heartP', 'pink', () => { this.petMode = true; if (RT.sleeping) this.setSleep(false); Toasts.list.length = 0; Toasts.add('Rub your pet with your finger!', 'heartP', 'pink'); }],
      ['Play', 'yarn', 'purple', () => showGamePicker()],
      ['Train', 'cap', 'sun', () => tryCare('train', 10)],
      ['Brush', 'brush', 'mint', () => tryCare('brush', 0)],
      ['Groom', 'bath', 'sky', () => tryCare('bath', 0)],
    ];
    const cols = L.port ? 3 : 6;
    const gap = 3;
    const bw = Math.floor((W - 8 - gap * (cols - 1)) / cols);
    acts.forEach(([lab, ic, col], i) => {
      const r = Math.floor(i / cols), c = i % cols;
      const x = 4 + c * (bw + gap), y = L.barY + 5 + r * (L.actH + 3);
      const needIdx = { Feed: 0, Pet: 1, Play: 1, Groom: 3, Brush: 4 }[lab];
      const warn = needIdx != null && pet.s[needIdx] < 25;
      if (button('act' + i, x, y, bw, L.actH, { label: lab, icon: ic, color: col, stack: true, glow: warn, iconDy: -1 })) acts[i][3]();
    });
    // side column
    const claim = Game.claimableCount();
    const side = [
      ['bag', 'pink', () => go('store'), 0],
      ['scroll', 'sun', () => go('quests'), claim],
      ['paw', 'purple', () => go('pets'), 0],
      ['bow', 'mint', () => go('wardrobe'), 0],
      ['wand', 'sky', () => showTrickList(this), 0],
      [RT.sleeping ? 'sun' : 'moon', 'dark', () => this.setSleep(!RT.sleeping), 0],
    ];
    const s = L.sideS, avail = L.barY - L.roomTop - 6;
    const sh = Math.min(s, Math.floor(avail / side.length) - 3);
    side.forEach(([ic, col, fn, badge], i) => {
      if (button('side' + i, L.sideX, L.roomTop + 4 + i * (sh + 3), s, sh, { icon: ic, color: col, badge: badge || null })) fn();
    });
  },
};

function tryCare(kind, minEnergy) {
  const pet = Game.pet();
  if (RT.sleeping) Scenes.home.setSleep(false);
  if (minEnergy && pet.s[2] < minEnergy) {
    dialog({ title: 'Too sleepy!', text: pet.n + ' is too tired. Tap the moon button to let them take a nap first!', icon: 'moon', buttons: [{ label: 'OK', color: 'sky' }] });
    return;
  }
  go(kind);
}

/* ---------- overlays used by Home ---------- */
function bottomSheet(title, h, drawContent, opts) {
  opts = opts || {};
  const ov = {
    t: 0, closing: false,
    update(dt) { this.t += dt; },
    draw(dt) {
      g.fillStyle = 'rgba(18,10,30,0.45)'; g.fillRect(0, 0, W, H);
      const k = Ease.outBack(clamp(this.t / 0.25, 0, 1));
      const sh = Math.min(h, H - 30);
      const y = Math.round(H - sh * k);
      panel(4, y, W - 8, sh + 10, { title, color: opts.color || 'pink' });
      if (button('sheetX', W - 30, y + 4, 22, 18, { label: '✗', color: 'red', sfx: 'back' }) || (UI.on && I.released && I.tap && I.y < y - 8)) { popOverlay(ov); return; }
      drawContent(ov, 4, y, W - 8, sh, dt);
    },
  };
  return pushOverlay(ov);
}

function showFoodTray(home) {
  const foods = FOODS.filter((f) => f.id === 'kibble' || (SAVE.inv[f.id] || 0) > 0);
  bottomSheet('What should I eat?', 92, (ov, x, y, w, h) => {
    const n = foods.length + 1;
    const cw = 50, gap = 4;
    const sc = ov.sc || (ov.sc = new Scroller());
    const contentW = n * (cw + gap);
    // horizontal list (use scroller on x by swapping axes)
    const vx = x + 8, vw = w - 16;
    ov.sx = ov.sx || 0;
    if (UI.on && I.down && I.y > y + 16 && I.y < y + 80 && I.moved > 6) ov.sx = clamp(ov.sx - I.dx, 0, Math.max(0, contentW - vw));
    g.save(); g.beginPath(); g.rect(vx, y + 14, vw, 70); g.clip(); UI.clip = { x: vx, y: y + 14, w: vw, h: 70 };
    foods.forEach((f, i) => {
      const bx = vx + i * (cw + gap) - ov.sx, by = y + 20;
      const cnt = f.id === 'kibble' ? '∞' : 'x' + SAVE.inv[f.id];
      const fave = BREEDS[Game.pet().b].fave === f.id;
      if (button('food' + f.id, bx, by, cw, 54, { color: fave ? 'sun' : 'paper', scroll: true })) { popOverlay(ov); home.feed(f); }
      iconC(f.icon, bx + cw / 2, by + 16, 2);
      text(cnt, bx + cw / 2, by + 34, { align: 'center', color: COL.ink });
      if (fave) text('♥', bx + cw - 7, by + 3, { color: '#ff4f7e' });
    });
    const bx = vx + foods.length * (cw + gap) - ov.sx;
    if (button('foodshop', bx, y + 20, cw, 54, { color: 'mint', scroll: true })) { popOverlay(ov); go('store', { tab: 0 }); }
    iconC('bag', bx + cw / 2, y + 36, 1);
    text('Shop', bx + cw / 2, y + 50, { align: 'center', color: '#fff', shadow: BTN.mint.d });
    g.restore(); UI.clip = null;
  }, { color: 'orange' });
}

function showGamePicker() {
  const pet = Game.pet();
  if (pet.s[2] < 15) {
    dialog({ title: 'Too sleepy!', text: pet.n + ' is too tired to play. Tap the moon to take a nap!', icon: 'moon', buttons: [{ label: 'OK', color: 'sky' }] });
    return;
  }
  bottomSheet("Let's play!", Math.min(H - 40, PORTRAIT ? 200 : 110), (ov, x, y, w, h) => {
    const n = GAMES.length;
    const port = PORTRAIT;
    const cw = port ? w - 20 : Math.floor((w - 20 - (n - 1) * 6) / n), ch = port ? 52 : 82;
    GAMES.forEach((gm, i) => {
      const bx = port ? x + 10 : x + 10 + i * (cw + 6), by = port ? y + 16 + i * (ch + 6) : y + 16;
      const locked = SAVE.ol < gm.lv;
      const best = SAVE.best[gm.id] || 0;
      if (button('game' + i, bx, by, cw, ch, { color: locked ? 'gray' : ['purple', 'sky', 'mint'][i], disabled: locked })) { popOverlay(ov); go(gm.id); }
      const nm = gameName(gm.id, pet);
      if (port) {
        iconC(locked ? 'lock' : gm.icon, bx + 22, by + ch / 2 - 1, 2);
        text(nm, bx + 44, by + 8, { color: '#fff', shadow: COL.ink, scale: 1 });
        wrapText(locked ? 'Unlocks at Star Level ' + gm.lv : gm.desc, cw - 54).slice(0, 2).forEach((l, k) => text(l, bx + 44, by + 20 + k * 10, { color: '#fff' }));
        if (!locked) text('Best: ' + best, bx + cw - 6, by + 8, { color: '#ffd84a', align: 'right', shadow: COL.ink });
      } else {
        iconC(locked ? 'lock' : gm.icon, bx + cw / 2, by + 22, 2);
        text(nm, bx + cw / 2, by + 42, { color: '#fff', align: 'center', shadow: COL.ink });
        text(locked ? '★ Level ' + gm.lv : 'Best: ' + best, bx + cw / 2, by + 56, { color: locked ? '#fff' : '#ffd84a', align: 'center', shadow: COL.ink });
      }
    });
  }, { color: 'purple' });
}

function showTrickList(home) {
  const pet = Game.pet();
  const learned = Game.learnedTricks(pet);
  if (!learned.length) {
    dialog({ title: 'Tricks', text: pet.n + " doesn't know any tricks yet. Tap Train to teach one!", icon: 'wand', buttons: [{ label: 'Train now', color: 'sun', cb: () => tryCare('train', 10) }, { label: 'Later', color: 'paper' }] });
    return;
  }
  const rows = Math.ceil(learned.length / 2);
  bottomSheet('Show a trick!', 26 + rows * 28, (ov, x, y, w) => {
    const cw = Math.floor((w - 26) / 2);
    learned.forEach((tr, i) => {
      const bx = x + 10 + (i % 2) * (cw + 6), by = y + 18 + Math.floor(i / 2) * 28;
      if (button('trick' + tr.id, bx, by, cw, 24, { label: tr.name, icon: 'star', color: 'sky' })) { popOverlay(ov); home.doTrick(tr); }
    });
  }, { color: 'sky' });
}

/* ---------- celebration events ---------- */
function showEvent(ev) {
  if (ev.type === 'grow') { showGrow(ev); return; }
  const pet = ev.pet;
  if (ev.type === 'level') {
    const reward = 10 + pet.lv * 3;
    Snd.play('levelup');
    confetti(60);
    const ov = pushOverlay({
      t: 0, update(dt) { this.t += dt; },
      draw() {
        g.fillStyle = 'rgba(18,10,30,0.6)'; g.fillRect(0, 0, W, H);
        const k = Ease.outBack(clamp(this.t / 0.35, 0, 1));
        const w = Math.min(W - 30, 220), h = 150, x = W / 2 - w / 2, y = H / 2 - h / 2 + (1 - k) * 60;
        panel(x, y, w, h, { title: 'LEVEL UP!', color: 'sun' });
        // rays
        for (let i = 0; i < 12; i++) {
          const a = T + (i * TAU) / 12;
          line(W / 2, y + 58, W / 2 + Math.cos(a) * 40, y + 58 + Math.sin(a) * 40, i % 2 ? '#ffe8a0' : '#fff4d0', 2);
        }
        drawPet(pet, W / 2, y + 86, 2, { expr: 'star', tail: Math.round(Math.sin(T * 8) * 2), pawR: Math.abs(Math.sin(T * 4)) });
        text(pet.n + ' is now Level ' + pet.lv + '!', W / 2, y + 94, { align: 'center', color: COL.ink });
        coinLabel(W / 2, y + 108, '+' + reward, 'center');
        if (button('lvok', W / 2 - 40, y + h - 30, 80, 22, { label: 'Yay!', color: 'pink' })) { popOverlay(ov); Game.addCoins(reward, W / 2, y + 110); Game.save(); }
      },
    });
  } else if (ev.type === 'star') {
    const lv = ev.lv;
    const unlocks = [];
    for (const f of FOODS) if (f.lv === lv) unlocks.push(f.name);
    for (const a of ACCS) if (a.lv === lv) unlocks.push(a.name);
    for (const r of ROOM) if (r.lv === lv && r.price > 0) unlocks.push(r.name);
    for (const gm of GAMES) if (gm.lv === lv) unlocks.push('Game: ' + gm.name);
    if (lv === DOG_LEVEL) unlocks.unshift('PUPPIES!');
    const reward = 20 + lv * 5;
    Snd.play('fanfare');
    confetti(80);
    const lines = wrapText(unlocks.length ? 'New: ' + unlocks.join(', ') : 'Keep going, superstar!', Math.min(W - 60, 200));
    const ov = pushOverlay({
      t: 0, update(dt) { this.t += dt; },
      draw() {
        g.fillStyle = 'rgba(18,10,30,0.6)'; g.fillRect(0, 0, W, H);
        const k = Ease.outBack(clamp(this.t / 0.35, 0, 1));
        const w = Math.min(W - 30, 230), h = 96 + lines.length * 10, x = W / 2 - w / 2, y = H / 2 - h / 2 + (1 - k) * 60;
        panel(x, y, w, h, { title: 'STAR LEVEL ' + lv + '!', color: 'purple' });
        iconC('star', W / 2, y + 30, 3 + Math.round(Math.sin(T * 6) * 0.4));
        lines.forEach((l, i) => text(l, W / 2, y + 50 + i * 10, { align: 'center', color: COL.ink }));
        coinLabel(W / 2, y + 54 + lines.length * 10, '+' + reward, 'center');
        if (button('stok', W / 2 - 40, y + h - 30, 80, 22, { label: 'Awesome!', color: 'purple' })) { popOverlay(ov); Game.addCoins(reward, W / 2, y + 60); Game.save(); }
      },
    });
  }
}
function showGrow(ev) {
  const pet = ev.pet;
  Snd.play('evolve');
  Music.stop();
  const ov = pushOverlay({
    t: 0, done: false,
    update(dt) {
      this.t += dt;
      if (this.t > 3 && !this.done) {
        this.done = true; Snd.play('fanfare'); confetti(90);
        burst('sparkle', W / 2, H / 2 - 20, 30, { speed: 110, props: { size: 4, color: '#ffffff', layer: 1 } });
      }
    },
    draw() {
      const t = this.t;
      rect(0, 0, W, H, '#1a0e2e');
      for (let i = 0; i < 16; i++) {
        const a = T * 0.5 + (i * TAU) / 16;
        line(W / 2, H / 2 - 20, W / 2 + Math.cos(a) * W, H / 2 - 20 + Math.sin(a) * W, i % 2 ? '#2a1a4a' : '#24163e', 6);
      }
      const sc = H > 300 ? 3 : 2;
      if (t < 3) {
        const speed = 2 + t * 6;
        const showNew = Math.floor(t * speed) % 2 === 1;
        drawPet(pet, W / 2, H / 2 + 30, sc, { stage: showNew ? ev.to : ev.from, sil: '#ffffff', noAcc: true });
        text('What? ' + pet.n + ' is growing!', W / 2, 30, { align: 'center', color: '#ffffff', outline: COL.ink });
      } else {
        if (t < 3.3) { g.globalAlpha = 1 - (t - 3) / 0.3; rect(0, 0, W, H, '#ffffff'); g.globalAlpha = 1; }
        drawPet(pet, W / 2, H / 2 + 30, sc, { stage: ev.to, expr: 'star', tail: Math.round(Math.sin(T * 6) * 2) });
        const nm = STAGE_NAMES[BREEDS[pet.b].kind][ev.to];
        fancyText('WOW!', W / 2, 18, 3, ['#ffffff', '#ffe8a0', '#ffd84a'], COL.ink, { wave: 1 });
        text(pet.n + ' grew into a ' + nm + '!', W / 2, 46, { align: 'center', color: '#ffffff', outline: COL.ink });
        if (t > 3.8 && button('growok', W / 2 - 45, H - 40, 90, 24, { label: 'Hooray!', color: 'pink' })) {
          popOverlay(ov); Music.play('home'); Game.addCoins(50, W / 2, H / 2); Game.save();
        }
      }
    },
  });
}

function showDailyGift() {
  const y = new Date(Date.now() - 864e5);
  SAVE.streak = SAVE.gift === dayKey(y) ? SAVE.streak + 1 : 1;
  SAVE.gift = dayKey();
  const coins = 15 + 10 * Math.min(SAVE.streak, 7);
  const foodPool = FOODS.filter((f) => f.price > 0 && f.lv <= SAVE.ol + 1);
  const food = pick(foodPool);
  Game.checkAdventures();
  const ov = pushOverlay({
    t: 0, opened: false, ot: 0,
    update(dt) { this.t += dt; if (this.opened) this.ot += dt; },
    draw() {
      g.fillStyle = 'rgba(18,10,30,0.65)'; g.fillRect(0, 0, W, H);
      const w = Math.min(W - 30, 220), h = 150, x = W / 2 - w / 2, yy = H / 2 - h / 2;
      panel(x, yy, w, h, { title: 'Daily Gift!', color: 'pink' });
      text('Day ' + SAVE.streak + ' in a row!', W / 2, yy + 14, { align: 'center', color: COL.purpleD });
      if (!this.opened) {
        const wig = Math.sin(this.t * 14) * (Math.sin(this.t * 3) > 0 ? 2 : 0);
        iconC('gift', W / 2 + wig, yy + 64, 4);
        text('Tap to open!', W / 2, yy + 100, { align: 'center', color: COL.ink });
        if (button('giftbtn', W / 2 - 50, yy + h - 32, 100, 24, { label: 'Open!', color: 'pink', glow: true }) ||
          (UI.on && I.released && I.tap && Math.abs(I.x - W / 2) < 40 && Math.abs(I.y - yy - 64) < 30)) {
          this.opened = true; Snd.play('gift'); confetti(50);
          burst('star', W / 2, yy + 64, 14, { speed: 90, props: { layer: 1 } });
          Game.addCoins(coins, W / 2, yy + 64);
          SAVE.inv[food.id] = (SAVE.inv[food.id] || 0) + 1;
          Game.save();
        }
      } else {
        const k = Ease.outBack(clamp(this.ot / 0.4, 0, 1));
        iconC('coin', W / 2 - 30, yy + 50, Math.max(1, Math.round(3 * k)));
        text('+' + coins, W / 2 - 30, yy + 68, { align: 'center', color: COL.ink, scale: 2 });
        iconC(food.icon, W / 2 + 30, yy + 50, Math.max(1, Math.round(2 * k)));
        text('+1 ' + food.name, W / 2 + 30, yy + 72, { align: 'center', color: COL.ink });
        text('Come back tomorrow for more!', W / 2, yy + 92, { align: 'center', color: COL.grayD });
        if (button('giftok', W / 2 - 40, yy + h - 32, 80, 24, { label: 'Thanks!', color: 'mint' })) popOverlay(ov);
      }
    },
  });
}

function showTutorial() {
  const L = homeLayout();
  const pages = [
    { text: 'Meet ' + Game.pet().n + '! Keep these meters full to keep your pet happy.', r: { x: 0, y: L.statY - 1, w: W, h: 14 } },
    { text: 'Use these buttons to Feed, Pet, Play, Train, Brush and Groom your pet.', r: { x: 0, y: L.barY + 2, w: W, h: H - L.barY - 2 } },
    { text: 'Shop, Quests, My Pets, Outfits, Tricks and Bedtime are over here.', r: { x: L.sideX - 2, y: L.roomTop + 2, w: L.sideS + 4, h: 6 * (Math.min(L.sideS, Math.floor((L.barY - L.roomTop - 6) / 6) - 3) + 3) + 2 } },
    { text: 'Rub your pet to give it love. Tap any messes to clean them up. Have fun!', r: null },
  ];
  let i = 0;
  const ov = pushOverlay({
    draw() {
      const p = pages[i];
      g.fillStyle = 'rgba(18,10,30,0.55)';
      if (p.r) {
        const r = p.r;
        g.fillRect(0, 0, W, r.y); g.fillRect(0, r.y + r.h, W, H - r.y - r.h); g.fillRect(0, r.y, r.x, r.h); g.fillRect(r.x + r.w, r.y, W - r.x - r.w, r.h);
        if (Math.floor(T * 3) % 2) frameRect(r.x, r.y, r.w, r.h, '#ffd84a');
      } else g.fillRect(0, 0, W, H);
      const w = Math.min(W - 40, 240);
      const lines = wrapText(p.text, w - 50);
      const h = 34 + lines.length * 10;
      const midY = p.r ? (p.r.y > H / 2 ? p.r.y - h - 14 : p.r.y + p.r.h + 14) : H / 2 - h / 2;
      const x = W / 2 - w / 2 - (p.r && p.r.x > W / 2 ? 20 : 0);
      panel(x, midY, w, h, { title: 'Tip ' + (i + 1) + '/' + pages.length, color: 'sky' });
      drawPet(Game.pet(), x + 22, midY + h - 8, 1, { expr: 'happy' });
      lines.forEach((l, k) => text(l, x + 42, midY + 10 + k * 10, { color: COL.ink }));
      if (button('tutnext', x + w - 62, midY + h - 26, 56, 20, { label: i < pages.length - 1 ? 'Next →' : 'Play!', color: 'pink' })) {
        i++;
        if (i >= pages.length) { popOverlay(ov); Game.save(); }
      }
    },
  });
}

function showPauseMenu() {
  const ov = pushOverlay({
    t: 0, update(dt) { this.t += dt; },
    draw() {
      g.fillStyle = 'rgba(18,10,30,0.6)'; g.fillRect(0, 0, W, H);
      const w = Math.min(W - 30, 200), h = 176, x = W / 2 - w / 2, y = H / 2 - h / 2;
      panel(x, y, w, h, { title: 'Menu', color: 'purple' });
      const bw = w - 30;
      let by = y + 16;
      if (button('pm_sfx', x + 15, by, bw, 22, { label: 'Sounds: ' + (CFG.sfx ? 'ON' : 'OFF'), color: CFG.sfx ? 'mint' : 'gray' })) { CFG.sfx = !CFG.sfx; Snd.setSfx(CFG.sfx); saveCfg(); }
      by += 26;
      if (button('pm_mus', x + 15, by, bw, 22, { label: 'Music: ' + (CFG.mus ? 'ON' : 'OFF'), color: CFG.mus ? 'mint' : 'gray' })) { CFG.mus = !CFG.mus; Snd.setMusic(CFG.mus); saveCfg(); }
      by += 26;
      if (button('pm_help', x + 15, by, bw, 22, { label: 'How to Play', color: 'sky' })) { popOverlay(ov); go('help', { back: 'home' }); }
      by += 26;
      if (button('pm_backup', x + 15, by, bw, 22, { label: 'Backup Save', color: 'sun' })) { popOverlay(ov); showBackup(); }
      by += 26;
      if (button('pm_quit', x + 15, by, bw, 22, { label: 'Save & Exit', color: 'pink' })) { popOverlay(ov); Game.save(); RT.sleeping = false; go('menu'); }
      by += 26;
      if (button('pm_close', x + 15, by, bw, 22, { label: 'Back to Game', color: 'paper' })) popOverlay(ov);
    },
  });
}
