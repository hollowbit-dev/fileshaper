// End-to-end test: launches the real Filesmith app, runs every tool, checks the outputs, takes screenshots.
import { _electron as electron } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const media = path.join(here, 'media');
const out = path.join(here, 'out');
const shots = path.join(here, 'shots');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(shots, { recursive: true });
const userData = fs.mkdtempSync(path.join(here, 'userdata-'));

const exe = process.env.FILESMITH_EXE;
const app = await electron.launch(exe
  ? { executablePath: exe, args: [`--user-data-dir=${userData}`] }
  : { args: [path.join(here, '..'), `--user-data-dir=${userData}`] });
const page = await app.firstWindow();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
await page.setViewportSize({ width: 1240, height: 820 });
await page.waitForSelector('.cmd');
await page.evaluate((d) => window.filesmith.setSettings({ outDir: d }), out);
await page.screenshot({ path: path.join(shots, '01-home.png') });

let pass = 0; let fail = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? `  (${extra})` : ''}`); ok ? pass++ : fail++; };
const job = (tool, action, file, options = {}) => page.evaluate((j) => window.filesmith.runJob({ jobId: Math.random().toString(36), ...j }), { tool, action, file: path.join(media, file), options });
const mb = (n) => (n / 1e6).toFixed(2) + ' MB';

// --- Backend jobs ---
let r = await job('video', 'compress', 'clip.mp4', { targetMB: 10 });
check('video compress to 10 MB', r.ok && r.after < 10e6 && r.after > 6e6, r.ok ? `${mb(r.before)} -> ${mb(r.after)}` : r.error);
r = await job('video', 'compress', 'clip.mp4', { quality: 'medium' });
check('video compress balanced', r.ok && r.after < r.before, r.ok ? mb(r.after) : r.error);
r = await job('video', 'trim', 'clip.mp4', { start: 5, end: 9.5 });
let p = r.ok && await page.evaluate((f) => window.filesmith.probe(f), r.output);
check('video trim 4.5s', r.ok && Math.abs(p.duration - 4.5) < 0.2, r.ok ? `${p.duration}s` : r.error);
r = await job('video', 'gif', 'short.mov', { start: 1, end: 4, fps: 15, width: 480 });
check('video to gif', r.ok && r.after > 10000, r.ok ? mb(r.after) : r.error);
r = await job('video', 'audio', 'clip.mp4');
check('extract audio', r.ok && r.output.endsWith('.mp3'), r.ok ? mb(r.after) : r.error);
r = await job('video', 'convert', 'short.mov');
check('mov to mp4', r.ok && r.output.endsWith('.mp4'), r.ok ? mb(r.after) : r.error);
r = await job('video', 'mute', 'clip.mp4');
p = r.ok && await page.evaluate((f) => window.filesmith.probe(f), r.output);
check('remove sound', r.ok && !p.hasAudio, r.error || '');
r = await job('image', 'convert', 'iphone.heic', { format: 'jpg', quality: 85 });
check('heic to jpg', r.ok && r.output.endsWith('.jpg') && r.after > 10000, r.ok ? mb(r.after) : r.error);
r = await job('image', 'convert', 'alpha.png', { format: 'jpg', quality: 85 });
check('png with transparency to jpg', r.ok, r.error || r.output);
const alphaJpg = r.output;
r = await job('image', 'resize', 'photo.jpg', { format: 'jpg', maxSize: 1080, quality: 82 });
p = r.ok && await page.evaluate((f) => new Promise((res) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res([i.naturalWidth, i.naturalHeight]); i.onerror = () => res(null); i.src = window.filesmith.fileUrl(f); }), r.output);
check('resize longest side 1080', r.ok && p && p[0] === 1080, JSON.stringify(p));
r = await job('image', 'compress', 'photo.jpg', { format: 'webp', quality: 70 });
check('compress to webp', r.ok && r.after < r.before, r.ok ? `${mb(r.before)} -> ${mb(r.after)}` : r.error);
r = await job('audio', 'convert', 'song.mp3', { format: 'm4a', bitrate: 128 });
check('mp3 to m4a', r.ok && r.after < r.before, r.ok ? mb(r.after) : r.error);
r = await job('audio', 'trim', 'song.mp3', { format: 'mp3', bitrate: 192, start: 2, end: 12 });
p = r.ok && await page.evaluate((f) => window.filesmith.probe(f), r.output);
check('audio trim 10s', r.ok && Math.abs(p.duration - 10) < 0.3, r.ok ? `${p.duration}s` : r.error);
r = await job('audio', 'normalize', 'song.mp3', { format: 'mp3', bitrate: 192 });
check('normalize volume', r.ok, r.error || '');

// Check the transparent PNG became white, not black, behind the shape.
const px = await page.evaluate((f) => new Promise((res) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const x = c.getContext('2d'); x.drawImage(i, 0, 0); res([...x.getImageData(10, 10, 1, 1).data]); }; i.src = window.filesmith.fileUrl(f); }), alphaJpg);
check('transparent areas become white', px[0] > 240 && px[1] > 240 && px[2] > 240, JSON.stringify(px));

// --- UI flows ---
await page.evaluate((f) => window.__filesmithTest.addFiles(f), [path.join(media, 'clip.mp4'), path.join(media, 'short.mov')]);
await page.waitForSelector('.qitem');
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(shots, '02-video.png') });
await page.click('[data-act="trim"]');
await page.waitForTimeout(1200);
await page.screenshot({ path: path.join(shots, '03-trim.png') });
await page.click('[data-act="compress"]');
await page.click('#run');
await page.waitForSelector('.qitem.done, .qitem.skipped, .qitem.failed', { timeout: 120000 });
for (let t = 0; t < 360 && await page.evaluate(() => window.__filesmithTest.S.running); t++) await page.waitForTimeout(500);
await page.screenshot({ path: path.join(shots, '04-video-done.png') });
const vstat = await page.$$eval('.qitem', (n) => n.map((x) => x.className + ' | ' + x.querySelector('.status').textContent));
check('UI compress runs', vstat.every((s) => /done|skipped/.test(s)), vstat.join(' ; '));

await page.evaluate((f) => window.__filesmithTest.addFiles(f), [path.join(media, 'iphone.heic'), path.join(media, 'photo.jpg'), path.join(media, 'alpha.png')]);
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(shots, '05-images.png') });

await page.evaluate((f) => window.__filesmithTest.addFiles(f), [path.join(media, 'a.pdf'), path.join(media, 'b.pdf')]);
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(shots, '06-pdf-merge.png') });
await page.click('#run');
await page.waitForSelector('#pdf-opts .qitem.done', { timeout: 30000 });
const merged = await page.$eval('#pdf-opts .qitem.done .meta', (n) => n.textContent);
check('PDF merge', /8 pages/.test(merged), merged);

await page.click('[data-pa="organize"]');
await page.waitForSelector('.pg canvas', { timeout: 15000 });
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(shots, '07-pdf-organize.png') });
await page.hover('.pg[data-i="1"]');
await page.click('[data-del="1"]');
await page.hover('.pg[data-i="0"]');
await page.click('[data-rot="0"]');
await page.click('#run');
await page.waitForSelector('#pdf-opts .qitem.done', { timeout: 30000 });
check('PDF organize (delete + rotate)', /2 pages/.test(await page.$eval('#pdf-opts .qitem.done .meta', (n) => n.textContent)));

await page.click('[data-pa="split"]');
await page.click('#run');
await page.waitForSelector('#pdf-opts .qitem.done', { timeout: 30000 });
check('PDF split every page', (await page.$$('#pdf-opts .qitem.done')).length === 3);

await page.click('[data-pa="sign"]');
await page.waitForSelector('.sign-page canvas', { timeout: 15000 });
await page.click('#add-sig');
await page.waitForSelector('.sign-pad');
const pad = await page.$('.sign-pad');
const b = await pad.boundingBox();
await page.mouse.move(b.x + 60, b.y + 110); await page.mouse.down();
for (let i = 0; i <= 40; i++) await page.mouse.move(b.x + 60 + i * 9, b.y + 110 - Math.sin(i / 4) * 40, { steps: 2 });
await page.mouse.up();
await page.click('#s-ok');
await page.$eval('.sign-page', (n) => n.scrollIntoView({ block: 'end' }));
await page.waitForTimeout(200);
const pg = await (await page.$('.sign-page')).boundingBox();
await page.mouse.click(pg.x + pg.width * 0.42, pg.y + pg.height * 0.84);
await page.waitForSelector('.placed');
await page.click('#add-date');
await page.mouse.click(pg.x + pg.width * 0.65, pg.y + pg.height * 0.86);
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(shots, '08-pdf-sign.png') });
await page.click('#run');
await page.waitForTimeout(2500);
console.log('SIGN toasts:', await page.$$eval('.toast', (n) => n.map((x) => x.textContent)), 'errors:', errors);
await page.waitForSelector('#pdf-opts .qitem.done', { timeout: 30000 });
check('PDF sign', true);

await page.evaluate(() => { window.__pdfAction = 'images'; });
await page.evaluate((f) => window.__filesmithTest.addFiles(f), [path.join(media, 'iphone.heic'), path.join(media, 'alpha.png')]);
await page.evaluate(() => window.__filesmithTest.go('pdf'));
await page.click('[data-pa="images"]');
await page.waitForTimeout(300);
if (!(await page.$('#flist'))) {
  // Images went to the image tool; send them to PDF through the tool's button.
  await page.evaluate(() => window.__filesmithTest.go('image'));
  await page.click('[data-act="topdf"]');
  await page.waitForSelector('#flist');
}
await page.click('#run');
await page.waitForSelector('#pdf-opts .qitem.done', { timeout: 30000 });
check('images to PDF', /2 pages/.test(await page.$eval('#pdf-opts .qitem.done .meta', (n) => n.textContent)));
await page.screenshot({ path: path.join(shots, '09-pdf-images.png') });

await page.evaluate(() => window.__filesmithTest.go('home'));
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(shots, '10-home-after.png') });
await page.evaluate(() => window.__filesmithTest.go('support'));
await page.screenshot({ path: path.join(shots, '11-support.png') });
await page.evaluate(() => window.filesmith.setSettings({ theme: 'light' }));
await page.evaluate(() => window.__filesmithTest.go('settings'));
await page.evaluate(async () => { const s = await window.filesmith.getState(); document.documentElement.dataset.theme = 'light'; });
await page.screenshot({ path: path.join(shots, '12-settings-light.png') });

console.log(`\n${pass} passed, ${fail} failed`);
if (errors.length) console.log('Window errors:\n' + errors.join('\n'));
await app.close();
fs.rmSync(userData, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
