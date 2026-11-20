// A tiny static server for app/ (Node 22, standard library only), so the
// entry can be tried locally without a build step: `node serve.ts` serves
// app/ on http://localhost:8080 (or `--port <n>`, `--host <addr>`). It sends
// the MIME types an offline web app needs, refuses any path outside app/,
// and logs the misses so a broken reference is easy to spot. A development
// convenience, not a server for the internet.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./app', import.meta.url)));

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain; charset=utf-8',
};

function flagValue(name, fallback) {
  const args = process.argv.slice(2);
  const at = args.indexOf(name);
  return at === -1 ? fallback : args[at + 1];
}

function pickPort() {
  const wanted = Number(flagValue('--port', '8080'));
  return Number.isInteger(wanted) && wanted > 0 && wanted < 65536 ? wanted : 8080;
}

// Join a URL path onto the app root, returning null when it escapes.
function safeJoin(requested) {
  const parts = requested.split('/').filter((part) => part !== '' && part !== '.');
  if (parts.includes('..')) return null;
  const file = resolve(join(root, ...parts));
  if (file !== root && !file.startsWith(root + sep)) return null;
  return file;
}

const port = pickPort();
const host = flagValue('--host', '127.0.0.1');

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  let pathname = url.pathname;
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    response.writeHead(400).end('bad request');
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = safeJoin(pathname);
  if (file === null) {
    console.log(`403 ${pathname}`);
    response.writeHead(403).end('forbidden');
    return;
  }
  let size;
  try {
    const stats = statSync(file);
    if (!stats.isFile()) throw new Error('not a file');
    size = stats.size;
  } catch {
    console.log(`404 ${pathname}`);
    response.writeHead(404).end('not found');
    return;
  }
  response.writeHead(200, {
    'content-type': MIME_TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'content-length': size,
    'cache-control': 'no-store',
  });
  createReadStream(file).pipe(response);
}).listen(port, host, () => {
  console.log(`app/ is on http://${host}:${port}`);
});
