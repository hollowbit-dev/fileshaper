// Takes the screenshots used on the website, from the real app, in dark mode.
import { _electron as electron } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const demo = path.join(here, 'demo');
const outDir = path.join(here, 'demo-out');
const shots = path.join(here, '..', 'docs', 'img');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(shots, { recursive: true });
const userData = fs.mkdtempSync(path.join(here, 'userdata-'));
const d = (f) => path.join(demo, f);

const app = await electron.launch({ args: [path.join(here, '..'), `--user-data-dir=${userData}`], colorScheme: 'dark' });
const page = await app.firstWindow();
await page.setViewportSize({ width: 1200, height: 760 });
await page.waitForSelector('.cmd');
await page.evaluate((o) => window.filesmith.setSettings({ outDir: o, theme: 'dark' }), outDir);
await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; delete document.documentElement.dataset.material; });
const shot = async (name) => { await page.waitForTimeout(500); await page.screenshot({ path: path.join(shots, `${name}.png`) }); console.log('saved', name, await page.evaluate(() => window.__filesmithTest.S.view)); };
const idle = async () => { for (let t = 0; t < 400 && await page.evaluate(() => window.__filesmithTest.S.running); t++) await page.waitForTimeout(500); };

// Video: compress two clips for Discord.
await page.evaluate((f) => window.__filesmithTest.addFiles(f), [d('Lisbon trip 4K.mp4'), d('Clutch round.mov')]);
await page.waitForSelector('.qitem');
await page.click('#run');
await page.waitForTimeout(2500);
await shot('video-working');
await idle();
await page.waitForTimeout(4200);
await shot('video');

// Images: convert iPhone photos.
await page.evaluate((f) => window.__filesmithTest.addFiles(f), [d('IMG_4821.HEIC'), d('IMG_4822.HEIC'), d('Screenshot 2026-11-08.png'), d('Wallpaper.jpg')]);
await page.waitForSelector('.qitem');
await page.click('#run');
await idle();
await page.waitForTimeout(4200);
await shot('images');

// Audio.
await page.evaluate((f) => window.__filesmithTest.addFiles(f), [d('Voice memo 12.mp3')]);
await page.click('[data-act="normalize"]');
await page.click('#run');
await idle();

// PDF: merge, then sign.
await page.evaluate((f) => window.__filesmithTest.addFiles(f), [d('Rental agreement.pdf'), d('Chemistry notes.pdf')]);
await page.waitForTimeout(800);
await shot('pdf-merge');
await page.click('[data-pa="organize"]');
await page.waitForSelector('.pg canvas');
await page.waitForTimeout(800);
await shot('pdf-organize');
await page.click('[data-pa="sign"]');
await page.waitForSelector('.sign-page canvas');
await page.click('#add-sig');
await page.click('#sig-tabs [data-t="type"]');
await page.fill('#typed', 'Alex Morgan');
await page.click('#ink [data-c="#1a3fb0"]');
await page.click('#s-ok');
await page.$eval('.sign-page', (n) => n.scrollIntoView({ block: 'end' }));
await page.waitForTimeout(300);
let pg = await (await page.$('.sign-page')).boundingBox();
await page.mouse.click(pg.x + pg.width * 0.25, pg.y + pg.height * 0.765);
await page.click('#add-date');
await page.mouse.click(pg.x + pg.width * 0.6, pg.y + pg.height * 0.785);
await page.mouse.click(pg.x + 20, pg.y + 20);
await page.$eval('#main', (v) => { v.scrollTop = v.scrollTop + 120; });
await page.waitForTimeout(4000);
await shot('pdf-sign');

// Home with real totals.
await page.evaluate(() => window.__filesmithTest.go('home'));
await page.waitForTimeout(3800);
await page.evaluate(async () => { const t = window.__filesmithTest; });
await shot('home');

await app.close();
fs.rmSync(userData, { recursive: true, force: true });
