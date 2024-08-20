const dgram = require('dgram');
const fs = require('fs');
const path = require('path');

const client = dgram.createSocket('udp4');
const outputPath = path.join(__dirname, 'received_test.mp4');
const videoWriteStream = fs.createWriteStream(outputPath);

const BUFFER_LIMIT = 1000;
const CHUNK_CONSUME_RATE = 1;

let buffer = [];
let paused = false;
let finish = false

const consumeInterval = setInterval(() => {
  console.log(buffer.length)
  if (buffer.length > 0) {
    const chunk = buffer.shift();
    videoWriteStream.write(chunk);

    if (paused && buffer.length < BUFFER_LIMIT / 2) {
      console.log('Buffer abaixo do limite. Retomando o servidor...');
      client.send('RESUME', 41234, 'localhost');
      paused = false;
    }
  }else{
    if(finish){
      clearInterval(consumeInterval);
      videoWriteStream.end();
    }else{
      console.log('Continuando')
      client.send('RESUME', 41234, 'localhost');
      paused = false;
    }
  }
}, CHUNK_CONSUME_RATE);

client.on('message', (msg, rinfo) => {
  if (msg.length > 0) {
    buffer.push(msg);

    if (!paused && buffer.length >= BUFFER_LIMIT * 0.8) {
      console.log('Buffer cheio. Pausando o servidor...');
      client.send('PAUSE', 41234, 'localhost');
      paused = true;
    }
  } else {
    console.log('Recebido todos os chunks.');
    finish = true
    client.close();
  }
});

client.on('close', () => {
  console.log('Conexão do cliente fechada');
});

client.send('Start sending video', 41234, 'localhost', (err) => {
  if (err) {
    console.error('Erro ao enviar mensagem para o servidor:', err);
    client.close();
  } else {
    console.time('envio');
    console.log('Requisição enviada ao servidor');
  }
});

