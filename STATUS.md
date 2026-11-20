# gta6-cover-art-01 — STATUS

## Bounty
- Slug: `gta6-cover-art-01` — "Make GTA 6 Cover Art", $250 total (1st $50, 2nd $30, 3rd $15, 4th–10th $5, 11th–50th $3), **escrowed** (funded, 250 USDC).
- Entries close: **2026-11-21T10:30:00Z** (16:30 Dhaka, 21 Nov 2026). Result due 2026-12-07.
- Harness: program/v1 + house AI judge on a dossier. Judged on (1) the art, (2) any photo, (3) fast and easy to a PNG in 1080×1080, 1080×1350 and 1920×1080, (4) polish. No Rockstar logo, official artwork or fonts.
- Deliverables: public GitHub repo (owner suchonamehzabin8-maker, created after the competition opened 2026-11-19T10:30Z), `main.ts` at root, OSI licence, README with make.fun badges, About homepage https://make.fun/bounty/gta6-cover-art-01 + topics makefun, ai-agents, bounties, games. This competition takes **recording_ids, not a transcript bundle** — transcripts are built from the kit's sealed `record` sessions.

## What was built — recorded rebuild, 2026-11-20 evening
Suchona chose option A (recorded rebuild of both $250 GTA bounties tonight). Recording id `01a1f935-86ef-7051-835c-a77c73d4f4ac` started before this session, and every file below was written or revised in this session by the recorded agent. The earlier unrecorded build (local commit 03c8b95) could not be sealed, so this is a genuine rebuild, not a re-upload.

- **Vice Coast Cover Studio v2** — offline browser app (`app/`, no network, no library):
  - 8 layouts (new: Diagonal Split, Poster Stack) + frame-gap control (thin / normal / wide).
  - 8 sunset grades (new: Golden Hour, Midnight Vice).
  - Any photo: up to 4 own photos or 4 samples; click a panel to crop it per panel (zoom, move x/y) — new: mirror (flip) and fill/fit per panel.
  - Lettering: Anton title (sunset-gradient fill, halftone title block, bold-outline toggle — new), Pacifico neon subtitle, tagline, 5-star heat meter, "LEONIDA · 2026" badge ribbon. Fonts vendored under OFL.
  - Backdrop: sunset sky with sun disc — new: optional sun rays.
  - Export: 1080×1080, 1080×1350, 1920×1080, 1080×1920 PNGs, one or all four — new: Copy PNG to clipboard, and filenames now carry layout + grade. Undo/redo, shuffle, reset; grain + vignette toggles.
  - 4 sample photos: boulevard + pier (kit samples, made for make.fun), woman in a convertible + man on a rooftop (made for this entry with an image model in this session — no real people).
- `main.ts` (Node 22, stdlib only) copies `app/` + `screenshots/` to the output and writes `dossier.json` with the vendored `vendor/makefun-app.ts` (byte-identical to the kit starter's copy). It now also logs a one-line summary of the trees it hands in.
- Screenshots: all 4 re-taken in headless Chromium in this session from the running app (see shots.json for the scenes).

## Local checks — recorded rebuild, all passed
- `node main.ts` run twice with `MAKEFUN_OUTPUT_DIR=out` / `out2`: identical trees (deterministic), dossier.json 1,138,036 bytes (< 1.5 MiB cap), 4 screenshots, cover index 0.
- App: 12 files, 1,702,540 bytes (< 48 MiB, < 993 files); `app/index.html` under 1 MiB; no external URLs in `app/` (grep); vendor library byte-identical to starter.
- Screenshots (all re-taken in headless Chromium in this session, then JPEG): `1-cover.jpg` nine-panel 1080×1080 (219 KB), `2-editor.jpg` editor Diagonal Split / Golden Hour with sun rays 1280×720 (184 KB), `3-cover.jpg` Poster Stack / Midnight Vice portrait 1024×1280 (228 KB), `4-editor.jpg` editor Hero + Three / Neon Night 1280×720 (189 KB) — all ≤ 256 KiB, long side ≤ 1280, short side ≥ 480.
- App served with `node serve.ts` and rendered in headless Chromium: editor and all four shot scenes render correctly. Two real bugs found and fixed in-session, both re-verified visually: (1) in short title bands (Hero, Diagonal) the tagline crowded the heat stars — the tagline is now skipped in compact title blocks; (2) the stars then sat on the bottom frame — they now ride higher in compact blocks. The final title band is clean (verified by a 2× zoom crop).
- Kit `check` (`node cli/makefun.mjs check --repo … --worktree --json`, 2026-11-20): **ok: true, failed: 0**. Passed: competition_open, snapshot, license_osi, entrypoint. Transcript checks skipped locally (evaluated from the sealed recording at submit). Submission-time only (expected, no GitHub repo yet): repo_public, repo_owner, repo_created_after_open, commit_in_repo, duplicate_snapshot.
- New sample photos: woman in a convertible + man on a rooftop, generated with an image model in this session, verified visually (Vice City sunset, no text, no logos, no real people).

## Next step (parent)
- Create public repo `https://github.com/suchonamehzabin8-maker/gta6-cover-art-01` (after 2026-11-19T10:30:00Z), set About homepage https://make.fun/bounty/gta6-cover-art-01 and topics makefun, ai-agents, bounties, games, upload these files, then submit with the kit CLI from inside `~/workspace/makefun/gta6-cover-art-01-kit/` with recording id `01a1f935-86ef-7051-835c-a77c73d4f4ac`, before 2026-11-21T10:30:00Z.
