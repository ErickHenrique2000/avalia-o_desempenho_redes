const dgram = require('dgram');
const fs = require('fs');
const path = require('path');

const server = dgram.createSocket('udp4');
const videoPath = path.join(__dirname, 'test.mp4'); 
const CHUNK_SIZE = 60 * 1024; 

server.on('error', (err) => {
  console.log(`Server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(`Received request from ${rinfo.address}:${rinfo.port}`);
  
  const videoStream = fs.createReadStream(videoPath, { highWaterMark: CHUNK_SIZE });

  videoStream.on('data', (chunk) => {
    server.send(chunk, 0, chunk.length, rinfo.port, rinfo.address, (err) => {
      if (err) {
        console.error('Error sending chunk:', err);
      } else {
        console.log('Chunk sent');
      }
    });
  });

  videoStream.on('end', () => {
    console.log('Video file sent successfully');
    server.send('', 0, 0, rinfo.port, rinfo.address, (err) => {
        if (err) {
          console.error('Error sending chunk:', err);
        } else {
          console.log('Chunk sent');
        }
      })
  });

  videoStream.on('error', (err) => {
    console.error('Error reading video file:', err);
  });
});

server.on('listening', () => {
  const address = server.address();
  console.log(`Server listening on ${address.address}:${address.port}`);
});

server.bind(41234); 
