# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

(Electron desktop app for Windows and macOS, rendered as a web UI; plus a static marketing website in `docs/` for GitHub Pages.)

## Users

Everyday people, not technical users, who hit a file chore and want it fixed quickly: shrink a video so it fits Discord or email, open or convert an iPhone HEIC photo on Windows, merge or sign a PDF, trim a voice note. They usually arrive mid-task with one file (sometimes a batch) and want to be done in under a minute. Today they google the task and end up on ad-filled converter websites.

## Product Purpose

Filesmith replaces the "upload to a converter website" habit with one free desktop app that does common video, image, PDF and audio jobs on the user's own computer. Success: the user drops a file, picks an outcome described in plain words ("under 10 MB", "to JPG", "sign here"), and gets a new file next to the original without uploading anything, creating an account or hitting a limit.

## Positioning

Fully local and free with no limits: nothing is uploaded, there is no account, no watermark and no daily cap, and it works offline. One app covers four file families that online tools split across many sites. Target-size video compression (two-pass encoding that lands just under a chosen MB limit) is a concrete mechanism rather than a vague "compress".

## Operating Context

- Launched on demand, often with a file dragged onto the window or picked from a dialog. Batches of hundreds of images are supported.
- Outputs are saved next to the original (or a chosen folder). Originals are never modified.
- Runs on laptops and desktops, windowed or fullscreen, at sizes from about 900×620 up to large external monitors. Layouts must use the available space; fullscreen currently leaves content in a narrow column (a known bug to fix).
- The website is where people discover, trust and download the app (Windows .exe, Mac Apple Silicon and Intel .dmg via GitHub Releases).

## Capabilities and Constraints

- Video: compress to a size (8/10/16/25/50 MB or custom) or a quality level, trim with preview, make GIF, extract audio (MP3), convert to MP4, remove sound.
- Images: convert (HEIC, PNG, WebP, GIF, BMP, TIFF to JPG/PNG/WebP), resize (longest side or %), compress, images to PDF.
- PDF: merge, split (every page / ranges / pick pages), compress (light, or strong rasterize), organize pages (reorder, rotate, delete), sign and fill (drawn or typed signature, text, date).
- Audio: convert (MP3, M4A, WAV, FLAC, OGG), trim, even out volume (−14 LUFS).
- Tech: Electron, bundled FFmpeg, heic-convert, pdf-lib, PDF.js. No network requests at all. History and stats stored locally.
- Builds are unsigned (no paid certificates yet), so OS security warnings appear on first launch.

## Brand Commitments

- Product name **Filesmith**; studio name **Hollowbit** ("Filesmith by Hollowbit"). Made by **Elvis Zygmanta**. Hollowbit is NOT associated with the user's other brand (Galactical Cool Tees).
- Keep the **anvil-with-spark app icon** (`assets/icon.png`). Everything else about the visual look is open for replacement.
- Hollowbit principles stated publicly: no ads, no accounts, no tracking, open source.
- Support link: https://ko-fi.com/hollowbit. Do not publish bank details. Crypto address optional and currently empty.

## Evidence on Hand

- The working app and its real screens (regenerated with `test/marketing-shots.mjs`). Real measured results from tests, e.g. a 149 MB 4K clip compressed to 9.1 MB, and HEIC to JPG conversions.
- 21 passing end-to-end tests (`test/e2e.mjs`).
- No users, testimonials, download counts, reviews or press yet. Do not fabricate any.
- GitHub username not decided yet (placeholder `YOUR-USERNAME` in `src/renderer/config.js` and `docs/site.js`).

## Product Principles

1. Plain-language outcomes over technical settings: users pick "under 10 MB", not bitrates.
2. Nothing leaves the computer. Privacy is the product, not a feature.
3. Never touch the original. Every result is a new file with the saving shown.
4. Fast in, fast out: one drop, one choice, done.
5. Honest: no inflated claims, fake numbers or dark patterns.

## Accessibility & Inclusion

Used by non-technical people of all ages. Readable sizes, clear contrast in both light and dark system themes, full keyboard reachability for the main flows, and no reliance on colour alone for status.
