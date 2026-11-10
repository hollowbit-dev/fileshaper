// Builds the Filesmith website into docs/ (GitHub Pages), one folder per language.
// Usage: node site/build.mjs
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GUIDES, UPDATED } from './guides.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const out = path.join(root, 'docs');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

// ===== Edit these before you publish =====
const SITE = {
  url: 'https://hollowbit-dev.github.io/filesmith',
  github: 'https://github.com/hollowbit-dev/filesmith',
  tip: 'https://ko-fi.com/hollowbit',
};
// =========================================

const VERSION = pkg.version;
const releases = `${SITE.github}/releases/latest/download/`;
const FILES = {
  win: `Filesmith-Setup-${VERSION}-win-x64.exe`,
  macArm: `Filesmith-${VERSION}-mac-arm64.dmg`,
  macIntel: `Filesmith-${VERSION}-mac-x64.dmg`,
};
const ORG_LD = { '@context': 'https://schema.org', '@type': 'Organization', name: 'Hollowbit', url: SITE.url, logo: `${SITE.url}/img/icon-256.png`, founder: { '@type': 'Person', name: 'Elvis Zygmanta' }, sameAs: [SITE.github] };
const APP_LD = (desc, lang) => ({
  '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Filesmith', applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Windows 10, Windows 11, macOS 12 or later', softwareVersion: VERSION, inLanguage: lang, description: desc,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, downloadUrl: `${SITE.url}/download.html`, license: 'https://www.gnu.org/licenses/gpl-3.0.html',
  publisher: { '@type': 'Organization', name: 'Hollowbit' }, image: `${SITE.url}/og/og-en.png`, screenshot: `${SITE.url}/img/video.webp`,
  featureList: ['Compress video to a target size such as 10 MB for Discord', 'Convert HEIC to JPG, PNG or WebP', 'Sign, merge, split and compress PDF', 'Trim video and audio, make GIFs, extract MP3', 'Works offline; files are never uploaded'],
});
const LANGS = [
  { code: 'en', name: 'English', html: 'en' },
  { code: 'es', name: 'Español', html: 'es' },
  { code: 'fr', name: 'Français', html: 'fr' },
  { code: 'de', name: 'Deutsch', html: 'de' },
  { code: 'ru', name: 'Русский', html: 'ru' },
  { code: 'zh', name: '中文', html: 'zh-CN' },
];
const PAGES = ['index', 'features', 'download', 'changelog', 'faq', 'about', 'support', 'privacy'];

// Checksums come from the built installers when they exist.
function sha(file) {
  const p = path.join(root, 'dist', file);
  if (!fs.existsSync(p)) return 'build the installers to fill this in';
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}
const SUMS = { win: sha(FILES.win), macArm: sha(FILES.macArm), macIntel: sha(FILES.macIntel) };

const en = JSON.parse(fs.readFileSync(path.join(here, 'locales', 'en.json'), 'utf8'));
function merge(base, over) {
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return over ?? base;
  const o = { ...base };
  for (const k of Object.keys(over || {})) o[k] = merge(base[k], over[k]);
  return o;
}
const load = (code) => code === 'en' ? en : merge(en, JSON.parse(fs.readFileSync(path.join(here, 'locales', `${code}.json`), 'utf8')));

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const href = (page) => (page === 'index' ? './' : `${page}.html`);

// ---------- Icons (one stroke family) ----------
const I = (d, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const ICON = {
  arrow: I('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  down: I('<path d="M12 4v12M6.5 10.5 12 16l5.5-5.5"/><path d="M4 20h16"/>'),
  search: I('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.3-4.3"/>'),
  check: I('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  globe: I('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.3 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.3-3.5-8.5s1.1-6.1 3.5-8.5z"/>'),
  github: I('<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>'),
  heart: I('<path d="M12 20s-7-4.3-8.8-8.7C1.9 8 4 4.8 7.2 4.8c1.9 0 3.4 1 4.8 2.8 1.4-1.8 2.9-2.8 4.8-2.8 3.2 0 5.3 3.2 4 6.5C19 15.7 12 20 12 20z"/>'),
  video: I('<rect x="3" y="5" width="13" height="14" rx="2.5"/><path d="m16 10 5-3v10l-5-3"/>'),
  images: I('<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="9.5" r="1.8"/><path d="m21 16-5.5-5.5L5 20"/>'),
  pdf: I('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>'),
  audio: I('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
  shrink: I('<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>'),
  windows: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" stroke="none" d="M3 5.6 10.4 4.6v7H3zM11.6 4.4 21 3v8.6h-9.4zM3 12.6h7.4v7L3 18.6zM11.6 12.6H21V21l-9.4-1.4z"/></svg>',
  apple: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" stroke="none" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9s-2-.9-3.3-.9C6.1 7 4.5 8 3.6 9.6c-1.8 3.2-.5 7.9 1.3 10.4.9 1.3 1.9 2.7 3.2 2.6 1.3 0 1.8-.8 3.3-.8s2 .8 3.3.8c1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.8-1.1-2.8-4.6zM14 5.2c.7-.9 1.2-2 1-3.2-1 .1-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.3-.6 3.1-1.5z"/></svg>',
};
const FAM_ICON = { video: 'video', images: 'images', pdf: 'pdf', audio: 'audio' };
const FAM_IMG = { video: 'video', images: 'images', pdf: 'pdf-sign', audio: 'home' };

// ---------- Layout ----------
function layout(L, t, page, title, body, o = {}) {
  // o.prefix: path back to this language's root (guides live one folder down).
  // o.path: page path for canonical URLs when it isn't a translated page (guides).
  const prefix = o.prefix || '';
  const base = (L.code === 'en' ? '' : '../') + prefix;
  const href = (p) => prefix + (p === 'index' ? './' : `${p}.html`);
  const pagePath = (code) => `${code === 'en' ? '' : `${code}/`}${page === 'index' ? '' : `${page}.html`}`;
  const langPath = (code) => (o.path ? `${base}${code === 'en' ? '' : `${code}/`}` : `${(L.code === 'en' ? '' : '../')}${pagePath(code)}`) || './';
  const abs = (code) => `${SITE.url}/${o.path || pagePath(code)}`;
  const desc = o.desc || t.meta.description;
  const ogImg = `${SITE.url}/og/og-${o.path ? 'en' : L.code}.png`;
  const alternates = o.path
    ? `<link rel="alternate" hreflang="en" href="${abs('en')}">`
    : `${LANGS.map((l) => `<link rel="alternate" hreflang="${l.html}" href="${abs(l.code)}">`).join('\n')}\n<link rel="alternate" hreflang="x-default" href="${abs('en')}">`;
  const ld = [ORG_LD, ...(o.jsonld || [])].map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n');
  const nav = [['features', t.nav.features], ['download', t.nav.download], ['changelog', t.nav.changelog], ['faq', t.nav.faq], ['about', t.nav.about]];
  return `<!doctype html>
<html lang="${o.path ? 'en' : L.html}" data-lang="${L.code}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>document.documentElement.classList.add('js')</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0b0b0c">
<meta name="author" content="Hollowbit">
<meta property="og:type" content="${o.article ? 'article' : 'website'}">
<meta property="og:site_name" content="Filesmith">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${abs(L.code)}">
<meta property="og:image" content="${ogImg}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${L.html.replace('-', '_')}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${ogImg}">
<link rel="canonical" href="${abs(L.code)}">
${alternates}
${ld}
<link rel="icon" href="${base}favicon.png">
<link rel="preload" href="${base}fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${base}style.css">
</head>
<body data-page="${page}">
<a class="skip" href="#main">${esc(t.nav.skip)}</a>
<header class="nav">
  <div class="wrap nav-in">
    <a class="logo" href="${href('index')}"><img src="${base}img/icon-256.png" alt="" width="28" height="28"><span>Filesmith</span></a>
    <nav class="links" aria-label="Main">${nav.map(([p, l]) => `<a href="${href(p)}"${p === page ? ' aria-current="page"' : ''}>${esc(l)}</a>`).join('')}</nav>
    <div class="nav-end">
      <details class="lang">
        <summary aria-label="${esc(t.nav.language)}">${ICON.globe}<span>${L.code.toUpperCase()}</span></summary>
        <div class="lang-menu">${LANGS.map((l) => `<a href="${langPath(l.code)}" hreflang="${l.html}" lang="${l.html}" data-set-lang="${l.code}"${l.code === L.code ? ' aria-current="true"' : ''}>${l.name}</a>`).join('')}</div>
      </details>
      <a class="btn btn-sm btn-primary" href="${href('download')}" data-dl>${esc(t.nav.cta)}</a>
    </div>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="foot">
  <div class="wrap foot-in">
    <div class="foot-brand">
      <a class="logo" href="${href('index')}"><img src="${base}img/icon-256.png" alt="" width="24" height="24"><span>Filesmith</span></a>
      <p>${esc(t.footer.tagline)}</p>
    </div>
    <div class="foot-col"><p class="foot-h">${esc(t.footer.product)}</p><a href="${href('features')}">${esc(t.nav.features)}</a><a href="${href('download')}">${esc(t.nav.download)}</a><a href="${href('changelog')}">${esc(t.nav.changelog)}</a><a href="${base}guides/">${esc(t.footer.guides)}</a></div>
    <div class="foot-col"><p class="foot-h">${esc(t.footer.help)}</p><a href="${href('faq')}">${esc(t.nav.faq)}</a><a href="${href('support')}">${esc(t.footer.support)}</a><a href="${href('privacy')}">${esc(t.footer.privacy)}</a></div>
    <div class="foot-col"><p class="foot-h">${esc(t.footer.studio)}</p><a href="${href('about')}">${esc(t.footer.about)}</a><a href="${SITE.github}" rel="noopener">${esc(t.footer.github)}</a></div>
  </div>
  <div class="wrap foot-legal"><span>${esc(t.footer.made)}</span><span>${esc(t.footer.legal)}</span></div>
</footer>
<script>window.FS=${JSON.stringify({ releases, files: FILES, lang: L.code, langs: LANGS.map((l) => l.code), page, t: { mac: t.common.dl_mac, win: t.common.dl_win } })};</script>
<script src="${base}site.js" defer></script>
</body>
</html>
`;
}

const shot = (base, img, alt, cls = '') => `<figure class="shot ${cls}"><div class="shot-bar"><i></i><i></i><i></i></div><img src="${base}img/${img}.webp" alt="${esc(alt)}" width="1200" height="760" loading="${cls.includes('eager') ? 'eager' : 'lazy'}"></figure>`;

// Both downloads, side by side. site.js makes the visitor's own OS the highlighted one.
const dlButtons = (t) => `
  <a class="btn btn-lg btn-primary" data-os-btn="mac" href="${releases}${FILES.macArm}">${ICON.apple}${esc(t.common.dl_mac)}</a>
  <a class="btn btn-lg btn-ghost" data-os-btn="win" href="${releases}${FILES.win}">${ICON.windows}${esc(t.common.dl_win)}</a>`;

// ---------- Pages ----------
function home(L, t, base) {
  const fams = ['video', 'images', 'pdf', 'audio'];
  return `
<section class="hero">
  <div class="wrap hero-in">
    <h1>${esc(t.home.h1)}</h1>
    <p class="lead">${esc(t.home.lead)}</p>
    <div class="cta">${dlButtons(t)}</div>
    <p class="fine">${esc(t.common.platforms)} <a class="fine-link" href="${href('download')}">${esc(t.common.intel)}</a></p>
  </div>
  <div class="wrap demo-wrap">
    <div class="demo" role="img" aria-label="${esc(t.home.demo_label)}" data-demo='${esc(JSON.stringify({ q: t.home.demo_queries, r: t.home.demo_results, done: t.home.demo_done }))}'>
      <div class="demo-field">${ICON.search}<span class="demo-q" data-placeholder="${esc(t.home.demo_placeholder)}">${esc(t.home.demo_queries[0])}</span><span class="caret"></span></div>
      <div class="demo-sug"><span class="demo-cmd">${ICON.shrink}<b>${esc(t.home.demo_results[0].cmd)}</b><em>${esc(t.home.demo_results[0].detail)}</em></span></div>
      <div class="demo-row"><span class="demo-bar" aria-hidden="true"><i></i></span><span class="demo-file">${esc(t.home.demo_results[0].file)}</span><span class="demo-res">${esc(t.home.demo_results[0].result)}</span><span class="demo-ok">${ICON.check}${esc(t.home.demo_done)}</span></div>
    </div>
  </div>
  <div class="wrap">${shot(base, 'video', t.families.video.name, 'eager hero-shot')}</div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head"><h2>${esc(t.home.tools_h2)}</h2><p>${esc(t.home.tools_p)}</p></div>
    <div class="tabs" role="tablist">${fams.map((f, i) => `<button role="tab" id="tab-${f}" aria-controls="panel-${f}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${ICON[FAM_ICON[f]]}${esc(t.families[f].name)}</button>`).join('')}</div>
    ${fams.map((f, i) => `<div class="tab-panel" role="tabpanel" id="panel-${f}" aria-labelledby="tab-${f}"${i ? ' hidden' : ''}>
      <div class="tp-text"><h3>${esc(t.families[f].blurb)}</h3><ul class="tool-list">${t.families[f].items.map(([n, d]) => `<li><b>${esc(n)}</b><span>${esc(d)}</span></li>`).join('')}</ul></div>
      ${shot(base, FAM_IMG[f], t.families[f].name)}
    </div>`).join('')}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head"><h2>${esc(t.home.proof_h2)}</h2></div>
    <div class="proof">${t.home.proof.map((p) => `<div><span class="big">${esc(p.n)}</span><p>${esc(p.l)}</p></div>`).join('')}</div>
    <p class="fine">${esc(t.home.proof_note)}</p>
  </div>
</section>

<section class="sec">
  <div class="wrap privacy">
    <div class="sec-head"><h2>${esc(t.home.privacy_h2)}</h2><p>${esc(t.home.privacy_p)}</p></div>
    <dl class="facts">${t.home.facts.map((f) => `<div><dt>${ICON.check}${esc(f.t)}</dt><dd>${esc(f.d)}</dd></div>`).join('')}</dl>
  </div>
</section>

<section class="sec final">
  <div class="wrap"><div class="final-in">
    <img src="${base}img/icon-256.png" alt="" width="88" height="88">
    <h2>${esc(t.home.final_h2)}</h2>
    <p>${esc(t.home.final_p)}</p>
    <div class="cta">${dlButtons(t)}</div>
    <p class="fine"><a class="fine-link" href="${href('download')}">${esc(t.common.intel)}</a></p>
  </div>
  </div>
</section>`;
}

function features(L, t, base) {
  const fams = ['video', 'images', 'pdf', 'audio'];
  return `
<section class="page-hero"><div class="wrap"><h1>${esc(t.features.h1)}</h1><p class="lead">${esc(t.features.lead)}</p>
  <nav class="jump">${fams.map((f) => `<a href="#${f}">${ICON[FAM_ICON[f]]}${esc(t.families[f].name)}</a>`).join('')}</nav></div></section>
${fams.map((f, i) => `
<section class="sec fam" id="${f}"><div class="wrap fam-in ${i % 2 ? 'flip' : ''}">
  <div><h2>${ICON[FAM_ICON[f]]}${esc(t.families[f].name)}</h2><p class="lead">${esc(t.families[f].blurb)}</p>
  <ul class="tool-list">${t.families[f].items.map(([n, d]) => `<li><b>${esc(n)}</b><span>${esc(d)}</span></li>`).join('')}</ul></div>
  ${shot(base, FAM_IMG[f], t.families[f].name)}
</div></section>`).join('')}
<section class="sec"><div class="wrap"><div class="sec-head"><h2>${esc(t.features.everywhere_h2)}</h2></div>
  <div class="grid3">${t.features.everywhere.map(([n, d]) => `<div class="cell"><h3>${esc(n)}</h3><p>${esc(d)}</p></div>`).join('')}</div>
</div></section>
<section class="sec final"><div class="wrap"><div class="final-in"><h2>${esc(t.home.final_h2)}</h2><div class="cta">${dlButtons(t)}</div></div></div></section>`;
}

function download(L, t) {
  const d = t.download;
  return `
<section class="page-hero"><div class="wrap"><h1>${esc(d.h1)}</h1><p class="lead">${esc(d.lead)}</p>
  <p class="fine">${esc(t.common.version)} ${VERSION} · ${esc(t.common.released)}</p></div></section>
<section class="sec tight"><div class="wrap dl">
  <div class="dl-card" data-os="win">
    <h2>${ICON.windows}${esc(d.win)}</h2><p>${esc(d.win_req)}</p>
    <a class="btn btn-lg btn-primary" href="${releases}${FILES.win}">${ICON.down}${esc(d.win_btn)}</a>
    <ol class="steps">${d.first_win.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
  </div>
  <div class="dl-card" data-os="mac">
    <h2>${ICON.apple}${esc(d.mac)}</h2><p>${esc(d.mac_req)}</p>
    <div class="two"><a class="btn btn-lg btn-primary" href="${releases}${FILES.macArm}">${ICON.down}${esc(d.mac_silicon)}</a><a class="btn btn-lg btn-ghost" href="${releases}${FILES.macIntel}">${esc(d.mac_intel)}</a></div>
    <p class="fine">${esc(d.which_mac)}</p>
    <ol class="steps">${d.first_mac.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
  </div>
</div></section>
<section class="sec tight"><div class="wrap narrow">
  <h2>${esc(d.first_h2)}</h2><p>${esc(d.first_p)}</p>
  <h2>${esc(d.req_h2)}</h2>
  <table class="kv">${d.req.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>
  <h2>${esc(d.verify_h2)}</h2><p>${esc(d.verify_p)}</p>
  <table class="kv sums"><tr><th scope="row">${esc(d.win)}</th><td><code>${SUMS.win}</code></td></tr><tr><th scope="row">${esc(d.mac)} · ${esc(d.mac_silicon)}</th><td><code>${SUMS.macArm}</code></td></tr><tr><th scope="row">${esc(d.mac)} · ${esc(d.mac_intel)}</th><td><code>${SUMS.macIntel}</code></td></tr></table>
  <p><a class="link" href="${SITE.github}" rel="noopener">${ICON.github}${esc(d.source)}</a></p>
</div></section>`;
}

function changelog(L, t) {
  const c = t.changelog;
  return `
<section class="page-hero"><div class="wrap"><h1>${esc(c.h1)}</h1><p class="lead">${esc(c.lead)}</p></div></section>
<section class="sec tight"><div class="wrap narrow">${c.entries.map((e) => `
  <article class="release"><div class="rel-meta"><span class="ver">${esc(e.v)}</span><time>${esc(e.date)}</time></div>
  <div><h2>${esc(e.name)}</h2><ul>${e.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></article>`).join('')}
</div></section>`;
}

function faq(L, t) {
  return `
<section class="page-hero"><div class="wrap"><h1>${esc(t.faq.h1)}</h1></div></section>
<section class="sec tight"><div class="wrap narrow faq">${t.faq.items.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></section>`;
}

function about(L, t, base) {
  const a = t.about;
  return `
<section class="page-hero about-hero"><div class="wrap about-in">
  <div class="mono-mark" aria-hidden="true">EZ</div>
  <div><h1>${esc(a.h1)}</h1><p class="lead">${esc(a.lead)}</p>
  <div class="cta"><a class="btn btn-ghost" href="${SITE.github}" rel="noopener">${ICON.github}${esc(a.github)}</a></div></div>
</div></section>
<section class="sec tight"><div class="wrap narrow"><h2>${esc(a.why_h2)}</h2>${a.why.map((p) => `<p class="prose">${esc(p)}</p>`).join('')}</div></section>
<section class="sec tight"><div class="wrap"><div class="sec-head"><h2>${esc(a.rules_h2)}</h2></div>
  <dl class="facts">${a.rules.map(([k, v]) => `<div><dt>${ICON.check}${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div></section>
<section class="sec tight"><div class="wrap"><div class="sec-head"><h2>${esc(a.tech_h2)}</h2></div>
  <div class="grid3">${a.tech.map(([k, v]) => `<div class="cell"><h3>${esc(k)}</h3><p>${esc(v)}</p></div>`).join('')}</div></div></section>`;
}

function support(L, t) {
  const s = t.support;
  return `
<section class="page-hero"><div class="wrap"><h1>${esc(s.h1)}</h1></div></section>
<section class="sec tight"><div class="wrap two-col">
  <div class="panel"><h2>${esc(s.help_h2)}</h2><p>${esc(s.help_p)}</p><a class="btn btn-ghost" href="${SITE.github}/issues/new" rel="noopener">${ICON.github}${esc(s.help_btn)}</a></div>
  <div class="panel"><h2>${esc(s.give_h2)}</h2><p>${esc(s.give_p)}</p><div class="row"><a class="btn btn-primary" href="${SITE.tip}" rel="noopener">${ICON.heart}${esc(s.tip_btn)}</a><a class="btn btn-ghost" href="${SITE.github}" rel="noopener">${esc(s.star_btn)}</a></div></div>
</div></section>`;
}

function privacy(L, t) {
  const p = t.privacy;
  return `
<section class="page-hero"><div class="wrap"><h1>${esc(p.h1)}</h1><p class="fine">${esc(p.updated)}</p></div></section>
<section class="sec tight"><div class="wrap narrow"><p class="callout">${esc(p.short)}</p>${p.sections.map(([h, b]) => `<h2>${esc(h)}</h2><p class="prose">${esc(b)}</p>`).join('')}</div></section>`;
}

function notfound(L, t) {
  return `<section class="page-hero nf"><div class="wrap"><h1>${esc(t.notfound.h1)}</h1><p class="lead">${esc(t.notfound.p)}</p><a class="btn btn-primary" href="./">${esc(t.notfound.home)}</a></div></section>`;
}

// ---------- Guides (English, for search) ----------
const FAM_SHOT = { video: 'video', images: 'images', pdf: 'pdf-sign', audio: 'home' };
function guidePage(g) {
  const t = en;
  const others = GUIDES.filter((x) => x.slug !== g.slug).slice(0, 3);
  return `
<section class="page-hero guide-hero"><div class="wrap narrow">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="../">Filesmith</a><span>/</span><a href="./">Guides</a></nav>
  <h1>${esc(g.h1)}</h1>
  <div class="answer"><p>${esc(g.answer)}</p></div>
  <p class="fine">Updated ${new Date(UPDATED).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · Hollowbit</p>
  <div class="cta cta-left">${dlButtons(t)}</div>
</div></section>
<section class="sec tight"><div class="wrap narrow">
  <h2>Step by step</h2>
  <ol class="howto">${g.steps.map(([n, d]) => `<li><b>${esc(n)}</b><span>${esc(d)}</span></li>`).join('')}</ol>
  ${shot('../', FAM_SHOT[g.tool], `Filesmith ${g.tool} tool`)}
  ${g.sections.map(([h, b]) => `<h2>${esc(h)}</h2><p class="prose">${esc(b)}</p>`).join('')}
  <h2>Questions</h2>
  <div class="faq">${g.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
  <h2>More guides</h2>
  <ul class="guide-list">${others.map((x) => `<li><a href="${x.slug}.html"><b>${esc(x.h1)}</b><span>${esc(x.desc)}</span></a></li>`).join('')}</ul>
</div></section>`;
}
function guideIndex() {
  return `
<section class="page-hero"><div class="wrap"><h1>Guides</h1><p class="lead">Plain answers to everyday file problems, each done on your own computer for free.</p></div></section>
<section class="sec tight"><div class="wrap narrow"><ul class="guide-list">${GUIDES.map((x) => `<li><a href="${x.slug}.html"><b>${esc(x.h1)}</b><span>${esc(x.desc)}</span></a></li>`).join('')}</ul></div></section>`;
}
const guideLd = (g) => {
  const url = `${SITE.url}/guides/${g.slug}.html`;
  return [
    { '@context': 'https://schema.org', '@type': 'HowTo', name: g.h1, description: g.answer, totalTime: 'PT2M', tool: [{ '@type': 'HowToTool', name: 'Filesmith (free app for Windows and Mac)' }],
      step: g.steps.map(([n, d], i) => ({ '@type': 'HowToStep', position: i + 1, name: n, text: d, url: `${url}#step-${i + 1}` })) },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: g.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Filesmith', item: `${SITE.url}/` },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE.url}/guides/` },
      { '@type': 'ListItem', position: 3, name: g.h1, item: url }] },
    { '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.desc, dateModified: UPDATED, author: { '@type': 'Organization', name: 'Hollowbit' }, publisher: { '@type': 'Organization', name: 'Hollowbit' }, image: `${SITE.url}/og/og-en.png`, mainEntityOfPage: url },
  ];
};

// Per-page description and structured data.
const OPTS = {
  index: (t, L) => ({ jsonld: [APP_LD(t.meta.description, L.html)] }),
  features: (t) => ({ desc: t.features.lead }),
  download: (t, L) => ({ desc: `${t.download.h1} ${t.download.lead} ${t.common.platforms}`, jsonld: [APP_LD(t.meta.description, L.html)] }),
  changelog: (t) => ({ desc: t.changelog.lead }),
  faq: (t) => ({ desc: t.faq.items.slice(0, 3).map((x) => x[0]).join(' '), jsonld: [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: t.faq.items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }] }),
  about: (t) => ({ desc: t.about.lead }),
  support: (t) => ({ desc: t.support.help_p }),
  privacy: (t) => ({ desc: t.privacy.short }),
};

const RENDER = { index: home, features, download, changelog, faq, about, support, privacy };
const TITLE = (t, p) => (p === 'index' ? t.home.title : `${t[p].title} · Filesmith`);

// ---------- Build ----------
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const L of LANGS) {
  const t = load(L.code);
  const dir = L.code === 'en' ? out : path.join(out, L.code);
  fs.mkdirSync(dir, { recursive: true });
  const base = L.code === 'en' ? '' : '../';
  for (const p of PAGES) fs.writeFileSync(path.join(dir, `${p}.html`), layout(L, t, p, TITLE(t, p), RENDER[p](L, t, base), OPTS[p](t, L)));
}
fs.writeFileSync(path.join(out, '404.html'), layout(LANGS[0], en, '404', `${en.notfound.title} · Filesmith`, notfound(LANGS[0], en)).replace(/href="(?!https?:|#|\/)([^"]*)"/g, (m, h) => `href="/filesmith/${h.replace(/^\.\//, '')}"`).replace(/src="(?!https?:|\/)([^"]*)"/g, 'src="/filesmith/$1"'));
for (const f of ['style.css', 'site.js', 'favicon.png']) fs.copyFileSync(path.join(here, 'assets', f), path.join(out, f));
for (const d of ['img', 'fonts']) fs.cpSync(path.join(here, 'assets', d), path.join(out, d), { recursive: true });
fs.writeFileSync(path.join(out, '.nojekyll'), '');

// Guides
fs.mkdirSync(path.join(out, 'guides'), { recursive: true });
for (const g of GUIDES) {
  fs.writeFileSync(path.join(out, 'guides', `${g.slug}.html`), layout(LANGS[0], en, 'guides', `${g.title} · Filesmith`, guidePage(g), { prefix: '../', path: `guides/${g.slug}.html`, desc: g.desc, jsonld: guideLd(g), article: true }));
}
fs.writeFileSync(path.join(out, 'guides', 'index.html'), layout(LANGS[0], en, 'guides', 'Guides · Filesmith', guideIndex(), { prefix: '../', path: 'guides/', desc: 'Free guides: compress a video for Discord, open HEIC on Windows, sign, merge and compress PDFs, make GIFs. All done offline with Filesmith.' }));

// Sitemap, robots, llms.txt
const urlOf = (code, p) => `${SITE.url}/${code === 'en' ? '' : `${code}/`}${p === 'index' ? '' : `${p}.html`}`;
const sm = [];
for (const p of PAGES) for (const L of LANGS) {
  sm.push(`<url><loc>${urlOf(L.code, p)}</loc><lastmod>${UPDATED}</lastmod>${LANGS.map((a) => `<xhtml:link rel="alternate" hreflang="${a.html}" href="${urlOf(a.code, p)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${urlOf('en', p)}"/></url>`);
}
sm.push(`<url><loc>${SITE.url}/guides/</loc><lastmod>${UPDATED}</lastmod></url>`);
for (const g of GUIDES) sm.push(`<url><loc>${SITE.url}/guides/${g.slug}.html</loc><lastmod>${UPDATED}</lastmod></url>`);
fs.writeFileSync(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sm.join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(out, 'robots.txt'), `# Search engines and AI assistants are welcome.\nUser-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
fs.writeFileSync(path.join(out, 'llms.txt'), `# Filesmith

> Filesmith is a free, open-source desktop app for Windows and macOS that fixes everyday files offline: it compresses videos to a target size (for example under 10 MB for Discord), converts iPhone HEIC photos to JPG, signs, merges, splits and compresses PDFs, and converts and trims audio. Files are processed on the user's own computer and are never uploaded. Made by Hollowbit (Elvis Zygmanta). Licence: GPL-3.0. Current version: ${VERSION}.

## Key facts
- Price: free, no account, no watermark, no daily limits.
- Platforms: Windows 10 and 11 (64-bit), macOS 12 or newer (Apple Silicon and Intel).
- Privacy: all processing is local (FFmpeg, pdf-lib, PDF.js). No analytics. The only network request is an optional daily update check against GitHub.
- Languages: English, Spanish, French, German, Russian, Chinese.
- Video: compress to 8/10/16/25/50 MB or a custom size using two-pass encoding, trim, make GIFs, extract MP3, convert MOV/MKV/WEBM/AVI to MP4, remove sound.
- Images: convert HEIC, PNG, WebP, GIF, BMP, TIFF to JPG/PNG/WebP, resize, compress, images to PDF.
- PDF: sign and fill (drawn or typed signature, text, date), merge, split, reorder/rotate/delete pages, compress.
- Audio: convert MP3/M4A/WAV/FLAC/OGG, trim, normalise loudness to -14 LUFS.

## Links
- [Download](${SITE.url}/download.html)
- [Features](${SITE.url}/features.html)
- [FAQ](${SITE.url}/faq.html)
- [Privacy policy](${SITE.url}/privacy.html)
- [Source code](${SITE.github})

## Guides
${GUIDES.map((g) => `- [${g.h1}](${SITE.url}/guides/${g.slug}.html): ${g.answer}`).join('\n')}
`);
if (fs.existsSync(path.join(here, 'assets', 'og'))) fs.cpSync(path.join(here, 'assets', 'og'), path.join(out, 'og'), { recursive: true });
console.log(`Built ${LANGS.length} languages × ${PAGES.length} pages into docs/`);
