// Settings, history and totals, saved as JSON in the app's data folder. Nothing leaves the computer.
const { app } = require('electron');
const fs = require('fs');
const path = require('path');

const defaults = { outDir: '', openFolderWhenDone: false, theme: 'dark', lang: 'auto', autoUpdate: true, lastUpdateCheck: 0 };
let state = { settings: { ...defaults }, history: [], stats: { files: 0, bytesSaved: 0 } };
const file = () => path.join(app.getPath('userData'), 'filesmith.json');

function load() {
  try {
    const raw = JSON.parse(fs.readFileSync(file(), 'utf8'));
    state = {
      settings: { ...defaults, ...(raw.settings || {}) },
      history: Array.isArray(raw.history) ? raw.history : [],
      stats: { files: 0, bytesSaved: 0, ...(raw.stats || {}) },
    };
  } catch (e) { /* first run */ }
}

let timer = null;
function save() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      fs.mkdirSync(path.dirname(file()), { recursive: true });
      fs.writeFileSync(file(), JSON.stringify(state));
    } catch (e) { console.error('Filesmith: could not save settings', e); }
  }, 150);
}

module.exports = {
  load,
  get settings() { return state.settings; },
  get history() { return state.history; },
  get stats() { return state.stats; },
  setSettings(patch) { Object.assign(state.settings, patch); save(); },
  addHistory(item) {
    state.history.unshift(item);
    state.history = state.history.slice(0, 200);
    state.stats.files += 1;
    if (item.before > item.after && item.after > 0) state.stats.bytesSaved += item.before - item.after;
    save();
  },
  clearHistory() { state.history = []; save(); },
};
