# gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/suchonamehzabin8-maker/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/suchonamehzabin8-maker/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Coast Cover Studio — an offline browser app that turns your photos and a caption into GTA-style multi-panel cover art, in the spirit of the official GTA VI nine-panel collage (a pink-purple-orange Vice City sunset over Leonida). Built by an AI agent in a recorded session for make.fun's "Make GTA 6 Cover Art" bounty, $250 in USDC.

## What it does

- **8 layouts**: Nine-Panel Grid, Hero + Three, Full-Bleed, Tilted Snapshots, Comic Strip, Four-Square, Diagonal Split, Poster Stack — panels are inked and white-framed like poster art, with a thin / normal / wide frame-gap control.
- **Any photo**: add up to 4 of your own photos, or use the 4 samples. Click a panel in the preview to pick it, then crop it per panel — zoom, move left–right and up–down, mirror it, or switch it between fill (crop) and fit (whole photo).
- **8 sunset grades**: Vice Sunset, Neon Night, Palm Gold, Miami Teal, Heat Haze, Noir Pink, Golden Hour, Midnight Vice — a gradient wash over every panel, on a sunset sky with a sun disc (and optional sun rays).
- **Lettering**: title in Anton (condensed, sunset-gradient fill, bold outline you can toggle, halftone title block), neon-script subtitle in Pacifico, tagline, a 5-star heat meter, and a "LEONIDA · 2026" badge ribbon.
- **Fast and easy**: pick a layout, a grade and a caption, then export — **1080 × 1080, 1080 × 1350, 1920 × 1080 and 1080 × 1920 PNGs**, one at a time, all four at once, or straight to the clipboard with Copy PNG. Undo, redo, shuffle and reset are built in. Grain and vignette are toggleable.
- **Offline and private**: no network request, no upload — photos never leave the machine. Fonts are vendored (Anton + Pacifico, SIL OFL).

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or hand it in exactly as the grader does:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Screenshots

- `1-cover.jpg` — the nine-panel cover, exported at 1080 × 1080
- `2-editor.jpg` — the editor with a photo loaded (Diagonal Split, Golden Hour)
- `3-cover.jpg` — the Poster Stack cover, portrait 1080 × 1350, Midnight Vice
- `4-editor.jpg` — the editor (Hero + Three, Neon Night, wide export)

## Originality

Everything here is the entrant's own: the cover engine, the layouts, the grades and the lettering are original code written in the recorded build session. No Rockstar Games logo, official artwork or fonts are used. The two kit sample photos (boulevard, pier) were made for make.fun; the other two samples (woman in a convertible, man on a rooftop) were made for this entry with an image model in the recorded session and show no real people.

---

<sub>Entered on [make.fun](https://make.fun/?ref=0y194fr3&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
