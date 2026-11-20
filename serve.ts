// A tiny static server for app/ (Node 22, standard library only), so the
// cover studio can be tried locally without a build step:
//
//   node serve.ts            serves app/ on http://localhost:8080
//   node serve.ts --port 9000 --host 0.0.0.0
//
// It answers only files under app/, with the MIME types an offline web app
// needs, and refuses everything else. A development convenience, not a
// server for the internet.

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(fileURLToPath(new URL('./app', import.meta.url)));

function flagValue(argv, flag, fallback) {
  const at = argv.indexOf(flag);
  if (at === -1 || at + 1 >= argv.length) return fallback;
  return argv[at + 1];
}

const argv = process.argv.slice(2);
const portRaw = Number(flagValue(argv, '--port', '8080'));
const port = Number.isInteger(portRaw) && portRaw > 0 && portRaw < 65536 ? portRaw : 8080;
const host = flagValue(argv, '--host', '127.0.0.1');

const TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.gif', 'image/gif'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.ttf', 'font/ttf'],
  ['.otf', 'font/otf'],
  ['.wasm', 'application/wasm'],
]);

function insideRoot(file) {
  return file === appRoot || file.startsWith(appRoot + sep);
}

const server = createServer((req, res) => {
  let path = '/';
  try {
    path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('bad request');
    return;
  }
  if (path.endsWith('/')) path += 'index.html';
  const file = resolve(join(appRoot, normalize(path)));
  if (!insideRoot(file)) {
    res.writeHead(403).end('forbidden');
    return;
  }
  let size;
  try {
    const info = statSync(file);
    if (!info.isFile()) throw new Error('not a file');
    size = info.size;
  } catch {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, {
    'content-type': TYPES.get(extname(file).toLowerCase()) ?? 'application/octet-stream',
    'content-length': size,
    'cache-control': 'no-store',
  });
  createReadStream(file).pipe(res);
});

server.listen(port, host, () => {
  console.log(`Vice Coast Cover Studio is on http://${host}:${port}`);
});
