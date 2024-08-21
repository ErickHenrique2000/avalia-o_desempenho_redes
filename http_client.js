const http = require('http');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, 'downloaded_test.mp4');
const file = fs.createWriteStream(outputPath);

const BUFFER_LIMIT = 10 * 1024 * 1024;
const BUFFER_LOW = 2 * 1024 * 1024;
const CONSUME_RATE = 1024 * 1024;
const CONSUME_INTERVAL = 10;

let buffer = Buffer.alloc(0);
let isPaused = false;

function downloadVideo() {
    const req = http.get('http://localhost:3000/video', (res) => {
        console.time('Upload');
        if (res.statusCode !== 200) {
            console.error(`Falha ao obter o vídeo: ${res.statusCode}`);
            return;
        }

        res.on('data', (chunk) => {
            buffer = Buffer.concat([buffer, chunk]);

            if (buffer.length >= BUFFER_LIMIT && !isPaused) {
                console.log('Buffer cheio. Pausando download.');
                isPaused = true;
                sendCommandToServer('pause');
            }
        });

        res.on('end', () => {
            console.timeEnd('Upload');
            file.close();
            console.log('Download concluído.');
        });
    });

    req.on('error', (err) => {
        fs.unlink(outputPath, () => {}); 
        console.error('Erro ao baixar o vídeo:', err.message);
    });

    consumeBuffer(req);
}

function consumeBuffer(req) {
    const interval = setInterval(() => {
        if (buffer.length > 0) {
            const toWrite = buffer.slice(0, CONSUME_RATE);
            file.write(toWrite);
            buffer = buffer.slice(toWrite.length);

            if (buffer.length <= BUFFER_LOW && isPaused) {
                console.log('Buffer com espaço disponível. Retomando download.');
                isPaused = false;
                sendCommandToServer('resume');
            }
        } else {
            console.log('Buffer vazio. Aguardando dados...');
        }
    }, CONSUME_INTERVAL);
}

function sendCommandToServer(command) {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: `/video?command=${command}`,
        method: 'GET',
    };

    const commandReq = http.request(options, (res) => {
        res.on('data', () => {});
        res.on('end', () => {
            if (command === 'resume') {
                console.log('Download retomado pelo servidor.');
            }
        });
    });

    commandReq.on('error', (err) => {
        console.error(`Erro ao enviar comando ${command}:`, err.message);
    });

    commandReq.end();
}

downloadVideo();
