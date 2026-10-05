// Usage: node tools/batch.mjs <plan.json> <out-prefix>
// plan: [{name, q, w, h, wait, steps:[{tap:[lx,ly]}|{drag:[[x,y],...]}|{wait:ms}|{eval:"js"}]}]
// Produces one PNG per entry plus a contact sheet <out-prefix>_sheet.png
import http from 'http';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [planFile, prefix] = process.argv.slice(2);
const plan = JSON.parse(fs.readFileSync(planFile, 'utf8'));
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : f.endsWith('.png') ? 'image/png' : 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(0);
const port = srv.address().port;
const browser = await chromium.launch();
const outs = [];
for (const e of plan) {
  const page = await browser.newPage({ viewport: { width: e.w || 1024, height: e.h || 768 }, deviceScaleFactor: 1, hasTouch: false });
  const logs = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (er) => logs.push('PAGEERROR: ' + er.message));
  await page.goto(`http://localhost:${port}/index.html?${e.q}`);
  await page.waitForTimeout(e.wait || 700);
  const toPage = async (lx, ly) => page.evaluate(([x, y]) => {
    const r = document.getElementById('view').getBoundingClientRect();
    return [r.left + (x / window.KT.W) * r.width, r.top + (y / window.KT.H) * r.height];
  }, [lx, ly]);
  for (const s of e.steps || []) {
    if (s.wait) await page.waitForTimeout(s.wait);
    if (s.tap) { const [x, y] = await toPage(...s.tap); await page.mouse.click(x, y); await page.waitForTimeout(s.after || 150); }
    if (s.drag) {
      const pts = [];
      for (const p of s.drag) pts.push(await toPage(...p));
      await page.mouse.move(...pts[0]); await page.mouse.down();
      for (let i = 1; i < pts.length; i++) { await page.mouse.move(...pts[i], { steps: 6 }); await page.waitForTimeout(16); }
      await page.mouse.up(); await page.waitForTimeout(s.after || 100);
    }
    if (s.eval) { const r = await page.evaluate(s.eval); if (r !== undefined) logs.push('eval: ' + JSON.stringify(r)); }
    if (s.shot) { const f = `${prefix}_${e.name}_${s.shot}.png`; await page.screenshot({ path: f }); outs.push([e.name + ':' + s.shot, f]); }
  }
  const f = `${prefix}_${e.name}.png`;
  await page.screenshot({ path: f });
  outs.push([e.name, f]);
  if (logs.length) console.log('[' + e.name + ']\n  ' + logs.join('\n  '));
  await page.close();
}
// contact sheet
const sheet = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
const cells = outs.map(([n, f]) => `<div><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}"><span>${n}</span></div>`).join('');
await sheet.setContent(`<style>body{margin:0;background:#222;display:flex;flex-wrap:wrap;gap:6px;padding:6px;font:14px sans-serif;color:#fff}div{display:flex;flex-direction:column;align-items:center}img{max-width:${outs.length > 4 ? 390 : 780}px;max-height:${outs.length > 4 ? 300 : 600}px}</style>${cells}`);
await sheet.screenshot({ path: `${prefix}_sheet.png`, fullPage: true });
await browser.close();
srv.close();
console.log('done', outs.length);
