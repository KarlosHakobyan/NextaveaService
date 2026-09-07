/* ==========================================================================
   Static file server for local development.

   The site is ES modules, so it cannot be opened from the filesystem —
   file:// blocks module imports. It has to be served over http.

   There is no Python on this machine, so this stands in for
   `python -m http.server`. No dependencies; Node only.

       node scripts/serve.js          → http://localhost:8000
       node scripts/serve.js 8080     → a different port

   Public site:  http://localhost:8000/
   Admin:        http://localhost:8000/admin/
   ========================================================================== */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.argv[2]) || 8000;
const ROOT = path.resolve(__dirname, '..');

const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'text/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg':  'image/svg+xml',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.webp': 'image/webp',
    '.ico':  'image/x-icon',
    '.ttf':  'font/ttf',
    '.woff': 'font/woff',
    '.woff2':'font/woff2',
    '.txt':  'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
    let urlPath;
    try {
        urlPath = decodeURIComponent(req.url.split('?')[0]);
    } catch {
        res.writeHead(400).end('Bad request');
        return;
    }

    if (urlPath.endsWith('/')) urlPath += 'index.html';

    const filePath = path.join(ROOT, urlPath);

    // Never serve anything outside the site directory.
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403).end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(`404 — ${urlPath} not found`);
            console.log(`404 ${urlPath}`);
            return;
        }
        /* Nothing here is ever cached. During development a stale ES module
           is indistinguishable from a bug that will not go away, so the
           browser is told, three different ways, not to keep anything. No
           ETag and no Last-Modified are sent either, so there is nothing to
           revalidate against and no 304 to serve. */
        res.writeHead(200, {
            'Content-Type': TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Serving ${ROOT}`);
    console.log(`  Site:  http://localhost:${PORT}/`);
    console.log(`  Admin: http://localhost:${PORT}/admin/`);
    console.log('Ctrl+C to stop.');
});

server.on('error', err => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Try: node scripts/serve.js 8080`);
        process.exit(1);
    }
    throw err;
});
