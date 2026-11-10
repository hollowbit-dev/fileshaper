import { _electron as electron } from 'playwright';
import path from 'path';
for (const lang of (process.env.LANGS || 'zh,de').split(',')) {
  const app = await electron.launch({ args: [path.resolve('.'), `--user-data-dir=/tmp/fs-lang-${lang}`] });
  const page = await app.firstWindow();
  await page.setViewportSize({ width: 1200, height: 760 });
  const errs = []; page.on('pageerror', (e) => errs.push(e.message));
  await page.waitForSelector('.cmd');
  await page.evaluate((l) => window.filesmith.setSettings({ lang: l, theme: 'dark', outDir: '/tmp' }), lang);
  await page.reload(); await page.waitForSelector('.cmd');
  await page.evaluate((f) => window.__filesmithTest.addFiles(f), [path.resolve('test/demo/Clutch round.mov'), path.resolve('test/demo/Lisbon trip 4K.mp4')]);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `test/shots/app-${lang}-video.png` });
  await page.evaluate(() => window.__filesmithTest.go('settings')); await page.waitForTimeout(500);
  await page.screenshot({ path: `test/shots/app-${lang}-settings.png` });
  console.log(lang, errs.length ? errs : 'ok');
  await app.close();
}
