/* ================================================================
   Pets: breeds + procedural pixel-art renderer
   Pets are built from simple shapes (ellipses, capsules, triangles),
   rasterised at low resolution, auto-shaded, auto-outlined and then
   decorated with hand-made pixel stamps (eyes, nose, mouth, hats...).
   ================================================================ */
const PW = 80, PH = 80, POX = 40, POY = 66;

const BREEDS = [
  { id: 'ginger', name: 'Ginger Tabby', kind: 'cat', pattern: 'tabby', fave: 'fish', pname: 'Mango',
    desc: 'Sunny, silly and always hungry for fish!',
    fur: ['#f7a14a', '#d0742c', '#ffc888'], pat: ['#d4692a', '#b0521e', '#e88038'], lite: ['#fff0d8', '#ecd0b0', '#ffffff'],
    inner: '#ff9fb2', nose: '#ff7a9a', eye: '#6ad45a', outline: '#4a2410', line: '#9a4a1a', whisk: '#fff4e0' },
  { id: 'tux', name: 'Tuxedo', kind: 'cat', pattern: 'tux', fave: 'tuna', pname: 'Oreo',
    desc: 'Always dressed up for a fancy party.',
    fur: ['#3a344a', '#24202f', '#565070'], lite: ['#f8f8ff', '#d6d6e6', '#ffffff'],
    inner: '#ff9fb8', nose: '#ff8fb0', eye: '#c8e04a', outline: '#0c0a12', line: '#100c18', whisk: '#d8d8e8' },
  { id: 'calico', name: 'Calico', kind: 'cat', pattern: 'calico', fave: 'cookie', pname: 'Patches',
    desc: 'Three colors of cuddles in one kitty.',
    fur: ['#fffaf0', '#e6d8c6', '#ffffff'], pat: ['#f39a3e', '#cc7428', '#ffbe78'], pat2: ['#3c3440', '#28222c', '#5a5060'],
    inner: '#ffa8bc', nose: '#ff8faa', eye: '#f2b02e', outline: '#4a3428', line: '#9a8070', whisk: '#a89888' },
  { id: 'siamese', name: 'Siamese', kind: 'cat', pattern: 'siamese', fave: 'sushi', pname: 'Sapphire', earMat: 'dark',
    desc: 'Chatty and charming with sky-blue eyes.',
    fur: ['#f6ead4', '#dccaa6', '#fffaf0'], dark: ['#5c4234', '#3e2c22', '#7a5c4a'],
    inner: '#c88a90', nose: '#5a3a30', eye: '#4ab4ff', outline: '#3a2618', line: '#9a7a5a', whisk: '#fffaf0' },
  { id: 'black', name: 'Midnight', kind: 'cat', pattern: 'solid', fave: 'milk', pname: 'Shadow',
    desc: 'Mysterious, magical and super sweet.',
    fur: ['#332c4a', '#211c32', '#514670'], inner: '#c86a9a', nose: '#c86a9a', eye: '#ffd84a',
    outline: '#0a0812', line: '#0e0a18', whisk: '#9a90b8' },
  { id: 'persian', name: 'Snowball', kind: 'cat', pattern: 'solid', fave: 'cupcake', pname: 'Snowy', fluffy: 1, earSize: 0.62,
    desc: 'A fluffy cloud with one blue eye and one gold eye.',
    fur: ['#ffffff', '#dcdcee', '#ffffff'], inner: '#ffb0c8', nose: '#ff9ab8', eye: '#5ab4ff', eye2: '#f2b02e',
    outline: '#5a5878', line: '#b4b4d0', whisk: '#a8a8c8' },
  { id: 'bengal', name: 'Bengal', kind: 'cat', pattern: 'rosette', fave: 'chicken', pname: 'Ziggy',
    desc: 'A tiny leopard with super zoomies!',
    fur: ['#eab35a', '#c48a34', '#ffd690'], pat: ['#5a3518', '#3e240e', '#7a4a22'], pat2: ['#c88a38', '#a8702a', '#d89a48'],
    lite: ['#fff2d8', '#ecd2a8', '#ffffff'], inner: '#ffa8a0', nose: '#e0806a', eye: '#7ad04a', outline: '#4a2a10', line: '#8a5a24', whisk: '#fff2d8' },
  { id: 'coon', name: 'Maine Coon', kind: 'cat', pattern: 'tabby', fave: 'donut', pname: 'Bear', big: 1.08, ears: 'tuft', tail: 'fluffy', fluffy: 0.55,
    desc: 'A gentle giant with fluffy tufted ears.',
    fur: ['#b4bccc', '#8890a6', '#dce2ec'], pat: ['#5a6072', '#444858', '#727890'], lite: ['#f4f6fa', '#d4d8e2', '#ffffff'],
    inner: '#f0a8b8', nose: '#d88898', eye: '#f0a830', outline: '#2a2c38', line: '#5a6072', whisk: '#ffffff' },
  { id: 'golden', name: 'Golden Pup', kind: 'dog', pattern: 'golden', fave: 'bone', pname: 'Sunny', ears: 'flop', tail: 'feather', fluffy: 0.25, earMat: 'dark',
    desc: 'Happy, friendly and loves to fetch!',
    fur: ['#f2c060', '#cc9438', '#ffdc98'], lite: ['#ffecc0', '#f0cc88', '#fff8e8'], dark: ['#dca04a', '#b07a2c', '#f0b860'],
    inner: '#e8a080', nose: '#2a1a1a', eye: '#4a2a14', outline: '#4a2c0c', line: '#a06a20', whisk: '#fff' },
  { id: 'pug', name: 'Pug', kind: 'dog', pattern: 'pug', fave: 'cookie', pname: 'Peanut', ears: 'pug', tail: 'curl', earMat: 'dark', muzzleMat: 'dark', flat: 1,
    desc: 'Snorty, snuggly and super silly.',
    fur: ['#e8d2a2', '#c4a670', '#f8ead0'], dark: ['#3e3438', '#2a2226', '#5a4e54'], lite: ['#f8ead0', '#e8d2a2', '#ffffff'],
    inner: '#3e3438', nose: '#1a1416', eye: '#2a1c18', outline: '#3a2814', line: '#8a6a40', whisk: '#fff' },
  { id: 'corgi', name: 'Corgi', kind: 'dog', pattern: 'corgi', fave: 'meat', pname: 'Biscuit', ears: 'big', tail: 'stub', legs: 0.62,
    desc: 'Short legs, big ears, even bigger heart.',
    fur: ['#f2954a', '#c86c2c', '#ffbe80'], lite: ['#fffaf2', '#e8dccc', '#ffffff'],
    inner: '#ffa8a8', nose: '#2a1a1a', eye: '#3a2414', outline: '#4a2410', line: '#9a4a1a', whisk: '#fff' },
  { id: 'dalmatian', name: 'Dalmatian', kind: 'dog', pattern: 'dalmatian', fave: 'chicken', pname: 'Dotty', ears: 'flop', tail: 'long', earMat: 'dark',
    desc: 'Spotty, sporty and ready to run!',
    fur: ['#ffffff', '#dcdce8', '#ffffff'], pat: ['#2a2832', '#1a1820', '#3a3844'], dark: ['#2e2c36', '#1e1c24', '#46444e'], lite: ['#ffffff', '#e8e8f0', '#ffffff'],
    inner: '#2e2c36', nose: '#1a1820', eye: '#3a2414', outline: '#2a2838', line: '#a8a6b8', whisk: '#fff' },
];
const STAGE_NAMES = { cat: ['Kitten', 'Young Cat', 'Cat'], dog: ['Puppy', 'Young Dog', 'Dog'] };
function stageOf(p) { return p.lv >= 10 ? 2 : p.lv >= 5 ? 1 : 0; }
function stageName(p) { return STAGE_NAMES[BREEDS[p.b].kind][stageOf(p)]; }

/* ---------- shape constructors ---------- */
function shE(cx, cy, rx, ry, mat, z, part, o) {
  const s = Object.assign({ t: 0, cx, cy, rx, ry, rot: 0, mat, z, part, grp: part }, o || {});
  const m = s.fluff ? 1 + s.fluff * 0.2 : 1, rr = Math.max(rx, ry) * m + 0.5;
  s.x0 = cx - rr; s.x1 = cx + rr; s.y0 = cy - rr; s.y1 = cy + rr;
  if (s.fluff) { s.fn = s.fn || 9; s.fp = s.fp || 0.4; }
  return s;
}
function shC(pts, r, mat, z, part, o) {
  const s = Object.assign({ t: 1, pts, r, mat, z, part, grp: part }, o || {});
  const mr = Math.max(...r) + 0.5;
  s.x0 = Math.min(...pts.map((p) => p[0])) - mr; s.x1 = Math.max(...pts.map((p) => p[0])) + mr;
  s.y0 = Math.min(...pts.map((p) => p[1])) - mr; s.y1 = Math.max(...pts.map((p) => p[1])) + mr;
  s.cx = (s.x0 + s.x1) / 2; s.cy = (s.y0 + s.y1) / 2;
  return s;
}
function shT(ax, ay, bx, by, cx, cy, mat, z, part, o) {
  const s = Object.assign({ t: 2, ax, ay, bx, by, cx, cy, mat, z, part, grp: part }, o || {});
  s.x0 = Math.min(ax, bx, cx) - 0.5; s.x1 = Math.max(ax, bx, cx) + 0.5;
  s.y0 = Math.min(ay, by, cy) - 0.5; s.y1 = Math.max(ay, by, cy) + 0.5;
  s.mx = (ax + bx + cx) / 3; s.my = (ay + by + cy) / 3;
  s.sz = Math.max(s.x1 - s.x0, s.y1 - s.y0) / 2;
  // keep winding consistent
  const cr = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  if (cr < 0) { s.bx = cx; s.by = cy; s.cx = bx; s.cy = by; }
  s.cx0 = s.mx; s.cy0 = s.my;
  return s;
}
function shrinkTri(s, k, dy, mat, z) {
  const f = (x, c) => c + (x - c) * k;
  return shT(f(s.ax, s.mx), f(s.ay, s.my) + dy, f(s.bx, s.mx), f(s.by, s.my) + dy, f(s.cx, s.mx), f(s.cy, s.my) + dy, mat, z, 'ear', { grp: 'ear', inner: true, side: s.side });
}

const _hitOut = { nx: 0, ny: 0, al: 0 };
function shapeHit(s, x, y) {
  if (x < s.x0 || x > s.x1 || y < s.y0 || y > s.y1) return false;
  const o = _hitOut;
  if (s.t === 0) {
    let dx = x - s.cx, dy = y - s.cy;
    if (s.rot) {
      const c = Math.cos(-s.rot), sn = Math.sin(-s.rot);
      const t = dx * c - dy * sn; dy = dx * sn + dy * c; dx = t;
    }
    const u = dx / s.rx, v = dy / s.ry;
    const r2 = u * u + v * v;
    let lim = 1;
    if (s.fluff) {
      const a = Math.atan2(v, u);
      const k = 1 + s.fluff * 0.2 * (0.5 + 0.5 * Math.sin(a * s.fn + s.fp));
      lim = k * k;
    }
    if (r2 > lim) return false;
    o.nx = u; o.ny = v; o.al = 0;
    return true;
  }
  if (s.t === 1) {
    let best = 9, bnx = 0, bny = 0, bal = 0;
    const n = s.pts.length - 1;
    for (let i = 0; i < n; i++) {
      const ax = s.pts[i][0], ay = s.pts[i][1], bx = s.pts[i + 1][0], by = s.pts[i + 1][1];
      const vx = bx - ax, vy = by - ay;
      const L2 = vx * vx + vy * vy || 1e-6;
      let t = ((x - ax) * vx + (y - ay) * vy) / L2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const px = ax + vx * t, py = ay + vy * t;
      const r = s.r[i] + (s.r[i + 1] - s.r[i]) * t;
      const d = Math.hypot(x - px, y - py) / r;
      if (d < best) { best = d; bnx = (x - px) / r; bny = (y - py) / r; bal = (i + t) / n; }
    }
    if (best > 1) return false;
    o.nx = bnx; o.ny = bny; o.al = bal;
    return true;
  }
  const d1 = (x - s.bx) * (s.ay - s.by) - (s.ax - s.bx) * (y - s.by);
  const d2 = (x - s.cx) * (s.by - s.cy) - (s.bx - s.cx) * (y - s.cy);
  const d3 = (x - s.ax) * (s.cy - s.ay) - (s.cx - s.ax) * (y - s.ay);
  const neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0;
  if (neg && pos) return false;
  o.nx = (x - s.mx) / s.sz; o.ny = (y - s.my) / s.sz; o.al = 0;
  return true;
}

/* ---------- geometry for each pose ---------- */
function petGeo(def, stage) {
  const t = stage / 2, big = def.big || 1;
  return {
    t, big,
    hrx: lerp(8.3, 10.2, t) * big, hry: lerp(7.2, 8.4, t) * big,
    brx: lerp(5.3, 7.6, t) * big, bry: lerp(5.4, 9.2, t) * big,
    legs: def.legs || 1, dog: def.kind === 'dog',
  };
}

function buildPet(def, stage, st) {
  const G = petGeo(def, stage);
  const pose = st.pose || 'sit';
  const S = []; // shapes
  const F = { pose }; // feature anchors
  const fluffy = def.fluffy || 0;
  const earMat = def.earMat || 'fur';
  const tailSw = (st.tail || 0) * 0.9;
  const breath = st.breath ? 1 : 0;
  const dog = G.dog;

  function addHead(hx, hy, side) {
    const hrx = G.hrx * (side ? 0.9 : 1), hry = G.hry;
    F.hx = hx; F.hy = hy; F.hrx = hrx; F.hry = hry;
    S.push(shE(hx, hy, hrx, hry, 'fur', 7, 'head', { main: true, fluff: fluffy * 0.8, fn: 11 }));
    if (!dog) {
      // fluffy cheeks give the classic cat-head shape
      const cx = side ? hx + hrx * 0.25 : hx;
      for (const sgn of side ? [1] : [-1, 1]) {
        S.push(shE(cx + sgn * hrx * 0.7, hy + hry * 0.3, hrx * 0.42, hry * 0.44, 'fur', 7, 'head', { cheek: true, fluff: fluffy, fn: 7 }));
      }
    } else {
      // dog muzzle
      const mz = def.flat ? 0.75 : 1;
      if (side) {
        S.push(shE(hx + hrx * (0.62 + 0.18 * mz), hy + hry * 0.28, hrx * 0.46 * mz, hry * 0.38, def.muzzleMat || 'lite', 8, 'head', { muzzle: true }));
        F.mx = hx + hrx * (0.62 + 0.18 * mz); F.my = hy + hry * 0.28;
      } else {
        S.push(shE(hx, hy + hry * 0.4, hrx * (def.flat ? 0.56 : 0.48), hry * (def.flat ? 0.36 : 0.4), def.muzzleMat || 'lite', 8, 'head', { muzzle: true }));
        F.mx = hx; F.my = hy + hry * 0.4; F.mry = hry * (def.flat ? 0.36 : 0.4);
      }
    }
    // ears
    const es = def.earSize || 1;
    const ears = def.ears || 'cat';
    const sides = side ? [-1, 1] : [-1, 1];
    for (const sgn of sides) {
      if (ears === 'flop') {
        if (side) {
          if (sgn > 0) continue;
          S.push(shE(hx - hrx * 0.3, hy + hry * 0.05, hrx * 0.3, hry * 0.62, earMat, 9, 'ear', { rot: -0.35 }));
        } else {
          S.push(shE(hx + sgn * hrx * 0.9, hy + hry * 0.02, hrx * 0.3, hry * 0.64, earMat, 9, 'ear', { rot: sgn * 0.32, side: sgn }));
        }
        continue;
      }
      if (ears === 'pug') {
        const bx = side ? hx - hrx * 0.1 + sgn * hrx * 0.35 : hx + sgn * hrx * 0.42;
        S.push(shT(bx, hy - hry * 0.95, bx + sgn * hrx * 0.5, hy - hry * 0.62, bx + sgn * hrx * 0.62, hy - hry * 0.1, earMat, 6.5, 'ear', { side: sgn }));
        continue;
      }
      let ox, ix, tipx, tipy;
      if (side) {
        const base = hx - hrx * 0.2 + (sgn > 0 ? hrx * 0.5 : 0);
        ox = base - hrx * 0.42; ix = base + hrx * 0.28; tipx = base - hrx * 0.2;
        tipy = hy - hry * (ears === 'big' ? 2.0 : 1.6);
        const far = sgn > 0;
        const oy = hy - hry * 0.62, iy = hy - hry * 0.96;
        const tp = [lerp((ox + ix) / 2, tipx, es), lerp((oy + iy) / 2, tipy, es)];
        const tri = shT(ox, oy, ix, iy, tp[0], tp[1], earMat, far ? 5.5 : 6, 'ear', { far, side: sgn });
        S.push(tri);
        if (!far) S.push(shrinkTri(tri, 0.5, 0.7, 'inner', 6.2));
        continue;
      }
      const w = ears === 'big' ? 1.08 : 1;
      ox = hx + sgn * hrx * 0.97 * w; ix = hx + sgn * hrx * 0.2;
      const oy = hy - hry * 0.28, iy = hy - hry * 0.96;
      tipx = hx + sgn * hrx * 0.82 * w; tipy = hy - hry * (ears === 'big' ? 2.05 : 1.62);
      const tp = [lerp((ox + ix) / 2, tipx, es), lerp((oy + iy) / 2, tipy, es)];
      const tri = shT(ox, oy, ix, iy, tp[0], tp[1], earMat, 6, 'ear', { side: sgn });
      S.push(tri);
      S.push(shrinkTri(tri, 0.5, 0.8, 'inner', 6.2));
      if (ears === 'tuft') S.push(shC([[tp[0], tp[1] + 1], [tp[0] + sgn * 0.3, tp[1] - 2.2]], [0.6, 0.4], 'pat', 6.1, 'ear', { side: sgn }));
    }
  }

  function tailShape(pts, z) {
    const tt = def.tail || 'cat';
    let r = [1.7, 1.7, 1.55, 1.45];
    if (tt === 'fluffy') r = [2.1, 2.6, 2.7, 2.3];
    if (tt === 'feather') r = [1.8, 2.2, 2.0, 1.4];
    if (tt === 'long') r = [1.5, 1.3, 1.1, 0.9];
    r = r.map((v) => v * lerp(0.75, 1, G.t));
    S.push(shC(pts, r.slice(0, pts.length), 'fur', z, 'tail', { fluff: 0 }));
  }

  if (pose === 'side' || pose === 'run' || pose === 'leap') {
    const bl = lerp(7.0, 10.6, G.t) * G.big, bh = lerp(4.6, 6.3, G.t) * G.big;
    const legH = lerp(3.0, 5.2, G.t) * G.legs;
    const bcy = -(legH + bh * 0.7) - breath * 0.3;
    F.bx = 0; F.by = bcy; F.brx = bl; F.bry = bh;
    S.push(shE(0, bcy, bl, bh, 'fur', 2, 'body', { fluff: fluffy * 0.6, fn: 13 }));
    // legs
    const ph = ((st.legs || 0) / 8) * TAU;
    const lr = lerp(1.35, 1.8, G.t);
    const legs = [
      { x: bl * 0.55, p: ph, far: false }, { x: bl * 0.35, p: ph + Math.PI, far: true },
      { x: -bl * 0.55, p: ph + Math.PI, far: false }, { x: -bl * 0.35, p: ph, far: true },
    ];
    for (const L of legs) {
      let swing = 0, lift = 0, ext = 0;
      if (pose === 'run') { swing = Math.sin(L.p) * 2.4; lift = Math.max(0, Math.cos(L.p)) * 1.8; }
      if (pose === 'leap') { ext = L.x > 0 ? 3 : -3; lift = 1.5; }
      const fx = L.x + swing + ext, fy = -1.3 - lift;
      S.push(shC([[L.x, bcy + bh * 0.3], [fx, fy]], [lr, lr * 0.9], 'fur', L.far ? 1 : 3, 'leg', { far: L.far }));
      S.push(shE(fx + 0.5, fy + 0.1, lr * 1.15, lr * 0.75, 'fur', L.far ? 1.1 : 3.1, 'leg', { paw: true, far: L.far }));
    }
    // tail
    const tx = -bl * 0.9, ty = bcy - bh * 0.25;
    if (def.tail === 'curl') {
      S.push(shC([[tx, ty], [tx - 1.8, ty - 2.4], [tx + 0.2, ty - 3.8], [tx + 1.2, ty - 2]], [1.5, 1.6, 1.5, 1.2], 'fur', 2.5, 'tail'));
    } else if (def.tail === 'stub') {
      S.push(shE(tx - 0.5, ty - 0.5, 2.6, 2.3, 'fur', 2.5, 'tail', { fluff: 0.6 }));
    } else {
      const up = pose === 'run' ? 0.5 : 1;
      tailShape([[tx, ty], [tx - bl * 0.35, ty - bh * 0.6 * up], [tx - bl * 0.48 + tailSw * 0.4, ty - bh * 1.35 * up], [tx - bl * 0.38 + tailSw, ty - bh * 2.0 * up]], 1.5);
    }
    const hx = bl * 0.82, hy = bcy - bh * 0.85 - G.hry * 0.28 + (st.headDy || 0);
    addHead(hx, hy, true);
    F.eyes = [[hx + G.hrx * 0.15, hy - G.hry * 0.05, 'near'], [hx + G.hrx * 0.62, hy - G.hry * 0.05, 'far']];
    if (dog) { F.nose = [F.mx + G.hrx * 0.42, F.my - G.hry * 0.2]; F.mouth = [F.mx + G.hrx * 0.2, F.my + G.hry * 0.2]; }
    else { F.nose = [hx + G.hrx * 0.98, hy + G.hry * 0.22]; F.mouth = [hx + G.hrx * 0.82, hy + G.hry * 0.48]; }
    F.blush = [[hx + G.hrx * 0.4, hy + G.hry * 0.42]];
    F.top = [hx - G.hrx * 0.05, hy - G.hry * 0.95];
    F.neck = [hx - G.hrx * 0.45, hy + G.hry * 0.75]; F.neckW = G.hrx * 1.0;
    F.side = true;
  } else if (pose === 'lie') {
    const lrx = G.brx * 1.75, lry = G.bry * 0.56;
    const bcy = -lry - 0.2;
    F.bx = 0; F.by = bcy; F.brx = lrx; F.bry = lry;
    S.push(shE(0, bcy - breath * 0.3, lrx, lry + breath * 0.3, 'fur', 2, 'body', { fluff: fluffy * 0.7, fn: 15 }));
    S.push(shE(lrx * 0.55, bcy - lry * 0.15, lry * 0.95, lry * 0.85, 'fur', 2.2, 'haunch'));
    // tail curled in front
    if (def.tail === 'stub' || def.tail === 'curl') {
      S.push(shE(lrx * 0.92, bcy, 2.3, 2.1, 'fur', 2.5, 'tail', { fluff: 0.5 }));
    } else {
      tailShape([[lrx * 0.95, -1.8], [lrx * 0.55, -0.9], [lrx * 0.05, -0.9], [-lrx * 0.25 + tailSw * 0.3, -1.4]], 5);
    }
    const hx = -lrx * 0.45, hy = bcy - lry * 0.55 - G.hry * 0.45 + (st.headDy || 0);
    for (const sgn of [-1, 1]) {
      S.push(shE(hx + sgn * G.hrx * 0.4, -1.2, lerp(1.9, 2.4, G.t), lerp(1.3, 1.6, G.t), 'fur', 4, 'leg', { paw: true }));
    }
    addHead(hx, hy, false);
    setFrontFeatures(hx, hy);
  } else {
    // sitting / standing (front view)
    const stand = pose === 'stand';
    const bry = G.bry * (stand ? 1.18 : 1) + breath * 0.35;
    const bcy = -(bry + 0.6);
    F.bx = 0; F.by = bcy; F.brx = G.brx; F.bry = bry;
    S.push(shE(0, bcy, G.brx, bry, 'fur', 2, 'body', { fluff: fluffy * 0.8, fn: 13 }));
    // haunches
    for (const sgn of [-1, 1]) {
      S.push(shE(sgn * G.brx * 0.74, -G.bry * 0.42 - 0.3, G.brx * 0.55, G.bry * 0.45, 'fur', 3, 'haunch', { side: sgn, fluff: fluffy * 0.5 }));
    }
    // tail peeking out
    if (def.tail === 'curl') {
      S.push(shC([[G.brx * 0.6, bcy + 2], [G.brx * 1.25, bcy - 0.5], [G.brx * 1.15, bcy - 3], [G.brx * 0.75, bcy - 1.6]], [1.5, 1.6, 1.4, 1.2], 'fur', 0, 'tail'));
    } else if (def.tail === 'stub') {
      S.push(shE(G.brx * 0.95, -2.6, 2.3, 2.1, 'fur', 0, 'tail', { fluff: 0.6 }));
    } else {
      tailShape([[G.brx * 0.45, -1.8], [G.brx * 1.25, -2.0], [G.brx * 1.78 + tailSw * 0.35, -G.bry * 0.62], [G.brx * 1.62 + tailSw, -G.bry * 1.22]], 0);
    }
    // legs & paws (with optional raise)
    const lr = lerp(1.55, 2.0, G.t);
    const hy0 = bcy - bry * 0.78 - G.hry * 0.45 + (st.headDy || 0) - (stand ? 1 : 0);
    for (const sgn of [-1, 1]) {
      const raise = sgn < 0 ? st.pawL || 0 : st.pawR || 0;
      const sx0 = sgn * G.brx * 0.36, sy0 = bcy + bry * 0.05;
      let fx = sgn * G.brx * 0.38, fy = -1.6;
      if (stand) { fx = sgn * G.brx * 0.55; fy = bcy - bry * 0.25; }
      if (raise > 0) {
        fx = lerp(fx, sgn * (G.brx * 1.0 + G.hrx * 0.45), raise);
        fy = lerp(fy, hy0 + G.hry * 0.35, raise);
      }
      S.push(shC([[sx0, sy0], [fx, fy]], [lr, lr * 0.95], 'fur', raise > 0.5 ? 10 : 4, 'leg', { side: sgn, fl: true }));
      S.push(shE(fx, fy + (raise > 0 || stand ? 0 : 0.2), lerp(1.9, 2.4, G.t), lerp(1.3, 1.6, G.t) + (raise > 0 ? 0.4 : 0), 'fur', raise > 0.5 ? 10.1 : 5, 'leg', { paw: true, side: sgn, fl: true }));
      if (raise > 0.6) (F.beans = F.beans || []).push([fx, fy]);
      if (stand) {
        S.push(shE(sgn * G.brx * 0.42, -1.3, lerp(1.9, 2.4, G.t), lerp(1.3, 1.6, G.t), 'fur', 5, 'leg', { paw: true, side: sgn, hind: true }));
      }
    }
    addHead(0, hy0, false);
    setFrontFeatures(0, hy0);
  }

  function setFrontFeatures(hx, hy) {
    const ex = G.hrx * 0.43;
    const ey = dog ? hy - G.hry * 0.12 : hy + G.hry * 0.02;
    F.eyes = [[hx - ex, ey, 'L'], [hx + ex, ey, 'R']];
    if (dog) { F.nose = [hx, F.my - F.mry * 0.38]; F.mouth = [hx, F.my + F.mry * 0.3]; }
    else { F.nose = [hx, hy + G.hry * 0.36]; F.mouth = [hx, hy + G.hry * 0.36 + 2]; }
    F.blush = [[hx - G.hrx * 0.68, hy + G.hry * 0.4], [hx + G.hrx * 0.68, hy + G.hry * 0.4]];
    F.whisk = !dog ? [[hx - G.hrx * 1.08, hy + G.hry * 0.28, -1], [hx + G.hrx * 1.08, hy + G.hry * 0.28, 1]] : null;
    F.top = [hx, hy - G.hry * 0.97];
    F.neck = [hx, hy + G.hry * 0.9]; F.neckW = G.brx * 1.5;
  }
  F.G = G;
  S.sort((a, b) => a.z - b.z);
  return { S, F };
}

/* ---------- coat patterns ---------- */
function bib(bx, by, rx, cy, ry) { const a = bx / rx, b = (by - cy) / ry; return a * a + b * b < 1; }
function patternMat(def, s, nx, ny, al, mx, my, F) {
  const p = s.part;
  const hx = F.hrx ? (mx - F.hx) / F.hrx : 0, hy = F.hry ? (my - F.hy) / F.hry : 0;
  const bx = (mx - F.bx) / F.brx, by = (my - F.by) / F.bry;
  const side = F.side;
  switch (def.pattern) {
    case 'tabby': {
      if (p === 'head') {
        if (!s.muzzle && hy < -0.2 && Math.abs(hx) < 0.42 && !side) {
          const k = Math.floor(((hx + 0.42) / 0.84) * 5);
          if (k % 2 === 0 && hy < -0.38 + Math.abs(hx) * 0.25) return 'pat';
        }
        if (side && hy < -0.25 && hx < 0.4 && mod(Math.floor((hx + 1) * 4), 2) === 0) return 'pat';
        if (s.cheek && ny > -0.6 && ny < 0.2 && mod(Math.floor((ny + 0.6) * 4.5), 2) === 1 && Math.abs(nx) > 0.2) return 'pat';
        if (def.lite && !side && hy > 0.28 && Math.abs(hx) < 0.42) return 'lite';
        return null;
      }
      if (p === 'body' || p === 'haunch') {
        if (side) { if (by < 0.4 && mod(Math.floor((bx + 2) * 3.2 + by * 0.6), 2) === 0) return 'pat'; if (def.lite && by > 0.55) return 'lite'; return null; }
        if (p === 'body' && def.lite && bib(bx, by, 0.46, -0.42, 0.5)) return 'lite';
        const v = ny + Math.abs(nx) * 0.35;
        if (Math.abs(nx) > 0.3 && mod(Math.floor(v * 4.2), 2) === 0) return 'pat';
        return null;
      }
      if (p === 'tail') return mod(Math.floor(al * 6), 2) === 1 ? 'pat' : null;
      if (p === 'leg' && !s.paw && mod(Math.floor(my / 2.0), 2) === 0) return 'pat';
      return null;
    }
    case 'tux': {
      if (p === 'head') {
        if (s.cheek && ny > -0.1 && nx * (mx > F.hx ? -1 : 1) > -0.2 && !side) return 'lite';
        if (!side && hy > 0.1 && Math.abs(hx) < 0.16 + (hy - 0.1) * 1.3) return 'lite';
        if (side && hy > 0.25 && hx > 0.2) return 'lite';
        return null;
      }
      if (p === 'body') {
        if (side) return by > 0.3 && bx > -0.2 ? 'lite' : null;
        return bib(bx, by, 0.55, -0.25, 0.72) ? 'lite' : null;
      }
      if (s.paw) return 'lite';
      if (p === 'leg' && my > -3.5) return 'lite';
      if (p === 'tail' && al > 0.86) return 'lite';
      return null;
    }
    case 'calico': {
      if (p === 'head') {
        if (s.cheek) return null;
        if ((side ? hx < -0.1 : hx < -0.12) && hy < 0.15) return 'pat';
        if (hx > 0.3 && hy < -0.15) return 'pat2';
        return null;
      }
      if (p === 'ear') return (s.side || 0) < 0 ? 'pat' : 'pat2';
      if (p === 'body') {
        if ((bx + 0.35) * (bx + 0.35) + (by + 0.1) * (by + 0.1) < 0.24) return 'pat';
        if ((bx - 0.5) * (bx - 0.5) + (by - 0.35) * (by - 0.35) < 0.16) return 'pat2';
        return null;
      }
      if (p === 'haunch') return (s.side || 0) < 0 ? 'pat' : null;
      if (p === 'tail') return al > 0.45 ? 'pat2' : 'pat';
      return null;
    }
    case 'siamese': {
      if (p === 'head') {
        const mxx = side ? hx - 0.55 : hx;
        const d = mxx * mxx + (hy - 0.3) * (hy - 0.3) * 1.3;
        if (d < 0.2) return 'dark';
        if (d < 0.3 && (Math.floor(mx * 2) + Math.floor(my * 2)) % 2 === 0) return 'dark';
        return null;
      }
      if (p === 'tail') return al > 0.15 ? 'dark' : null;
      if (s.paw) return 'dark';
      if (p === 'leg' && my > -4.2) return 'dark';
      return null;
    }
    case 'rosette': case 'dalmatian': {
      const bengal = def.pattern === 'rosette';
      if (p === 'head') {
        if (s.muzzle) return null;
        if (bengal && def.lite && !side && hy > 0.3 && Math.abs(hx) < 0.4) return 'lite';
        if (hy > -0.05 && bengal) return null;
      }
      if (bengal && p === 'body' && !side && bib(bx, by, 0.42, -0.35, 0.5)) return 'lite';
      if (p === 'ear' && !bengal) return null;
      if (s.paw && bengal) return null;
      const cs = bengal ? 3.4 : 3.5;
      const seed = { head: 1, body: 2, haunch: 3, leg: 4, tail: 5, ear: 6 }[p] || 0;
      const ox = s.t === 2 ? s.cx0 : s.cx, oy = s.t === 2 ? s.cy0 : s.cy;
      const lx = mx - ox + 40, ly = my - oy + 40;
      const i = Math.floor(lx / cs), j = Math.floor(ly / cs);
      const h = hash2(i, j, seed);
      if (h < (bengal ? 0.62 : 0.72)) {
        const cx = (i + 0.25 + 0.5 * hash2(i, j, seed + 11)) * cs, cy = (j + 0.25 + 0.5 * hash2(i, j, seed + 23)) * cs;
        const r = cs * (bengal ? 0.3 : 0.26 + 0.1 * hash2(i, j, seed + 5));
        const d = Math.hypot(lx - cx, ly - cy);
        if (d < r) return bengal && d < r * 0.5 ? 'pat2' : 'pat';
      }
      return null;
    }
    case 'golden': {
      if (p === 'body' && !side && bib(bx, by, 0.45, -0.4, 0.52)) return 'lite';
      if (p === 'tail' && al > 0.3 && ny > 0.2) return 'lite';
      return null;
    }
    case 'pug': {
      if (p === 'head' && !s.muzzle && !side) {
        if (Math.abs(hx) < 0.3 && ((hy > -0.66 && hy < -0.58) || (hy > -0.48 && hy < -0.41))) return 'shade';
      }
      return null;
    }
    case 'corgi': {
      if (p === 'head') {
        if (s.muzzle) return null;
        if (!side && Math.abs(hx) < 0.12 && hy < 0.3 && hy > -0.9) return 'lite';
        if (!side && hy > 0.35) return 'lite';
        if (side && hy > 0.3 && hx > 0) return 'lite';
        return null;
      }
      if (p === 'body') {
        if (side) return by > 0.35 ? 'lite' : null;
        return bib(bx, by, 0.6, -0.25, 0.65) ? 'lite' : null;
      }
      if (p === 'leg') return 'lite';
      return null;
    }
  }
  return null;
}

/* ---------- face stamps ---------- */
const STAMPS = {
  eyeOpen: ['.KK.', 'KwiK', 'KiiK', 'KIIK', '.KK.'],
  eyeOpenS: ['KK.', 'wiK', 'iiK', 'IIK', '.K.'],
  eyeFar: ['.K', 'Ki', 'Ki', 'KI', '.K'],
  eyeHappy: ['.KK.', 'K..K'],
  eyeBlink: ['K..K', '.KK.'],
  eyeLine: ['KKKK'],
  eyeSadL: ['KK..', 'KwiK', 'KiiK', '.KK.'],
  eyeSadR: ['..KK', 'KiwK', 'KiiK', '.KK.'],
  eyeLove: ['hh.hh', 'hhhhh', 'hhhhh', '.hhh.', '..h..'],
  eyeStar: ['..y..', '.yyy.', 'yyyyy', '.yyy.', '.y.y.'],
  eyeWow: ['.K.', 'KwK', '.K.'],
  eyeX: ['K.K', '.K.', 'K.K'],
  eyeGrumpy: ['KKKK', 'KiiK', '.KK.'],
  mouthW: ['L.L.L', '.L.L.'],
  mouthWs: ['L.L', '.L.'],
  mouthOpen: ['.LL.', 'LooL', 'LotL', '.LL.'],
  mouthEat: ['LLLL', 'LooL', '.LL.'],
  mouthSmile: ['L...L', '.LLL.'],
  mouthPant: ['L...L', '.LtL.', '..t..'],
  mouthFrown: ['.LL.', 'L..L'],
  mouthO: ['.L.', 'LoL', '.L.'],
  mouthWavy: ['.L.L.', 'L.L.L'],
  noseCat: ['nnn', '.n.'],
  noseDog: ['.nnn.', 'nwnnn', '.nnn.'],
  noseDogS: ['nnn', 'nwn'],
  noseSide: ['nn', 'n.'],
  beans: ['p.p', '.p.'],
};
function stampColors(def, wet) {
  return {
    K: '#1c1024', w: '#ffffff', i: def.eye, I: darken(def.eye, 0.3), h: '#ff4f7e', y: '#ffd84a',
    L: def.kind === 'dog' ? '#2a1a1a' : def.line === def.outline ? def.line : darken(def.line, 0.25),
    n: def.nose, o: '#7a2a40', t: '#ff7a9a', p: '#ff9ab8',
  };
}
function drawStamp(x, ctx, art, px, py, cols, flip, override) {
  const h = art.length, w = art[0].length;
  const ox = Math.round(px - w / 2), oy = Math.round(py - h / 2);
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
    const ch = art[r][flip ? w - 1 - c : c];
    if (ch === '.' || ch === ' ') continue;
    ctx.fillStyle = (override && override[ch]) || cols[ch] || '#f0f';
    ctx.fillRect(ox + c, oy + r, 1, 1);
  }
}

/* ---------- accessories ---------- */
const ACCS = [
  { id: 'bow', slot: 'h', name: 'Pink Bow', price: 20, lv: 1, art: 'acc_bow', at: 'ear' },
  { id: 'party', slot: 'h', name: 'Party Hat', price: 30, lv: 1, art: 'acc_party', at: 'top', dy: 1 },
  { id: 'flower', slot: 'h', name: 'Flower Crown', price: 45, lv: 2, art: 'acc_flower', at: 'top', dy: 2 },
  { id: 'beanie', slot: 'h', name: 'Cozy Beanie', price: 35, lv: 2, art: 'acc_beanie', at: 'top', dy: 3 },
  { id: 'tophat', slot: 'h', name: 'Top Hat', price: 60, lv: 3, art: 'acc_tophat', at: 'top', dy: 1 },
  { id: 'bunny', slot: 'h', name: 'Bunny Ears', price: 70, lv: 4, art: 'acc_bunny', at: 'top', dy: 2 },
  { id: 'witch', slot: 'h', name: 'Witch Hat', price: 80, lv: 5, art: 'acc_witch', at: 'top', dy: 2 },
  { id: 'crown', slot: 'h', name: 'Royal Crown', price: 150, lv: 6, art: 'acc_crown', at: 'top', dy: 1 },
  { id: 'halo', slot: 'h', name: 'Angel Halo', price: 120, lv: 7, art: 'acc_halo', at: 'top', dy: -3, noOutline: true },
  { id: 'unicorn', slot: 'h', name: 'Unicorn Horn', price: 200, lv: 8, art: 'acc_unicorn', at: 'top', dy: 2 },
  { id: 'collar', slot: 'n', name: 'Bell Collar', price: 15, lv: 1, neck: 'collar' },
  { id: 'bowtie', slot: 'n', name: 'Bow Tie', price: 25, lv: 1, neck: 'bowtie' },
  { id: 'bandana', slot: 'n', name: 'Bandana', price: 30, lv: 2, neck: 'bandana' },
  { id: 'scarf', slot: 'n', name: 'Cozy Scarf', price: 45, lv: 3, neck: 'scarf' },
  { id: 'pearls', slot: 'n', name: 'Pearl Necklace', price: 90, lv: 5, neck: 'pearls' },
  { id: 'medal', slot: 'n', name: 'Gold Medal', price: 160, lv: 9, neck: 'medal' },
  { id: 'specs', slot: 'f', name: 'Round Specs', price: 40, lv: 2, lens: 'round' },
  { id: 'shades', slot: 'f', name: 'Cool Shades', price: 60, lv: 3, lens: 'shades' },
  { id: 'hearts', slot: 'f', name: 'Heart Glasses', price: 80, lv: 4, lens: 'heart' },
  { id: 'stars', slot: 'f', name: 'Star Glasses', price: 110, lv: 6, lens: 'star' },
];
const ACC_BY_ID = {};
for (const a of ACCS) ACC_BY_ID[a.id] = a;
Object.assign(ICON_ART, {
  acc_bow: ['pp...pp', 'pwpPppp', 'ppPPPpp', 'pppPppP', 'PP...PP'],
  acc_party: ['...y...', '..yYy..', '...b...', '..bpb..', '..pbp..', '.bpbpb.', '.pbpbp.', 'bpbpbpb', 'yyyyyyy'],
  acc_flower: ['.p...l...p.', 'pyp.lyl.pyp', '.pGGGlGGGp.'],
  acc_beanie: ['....www....', '...wwwww...', '..bbbbbbb..', '.bbwbbbbbb.', 'bBbBbBbBbBb', 'BbBbBbBbBbB'],
  acc_tophat: ['..ddddddd..', '..dSddddd..', '..dSddddd..', '..ddddddd..', '..rrrrrrr..', '..ddddddd..', 'ddddddddddd'],
  acc_bunny: ['.ww.....ww.', 'wppw...wppw', 'wppw...wppw', 'wppw...wppw', 'wppw...wppw', '.wpw...wpw.', '..ww...ww..', '.ppppppppp.'],
  acc_witch: ['......L......', '.....LLL.....', '.....LLL.....', '....LLLLL....', '....LLLLL....', '...LLLLLLL...', '...yyyyyyy...', '..LLLLLLLLL..', 'LLLLLLLLLLLLL'],
  acc_crown: ['y...y...y', 'yy.yYy.yy', 'yyyyyyyyy', 'yryyByyry', 'yyyyyyyyy', 'YYYYYYYYY'],
  acc_halo: ['..yyyyyyy..', '.y.......y.', '..yyyyyyy..'],
  acc_unicorn: ['..w..', '..p..', '.lpw.', '.pwl.', '.wlp.', 'lpwlp', 'pwlpw', 'wlpwl'],
  acc_bowtie: ['bb...bb', 'bwbBbbb', 'bbBBBbb', 'bbbBbbb', 'bb...bb'],
  acc_medal: ['.rbr.', '..b..', '.yyy.', 'yywyY', 'yyyyY', '.YYY.'],
  acc_collar: ['rrrrrrrrrrrr', 'RRRRRyyRRRRR', '.....yy.....'],
  acc_scarf: ['.bbbbbbbbbb.', 'bwbwbwbwbwbw', '.bbbbbbbbbb.'],
  acc_bandana: ['rrrrrrrrrrr', '.rwrrrrwrr.', '..rrrwrrr..', '...rrrrr...', '....rwr....', '.....r.....'],
  acc_pearls: ['w.w.w.w.w.w', '.w.w.w.w.w.'],
  lens_round: ['.KKKK.', 'Kc...K', 'K....K', 'K....K', 'K....K', '.KKKK.'],
  lens_shades: ['KKKKKK', 'KddddK', 'KdwddK', 'KddddK', '.KKKK.'],
  lens_heart: ['.pp.pp.', 'ppppppp', 'pwppppp', '.ppppp.', '..ppp..', '...p...'],
  lens_star: ['...y...', '..yyy..', 'yyywyyy', '.yyyyy.', '.yy.yy.'],
});

function drawNeck(x, F, acc, fwd, flip) {
  const [nx, ny] = fwd(F.neck[0], F.neck[1]);
  const w = Math.max(8, Math.round(F.neckW * (F.side ? 1 : 1)));
  const cx = Math.round(nx), cy = Math.round(ny);
  const put = (c, px, py, pw, ph) => { x.fillStyle = c; x.fillRect(px, py, pw || 1, ph || 1); };
  switch (acc.neck) {
    case 'collar': {
      put(COL.ink, cx - w / 2 - 1, cy - 1, w + 2, 4);
      put('#ff4f5e', cx - w / 2, cy, w, 2); put('#ffb0b8', cx - w / 2 + 1, cy, w - 2, 1);
      put(COL.ink, cx - 2, cy + 1, 4, 4); put('#ffd84a', cx - 1, cy + 2, 2, 2); put('#fff4a0', cx - 1, cy + 2, 1, 1);
      break;
    }
    case 'scarf': {
      put(COL.ink, cx - w / 2 - 1, cy - 1, w + 2, 5);
      for (let i = 0; i < w; i++) put(i % 4 < 2 ? '#4fb4ff' : '#ffffff', cx - w / 2 + i, cy, 1, 3);
      const tx = cx + (flip ? -1 : 1) * Math.round(w / 2 - 3);
      put(COL.ink, tx - 2, cy + 2, 5, 7);
      for (let i = 0; i < 5; i++) put(i % 2 ? '#ffffff' : '#4fb4ff', tx - 1, cy + 3 + i, 3, 1);
      break;
    }
    case 'pearls': {
      for (let i = 0; i <= w; i += 2) {
        const yy = cy + Math.round(Math.sin((i / w) * Math.PI) * 2);
        put(COL.ink, cx - w / 2 + i - 1, yy - 1, 3, 3);
      }
      for (let i = 0; i <= w; i += 2) {
        const yy = cy + Math.round(Math.sin((i / w) * Math.PI) * 2);
        put('#f4f0ff', cx - w / 2 + i, yy, 1, 1);
      }
      break;
    }
    case 'bandana': {
      const bw = Math.max(9, w - 2);
      put(COL.ink, cx - bw / 2 - 1, cy - 1, bw + 2, 3);
      for (let r = 0; r < Math.ceil(bw / 2); r++) {
        const ww = bw - r * 2;
        if (ww <= 0) break;
        put(COL.ink, cx - ww / 2 - 1, cy + r, ww + 2, 2);
      }
      for (let r = 0; r < Math.ceil(bw / 2) - 1; r++) {
        const ww = bw - r * 2 - 2;
        if (ww <= 0) break;
        put('#ff4f5e', cx - ww / 2, cy + r, ww, 1);
        if (r % 2 === 0) put('#ffffff', cx - ww / 2 + 1 + (r % 4), cy + r, 1, 1);
      }
      break;
    }
    case 'bowtie': {
      const art = getIcon('acc_bowtie');
      x.drawImage(art, cx - Math.floor(art.width / 2), cy - 2);
      break;
    }
    case 'medal': {
      put(COL.ink, cx - w / 2 - 1, cy - 1, w + 2, 3);
      put('#4fb4ff', cx - w / 2, cy, w, 1);
      const art = getIcon('acc_medal');
      x.drawImage(art, cx - Math.floor(art.width / 2), cy);
      break;
    }
  }
}

/* ---------- main render ---------- */
const _petCache = new Map();
function accKey(eq) { return eq ? (eq.h || '') + ',' + (eq.n || '') + ',' + (eq.f || '') : ''; }
function petSprite(pet, st) {
  st = st || {};
  const stage = st.stage != null ? st.stage : stageOf(pet);
  const key = [pet.b, stage, st.pose || 'sit', st.expr || 'open', st.tail | 0, st.breath ? 1 : 0, Math.round((st.pawL || 0) * 4), Math.round((st.pawR || 0) * 4),
    st.legs | 0, Math.round(((st.rot || 0) * 8) / Math.PI), Math.round((st.sx || 1) * 10), Math.round((st.sy || 1) * 10), st.flip ? 1 : 0,
    Math.round(st.headDy || 0), st.sil || '', st.noAcc ? '' : accKey(pet.eq), st.wet ? 1 : 0].join('|');
  let c = _petCache.get(key);
  if (c) return c;
  c = renderPet(BREEDS[pet.b], stage, st, st.noAcc ? null : pet.eq);
  if (_petCache.size > 360) _petCache.clear();
  _petCache.set(key, c);
  return c;
}

const LIGHT = (() => { const v = [-0.5, -0.72, 0.5]; const l = Math.hypot(...v); return v.map((a) => a / l); })();
function renderPet(def, stage, st, eq) {
  const { S, F } = buildPet(def, stage, st);
  const [cv, x] = makeCanvas(PW, PH);
  const img = x.createImageData(PW, PH);
  const px32 = new Uint32Array(img.data.buffer);
  const ids = new Int16Array(PW * PH).fill(-1);
  const sx = st.sx || 1, sy = st.sy || 1, fl = st.flip ? -1 : 1, rot = Math.round(((st.rot || 0) * 8) / Math.PI) * (Math.PI / 8);
  const pivY = st.pivY != null ? st.pivY : -14;
  const cr = Math.cos(rot), sr = Math.sin(rot);
  const fwd = (mx, my) => {
    const xx = mx * sx * fl, yy = my * sy - pivY;
    return [POX + xx * cr - yy * sr, POY + xx * sr + yy * cr + pivY];
  };
  const sil = st.sil ? u32(st.sil) : 0;
  const colorsFor = {};
  const getCols = (mat) => {
    if (colorsFor[mat]) return colorsFor[mat];
    let c;
    if (mat === 'inner') c = [def.inner, darken(def.inner, 0.2), lighten(def.inner, 0.3)];
    else c = def[mat] || def.fur;
    return (colorsFor[mat] = c.map(u32));
  };
  const furShade = u32(def.fur[1]);
  const n = S.length;
  for (let py = 0; py < PH; py++) {
    for (let pxx = 0; pxx < PW; pxx++) {
      const X = pxx + 0.5 - POX, Y = py + 0.5 - POY - pivY;
      const ux = X * cr + Y * sr, uy = -X * sr + Y * cr + pivY;
      const mx = ux / (sx * fl), my = uy / sy;
      let si = -1;
      for (let k = n - 1; k >= 0; k--) if (shapeHit(S[k], mx, my)) { si = k; break; }
      if (si < 0) continue;
      const idx = py * PW + pxx;
      ids[idx] = si;
      if (sil) { px32[idx] = sil; continue; }
      const s = S[si];
      const nx = _hitOut.nx, ny = _hitOut.ny, al = _hitOut.al;
      let mat = s.mat;
      if (mat === 'fur' || mat === 'lite' || (s.part === 'ear' && !s.inner)) {
        const pm = patternMat(def, s, nx, ny, al, mx, my, F);
        if (pm) mat = pm;
      }
      if (mat === 'shade') { px32[idx] = furShade; continue; }
      const cols = getCols(mat);
      // spherical shading
      let nnx = nx, nny = ny;
      if (s.t === 2) { nnx *= 0.6; nny = nny * 0.6 + 0.2; }
      if (s.rot) { const c = Math.cos(s.rot), sn = Math.sin(s.rot); const t = nnx * c - nny * sn; nny = nnx * sn + nny * c; nnx = t; }
      nnx *= fl;
      const r2 = Math.min(1, nnx * nnx + nny * nny);
      const nz = Math.sqrt(1 - r2);
      // rotate normal with sprite rotation so light stays top-left
      const rnx = nnx * cr - nny * sr, rny = nnx * sr + nny * cr;
      const d = rnx * LIGHT[0] + rny * LIGHT[1] + nz * LIGHT[2];
      let tone = 0;
      if (s.far) tone = 1;
      else if (d < 0.05) tone = 1;
      else if (d < 0.17) tone = (pxx + py) & 1 ? 1 : 0;
      else if (d > 0.93 && !s.noHi) tone = 2;
      px32[idx] = cols[tone];
    }
  }
  // inner separation lines + outline
  const lineC = sil || u32(def.line), outC = sil || u32(def.outline);
  const out = new Uint32Array(px32);
  for (let py = 0; py < PH; py++) {
    for (let pxx = 0; pxx < PW; pxx++) {
      const idx = py * PW + pxx, si = ids[idx];
      if (si < 0) {
        if ((pxx > 0 && ids[idx - 1] >= 0) || (pxx < PW - 1 && ids[idx + 1] >= 0) || (py > 0 && ids[idx - PW] >= 0) || (py < PH - 1 && ids[idx + PW] >= 0)) out[idx] = outC;
        continue;
      }
      if (sil) continue;
      const s = S[si];
      const check = (j) => {
        const o = ids[j];
        if (o < 0 || o === si) return false;
        const so = S[o];
        return so.grp !== s.grp && so.z < s.z && !(s.inner || so.inner) && !(s.muzzle && so.part === 'head');
      };
      if ((pxx > 0 && check(idx - 1)) || (pxx < PW - 1 && check(idx + 1)) || (py > 0 && check(idx - PW)) || (py < PH - 1 && check(idx + PW))) out[idx] = lineC;
      else if (s.muzzle) {
        // soft edge around the muzzle
        const isEdge = (j) => ids[j] >= 0 && !S[ids[j]].muzzle;
        if ((pxx > 0 && isEdge(idx - 1)) || (pxx < PW - 1 && isEdge(idx + 1)) || (py > 0 && isEdge(idx - PW)) || (py < PH - 1 && isEdge(idx + PW))) {
          const cols = getCols(s.mat);
          out[idx] = cols[1];
        }
      }
    }
  }
  img.data.set(new Uint8ClampedArray(out.buffer));
  x.putImageData(img, 0, 0);
  if (sil) return cv;

  // ---- face features ----
  const cols = stampColors(def);
  const expr = st.expr || 'open';
  const flip = fl < 0;
  // whiskers (behind other features)
  if (F.whisk && !F.side) {
    x.fillStyle = def.whisk;
    for (const [wx, wy, sg] of F.whisk) {
      const [a, b] = fwd(wx, wy);
      const dir = sg * fl;
      const ax = Math.round(a), ay = Math.round(b);
      for (let i = 0; i < 3; i++) { x.fillRect(ax + dir * i, ay - (i > 1 ? 1 : 0), 1, 1); x.fillRect(ax + dir * i, ay + 2 + (i > 1 ? 1 : 0), 1, 1); }
    }
  }
  const eyeArt = (which) => {
    switch (expr) {
      case 'blink': case 'sleep': return STAMPS.eyeBlink;
      case 'happy': case 'eat': case 'purr': return STAMPS.eyeHappy;
      case 'love': return STAMPS.eyeLove;
      case 'star': return STAMPS.eyeStar;
      case 'sad': return which === 'R' ? STAMPS.eyeSadR : STAMPS.eyeSadL;
      case 'wow': return STAMPS.eyeWow;
      case 'dizzy': return STAMPS.eyeX;
      case 'grumpy': return STAMPS.eyeGrumpy;
      case 'wink': return which === 'R' || which === 'far' ? STAMPS.eyeHappy : STAMPS.eyeOpen;
      default: return which === 'far' ? STAMPS.eyeFar : stage === 2 && !F.side ? STAMPS.eyeOpen : STAMPS.eyeOpen;
    }
  };
  for (const [ex, ey, which] of F.eyes) {
    const [a, b] = fwd(ex, ey);
    let art = eyeArt(which);
    if (which === 'far' && art !== STAMPS.eyeFar && art[0].length > 3) art = art.map((r) => r.slice(Math.floor(r.length / 2) - 1));
    const ov = def.eye2 && (which === 'R') ? { i: def.eye2, I: darken(def.eye2, 0.3) } : null;
    drawStamp(x, x, art, a + (which === 'far' ? 0 : 0), b, cols, flip && (which === 'L' || which === 'R') ? false : flip, ov);
  }
  // blush
  if (['happy', 'love', 'star', 'eat', 'purr', 'wink'].includes(expr) || st.blush) {
    x.fillStyle = '#ff94b8';
    for (const [bx, by] of F.blush) { const [a, b] = fwd(bx, by); x.fillRect(Math.round(a) - 1, Math.round(b), 3, 1); }
  }
  // nose
  if (F.nose) {
    const [a, b] = fwd(F.nose[0], F.nose[1]);
    const art = F.side ? STAMPS.noseSide : def.kind === 'dog' ? (stage === 0 || def.flat ? STAMPS.noseDogS : STAMPS.noseDog) : STAMPS.noseCat;
    drawStamp(x, x, art, a, b, cols, flip);
  }
  // mouth
  if (F.mouth) {
    let art;
    const dog = def.kind === 'dog';
    switch (expr) {
      case 'eat': art = Math.floor(T * 8) % 2 ? STAMPS.mouthEat : STAMPS.mouthWs; break;
      case 'meow': case 'star': art = STAMPS.mouthOpen; break;
      case 'sad': case 'grumpy': art = STAMPS.mouthFrown; break;
      case 'wow': art = STAMPS.mouthO; break;
      case 'dizzy': art = STAMPS.mouthWavy; break;
      case 'happy': case 'love': art = dog ? STAMPS.mouthPant : STAMPS.mouthW; break;
      default: art = dog ? STAMPS.mouthSmile : F.side ? STAMPS.mouthWs : STAMPS.mouthW;
    }
    if (F.side && (art === STAMPS.mouthW || art === STAMPS.mouthSmile)) art = STAMPS.mouthWs;
    const [a, b] = fwd(F.mouth[0], F.mouth[1]);
    drawStamp(x, x, art, a, b + 1, cols, flip);
  }
  if (F.beans) for (const [bx, by] of F.beans) { const [a, b] = fwd(bx, by); drawStamp(x, x, STAMPS.beans, a, b, cols, flip); }
  if (st.wet) {
    x.fillStyle = '#7ad0ff';
    for (let i = 0; i < 14; i++) {
      const xx = Math.floor(hash2(i, 3, 9) * PW), yy = Math.floor(hash2(i, 7, 9) * PH);
      if (ids[yy * PW + xx] >= 0) { x.fillRect(xx, yy, 1, 2); }
    }
  }
  // ---- accessories ----
  if (eq) {
    if (eq.n && ACC_BY_ID[eq.n]) drawNeck(x, F, ACC_BY_ID[eq.n], fwd, flip);
    if (eq.f && ACC_BY_ID[eq.f] && !F.side) {
      const a = ACC_BY_ID[eq.f];
      const lens = getIcon('lens_' + a.lens, { noOutline: a.lens === 'round' || a.lens === 'shades' });
      const ps = F.eyes.map(([ex, ey]) => fwd(ex, ey));
      x.fillStyle = '#1c1024';
      const y0 = Math.round(Math.min(ps[0][1], ps[1][1])) - 1;
      x.fillRect(Math.round(Math.min(ps[0][0], ps[1][0])), y0, Math.round(Math.abs(ps[1][0] - ps[0][0])), 1);
      for (const [a2, b2] of ps) x.drawImage(lens, Math.round(a2 - lens.width / 2), Math.round(b2 - lens.height / 2));
    }
    if (eq.h && ACC_BY_ID[eq.h]) {
      const a = ACC_BY_ID[eq.h];
      const art = getIcon(a.art, { noOutline: a.noOutline, outline: '#2a1a3a' });
      let [ax, ay] = fwd(F.top[0], F.top[1]);
      if (a.at === 'ear') { [ax, ay] = fwd(F.top[0] - F.hrx * 0.55 * (F.side ? -0.2 : 1), F.top[1] + F.hry * 0.25); }
      const w = art.width, h = art.height;
      let hx = Math.round(ax - w / 2), hy = Math.round(ay - h + (a.dy || 0));
      if (a.at === 'ear') hy = Math.round(ay - h / 2);
      if (flip) { x.save(); x.translate(hx + w / 2, 0); x.scale(-1, 1); x.drawImage(art, -w / 2, hy); x.restore(); }
      else x.drawImage(art, hx, hy);
    }
  }
  return cv;
}

// draw pet with its feet at (x, y), scaled
function drawPet(pet, x, y, scale, st) {
  const c = petSprite(pet, st);
  scale = scale || 1;
  g.drawImage(c, Math.round(x - POX * scale), Math.round(y - POY * scale), PW * scale, PH * scale);
}
// approximate visual height of a pet in sprite pixels (for placing bubbles etc.)
function petHeight(pet, pose) {
  const G = petGeo(BREEDS[pet.b], stageOf(pet));
  if (pose === 'lie') return G.bry * 1.2 + G.hry * 1.6;
  if (pose === 'side' || pose === 'run') return G.hry * 2.6 + 10;
  return G.bry * 2 + G.hry * 2.4 + 2;
}
