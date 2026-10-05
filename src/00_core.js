'use strict';
/* ================================================================
   KITTAY  -  an 8-bit virtual pet game
   (c) MTEC Labs
   Core: math helpers, display, input, scenes, saving
   ================================================================ */
const VERSION = '1.0';
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
const rndi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const mod = (a, n) => ((a % n) + n) % n;
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

function hash2(x, y, s) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s | 0) + 7, 2246822519)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function mulberry(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const Ease = {
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inQuad: (t) => t * t,
  inOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  outBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outElastic: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1),
  outBounce: (t) => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

/* ---------- colors ---------- */
const _rgbCache = {};
function hexToRgb(h) {
  if (_rgbCache[h]) return _rgbCache[h];
  let s = h.replace('#', '');
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  const n = parseInt(s, 16);
  return (_rgbCache[h] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]);
}
function rgbToHex(r, g, b) {
  return '#' + ((1 << 24) | (clamp(r | 0, 0, 255) << 16) | (clamp(g | 0, 0, 255) << 8) | clamp(b | 0, 0, 255)).toString(16).slice(1);
}
function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(Math.round(lerp(A[0], B[0], t)), Math.round(lerp(A[1], B[1], t)), Math.round(lerp(A[2], B[2], t)));
}
const darken = (c, t) => mix(c, '#140a1e', t);
const lighten = (c, t) => mix(c, '#ffffff', t);
function u32(hex) {
  const [r, g, b] = hexToRgb(hex);
  return ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
}

/* ---------- display ---------- */
const view = document.getElementById('view');
const vctx = view.getContext('2d');
const buf = document.createElement('canvas');
let g = buf.getContext('2d');
let W = 320, H = 240, PX = 1, PORTRAIT = false;
let layoutVersion = 0;

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0);
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  return [c, x];
}

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const cw = window.innerWidth, ch = window.innerHeight;
  const dw = Math.floor(cw * dpr), dh = Math.floor(ch * dpr);
  // choose an integer pixel scale so the short side is at least ~240 game pixels
  // (integer scale when possible for crisp pixels; fractional on small low-DPI screens)
  let s = Math.min(dw, dh) / 240;
  s = s >= 2 ? Math.floor(s) : Math.max(1, s);
  const forced = parseFloat(new URLSearchParams(location.search).get('px') || '0');
  if (forced > 0) s = forced * dpr;
  let w = Math.floor(dw / s), h = Math.floor(dh / s);
  // keep things sane on very wide / very tall screens
  if (w > h * 1.9) w = Math.floor(h * 1.9);
  if (h > w * 1.9) h = Math.floor(w * 1.9);
  w = clamp(w, 200, 640); h = clamp(h, 200, 640);
  W = w; H = h; PX = s; PORTRAIT = H > W;
  buf.width = W; buf.height = H;
  g = buf.getContext('2d');
  g.imageSmoothingEnabled = false;
  view.width = Math.round(W * s); view.height = Math.round(H * s);
  view.style.width = Math.round(W * s) / dpr + 'px';
  view.style.height = Math.round(H * s) / dpr + 'px';
  vctx.imageSmoothingEnabled = false;
  layoutVersion++;
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 120));
resize();

/* ---------- input ---------- */
const I = {
  x: -999, y: -999, down: false, pressed: false, released: false,
  sx: 0, sy: 0, st: 0, moved: 0, pid: null, tap: false, px: 0, py: 0, dx: 0, dy: 0,
  keys: {}, keyPressed: null,
};
function toLogical(e) {
  const r = view.getBoundingClientRect();
  I.x = ((e.clientX - r.left) / r.width) * W;
  I.y = ((e.clientY - r.top) / r.height) * H;
}
view.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  Snd.unlock();
  if (I.pid !== null && I.pid !== e.pointerId && I.down) return;
  I.pid = e.pointerId;
  toLogical(e);
  I.down = true; I.pressed = true; I.sx = I.x; I.sy = I.y; I.px = I.x; I.py = I.y; I.st = now(); I.moved = 0;
  try { view.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
});
view.addEventListener('pointermove', (e) => {
  if (I.down && e.pointerId !== I.pid) return;
  const ox = I.x, oy = I.y;
  toLogical(e);
  if (I.down) I.moved += Math.hypot(I.x - ox, I.y - oy);
});
function pointerEnd(e) {
  if (e.pointerId !== I.pid) return;
  toLogical(e);
  I.down = false; I.released = true; I.pid = null;
  I.tap = I.moved < 8 && now() - I.st < 0.7;
  Snd.unlock();
}
view.addEventListener('pointerup', pointerEnd);
view.addEventListener('pointercancel', (e) => { if (e.pointerId === I.pid) { I.down = false; I.released = true; I.tap = false; I.pid = null; I.moved = 999; } });
view.addEventListener('touchend', () => Snd.unlock(), { passive: true });
document.addEventListener('touchmove', (e) => { if (e.target === view) e.preventDefault(); }, { passive: false });
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => { if (e.target === view) e.preventDefault(); });
window.addEventListener('keydown', (e) => { I.keys[e.key] = true; I.keyPressed = e.key; });
window.addEventListener('keyup', (e) => { I.keys[e.key] = false; });

function endInputFrame() {
  I.pressed = false; I.released = false; I.tap = false; I.keyPressed = null;
  I.dx = I.x - I.px; I.dy = I.y - I.py; I.px = I.x; I.py = I.y;
}

/* ---------- time ---------- */
let T = 0; // seconds since start (game clock)
const now = () => T;

/* ---------- scenes ---------- */
const Scenes = {};
let scene = null, sceneName = '';
const overlays = []; // modal stack, top receives input
const Trans = { p: 0, dir: 0, next: null, arg: null, speed: 3.2 };

function go(name, arg, instant) {
  if (instant || !scene) { switchScene(name, arg); return; }
  if (Trans.dir !== 0) { Trans.next = name; Trans.arg = arg; return; }
  Trans.dir = 1; Trans.next = name; Trans.arg = arg;
}
function switchScene(name, arg) {
  if (scene && scene.leave) scene.leave();
  overlays.length = 0;
  Particles.clear();
  UI.active = null;
  sceneName = name;
  scene = Scenes[name];
  if (scene.enter) scene.enter(arg);
}
function updateTransition(dt) {
  if (Trans.dir === 0) return;
  Trans.p += Trans.dir * dt * Trans.speed;
  if (Trans.dir === 1 && Trans.p >= 1) {
    Trans.p = 1; Trans.dir = -1;
    switchScene(Trans.next, Trans.arg);
  } else if (Trans.dir === -1 && Trans.p <= 0) {
    Trans.p = 0; Trans.dir = 0;
  }
}
function drawTransition() {
  if (Trans.p <= 0) return;
  const cs = 12, cols = Math.ceil(W / cs) + 1, rows = Math.ceil(H / cs) + 1;
  g.fillStyle = '#120a1e';
  const p = Trans.p;
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      const d = (cx + cy) / (cols + rows);
      const k = clamp(p * 1.7 - d * 0.7, 0, 1);
      if (k <= 0) continue;
      const s = Math.ceil(k * cs * 0.5) * 2;
      g.fillRect(cx * cs + (cs - s) / 2, cy * cs + (cs - s) / 2, s, s);
    }
  }
}
function pushOverlay(o) { overlays.push(o); UI.active = null; UI.justOpened = true; if (o.enter) o.enter(); return o; }
function popOverlay(o) {
  const i = o ? overlays.indexOf(o) : overlays.length - 1;
  if (i >= 0) overlays.splice(i, 1);
  UI.active = null;
}
function topOverlay() { return overlays[overlays.length - 1] || null; }

/* ---------- saving (cookies + localStorage mirror) ---------- */
const SaveIO = {
  path: (location.pathname || '/').replace(/[^/]*$/, '') || '/',
  setCookie(name, val, days) {
    const exp = new Date(Date.now() + (days || 3650) * 864e5).toUTCString();
    let c = name + '=' + val + '; expires=' + exp + '; path=' + this.path + '; SameSite=Lax';
    if (location.protocol === 'https:') c += '; Secure';
    document.cookie = c;
  },
  getCookie(name) {
    const parts = document.cookie ? document.cookie.split('; ') : [];
    for (const p of parts) {
      const i = p.indexOf('=');
      if (p.slice(0, i) === name) return p.slice(i + 1);
    }
    return null;
  },
  delCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + this.path;
  },
  enc(obj) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  },
  dec(str) {
    try { return JSON.parse(decodeURIComponent(escape(atob(str)))); } catch (e) { return null; }
  },
  write(key, obj) {
    const s = this.enc(obj);
    // cookies are limited to ~4KB each, so split into chunks
    const CH = 3600, n = Math.ceil(s.length / CH);
    const oldN = parseInt(this.getCookie(key + 'n') || '0', 10);
    for (let i = 0; i < n; i++) this.setCookie(key + i, s.slice(i * CH, (i + 1) * CH));
    for (let i = n; i < oldN; i++) this.delCookie(key + i);
    this.setCookie(key + 'n', String(n));
    try { localStorage.setItem('kittay_' + key, s); } catch (e) { /* private mode */ }
  },
  read(key) {
    let fromCookie = null, fromLS = null;
    const n = parseInt(this.getCookie(key + 'n') || '0', 10);
    if (n > 0) {
      let s = '';
      for (let i = 0; i < n; i++) { const p = this.getCookie(key + i); if (p == null) { s = null; break; } s += p; }
      if (s) fromCookie = this.dec(s);
    }
    try { const s = localStorage.getItem('kittay_' + key); if (s) fromLS = this.dec(s); } catch (e) { /* ignore */ }
    if (fromCookie && fromLS) return (fromLS.t || 0) > (fromCookie.t || 0) ? fromLS : fromCookie;
    return fromCookie || fromLS;
  },
  remove(key) {
    const n = parseInt(this.getCookie(key + 'n') || '0', 10);
    for (let i = 0; i < Math.max(n, 4); i++) this.delCookie(key + i);
    this.delCookie(key + 'n');
    try { localStorage.removeItem('kittay_' + key); } catch (e) { /* ignore */ }
  },
};

/* ---------- date helpers ---------- */
function dayKey(d) {
  d = d || new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}
function daySeed(d) {
  d = d || new Date();
  return d.getFullYear() * 1000 + (d.getMonth() + 1) * 40 + d.getDate();
}
