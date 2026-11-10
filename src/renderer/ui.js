// Shared helpers: icons, formatting, toasts and modals.

const s = (d) => `<svg viewBox="0 0 24 24">${d}</svg>`;
export const ICON = {
  circle: s('<circle cx="12" cy="12" r="7.5"/>'),
  dash: s('<circle cx="12" cy="12" r="7.5"/><path d="M8.5 12h7"/>'),
  spin: '<svg viewBox="0 0 24 24" class="spin"><circle cx="12" cy="12" r="7.5" opacity=".25"/><path d="M12 4.5a7.5 7.5 0 0 1 7.5 7.5"/></svg>',
  home: s('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-6h4v6"/>'),
  video: s('<rect x="3" y="5" width="13" height="14" rx="2.5"/><path d="m16 10 5-3v10l-5-3"/>'),
  image: s('<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="9.5" r="1.8"/><path d="m21 16-5.5-5.5L5 20"/>'),
  pdf: s('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>'),
  audio: s('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
  history: s('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>'),
  settings: s('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  heart: s('<path d="M12 21s-7.5-4.6-9.5-9.4C1 8 3.3 4.5 6.9 4.5c2.1 0 3.6 1.2 5.1 3 1.5-1.8 3-3 5.1-3 3.6 0 5.9 3.5 4.4 7.1C19.5 16.4 12 21 12 21z"/>'),
  plus: s('<path d="M12 5v14M5 12h14"/>'),
  x: s('<path d="M18 6 6 18M6 6l12 12"/>'),
  folder: s('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
  open: s('<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>'),
  check: s('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  alert: s('<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16.2v.3"/>'),
  scissors: s('<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>'),
  gif: s('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M10 10H8.5a1.5 1.5 0 0 0-1.5 1.5v1A1.5 1.5 0 0 0 8.5 14H10v-2H9M13 10v4M16 14v-4h2.5M16 12h2"/>'),
  music: s('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
  film: s('<rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M7 3v18M17 3v18M3 8h4M17 8h4M3 16h4M17 16h4M3 12h18"/>'),
  mute: s('<path d="M11 5 6 9H3v6h3l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>'),
  shrink: s('<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>'),
  resize: s('<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>'),
  swap: s('<path d="M7 4 3 8l4 4"/><path d="M3 8h14a4 4 0 0 1 4 4"/><path d="m17 20 4-4-4-4"/><path d="M21 16H7a4 4 0 0 1-4-4"/>'),
  rotate: s('<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>'),
  trash: s('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  grip: s('<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>'),
  pen: s('<path d="M3 21c3-1 5.5-2.5 7-4l9-9a2.1 2.1 0 0 0-3-3l-9 9c-1.5 1.5-3 4-4 7z"/><path d="M14 7l3 3"/>'),
  type: s('<path d="M4 7V5h16v2M9 19h6M12 5v14"/>'),
  calendar: s('<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  split: s('<path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3M12 3v18"/>'),
  merge: s('<path d="M8 6 12 2l4 4M12 2v10l-6 6v4M12 12l6 6v4"/>'),
  layers: s('<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>'),
  stack: s('<rect x="4" y="3" width="16" height="6" rx="1.5"/><rect x="4" y="11" width="16" height="10" rx="1.5"/>'),
  louder: s('<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>'),
  sparkle: s('<path d="M12 3c.6 4.3 2.7 6.4 7 7-4.3.6-6.4 2.7-7 7-.6-4.3-2.7-6.4-7-7 4.3-.6 6.4-2.7 7-7z"/>'),
  upload: s('<path d="M12 15V4M7 8.5 12 4l5 4.5"/><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>'),
  github: s('<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>'),
  copy: s('<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>'),
  coffee: s('<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17M8 2v3M12 2v3"/>'),
};

export const KINDS = {
  video: { label: 'Video', color: 'var(--video)', exts: ['mp4', 'mov', 'm4v', 'mkv', 'webm', 'avi', 'wmv', 'flv', '3gp', 'mts', 'm2ts', 'mpg', 'mpeg', 'ts'] },
  image: { label: 'Images', color: 'var(--image)', exts: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'gif', 'bmp', 'tif', 'tiff', 'avif'] },
  pdf: { label: 'PDF', color: 'var(--pdf)', exts: ['pdf'] },
  audio: { label: 'Audio', color: 'var(--audio)', exts: ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'opus', 'flac', 'wma', 'aiff', 'aif'] },
};

export const extOf = (p) => (p.split('.').pop() || '').toLowerCase();
export const baseName = (p) => p.split(/[\\/]/).pop();
export function kindOf(p) {
  const e = extOf(p);
  return Object.keys(KINDS).find((k) => KINDS[k].exts.includes(e)) || null;
}

export function fmtBytes(n) {
  if (!n && n !== 0) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 / 1024).toFixed(n < 10 * 1024 * 1024 ? 1 : 0)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}

export function fmtTime(sec) {
  if (!isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s2 = sec - m * 60;
  return `${m}:${s2 < 10 ? '0' : ''}${s2.toFixed(1)}`;
}

export function fmtAgo(t) {
  const d = (Date.now() - t) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)} min ago`;
  if (d < 86400) return `${Math.floor(d / 3600)} h ago`;
  return new Date(t).toLocaleDateString();
}

export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function savedLabel(before, after) {
  if (!before || !after) return '';
  const pct = Math.round((1 - after / before) * 100);
  if (pct > 0) return `<span class="saved">${fmtBytes(before)} → ${fmtBytes(after)} · −${pct}%</span>`;
  return `<span class="grew">${fmtBytes(after)}</span>`;
}

export function toast(msg, type = 'ok', ms = 3600) {
  const t = el(`<div class="toast ${type}">${type === 'bad' ? ICON.alert : ICON.check}<div>${msg}</div></div>`);
  document.getElementById('toasts').appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, ms);
}

export function openModal(html) {
  const back = el(`<div class="modal-back"><div class="modal">${html}</div></div>`);
  const close = () => back.remove();
  back.addEventListener('mousedown', (e) => { if (e.target === back) close(); });
  const onKey = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } };
  document.addEventListener('keydown', onKey);
  document.getElementById('modal-root').appendChild(back);
  return { root: back.querySelector('.modal'), close };
}

let uid = 0;
export const newId = () => `j${Date.now().toString(36)}${(uid++).toString(36)}`;

// Lets the user drag rows in a list to reorder an array.
export function makeSortable(container, selector, arr, onChange) {
  let from = -1;
  container.querySelectorAll(selector).forEach((node, i) => {
    node.draggable = true;
    node.addEventListener('dragstart', (e) => { from = i; node.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/filesmith-sort', '1'); });
    node.addEventListener('dragend', () => { node.classList.remove('dragging'); container.querySelectorAll('.over').forEach((n) => n.classList.remove('over')); });
    node.addEventListener('dragover', (e) => { if (from < 0) return; e.preventDefault(); e.stopPropagation(); node.classList.add('over'); });
    node.addEventListener('dragleave', () => node.classList.remove('over'));
    node.addEventListener('drop', (e) => {
      if (from < 0) return;
      e.preventDefault(); e.stopPropagation();
      const [moved] = arr.splice(from, 1);
      arr.splice(i, 0, moved);
      from = -1;
      onChange();
    });
  });
}

// A sliding selection for segmented controls. Remembers where it was per control (key),
// so it slides from the old option to the new one even when the control is re-rendered.
const segPos = new Map();
export function segIndicator(seg, key) {
  if (!seg) return;
  const on = seg.querySelector('button.on');
  if (!on) return;
  let ind = seg.querySelector('.seg-ind');
  if (!ind) { ind = document.createElement('span'); ind.className = 'seg-ind'; seg.prepend(ind); seg.classList.add('has-ind'); }
  const to = { x: on.offsetLeft, y: on.offsetTop - 2, w: on.offsetWidth };
  const from = segPos.get(key);
  const place = (p) => { ind.style.width = `${p.w}px`; ind.style.transform = `translate(${p.x}px, ${p.y}px)`; };
  if (from && (from.x !== to.x || from.w !== to.w)) {
    ind.style.transition = 'none'; place(from); ind.offsetWidth; ind.style.transition = '';
  }
  requestAnimationFrame(() => place(to));
  if (!from) { ind.style.transition = 'none'; place(to); ind.offsetWidth; ind.style.transition = ''; }
  segPos.set(key, to);
}
