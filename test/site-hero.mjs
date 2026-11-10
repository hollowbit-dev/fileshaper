import { chromium } from 'playwright';
import path from 'path';
const b = await chromium.launch({ executablePath: process.env.CHROME });
for (const [n, w, h] of [['hero-desktop', 1440, 900], ['hero-mobile', 390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('file://' + path.resolve(process.env.PAGE || 'docs/index.html')); await p.waitForTimeout(1500);
  await p.screenshot({ path: `test/shots/${process.env.TAG || ''}${n}.png` });
}
await b.close();
