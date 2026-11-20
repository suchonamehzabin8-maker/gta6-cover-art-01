// Vice Coast Cover Studio — the entry's handoff program (Node 22,
// standard library only).
//
// It copies app/ and screenshots/ from beside this file into /output (or
// MAKEFUN_OUTPUT_DIR outside the grader) and writes /output/dossier.json,
// the summary the judge reads, with the vendored make.fun library. Before
// it hands anything over it checks the two limits that would refuse the
// entry outright: at most 4 screenshots, none over 256 KiB.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//   node serve.ts   (then open http://localhost:8080)

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const shotsDir = join(here, 'screenshots');

function fail(message) {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

function checkShots() {
  if (!existsSync(shotsDir)) fail('screenshots/ is missing from the repository');
  const shots = readdirSync(shotsDir)
    .filter((name) => /\.(png|jpe?g)$/i.test(name))
    .sort();
  if (shots.length < 3) fail(`only ${shots.length} screenshots — the gate wants 3 or 4`);
  if (shots.length > 4) fail(`${shots.length} screenshots — the gate allows at most 4`);
  for (const name of shots) {
    const bytes = statSync(join(shotsDir, name)).size;
    if (bytes > 262144) fail(`${name} is ${bytes} bytes — over the 256 KiB cap`);
  }
  return shots;
}

function countAppFiles(dir, seen = { files: 0, bytes: 0 }) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const info = statSync(path);
    if (info.isDirectory()) countAppFiles(path, seen);
    else {
      seen.files += 1;
      seen.bytes += info.size;
      if (name.length > 1000) fail(`app/ path over the 1000-byte cap: ${path}`);
    }
  }
  return seen;
}

const shots = checkShots();
const app = countAppFiles(join(here, 'app'));
if (app.files > 993) fail(`app/ holds ${app.files} files — the gate allows 993`);
if (app.bytes > 50331648) fail(`app/ is ${app.bytes} bytes — over the 48 MiB cap`);

mkdirSync(outDir, { recursive: true });
cpSync(join(here, 'app'), join(outDir, 'app'), { recursive: true });
cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });

writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

console.log(
  `handed in ${app.files} app files (${app.bytes} bytes) and ${shots.length} screenshots to ${outDir}`,
);
