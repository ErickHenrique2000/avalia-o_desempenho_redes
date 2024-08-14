const dgram = require('dgram');
const fs = require('fs');
const path = require('path');

const client = dgram.createSocket('udp4');
const outputPath = path.join(__dirname, 'received_test.mp4'); // Arquivo onde o vídeo será salvo
const videoWriteStream = fs.createWriteStream(outputPath);


client.on('message', (msg, rinfo) => {
  console.log(`Received chunk from ${rinfo.address}:${rinfo.port}`);
  if(msg && msg.length > 0){
    videoWriteStream.write(msg);
  }else{
    console.timeEnd('envio')
    console.log('Finalizado')
  }
});

client.on('close', () => {
  console.log('Client connection closed');
  videoWriteStream.end();

});

client.send('Start sending video', 41234, 'localhost', (err) => {
  if (err) {
    console.error('Error sending message to server:', err);
    client.close();
  } else {
    console.time('envio')
    console.log('Request sent to server');
  }
});
