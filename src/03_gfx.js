/* ================================================================
   Graphics: palette, primitives, pixel icons, UI widgets, particles
   ================================================================ */
const COL = {
  ink: '#2a1a3a', ink2: '#4a3560', paper: '#fff6e6', paper2: '#f3dfc4', paper3: '#dcbf9c',
  white: '#ffffff', night: '#120a1e', shadow: 'rgba(30,10,40,0.28)',
  pink: '#ff6fa8', pinkD: '#c8407a', pinkL: '#ffb3d1',
  purple: '#8a5cf5', purpleD: '#5a36b0', purpleL: '#c3a8ff',
  mint: '#4fd1a5', mintD: '#2a9474', mintL: '#a8f0d4',
  sky: '#4fb4ff', skyD: '#2a74c8', skyL: '#a8dcff',
  sun: '#ffc94a', sunD: '#d08c1e', sunL: '#ffe8a0',
  red: '#ff5a5a', redD: '#b82e3e', orange: '#ff9a4a', gray: '#9a90a8', grayD: '#6a6080', text: '#2a1a3a',
};
const BTN = {
  pink: { m: '#ff6fa8', d: '#c8407a', l: '#ffb3d1', t: '#ffffff' },
  purple: { m: '#9a6cff', d: '#6040c0', l: '#cbb4ff', t: '#ffffff' },
  mint: { m: '#4fd1a5', d: '#2a9474', l: '#a8f0d4', t: '#ffffff' },
  sky: { m: '#4fb4ff', d: '#2a74c8', l: '#b0e0ff', t: '#ffffff' },
  sun: { m: '#ffc94a', d: '#d08c1e', l: '#fff0b0', t: '#5a3010' },
  orange: { m: '#ff9a4a', d: '#c8642a', l: '#ffd0a0', t: '#ffffff' },
  red: { m: '#ff5a6a', d: '#b82e3e', l: '#ffb0b8', t: '#ffffff' },
  paper: { m: '#fff6e6', d: '#d8b890', l: '#ffffff', t: '#2a1a3a' },
  gray: { m: '#b0a8c0', d: '#7a7090', l: '#dcd6e6', t: '#ffffff' },
  dark: { m: '#4a3560', d: '#2a1a3a', l: '#6a5088', t: '#ffffff' },
};

/* ---------- primitives ---------- */
function rect(x, y, w, h, c) {
  if (c) g.fillStyle = c;
  g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
const RR = { 1: [1], 2: [2, 1], 3: [3, 1, 1], 4: [4, 2, 1, 1], 5: [5, 3, 2, 1, 1] };
function rrect(x, y, w, h, c, r) {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  r = Math.min(r == null ? 2 : r, Math.floor(Math.min(w, h) / 2), 5);
  g.fillStyle = c;
  if (r <= 0) { g.fillRect(x, y, w, h); return; }
  const ins = RR[r];
  g.fillRect(x, y + r, w, h - 2 * r);
  for (let i = 0; i < r; i++) {
    g.fillRect(x + ins[i], y + i, w - 2 * ins[i], 1);
    g.fillRect(x + ins[i], y + h - 1 - i, w - 2 * ins[i], 1);
  }
}
function frameRect(x, y, w, h, c) {
  rect(x, y, w, 1, c); rect(x, y + h - 1, w, 1, c); rect(x, y, 1, h, c); rect(x + w - 1, y, 1, h, c);
}
function disc(cx, cy, r, c) {
  g.fillStyle = c;
  cx = Math.round(cx); cy = Math.round(cy);
  const rr = r + 0.35;
  for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++) {
    const dx = Math.floor(Math.sqrt(Math.max(0, rr * rr - dy * dy)));
    if (rr * rr - dy * dy < 0) continue;
    g.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1);
  }
}
function ellipseFill(cx, cy, rx, ry, c) {
  g.fillStyle = c;
  cx = Math.round(cx); cy = Math.round(cy);
  for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) {
    const t = 1 - (dy * dy) / ((ry + 0.3) * (ry + 0.3));
    if (t < 0) continue;
    const dx = Math.floor(rx * Math.sqrt(t) + 0.3);
    g.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1);
  }
}
function ring(cx, cy, r, c) {
  g.fillStyle = c;
  cx = Math.round(cx); cy = Math.round(cy);
  let x = Math.round(r), y = 0, err = 1 - x;
  while (x >= y) {
    for (const [a, b] of [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]]) g.fillRect(cx + a, cy + b, 1, 1);
    y++;
    if (err < 0) err += 2 * y + 1; else { x--; err += 2 * (y - x) + 1; }
  }
}
function line(x0, y0, x1, y1, c, w) {
  g.fillStyle = c; w = w || 1;
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy, n = 0;
  while (n++ < 2000) {
    g.fillRect(x0 - (w >> 1), y0 - (w >> 1), w, w);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}
function shadowEllipse(cx, cy, rx, ry, a) {
  g.globalAlpha = a == null ? 0.28 : a;
  ellipseFill(cx, cy, rx, ry, '#2a1030');
  g.globalAlpha = 1;
}
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

// vertical dithered gradient into an offscreen canvas (cached by caller)
function gradientCanvas(w, h, stops) {
  const [c, x] = makeCanvas(w, h);
  const img = x.createImageData(w, h), d = new Uint32Array(img.data.buffer);
  const cols = stops.map(u32), n = stops.length - 1;
  for (let y = 0; y < h; y++) {
    const t = (y / Math.max(1, h - 1)) * n, i = Math.min(n - 1, Math.floor(t)), f = t - i;
    for (let xx = 0; xx < w; xx++) {
      d[y * w + xx] = f > BAYER4[(y & 3) * 4 + (xx & 3)] ? cols[i + 1] : cols[i];
    }
  }
  x.putImageData(img, 0, 0);
  return c;
}
// cached checker/dot patterns
const _patterns = {};
function patternFill(x, y, w, h, kind, c1, c2) {
  const key = kind + c1 + c2;
  let p = _patterns[key];
  if (!p) {
    const sz = kind === 'checker' ? 2 : 4;
    const [c, cx] = makeCanvas(sz, sz);
    cx.fillStyle = c1; cx.fillRect(0, 0, sz, sz);
    cx.fillStyle = c2;
    if (kind === 'checker') { cx.fillRect(0, 0, 1, 1); cx.fillRect(1, 1, 1, 1); }
    else if (kind === 'dots') cx.fillRect(1, 1, 1, 1);
    else if (kind === 'sparse') cx.fillRect(0, 0, 1, 1);
    p = _patterns[key] = g.createPattern(c, 'repeat');
  }
  g.fillStyle = p;
  g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/* ---------- pixel-art icons ---------- */
const PAL = {
  k: '#2a1a3a', K: '#120a18', w: '#ffffff', W: '#e4dcef', s: '#bdb4cc', S: '#857a9a', d: '#4a4060',
  r: '#ff4f5e', R: '#b52a42', o: '#ff9a3c', O: '#c8642a', y: '#ffd84a', Y: '#e0a020',
  g: '#6ad46a', G: '#2e9a4a', b: '#4fb4ff', B: '#2a6ad0', c: '#aee6ff', p: '#ff8cc0', P: '#d04a8a',
  l: '#c3a8ff', L: '#7a52d0', n: '#b0703c', N: '#6a3c20', t: '#e8c090', T: '#fff0d0', m: '#8ff0c8', M: '#3cc890',
  e: '#ffc8a0', E: '#e89870', h: '#ff6fa8', x: '#3a3048',
};
const ICON_ART = {
  coin: ['..yyyy..', '.yYYYYy.', 'yYwyyyYy', 'yYyyyyYy', 'yYyyyyYy', 'yYyyyyYy', '.yYYYYy.', '..yyyy..'],
  heart: ['.rr...rr.', 'rwrr.rrrr', 'rwrrrrrrR', 'rrrrrrrrR', '.rrrrrrR.', '..rrrrR..', '...rrR...', '....R....'],
  heartP: ['..ppp...ppp..', '.ppppp.ppppp.', 'ppwwppppppppp', 'pwwppppppppPP', 'pwppppppppppP', '.ppppppppppP.',
    '..ppppppppP..', '...ppppppP...', '....ppppP....', '.....ppP.....', '......P......'],
  star: ['....y....', '...yyy...', '...ywy...', 'yyyywyyyy', '.yyyyyyy.', '..yyyyY..', '..yyYyY..', '.yyY.YYY.', '.yY...YY.'],
  bolt: ['....yy', '...yy.', '..yy..', '.yyyyy', 'yyyyy.', '..yy..', '.yy...', '.y....'],
  drop: ['...b...', '...b...', '..bbb..', '.bbbbb.', 'bwbbbbB', 'bwbbbbB', 'bbbbbbB', '.bbbBB.', '..BBB..'],
  sparkle: ['....c....', '....c....', '...cwc...', 'ccwwwwwcc', '...cwc...', '....c....', '....c....'],
  fish: ['....bbbb....', '..bbbbbbbb.b', '.bwKbbbBbbbb', 'bbbbbbbBbbb.', 'bbbbbbbBbbb.', '.ccbbbbBbbbb', '..cccccccc.b', '....cccc....'],
  bowl: ['...nNnnNnn....', '..nnNnnnNnnn..', 'rrrrrrrrrrrrrr', 'rpprrrrrrrrrrR', '.rrrrrrrrrrrR.', '.rrrrrrrrrrrR.', '..rrrrrrrrrR..', '...RRRRRRRR...'],
  yarn: ['....pppp....', '..pPPpppPp..', '.pPwpPppPPp.', '.pwpPpppPpp.', 'pPpPpPpPppPp', 'ppPppPpPpPpp', 'pPpPpPppPpPp', 'pPppPpPpPpPp',
    '.pPpPpPPpPp.', '.ppPPpppPpp.', '..ppPPPPpp.P', '....pppp..PP'],
  cap: ['......dd......', '....dddddd....', '..dddddSdddd..', 'dddddddddddddd', '..dddddddddd.y', '...SddddddS..y', '...SddddddS..y', '....SSSSSS..yy'],
  brush: ['.pppppppp.......', 'pwpppppppPnnnnn.', 'pppppppppPnnnnnn', 'PPPPPPPPPPNNNNN.', 'WsWsWsWsWs......', 'WsWsWsWsWs......', 'W.W.W.W.W.......'],
  bath: ['..ccc.........', '.cwccc.cc.....', '.cccc.cwcc.cc.', '..cc..cccc.cwc', 'wwwwwwwwwwwwww', 'sWWWWWWWWWWWWs', '.WWWWWWWWWWWW.', '.sWWWWWWWWWWs.', '..ssssssssss..', '..S........S..'],
  moon: ['...yyyy....', '..yyyy.....', '.yyyy......', '.yyy.......', 'Yyyy.......', 'Yyyy.......', 'Yyyy.......', 'Yyyyy......', '.Yyyyy...y.', '.YYyyyyyyy.', '..YYYyyyy..', '....YYY....'],
  sun: ['......y......', '.y....y....y.', '..y.......y..', '....yyyyy....', '...yywyyyy...', '...ywyyyyY...', 'yy.yyyyyyY.yy', '...yyyyyyY...', '...yyyyyYY...', '....YYYYY....', '..y.......y..', '.y....y....y.', '......y......'],
  bag: ['....dddd....', '...d....d...', '...d....d...', 'pppppppppppP', 'pwpppppppppP', 'pwppprprpppP', 'pppprrrrrppP', 'ppppprrrpppP', 'pppppprppppP', 'pppppppppppP', 'PPPPPPPPPPPP'],
  scroll: ['.tttttttttt.', 'tTTTTTTTTTTt', '.tttttttttt.', '..TTTTTTTT..', '..TSSSSSTT..', '..TTTTTTTT..', '..TSSSSTTT..', '..TTTTTTTT..', '..TSSSSSTT..', '.tttttttttt.', 'tTTTTTTTTTTt', '.tttttttttt.'],
  paw: ['...pp...pp...', '..pppp.pppp..', '..pppp.pppp..', 'p..pp...pp..p', 'ppp.......ppp', 'ppp..ppp..ppp', '.p..ppppp..p.', '...ppppppp...', '..ppppppppp..', '..ppppppppP..', '...pppppPP...', '....pP.pP....'],
  bow: ['pp..........pp', 'pppp......pppp', 'pwppp.PP.ppppp', 'ppppppPPpppppp', 'pppppPPPPppppp', 'ppppppPPpppppp', 'ppppp.PP.ppppP', 'pppP......Pppp', 'pP..........Pp'],
  wand: ['.........y...', '........yyy..', '......yyywyyy', '.......yyyyy.', '.......yy.yy.', '......n......', '.....n.......', '....n........', '...n.........', '..n..........', '.n...........'],
  gear: ['.....sss.....', '..ss.sss.ss..', '.sssssssssss.', '..sssssssss..', '.ssss...ssss.', 'ssss.....sssS', 'ssss.....sssS', 'ssss.....sssS', '.ssss...sssS.', '..sssssssSS..', '.sssssssSSSS.', '..ss.sSS.SS..', '.....SSS.....'],
  lock: ['..SSSSS..', '.SS...SS.', '.S.....S.', '.S.....S.', 'yyyyyyyyy', 'ywyyyyyyY', 'yyyykyyyY', 'yyyykyyyY', 'yyyyyyyyY', 'YYYYYYYYY'],
  trophy: ['..yyyyyyyy..', 'yyywyyyyyYyy', 'y.ywyyyyyY.y', 'y.yyyyyyyY.y', '.yyyyyyyyYy.', '...yyyyyY...', '....yyyY....', '.....yY.....', '.....yY.....', '...yyyyYY...', '..YYYYYYYY..'],
  gift: ['..rrr..rrr..', '.r...rr...r.', '..rrrrrrrr..', 'lllllrrlllll', 'lwlllrrllllL', 'LLLLLrrLLLLL', '.lwllrrllll.', '.llllrrlllL.', '.llllrrlllL.', '.llllrrlllL.', '.LLLLrrLLLL.'],
  poop: ['....n.....', '...nnn....', '..nnnnn...', '...nnnnN..', '.nnnnnnnN.', 'nnwnnnnnnN', '.nnnnnnnN.', 'nnwnnnnnnN', '.NNNNNNNN.'],
  mouse: ['....sss........', '...spppS.......', '...spppS.ssss..', '..sssssssssssS.', '.sKssssssssssSS', 'psssssssssssSS.', '.ssssssssssSS..', '...SS....SS...s', '.............s.'],
  cucumber: ['..gggggggg..', '.GgwgggggggG', 'GgggGgggGggG', '.GGgggggggG.', '...GGGGGG...'],
  bone: ['.TT......TT.', 'TTTT....TTTT', '.TTTTTTTTTT.', '.TttttttttT.', 'Tttt....tttt', '.tt......tt.'],
  kibble: ['.nnnnnnnnn.', '.nTnnnnnnN.', 'nnnnnnnnnnn', 'ntttttttttN', 'ntwttttttTN', 'nttbbbbbttN', 'ntbwbbbbbtN', 'nttbbbbbttN', 'ntttttttttN', 'ntttttttttN', 'nTTTTTTTTTN', 'NNNNNNNNNNN'],
  milk: ['...bbb...', '...bbb...', '...www...', '..wwwww..', '.wwwwwwW.', '.wcwwwwW.', '.wbbbbbW.', '.wbwbbbW.', '.wbbbbbW.', '.wwwwwwW.', '.wwwwwwW.', '..WWWWW..'],
  chicken: ['....nnnnn...', '..nnnnnnnnN.', '.nownnnnnnnN', '.nonnnnnnnNN', '.nnnnnnnnNNN', '..nnnnnnnNN.', '...nnnnNNN..', '....TTTN....', '...TTTT.....', '.TTTT.......', 'TT.TT.......'],
  tuna: ['..ssssssss..', '.sWWWWWWWWs.', 'ssssssssssss', 'bbbbbbbbbbbB', 'bbwbbyybbbbB', 'bbbbyyyybbbB', 'bbbbbyybbbbB', 'ssssssssssss', '.SSSSSSSSSS.'],
  cookie: ['...tttt...', '.tttTtttn.', '.tNttttttn', 'ttttttNttn', 'tttNtttttn', 'ttttttttNn', 'tNttttttnn', '.tttNtttn.', '.nnttttnn.', '...nnnn...'],
  donut: ['...tttt...', '.tpppppPt.', 'tpwppyppPt', 'tppb..pbPt', 'tpyp..ppPt', 'tppppppyPt', '.tPpPPPPt.', '..tttttt..'],
  cupcake: ['.....r.....', '....rrr....', '...ppppp...', '..ppwppppP.', '.pppppppppP', 'ppppppppppP', 'PPpPPPpPPPP', '.lLlLlLlLl.', '.lLlLlLlLl.', '..lLlLlLl..', '..LLLLLLL..'],
  sushi: ['...oooooo...', '.oowoToooToo', 'oooToooToooO', 'wwwwwdddwwwW', 'wwwwwdddwwwW', 'WwwwwdddwwwW', '.WWWWdddWWW.'],
  meat: ['.....rrrrr.....', '...rrrrrrrrr...', '..rrwrrrrrrrR..', 'TTrrwrrrrrrrRTT', 'TTTrrrrrrrrRTTT', 'TTrrrrrrrrrRRTT', '..rrrrrrrrRRR..', '...RRRRRRRRR...', '.....RRRRR.....'],
  cake: ['..y...y...y..', '..r...b...g..', '..r...b...g..', '.TTTTTTTTTTT.', 'TTTpTTTpTTTpT', 'ppppppppppppP', 'pwppppppppppP', 'TTTTTTTTTTTTT', 'ppppppppppppP', 'ppppppppppppP', 'PPPPPPPPPPPPP', 'sssssssssssss'],
  trash: ['...SSSS...', 'SSSSSSSSSS', '.ssssssss.', '.sWsWsWss.', '.sWsWsWss.', '.sWsWsWss.', '.sWsWsWss.', '.sssssssS.', '..SSSSSS..'],
  note: ['...LLL', '...L.L', '...L..', '...L..', '.LLL..', 'LLLL..', '.LL...'],
  box: ['tttttttttttt', 'tTTTTTTTTTTn', 'tttttttttttn', 'tTtttttttttn', 'tttttttttttn', 'ttttTTTTtttn', 'tttttttttttn', 'nnnnnnnnnnnn'],
  pot: ['...gg.gg...', '..gGggGgg..', '.gggGggGgg.', '..gGgggGg..', '...ggGgg...', 'ooooooooooo', 'oOOOOOOOOOo', '.ooooooooO.', '.ooooooooO.', '..ooooooO..', '..OOOOOOO..'],
  house: ['.....rr.....', '...rrrrrr...', '.rrrrrrrrrr.', 'rrrrrrrrrrrr', '.TTTTTTTTTT.', '.TbbTTTnnTT.', '.TbbTTTnnTT.', '.TTTTTTnnTT.'],
  music: ['...LLLLL', '...LLLLL', '...L...L', '...L...L', '.LLL.LLL', 'LLLLLLLL', '.LL..LL.'],
  speaker: ['....s..', '...ss..', 'ssss s.', 'sSss.s.', 'ssss s.', '...ss..', '....s..'],
  card: ['.wwwwwwwww.', 'wbbbbbbbbbw', 'wbwbbbbbbbw', 'wbbbbbbbbbw', 'wbbbbbbbbbw', '.wwwwwwwww.'],
};

const _iconCache = {};
function getIcon(name, opts) {
  opts = opts || {};
  const key = name + '|' + (opts.sil || '') + '|' + (opts.swap ? JSON.stringify(opts.swap) : '') + '|' + (opts.noOutline ? 1 : 0) + '|' + (opts.outline || '');
  if (_iconCache[key]) return _iconCache[key];
  const art = ICON_ART[name] || ICON_ART.star;
  const h = art.length, w = Math.max(...art.map((r) => r.length));
  const o = opts.noOutline ? 0 : 1;
  const [c, x] = makeCanvas(w + o * 2, h + o * 2);
  const filled = [];
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
    let ch = art[yy][xx] || '.';
    if (ch === '.' || ch === ' ') continue;
    if (opts.swap && opts.swap[ch]) ch = opts.swap[ch];
    filled.push([xx + o, yy + o]);
    x.fillStyle = opts.sil || PAL[ch] || '#f0f';
    x.fillRect(xx + o, yy + o, 1, 1);
  }
  if (o) {
    const set = new Set(filled.map(([a, b]) => a + ',' + b));
    x.fillStyle = opts.outline || (opts.sil ? opts.sil : COL.ink);
    for (const [a, b] of filled) {
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = a + dx + ',' + (b + dy);
        if (!set.has(k)) { x.fillRect(a + dx, b + dy, 1, 1); }
      }
    }
  }
  return (_iconCache[key] = c);
}
// draw icon centred at (cx, cy)
function iconC(name, cx, cy, scale, opts) {
  scale = scale || 1;
  const c = getIcon(name, opts);
  g.drawImage(c, Math.round(cx - (c.width * scale) / 2), Math.round(cy - (c.height * scale) / 2), c.width * scale, c.height * scale);
}
function iconSize(name) { const c = getIcon(name); return [c.width, c.height]; }

/* ---------- immediate-mode UI ---------- */
const UI = { on: true, active: null, clip: null };
function hit(x, y, w, h) {
  if (UI.clip) {
    const c = UI.clip;
    if (I.x < c.x || I.x >= c.x + c.w || I.y < c.y || I.y >= c.y + c.h) return false;
  }
  return I.x >= x && I.x < x + w && I.y >= y && I.y < y + h;
}
// core click logic; returns {click, down, over}
const UI_RECTS = {};
function uiLogic(id, x, y, w, h, scrolly) {
  UI_RECTS[id] = [x + w / 2, y + h / 2, UI.on ? 1 : 0];
  if (!UI.on) return { click: false, down: false, over: false };
  const over = hit(x, y, w, h);
  if (I.pressed && over) UI.active = id;
  let click = false;
  if (I.released && UI.active === id && over && (!scrolly || I.moved < 9)) click = true;
  const down = UI.active === id && I.down && over && (!scrolly || I.moved < 9);
  return { click, down, over };
}

function button(id, x, y, w, h, o) {
  o = o || {};
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  const st = o.disabled ? { click: false, down: false } : uiLogic(id, x, y, w, h, o.scroll);
  const pal = BTN[o.disabled ? 'gray' : o.color || 'pink'];
  const dn = st.down ? 1 : 0;
  const r = o.r != null ? o.r : 3;
  if (!o.flat) rrect(x, y + 1, w, h, 'rgba(30,10,40,0.25)', r);
  rrect(x, y, w, h, o.outline || COL.ink, r);
  rrect(x + 1, y + 1, w - 2, h - 2, pal.d, r - 1);
  rrect(x + 1, y + 1 + dn * 2, w - 2, h - 4, o.bg || pal.m, r - 1);
  if (!st.down) rect(x + 3, y + 2, w - 6, 1, pal.l);
  if (o.glow && Math.sin(T * 7) > -0.2) { frameRect(x - 1, y - 1, w + 2, h + 3, '#fff27a'); frameRect(x - 2, y - 2, w + 4, h + 5, '#ff9a3c'); }
  const cy = y + (h - 3) / 2 + dn * 2;
  const tc = o.textColor || pal.t;
  if (o.icon && o.label && o.stack) {
    const isz = o.iconScale || 1;
    const ih = getIcon(o.icon).height * isz;
    iconC(o.icon, x + w / 2, cy - 4 + (o.iconDy || 0), isz, o.iconOpts);
    text(o.label, x + w / 2, cy + ih / 2 - 2, { color: tc, align: 'center', shadow: pal.d });
  } else if (o.icon && o.label) {
    const isz = o.iconScale || 1;
    const iw = getIcon(o.icon).width * isz;
    const tw = textWidth(o.label, o.scale || 1);
    const tot = iw + 4 + tw;
    iconC(o.icon, x + w / 2 - tot / 2 + iw / 2, cy, isz, o.iconOpts);
    text(o.label, x + w / 2 - tot / 2 + iw + 4, cy - 3 * (o.scale || 1), { color: tc, shadow: pal.d, scale: o.scale || 1 });
  } else if (o.icon) {
    iconC(o.icon, x + w / 2, cy, o.iconScale || 1, o.iconOpts);
  } else if (o.label != null) {
    const sc = o.scale || 1;
    text(o.label, x + w / 2, cy - 3 * sc, { color: tc, align: 'center', shadow: pal.d, scale: sc });
  }
  if (o.badge) {
    const bx = x + w - 3, by = y + 2;
    disc(bx, by, 4, COL.ink); disc(bx, by, 3, '#ff4f5e');
    text(String(o.badge === true ? '!' : o.badge), bx + 1, by - 3, { color: '#fff', align: 'center' });
  }
  if (st.click) Snd.play(o.sfx || 'click');
  return st.click;
}

function panel(x, y, w, h, o) {
  o = o || {};
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  rrect(x + 2, y + 3, w, h, 'rgba(30,10,40,0.3)', 4);
  rrect(x, y, w, h, COL.ink, 4);
  rrect(x + 1, y + 1, w - 2, h - 2, o.bg || COL.paper, 3);
  rrect(x + 2, y + h - 4, w - 4, 2, o.bg2 || COL.paper2, 1);
  if (o.title) ribbon(x + w / 2, y - 6, o.title, o.color || 'pink');
}
function ribbon(cx, y, label, color) {
  const pal = BTN[color] || BTN.pink;
  const tw = textWidth(label, 1);
  const w = tw + 20, x = Math.round(cx - w / 2);
  rrect(x - 6, y + 4, 10, 12, COL.ink, 1); rect(x - 5, y + 5, 8, 10, pal.d);
  rrect(x + w - 4, y + 4, 10, 12, COL.ink, 1); rect(x + w - 3, y + 5, 8, 10, pal.d);
  rrect(x, y, w, 15, COL.ink, 2);
  rrect(x + 1, y + 1, w - 2, 13, pal.m, 1);
  rect(x + 2, y + 2, w - 4, 1, pal.l);
  text(label, cx, y + 4, { color: pal.t, align: 'center', shadow: pal.d });
}
function bar(x, y, w, h, v, color, o) {
  o = o || {};
  v = clamp(v, 0, 1);
  x = Math.round(x); y = Math.round(y);
  rrect(x, y, w, h, COL.ink, 1);
  rect(x + 1, y + 1, w - 2, h - 2, o.bg || '#3a2850');
  const fw = Math.round((w - 2) * v);
  if (fw > 0) {
    rect(x + 1, y + 1, fw, h - 2, color);
    rect(x + 1, y + 1, fw, 1, lighten(color, 0.45));
    if (h > 4) rect(x + 1, y + h - 2, fw, 1, darken(color, 0.25));
  }
}
function tabs(id, x, y, w, h, labels, cur, o) {
  o = o || {};
  const n = labels.length, tw = w / n;
  let res = cur;
  for (let i = 0; i < n; i++) {
    const tx = Math.round(x + i * tw), tww = Math.round(x + (i + 1) * tw) - tx;
    const sel = i === cur;
    const st = uiLogic(id + i, tx, y, tww - 1, h);
    const pal = BTN[sel ? o.color || 'pink' : 'paper'];
    rrect(tx, y + (sel ? 0 : 2), tww - 1, h - (sel ? 0 : 2), COL.ink, 2);
    rrect(tx + 1, y + 1 + (sel ? 0 : 2), tww - 3, h - 2 - (sel ? 0 : 2), pal.m, 1);
    rect(tx + 2, y + 2 + (sel ? 0 : 2), tww - 5, 1, pal.l);
    const lab = labels[i];
    if (typeof lab === 'object') {
      if (lab.icon) iconC(lab.icon, tx + tww / 2 - (lab.label ? textWidth(lab.label) / 2 + 2 : 0), y + h / 2 + (sel ? 0 : 1), 1);
      if (lab.label) text(lab.label, tx + tww / 2 + (lab.icon ? 6 : 0), y + h / 2 - 3 + (sel ? 0 : 1), { color: sel ? pal.t : COL.ink, align: 'center' });
    } else text(lab, tx + tww / 2, y + h / 2 - 3 + (sel ? 0 : 1), { color: sel ? pal.t : COL.ink, align: 'center', shadow: sel ? pal.d : null });
    if (st.click && i !== cur) { res = i; Snd.play('tab'); }
  }
  return res;
}

// "hold to confirm" button (used for deleting saves)
const _holds = {};
function holdButton(id, x, y, w, h, label, color, dt) {
  const st = uiLogic(id, x, y, w, h);
  let p = _holds[id] || 0;
  if (st.down) p += dt / 1.4; else p = Math.max(0, p - dt * 3);
  _holds[id] = p;
  button(id + '_v', x, y, w, h, { label, color, disabled: false, flat: true });
  if (p > 0) {
    g.globalAlpha = 0.45;
    rect(x + 2, y + 2, (w - 4) * Math.min(1, p), h - 6, '#ffffff');
    g.globalAlpha = 1;
  }
  if (p >= 1) { _holds[id] = 0; return true; }
  return false;
}

/* ---------- simple vertical scroller (drag + inertia) ---------- */
class Scroller {
  constructor() { this.y = 0; this.v = 0; this.drag = false; this.max = 0; this.lastY = 0; }
  update(dt, x, y, w, h, contentH) {
    this.max = Math.max(0, contentH - h);
    if (UI.on && I.pressed && I.x >= x && I.x < x + w && I.y >= y && I.y < y + h) { this.drag = true; this.lastY = I.y; this.v = 0; }
    if (this.drag) {
      if (I.down) {
        const d = I.y - this.lastY;
        this.lastY = I.y;
        if (I.moved > 6) { this.y -= d; this.v = -d / Math.max(dt, 0.001); }
      } else this.drag = false;
    } else {
      this.y += this.v * dt;
      this.v *= Math.pow(0.02, dt);
      if (Math.abs(this.v) < 2) this.v = 0;
    }
    if (!this.drag) {
      if (this.y < 0) { this.y = lerp(this.y, 0, Math.min(1, dt * 12)); this.v = 0; }
      if (this.y > this.max) { this.y = lerp(this.y, this.max, Math.min(1, dt * 12)); this.v = 0; }
    }
  }
  begin(x, y, w, h) {
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    UI.clip = { x, y, w, h };
    return Math.round(-this.y);
  }
  end(x, y, w, h) {
    g.restore(); UI.clip = null;
    if (this.max > 0) {
      const th = Math.max(12, (h * h) / (h + this.max));
      const ty = y + (h - th) * clamp(this.y / this.max, 0, 1);
      rrect(x + w - 4, y + 1, 3, h - 2, 'rgba(42,26,58,0.18)', 1);
      rrect(x + w - 4, ty, 3, th, COL.ink2, 1);
    }
  }
}

/* ---------- particles ---------- */
const Particles = {
  list: [],
  clear() { this.list.length = 0; },
  add(p) {
    p.life = p.life || 1; p.t = 0;
    p.vx = p.vx || 0; p.vy = p.vy || 0; p.g = p.g || 0;
    this.list.push(p);
    if (this.list.length > 400) this.list.shift();
    return p;
  },
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.t += dt;
      if (p.type === 'coin' && p.tx != null) {
        const k = Ease.inQuad(clamp(p.t / p.life, 0, 1));
        p.x = lerp(p.x0, p.tx, k) + Math.sin(k * Math.PI) * p.arc;
        p.y = lerp(p.y0, p.ty, k) - Math.sin(k * Math.PI) * 30;
      } else {
        p.vy += p.g * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.drag) { p.vx *= Math.pow(p.drag, dt); p.vy *= Math.pow(p.drag, dt); }
      }
      if (p.t >= p.life) { this.list.splice(i, 1); if (p.done) p.done(); }
    }
  },
  draw(layer) {
    for (const p of this.list) {
      if ((p.layer || 0) !== (layer || 0)) continue;
      const k = p.t / p.life;
      const x = Math.round(p.x), y = Math.round(p.y);
      switch (p.type) {
        case 'heart': {
          const s = p.size || 1;
          if (k > 0.75 && Math.floor(p.t * 20) % 2) break;
          iconC(p.big ? 'heartP' : 'heart', x, y, s);
          break;
        }
        case 'star': if (!(k > 0.75 && Math.floor(p.t * 20) % 2)) iconC('star', x, y, p.size || 1); break;
        case 'sparkle': {
          const s = Math.round(Math.sin(k * Math.PI) * (p.size || 3));
          const c = p.color || '#ffffff';
          if (s <= 0) break;
          rect(x - s, y, s * 2 + 1, 1, c); rect(x, y - s, 1, s * 2 + 1, c);
          if (s > 2) { rect(x - 1, y - 1, 3, 3, c); }
          break;
        }
        case 'bubble': {
          const r = p.r || 3;
          ring(x, y, r, p.color || '#ffffff');
          rect(x - Math.ceil(r / 2), y - Math.ceil(r / 2), 1, 1, '#ffffff');
          break;
        }
        case 'pixel': rect(x, y, p.size || 1, p.size || 1, p.color); break;
        case 'confetti': {
          const c = p.color;
          if (Math.floor(p.t * 10 + p.seed) % 2) rect(x, y, 2, 1, c); else rect(x, y, 1, 2, c);
          break;
        }
        case 'drop': rect(x, y, 1, 2, p.color || '#6ac8ff'); break;
        case 'note': text(p.ch || '♪', x, y, { color: p.color || COL.purple, outline: '#ffffff' }); break;
        case 'zzz': {
          const sc = k > 0.5 ? 2 : 1;
          text('z', x, y, { color: '#ffffff', scale: sc, outline: COL.ink });
          break;
        }
        case 'coin': iconC('coin', x, y, 1); break;
        case 'text': {
          if (k > 0.8 && Math.floor(p.t * 20) % 2) break;
          text(p.text, x, y, { color: p.color || '#fff', align: 'center', outline: p.outline || COL.ink, scale: p.scale || 1 });
          break;
        }
        case 'dust': {
          g.globalAlpha = 1 - k;
          disc(x, y, 1 + k * (p.r || 4), p.color || '#ffffff');
          g.globalAlpha = 1;
          break;
        }
        case 'icon': iconC(p.icon, x, y, p.size || 1); break;
        case 'ring': {
          ring(x, y, 2 + k * (p.r || 20), p.color || '#ffffff');
          break;
        }
      }
    }
  },
};
function burst(type, x, y, n, o) {
  o = o || {};
  for (let i = 0; i < n; i++) {
    const a = o.angle != null ? o.angle + rnd(-o.spread || -0.5, o.spread || 0.5) : rnd(TAU);
    const sp = rnd(o.speedMin || 20, o.speed || 60);
    Particles.add(Object.assign({
      type, x: x + rnd(-(o.jx || 0), o.jx || 0), y: y + rnd(-(o.jy || 0), o.jy || 0),
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rnd(o.lifeMin || 0.5, o.life || 1.1), g: o.g || 0,
      seed: rnd(10), drag: o.drag,
    }, o.props || {}, o.colors ? { color: pick(o.colors) } : {}));
  }
}
function floatText(str, x, y, color, o) {
  o = o || {};
  Particles.add({ type: 'text', text: str, x, y, vy: o.vy || -22, life: o.life || 1.3, color, scale: o.scale || 1, layer: o.layer || 1 });
}
const CONFETTI = ['#ff6fa8', '#ffd84a', '#4fd1a5', '#4fb4ff', '#c3a8ff', '#ff9a4a', '#ffffff'];
function confetti(n) {
  for (let i = 0; i < n; i++) {
    Particles.add({ type: 'confetti', x: rnd(W), y: rnd(-40, -4), vx: rnd(-20, 20), vy: rnd(20, 70), g: 30, life: rnd(2, 3.5), color: pick(CONFETTI), seed: rnd(10), layer: 1, drag: 0.6 });
  }
}

/* ---------- toasts ---------- */
const Toasts = {
  list: [],
  add(msg, icon, color) {
    this.list.push({ msg, icon, color: color || 'mint', t: 0 });
  },
  update(dt) {
    if (!this.list.length) return;
    const t = this.list[0];
    t.t += dt;
    if (t.t > 2.6) this.list.shift();
  },
  draw() {
    if (!this.list.length) return;
    const t = this.list[0];
    const k = t.t < 0.25 ? Ease.outBack(t.t / 0.25) : t.t > 2.3 ? 1 - Ease.inQuad((t.t - 2.3) / 0.3) : 1;
    const lines = wrapText(t.msg, Math.min(W - 60, 260));
    const tw = Math.max(...lines.map((l) => textWidth(l)));
    const w = tw + (t.icon ? 30 : 16), h = 10 * lines.length + 10;
    const x = Math.round(W / 2 - w / 2), y = Math.round(lerp(-h - 6, 6, k));
    const pal = BTN[t.color] || BTN.mint;
    rrect(x + 1, y + 2, w, h, 'rgba(30,10,40,0.3)', 3);
    rrect(x, y, w, h, COL.ink, 3);
    rrect(x + 1, y + 1, w - 2, h - 2, pal.m, 2);
    rect(x + 3, y + 2, w - 6, 1, pal.l);
    if (t.icon) iconC(t.icon, x + 12, y + h / 2, 1);
    lines.forEach((l, i) => text(l, x + (t.icon ? 22 : 8), y + 5 + i * 10, { color: pal.t, shadow: pal.d }));
  },
};

/* ---------- generic dialog overlay ---------- */
function dialog(o) {
  // o: {title, text, buttons:[{label,color,cb}], icon, color, draw(x,y,w,h), w}
  const ov = {
    t: 0,
    update(dt) { this.t += dt; },
    draw() {
      g.fillStyle = 'rgba(18,10,30,0.6)'; g.fillRect(0, 0, W, H);
      const k = Ease.outBack(clamp(this.t / 0.25, 0, 1));
      const w = Math.min(W - 24, o.w || 220);
      const lines = wrapText(o.text || '', w - 24);
      const extra = o.extraH || 0;
      const iconH = o.icon ? 26 : 0;
      const h = 30 + iconH + lines.length * 10 + extra + (o.buttons && o.buttons.length ? 28 : 0);
      const x = Math.round(W / 2 - w / 2), y = Math.round(H / 2 - h / 2 + (1 - k) * 40);
      panel(x, y, w, h, { title: o.title, color: o.color });
      let cy = y + 16;
      if (o.icon) { iconC(o.icon, W / 2, cy + 8, 2); cy += iconH; }
      lines.forEach((l, i) => text(l, W / 2, cy + i * 10, { align: 'center', color: COL.ink }));
      cy += lines.length * 10 + 4;
      if (o.draw) { o.draw(x, cy, w, extra); cy += extra; }
      if (o.buttons) {
        const n = o.buttons.length, bw = Math.min(90, (w - 20 - (n - 1) * 6) / n);
        const tot = n * bw + (n - 1) * 6;
        o.buttons.forEach((b, i) => {
          if (button('dlg' + i + b.label, W / 2 - tot / 2 + i * (bw + 6), y + h - 30, bw, 22, { label: b.label, color: b.color || 'pink' })) {
            popOverlay(ov);
            if (b.cb) b.cb();
          }
        });
      }
    },
  };
  return pushOverlay(ov);
}
