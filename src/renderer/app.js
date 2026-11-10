// Filesmith — the window: navigation, home, the video/image/audio tools, history, settings, support.
import { ICON, KINDS, kindOf, extOf, baseName, fmtBytes, fmtTime, fmtAgo, esc, el, savedLabel, toast, newId, makeSortable, segIndicator } from './ui.js';
import { renderPdf, addPdfFiles } from './pdf-tools.js';
import { CONFIG } from './config.js';
import { LANGS, setLang, pickLang, startTranslating, tr, currentLang } from './i18n.js';

const api = window.filesmith;
const view = document.getElementById('view');

export const S = {
  view: 'home',
  settings: {}, history: [], stats: { files: 0, bytesSaved: 0 }, platform: 'darwin', version: '',
  queues: { video: [], image: [], audio: [] },
  selected: { video: null, image: null, audio: null },
  action: { video: 'compress', image: 'convert', audio: 'convert' },
  opts: {
    video: { mode: 'size', targetMB: 10, quality: 'medium', start: 0, end: 0, mute: false, fps: 15, width: 480 },
    image: { format: 'jpg', quality: 82, resizeMode: 'side', percent: 50, maxSize: 1920, keepFormat: true },
    audio: { format: 'mp3', bitrate: 192, start: 0, end: 0, keepFormat: false },
  },
  running: false,
};

const TOOLS = {
  video: {
    title: 'Video', icon: 'video', sub: 'Shrink videos for Discord or email, trim them, make GIFs.',
    actions: [
      { id: 'compress', label: 'Compress', icon: 'shrink' },
      { id: 'trim', label: 'Trim', icon: 'scissors', single: true },
      { id: 'gif', label: 'Make GIF', icon: 'gif', single: true },
      { id: 'audio', label: 'Extract audio', icon: 'music' },
      { id: 'convert', label: 'Convert to MP4', icon: 'film' },
      { id: 'mute', label: 'Remove sound', icon: 'mute' },
    ],
  },
  image: {
    title: 'Images', icon: 'image', sub: 'Convert iPhone photos, resize and compress, hundreds at a time.',
    actions: [
      { id: 'convert', label: 'Convert', icon: 'swap' },
      { id: 'resize', label: 'Resize', icon: 'resize' },
      { id: 'compress', label: 'Compress', icon: 'shrink' },
      { id: 'topdf', label: 'Make a PDF', icon: 'pdf' },
    ],
  },
  audio: {
    title: 'Audio', icon: 'audio', sub: 'Convert, cut and fix the volume of songs, voice notes and podcasts.',
    actions: [
      { id: 'convert', label: 'Convert', icon: 'swap' },
      { id: 'trim', label: 'Trim', icon: 'scissors', single: true },
      { id: 'normalize', label: 'Even out volume', icon: 'louder' },
    ],
  },
};

const NAV = [
  { id: 'home', label: 'Home', icon: 'home' },
  { section: 'Tools' },
  { id: 'video', label: 'Video', icon: 'video', c: 'var(--video)' },
  { id: 'image', label: 'Images', icon: 'image', c: 'var(--image)' },
  { id: 'pdf', label: 'PDF', icon: 'pdf', c: 'var(--pdf)' },
  { id: 'audio', label: 'Audio', icon: 'audio', c: 'var(--audio)' },
  { section: 'Filesmith' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

// ---------- Shell ----------

function renderNav() {
  const nav = document.getElementById('nav');
  nav.innerHTML = NAV.map((n) => n.section
    ? `<div class="nav-label">${n.section}</div>`
    : `<button class="nav-item ${S.view === n.id ? 'active' : ''}" data-go="${n.id}">
         ${ICON[n.icon]}${n.label}
         ${S.queues[n.id] && S.queues[n.id].length ? `<span class="count">${S.queues[n.id].length}</span>` : ''}
       </button>`).join('');
}

const mainEl = document.getElementById('main');
export function go(id) {
  const swap = () => { S.view = id; renderNav(); render(); mainEl.scrollTop = 0; };
  // Crossfade between sections where supported; instant otherwise.
  if (document.startViewTransition && S.view !== id) document.startViewTransition(swap); else swap();
}

document.addEventListener('click', (e) => {
  const g = e.target.closest('[data-go]');
  if (g) { go(g.dataset.go); return; }
  const ext = e.target.closest('[data-href]');
  if (ext) api.openExternal(ext.dataset.href);
});

export function render() {
  if (S.view === 'home') return renderHome();
  if (S.view === 'pdf') return renderPdf(view);
  if (TOOLS[S.view]) return renderTool(S.view);
  if (S.view === 'history') return renderHistory();
  if (S.view === 'settings') return renderSettings();
  if (S.view === 'support') return renderSupport();
}

export async function refreshState() {
  const st = await api.getState();
  Object.assign(S, { settings: st.settings, history: st.history, stats: st.stats, platform: st.platform, version: st.version });
  applyTheme();
}

function applyTheme() {
  const t = S.settings.theme || 'dark';
  const dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

// Native sidebar material exists on macOS and Windows 11; elsewhere the sidebar is solid.
(function platformSetup() {
  const root = document.documentElement;
  root.dataset.platform = api.platform;
  const winBuild = /Windows NT 10/.test(navigator.userAgent);
  if (api.platform === 'darwin' || (api.platform === 'win32' && winBuild)) root.dataset.material = '';
  document.getElementById('kbd-hint').textContent = api.platform === 'darwin' ? '⌘K' : 'Ctrl K';
  api.onFullscreen((on) => { if (on) root.dataset.fullscreen = ''; else delete root.dataset.fullscreen; });
})();

// ---------- Adding files ----------

export async function addFiles(paths, preferred) {
  const groups = { video: [], image: [], audio: [], pdf: [] };
  const skipped = [];
  for (const p of paths) {
    const k = kindOf(p);
    if (k) groups[k].push(p); else skipped.push(baseName(p));
  }
  if (skipped.length) toast(`Filesmith can't open ${esc(skipped.slice(0, 3).join(', '))}${skipped.length > 3 ? ` and ${skipped.length - 3} more` : ''}.`, 'bad');
  const order = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);
  let target = preferred && groups[preferred]?.length ? preferred : order[0];
  if (!groups[target].length) return;
  // Images dropped on the PDF page become pages of a new PDF.
  if (S.view === 'pdf' && groups.image.length && !groups.pdf.length) {
    await addPdfFiles(groups.image, 'images');
    renderNav();
    return renderPdf(view);
  }
  for (const k of ['video', 'image', 'audio']) {
    for (const p of groups[k]) {
      if (S.queues[k].some((q) => q.path === p)) continue;
      const st = await api.stat(p);
      const item = { id: newId(), path: p, name: baseName(p), size: st ? st.size : 0, status: 'ready', pct: 0, fresh: true };
      S.queues[k].push(item);
      if (k !== 'image') api.probe(p).then((info) => { item.info = info; if (S.view === k) renderQueue(k); if (S.selected[k] === item.id && S.view === k) renderPreview(k); });
    }
    if (groups[k].length && !S.selected[k]) S.selected[k] = S.queues[k][0]?.id;
  }
  if (groups.pdf.length) await addPdfFiles(groups.pdf);
  const other = order.filter((k) => k !== target && groups[k].length);
  if (other.length) toast(`Also added ${other.map((k) => `${groups[k].length} ${KINDS[k].label.toLowerCase()}`).join(' and ')}.`);
  go(target);
}

async function pickFor(kind) {
  const filters = kind ? [{ name: KINDS[kind].label, extensions: KINDS[kind].exts }] : [{ name: 'Files Filesmith can open', extensions: Object.values(KINDS).flatMap((k) => k.exts) }];
  const files = await api.pickFiles({ filters });
  if (files.length) addFiles(files, kind);
}

// Drop anywhere in the window.
const overlay = document.getElementById('drop-overlay');
let dragDepth = 0;
const isFileDrag = (e) => [...(e.dataTransfer?.types || [])].includes('Files');
window.addEventListener('dragenter', (e) => { if (!isFileDrag(e)) return; dragDepth++; overlay.classList.add('show'); });
window.addEventListener('dragleave', (e) => { if (!isFileDrag(e)) return; dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) overlay.classList.remove('show'); });
window.addEventListener('dragover', (e) => { if (isFileDrag(e)) e.preventDefault(); });
window.addEventListener('drop', (e) => {
  if (!isFileDrag(e)) return;
  e.preventDefault();
  dragDepth = 0;
  overlay.classList.remove('show');
  const paths = [...e.dataTransfer.files].map((f) => api.pathFor(f)).filter(Boolean);
  if (paths.length) addFiles(paths, TOOLS[S.view] || S.view === 'pdf' ? S.view : null);
});

// ---------- Home ----------

// Every outcome Filesmith can do, in the words people use. Drives the home field and the Cmd/Ctrl+K palette.
const setV = (a, extra) => () => { S.action.video = a; if (extra) Object.assign(S.opts.video, extra); };
const setI = (a, extra) => () => { S.action.image = a; if (extra) Object.assign(S.opts.image, extra); };
const setA = (a, extra) => () => { S.action.audio = a; if (extra) Object.assign(S.opts.audio, extra); };
const setP = (a) => () => { window.__pdfAction = a; };
const COMMANDS = [
  { t: 'Compress a video for Discord', d: 'under 10 MB', icon: 'shrink', k: 'video', kw: 'discord 10mb shrink small size reduce smaller', set: setV('compress', { mode: 'size', targetMB: 10 }) },
  { t: 'Compress a video for email', d: 'under 25 MB', icon: 'shrink', k: 'video', kw: 'email gmail 25mb attach shrink', set: setV('compress', { mode: 'size', targetMB: 25 }) },
  { t: 'Compress a video for WhatsApp', d: 'under 16 MB', icon: 'shrink', k: 'video', kw: 'whatsapp 16mb shrink', set: setV('compress', { mode: 'size', targetMB: 16 }) },
  { t: 'Convert iPhone photos to JPG', d: 'HEIC to JPG', icon: 'swap', k: 'image', kw: 'heic heif iphone jpg jpeg convert photo', set: setI('convert', { format: 'jpg' }) },
  { t: 'Sign a PDF', d: 'draw or type a signature', icon: 'pen', k: 'pdf', kw: 'sign signature fill date name contract form', set: setP('sign') },
  { t: 'Merge PDFs', d: 'combine files', icon: 'merge', k: 'pdf', kw: 'merge combine join pdf', set: setP('merge') },
  { t: 'Trim a video', d: 'keep one part', icon: 'scissors', k: 'video', kw: 'trim cut clip shorten video', set: setV('trim') },
  { t: 'Make a GIF from a video', d: '2–6 seconds', icon: 'gif', k: 'video', kw: 'gif meme animated', set: setV('gif') },
  { t: 'Extract audio from a video', d: 'save as MP3', icon: 'music', k: 'video', kw: 'mp3 audio sound extract rip', set: setV('audio') },
  { t: 'Convert a video to MP4', d: 'MOV, MKV, WEBM, AVI', icon: 'film', k: 'video', kw: 'mp4 mov mkv webm avi convert', set: setV('convert') },
  { t: 'Remove sound from a video', d: 'keep the picture', icon: 'mute', k: 'video', kw: 'mute silent remove sound audio', set: setV('mute') },
  { t: 'Resize images', d: 'by size or %', icon: 'resize', k: 'image', kw: 'resize scale smaller dimensions pixels', set: setI('resize') },
  { t: 'Compress images', d: 'smaller files', icon: 'shrink', k: 'image', kw: 'compress image photo smaller shrink', set: setI('compress') },
  { t: 'Convert images', d: 'JPG, PNG or WebP', icon: 'swap', k: 'image', kw: 'png webp jpg convert format', set: setI('convert') },
  { t: 'Turn images into a PDF', d: 'one page each', icon: 'pdf', k: 'pdf', kw: 'images to pdf scan photos pdf', set: setP('images') },
  { t: 'Split a PDF', d: 'pages or ranges', icon: 'split', k: 'pdf', kw: 'split separate extract pages', set: setP('split') },
  { t: 'Compress a PDF', d: 'for email and portals', icon: 'shrink', k: 'pdf', kw: 'compress pdf smaller shrink upload portal', set: setP('compress') },
  { t: 'Reorder, rotate or delete PDF pages', d: 'organize', icon: 'stack', k: 'pdf', kw: 'rotate delete reorder organize pages', set: setP('organize') },
  { t: 'Convert audio', d: 'MP3, M4A, WAV, FLAC', icon: 'swap', k: 'audio', kw: 'mp3 wav m4a flac ogg convert audio', set: setA('convert') },
  { t: 'Trim audio', d: 'ringtones, voice notes', icon: 'scissors', k: 'audio', kw: 'trim cut ringtone voice memo audio', set: setA('trim') },
  { t: 'Even out audio volume', d: 'quiet or loud recordings', icon: 'louder', k: 'audio', kw: 'louder volume normalize quiet loud', set: setA('normalize') },
  { t: 'History', d: 'everything Filesmith made', icon: 'history', go: 'history', kw: 'history recent files' },
  { t: 'Settings', d: 'output folder, appearance', icon: 'settings', go: 'settings', kw: 'settings preferences folder theme dark light' },
];
const HOME_DEFAULT = [0, 3, 4, 5, 7, 8];

function matchCommands(q) {
  q = q.trim().toLowerCase();
  if (!q) return HOME_DEFAULT.map((i) => COMMANDS[i]);
  const words = q.split(/\s+/);
  return COMMANDS
    .map((c) => {
      const hay = `${c.t} ${c.d} ${c.kw} ${tr(c.t)} ${tr(c.d)}`.toLowerCase();
      let score = 0;
      for (const w of words) { if (hay.includes(w)) score += c.t.toLowerCase().includes(w) ? 2 : 1; else return null; }
      return { c, score };
    })
    .filter(Boolean).sort((a, b) => b.score - a.score).map((x) => x.c);
}

function runCommand(c) {
  if (c.go) { go(c.go); return; }
  c.set();
  go(c.k);
  if (c.k !== 'pdf' && !S.queues[c.k].length) pickFor(c.k);
}

// A command field with its suggestion list; shared by Home and the palette.
function commandField(root, { autofocus, onDone }) {
  const input = root.querySelector('input');
  const list = root.querySelector('.suggest');
  let items = []; let sel = 0;
  const draw = () => {
    items = matchCommands(input.value).slice(0, 8);
    sel = Math.min(sel, Math.max(0, items.length - 1));
    list.innerHTML = items.length
      ? items.map((c, i) => `<button class="sug ${i === sel ? 'sel' : ''}" data-i="${i}">${ICON[c.icon]}<span><span class="t">${esc(c.t)}</span><span class="d">${esc(c.d)}</span></span><span class="k">${c.k ? KINDS[c.k].label : ''}</span></button>`).join('')
      : `<div class="sug-empty">No match. Try "compress", "jpg", "sign" or "gif".</div>`;
  };
  input.addEventListener('input', () => { sel = 0; draw(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); draw(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); draw(); }
    else if (e.key === 'Enter' && items[sel]) { e.preventDefault(); if (onDone) onDone(); runCommand(items[sel]); }
  });
  list.addEventListener('mousemove', (e) => { const b = e.target.closest('.sug'); if (b && +b.dataset.i !== sel) { sel = +b.dataset.i; list.querySelectorAll('.sug').forEach((x, i) => x.classList.toggle('sel', i === sel)); } });
  list.addEventListener('click', (e) => { const b = e.target.closest('.sug'); if (!b) return; if (onDone) onDone(); runCommand(items[+b.dataset.i]); });
  draw();
  if (autofocus) input.focus();
}

const SEARCH_SVG = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.3-4.3"/></svg>';

function openPalette() {
  if (document.querySelector('.palette')) return;
  const back = el(`<div class="modal-back"><div class="modal palette" role="dialog" aria-label="Search actions">
    <div class="cmd">${SEARCH_SVG}<input type="text" placeholder="What do you want to do?" aria-label="What do you want to do?"></div>
    <div class="suggest"></div>
    <div class="foot"><span><kbd>↑</kbd> <kbd>↓</kbd> choose</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div>
  </div></div>`);
  const close = () => { back.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  back.addEventListener('mousedown', (e) => { if (e.target === back) close(); });
  document.addEventListener('keydown', onKey);
  document.getElementById('modal-root').appendChild(back);
  commandField(back.querySelector('.palette'), { autofocus: true, onDone: close });
}
document.getElementById('open-palette').addEventListener('click', openPalette);
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); }
});

function renderHome() {
  const recent = S.history.slice(0, 6);
  view.innerHTML = `
  <div class="page home"><div class="home-inner">
    <h1>What do you want to do?</h1>
    <div class="cmd-wrap">
      <div class="cmd">${SEARCH_SVG}<input type="text" id="home-q" placeholder="Compress a video, convert a photo, sign a PDF…" aria-label="What do you want to do?"><kbd>${api.platform === 'darwin' ? '⌘K' : 'Ctrl K'}</kbd></div>
      <div class="suggest"></div>
    </div>
    <p class="home-drop">Or drop files anywhere in the window. <button class="btn sm" id="choose">Choose files…</button></p>

    <h2>Recent</h2>
    <div class="card">
      ${recent.length ? recent.map(historyRow).join('') : '<div class="empty">Files you make show up here, with how much space each one saved.</div>'}
    </div>
    <p class="totals"><b>${S.stats.files.toLocaleString()}</b> files made · <b>${fmtBytes(S.stats.bytesSaved) || '0 B'}</b> saved · <b>0 bytes</b> uploaded</p>
  </div></div>`;
  commandField(view.querySelector('.cmd-wrap'), { autofocus: true });
  view.querySelector('#choose').addEventListener('click', () => pickFor(null));
  bindHistoryRows(view);
}

function historyRow(h) {
  return `<div class="hist-row">
    <div class="ftype">${esc(extOf(h.output))}</div>
    <div class="grow"><div class="name">${esc(h.name)}</div><div class="meta">${savedLabel(h.before, h.after)}</div></div>
    <span class="when">${fmtAgo(h.at)}</span>
    <span class="row" style="gap:2px"><button class="icon-btn" title="Open" aria-label="Open" data-open="${esc(h.output)}">${ICON.open}</button><button class="icon-btn" title="Show in folder" aria-label="Show in folder" data-show="${esc(h.output)}">${ICON.folder}</button></span>
  </div>`;
}
function bindHistoryRows(root) {
  root.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => api.openFile(b.dataset.open)));
  root.querySelectorAll('[data-show]').forEach((b) => b.addEventListener('click', () => api.showInFolder(b.dataset.show)));
}

// ---------- Video / Image / Audio tools ----------

function currentAction(k) { return TOOLS[k].actions.find((a) => a.id === S.action[k]) || TOOLS[k].actions[0]; }
function selectedItem(k) { return S.queues[k].find((q) => q.id === S.selected[k]) || S.queues[k][0]; }

function renderTool(k) {
  const t = TOOLS[k];
  view.innerHTML = `
  <div class="page">
    <div class="page-head"><div><h1>${t.title}</h1><p class="sub">${t.sub}</p></div>
      <button class="btn" id="add-files">${ICON.plus}Add ${KINDS[k].label.toLowerCase()}</button></div>
    <div class="seg" id="seg">${t.actions.map((a) => `<button data-act="${a.id}" class="${S.action[k] === a.id ? 'on' : ''}">${ICON[a.icon]}${a.label}</button>`).join('')}</div>
    <div class="tool-grid">
      <div>
        <div id="preview"></div>
        <div id="queue"></div>
      </div>
      <div class="panel" id="opts"></div>
    </div>
  </div>`;
  view.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => {
    if (S.running) return;
    if (k === 'image' && b.dataset.act === 'topdf') {
      const imgs = S.queues.image.map((q) => q.path);
      window.__pdfAction = 'images';
      if (imgs.length) addPdfFiles(imgs, 'images').then(() => go('pdf')); else go('pdf');
      return;
    }
    S.action[k] = b.dataset.act;
    view.querySelectorAll('[data-act]').forEach((x) => x.classList.toggle('on', x === b));
    segIndicator(view.querySelector('#seg'), `seg-${k}`);
    renderPreview(k); renderQueue(k); renderOpts(k);
  }));
  view.querySelector('#add-files').addEventListener('click', () => pickFor(k));
  segIndicator(view.querySelector('#seg'), `seg-${k}`);
  renderPreview(k); renderQueue(k); renderOpts(k);
}

function thumbFor(k, q) {
  if (k === 'image' && !/\.(heic|heif|tif|tiff)$/i.test(q.path)) return `<div class="thumb" style="background-image:url('${api.fileUrl(q.path)}')"></div>`;
  return `<div class="thumb">${ICON[k === 'video' ? 'film' : k === 'audio' ? 'music' : 'image']}</div>`;
}

function itemMeta(k, q) {
  const bits = [fmtBytes(q.size)];
  if (q.info) {
    if (q.info.duration) bits.push(fmtTime(q.info.duration).replace(/\.\d$/, ''));
    if (k === 'video' && q.info.height) bits.push(`${q.info.width}×${q.info.height}`);
  }
  return bits.filter(Boolean).join(' · ');
}

// Status reads from its icon and words, never colour alone.
function statusHtml(q) {
  if (q.status === 'running') return `${ICON.spin}<span>${Math.round(q.pct)}%</span>`;
  if (q.status === 'done') return `${ICON.check}<span>Done</span>`;
  if (q.status === 'skipped') return `${ICON.dash}<span>${esc(q.note || 'Skipped')}</span>`;
  if (q.status === 'failed') return `${ICON.alert}<span>${esc(q.error || 'Failed')}</span>`;
  return `${ICON.circle}<span>${S.running ? 'Waiting' : 'Ready'}</span>`;
}

// Before and after drawn to scale against the biggest file in the list.
function sizesHtml(it, max) {
  const w = (n) => `${Math.max(2, Math.round((n / max) * 100))}%`;
  if (it.result && it.result.after) {
    return `<div class="sizes"><i style="width:${w(it.size)}"></i><i class="after" style="width:${w(it.result.after)}"></i><span>${fmtBytes(it.size)} → ${fmtBytes(it.result.after)}</span></div>`;
  }
  return `<div class="sizes"><i style="width:${w(it.size)}"></i><span>${fmtBytes(it.size)}</span></div>`;
}

function rowHtml(k, it, idx, picked, max) {
  return `
        <div class="qitem ${it.status} ${picked ? 'picked' : ''} ${it.fresh ? 'enter' : ''} ${it.flash || ''}" data-id="${it.id}" style="--i:${Math.min(idx, 8)}">
          ${thumbFor(k, it)}
          <div class="grow"><div class="name">${esc(it.name)}</div><div class="meta">${itemMeta(k, it)}</div></div>
          ${sizesHtml(it, max)}
          <div class="status">${statusHtml(it)}</div>
          <div class="actions">
            ${it.result ? `<button class="icon-btn" title="Open" aria-label="Open" data-open="${esc(it.result.output)}">${ICON.open}</button><button class="icon-btn" title="Show in folder" aria-label="Show in folder" data-show="${esc(it.result.output)}">${ICON.folder}</button>` : ''}
            ${S.running ? '' : `<button class="icon-btn" title="Remove" aria-label="Remove" data-rm="${it.id}">${ICON.x}</button>`}
          </div>
          <div class="bar" style="width:${it.status === 'done' ? 100 : it.pct || 0}%"></div>
        </div>`;
}

// Updates one row in place, so animations on other rows keep playing.
function updateRow(k, it) {
  const old = view.querySelector(`.qitem[data-id="${it.id}"]`);
  if (!old) return renderQueue(k);
  const q = S.queues[k];
  const max = Math.max(...q.map((x) => x.size || 1));
  const single = currentAction(k).single;
  const sel = selectedItem(k);
  const row = el(rowHtml(k, it, 0, single && sel && sel.id === it.id, max));
  old.replaceWith(row);
  it.flash = '';
  bindHistoryRows(row);
}

function renderQueue(k) {
  const box = view.querySelector('#queue');
  if (!box) return;
  const q = S.queues[k];
  const single = currentAction(k).single;
  if (!q.length) {
    box.innerHTML = `<div class="dropzone"><b>No ${KINDS[k].label.toLowerCase()} yet</b>Drop files anywhere in the window, or choose them.<br><span class="meta">${KINDS[k].exts.map((e) => e.toUpperCase()).join(', ')}</span><br><button class="btn" id="dz">Choose ${KINDS[k].label.toLowerCase()}…</button></div>`;
    box.querySelector('#dz').addEventListener('click', () => pickFor(k));
    return;
  }
  const sel = selectedItem(k);
  const max = Math.max(...q.map((x) => x.size || 1));
  box.innerHTML = `
    <div class="table-head">
      <span class="meta">${q.length} file${q.length > 1 ? 's' : ''} · ${fmtBytes(q.reduce((a, b) => a + b.size, 0))}${single && q.length > 1 ? ' · click a file to choose it' : ''}</span>
      <button class="btn ghost sm" id="clear">Clear all</button>
    </div>
    <div class="queue">
      ${q.map((it, idx) => rowHtml(k, it, idx, single && sel && sel.id === it.id, max)).join('')}
      <button class="add-more" id="dz">${ICON.plus}Add more</button>
    </div>`;
  q.forEach((it) => { it.fresh = false; it.flash = ''; });
  box.querySelector('#dz').addEventListener('click', () => pickFor(k));
  box.querySelector('#clear').addEventListener('click', () => { if (S.running) return; S.queues[k] = []; S.selected[k] = null; renderNav(); renderTool(k); });
  box.querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    S.queues[k] = S.queues[k].filter((x) => x.id !== b.dataset.rm);
    if (S.selected[k] === b.dataset.rm) S.selected[k] = S.queues[k][0]?.id || null;
    renderNav(); renderPreview(k); renderQueue(k); renderOpts(k);
  }));
  box.querySelectorAll('.qitem').forEach((row) => row.addEventListener('click', (e) => {
    if (e.target.closest('button') || S.running) return;
    if (S.selected[k] === row.dataset.id) return;
    S.selected[k] = row.dataset.id;
    if (single) { renderPreview(k); renderQueue(k); renderOpts(k); }
  }));
  bindHistoryRows(box);
}

// Preview + trim handles, for the actions that work on one file.
function renderPreview(k) {
  const box = view.querySelector('#preview');
  if (!box) return;
  const act = currentAction(k);
  const it = selectedItem(k);
  if (!act.single || !it) { box.innerHTML = ''; return; }
  const o = S.opts[k];
  const dur = it.info?.duration || 0;
  if (it.trimFor !== act.id) {
    o.start = 0;
    o.end = act.id === 'gif' ? Math.min(dur, 5) : dur;
    it.trimFor = dur ? act.id : null;
  }
  const media = k === 'video'
    ? `<div class="preview"><video id="media" src="${api.fileUrl(it.path)}" controls preload="metadata"></video></div>`
    : `<div class="preview audio"><audio id="media" src="${api.fileUrl(it.path)}" controls preload="metadata"></audio></div>`;
  box.innerHTML = `${media}
    <div class="panel trim-panel">
      <div class="trim"><div class="track"></div><div class="sel" id="sel"></div>
        <input type="range" id="r-start" min="0" max="${dur}" step="0.05" value="${o.start}">
        <input type="range" id="r-end" min="0" max="${dur}" step="0.05" value="${o.end}">
      </div>
      <div class="times"><span>Start <b id="t-start">${fmtTime(o.start)}</b></span><span>Length <b id="t-len">${fmtTime(o.end - o.start)}</b></span><span>End <b id="t-end">${fmtTime(o.end)}</b></span></div>
      <div class="row" style="margin-top:10px;gap:6px">
        <button class="btn sm" id="set-start">Start here</button>
        <button class="btn sm" id="set-end">End here</button>
        <button class="btn sm ghost" id="play-sel">Play selection</button>
      </div>
    </div>`;
  const media$ = box.querySelector('#media');
  const rs = box.querySelector('#r-start');
  const re = box.querySelector('#r-end');
  const update = (src) => {
    let a = +rs.value; let b = +re.value;
    if (a > b - 0.1) { if (src === rs) a = Math.max(0, b - 0.1); else b = Math.min(dur, a + 0.1); }
    rs.value = a; re.value = b;
    o.start = a; o.end = b;
    const d = dur || 1;
    const sel = box.querySelector('#sel');
    sel.style.left = `${(a / d) * 100}%`;
    sel.style.width = `${((b - a) / d) * 100}%`;
    box.querySelector('#t-start').textContent = fmtTime(a);
    box.querySelector('#t-end').textContent = fmtTime(b);
    box.querySelector('#t-len').textContent = fmtTime(b - a);
    if (src) media$.currentTime = src === rs ? a : b;
    const warn = view.querySelector('#gif-warn');
    if (warn) warn.style.display = b - a > 15 ? 'block' : 'none';
  };
  rs.addEventListener('input', () => update(rs));
  re.addEventListener('input', () => update(re));
  box.querySelector('#set-start').addEventListener('click', () => { rs.value = media$.currentTime; update(rs); });
  box.querySelector('#set-end').addEventListener('click', () => { re.value = media$.currentTime; update(re); });
  let stopAt = null;
  box.querySelector('#play-sel').addEventListener('click', () => { media$.currentTime = o.start; stopAt = o.end; media$.play(); });
  media$.addEventListener('timeupdate', () => { if (stopAt != null && media$.currentTime >= stopAt) { media$.pause(); stopAt = null; } });
  media$.addEventListener('loadedmetadata', () => {
    // The browser's duration is more exact than the probe; use it if the probe failed.
    if (!dur && media$.duration && isFinite(media$.duration)) {
      it.info = { ...(it.info || {}), duration: media$.duration };
      it.trimFor = null;
      renderPreview(k);
    }
  });
  update();
}

function chips(key, k, list, current) {
  return `<div class="chips" data-key="${key}">${list.map(([v, label, hint]) => `<button class="chip-opt ${String(current) === String(v) ? 'on' : ''}" data-v="${v}">${label}${hint ? ` <small>${hint}</small>` : ''}</button>`).join('')}</div>`;
}

function renderOpts(k) {
  const box = view.querySelector('#opts');
  if (!box) return;
  const a = currentAction(k).id;
  const o = S.opts[k];
  let html = '';

  if (k === 'video') {
    if (a === 'compress') {
      html = `<h3>Compress video</h3><p class="hint">Pick a size limit and Filesmith squeezes each video just under it.</p>
        <div class="field"><span class="field-label">Aim for</span>${chips('mode', k, [['size', 'A file size'], ['quality', 'A quality level']], o.mode)}</div>
        ${o.mode === 'size' ? `
          <div class="field"><span class="field-label">Size limit</span>${chips('targetMB', k, [[8, '8 MB'], [10, '10 MB', 'Discord'], [16, '16 MB', 'WhatsApp'], [25, '25 MB', 'Email'], [50, '50 MB']], o.targetMB)}</div>
          <div class="field"><label>Or type your own (MB)</label><input type="number" id="custom-mb" min="1" max="4000" value="${o.targetMB}"></div>
          <div class="note">Long videos get a lower resolution so they still fit. Videos already under the limit are skipped.</div>`
        : `<div class="field"><span class="field-label">Quality</span>${chips('quality', k, [['high', 'High'], ['medium', 'Balanced'], ['small', 'Smallest']], o.quality)}</div>
           <div class="note"><b>Balanced</b> usually cuts phone videos by 60–80% and still looks great.</div>`}`;
    } else if (a === 'trim') {
      html = `<h3>Trim video</h3><p class="hint">Drag the handles under the video to keep only the part you want.</p>
        <label class="check"><input type="checkbox" id="mute" ${o.mute ? 'checked' : ''}> Remove the sound too</label>`;
    } else if (a === 'gif') {
      html = `<h3>Make a GIF</h3><p class="hint">Pick a short moment under the video. 2–6 seconds works best.</p>
        <div class="field"><span class="field-label">Smoothness</span>${chips('fps', k, [[10, '10 fps'], [15, '15 fps'], [24, '24 fps']], o.fps)}</div>
        <div class="field"><span class="field-label">Width</span>${chips('width', k, [[320, '320 px', 'tiny'], [480, '480 px'], [640, '640 px'], [800, '800 px', 'big']], o.width)}</div>
        <div class="note" id="gif-warn" style="display:none">GIFs longer than 15 seconds get huge. Try a shorter clip.</div>`;
    } else if (a === 'audio') {
      html = `<h3>Extract audio</h3><p class="hint">Saves the sound from each video as an MP3 (192 kbps).</p><div class="note">Handy for songs, lectures and voice clips.</div>`;
    } else if (a === 'convert') {
      html = `<h3>Convert to MP4</h3><p class="hint">Turns MOV, MKV, WEBM, AVI and iPhone videos into MP4, which plays on everything.</p><div class="note">Uses high quality, so files may stay big. Use <b>Compress</b> to shrink them.</div>`;
    } else if (a === 'mute') {
      html = `<h3>Remove sound</h3><p class="hint">Keeps the picture exactly as it is and drops the audio. Takes a second.</p>`;
    }
  }

  if (k === 'image') {
    const fmtChips = (withSame) => chips('format', k, [...(withSame ? [['same', 'Same as original']] : []), ['jpg', 'JPG'], ['png', 'PNG'], ['webp', 'WebP']], o.format);
    if (a === 'convert') {
      if (o.format === 'same') o.format = 'jpg';
      html = `<h3>Convert images</h3><p class="hint">Works on iPhone HEIC photos, PNG, WebP, GIF, BMP and TIFF.</p>
        <div class="field"><span class="field-label">Convert to</span>${fmtChips(false)}</div>
        ${qualityField(o)}
        <div class="note"><b>JPG</b> works everywhere. <b>PNG</b> keeps transparency. <b>WebP</b> is smallest for websites.</div>`;
    } else if (a === 'resize') {
      html = `<h3>Resize images</h3><p class="hint">Make photos smaller in pixels. Images never get stretched or made bigger.</p>
        <div class="field"><span class="field-label">How</span>${chips('resizeMode', k, [['side', 'Longest side'], ['percent', 'Percentage']], o.resizeMode)}</div>
        ${o.resizeMode === 'side'
          ? `<div class="field"><span class="field-label">Longest side</span>${chips('maxSize', k, [[720, '720'], [1080, '1080'], [1920, '1920'], [2560, '2560'], [3840, '3840']], o.maxSize)}</div>`
          : `<div class="field"><label>Scale to <b id="pct-v">${o.percent}%</b></label><input type="range" id="pct" min="5" max="95" step="5" value="${o.percent}"></div>`}
        <div class="field"><span class="field-label">Save as</span>${fmtChips(true)}</div>
        ${o.format !== 'png' && o.format !== 'same' ? qualityField(o) : ''}`;
    } else if (a === 'compress') {
      html = `<h3>Compress images</h3><p class="hint">Smaller files that look the same. Great before emailing or uploading.</p>
        ${qualityField(o, 'Strength')}
        <div class="field"><span class="field-label">Save as</span>${fmtChips(true)}</div>
        <div class="note">PNG screenshots shrink the most when saved as <b>JPG</b> or <b>WebP</b>.</div>`;
    }
  }

  if (k === 'audio') {
    const formats = [['mp3', 'MP3'], ['m4a', 'M4A'], ['wav', 'WAV'], ['flac', 'FLAC'], ['ogg', 'OGG']];
    const withSame = a !== 'convert';
    if (!withSame && o.format === 'same') o.format = 'mp3';
    const fmtField = `<div class="field"><span class="field-label">${withSame ? 'Save as' : 'Convert to'}</span>${chips('format', k, [...(withSame ? [['same', 'Same as original']] : []), ...formats], o.format)}</div>`;
    const lossy = ['mp3', 'm4a', 'ogg'].includes(o.format);
    const brField = lossy ? `<div class="field"><span class="field-label">Quality</span>${chips('bitrate', k, [[128, '128 kbps', 'small'], [192, '192 kbps'], [320, '320 kbps', 'best']], o.bitrate)}</div>` : '';
    if (a === 'convert') html = `<h3>Convert audio</h3><p class="hint">Change the format of songs, recordings and voice notes.</p>${fmtField}${brField}<div class="note"><b>WAV</b> and <b>FLAC</b> are lossless and big. <b>MP3</b> plays everywhere.</div>`;
    if (a === 'trim') html = `<h3>Trim audio</h3><p class="hint">Drag the handles to keep only the part you want. Makes great ringtones.</p>${fmtField}${brField}`;
    if (a === 'normalize') html = `<h3>Even out volume</h3><p class="hint">Makes quiet recordings louder and loud ones softer, to the level Spotify and YouTube use.</p>${fmtField}${brField}`;
  }

  const q = S.queues[k];
  const single = currentAction(k).single;
  const count = single ? (q.length ? 1 : 0) : q.filter((x) => x.status !== 'done').length || q.length;
  const label = TOOLS[k].actions.find((x) => x.id === a).label;
  html += `<div class="run-bar">
    <button class="btn primary" id="run" ${!q.length || S.running ? 'disabled' : ''}>${ICON.sparkle}${S.running ? 'Working…' : `${label}${count > 1 ? ` ${count} files` : ''}`}</button>
    ${S.running ? '<button class="btn" id="cancel">Cancel</button>' : ''}
  </div>
  <div class="meta" style="margin-top:10px;text-align:center">Saved ${S.settings.outDir ? `to <span class="mono">${esc(baseName(S.settings.outDir))}</span>` : 'next to the original'} · originals are never changed</div>`;
  box.innerHTML = html;

  box.querySelectorAll('.chips').forEach((group) => group.addEventListener('click', (e) => {
    const b = e.target.closest('.chip-opt');
    if (!b) return;
    const key = group.dataset.key;
    const v = isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v;
    o[key] = v;
    renderOpts(k);
  }));
  const cmb = box.querySelector('#custom-mb');
  if (cmb) cmb.addEventListener('change', () => { const v = Math.max(1, +cmb.value || 10); o.targetMB = v; renderOpts(k); });
  const mute = box.querySelector('#mute');
  if (mute) mute.addEventListener('change', () => { o.mute = mute.checked; });
  const pct = box.querySelector('#pct');
  if (pct) pct.addEventListener('input', () => { o.percent = +pct.value; box.querySelector('#pct-v').textContent = `${o.percent}%`; });
  const ql = box.querySelector('#quality');
  if (ql) ql.addEventListener('input', () => { o.quality = +ql.value; box.querySelector('#q-v').textContent = qualityWord(o.quality); });
  box.querySelector('#run').addEventListener('click', () => runTool(k));
  const cancel = box.querySelector('#cancel');
  if (cancel) cancel.addEventListener('click', () => { S.cancelled = true; S.queues[k].forEach((it) => { if (it.status === 'running') api.cancelJob(it.id); }); });
  const warn = box.querySelector('#gif-warn');
  if (warn) warn.style.display = o.end - o.start > 15 ? 'block' : 'none';
}

function qualityWord(q) { return q >= 90 ? `${q} · best` : q >= 75 ? `${q} · great` : q >= 55 ? `${q} · good` : `${q} · smallest`; }
function qualityField(o, label = 'Quality') {
  return `<div class="field"><label>${label}: <b id="q-v">${qualityWord(o.quality)}</b></label><input type="range" id="quality" min="30" max="100" step="1" value="${o.quality}"></div>`;
}

function sameAudioFormat(p) {
  const e = extOf(p);
  return { mp3: 'mp3', m4a: 'm4a', aac: 'm4a', wav: 'wav', flac: 'flac', ogg: 'ogg', opus: 'ogg' }[e] || 'mp3';
}
function sameImageFormat(p) {
  const e = extOf(p);
  return { jpg: 'jpg', jpeg: 'jpg', png: 'png', webp: 'webp' }[e] || (e === 'heic' || e === 'heif' ? 'jpg' : 'png');
}

function jobOptions(k, a, it) {
  const o = S.opts[k];
  if (k === 'video') {
    if (a === 'compress') return o.mode === 'size' ? { targetMB: o.targetMB } : { quality: o.quality };
    if (a === 'trim') return { start: o.start, end: o.end, mute: o.mute };
    if (a === 'gif') return { start: o.start, end: o.end, fps: o.fps, width: o.width };
    return {};
  }
  if (k === 'image') {
    const format = o.format === 'same' ? sameImageFormat(it.path) : o.format;
    if (a === 'resize') return { format, quality: o.quality, ...(o.resizeMode === 'percent' ? { percent: o.percent } : { maxSize: o.maxSize }) };
    return { format, quality: o.quality };
  }
  const format = o.format === 'same' ? sameAudioFormat(it.path) : o.format;
  if (a === 'trim') return { format, bitrate: o.bitrate, start: o.start, end: o.end };
  return { format, bitrate: o.bitrate };
}

async function runTool(k) {
  if (S.running) return;
  const a = currentAction(k);
  const items = a.single ? [selectedItem(k)].filter(Boolean) : S.queues[k];
  if (!items.length) return;
  S.running = true;
  S.cancelled = false;
  for (const it of items) { it.status = 'ready'; it.pct = 0; it.result = null; it.error = null; it.note = null; }
  renderQueue(k); renderOpts(k);
  let done = 0; let failed = 0; let saved = 0;
  for (const it of items) {
    if (S.cancelled) break;
    const options = jobOptions(k, a.id, it);
    if (k === 'video' && a.id === 'compress' && options.targetMB && it.size && it.size <= options.targetMB * 1000 * 1000) {
      it.status = 'skipped'; it.note = `Already under ${options.targetMB} MB`;
      updateRow(k, it);
      continue;
    }
    it.status = 'running';
    updateRow(k, it);
    const res = await api.runJob({ jobId: it.id, tool: k, action: a.id, file: it.path, options });
    if (res.ok) {
      it.status = 'done'; it.result = res; it.flash = 'just-done'; done++;
      if (res.before > res.after) saved += res.before - res.after;
    } else {
      it.status = res.error === 'Cancelled' ? 'ready' : 'failed';
      if (it.status === 'failed') it.flash = 'just-failed';
      it.error = res.error;
      if (res.error !== 'Cancelled') failed++;
    }
    updateRow(k, it);
  }
  S.running = false;
  await refreshState();
  renderOpts(k);
  // Let the last row's finish animation play, then restore the remove buttons.
  setTimeout(() => { if (S.view === k && !S.running) renderQueue(k); }, 1200);
  if (done) {
    toast(`${done} file${done > 1 ? 's' : ''} done${saved > 0 ? ` · saved ${fmtBytes(saved)}` : ''}`);
    const last = items.filter((x) => x.result).pop();
    if (S.settings.openFolderWhenDone && last) api.showInFolder(last.result.output);
  }
  if (failed) toast(`${failed} file${failed > 1 ? 's' : ''} didn't work. See the message next to each one.`, 'bad', 5000);
}

api.onProgress(({ jobId, pct }) => {
  for (const k of ['video', 'image', 'audio']) {
    const it = S.queues[k].find((x) => x.id === jobId);
    if (!it) continue;
    it.pct = pct;
    const row = view.querySelector(`.qitem[data-id="${jobId}"]`);
    if (row) {
      row.querySelector('.bar').style.width = `${pct}%`;
      row.querySelector('.status').innerHTML = `${ICON.spin}<span>${Math.round(pct)}%</span>`;
    }
  }
});

// ---------- History ----------

function renderHistory() {
  view.innerHTML = `<div class="page">
    <div class="page-head"><div><h1>History</h1><p class="sub">Everything Filesmith made for you. Kept only on this computer.</p></div>
      ${S.history.length ? '<button class="btn" id="clear-h">Clear history</button>' : ''}</div>
    <div class="card" style="max-width:1100px">${S.history.length ? S.history.map(historyRow).join('') : '<div class="empty">Nothing yet. Drop a file to get started.</div>'}</div>
  </div>`;
  bindHistoryRows(view);
  const c = view.querySelector('#clear-h');
  if (c) c.addEventListener('click', async () => { await api.clearHistory(); await refreshState(); renderHistory(); });
}

// ---------- Settings ----------

function renderSettings() {
  const st = S.settings;
  view.innerHTML = `<div class="page">
    <div class="page-head"><div><h1>Settings</h1><p class="sub">Filesmith works offline and never collects data.</p></div></div>
    <div class="group">
      <div class="set-row"><div><div class="t">Where to save</div><div class="meta">${st.outDir ? `<span class="mono">${esc(st.outDir)}</span>` : 'Next to the original file'}</div></div>
        <div class="row">${st.outDir ? '<button class="btn sm ghost" id="reset-dir">Use original folder</button>' : ''}<button class="btn sm" id="pick-dir">Choose folder…</button></div></div>
      <div class="set-row"><div><div class="t">Show the file when done</div><div class="meta">Opens the folder after a batch finishes.</div></div>
        <label class="switch"><input type="checkbox" id="open-done" ${st.openFolderWhenDone ? 'checked' : ''}><span></span></label></div>
      <div class="set-row"><div><div class="t">Language</div></div>
        <select id="lang" style="width:auto;min-width:160px" data-no-i18n>${[['auto', tr('Automatic')], ...Object.entries(LANGS)].map(([v, l]) => `<option value="${v}" ${(st.lang || 'auto') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="set-row"><div><div class="t">Check for updates</div><div class="meta" style="white-space:normal">Once a day, Filesmith asks GitHub for the latest version number. Nothing about you or your files is sent.</div><div class="meta" id="upd-msg"></div></div>
        <div class="row"><button class="btn sm" id="upd-now">Check now</button><label class="switch"><input type="checkbox" id="auto-upd" ${st.autoUpdate !== false ? 'checked' : ''}><span></span></label></div></div>
      <div class="set-row"><div><div class="t">Appearance</div></div>
        <div class="chips" id="theme">${[['system', tr('System')], ['dark', tr('Dark')], ['light', currentLang() === 'en' ? 'Light' : tr('Light appearance')]].map(([v, l]) => `<button class="chip-opt ${st.theme === v ? 'on' : ''}" data-v="${v}" data-no-i18n>${l}</button>`).join('')}</div></div>
    </div>
    <h2>About</h2>
    <div class="group">
      <div class="set-row"><div><div class="t">Filesmith ${esc(S.version)}</div><div class="meta">Free and open source. Uses FFmpeg, pdf-lib and PDF.js.</div></div>
        <div class="row"><button class="btn sm" id="licences">Licences</button><button class="btn sm" data-href="${CONFIG.github}">${ICON.github} GitHub</button></div></div>
      <div class="set-row"><div><div class="t">Made by ${esc(CONFIG.author)} · ${esc(CONFIG.studio)}</div><div class="meta">${esc(CONFIG.studio)} makes tools with no ads, no accounts and no tracking. Found a bug or have an idea? Open an issue on GitHub.</div></div>
        <button class="btn sm" data-href="${CONFIG.website}">Website</button></div>
    </div>
  </div>`;
  view.querySelector('#pick-dir').addEventListener('click', async () => { const d = await api.pickFolder(); if (d) { await api.setSettings({ outDir: d }); await refreshState(); renderSettings(); } });
  const rd = view.querySelector('#reset-dir');
  if (rd) rd.addEventListener('click', async () => { await api.setSettings({ outDir: '' }); await refreshState(); renderSettings(); });
  view.querySelector('#open-done').addEventListener('change', async (e) => { await api.setSettings({ openFolderWhenDone: e.target.checked }); await refreshState(); });
  view.querySelector('#lang').addEventListener('change', async (e) => {
    await api.setSettings({ lang: e.target.value });
    location.reload();
  });
  view.querySelector('#auto-upd').addEventListener('change', async (e) => { await api.setSettings({ autoUpdate: e.target.checked }); await refreshState(); });
  view.querySelector('#licences').addEventListener('click', () => api.openLicences());
  view.querySelector('#upd-now').addEventListener('click', async (e) => {
    const b = e.currentTarget; const msg = view.querySelector('#upd-msg');
    b.disabled = true; msg.textContent = '';
    const r = await api.checkUpdates();
    b.disabled = false;
    msg.textContent = r.state === 'latest' ? "You're on the latest version." : r.state === 'error' ? "Couldn't check for updates. Are you online?" : '';
  });
  view.querySelector('#theme').addEventListener('click', async (e) => {
    const b = e.target.closest('.chip-opt'); if (!b) return;
    await api.setSettings({ theme: b.dataset.v }); await refreshState(); renderSettings();
  });
}

// ---------- Support ----------

function renderSupport() {
  const hasCrypto = CONFIG.crypto && CONFIG.crypto.address;
  view.innerHTML = `<div class="page">
    <div class="page-head"><div><h1>Support Filesmith</h1></div></div>
    <p class="support-lead">Filesmith is free and stays free: no ads, no limits, no account, no uploads. If it saved you from a converter website, a tip helps pay for the code-signing certificates that make the security warnings go away.</p>
    <div class="group">
      <div class="set-row"><div><div class="t">Leave a tip on ${esc(CONFIG.tipName)}</div><div class="meta">Card, Apple Pay or PayPal. Takes about 20 seconds.</div></div>
        <button class="btn primary" data-href="${CONFIG.tipUrl}">${ICON.coffee}Buy me a coffee</button></div>
      <div class="set-row"><div><div class="t">Star it on GitHub</div><div class="meta">Free, and it helps other people find Filesmith.</div></div>
        <button class="btn" data-href="${CONFIG.github}">${ICON.github}Open GitHub</button></div>
      ${hasCrypto ? `<div class="set-row"><div class="grow"><div class="t">Crypto</div><div class="meta">${esc(CONFIG.crypto.label)}. Check the network before sending.</div><div class="addr">${esc(CONFIG.crypto.address)}</div></div>
        <button class="btn" id="copy-addr">${ICON.copy}Copy</button></div>` : ''}
    </div>
  </div>`;
  const ca = view.querySelector('#copy-addr');
  if (ca) ca.addEventListener('click', () => { navigator.clipboard.writeText(CONFIG.crypto.address); toast('Address copied'); });
}

// ---------- Start ----------

// A quiet notice above the sidebar footer when a new version exists.
function showUpdate(st) {
  if (!st || !['ready', 'available'].includes(st.state)) return;
  document.querySelector('.update-note')?.remove();
  const note = el(`<div class="update-note" role="status">
    <div>${st.state === 'ready' ? `Version ${esc(st.version)} is ready.` : `Version ${esc(st.version)} is available.`}</div>
    <div class="row"><button class="btn sm primary-sm" id="upd-go">${st.state === 'ready' ? 'Restart to update' : 'Download'}</button><button class="btn sm ghost" id="upd-later">Later</button></div>
  </div>`);
  document.querySelector('.side-foot').prepend(note);
  note.querySelector('#upd-go').addEventListener('click', () => { if (st.state === 'ready') api.installUpdate(); else api.openExternal(st.url || `${CONFIG.github}/releases/latest`); });
  note.querySelector('#upd-later').addEventListener('click', () => note.remove());
}

(async function start() {
  await refreshState();
  setLang(pickLang(S.settings.lang));
  startTranslating();
  renderNav();
  render();
  api.onOpenFiles((files) => addFiles(files));
  api.onUpdate(showUpdate);
  showUpdate(await api.rendererReady());
})();

// Hook for automated tests (test/e2e.mjs).
window.__filesmithTest = { addFiles, go, S };
