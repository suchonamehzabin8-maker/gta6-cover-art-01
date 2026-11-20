// Vice Coast Cover Studio — a gta6-cover-art-01 entry, rebuilt in this
// session (Node 22, standard library only). The app is this directory's
// app/ folder: plain static files a desktop browser loads offline
// (app/index.html and its ES modules, no library, no network request).
// This program hands the entry in: it copies app/ and screenshots/ from
// beside this file to /output and writes /output/dossier.json — the
// summary the judge reads — with the vendored make.fun library.
//
// The app turns up to 4 photos and a caption into GTA-style multi-panel
// cover art: 8 layouts, 8 sunset grades, per-panel crop with mirror and
// fit/fill, frame-gap control, Anton + Pacifico lettering (OFL, vendored),
// grain, vignette and sun rays — and exports 1080×1080, 1080×1350,
// 1920×1080 and 1080×1920 PNGs, or copies the PNG to the clipboard.
// Screenshots in screenshots/ (the first by name is the cover).
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

// A one-line summary of what is being handed in, for the run log.
function countTree(dir) {
  let files = 0;
  let bytes = 0;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      const sub = countTree(p);
      files += sub.files;
      bytes += sub.bytes;
    } else {
      files += 1;
      bytes += st.size;
    }
  }
  return { files, bytes };
}

const appTree = countTree(join(here, 'app'));
const shotTree = existsSync(join(here, 'screenshots')) ? countTree(join(here, 'screenshots')) : { files: 0, bytes: 0 };
console.log(`Vice Coast Cover Studio: app/ ${appTree.files} files, ${appTree.bytes} bytes; screenshots/ ${shotTree.files} files, ${shotTree.bytes} bytes`);

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

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
