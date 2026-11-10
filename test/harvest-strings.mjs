// Opens every screen and state of the app and collects all interface text, for translation.
import { _electron as electron } from 'playwright';
import path from 'path'; import fs from 'fs';
const app = await electron.launch({ args: [path.resolve('.'), '--user-data-dir=/tmp/fs-harvest'] });
const page = await app.firstWindow();
await page.setViewportSize({ width: 1300, height: 900 });
await page.waitForSelector('.cmd');
if (process.env.LANG_TEST) { await page.evaluate((l) => window.filesmith.setSettings({ lang: l }), process.env.LANG_TEST); await page.reload(); await page.waitForSelector('.cmd'); await page.waitForTimeout(300); }
const seen = new Set();
const grab = async () => {
  const items = await page.evaluate(() => {
    const out = [];
    const walk = (n) => {
      if (n.nodeType === 3) { const t = n.nodeValue.replace(/\s+/g, ' ').trim(); if (t && /[A-Za-z]/.test(t)) out.push(t); return; }
      if (n.nodeType !== 1 || ['SCRIPT', 'STYLE', 'svg'].includes(n.tagName)) return;
      for (const a of ['placeholder', 'title', 'aria-label']) { const v = n.getAttribute && n.getAttribute(a); if (v && /[A-Za-z]/.test(v)) out.push(v); }
      n.childNodes.forEach(walk);
    };
    walk(document.body);
    document.querySelectorAll('*').forEach((e) => {
      if (['SCRIPT','STYLE','svg','path','circle'].includes(e.tagName)) return;
      const kids = [...e.childNodes];
      const hasText = kids.some((k) => k.nodeType === 3 && /[A-Za-z]/.test(k.nodeValue));
      const inline = kids.some((k) => k.nodeType === 1 && ['B','SMALL','SPAN','KBD','EM'].includes(k.tagName));
      if (hasText && inline) out.push('HTML::' + e.innerHTML.replace(/\s+/g, ' ').trim());
    });
    return out;
  });
  items.forEach((s) => seen.add(s));
};
const d = (f) => path.resolve('test/demo', f);
const clickAll = async (sel) => { for (const b of await page.$$(sel)) { try { await b.click(); await page.waitForTimeout(120); await grab(); } catch (e) {} } };
await grab();
await page.keyboard.press('Meta+K'); await page.waitForTimeout(200); await grab(); await page.keyboard.press('Escape');
await page.evaluate((f) => window.__filesmithTest.addFiles(f), [d('Clutch round.mov')]); await page.waitForTimeout(800); await grab();
for (const a of ['compress', 'trim', 'gif', 'audio', 'convert', 'mute']) { await page.click(`[data-act="${a}"]`); await page.waitForTimeout(400); await grab(); await clickAll('#opts .chip-opt'); }
await page.evaluate((f) => window.__filesmithTest.addFiles(f), [d('Wallpaper.jpg')]); await page.waitForTimeout(500);
for (const a of ['convert', 'resize', 'compress']) { await page.click(`[data-act="${a}"]`); await page.waitForTimeout(300); await grab(); await clickAll('#opts .chip-opt'); }
await page.evaluate((f) => window.__filesmithTest.addFiles(f), [d('Voice memo 12.mp3')]); await page.waitForTimeout(600);
for (const a of ['convert', 'trim', 'normalize']) { await page.click(`[data-act="${a}"]`); await page.waitForTimeout(300); await grab(); await clickAll('#opts .chip-opt'); }
await page.evaluate(() => window.__filesmithTest.go('pdf')); await page.waitForTimeout(300); await grab();
for (const a of ['merge', 'split', 'compress', 'organize', 'sign', 'images']) { await page.click(`[data-pa="${a}"]`); await page.waitForTimeout(300); await grab(); }
await page.evaluate((f) => window.__filesmithTest.addFiles(f), [d('Rental agreement.pdf'), d('Chemistry notes.pdf')]); await page.waitForTimeout(800);
for (const a of ['merge', 'split', 'compress', 'organize', 'sign', 'images']) { await page.click(`[data-pa="${a}"]`); await page.waitForTimeout(700); await grab(); await clickAll('#pdf-opts .chip-opt'); }
await page.click('[data-pa="sign"]'); await page.waitForTimeout(800);
await page.click('#add-sig'); await page.waitForTimeout(300); await grab(); await page.click('#sig-tabs [data-t="type"]'); await grab(); await page.keyboard.press('Escape');
await page.click('#add-text'); await page.waitForTimeout(300); await grab(); await page.keyboard.press('Escape');
for (const v of ['history', 'settings', 'support', 'home']) { await page.evaluate((x) => window.__filesmithTest.go(x), v); await page.waitForTimeout(300); await grab(); }
await page.evaluate(() => document.getElementById('drop-overlay').classList.add('show')); await grab();
fs.writeFileSync(process.env.OUT || '/tmp/strings.json', JSON.stringify([...seen].sort(), null, 1));
console.log(seen.size, 'strings');
await app.close();
