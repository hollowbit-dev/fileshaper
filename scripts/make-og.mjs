// Renders the 1200×630 social preview card for each language into site/assets/og/.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
const root = path.resolve('site');
const b = await chromium.launch({ executablePath: process.env.CHROME });
const font = (f) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(root, 'assets/fonts', f)).toString('base64')})`;
const img = (f) => `data:image/${f.endsWith('png') ? 'png' : 'webp'};base64,${fs.readFileSync(path.join(root, 'assets/img', f)).toString('base64')}`;
const TAGS = { en: ['Free', 'Offline'], es: ['Gratis', 'Sin conexión'], fr: ['Gratuit', 'Hors ligne'], de: ['Kostenlos', 'Offline'], ru: ['Бесплатно', 'Офлайн'], zh: ['免费', '离线'] };
for (const code of ['en', 'es', 'fr', 'de', 'ru', 'zh']) {
  const t = JSON.parse(fs.readFileSync(path.join(root, 'locales', `${code}.json`), 'utf8'));
  const en = JSON.parse(fs.readFileSync(path.join(root, 'locales', 'en.json'), 'utf8'));
  const h1 = (t.home && t.home.h1) || en.home.h1;
  const sub = (t.common && t.common.platforms) || en.common.platforms;
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face{font-family:G;src:${font('Geist-Variable.woff2')};font-weight:100 900}
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;overflow:hidden;background:#0b0b0c;color:#ededef;font-family:G,"PingFang SC","Noto Sans SC",sans-serif;position:relative}
  .l{position:absolute;left:72px;top:72px;width:560px}
  .brand{display:flex;align-items:center;gap:14px;font-size:30px;font-weight:650;letter-spacing:-.01em}
  .brand img{width:56px;height:56px}
  h1{margin-top:44px;font-size:${code === 'zh' ? 58 : ['ru', 'de', 'fr', 'es'].includes(code) ? 48 : 56}px;line-height:1.05;letter-spacing:-.035em;font-weight:620}
  p{margin-top:28px;font-size:22px;color:#a3a3ab;line-height:1.45}
  .tag{position:absolute;left:72px;bottom:64px;display:flex;gap:10px}
  .tag span{border:1px solid rgba(255,255,255,.14);border-radius:99px;padding:8px 16px;font-size:18px;color:#d6d6db}
  .tag span:first-child{background:#f26a1b;border-color:#f26a1b;color:#170a03;font-weight:600}
  .shot{position:absolute;left:690px;top:90px;width:820px;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,.14);box-shadow:0 30px 80px rgba(0,0,0,.7)}
  .bar{height:28px;background:#19191b;display:flex;gap:7px;align-items:center;padding:0 12px}.bar i{width:10px;height:10px;border-radius:50%;background:#3a3a3e}
  .shot img{display:block;width:100%}
  </style></head><body>
  <div class="l"><div class="brand"><img src="${img('icon-256.png')}">Fileshaper</div><h1>${h1}</h1><p>${sub}</p></div>
  <div class="tag"><span>${TAGS[code][0]}</span><span>Windows</span><span>macOS</span><span>${TAGS[code][1]}</span></div>
  <div class="shot"><div class="bar"><i></i><i></i><i></i></div><img src="${img('video.webp')}"></div>
  </body></html>`;
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(html); await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(root, 'assets/og', `og-${code}.png`) });
  await p.close();
}
await b.close();
console.log('og images done');
