const dgram = require('dgram');
const fs = require('fs');
const path = require('path');

const server = dgram.createSocket('udp4');
const videoPath = path.join(__dirname, 'test.mp4'); 
const CHUNK_SIZE = 60 * 1024;
let videoStream;
server.on('message', (msg, rinfo) => {
  const message = msg.toString();
  if (message === 'PAUSE') {
    console.log('Servidor recebeu comando de PAUSE.');
    videoStream.pause();
  } else if (message === 'RESUME') {
    console.log('Servidor recebeu comando de RESUME.');
    videoStream.resume();
  } else {
    console.log(`Received request from ${rinfo.address}:${rinfo.port}`);
    videoStream = fs.createReadStream(videoPath, { highWaterMark: CHUNK_SIZE });
    

    videoStream.on('data', (chunk) => {
      server.send(chunk, 0, chunk.length, rinfo.port, rinfo.address, (err) => {
        if (err) {
          console.error('Erro ao enviar chunk:', err);
        } else {
          console.log('Chunk enviado');
        }
      });
    });

    videoStream.on('end', () => {
      console.log('Arquivo de vídeo enviado com sucesso');
      server.send('', 0, 0, rinfo.port, rinfo.address, (err) => {
        if (err) {
          console.error('Erro ao enviar chunk:', err);
        } else {
          console.log('Chunk enviado');
        }
      });
    });

    videoStream.on('error', (err) => {
      console.error('Erro ao ler arquivo de vídeo:', err);
    });

    server.on('pause', () => {
      videoStream.pause();
    });

    server.on('resume', () => {
      videoStream.resume();
    });
  }
});

server.bind(41234); 
