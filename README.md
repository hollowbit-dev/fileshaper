# Filesmith

**Stop uploading your files to sketchy websites.**

Filesmith is a free, open-source file toolbox for Windows and Mac. It compresses videos for Discord, turns iPhone photos into JPGs, and merges and signs PDFs, all on your own computer. No limits, no watermarks, no account, no uploads.

![Filesmith](docs/img/video.jpg)

## What it does

| Video | Images | PDF | Audio |
|---|---|---|---|
| Compress to a size (8/10/16/25/50 MB or custom) | HEIC to JPG / PNG / WebP | Sign (draw or type) | Convert MP3, M4A, WAV, FLAC, OGG |
| Compress by quality | Resize (longest side or %) | Fill text and dates | Trim with preview |
| Trim with live preview | Compress | Merge | Even out volume (−14 LUFS) |
| Video to GIF | Images to PDF | Split (every page / ranges / pick pages) | |
| Extract audio (MP3) | | Organize: reorder, rotate, delete pages | |
| Convert to MP4 | | Compress (light or strong) | |
| Remove sound | | | |

Originals are never changed. New files are saved next to the original, or in a folder you pick.

## Run it from source

You need Node.js 20+.

```bash
npm install
npm start                 # opens the app
bash test/make-media.sh   # sample files for the tests (once)
npm test                  # 21 end-to-end checks against the real app
```

## Build the installers

```bash
npm run dist:mac   # dist/Filesmith-1.0.0-mac-arm64.dmg and -mac-x64.dmg
npm run dist:win   # dist/Filesmith-Setup-1.0.0-win-x64.exe (builds fine on a Mac)
```

`scripts/fetch-ffmpeg.mjs` downloads the right FFmpeg binary for each platform into `vendor/` the first time.

## The website

The site in `docs/` is generated. Edit the text in `site/locales/*.json` (English plus Spanish, French, German, Russian and Chinese), the layout in `site/build.mjs`, and the styles in `site/assets/`, then run:

```bash
npm run site       # rebuilds docs/ in all 6 languages, with checksums from dist/
```

Pages: home, features, download, changelog, FAQ, about, support, privacy, plus a 404. Fonts are self-hosted (Geist, SIL Open Font License), so the site makes no third-party requests. Set your GitHub URL at the top of `site/build.mjs`.

## Publish checklist

1. **Fill in your GitHub username** in `src/renderer/config.js` (the app) and at the top of `site/build.mjs` (the website), then run `npm run site`.
2. **Create a GitHub repo** called `filesmith` and push this folder.
3. **Make a release** tagged `v1.0.0` and upload the three files from `dist/` with their names unchanged. The website's download buttons point to `releases/latest/download/<file name>`.
4. **Turn on the website:** repo Settings, then Pages, then deploy from the `main` branch, `/docs` folder. It goes live at `https://<you>.github.io/filesmith/`.
5. **After rebuilding the installers**, run `npm run site` again so the download page shows the new SHA-256 checksums.

### About the security warnings

The builds aren't signed with a paid certificate, so Windows SmartScreen and macOS Gatekeeper warn on first launch. The website explains how to open Filesmith anyway. To remove the warnings:
- **Mac:** Apple Developer Program ($99/year), then set `mac.identity` and notarize.
- **Windows:** a code-signing certificate, or apply to [SignPath Foundation](https://signpath.org), which signs open-source projects for free.

## How it's built

- **Electron** app shell. `src/main.js` serves app files and the user's files over a private `filesmith://` scheme with HTTP range support, so video previews can seek.
- **FFmpeg** (bundled) for video, audio and image work. Target-size compression is two-pass x264 with the bitrate worked out from the duration. Resolution drops automatically when the budget is tight.
- **heic-convert** decodes iPhone photos, which FFmpeg 6 can't read reliably.
- **pdf-lib** edits PDFs and **PDF.js** draws pages for previews, page thumbnails, signing and strong compression.
- No network requests. Settings and history live in a JSON file in the app's data folder.

```
src/main.js            window, filesmith:// protocol, job runner (video/image/audio)
src/ffmpeg.js          probe + run with progress
src/store.js           settings, history, totals
src/preload.js         the only bridge between the window and the computer
src/renderer/          UI: app.js (tools), pdf-tools.js (PDF), ui.js, app.css, config.js
docs/                  the website (GitHub Pages)
test/e2e.mjs           end-to-end tests (Playwright driving the real app)
test/marketing-shots.mjs  regenerates the website screenshots
```

## Licence

GPL-3.0-or-later. Filesmith bundles FFmpeg built with x264 (GPL).
