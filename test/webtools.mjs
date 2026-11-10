// Drives every web tool in a real browser with real files, checks the outputs,
// and checks that no request goes to any other server (nothing is uploaded).
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const rootDir = path.resolve('docs');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.json': 'application/json' };
const server = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(rootDir, p); if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f)); }).listen(4175);
const b = await chromium.launch({ executablePath: process.env.CHROME });
const page = await b.newPage({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
const foreign = []; page.on('request', (r) => { if (!r.url().startsWith('http://localhost:4175') && !r.url().startsWith('blob:') && !r.url().startsWith('data:')) foreign.push(r.url()); });
const errs = []; page.on('pageerror', (e) => errs.push(e.message));
await page.goto('http://localhost:4175/tools/'); await page.waitForTimeout(800);
const m = (f) => path.resolve('test/media', f);
let pass = 0, fail = 0;
const check = (n, ok, x = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}  ${x}`); ok ? pass++ : fail++; };
async function runTool(id, files, setup, timeout = 60000) {
  const w = page.locator(`#${id} .webtool`);
  await w.locator('input[type=file]').setInputFiles(files);
  await page.waitForTimeout(400);
  if (setup) await setup(w);
  await w.locator('.wt-run .btn').click();
  await w.locator('.wt-status').filter({ hasText: /Done|already|isn't|Couldn|password|damaged|over|Place/ }).waitFor({ timeout });
  const status = await w.locator('.wt-status').textContent();
  const results = await w.locator('.wt-result').evaluateAll((ns) => ns.map((n) => n.textContent.trim()));
  return { status, results };
}
let r = await runTool('images', [m('iphone.heic'), m('alpha.png'), m('photo.jpg')]);
check('images: HEIC + PNG + JPG to JPG', r.results.length === 3, r.results.join(' | '));
r = await runTool('pdf-merge', [m('a.pdf'), m('b.pdf')]);
check('PDF merge', r.results.length === 1 && /merged/.test(r.results[0]), r.results.join(' | ') + ' ' + (await page.locator('#pdf-merge .wt-note').textContent().catch(() => '')));
r = await runTool('pdf-split', [m('a.pdf')]);
check('PDF split every page', r.results.length === 3, r.results.length + ' files');
r = await runTool('pdf-compress', [m('b.pdf')], async (w) => { await w.locator('.wt-chips button', { hasText: 'Light' }).click(); });
check('PDF compress (runs, honest about tiny files)', /Done/.test(r.status), r.status + ' ' + r.results.join(' | ') + ' ' + (await page.locator('#pdf-compress .wt-note').allTextContents()).join(' '));
// Sign: draw, place, save
const sw = page.locator('#pdf-sign .webtool');
await sw.locator('input[type=file]').setInputFiles([m('a.pdf')]);
await page.waitForSelector('#pdf-sign .wt-page canvas'); await page.waitForTimeout(600);
await sw.locator('.wt-pad').scrollIntoViewIfNeeded(); await page.waitForTimeout(200);
const pad = await sw.locator('.wt-pad').boundingBox();
await page.mouse.move(pad.x + 40, pad.y + 80); await page.mouse.down();
for (let i = 0; i < 30; i++) await page.mouse.move(pad.x + 40 + i * 10, pad.y + 80 - Math.sin(i / 3) * 30);
await page.mouse.up();
await sw.locator('[data-a="place"]').click();
console.log('   sign status after place:', await sw.locator('.wt-status').textContent());
await sw.locator('.wt-page').first().scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
const pg = await sw.locator('.wt-page').first().boundingBox();
await page.mouse.click(pg.x + pg.width * 0.4, pg.y + Math.min(pg.height * 0.6, 500));
await page.waitForTimeout(400);
console.log('   placed items:', await sw.locator('.wt-placed').count());
await sw.locator('.wt-run .btn').click();
await page.waitForTimeout(1500);
console.log('   sign status after save:', await sw.locator('.wt-status').textContent());
await sw.locator('.wt-result').waitFor({ timeout: 20000 });
check('PDF sign', (await sw.locator('.wt-result').count()) === 1, (await sw.locator('.wt-result').textContent()).trim());
// Video (WebAssembly FFmpeg)
const t0 = Date.now();
r = await runTool('video-compress', [m('short.mov')], async (w) => { await w.locator('.wt-chips button', { hasText: '8 MB' }).click(); }, 300000);
const sizeOk = r.results[0] && /→ ([\d.]+) MB/.exec(r.results[0]) && parseFloat(/→ ([\d.]+) MB/.exec(r.results[0])[1]) <= 8;
check('video compress to 8 MB in browser', !!sizeOk, `${r.results.join(' | ')} (${Math.round((Date.now() - t0) / 1000)} s)`);
r = await runTool('video-gif', [m('short.mov')], null, 300000);
check('video to GIF in browser', r.results.length === 1 && /\.gif/.test(r.results[0]), r.results.join(' | '));
// Download link really gives a file
const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#video-gif .wt-result').click()]);
const p = await dl.path(); check('download link saves the file', fs.statSync(p).size > 10000, `${dl.suggestedFilename()} ${fs.statSync(p).size} bytes`);
check('no requests to other servers', foreign.length === 0, foreign.slice(0, 3).join(' '));
console.log(`\n${pass} passed, ${fail} failed`, errs.length ? errs : '');
await page.screenshot({ path: 'test/shots/webtools.png', fullPage: false });
await b.close(); server.close(); process.exit(fail ? 1 : 0);
