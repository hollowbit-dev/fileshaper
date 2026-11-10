// Fileshaper — PDF tools. Merge, split, compress, organize pages, sign, and images to PDF.
// Everything happens in this window with pdf-lib (editing) and PDF.js (drawing pages).
import * as pdfjs from '../../node_modules/pdfjs-dist/build/pdf.min.mjs';
import { ICON, esc, el, fmtBytes, baseName, extOf, savedLabel, toast, openModal, newId, makeSortable, segIndicator } from './ui.js';
import { refreshState } from './app.js';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('../../node_modules/pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;
const { PDFDocument, StandardFonts, rgb, degrees } = window.PDFLib;
const api = window.fileshaper;

const ACTIONS = [
  { id: 'merge', label: 'Merge', icon: 'merge' },
  { id: 'split', label: 'Split', icon: 'split', single: true },
  { id: 'compress', label: 'Compress', icon: 'shrink' },
  { id: 'organize', label: 'Organize pages', icon: 'stack', single: true },
  { id: 'sign', label: 'Sign & fill', icon: 'pen', single: true },
  { id: 'images', label: 'Images to PDF', icon: 'image' },
];

const P = {
  action: 'merge',
  files: [],   // { id, path, name, size, pages }
  images: [],  // { id, path, name, size }
  sel: null,
  split: { mode: 'every', ranges: '' },
  compress: { level: 'light', dpi: 130 },
  img: { page: 'a4', margin: 'small' },
  org: null,   // { fileId, pages: [{ src, rot, base }] }
  sign: null,  // { fileId, items: [] }
  busy: false,
  results: [],
};

let root = null;

// ---------- Files ----------

const bytesCache = new Map();
async function bytesOf(path) {
  if (!bytesCache.has(path)) bytesCache.set(path, new Uint8Array(await api.readFile(path)));
  return bytesCache.get(path);
}
async function pdfjsDoc(path) {
  const data = (await bytesOf(path)).slice();
  return pdfjs.getDocument({ data, isEvalSupported: false }).promise;
}
async function loadLib(path) {
  try {
    return await PDFDocument.load(await bytesOf(path));
  } catch (e) {
    if (/encrypt/i.test(String(e))) throw new Error(`${baseName(path)} is password-protected. Remove the password first.`);
    throw new Error(`${baseName(path)} looks damaged and can't be opened.`);
  }
}

export async function addPdfFiles(paths, as) {
  if (as === 'images') {
    for (const p of paths) {
      if (P.images.some((x) => x.path === p)) continue;
      const st = await api.stat(p);
      P.images.push({ id: newId(), path: p, name: baseName(p), size: st ? st.size : 0 });
    }
    P.action = 'images';
    return;
  }
  for (const p of paths) {
    if (P.files.some((x) => x.path === p)) continue;
    const st = await api.stat(p);
    const f = { id: newId(), path: p, name: baseName(p), size: st ? st.size : 0, pages: null };
    P.files.push(f);
    pdfjsDoc(p).then((d) => { f.pages = d.numPages; d.destroy(); if (root && P.action !== 'organize' && P.action !== 'sign') renderLeft(); })
      .catch(() => { f.pages = 0; f.bad = true; if (root) renderLeft(); });
  }
  if (!P.sel && P.files.length) P.sel = P.files[0].id;
  if (P.action === 'images') P.action = paths.length > 1 ? 'merge' : P.action;
}

const selFile = () => P.files.find((f) => f.id === P.sel) || P.files[0];
const act = () => ACTIONS.find((a) => a.id === P.action);

async function pick(images) {
  const files = await api.pickFiles({ filters: images
    ? [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'gif', 'bmp'] }]
    : [{ name: 'PDF', extensions: ['pdf'] }] });
  if (!files.length) return;
  await addPdfFiles(files, images ? 'images' : undefined);
  renderPdf(root);
}

// ---------- Layout ----------

export function renderPdf(container) {
  root = container;
  if (window.__pdfAction) { P.action = window.__pdfAction; window.__pdfAction = null; }
  root.innerHTML = `
  <div class="page">
    <div class="page-head"><div><h1>PDF</h1><p class="sub">Merge, split, sign and shrink PDFs without uploading them anywhere.</p></div></div>
    <div class="seg" id="pdf-seg">${ACTIONS.map((a) => `<button data-pa="${a.id}" class="${P.action === a.id ? 'on' : ''}">${ICON[a.icon]}${a.label}</button>`).join('')}</div>
    <div class="tool-grid" id="pdf-grid">
      <div id="pdf-left"></div>
      <div class="panel" id="pdf-opts"></div>
    </div>
  </div>`;
  root.querySelectorAll('[data-pa]').forEach((b) => b.addEventListener('click', () => {
    if (P.busy) return;
    P.action = b.dataset.pa;
    P.results = [];
    renderPdf(root);
  }));
  // Page editors need the whole width.
  if (P.action === 'organize' || P.action === 'sign') root.querySelector('#pdf-grid').style.gridTemplateColumns = '1fr 300px';
  segIndicator(root.querySelector('#pdf-seg'), 'seg-pdf');
  renderLeft();
  renderOpts();
}

function fileList(list, opts = {}) {
  const single = act().single;
  return `<div class="table-head">
      <div class="meta">${list.length} file${list.length > 1 ? 's' : ''}${opts.sortable && list.length > 1 ? ' · drag to change the order' : ''}${single && list.length > 1 ? ' · click one to pick it' : ''}</div>
      <button class="btn ghost sm" id="clear">Clear all</button>
    </div>
    <div class="queue" id="flist">${list.map((f, i) => `
      <div class="qitem simple ${single && selFile()?.id === f.id ? 'picked' : ''}" data-id="${f.id}">
        ${opts.sortable ? `<span class="handle">${ICON.grip}</span>` : ''}
        ${opts.thumbs ? `<div class="thumb" style="background-image:url('${/\.(heic|heif)$/i.test(f.path) ? '' : api.fileUrl(f.path)}')">${/\.(heic|heif)$/i.test(f.path) ? ICON.image : ''}</div>` : `<div class="thumb">${ICON.pdf}</div>`}
        <div class="grow"><div class="name">${opts.sortable ? `${i + 1}. ` : ''}${esc(f.name)}</div>
          <div class="meta">${fmtBytes(f.size)}${f.pages ? ` · ${f.pages} page${f.pages > 1 ? 's' : ''}` : ''}${f.bad ? ' · <span style="color:var(--bad)">can\'t read this PDF</span>' : ''}</div></div>
        <div class="actions"><button class="icon-btn" title="Remove" aria-label="Remove" data-rm="${f.id}">${ICON.x}</button></div>
      </div>`).join('')}<button class="add-more" id="dz">${ICON.plus}Add more</button></div>`;
}

function renderLeft() {
  const box = root.querySelector('#pdf-left');
  if (!box) return;
  const a = P.action;
  const list = a === 'images' ? P.images : P.files;
  if (!list.length) {
    box.innerHTML = `<div class="dropzone"><b>${a === 'images' ? 'No images yet' : 'No PDFs yet'}</b>${a === 'images' ? 'Each image becomes one page. JPG, PNG, HEIC and WebP work.' : a === 'merge' ? 'Add two or more PDFs to combine them.' : 'Drop a PDF anywhere in the window, or choose one.'}<br><button class="btn" id="dz">${a === 'images' ? 'Choose images…' : 'Choose PDFs…'}</button></div>`;
    box.querySelector('#dz').addEventListener('click', () => pick(a === 'images'));
    return;
  }
  if (a === 'organize') return renderOrganize(box);
  if (a === 'sign') return renderSign(box);
  box.innerHTML = fileList(list, { sortable: a === 'merge' || a === 'images', thumbs: a === 'images' });
  box.querySelector('#dz').addEventListener('click', () => pick(a === 'images'));
  box.querySelector('#clear').addEventListener('click', () => {
    if (a === 'images') P.images = []; else { P.files = []; P.sel = null; }
    P.results = []; renderPdf(root);
  });
  box.querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    if (a === 'images') P.images = P.images.filter((x) => x.id !== b.dataset.rm);
    else { P.files = P.files.filter((x) => x.id !== b.dataset.rm); if (P.sel === b.dataset.rm) P.sel = P.files[0]?.id || null; }
    renderLeft(); renderOpts();
  }));
  box.querySelectorAll('.qitem').forEach((row) => row.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    if (act().single) { P.sel = row.dataset.id; renderLeft(); renderOpts(); }
  }));
  if (a === 'merge' || a === 'images') makeSortable(box.querySelector('#flist'), '.qitem', list, () => renderLeft());
}

function results() {
  if (!P.results.length) return '';
  return `<div class="queue" style="margin-top:14px">${P.results.map((r) => `
    <div class="qitem simple done">
      <div class="thumb">${ICON.check}</div>
      <div class="grow"><div class="name">${esc(r.name)}</div><div class="meta">${r.note ? esc(r.note) : savedLabel(r.before, r.after)}</div></div>
      ${r.output ? `<div class="actions"><button class="icon-btn" title="Open" data-open="${esc(r.output)}">${ICON.open}</button><button class="icon-btn" title="Show in folder" data-show="${esc(r.output)}">${ICON.folder}</button></div>` : ''}
    </div>`).join('')}</div>`;
}

function chipRow(key, obj, list) {
  return `<div class="chips" data-obj="${obj}" data-key="${key}">${list.map(([v, l, hint]) => `<button class="chip-opt ${String(P[obj][key]) === String(v) ? 'on' : ''}" data-v="${v}">${l}${hint ? ` <small>${hint}</small>` : ''}</button>`).join('')}</div>`;
}

function renderOpts() {
  const box = root.querySelector('#pdf-opts');
  if (!box) return;
  const a = P.action;
  const f = selFile();
  let html = '';
  let canRun = false;
  let runLabel = '';

  if (a === 'merge') {
    html = `<h3>Merge PDFs</h3><p class="hint">Combines files top to bottom into one PDF. Drag to reorder.</p>`;
    const total = P.files.reduce((s, x) => s + (x.pages || 0), 0);
    if (P.files.length) html += `<div class="note"><b>${P.files.length}</b> files · <b>${total}</b> pages in total</div>`;
    canRun = P.files.length >= 2; runLabel = canRun ? `Merge ${P.files.length} PDFs` : 'Add at least 2 PDFs';
  }
  if (a === 'split') {
    html = `<h3>Split a PDF</h3><p class="hint">${f ? `Working on <b>${esc(f.name)}</b>${f.pages ? ` (${f.pages} pages)` : ''}.` : 'Add a PDF.'}</p>
      <div class="field"><span class="field-label">How</span>${chipRow('mode', 'split', [['every', 'Every page'], ['ranges', 'By ranges'], ['extract', 'Pick pages']])}</div>
      ${P.split.mode !== 'every' ? `<div class="field"><label>${P.split.mode === 'ranges' ? 'Ranges (each becomes its own file)' : 'Pages to keep (one new file)'}</label>
        <input type="text" id="ranges" placeholder="${P.split.mode === 'ranges' ? '1-3, 4-8, 9-' : '1, 3, 5-7'}" value="${esc(P.split.ranges)}"></div>` : ''}
      <div class="note">${P.split.mode === 'every' ? 'Makes one PDF per page.' : P.split.mode === 'ranges' ? 'Example: <b>1-3, 4-8</b> makes two files.' : 'Example: <b>1, 3, 5-7</b> keeps those pages in one new file.'}</div>`;
    canRun = !!f && !f.bad && (P.split.mode === 'every' || P.split.ranges.trim().length > 0); runLabel = 'Split PDF';
  }
  if (a === 'compress') {
    html = `<h3>Compress PDFs</h3><p class="hint">Shrink PDFs for email, uploads and school portals.</p>
      <div class="field"><span class="field-label">Strength</span>${chipRow('level', 'compress', [['light', 'Light', 'keeps text'], ['strong', 'Strong', 'scans & photos']])}</div>
      ${P.compress.level === 'strong' ? `<div class="field"><span class="field-label">Sharpness</span>${chipRow('dpi', 'compress', [[96, 'Small'], [130, 'Balanced'], [170, 'Sharp']])}</div>
        <div class="note"><b>Strong</b> turns each page into a picture. It's great for scanned documents, but you can't select the text afterwards.</div>`
        : '<div class="note"><b>Light</b> cleans up the file and keeps everything selectable. For scans or photo-heavy PDFs, use <b>Strong</b>.</div>'}`;
    canRun = P.files.length > 0; runLabel = P.files.length > 1 ? `Compress ${P.files.length} PDFs` : 'Compress PDF';
  }
  if (a === 'organize') {
    html = `<h3>Organize pages</h3><p class="hint">Drag pages to reorder. Hover a page to rotate or delete it.</p>
      ${P.files.length > 1 ? `<div class="field"><label>File</label><select id="pick-file">${P.files.map((x) => `<option value="${x.id}" ${x.id === f?.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>` : ''}
      ${P.org && P.org.fileId === f?.id ? `<div class="note"><b>${P.org.pages.length}</b> page${P.org.pages.length === 1 ? '' : 's'}${P.org.removed ? ` · ${P.org.removed} deleted` : ''}</div>
      <div class="row" style="margin-top:10px"><button class="btn sm" id="rot-all">${ICON.rotate} Rotate all</button><button class="btn sm ghost" id="reset-org">Reset</button></div>` : ''}`;
    canRun = !!(P.org && P.org.fileId === f?.id && P.org.pages.length); runLabel = 'Save new PDF';
  }
  if (a === 'sign') {
    const sig = localSig();
    html = `<h3>Sign & fill</h3><p class="hint">Add your signature, a name or a date, then drag it into place.</p>
      ${P.files.length > 1 ? `<div class="field"><label>File</label><select id="pick-file">${P.files.map((x) => `<option value="${x.id}" ${x.id === f?.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>` : ''}
      <div class="field" style="display:grid;gap:8px">
        <button class="btn" id="add-sig">${ICON.pen} ${sig ? 'Add my signature' : 'Create signature'}</button>
        ${sig ? '<button class="btn ghost sm" id="new-sig">Make a new signature</button>' : ''}
        <button class="btn" id="add-text">${ICON.type} Add text</button>
        <button class="btn" id="add-date">${ICON.calendar} Add today's date</button>
      </div>
      <div class="note" id="place-hint">${P.placing ? '<b>Now click on the page</b> where it should go.' : 'Drag items to move them, use the corner to resize, and the × to remove.'}</div>`;
    canRun = !!(P.sign && P.sign.fileId === f?.id && P.sign.items.length); runLabel = 'Save signed PDF';
  }
  if (a === 'images') {
    html = `<h3>Images to PDF</h3><p class="hint">Each image becomes a page, in the order on the left. Phone photos are turned the right way up.</p>
      <div class="field"><span class="field-label">Page size</span>${chipRow('page', 'img', [['a4', 'A4'], ['letter', 'Letter'], ['fit', 'Same as image']])}</div>
      ${P.img.page !== 'fit' ? `<div class="field"><span class="field-label">Margin</span>${chipRow('margin', 'img', [['none', 'None'], ['small', 'Small'], ['normal', 'Normal']])}</div>` : ''}`;
    canRun = P.images.length > 0; runLabel = P.images.length > 1 ? `Make PDF from ${P.images.length} images` : 'Make PDF';
  }

  html += `<div class="run-bar"><button class="btn primary" id="run" ${!canRun || P.busy ? 'disabled' : ''}>${ICON.sparkle}${P.busy ? `<span id="busy-txt">Working…</span>` : runLabel}</button></div>
    <div class="meta" style="margin-top:10px;text-align:center">Originals are never changed</div>${results()}`;
  box.innerHTML = html;

  box.querySelectorAll('.chips').forEach((g) => g.addEventListener('click', (e) => {
    const b = e.target.closest('.chip-opt'); if (!b) return;
    const v = isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v;
    P[g.dataset.obj][g.dataset.key] = v;
    renderOpts();
  }));
  const rng = box.querySelector('#ranges');
  if (rng) rng.addEventListener('input', () => { P.split.ranges = rng.value; box.querySelector('#run').disabled = !rng.value.trim() || P.busy; });
  const pf = box.querySelector('#pick-file');
  if (pf) pf.addEventListener('change', () => { P.sel = pf.value; renderLeft(); renderOpts(); });
  const on = (id, fn) => { const n = box.querySelector(id); if (n) n.addEventListener('click', fn); };
  on('#rot-all', () => { P.org.pages.forEach((p) => { p.rot = (p.rot + 90) % 360; }); renderLeft(); });
  on('#reset-org', () => { P.org = null; renderLeft(); renderOpts(); });
  on('#add-sig', () => { const sg = localSig(); if (sg) startPlacing({ type: 'sig', src: sg }); else signatureModal(); });
  on('#new-sig', () => signatureModal());
  on('#add-text', () => textModal());
  on('#add-date', () => startPlacing({ type: 'text', text: new Date().toLocaleDateString() }));
  on('#run', () => run());
  box.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => api.openFile(b.dataset.open)));
  box.querySelectorAll('[data-show]').forEach((b) => b.addEventListener('click', () => api.showInFolder(b.dataset.show)));
}

// ---------- Running ----------

async function save(input, suffix, doc) {
  const bytes = await doc.save({ useObjectStreams: true });
  return api.saveOutput({ input, suffix, ext: '.pdf', bytes });
}

function parseRanges(text, max) {
  const groups = [];
  for (const part of text.split(/[,;]+/).map((x) => x.trim()).filter(Boolean)) {
    const m = /^(\d*)\s*-\s*(\d*)$/.exec(part);
    let a; let b;
    if (m) { a = m[1] ? +m[1] : 1; b = m[2] ? +m[2] : max; }
    else if (/^\d+$/.test(part)) { a = b = +part; }
    else throw new Error(`"${part}" isn't a page range. Use something like 1-3, 5.`);
    if (a < 1 || b > max || a > b) throw new Error(`"${part}" is outside 1–${max}.`);
    groups.push(Array.from({ length: b - a + 1 }, (_, i) => a - 1 + i));
  }
  if (!groups.length) throw new Error('Type which pages you want, like 1-3, 5.');
  return groups;
}

function setBusy(on, text) {
  P.busy = on;
  if (on) { renderOpts(); }
  const t = root.querySelector('#busy-txt');
  if (t && text) t.textContent = text;
}

async function run() {
  if (P.busy) return;
  P.results = [];
  setBusy(true);
  try {
    const a = P.action;
    if (a === 'merge') {
      const out = await PDFDocument.create();
      for (const f of P.files) {
        setBusy(true, `Adding ${f.name}…`);
        const src = await loadLib(f.path);
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      const r = await save(P.files[0].path, '-merged', out);
      P.results.push({ ...r, note: `${out.getPageCount()} pages` });
    }
    if (a === 'split') {
      const f = selFile();
      const src = await loadLib(f.path);
      const n = src.getPageCount();
      let groups;
      if (P.split.mode === 'every') groups = src.getPageIndices().map((i) => [i]);
      else groups = parseRanges(P.split.ranges, n);
      if (P.split.mode === 'extract') groups = [groups.flat()];
      if (groups.length > 300) throw new Error('That would make more than 300 files. Use ranges instead.');
      for (const [gi, g] of groups.entries()) {
        setBusy(true, `Making file ${gi + 1} of ${groups.length}…`);
        const out = await PDFDocument.create();
        (await out.copyPages(src, g)).forEach((p) => out.addPage(p));
        const label = g.length === 1 ? `-page${g[0] + 1}` : `-pages${g[0] + 1}-${g[g.length - 1] + 1}`;
        const r = await save(f.path, P.split.mode === 'extract' ? '-extract' : label, out);
        if (groups.length <= 6) P.results.push(r);
        else if (gi === groups.length - 1) P.results.push({ ...r, name: `${groups.length} files saved`, note: `Next to ${f.name}` });
      }
    }
    if (a === 'compress') {
      for (const f of P.files) {
        setBusy(true, `Compressing ${f.name}…`);
        const r = P.compress.level === 'light' ? await compressLight(f) : await compressStrong(f);
        P.results.push(r);
      }
    }
    if (a === 'organize') {
      const f = selFile();
      const src = await loadLib(f.path);
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, P.org.pages.map((p) => p.src));
      pages.forEach((p, i) => {
        const o = P.org.pages[i];
        if (o.rot) p.setRotation(degrees((p.getRotation().angle + o.rot) % 360));
        out.addPage(p);
      });
      P.results.push({ ...(await save(f.path, '-organized', out)), note: `${pages.length} pages` });
    }
    if (a === 'sign') P.results.push(await saveSigned());
    if (a === 'images') P.results.push(await imagesToPdf());
    await refreshState();
    toast('PDF saved');
  } catch (e) {
    toast(esc(e.message || String(e)), 'bad', 6000);
  } finally {
    P.busy = false;
    renderOpts();
  }
}

async function compressLight(f) {
  const doc = await loadLib(f.path);
  const bytes = await doc.save({ useObjectStreams: true });
  if (bytes.length >= f.size * 0.98) return { name: f.name, note: 'Already as small as it gets with Light. Try Strong.' };
  return api.saveOutput({ input: f.path, suffix: '-small', ext: '.pdf', bytes });
}

async function compressStrong(f) {
  const src = await pdfjsDoc(f.path);
  const out = await PDFDocument.create();
  const scale = P.compress.dpi / 72;
  for (let i = 1; i <= src.numPages; i++) {
    setBusy(true, `Page ${i} of ${src.numPages}…`);
    const page = await src.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const vp = page.getViewport({ scale });
    const c = document.createElement('canvas');
    c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    const jpg = await new Promise((r) => c.toBlob((b) => b.arrayBuffer().then(r), 'image/jpeg', 0.72));
    const img = await out.embedJpg(jpg);
    const p = out.addPage([base.width, base.height]);
    p.drawImage(img, { x: 0, y: 0, width: base.width, height: base.height });
    page.cleanup();
  }
  src.destroy();
  const bytes = await out.save({ useObjectStreams: true });
  if (bytes.length >= f.size) return { name: f.name, note: "This PDF is already compact. Fileshaper didn't save a bigger copy." };
  return api.saveOutput({ input: f.path, suffix: '-small', ext: '.pdf', bytes });
}

// Loads any image into a canvas (which also turns phone photos upright).
async function imageBytes(path) {
  const e = extOf(path);
  if (e === 'png') return { kind: 'png', bytes: await bytesOf(path) };
  let src = path;
  if (e === 'heic' || e === 'heif') src = await api.heicToJpg(path);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = api.fileUrl(src);
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext('2d');
  const opaque = ['jpg', 'jpeg', 'heic', 'heif', 'bmp'].includes(e);
  if (opaque) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
  ctx.drawImage(img, 0, 0);
  const type = opaque ? 'image/jpeg' : 'image/png';
  const bytes = await new Promise((r) => c.toBlob((b) => b.arrayBuffer().then(r), type, 0.92));
  return { kind: opaque ? 'jpg' : 'png', bytes };
}

async function imagesToPdf() {
  const out = await PDFDocument.create();
  const sizes = { a4: [595.28, 841.89], letter: [612, 792] };
  const margin = { none: 0, small: 24, normal: 48 }[P.img.margin] || 0;
  for (const [i, im] of P.images.entries()) {
    setBusy(true, `Image ${i + 1} of ${P.images.length}…`);
    const { kind, bytes } = await imageBytes(im.path);
    const emb = kind === 'png' ? await out.embedPng(bytes) : await out.embedJpg(bytes);
    if (P.img.page === 'fit') {
      // Keep big photos at a sensible physical size (about 150 dpi).
      const k = Math.min(1, 1240 / Math.max(emb.width, emb.height)) * 0.75 * (72 / 54);
      const w = emb.width * k; const h = emb.height * k;
      out.addPage([w, h]).drawImage(emb, { x: 0, y: 0, width: w, height: h });
    } else {
      let [pw, ph] = sizes[P.img.page];
      if (emb.width > emb.height) [pw, ph] = [ph, pw];
      const fit = Math.min((pw - margin * 2) / emb.width, (ph - margin * 2) / emb.height);
      const w = emb.width * fit; const h = emb.height * fit;
      out.addPage([pw, ph]).drawImage(emb, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
    }
  }
  const r = await save(P.images[0].path, '', out);
  return { ...r, note: `${P.images.length} page${P.images.length > 1 ? 's' : ''} · ${fmtBytes(r.after)}` };
}

// ---------- Organize ----------

async function renderOrganize(box) {
  const f = selFile();
  if (!f) return;
  if (!P.org || P.org.fileId !== f.id) {
    box.innerHTML = '<div class="empty">Loading pages…</div>';
    try {
      const d = await pdfjsDoc(f.path);
      P.org = { fileId: f.id, pages: Array.from({ length: d.numPages }, (_, i) => ({ src: i, rot: 0, key: newId() })), removed: 0, doc: d, thumbs: new Map() };
    } catch (e) { box.innerHTML = '<div class="empty">This PDF can\'t be opened.</div>'; return; }
    renderOpts();
  }
  const org = P.org;
  box.innerHTML = `<div class="pages" id="pages">${org.pages.map((p, i) => `
    <div class="pg" data-i="${i}">
      <div class="tools"><button title="Rotate" data-rot="${i}">${ICON.rotate}</button><button title="Delete" data-del="${i}">${ICON.trash}</button></div>
      <div class="cv" data-src="${p.src}" style="transform:rotate(${p.rot}deg)"></div>
      <div class="pn">${i + 1}${p.src !== i ? ` <span style="color:var(--text-3)">(was ${p.src + 1})</span>` : ''}</div>
    </div>`).join('')}</div>`;
  box.querySelectorAll('[data-rot]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); const p = org.pages[+b.dataset.rot]; p.rot = (p.rot + 90) % 360; renderOrganize(box); }));
  box.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    if (org.pages.length === 1) { toast("A PDF needs at least one page.", 'bad'); return; }
    org.pages.splice(+b.dataset.del, 1); org.removed++;
    renderOrganize(box); renderOpts();
  }));
  makeSortable(box.querySelector('#pages'), '.pg', org.pages, () => renderOrganize(box));
  // Draw thumbnails, reusing ones already drawn.
  for (const slot of box.querySelectorAll('.cv')) {
    const src = +slot.dataset.src;
    let c = org.thumbs.get(src);
    if (!c) {
      c = document.createElement('canvas');
      org.thumbs.set(src, c);
      const page = await org.doc.getPage(src + 1);
      const vp0 = page.getViewport({ scale: 1 });
      const vp = page.getViewport({ scale: 260 / vp0.width });
      c.width = vp.width; c.height = vp.height;
      await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
    }
    if (!slot.isConnected) return;
    slot.appendChild(c.cloneNode(false));
    slot.lastChild.getContext('2d').drawImage(c, 0, 0);
  }
}

// ---------- Sign & fill ----------

const SIG_KEY = 'fileshaper.signature';
function localSig() { try { return localStorage.getItem(SIG_KEY); } catch (e) { return null; } }

function startPlacing(item) {
  P.placing = item;
  renderOpts();
  root.querySelectorAll('.sign-page').forEach((pg) => { pg.style.cursor = 'crosshair'; });
}

function textModal() {
  const m = openModal(`<h3>Add text</h3>
    <input type="text" id="t-in" placeholder="Your name, an address, anything" style="font-size:16px;padding:11px">
    <div class="row" style="justify-content:flex-end;margin-top:16px;gap:8px"><button class="btn ghost" id="t-cancel">Cancel</button><button class="btn primary" id="t-ok">Place it</button></div>`);
  const input = m.root.querySelector('#t-in');
  input.focus();
  const ok = () => { const v = input.value.trim(); if (!v) return; m.close(); startPlacing({ type: 'text', text: v }); };
  m.root.querySelector('#t-ok').addEventListener('click', ok);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') ok(); });
  m.root.querySelector('#t-cancel').addEventListener('click', m.close);
}

function signatureModal() {
  const m = openModal(`<h3>Your signature</h3>
    <div class="seg" id="sig-tabs" style="margin-bottom:12px"><button class="on" data-t="draw">${ICON.pen}Draw</button><button data-t="type">${ICON.type}Type</button></div>
    <div id="sig-body"></div>
    <div class="row" style="justify-content:space-between;margin-top:14px">
      <div class="row" id="ink" style="gap:6px"><button class="chip-opt on" data-c="#111111">Black</button><button class="chip-opt" data-c="#1a3fb0">Blue</button></div>
      <div class="row" style="gap:8px"><button class="btn ghost" id="s-clear">Clear</button><button class="btn primary" id="s-ok">Use signature</button></div>
    </div>
    <div class="meta" style="margin-top:10px">Saved only on this computer so you can reuse it.</div>`);
  let mode = 'draw';
  let ink = '#111111';
  let pad = null;
  const body = m.root.querySelector('#sig-body');
  const show = () => {
    if (mode === 'draw') {
      body.innerHTML = '<canvas class="sign-pad"></canvas>';
      pad = drawPad(body.querySelector('canvas'), () => ink);
    } else {
      body.innerHTML = `<input class="typed-sig" id="typed" placeholder="Type your name" style="color:${ink}">`;
      body.querySelector('#typed').focus();
    }
  };
  show();
  m.root.querySelector('#sig-tabs').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    mode = b.dataset.t;
    m.root.querySelectorAll('#sig-tabs button').forEach((x) => x.classList.toggle('on', x === b));
    show();
  });
  m.root.querySelector('#ink').addEventListener('click', (e) => {
    const b = e.target.closest('[data-c]'); if (!b) return;
    ink = b.dataset.c;
    m.root.querySelectorAll('#ink [data-c]').forEach((x) => x.classList.toggle('on', x === b));
    const t = body.querySelector('#typed'); if (t) t.style.color = ink;
  });
  m.root.querySelector('#s-clear').addEventListener('click', () => { if (mode === 'draw') pad.clear(); else body.querySelector('#typed').value = ''; });
  m.root.querySelector('#s-ok').addEventListener('click', () => {
    let url = null;
    if (mode === 'draw') url = pad.export();
    else {
      const v = body.querySelector('#typed').value.trim();
      if (v) url = typedSignature(v, ink);
    }
    if (!url) { toast(mode === 'draw' ? 'Draw your signature first.' : 'Type your name first.', 'bad'); return; }
    try { localStorage.setItem(SIG_KEY, url); } catch (e) {}
    m.close();
    startPlacing({ type: 'sig', src: url });
  });
}

function drawPad(canvas, inkFn) {
  const dpr = window.devicePixelRatio || 1;
  const r = canvas.getBoundingClientRect();
  canvas.width = r.width * dpr; canvas.height = r.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  let drawing = false; let last = null; let any = false;
  const pos = (e) => { const b = canvas.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top, t: performance.now() }; };
  canvas.addEventListener('pointerdown', (e) => { drawing = true; last = pos(e); canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const p = pos(e);
    const dist = Math.hypot(p.x - last.x, p.y - last.y);
    const speed = dist / Math.max(1, p.t - last.t);
    ctx.strokeStyle = inkFn();
    ctx.lineWidth = Math.max(1.4, 3.4 - speed * 1.2);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.quadraticCurveTo(last.x, last.y, (last.x + p.x) / 2, (last.y + p.y) / 2);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p; any = true;
  });
  const end = () => { drawing = false; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  return {
    clear() { ctx.clearRect(0, 0, canvas.width, canvas.height); any = false; },
    export() { return any ? cropCanvas(canvas) : null; },
  };
}

function typedSignature(text, ink) {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const font = '120px "Snell Roundhand", "Segoe Script", "Brush Script MT", cursive';
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 80;
  c.width = w; c.height = 220;
  ctx.font = font; ctx.fillStyle = ink; ctx.textBaseline = 'middle';
  ctx.fillText(text, 40, 110);
  return cropCanvas(c);
}

// Trims empty space around a drawing so the signature box fits the ink.
function cropCanvas(c) {
  const ctx = c.getContext('2d');
  const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);
  let x0 = width; let y0 = height; let x1 = 0; let y1 = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4 + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (x1 <= x0 || y1 <= y0) return null;
  const pad = 8;
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(width, x1 + pad); y1 = Math.min(height, y1 + pad);
  const out = document.createElement('canvas');
  out.width = x1 - x0; out.height = y1 - y0;
  out.getContext('2d').drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  return out.toDataURL('image/png');
}

async function renderSign(box) {
  const f = selFile();
  if (!f) return;
  if (!P.sign || P.sign.fileId !== f.id) {
    box.innerHTML = '<div class="empty">Loading pages…</div>';
    try {
      const d = await pdfjsDoc(f.path);
      P.sign = { fileId: f.id, items: [], doc: d, views: [] };
    } catch (e) { box.innerHTML = '<div class="empty">This PDF can\'t be opened.</div>'; return; }
    renderOpts();
  }
  const sg = P.sign;
  box.innerHTML = '<div class="sign-stage" id="stage"></div>';
  const stage = box.querySelector('#stage');
  const width = Math.min(720, stage.clientWidth - 44);
  const dpr = window.devicePixelRatio || 1;
  const n = Math.min(sg.doc.numPages, 200);
  for (let i = 0; i < n; i++) {
    const page = await sg.doc.getPage(i + 1);
    const vp0 = page.getViewport({ scale: 1 });
    const scale = width / vp0.width;
    const vp = page.getViewport({ scale });
    sg.views[i] = { vp, scale, rotate: vp0.rotation };
    const wrap = el(`<div class="sign-page" data-page="${i}" style="width:${vp.width}px;height:${vp.height}px"></div>`);
    const c = document.createElement('canvas');
    c.width = vp.width * dpr; c.height = vp.height * dpr;
    c.style.width = `${vp.width}px`; c.style.height = `${vp.height}px`;
    wrap.appendChild(c);
    stage.appendChild(wrap);
    page.render({ canvasContext: c.getContext('2d'), viewport: page.getViewport({ scale: scale * dpr }) });
    wrap.addEventListener('click', (e) => {
      if (!P.placing || e.target.closest('.placed')) return;
      const b = wrap.getBoundingClientRect();
      const it = { id: newId(), page: i, ...P.placing };
      if (it.type === 'sig') {
        const img = new Image();
        img.src = it.src;
        img.decode().then(() => {
          it.w = Math.min(200, vp.width * 0.4); it.h = it.w * (img.naturalHeight / img.naturalWidth);
          it.x = e.clientX - b.left - it.w / 2; it.y = e.clientY - b.top - it.h / 2;
          sg.items.push(it); drawItem(wrap, it); renderOpts();
        });
      } else {
        it.size = 14; it.x = e.clientX - b.left; it.y = e.clientY - b.top - 10;
        sg.items.push(it); drawItem(wrap, it); renderOpts();
      }
      P.placing = null;
      stage.querySelectorAll('.sign-page').forEach((pg) => { pg.style.cursor = ''; });
      renderOpts();
    });
    for (const it of sg.items.filter((x) => x.page === i)) drawItem(wrap, it);
  }
}

function drawItem(wrap, it) {
  const node = el(`<div class="placed" style="left:${it.x}px;top:${it.y}px">
    ${it.type === 'sig' ? `<img src="${it.src}" alt="">` : `<div class="txt" style="font-size:${it.size}px">${esc(it.text)}</div>`}
    <span class="rs"></span><button class="del" title="Remove">×</button></div>`);
  if (it.type === 'sig') { node.style.width = `${it.w}px`; node.style.height = `${it.h}px`; }
  wrap.appendChild(node);
  node.querySelector('.del').addEventListener('click', (e) => {
    e.stopPropagation();
    P.sign.items = P.sign.items.filter((x) => x.id !== it.id);
    node.remove(); renderOpts();
  });
  const rs = node.querySelector('.rs');
  node.addEventListener('pointerdown', (e) => {
    if (e.target.classList.contains('del')) return;
    e.preventDefault();
    const resizing = e.target === rs;
    const sx = e.clientX; const sy = e.clientY;
    const start = { x: it.x, y: it.y, w: it.w, h: it.h, size: it.size };
    node.setPointerCapture(e.pointerId);
    const move = (ev) => {
      const dx = ev.clientX - sx; const dy = ev.clientY - sy;
      if (resizing) {
        if (it.type === 'sig') {
          it.w = Math.max(30, start.w + dx); it.h = it.w * (start.h / start.w);
          node.style.width = `${it.w}px`; node.style.height = `${it.h}px`;
        } else {
          it.size = Math.max(6, Math.min(72, start.size + dy * 0.5));
          node.querySelector('.txt').style.fontSize = `${it.size}px`;
        }
      } else {
        it.x = start.x + dx; it.y = start.y + dy;
        node.style.left = `${it.x}px`; node.style.top = `${it.y}px`;
      }
    };
    const up = () => { node.removeEventListener('pointermove', move); node.removeEventListener('pointerup', up); };
    node.addEventListener('pointermove', move);
    node.addEventListener('pointerup', up);
  });
}

async function saveSigned() {
  const f = selFile();
  const sg = P.sign;
  const doc = await loadLib(f.path);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const imgs = new Map();
  for (const it of sg.items) {
    const page = doc.getPage(it.page);
    const { vp, scale } = sg.views[it.page];
    if (it.type === 'sig') {
      if (!imgs.has(it.src)) imgs.set(it.src, await doc.embedPng(it.src));
      // convertToPdfPoint maps screen position to PDF position, including crop boxes.
      const [x, y] = vp.convertToPdfPoint(it.x, it.y + it.h);
      page.drawImage(imgs.get(it.src), { x, y, width: it.w / scale, height: it.h / scale });
    } else {
      const size = it.size / scale;
      const [x, y] = vp.convertToPdfPoint(it.x, it.y + it.size * 0.82);
      page.drawText(it.text, { x, y, size, font, color: rgb(0.07, 0.07, 0.07) });
    }
  }
  return save(f.path, '-signed', doc);
}
