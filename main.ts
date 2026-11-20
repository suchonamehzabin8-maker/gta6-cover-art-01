// Vice Coast Cover Studio — a gta6-cover-art-01 entry, written fresh in
// this session (Node 22, standard library only). The app is this
// directory's app/ folder: plain static files a desktop browser loads
// offline (app/index.html and its ES modules, no library, no network
// request). This program hands the entry in: it copies app/ and
// screenshots/ from beside this file to /output and writes
// /output/dossier.json — the summary the judge reads — with the vendored
// make.fun library.
//
// The app turns up to 4 photos and a caption into GTA-style multi-panel
// cover art: 10 layouts, 10 sunset grades, per-panel crop with mirror and
// fit/fill, a starburst seal, photo tint and panel shadows, frame-gap
// control, Anton + Pacifico lettering (OFL, vendored), grain, vignette and
// sun rays — and exports 1080×1080, 1080×1350, 1920×1080, 1080×1920 and
// 1200×630 PNGs, or copies the PNG to the clipboard. Screenshots in
// screenshots/ (the first by name is the cover).
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Walk a directory tree and tally it: file count, total bytes, and the
// biggest single file, so the run log says what was handed in.
function walkTree(dir) {
  const tally = { files: 0, bytes: 0, largest: { path: '', bytes: 0 } };
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else {
        tally.files += 1;
        tally.bytes += st.size;
        if (st.size > tally.largest.bytes) tally.largest = { path: p, bytes: st.size };
      }
    }
  };
  walk(dir);
  return tally;
}

// The gate refuses more than 4 screenshots or one over 256 KiB: fail the
// run here, loudly, instead of handing in an entry the scorer would refuse.
function guardScreenshots(dir) {
  if (!existsSync(dir)) throw new Error('screenshots/ is missing');
  const names = readdirSync(dir).filter((n) => !n.startsWith('.'));
  if (names.length < 3 || names.length > 4) {
    throw new Error(`screenshots/ holds ${names.length} images, the gate wants 3 or 4`);
  }
  for (const name of names) {
    const size = statSync(join(dir, name)).size;
    if (size > 262144) throw new Error(`screenshots/${name} is ${size} bytes, over the 256 KiB cap`);
  }
  return names.length;
}

const appTree = walkTree(join(here, 'app'));
const shotCount = guardScreenshots(join(here, 'screenshots'));
const shotTree = walkTree(join(here, 'screenshots'));
console.log(
  `Vice Coast Cover Studio: app/ ${appTree.files} files, ${appTree.bytes} bytes ` +
  `(largest ${appTree.largest.path.split('/').pop()} ${appTree.largest.bytes} bytes); ` +
  `screenshots/ ${shotCount} files, ${shotTree.bytes} bytes`,
);

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the others refuse an entry the scorer would refuse (more than
// 4 screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB
// of app files, in all, or a path under app/ over 1000 bytes: app/ counts
// beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
const dossierBytes = statSync(join(out, 'dossier.json')).size;
console.log(`dossier.json ${dossierBytes} bytes (cap 1572864)`);
if (dossierBytes > 1572864) throw new Error('dossier.json is over the 1.5 MiB cap');
