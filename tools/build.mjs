// Concatenates src/*.js into the single-file game: index.html
import fs from 'fs';
import path from 'path';
const root = path.dirname(new URL(import.meta.url).pathname) + '/..';
const shell = fs.readFileSync(root + '/src/shell.html', 'utf8');
const files = fs.readdirSync(root + '/src').filter(f => f.endsWith('.js')).sort();
let js = '';
for (const f of files) js += `\n// ===== ${f} =====\n` + fs.readFileSync(root + '/src/' + f, 'utf8');
const out = shell.replace('/*__SCRIPT__*/', () => '(function(){\n' + js + '\n})();');
fs.writeFileSync(root + '/index.html', out);
console.log('built index.html', (out.length / 1024).toFixed(1) + ' KB from', files.length, 'files');
