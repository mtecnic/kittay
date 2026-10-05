// Usage: node tools/shot.mjs <out.png> "<query>" [w h] [waitMs] [script]
// Serves the repo over http and screenshots index.html?<query> at an iPad-like viewport.
import http from 'http';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [out, query = 'test=sheet', w = '1024', h = '768', wait = '600', script = ''] = process.argv.slice(2);
const types = { '.html': 'text/html', '.png': 'image/png', '.js': 'text/javascript' };
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(0);
const port = srv.address().port;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2, hasTouch: true });
const logs = [];
page.on('console', (m) => logs.push(m.type() + ': ' + m.text()));
page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));
await page.goto(`http://localhost:${port}/index.html?${query}`);
await page.waitForTimeout(+wait);
if (script) {
  const s = fs.existsSync(script) ? fs.readFileSync(script, 'utf8') : script;
  const fn = new Function('page', 'return (async () => {' + s + '})()');
  await fn(page);
}
await page.screenshot({ path: out });
if (logs.length) console.log(logs.join('\n'));
await browser.close();
srv.close();
