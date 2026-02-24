const http = require('http');
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'frontend', 'build');
const port = process.env.PORT || 3001;

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  }[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';

  const filePath = path.join(buildDir, decodeURIComponent(reqPath));

  // If file exists, serve it; otherwise fall back to index.html (SPA)
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      sendFile(res, filePath);
    } else {
      sendFile(res, path.join(buildDir, 'index.html'));
    }
  });
});

server.listen(port, () => {
  console.log(`Serving frontend build from ${buildDir} at http://localhost:${port}`);
});
