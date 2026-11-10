// Screenshots of the built website (desktop + phone) for a page and language.
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';
const rootDir = path.resolve('docs');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.mjs': 'text/javascript', '.wasm': 'application/wasm' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]).replace(/^\/fileshaper/, '');
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(rootDir, p);
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(fs.readFileSync(path.join(rootDir, '404.html'))); return; }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
}).listen(4173);
const b = await chromium.launch({ executablePath: process.env.CHROME });
const pages = (process.env.PAGES || '/').split(',');
for (const pg of pages) for (const [n, w, h] of [['d', 1440, 900], ['m', 390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, locale: process.env.LOCALE || 'en-US', reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://localhost:4173' + pg); await p.waitForTimeout(700);
  const tag = pg.replace(/[\/.]/g, '_') || 'root';
  await p.screenshot({ path: `test/shots/web${tag}-${n}.png`, fullPage: process.env.FULL === '1' });
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(pg, n, 'overflow', overflow, 'url', p.url().replace('http://localhost:4173', ''), errs.length ? errs : '');
  await ctx.close();
}
await b.close(); server.close();
