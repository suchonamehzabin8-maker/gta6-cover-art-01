# STATUS — gta6-cover-art-01

## Round 4 rebuild (this session, recorded)

The round-3 entry was rejected in round 1 on two transcript checks, so
this round rebuilds the app from the round-3 tree as a spec, in a fresh
recorded session:

- **thinking_reproduces was 25.1% authored (317 of 1262 lines).** Every
  text file in the entry is rewritten here from scratch — a new painter
  (`app/src/cover.js`), a new editor (`app/src/main.js`), a new scene
  runner (`app/src/shots.js`), a new page (`app/index.html`), new styles
  (`app/style.css`), a new handoff program (`main.ts`), a new dev server
  (`serve.ts`), and new `shots.json`, `README.md` and `STATUS.md`. The
  features are kept (10 layouts, 10 grades, seal, tint, shadows, 5 export
  sizes, undo/redo, shortcuts, copy PNG) but the code is mine, written in
  this session.
- **transcripts_witnessed failed on the 3 font files.** `app/fonts/` is
  deleted entirely — no font files ship at all now. The lettering is drawn
  with system font stacks only (a squashed bold sans for the condensed
  title, an italic serif with a neon glow for the subtitle).
- The two model-made samples (`woman-car.jpg`, `man-rooftop.jpg`) were
  re-generated with the image model in this session and verified visually:
  a convertible at sunset on a palm-lined coast road, and a rooftop over a
  neon skyline at dusk. No text, no logos, no real people. The kit samples
  (`boulevard.jpg`, `pier.jpg`), `LICENSE` and `vendor/makefun-app.ts`
  are untouched (kit-starter files, exempt).
- All 4 screenshots are re-taken in headless Chromium in this session.

## Verification (this session)

- Kit check (`check --kit . --repo … --worktree --json`): **ok: true,
  failed: 0** — 4 pass, 17 skip, 5 at submission (repo/commit checks,
  resolved when the repo holds the new commit).
- Determinism: `main.ts` run twice into separate outputs — identical
  trees; dossier.json 794,825 bytes (< 1.5 MiB); 9 app files, 1,174,476
  bytes.
- Headless Chromium (CDP, all 4 shots viewed): nine-panel cover with 4
  varied photos, Marquee editor, Split Screen portrait cover, Hero editor
  — title band, subtitle, stars, seal all clean; no console/page errors.
  Interaction smoke test: 10 layout buttons, 10 grade buttons, 5 size
  buttons; layout/grade switching paints; canvas click selects the right
  panel (triangle hit-test for the diagonal split); undo restores the
  pre-change state.
- Two real bugs found and fixed in-session: (1) 1-cover.jpg was 264,091
  bytes, over the 256 KiB cap — re-shot at JPEG quality 78 (now 204,520);
  (2) canvas clicks in the diagonal layout always hit panel 1 — fixed
  with a triangle hit-test. Also removed the duplicated badge ribbon (it
  repeated the tagline).
- Local commit: d680658 (tree 4d824395caf25e8e0dca536db3062d1c25e8d0bd) —
  19 files changed, +1260/−1352; 1615 lines across the counted text
  files, all written fresh in this session. The 3 font files are deleted
  in the same commit.
- Recording: 01a1f952-593b-772e-9550-c67802dc0427 (sealed by the parent)
- Submit: with `--recording 01a1f952-593b-772e-9550-c67802dc0427 --keypair`
  before 2026-11-21T10:30:00Z.
