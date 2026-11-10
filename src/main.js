// Filesmith — main process. Window, local file serving, and the ffmpeg/HEIC jobs.
// Everything runs on this computer. Filesmith makes no network requests.
const { app, BrowserWindow, ipcMain, dialog, shell, protocol, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { Readable } = require('stream');
const ff = require('./ffmpeg');
const store = require('./store');

const isMac = process.platform === 'darwin';
const appRoot = path.join(__dirname, '..');

protocol.registerSchemesAsPrivileged([{
  scheme: 'filesmith',
  privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, corsEnabled: true },
}]);

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.bmp': 'image/bmp',
  '.mp4': 'video/mp4', '.m4v': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm',
  '.mkv': 'video/x-matroska', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.wav': 'audio/wav',
  '.ogg': 'audio/ogg', '.flac': 'audio/flac', '.pdf': 'application/pdf', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.wasm': 'application/wasm',
};

// Serves a file with HTTP Range support so <video> can seek.
function serveFile(file, request) {
  let stat;
  try { stat = fs.statSync(file); } catch (e) { return new Response('Not found', { status: 404 }); }
  if (!stat.isFile()) return new Response('Not found', { status: 404 });
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const range = request.headers.get('range');
  const base = { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Access-Control-Allow-Origin': '*' };
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    let start = m && m[1] ? parseInt(m[1], 10) : 0;
    let end = m && m[2] ? parseInt(m[2], 10) : stat.size - 1;
    if (!m || start >= stat.size) return new Response('', { status: 416, headers: { 'Content-Range': `bytes */${stat.size}` } });
    end = Math.min(end, stat.size - 1);
    const body = Readable.toWeb(fs.createReadStream(file, { start, end }));
    return new Response(body, {
      status: 206,
      headers: { ...base, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': String(end - start + 1) },
    });
  }
  return new Response(Readable.toWeb(fs.createReadStream(file)), {
    status: 200, headers: { ...base, 'Content-Length': String(stat.size) },
  });
}

function registerProtocol() {
  // filesmith://app/<path>   -> Filesmith's own files
  // filesmith://file/<path>  -> a file the user dropped in (URL-encoded absolute path)
  protocol.handle('filesmith', (request) => {
    const url = new URL(request.url);
    if (url.host === 'app') {
      const p = path.normalize(path.join(appRoot, decodeURIComponent(url.pathname)));
      if (!p.startsWith(appRoot)) return new Response('Forbidden', { status: 403 });
      return serveFile(p, request);
    }
    if (url.host === 'file') {
      return serveFile(decodeURIComponent(url.pathname.slice(1)), request);
    }
    return new Response('Not found', { status: 404 });
  });
}

let win;
// Window chrome follows the light/dark theme so the title bar never clashes with the app.
function chromeColors() {
  const t = store.settings.theme || 'dark';
  const dark = t === 'dark' || (t === 'system' && nativeTheme.shouldUseDarkColors);
  return dark ? { bg: '#1c1c1e', symbol: '#ececef' } : { bg: '#f5f5f4', symbol: '#1c1c1e' };
}

function applyChrome() {
  if (!win) return;
  const t = store.settings.theme || 'dark';
  nativeTheme.themeSource = t;
  if (!isMac && win.setTitleBarOverlay) {
    win.setTitleBarOverlay({ color: '#00000000', symbolColor: chromeColors().symbol, height: 44 });
  }
}

function createWindow() {
  const isWin11 = process.platform === 'win32' && Number((require('os').release().split('.')[2]) || 0) >= 22000;
  nativeTheme.themeSource = store.settings.theme || 'dark';
  win = new BrowserWindow({
    width: 1240,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Filesmith',
    // A transparent window lets the sidebar show the system material (macOS vibrancy, Windows 11 Mica).
    backgroundColor: isMac || isWin11 ? '#00000000' : chromeColors().bg,
    ...(isMac ? { vibrancy: 'sidebar', visualEffectState: 'followWindow' } : {}),
    ...(isWin11 ? { backgroundMaterial: 'mica' } : {}),
    titleBarStyle: 'hidden',
    ...(isMac
      ? { trafficLightPosition: { x: 18, y: 18 } }
      : { titleBarOverlay: { color: '#00000000', symbolColor: chromeColors().symbol, height: 44 } }),
    icon: path.join(appRoot, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });
  nativeTheme.on('updated', applyChrome);
  const sendFs = () => { if (!win.isDestroyed()) win.webContents.send('fullscreen', win.isFullScreen()); };
  win.on('enter-full-screen', sendFs);
  win.on('leave-full-screen', sendFs);
  win.loadURL('filesmith://app/src/renderer/index.html');
  // Links open in the real browser, never inside Filesmith.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('filesmith://')) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); }
  });
}

// ---------- Output naming ----------

function outputPath(input, suffix, ext, dirOverride) {
  const dir = dirOverride || store.settings.outDir || path.dirname(input);
  const base = path.basename(input, path.extname(input));
  let candidate = path.join(dir, `${base}${suffix}${ext}`);
  let n = 2;
  while (fs.existsSync(candidate)) candidate = path.join(dir, `${base}${suffix} (${n++})${ext}`);
  return candidate;
}

function tmpFile(ext) {
  const dir = path.join(os.tmpdir(), 'filesmith');
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
}

// ---------- IPC ----------

const jobs = new Map(); // jobId -> AbortController

function registerIpc() {
  ipcMain.handle('pick-files', async (_e, opts = {}) => {
    const r = await dialog.showOpenDialog(win, {
      properties: ['openFile', 'multiSelections'],
      filters: opts.filters,
    });
    return r.canceled ? [] : r.filePaths;
  });

  ipcMain.handle('pick-folder', async () => {
    const r = await dialog.showOpenDialog(win, { properties: ['openDirectory', 'createDirectory'] });
    return r.canceled ? null : r.filePaths[0];
  });

  ipcMain.handle('stat', (_e, file) => {
    try { const s = fs.statSync(file); return { size: s.size, name: path.basename(file), dir: path.dirname(file) }; }
    catch (e) { return null; }
  });

  ipcMain.handle('probe', (_e, file) => ff.probe(file));

  ipcMain.handle('read-file', (_e, file) => fs.promises.readFile(file));

  // Renderer-made outputs (PDF tools): bytes in, saved file path out.
  ipcMain.handle('save-output', async (_e, { input, suffix, ext, bytes }) => {
    const out = outputPath(input, suffix, ext);
    await fs.promises.writeFile(out, Buffer.from(bytes));
    return finishOutput(input, out);
  });

  ipcMain.handle('heic-to-jpg', async (_e, file) => {
    const out = tmpFile('.jpg');
    await heicTo(file, out, 'JPEG', 0.92);
    return out;
  });

  ipcMain.handle('run-job', async (e, { jobId, tool, action, file, options }) => {
    const ctl = new AbortController();
    jobs.set(jobId, ctl);
    const onProgress = (pct) => { if (!e.sender.isDestroyed()) e.sender.send('job-progress', { jobId, pct }); };
    try {
      const out = await runJob(tool, action, file, options || {}, { onProgress, signal: ctl.signal });
      return { ok: true, ...finishOutput(file, out) };
    } catch (err) {
      return { ok: false, error: ctl.signal.aborted ? 'Cancelled' : friendlyError(err) };
    } finally {
      jobs.delete(jobId);
    }
  });

  ipcMain.handle('cancel-job', (_e, jobId) => { const c = jobs.get(jobId); if (c) c.abort(); });

  ipcMain.handle('show-in-folder', (_e, file) => shell.showItemInFolder(file));
  ipcMain.handle('open-file', (_e, file) => shell.openPath(file));
  ipcMain.handle('open-external', (_e, url) => { if (/^https:\/\//.test(url)) shell.openExternal(url); });

  ipcMain.handle('get-state', () => ({
    settings: store.settings, history: store.history, stats: store.stats,
    platform: process.platform, version: app.getVersion(),
  }));
  ipcMain.handle('set-settings', (_e, patch) => { store.setSettings(patch); if ('theme' in patch) applyChrome(); return store.settings; });
  ipcMain.handle('clear-history', () => { store.clearHistory(); return true; });
}

function finishOutput(input, out) {
  let before = 0; let after = 0;
  try { before = fs.statSync(input).size; } catch (e) {}
  try { after = fs.statSync(out).size; } catch (e) {}
  const item = { input, output: out, name: path.basename(out), before, after, at: Date.now() };
  store.addHistory(item);
  return item;
}

function friendlyError(err) {
  const msg = String((err && err.message) || err);
  if (/Invalid data found|could not find codec|Unknown format/i.test(msg)) return "Filesmith couldn't read this file. It may be damaged or in an unusual format.";
  if (/No such file/i.test(msg)) return 'The file was moved or deleted.';
  if (/Permission denied|EACCES|EPERM/i.test(msg)) return "Filesmith isn't allowed to save in that folder. Pick another output folder in Settings.";
  if (/No space left/i.test(msg)) return 'Your disk is full.';
  return msg.split('\n').slice(-2).join(' ').slice(0, 300);
}

async function heicTo(file, out, format, quality) {
  const convert = require('heic-convert');
  const buffer = await fs.promises.readFile(file);
  const result = await convert({ buffer, format, quality });
  await fs.promises.writeFile(out, Buffer.from(result));
}

const isHeic = (f) => /\.(heic|heif)$/i.test(f);

// ---------- Jobs ----------

async function runJob(tool, action, file, o, ctx) {
  if (tool === 'video') return videoJob(action, file, o, ctx);
  if (tool === 'image') return imageJob(action, file, o, ctx);
  if (tool === 'audio') return audioJob(action, file, o, ctx);
  throw new Error(`Unknown tool ${tool}`);
}

const even = (n) => Math.max(2, Math.round(n / 2) * 2);

async function videoJob(action, file, o, ctx) {
  const info = await ff.probe(file);
  if (!info.hasVideo) throw new Error('This file has no video track.');
  const trim = [];
  if (o.start > 0) trim.push('-ss', String(o.start));
  if (o.end > 0 && o.end > (o.start || 0)) trim.push('-to', String(o.end));
  const span = Math.max(0.1, ((o.end > 0 ? o.end : info.duration) - (o.start || 0)) || info.duration);
  const common = ['-pix_fmt', 'yuv420p', '-movflags', '+faststart'];

  if (action === 'compress') {
    const out = outputPath(file, o.targetMB ? `-${o.targetMB}MB` : '-small', '.mp4');
    if (o.targetMB) {
      // Two-pass encode that lands just under the target size.
      const totalKbps = (o.targetMB * 8 * 1000 * 0.95) / span;
      const audioKbps = info.hasAudio ? Math.round(Math.min(128, Math.max(40, totalKbps * 0.12))) : 0;
      const videoKbps = Math.max(60, Math.floor(totalKbps - audioKbps));
      let maxH = 1080;
      if (videoKbps < 350) maxH = 360; else if (videoKbps < 700) maxH = 480; else if (videoKbps < 1500) maxH = 720;
      const h = Math.min(info.height || maxH, maxH);
      const scale = ['-vf', `scale=-2:${even(h)}`];
      const fps = info.fps > 30 && videoKbps < 1500 ? ['-r', '30'] : [];
      const log = tmpFile('');
      const v = ['-c:v', 'libx264', '-preset', 'medium', '-b:v', `${videoKbps}k`, '-maxrate', `${Math.round(videoKbps * 1.4)}k`, '-bufsize', `${videoKbps * 2}k`, '-passlogfile', log];
      await ff.run([...trim, '-i', file, ...scale, ...fps, ...v, '-pass', '1', '-an', '-f', 'mp4', isMac || process.platform !== 'win32' ? '/dev/null' : 'NUL'],
        { duration: span, signal: ctx.signal, onProgress: (p) => ctx.onProgress(p * 0.5) });
      const a = info.hasAudio ? ['-c:a', 'aac', '-b:a', `${audioKbps}k`, '-ac', '2'] : ['-an'];
      await ff.run([...trim, '-i', file, ...scale, ...fps, ...v, '-pass', '2', ...a, ...common, out],
        { duration: span, signal: ctx.signal, onProgress: (p) => ctx.onProgress(50 + p * 0.5) });
      for (const ext of ['-0.log', '-0.log.mbtree']) fs.rm(log + ext, () => {});
      return out;
    }
    const crf = { high: 23, medium: 27, small: 31 }[o.quality || 'medium'];
    const maxH = { high: 1080, medium: 1080, small: 720 }[o.quality || 'medium'];
    const h = Math.min(info.height || maxH, maxH);
    await ff.run([...trim, '-i', file, '-vf', `scale=-2:${even(h)}`, '-c:v', 'libx264', '-preset', 'medium', '-crf', String(crf),
      ...(info.hasAudio ? ['-c:a', 'aac', '-b:a', '128k'] : ['-an']), ...common, out], { duration: span, ...ctx });
    return out;
  }

  if (action === 'trim' || action === 'convert') {
    const out = outputPath(file, action === 'trim' ? '-trimmed' : '', '.mp4');
    await ff.run([...trim, '-i', file, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19',
      ...(o.mute ? ['-an'] : info.hasAudio ? ['-c:a', 'aac', '-b:a', '192k'] : ['-an']), ...common, out], { duration: span, ...ctx });
    return out;
  }

  if (action === 'gif') {
    const out = outputPath(file, '', '.gif');
    const fps = o.fps || 15;
    const width = o.width || 480;
    await ff.run([...trim, '-i', file, '-vf',
      `fps=${fps},scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`,
      '-loop', '0', out], { duration: span, ...ctx });
    return out;
  }

  if (action === 'audio') {
    if (!info.hasAudio) throw new Error('This video has no sound to extract.');
    const out = outputPath(file, '', '.mp3');
    await ff.run([...trim, '-i', file, '-vn', '-c:a', 'libmp3lame', '-b:a', '192k', out], { duration: span, ...ctx });
    return out;
  }

  if (action === 'mute') {
    const out = outputPath(file, '-muted', path.extname(file) || '.mp4');
    await ff.run(['-i', file, '-c:v', 'copy', '-an', out], { duration: info.duration, ...ctx });
    return out;
  }
  throw new Error(`Unknown video action ${action}`);
}

async function imageJob(action, file, o, ctx) {
  let src = file;
  let cleanup = null;
  if (isHeic(file)) {
    // ffmpeg can't read iPhone photos reliably, so decode them first.
    src = tmpFile('.png');
    await heicTo(file, src, 'PNG');
    cleanup = src;
  }
  try {
    const inExt = path.extname(file).toLowerCase();
    let fmt = o.format || (action === 'compress' ? (/\.(png|webp)$/.test(inExt) ? inExt.slice(1) : 'jpg') : 'jpg');
    if (fmt === 'jpeg') fmt = 'jpg';
    const q = Math.min(100, Math.max(10, o.quality || 82));
    const filters = [];
    if (action === 'resize') {
      if (o.percent) filters.push(`scale=trunc(iw*${o.percent / 100}/2)*2:-2`);
      else if (o.maxSize) filters.push(`scale='if(gt(iw,ih),min(${o.maxSize},iw),-2)':'if(gt(iw,ih),-2,min(${o.maxSize},ih))'`);
    }
    let args;
    if (fmt === 'jpg') {
      // JPG has no transparency: put see-through areas on white instead of black.
      const chain = [...filters, 'format=rgba'].join(',');
      args = ['-i', src, '-f', 'lavfi', '-i', 'color=c=white:s=16x16', '-filter_complex',
        `[0:v]${chain}[fg];[1:v][fg]scale2ref[bg][fg2];[bg][fg2]overlay=format=auto,format=yuvj420p`,
        '-frames:v', '1', '-q:v', String(Math.round(2 + (100 - q) * 0.29))];
    } else if (fmt === 'webp') {
      args = ['-i', src, ...(filters.length ? ['-vf', filters.join(',')] : []), '-frames:v', '1', '-c:v', 'libwebp', '-quality', String(q)];
    } else {
      args = ['-i', src, ...(filters.length ? ['-vf', filters.join(',')] : []), '-frames:v', '1', '-compression_level', '9'];
    }
    const suffix = action === 'resize' ? '-resized' : action === 'compress' ? '-small' : '';
    let out = outputPath(file, suffix, `.${fmt}`);
    await ff.run([...args, out], { duration: 0, ...ctx });
    ctx.onProgress(100);
    return out;
  } finally {
    if (cleanup) fs.rm(cleanup, () => {});
  }
}

async function audioJob(action, file, o, ctx) {
  const info = await ff.probe(file);
  if (!info.hasAudio) throw new Error('This file has no sound.');
  const trim = [];
  if (o.start > 0) trim.push('-ss', String(o.start));
  if (o.end > 0 && o.end > (o.start || 0)) trim.push('-to', String(o.end));
  const span = Math.max(0.1, ((o.end > 0 ? o.end : info.duration) - (o.start || 0)) || info.duration);
  const fmt = o.format || 'mp3';
  const codecs = {
    mp3: ['-c:a', 'libmp3lame', '-b:a', `${o.bitrate || 192}k`],
    m4a: ['-c:a', 'aac', '-b:a', `${o.bitrate || 192}k`],
    ogg: ['-c:a', 'libopus', '-b:a', `${Math.min(o.bitrate || 160, 256)}k`],
    wav: ['-c:a', 'pcm_s16le'],
    flac: ['-c:a', 'flac'],
  };
  const af = action === 'normalize' ? ['-af', 'loudnorm=I=-14:TP=-1.5:LRA=11'] : [];
  const suffix = { trim: '-trimmed', normalize: '-normalized', convert: '' }[action] || '';
  const out = outputPath(file, suffix, `.${fmt}`);
  await ff.run([...trim, '-i', file, '-vn', ...af, ...(codecs[fmt] || codecs.mp3), out], { duration: span, ...ctx });
  return out;
}

// ---------- App lifecycle ----------

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(() => {
    store.load();
    registerProtocol();
    registerIpc();
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });
  app.on('window-all-closed', () => { if (!isMac) app.quit(); });
}
