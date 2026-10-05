/* ================================================================
   Pixel font (5x7, proportional) with per-colour glyph atlases
   ================================================================ */
const FONT_SRC = {
  ' ': '00000000000000', '!': '04040404040004', '"': '0a0a0000000000', '#': '0a0a1f0a1f0a0a',
  '$': '040f140e051e04', '%': '18190204081303', '&': '0c12140815120d', "'": '04040000000000',
  '(': '02040808080402', ')': '08040202020408', '*': '0004150e150400', '+': '0004041f040400',
  ',': '00000000000408', '-': '0000000e000000', '.': '00000000000004', '/': '01010204081010',
  '0': '0e111315191 10e', '1': '040c040404040e', '2': '0e110102040 81f', '3': '1f020402011 10e',
  '4': '02060a121f0202', '5': '1f101e0101110e', '6': '0608101e11110e', '7': '1f010204080808',
  '8': '0e11110e11110e', '9': '0e11110f01020c', ':': '00040000000400', ';': '00040000000408',
  '<': '02040810080402', '=': '00001f001f0000', '>': '08040201020408', '?': '0e110102040004',
  '@': '0e11010d15150e',
  A: '0e1111111f1111', B: '1e11111e11111e', C: '0e11101010110e', D: '1c121111111 21c',
  E: '1f10101e10101f', F: '1f10101e101010', G: '0e1110171111 0f', H: '1111111f111111',
  I: '0e04040404040e', J: '07020202021 20c', K: '11121418141211', L: '1010101010101f',
  M: '111b1515111111', N: '11111915131111', O: '0e11111111110e', P: '1e11111e101010',
  Q: '0e11111115120d', R: '1e11111e141211', S: '0f10100e01011e', T: '1f040404040404',
  U: '1111111111110e', V: '1111111111 0a04', W: '11111115151 50a', X: '11110a040a1111',
  Y: '1111110a040404', Z: '1f01020408101f',
  '[': '0e08080808080e', '\\': '10100804020101', ']': '0e02020202020e', '^': '040a1100000000',
  _: '0000000000001f', '`': '08040000000000',
  a: '00000e010f110f', b: '1010161911111e', c: '00000e1010110e', d: '01010d1311110f',
  e: '00000e111f100e', f: '0609081c080808', g: '00000f11110f010e', h: '10101619111111',
  i: '04000c0404040e', j: '0200060202021 20c', k: '10101214181412', l: '0c04040404040e',
  m: '00001a15151111', n: '00001619111111', o: '00000e1111110e', p: '00001e11111e1010',
  q: '00000f11110f0101', r: '00001619101010', s: '00000e100e011e', t: '08081c08080906',
  u: '0000111111130d', v: '0000111111 0a04', w: '00001111151 50a', x: '0000110a040a11',
  y: '000011111 10f010e', z: '00001f0204081f',
  '{': '02040408040402', '|': '04040404040404', '}': '08040402040408', '~': '00000815020000',
  '♥': '000a1f1f0e0400', '★': '0004041f0e0a11', '♪': '0203020 20e1e0c', '✓': '00010214080000',
  '✗': '00110a040a1100', '→': '0004021f020400', '←': '0004081f080400', '↑': '040e1504040400',
  '↓': '000404041 50e04', '⚡': '02040c1f060408', '…': '00000000000015', '•': '00000e0e0e0000',
  '¢': '040f141414 0f04', '▶': '10181c1e1c1810', '©': '0e11171917110e', '♦': '00040e1f0e0400', '☺': '0e111b111b150e', '∞': '000000150a1500',
  '♫': '0f0909091b1b00',
};
// tidy any accidental spaces in the hex strings above
for (const k in FONT_SRC) FONT_SRC[k] = FONT_SRC[k].replace(/\s+/g, '');

const Font = (() => {
  const chars = Object.keys(FONT_SRC);
  const glyphs = {}; // ch -> {x, w, rows}
  let ax = 0;
  for (const ch of chars) {
    const hex = FONT_SRC[ch];
    const rows = [];
    for (let i = 0; i < 8; i++) rows.push(parseInt(hex.substr(i * 2, 2), 16) || 0);
    let minC = 5, maxC = -1;
    for (const r of rows) for (let c = 0; c < 5; c++) if (r & (16 >> c)) { minC = Math.min(minC, c); maxC = Math.max(maxC, c); }
    let w = maxC >= minC ? maxC - minC + 1 : 3;
    if (ch === ' ') { w = 3; minC = 0; }
    glyphs[ch] = { x: ax, w, rows, minC };
    ax += w + 1;
  }
  const atlasW = ax;
  const atlases = {};
  function atlas(color) {
    if (atlases[color]) return atlases[color];
    const [c, x] = makeCanvas(atlasW, 8);
    x.fillStyle = color;
    for (const ch of chars) {
      const gl = glyphs[ch];
      for (let r = 0; r < 8; r++) for (let col = 0; col < 5; col++) {
        if (gl.rows[r] & (16 >> col)) x.fillRect(gl.x + col - gl.minC, r, 1, 1);
      }
    }
    return (atlases[color] = c);
  }
  return { glyphs, atlas };
})();

function glyphOf(ch) { return Font.glyphs[ch] || Font.glyphs['?']; }

function textWidth(str, scale) {
  scale = scale || 1;
  let w = 0, best = 0;
  for (const ch of String(str)) {
    if (ch === '\n') { best = Math.max(best, w); w = 0; continue; }
    w += (glyphOf(ch).w + 1) * scale;
  }
  return Math.max(best, w) - (w > 0 ? scale : 0);
}

// raw glyph drawing (single line)
function drawTextRaw(str, x, y, color, scale) {
  const at = Font.atlas(color);
  let cx = Math.round(x);
  y = Math.round(y);
  for (const ch of str) {
    const gl = glyphOf(ch);
    g.drawImage(at, gl.x, 0, gl.w, 8, cx, y, gl.w * scale, 8 * scale);
    cx += (gl.w + 1) * scale;
  }
}

/**
 * text(str, x, y, opts)
 * opts: color, align ('left'|'center'|'right'), scale, shadow (color), outline (color), lh (line height)
 */
function text(str, x, y, opts) {
  opts = opts || {};
  const color = opts.color || '#2a1a3a';
  const scale = opts.scale || 1;
  const lh = (opts.lh || 10) * scale;
  const lines = String(str).split('\n');
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    const w = textWidth(line, scale);
    let lx = x;
    if (opts.align === 'center') lx = x - w / 2;
    else if (opts.align === 'right') lx = x - w;
    lx = Math.round(lx);
    const ly = y + li * lh;
    if (opts.outline) {
      for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        drawTextRaw(line, lx + ox * scale, ly + oy * scale, opts.outline, scale);
      }
      if (opts.shadow) drawTextRaw(line, lx, ly + 2 * scale, opts.shadow, scale);
    } else if (opts.shadow) {
      drawTextRaw(line, lx + (opts.sx != null ? opts.sx : 0), ly + scale, opts.shadow, scale);
    }
    drawTextRaw(line, lx, ly, color, scale);
  }
}

// word wrap to a pixel width; returns array of lines
function wrapText(str, maxW, scale) {
  scale = scale || 1;
  const out = [];
  for (const para of String(str).split('\n')) {
    const words = para.split(' ');
    let line = '';
    for (const wd of words) {
      const t = line ? line + ' ' + wd : wd;
      if (textWidth(t, scale) > maxW && line) { out.push(line); line = wd; } else line = t;
    }
    out.push(line);
  }
  return out;
}

// big decorative text with vertical gradient + thick outline (used for logos/banners)
function fancyText(str, x, y, scale, colors, outline, opts) {
  opts = opts || {};
  const w = textWidth(str, scale);
  let cx = Math.round(opts.align === 'left' ? x : x - w / 2);
  const chars = [...str];
  const ow = opts.ow || 1;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const gl = glyphOf(ch);
    const oy = opts.wave ? Math.round(Math.sin(T * (opts.waveSpeed || 4) + i * 0.7) * opts.wave) : 0;
    const gx = cx, gy = Math.round(y + oy);
    // outline + shadow
    g.fillStyle = outline;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 5; c++) {
      if (!(gl.rows[r] & (16 >> c))) continue;
      const px = gx + (c - gl.minC) * scale, py = gy + r * scale;
      g.fillRect(px - ow, py - ow, scale + ow * 2, scale + ow * 2 + (opts.depth || 0));
    }
    for (let r = 0; r < 8; r++) {
      const col = colors[Math.min(colors.length - 1, Math.floor((r / 7) * colors.length))];
      g.fillStyle = col;
      for (let c = 0; c < 5; c++) {
        if (!(gl.rows[r] & (16 >> c))) continue;
        g.fillRect(gx + (c - gl.minC) * scale, gy + r * scale, scale, scale);
      }
    }
    if (opts.shine) {
      g.fillStyle = opts.shine;
      for (let r = 0; r < 8; r++) for (let c = 0; c < 5; c++) {
        if (!(gl.rows[r] & (16 >> c))) continue;
        const above = r > 0 && gl.rows[r - 1] & (16 >> c);
        if (!above) g.fillRect(gx + (c - gl.minC) * scale + 1, gy + r * scale + 1, Math.max(1, scale - 2), Math.max(1, Math.floor(scale / 3)));
      }
    }
    cx += (gl.w + 1) * scale + (opts.spacing || 0);
  }
  return w;
}
