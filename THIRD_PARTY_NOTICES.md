# Third-party notices

Filesmith is licensed under the GNU General Public License v3.0 or later (see `LICENSE`).
It includes or uses the following open-source software. Each component remains under its own licence.

| Component | Version | Licence | Used for | Source |
|---|---|---|---|---|
| FFmpeg (static build via ffmpeg-static, release b6.0) | 6.0 | GPL-3.0-or-later (built with libx264, GPL) | Video, audio and image processing. Bundled as a separate program and run as a subprocess. | https://ffmpeg.org/download.html, build scripts at https://github.com/eugeneware/ffmpeg-static |
| Electron | 33.4.11 | MIT | Application shell (includes Chromium and Node.js, each under their own licences, listed in the app's `LICENSES.chromium.html`) | https://github.com/electron/electron |
| pdf-lib | 1.17.1 | MIT | Editing, merging, splitting and signing PDFs | https://github.com/Hopding/pdf-lib |
| PDF.js (pdfjs-dist) | 4.10.38 | Apache-2.0 | Drawing PDF pages | https://github.com/mozilla/pdf.js |
| heic-convert / heic-decode | 2.1.0 | ISC | Reading iPhone HEIC photos | https://github.com/catdad-experiments/heic-convert |
| libheif-js | 1.23.5 | LGPL-3.0 | HEIC decoding library used by heic-decode | https://github.com/catdad-experiments/libheif-js |
| electron-updater | see package.json | MIT | Checking for and installing app updates | https://github.com/electron-userland/electron-builder |
| Geist and Geist Mono (website only) | 1.9.2 | SIL Open Font License 1.1 | Website typefaces, self-hosted | https://github.com/vercel/geist-font |

## FFmpeg source code

The FFmpeg binary shipped inside Filesmith is an unmodified static build from the ffmpeg-static project (release b6.0). Its complete corresponding source code is available from https://ffmpeg.org/releases/ (version 6.0), and the build configuration from https://github.com/eugeneware/ffmpeg-static/releases/tag/b6.0. If you can't get it from those links, open an issue on https://github.com/hollowbit-dev/filesmith and the source will be provided.

FFmpeg is a trademark of Fabrice Bellard, originator of the FFmpeg project.
