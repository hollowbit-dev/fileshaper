// Captures frames of the website's motion to check timing and end states.
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const rootDir = path.resolve('docs');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(rootDir, p); if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': types[path.extname(f)] }); res.end(fs.readFileSync(f)); }).listen(4174);
const b = await chromium.launch({ executablePath: process.env.CHROME });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto('http://localhost:4174/');
for (const t of [150, 600, 1500]) { await p.waitForTimeout(t === 150 ? 150 : t - 150); await p.screenshot({ path: `test/shots/motion-${t}.png` }); }
await p.waitForTimeout(4200);
await p.screenshot({ path: 'test/shots/motion-demo.png', clip: { x: 380, y: 560, width: 680, height: 200 } });
console.log('bar scale:', await p.$eval('.demo-bar i', (n) => getComputedStyle(n).transform));
await p.mouse.wheel(0, 1500); await p.waitForTimeout(900);
await p.click('#tab-pdf'); await p.waitForTimeout(600);
const ind = await p.$eval('.tab-ind', (n) => ({ w: n.style.width, t: n.style.transform }));
const btn = await p.$eval('#tab-pdf', (n) => ({ w: n.offsetWidth, l: n.offsetLeft }));
console.log('indicator', ind, 'pdf tab', btn);
await p.screenshot({ path: 'test/shots/motion-tabs.png' });
await p.evaluate(() => document.querySelector('.proof').scrollIntoView({ block: 'center' })); await p.waitForTimeout(400);
console.log('counting:', await p.$$eval('.proof .big', (n) => n.map((x) => x.textContent)));
await p.waitForTimeout(1600);
console.log('final:', await p.$$eval('.proof .big', (n) => n.map((x) => x.textContent)));
console.log('reveal hidden left:', await p.$$eval('.reveal:not(.in)', (n) => n.length), 'errors', errs);
await b.close(); server.close();
