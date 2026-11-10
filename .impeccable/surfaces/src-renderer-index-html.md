---
version: 1
slug: "src-renderer-index-html"
primary_target: "src/renderer/index.html"
related_targets: ["src/renderer/app.js","src/renderer/app.css"]
---

# Surface brief: Filesmith app UI (src/renderer)

Scope: the whole desktop app window (home, video, images, PDF, audio, history, settings, support). Visitor mode: Operate.
Audience: everyday, non-technical people fixing a file mid-task (see PRODUCT.md).
Constraints: user pinned references Raycast, Linear and Apple's own apps; rejected themed or gimmicky worlds; keep the anvil icon; must fill the window at any size including fullscreen.

## Direction contract
FORM: user-pinned canon (seed:ab6da4a403db85e6, rolled hands declined by the user); craft bar = Raycast, Linear, Apple first-party utilities.
THESIS: A native-grade utility that disappears into the task: command-first like Raycast, crisp and dense like Linear, calm like a built-in Apple app. It refuses the template look: tinted icon tiles, gradient buttons, dashed hero drop zones, stat cards, eyebrows.
OWN-WORLD: Restrained neutrals with one accent, the anvil's orange, used only for the primary action, selection and progress. The sidebar is native material (macOS vibrancy, Windows Mica) over an opaque content pane. Hairline separators, 6px controls, 10px panels, system type at 13px base on a 1.125 scale, tabular figures for every size and time, monochrome 1.5-stroke icons. It follows the system light or dark appearance.
STORY: The user sees one question ("What do you want to do?") with a command field, types or picks an outcome in plain words, or drops files anywhere. The tool view is a file table plus an inspector, and results show measured before and after.
FIRST VIEWPORT: Home has a large command field with filtered suggestions under it (keyboard navigable), then recent results as a table. A quiet totals line replaces stat cards. Tool views have a title, a segmented control, a full-width file table and an inspector; fullscreen widens the table, never centres a narrow column.
SIGNATURE: The command bar. Cmd/Ctrl+K anywhere opens a palette that takes plain-language outcomes ("under 10mb", "heic to jpg", "sign") and jumps straight to the configured tool. Second: before/after sizes drawn to scale as hairline bars in the results.
