// Runs the bundled ffmpeg and reports progress.
const { app } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

function ffmpegPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'ffmpeg', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
  }
  return require('ffmpeg-static');
}

// Reads duration, size and streams from ffmpeg's own description of the file.
function probe(file) {
  return new Promise((resolve) => {
    const p = spawn(ffmpegPath(), ['-hide_banner', '-i', file], { windowsHide: true });
    let err = '';
    p.stderr.on('data', (d) => { err += d; });
    p.on('error', () => resolve({ duration: 0, hasVideo: false, hasAudio: false }));
    p.on('close', () => {
      const d = /Duration: (\d+):(\d+):(\d+\.?\d*)/.exec(err);
      const duration = d ? (+d[1]) * 3600 + (+d[2]) * 60 + parseFloat(d[3]) : 0;
      // Cover art inside audio files shows up as a video stream; ignore it.
      const videoLine = (err.match(/Stream #.*Video: .*/g) || []).find((l) => !/attached pic/.test(l));
      const audioLine = (err.match(/Stream #.*Audio: .*/g) || [])[0];
      let width = 0; let height = 0; let fps = 0; let vcodec = '';
      if (videoLine) {
        const s = /, (\d{2,5})x(\d{2,5})/.exec(videoLine);
        if (s) { width = +s[1]; height = +s[2]; }
        const f = /([\d.]+) fps/.exec(videoLine);
        if (f) fps = parseFloat(f[1]);
        const c = /Video: (\w+)/.exec(videoLine);
        if (c) vcodec = c[1];
        // Phone videos are often stored sideways with a rotation flag.
        if (/rotation of -?90|rotate\s*:\s*-?90|rotate\s*:\s*270/.test(err)) [width, height] = [height, width];
      }
      const isStill = videoLine && duration <= 0.05;
      resolve({
        duration,
        hasVideo: !!videoLine && !isStill,
        hasAudio: !!audioLine,
        width, height, fps, vcodec,
      });
    });
  });
}

// Runs ffmpeg; onProgress gets 0..100 based on the encoded time vs duration.
function run(args, { duration = 0, onProgress = () => {}, signal } = {}) {
  return new Promise((resolve, reject) => {
    const full = ['-hide_banner', '-y', '-nostats', '-progress', 'pipe:1', ...args];
    const p = spawn(ffmpegPath(), full, { windowsHide: true });
    let tail = '';
    let buf = '';
    p.stdout.on('data', (d) => {
      buf += d;
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        const m = /^out_time_(?:us|ms)=(\d+)/.exec(line);
        if (m && duration > 0) onProgress(Math.min(99.5, (parseInt(m[1], 10) / 1e6 / duration) * 100));
      }
    });
    p.stderr.on('data', (d) => { tail = (tail + d).slice(-4000); });
    const abort = () => { try { p.kill('SIGKILL'); } catch (e) {} };
    if (signal) {
      if (signal.aborted) abort();
      signal.addEventListener('abort', abort, { once: true });
    }
    p.on('error', reject);
    p.on('close', (code) => {
      if (signal) signal.removeEventListener('abort', abort);
      if (code === 0) { onProgress(100); resolve(); }
      else reject(new Error(tail.trim().split('\n').slice(-3).join('\n') || `ffmpeg exited with ${code}`));
    });
  });
}

module.exports = { probe, run, ffmpegPath };
