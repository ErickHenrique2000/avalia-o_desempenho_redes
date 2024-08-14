const http = require('http');
const fs = require('fs');
const path = require('path');

const videoPath = path.join(__dirname, 'test.mp4'); // Substitua pelo nome do seu arquivo de vídeo
const PORT = 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/video') {
    fs.stat(videoPath, (err, stats) => {
      if (err) {
        console.error('Error getting video file stats:', err);
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Internal Server Error');
        return;
      }

      res.writeHead(200, {
        'Content-Type': 'video/mp4',
        'Content-Length': stats.size
      });

      const videoStream = fs.createReadStream(videoPath);
      videoStream.pipe(res);
    });
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
});
