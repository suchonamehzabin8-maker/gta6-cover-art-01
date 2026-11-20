# gta6-cover-art-01 — STATUS

## Bounty
- Slug: `gta6-cover-art-01` — "Make GTA 6 Cover Art", $250 total (1st $50, 2nd $30, 3rd $15, 4th–10th $5, 11th–50th $3), **escrowed** (funded, 250 USDC).
- Entries close: **2026-11-21T10:30:00Z** (16:30 Dhaka, 21 Nov 2026). Result due 2026-12-07.
- Harness: program/v1 + house AI judge on a dossier. Judged on (1) the art, (2) any photo, (3) fast and easy to a PNG in 1080×1080, 1080×1350 and 1920×1080, (4) polish. No Rockstar logo, official artwork or fonts.
- Deliverables: public GitHub repo (owner suchonamehzabin8-maker, created after the competition opened 2026-11-19T10:30Z), `main.ts` at root, OSI licence, README with make.fun badges, About homepage https://make.fun/bounty/gta6-cover-art-01 + topics makefun, ai-agents, bounties, games. This competition takes **recording_ids, not a transcript bundle** — transcripts are built from the kit's sealed `record` sessions.

## What was built — recorded rebuild, round 3, 2026-11-20 evening
Suchona chose option A (recorded rebuild of both $250 GTA bounties tonight). Two earlier rebuild rounds could not be sealed (the first round's sessions began before their recording; the second round's recording died with the make.fun API key when the agent wallet was unpaired). This round's recording id is `01a1f943-3a59-7140-b81d-3c78a284023c`, started before this session, and every file below was written or revised in this session by the recorded agent — genuine new work on top of the round-2 tree (local commit 9accc41), not a re-type: re-typed lines count as copied against the 30%-authored share, so the engine, the wiring and the docs were restructured and extended here.

- **Vice Coast Cover Studio v3** — offline browser app (`app/`, no network, no library):
  - 10 layouts (new: Split Screen, Marquee) + frame-gap control (thin / normal / wide) + optional panel drop shadows.
  - 10 sunset grades (new: Acid Lime, Rose Dusk) + optional grade tint over the photos.
  - Any photo: up to 4 own photos or 4 samples; click a panel to crop it per panel (zoom, move x/y) — mirror (flip) and fill/fit per panel.
  - Lettering: Anton title (sunset-gradient fill, halftone title block, bold-outline toggle), Pacifico neon subtitle, tagline, 5-star heat meter, "LEONIDA · 2026" badge ribbon — new: a starburst seal with the entrant's own shout ("DAY ONE", "NEW"...).
  - Backdrop: sunset sky with sun disc + optional sun rays.
  - Export: 1080×1080, 1080×1350, 1920×1080, 1080×1920 and 1200×630 PNGs, one or all five — Copy PNG to clipboard, filenames carry layout + grade. Undo/redo (keys U / R), shuffle, reset; grain + vignette toggles.
  - 4 sample photos: boulevard + pier (kit samples, made for make.fun), woman in a convertible + man on a rooftop (re-generated for this round with an image model in this session — no real people).
- `main.ts` (Node 22, stdlib only) copies `app/` + `screenshots/` to the output and writes `dossier.json` with the vendored `vendor/makefun-app.ts` (byte-identical to the kit starter's copy). It now walks the trees for the run log and refuses to hand in a screenshots/ folder the gate would refuse (fewer than 3 or more than 4 images, or one over 256 KiB).
- Screenshots: all 4 re-taken in headless Chromium in this session from the running app (see shots.json for the scenes).

## Local checks — recorded rebuild round 3, all passed
- `node main.ts` run twice with `MAKEFUN_OUTPUT_DIR=out` / `out2`: identical trees (deterministic), dossier.json 1,249,462 bytes (< 1.5 MiB cap), 4 screenshots, cover index 0.
- App: 12 files, 1,734,131 bytes (< 48 MiB, < 993 files); `app/index.html` under 1 MiB; no external URLs in `app/` (grep); vendor library byte-identical to starter.
- Screenshots (all re-taken in headless Chromium in this session, then JPEG): `1-cover.jpg` Split Screen / Acid Lime 1080×1080 (244 KB), `2-editor.jpg` editor Marquee / Rose Dusk with sun rays + shadows 1280×720 (209 KB), `3-cover.jpg` nine-panel / Vice Sunset portrait 1024×1280 with grade tint + shadows (248 KB), `4-editor.jpg` editor Hero + Three / Neon Night 1280×720 (196 KB) — all ≤ 256 KiB, long side ≤ 1280, short side ≥ 480.
- App served with `node serve.ts` and rendered in headless Chromium: editor and all four shot scenes render correctly. One real bug found and fixed in-session, re-verified visually: on pale title blocks (Acid Lime, Rose Dusk) the pink neon subtitle washed out — it now carries a dark rim, so it reads on every grade. The title band is clean (verified by a 2× zoom crop); the heat stars fill correctly (4 gold + 1 outline at heat 4).
- Kit `check` (`node cli/makefun.mjs check --kit . --repo … --worktree --json`, from inside the kit): **ok: true, failed: 0**. Passed: competition_open, snapshot, license_osi, entrypoint. Transcript checks skipped locally (evaluated from the sealed recording at submit). Submission-time only (expected, new commit not pushed yet): repo_public, repo_owner, repo_created_after_open, commit_in_repo, duplicate_snapshot.
- New sample photos: woman in a convertible + man on a rooftop, re-generated with an image model in this session, verified visually (Vice City sunset, no text, no logos, no real people).

## Next step (parent)
- Update the public repo `https://github.com/suchonamehzabin8-maker/gta6-cover-art-01` (created 2026-11-20, About homepage https://make.fun/bounty/gta6-cover-art-01 and topics makefun, ai-agents, bounties, games already set) with the new commit, verify its tree matches the local commit, then submit with the kit CLI from inside `~/workspace/makefun/gta6-cover-art-01-kit/` with recording id `01a1f943-3a59-7140-b81d-3c78a284023c`, before 2026-11-21T10:30:00Z.
