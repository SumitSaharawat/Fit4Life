#!/usr/bin/env node
/**
 * Serves the dist/ folder on port 3000. No npm install needed.
 * Run: node serve.cjs
 * Then open http://localhost:3000 in Safari
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = path.join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  let p = req.url === '/' ? '/index.html' : req.url;
  p = path.join(ROOT, path.normalize(p).replace(/^(\.\.(\/|\\|$))+/, ''));
  if (!p.startsWith(ROOT)) {
    res.writeHead(403);
    res.end();
    return;
  }
  fs.readFile(p, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(500);
      res.end(String(err));
      return;
    }
    const ext = path.extname(p);
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  Fit4Life running at:');
  console.log('  → http://localhost:' + PORT + '/');
  console.log('  → http://127.0.0.1:' + PORT + '/');
  console.log('');
  console.log('  Open one of the URLs above in Safari. Press Ctrl+C to stop.');
  console.log('');
});
