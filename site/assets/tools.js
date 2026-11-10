// Fileshaper web tools. Every job runs inside the visitor's browser (JavaScript + WebAssembly).
// Files are read from the device and results are handed back as downloads. Nothing is uploaded.
const BASE = new URL('.', import.meta.url).href; // the site root (tools.js lives there)
const V = (p) => new URL(`vendor/${p}`, BASE).href;

// ---------- small helpers ----------
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (n) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(n < 10 * 1024 * 1024 ? 1 : 0)} MB`);
const baseName = (n) => n.replace(/\.[^.]+$/, '');
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const scripts = {};
const loadScript = (src) => scripts[src] || (scripts[src] = new Promise((res, rej) => {
  const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Could not load part of the tool. Check your connection and reload.')); document.head.appendChild(s);
}));
const pdfLib = async () => { await loadScript(V('pdf-lib.min.js')); return window.PDFLib; };
let pdfjsP = null;
const pdfjs = () => pdfjsP || (pdfjsP = import(V('pdfjs/pdf.min.mjs')).then((m) => { m.GlobalWorkerOptions.workerSrc = V('pdfjs/pdf.worker.min.mjs'); return m; }));
const blobOf = (canvas, type, q) => new Promise((r) => canvas.toBlob(r, type, q));

const ICON = {
  up: '<svg viewBox="0 0 24 24" class="ic"><path d="M12 15V4M7 8.5 12 4l5 4.5"/><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/></svg>',
  down: '<svg viewBox="0 0 24 24" class="ic"><path d="M12 4v11M7 10.5 12 15.5l5-5"/><path d="M4 20h16"/></svg>',
  lock: '<svg viewBox="0 0 24 24" class="ic"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  x: '<svg viewBox="0 0 24 24" class="ic"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  arrowUp: '<svg viewBox="0 0 24 24" class="ic"><path d="m6 15 6-6 6 6"/></svg>',
  arrowDown: '<svg viewBox="0 0 24 24" class="ic"><path d="m6 9 6 6 6-6"/></svg>',
};

// ---------- the shared widget shell ----------
function shell(root, cfg) {
  root.innerHTML = `
  <div class="wt-head"><b>${esc(cfg.title)}</b><span class="wt-private">${ICON.lock}Runs in your browser. Nothing is uploaded.</span></div>
  <label class="wt-drop">
    <input type="file" ${cfg.multiple ? 'multiple' : ''} accept="${cfg.accept}" hidden>
    ${ICON.up}<span><b>Drop ${esc(cfg.what)} here</b> or click to choose</span>
  </label>
  <div class="wt-files"></div>
  <div class="wt-opts"></div>
  <div class="wt-run"><button class="btn btn-primary" disabled>${esc(cfg.action)}</button><span class="wt-status" role="status"></span></div>
  <div class="wt-bar"><i></i></div>
  <div class="wt-out"></div>
  <p class="wt-app">${esc(cfg.appNote || 'Big files or hundreds at once? The free app is much faster.')} <a href="${new URL('download.html', BASE).href}">Get Fileshaper</a></p>`;
  const st = { files: [], opts: { ...(cfg.defaults || {}) }, busy: false };
  const input = root.querySelector('input');
  const drop = root.querySelector('.wt-drop');
  const runBtn = root.querySelector('.wt-run button');
  const status = root.querySelector('.wt-status');
  const bar = root.querySelector('.wt-bar i');
  const out = root.querySelector('.wt-out');
  const add = (list) => {
    let files = [...list].filter((f) => cfg.match(f));
    if (!files.length) { status.textContent = `That isn't ${cfg.what}.`; return; }
    if (cfg.maxBytes) {
      const big = files.filter((f) => f.size > cfg.maxBytes);
      if (big.length) status.textContent = `${big[0].name} is over ${fmt(cfg.maxBytes)}. Use the free app for big files.`;
      files = files.filter((f) => f.size <= cfg.maxBytes);
    }
    st.files = cfg.multiple ? [...st.files, ...files] : files.slice(0, 1);
    drawFiles(); if (cfg.onFiles) cfg.onFiles(st, api);
  };
  const drawFiles = () => {
    const box = root.querySelector('.wt-files');
    box.innerHTML = st.files.map((f, i) => `<div class="wt-file"><span>${esc(f.name)}</span><em>${fmt(f.size)}</em>${cfg.sortable && st.files.length > 1 ? `<button data-mv="${i}:-1" aria-label="Move up">${ICON.arrowUp}</button><button data-mv="${i}:1" aria-label="Move down">${ICON.arrowDown}</button>` : ''}<button data-rm="${i}" aria-label="Remove">${ICON.x}</button></div>`).join('');
    runBtn.disabled = !st.files.length || (cfg.minFiles && st.files.length < cfg.minFiles);
    runBtn.textContent = cfg.minFiles && st.files.length && st.files.length < cfg.minFiles ? `Add at least ${cfg.minFiles} files` : cfg.action;
  };
  root.querySelector('.wt-files').addEventListener('click', (e) => {
    const rm = e.target.closest('[data-rm]'); const mv = e.target.closest('[data-mv]');
    if (rm) { st.files.splice(+rm.dataset.rm, 1); drawFiles(); if (cfg.onFiles) cfg.onFiles(st, api); }
    if (mv) { const [i, d] = mv.dataset.mv.split(':').map(Number); const j = i + d; if (j >= 0 && j < st.files.length) { [st.files[i], st.files[j]] = [st.files[j], st.files[i]]; drawFiles(); } }
  });
  input.addEventListener('change', () => { add(input.files); input.value = ''; });
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove('over')));
  drop.addEventListener('drop', (e) => { e.preventDefault(); add(e.dataTransfer.files); });

  // Options are chips: [{ key, label, items: [[value, text], ...] }]
  const opts = root.querySelector('.wt-opts');
  const drawOpts = () => {
    opts.innerHTML = (cfg.options || []).filter((o) => !o.when || o.when(st.opts)).map((o) => `<div class="wt-opt"><span>${esc(o.label)}</span><div class="wt-chips" data-key="${o.key}">${o.items.map(([v, t]) => `<button class="${String(st.opts[o.key]) === String(v) ? 'on' : ''}" data-v="${v}">${esc(t)}</button>`).join('')}</div></div>`).join('') + (cfg.extraOpts ? cfg.extraOpts(st) : '');
    if (cfg.bindExtra) cfg.bindExtra(opts, st);
  };
  opts.addEventListener('click', (e) => {
    const b = e.target.closest('.wt-chips button'); if (!b) return;
    const key = b.parentElement.dataset.key; const v = b.dataset.v;
    st.opts[key] = isNaN(+v) ? v : +v; drawOpts();
  });
  drawOpts();

  const api = {
    progress(p) { bar.style.width = `${Math.max(0, Math.min(100, p))}%`; },
    status(t) { status.textContent = t; },
    result(blob, name, before) {
      const url = URL.createObjectURL(blob);
      const saved = before && blob.size < before ? ` · <span class="saved">−${Math.round((1 - blob.size / before) * 100)}%</span>` : '';
      out.appendChild(el(`<a class="wt-result" href="${url}" download="${esc(name)}">${ICON.down}<span>${esc(name)}</span><em>${before ? `${fmt(before)} → ` : ''}${fmt(blob.size)}${saved}</em></a>`));
    },
    note(t) { out.appendChild(el(`<p class="wt-note">${esc(t)}</p>`)); },
    redrawOpts: drawOpts,
    root,
  };
  runBtn.addEventListener('click', async () => {
    if (st.busy) return;
    st.busy = true; runBtn.disabled = true; out.innerHTML = ''; api.progress(0); api.status('Working…');
    root.classList.add('busy');
    try { await cfg.run(st, api); api.progress(100); api.status('Done. Your files are ready below.'); }
    catch (e) { api.progress(0); api.status(e.message || String(e)); }
    finally { st.busy = false; runBtn.disabled = false; root.classList.remove('busy'); }
  });
  return { st, api };
}

// ---------- images ----------
const isImage = (f) => /^image\//.test(f.type) || /\.(heic|heif)$/i.test(f.name);
async function toBitmap(file) {
  let blob = file;
  if (/\.(heic|heif)$/i.test(file.name) || /heic|heif/.test(file.type)) {
    await loadScript(V('heic2any.min.js'));
    blob = await window.heic2any({ blob: file, toType: 'image/png' });
    if (Array.isArray(blob)) blob = blob[0];
  }
  return createImageBitmap(blob, { imageOrientation: 'from-image' });
}
const imagesTool = (root, preset = {}) => shell(root, {
  title: preset.title || 'Convert, resize or compress images',
  what: 'images', accept: 'image/*,.heic,.heif', multiple: true, match: isImage,
  action: 'Convert images',
  defaults: { format: 'jpg', quality: 82, size: 0, ...preset.defaults },
  options: [
    { key: 'format', label: 'Save as', items: [['jpg', 'JPG'], ['png', 'PNG'], ['webp', 'WebP']] },
    { key: 'quality', label: 'Quality', items: [[92, 'Best'], [82, 'Great'], [65, 'Smaller']], when: (o) => o.format !== 'png' },
    { key: 'size', label: 'Size', items: [[0, 'Original'], [2560, '2560 px'], [1920, '1920 px'], [1080, '1080 px']] },
  ],
  async run(st, api) {
    const type = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[st.opts.format];
    for (const [i, f] of st.files.entries()) {
      api.status(`Converting ${i + 1} of ${st.files.length}…`);
      const bmp = await toBitmap(f);
      let { width: w, height: h } = bmp;
      const max = st.opts.size;
      if (max && Math.max(w, h) > max) { const k = max / Math.max(w, h); w = Math.round(w * k); h = Math.round(h * k); }
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      if (st.opts.format === 'jpg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); }
      ctx.drawImage(bmp, 0, 0, w, h);
      const blob = await blobOf(c, type, st.opts.quality / 100);
      api.result(blob, `${baseName(f.name)}.${st.opts.format}`, f.size);
      api.progress(((i + 1) / st.files.length) * 100);
    }
  },
});

// ---------- PDF ----------
const isPdf = (f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
async function loadPdf(file) {
  const { PDFDocument } = await pdfLib();
  try { return await PDFDocument.load(await file.arrayBuffer()); }
  catch (e) { throw new Error(/encrypt/i.test(String(e)) ? `${file.name} is password-protected. Remove the password first.` : `${file.name} looks damaged and can't be opened.`); }
}
const pdfMergeTool = (root) => shell(root, {
  title: 'Merge PDFs', what: 'PDFs', accept: 'application/pdf,.pdf', multiple: true, match: isPdf, sortable: true, minFiles: 2,
  action: 'Merge PDFs',
  async run(st, api) {
    const { PDFDocument } = await pdfLib();
    const outDoc = await PDFDocument.create();
    for (const [i, f] of st.files.entries()) {
      api.status(`Adding ${f.name}…`);
      const src = await loadPdf(f);
      (await outDoc.copyPages(src, src.getPageIndices())).forEach((p) => outDoc.addPage(p));
      api.progress(((i + 1) / st.files.length) * 90);
    }
    const bytes = await outDoc.save({ useObjectStreams: true });
    api.result(new Blob([bytes], { type: 'application/pdf' }), `${baseName(st.files[0].name)}-merged.pdf`);
    api.note(`${outDoc.getPageCount()} pages.`);
  },
});

const pdfCompressTool = (root) => shell(root, {
  title: 'Compress a PDF', what: 'PDFs', accept: 'application/pdf,.pdf', multiple: true, match: isPdf,
  action: 'Compress PDF', defaults: { level: 'strong', dpi: 120 },
  options: [
    { key: 'level', label: 'Strength', items: [['light', 'Light · keeps text'], ['strong', 'Strong · scans & photos']] },
    { key: 'dpi', label: 'Sharpness', items: [[96, 'Small'], [120, 'Balanced'], [160, 'Sharp']], when: (o) => o.level === 'strong' },
  ],
  async run(st, api) {
    const { PDFDocument } = await pdfLib();
    for (const f of st.files) {
      let bytes;
      if (st.opts.level === 'light') {
        bytes = await (await loadPdf(f)).save({ useObjectStreams: true });
      } else {
        const lib = await pdfjs();
        const src = await lib.getDocument({ data: new Uint8Array(await f.arrayBuffer()), isEvalSupported: false }).promise;
        const outDoc = await PDFDocument.create();
        for (let i = 1; i <= src.numPages; i++) {
          api.status(`${f.name}: page ${i} of ${src.numPages}…`);
          const page = await src.getPage(i);
          const base = page.getViewport({ scale: 1 }); const vp = page.getViewport({ scale: st.opts.dpi / 72 });
          const c = document.createElement('canvas'); c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
          const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
          await page.render({ canvasContext: ctx, viewport: vp }).promise;
          const img = await outDoc.embedJpg(await (await blobOf(c, 'image/jpeg', 0.72)).arrayBuffer());
          outDoc.addPage([base.width, base.height]).drawImage(img, { x: 0, y: 0, width: base.width, height: base.height });
          api.progress((i / src.numPages) * 100);
        }
        bytes = await outDoc.save({ useObjectStreams: true });
      }
      if (bytes.length >= f.size) { api.note(`${f.name} is already as small as it gets${st.opts.level === 'light' ? ' with Light. Try Strong.' : '.'}`); continue; }
      api.result(new Blob([bytes], { type: 'application/pdf' }), `${baseName(f.name)}-small.pdf`, f.size);
    }
  },
});

const pdfSplitTool = (root) => shell(root, {
  title: 'Split a PDF', what: 'a PDF', accept: 'application/pdf,.pdf', match: isPdf,
  action: 'Split PDF', defaults: { mode: 'every', ranges: '' },
  options: [{ key: 'mode', label: 'How', items: [['every', 'Every page'], ['pick', 'Pick pages']] }],
  extraOpts: (st) => (st.opts.mode === 'pick' ? `<div class="wt-opt"><span>Pages</span><input class="wt-input" type="text" placeholder="1-3, 5" value="${esc(st.opts.ranges)}"></div>` : ''),
  bindExtra: (box, st) => { const i = box.querySelector('.wt-input'); if (i) i.addEventListener('input', () => { st.opts.ranges = i.value; }); },
  async run(st, api) {
    const { PDFDocument } = await pdfLib();
    const f = st.files[0]; const src = await loadPdf(f); const n = src.getPageCount();
    let groups;
    if (st.opts.mode === 'every') groups = src.getPageIndices().map((i) => [i]);
    else {
      const pages = [];
      for (const part of st.opts.ranges.split(/[,;]+/).map((x) => x.trim()).filter(Boolean)) {
        const m = /^(\d*)\s*-\s*(\d*)$/.exec(part);
        const a = m ? (m[1] ? +m[1] : 1) : +part; const b = m ? (m[2] ? +m[2] : n) : +part;
        if (!a || !b || a < 1 || b > n || a > b) throw new Error(`"${part}" isn't a page range between 1 and ${n}.`);
        for (let i = a; i <= b; i++) pages.push(i - 1);
      }
      if (!pages.length) throw new Error('Type which pages you want, like 1-3, 5.');
      groups = [pages];
    }
    for (const [gi, g] of groups.entries()) {
      const d = await PDFDocument.create();
      (await d.copyPages(src, g)).forEach((p) => d.addPage(p));
      api.result(new Blob([await d.save()], { type: 'application/pdf' }), `${baseName(f.name)}-${groups.length > 1 ? `page${g[0] + 1}` : 'pages'}.pdf`);
      api.progress(((gi + 1) / groups.length) * 100);
    }
  },
});

// Sign: render pages, make a signature (draw or type), click to place it, drag to move.
const pdfSignTool = (root) => {
  const items = []; let views = []; let placing = null; let sig = null; let doc = null;
  const { st, api } = shell(root, {
    title: 'Sign a PDF', what: 'a PDF', accept: 'application/pdf,.pdf', match: isPdf,
    action: 'Save signed PDF', appNote: 'Want your signature saved for next time? The free app remembers it.',
    extraOpts: () => `<div class="wt-sign">
      <div class="wt-sigtabs"><button class="on" data-m="draw">Draw</button><button data-m="type">Type</button></div>
      <canvas class="wt-pad"></canvas><input class="wt-input wt-typed" type="text" placeholder="Type your name" hidden>
      <div class="wt-sigbtns"><button class="btn btn-ghost btn-sm" data-a="clear">Clear</button><button class="btn btn-ghost btn-sm" data-a="place">Place signature</button><button class="btn btn-ghost btn-sm" data-a="date">Add today's date</button></div>
      <p class="wt-hint">Make your signature, click “Place signature”, then click on the page. Drag to move it.</p>
      <div class="wt-pages"></div></div>`,
    bindExtra: (box) => {
      const pad = box.querySelector('.wt-pad'); const typed = box.querySelector('.wt-typed');
      if (!pad) return;
      let mode = 'draw';
      const r = pad.getBoundingClientRect(); const dpr = devicePixelRatio || 1;
      pad.width = (r.width || 480) * dpr; pad.height = 140 * dpr; const ctx = pad.getContext('2d'); ctx.scale(dpr, dpr);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2.6;
      let down = false; let last = null; let inked = false;
      const pos = (e) => { const b = pad.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
      pad.addEventListener('pointerdown', (e) => { down = true; last = pos(e); pad.setPointerCapture(e.pointerId); });
      pad.addEventListener('pointermove', (e) => { if (!down) return; const p = pos(e); ctx.beginPath(); ctx.moveTo(...last); ctx.lineTo(...p); ctx.stroke(); last = p; inked = true; });
      pad.addEventListener('pointerup', () => { down = false; });
      box.querySelector('.wt-sigtabs').addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return; mode = b.dataset.m;
        box.querySelectorAll('.wt-sigtabs button').forEach((x) => x.classList.toggle('on', x === b));
        pad.hidden = mode !== 'draw'; typed.hidden = mode !== 'type';
      });
      const makeSig = () => {
        const c = document.createElement('canvas');
        if (mode === 'draw') { if (!inked) return null; c.width = pad.width; c.height = pad.height; c.getContext('2d').drawImage(pad, 0, 0); }
        else {
          const v = typed.value.trim(); if (!v) return null;
          const x = c.getContext('2d'); const font = '96px "Snell Roundhand","Segoe Script","Brush Script MT",cursive';
          x.font = font; c.width = Math.ceil(x.measureText(v).width) + 40; c.height = 140;
          const y = c.getContext('2d'); y.font = font; y.fillStyle = '#111'; y.textBaseline = 'middle'; y.fillText(v, 20, 70);
        }
        return c.toDataURL('image/png');
      };
      box.querySelector('.wt-sigbtns').addEventListener('click', (e) => {
        const a = e.target.closest('[data-a]')?.dataset.a;
        if (a === 'clear') { ctx.clearRect(0, 0, pad.width, pad.height); inked = false; typed.value = ''; }
        if (a === 'place') { sig = makeSig(); if (!sig) { api.status(mode === 'draw' ? 'Draw your signature first.' : 'Type your name first.'); return; } placing = { type: 'sig', src: sig }; api.status('Now click on the page where it goes.'); }
        if (a === 'date') { placing = { type: 'text', text: new Date().toLocaleDateString() }; api.status('Now click on the page where the date goes.'); }
      });
    },
    onFiles: async (s) => {
      const wrap = root.querySelector('.wt-pages'); items.length = 0; views = []; wrap.innerHTML = '';
      if (!s.files.length) return;
      const lib = await pdfjs();
      doc = await lib.getDocument({ data: new Uint8Array(await s.files[0].arrayBuffer()), isEvalSupported: false }).promise;
      const width = Math.min(640, wrap.clientWidth || 640);
      for (let i = 0; i < Math.min(doc.numPages, 30); i++) {
        const page = await doc.getPage(i + 1); const v0 = page.getViewport({ scale: 1 }); const scale = width / v0.width; const vp = page.getViewport({ scale });
        views[i] = { vp, scale };
        const pg = el(`<div class="wt-page" style="width:${vp.width}px;height:${vp.height}px"></div>`);
        const c = document.createElement('canvas'); const dpr = devicePixelRatio || 1; c.width = vp.width * dpr; c.height = vp.height * dpr; c.style.width = '100%';
        pg.appendChild(c); wrap.appendChild(pg);
        page.render({ canvasContext: c.getContext('2d'), viewport: page.getViewport({ scale: scale * dpr }) });
        pg.addEventListener('click', async (e) => {
          if (!placing || e.target.closest('.wt-placed')) return;
          const b = pg.getBoundingClientRect(); const it = { page: i, ...placing };
          if (it.type === 'sig') { const im = new Image(); im.src = it.src; await im.decode(); it.w = Math.min(200, vp.width * 0.4); it.h = it.w * im.naturalHeight / im.naturalWidth; it.x = e.clientX - b.left - it.w / 2; it.y = e.clientY - b.top - it.h / 2; }
          else { it.size = 14; it.x = e.clientX - b.left; it.y = e.clientY - b.top - 10; }
          items.push(it); drawItem(pg, it); placing = null; api.status('');
        });
      }
    },
    async run(s, a) {
      if (!items.length) throw new Error('Place your signature on the page first.');
      const { PDFDocument, StandardFonts, rgb } = await pdfLib();
      const d = await loadPdf(s.files[0]); const font = await d.embedFont(StandardFonts.Helvetica);
      for (const it of items) {
        const page = d.getPage(it.page); const { vp, scale } = views[it.page];
        if (it.type === 'sig') { const img = await d.embedPng(it.src); const [x, y] = vp.convertToPdfPoint(it.x, it.y + it.h); page.drawImage(img, { x, y, width: it.w / scale, height: it.h / scale }); }
        else { const [x, y] = vp.convertToPdfPoint(it.x, it.y + it.size * 0.82); page.drawText(it.text, { x, y, size: it.size / scale, font, color: rgb(0.07, 0.07, 0.07) }); }
      }
      a.result(new Blob([await d.save()], { type: 'application/pdf' }), `${baseName(s.files[0].name)}-signed.pdf`);
    },
  });
  function drawItem(pg, it) {
    const n = el(`<div class="wt-placed" style="left:${it.x}px;top:${it.y}px">${it.type === 'sig' ? `<img src="${it.src}" alt="">` : `<span style="font-size:${it.size}px">${esc(it.text)}</span>`}<button aria-label="Remove">×</button></div>`);
    if (it.type === 'sig') { n.style.width = `${it.w}px`; n.style.height = `${it.h}px`; }
    pg.appendChild(n);
    n.querySelector('button').addEventListener('click', (e) => { e.stopPropagation(); items.splice(items.indexOf(it), 1); n.remove(); });
    n.addEventListener('pointerdown', (e) => {
      if (e.target.tagName === 'BUTTON') return; e.preventDefault();
      const sx = e.clientX; const sy = e.clientY; const ox = it.x; const oy = it.y; n.setPointerCapture(e.pointerId);
      const mv = (ev) => { it.x = ox + ev.clientX - sx; it.y = oy + ev.clientY - sy; n.style.left = `${it.x}px`; n.style.top = `${it.y}px`; };
      const up = () => { n.removeEventListener('pointermove', mv); n.removeEventListener('pointerup', up); };
      n.addEventListener('pointermove', mv); n.addEventListener('pointerup', up);
    });
  }
  return { st, api };
};

// ---------- video (FFmpeg compiled to WebAssembly, loaded only when used) ----------
let ffP = null;
function ffmpeg(api) {
  if (!ffP) {
    ffP = (async () => {
      api.status('Loading the video engine (about 32 MB, only the first time)…');
      await loadScript(V('ffmpeg/ffmpeg.js'));
      const ff = new window.FFmpegWASM.FFmpeg();
      await ff.load({ coreURL: V('ffmpeg/ffmpeg-core.js'), wasmURL: V('ffmpeg/ffmpeg-core.wasm') });
      return ff;
    })().catch((e) => { ffP = null; throw e; });
  }
  return ffP;
}
const isVideo = (f) => /^video\//.test(f.type) || /\.(mp4|mov|m4v|mkv|webm|avi)$/i.test(f.name);
async function videoDuration(file) {
  return new Promise((res) => {
    const v = document.createElement('video'); v.preload = 'metadata';
    v.onloadedmetadata = () => { res(v.duration); URL.revokeObjectURL(v.src); };
    v.onerror = () => res(0); v.src = URL.createObjectURL(file);
  });
}
async function runFF(api, file, args, outName, from = 0, span = 100) {
  const ff = await ffmpeg(api);
  const inName = `in.${(file.name.split('.').pop() || 'mp4').toLowerCase()}`;
  await ff.writeFile(inName, new Uint8Array(await file.arrayBuffer()));
  const onProg = ({ progress }) => api.progress(from + Math.max(0, Math.min(1, progress)) * span);
  ff.on('progress', onProg);
  try {
    const code = await ff.exec(['-i', inName, ...args, outName]);
    if (code !== 0) throw new Error("Couldn't process this video. It may be damaged or in an unusual format.");
    const data = await ff.readFile(outName);
    return new Blob([data.buffer], { type: outName.endsWith('.gif') ? 'image/gif' : 'video/mp4' });
  } finally {
    ff.off('progress', onProg);
    try { await ff.deleteFile(inName); await ff.deleteFile(outName); } catch (e) {}
  }
}
const videoCompressTool = (root) => shell(root, {
  title: 'Compress a video for Discord', what: 'a video', accept: 'video/*', match: isVideo, maxBytes: 200 * 1024 * 1024,
  action: 'Compress video', defaults: { mb: 10 },
  appNote: 'In the browser this takes a while for long videos. The free app is 5–20× faster.',
  options: [{ key: 'mb', label: 'Size limit', items: [[8, '8 MB'], [10, '10 MB · Discord'], [25, '25 MB · Email'], [50, '50 MB']] }],
  async run(st, api) {
    const f = st.files[0];
    if (f.size <= st.opts.mb * 1e6) { api.note(`${f.name} is already under ${st.opts.mb} MB.`); return; }
    const dur = await videoDuration(f);
    if (!dur) throw new Error("Couldn't read this video's length.");
    const total = (st.opts.mb * 8 * 1000 * 0.9) / dur; const audio = Math.round(Math.min(96, Math.max(32, total * 0.12))); const vk = Math.max(60, Math.floor(total - audio));
    const h = vk < 350 ? 360 : vk < 800 ? 480 : 720;
    api.status('Compressing… keep this tab open.');
    const blob = await runFF(api, f, ['-vf', `scale=-2:'min(${h},ih)'`, '-c:v', 'libx264', '-preset', 'veryfast', '-b:v', `${vk}k`, '-maxrate', `${Math.round(vk * 1.2)}k`, '-bufsize', `${vk}k`, '-c:a', 'aac', '-b:a', `${audio}k`, '-movflags', '+faststart'], 'out.mp4');
    api.result(blob, `${baseName(f.name)}-${st.opts.mb}MB.mp4`, f.size);
  },
});
const gifTool = (root) => shell(root, {
  title: 'Make a GIF from a video', what: 'a video', accept: 'video/*', match: isVideo, maxBytes: 200 * 1024 * 1024,
  action: 'Make GIF', defaults: { start: 0, len: 4, width: 480, fps: 15 },
  options: [
    { key: 'len', label: 'Length', items: [[2, '2 s'], [4, '4 s'], [6, '6 s'], [10, '10 s']] },
    { key: 'width', label: 'Width', items: [[320, '320 px'], [480, '480 px'], [640, '640 px']] },
    { key: 'fps', label: 'Smoothness', items: [[10, '10 fps'], [15, '15 fps'], [24, '24 fps']] },
  ],
  extraOpts: (st) => (st.files.length ? `<div class="wt-opt wt-col"><span>Start at <b class="wt-t">${st.opts.start.toFixed(1)} s</b></span><video class="wt-video" src="${st.url || ''}" controls muted playsinline></video></div>` : ''),
  bindExtra: (box, st) => {
    const v = box.querySelector('.wt-video'); if (!v) return;
    v.currentTime = st.opts.start;
    v.addEventListener('timeupdate', () => { st.opts.start = v.currentTime; const t = box.querySelector('.wt-t'); if (t) t.textContent = `${v.currentTime.toFixed(1)} s`; });
  },
  onFiles: (st, api) => { if (st.url) URL.revokeObjectURL(st.url); st.url = st.files[0] ? URL.createObjectURL(st.files[0]) : ''; st.opts.start = 0; api.redrawOpts(); },
  async run(st, api) {
    const f = st.files[0]; const o = st.opts;
    api.status('Making your GIF… keep this tab open.');
    const blob = await runFF(api, f, ['-ss', String(o.start), '-t', String(o.len), '-vf', `fps=${o.fps},scale=${o.width}:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`, '-loop', '0'], 'out.gif');
    api.result(blob, `${baseName(f.name)}.gif`);
  },
});

// ---------- mount ----------
const TOOLS = {
  images: (r) => imagesTool(r),
  'heic-to-jpg': (r) => imagesTool(r, { title: 'Convert HEIC to JPG', defaults: { format: 'jpg' } }),
  'pdf-merge': pdfMergeTool, 'pdf-compress': pdfCompressTool, 'pdf-split': pdfSplitTool, 'pdf-sign': pdfSignTool,
  'video-compress': videoCompressTool, 'video-gif': gifTool,
};
document.querySelectorAll('[data-tool]').forEach((n) => { const make = TOOLS[n.dataset.tool]; if (make) { n.classList.add('webtool'); make(n); } });
