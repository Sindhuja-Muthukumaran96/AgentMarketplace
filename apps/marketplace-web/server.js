/**
 * Minimal, dependency-free static server for the local agent marketplace.
 * Serves the catalog UI at "/" and the whole monorepo as static files
 * underneath it (so "view source/docs" links to package READMEs work),
 * with basic path-traversal protection.
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = process.env.MARKETPLACE_PORT || 4500;
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const PUBLIC_DIR = path.join(__dirname, 'public');

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

function send(res, status, body, contentType) {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(body);
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 404, 'Not found', 'text/plain; charset=utf-8');
      return;
    }
    send(res, 200, data, CONTENT_TYPES[ext] || 'application/octet-stream');
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === '/') {
    serveFile(res, path.join(PUBLIC_DIR, 'index.html'));
    return;
  }
  if (pathname === '/catalog.json') {
    serveFile(res, path.join(__dirname, 'catalog.json'));
    return;
  }

  // Everything else is served relative to the repo root (e.g. package READMEs),
  // resolved and verified to stay inside the repo to prevent path traversal.
  const resolved = path.normalize(path.join(REPO_ROOT, pathname));
  if (!resolved.startsWith(REPO_ROOT)) {
    send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
    return;
  }
  serveFile(res, resolved);
});

server.listen(PORT, () => {
  console.log(`Agent Marketplace running at http://localhost:${PORT}`);
});
