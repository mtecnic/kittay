// Random-tap stress test. Usage: node tools/monkey.mjs <query> <iterations> [w h] [seed]
import http from 'http';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [q = 'test=devhome', iters = '300', w = '1024', h = '768', seed = '1'] = process.argv.slice(2);
let s = +seed; const rand = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, p); if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : 'image/png' }); fs.createReadStream(f).pipe(res);
}).listen(0);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
const errors = new Set();
page.on('pageerror', (e) => errors.add('PAGEERROR ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.add(m.text().slice(0, 300)); });
await page.goto(`http://localhost:${srv.address().port}/index.html?${q}`);
await page.waitForTimeout(800);
const skip = new Set(['pm_backup', 'st_restore', 'rs0', 'rs1', 'rs2', 'pm_quit']);
const scenes = {};
for (let i = 0; i < +iters; i++) {
  await page.evaluate(() => { const io = document.getElementById('io'); if (!io.hidden) { io.hidden = true; io.innerHTML = ''; } });
  const info = await page.evaluate(() => {
    const f = window.KT.FRAME, out = [];
    for (const [id, r] of Object.entries(window.KT.R)) if (r[2] && f - r[3] <= 2) out.push([id, r[0], r[1]]);
    const sn = Object.keys(window.KT.Scenes).find((k) => window.KT.Scenes[k] === window.KT.scene);
    return { btns: out, W: window.KT.W, H: window.KT.H, scene: sn };
  });
  scenes[info.scene] = (scenes[info.scene] || 0) + 1;
  const rect = await page.evaluate(() => { const r = document.getElementById('view').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
  const toP = (x, y) => [rect[0] + (x / info.W) * rect[2], rect[1] + (y / info.H) * rect[3]];
  const r = rand();
  const btns = info.btns.filter((b) => !skip.has(b[0]));
  if (r < 0.65 && btns.length) {
    const b = btns[Math.floor(rand() * btns.length)];
    await page.mouse.click(...toP(b[1], b[2]));
  } else if (r < 0.85) {
    await page.mouse.click(...toP(rand() * info.W, rand() * info.H));
  } else {
    const x = rand() * info.W, y = rand() * info.H;
    await page.mouse.move(...toP(x, y)); await page.mouse.down();
    for (let k = 0; k < 8; k++) await page.mouse.move(...toP(x + (rand() - 0.5) * 80, y + (rand() - 0.5) * 60), { steps: 3 });
    await page.mouse.up();
  }
  await page.waitForTimeout(60 + rand() * 200);
}
const st = await page.evaluate(() => ({ errs: window.KT.errs, last: window.KT.lastErr, save: window.KT.SAVE ? { c: window.KT.SAVE.c, p: window.KT.SAVE.p.length, ol: window.KT.SAVE.ol, nan: JSON.stringify(window.KT.SAVE).includes('null') } : null }));
console.log('scenes visited:', JSON.stringify(scenes));
console.log('state:', JSON.stringify(st));
console.log(errors.size ? 'ERRORS:\n' + [...errors].join('\n') : 'no errors');
await browser.close(); srv.close();
