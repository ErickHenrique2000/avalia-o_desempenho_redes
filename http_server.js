const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const videoPath = path.join(__dirname, 'test.mp4');
const PORT = 3000;

let isPaused = false;
let videoStream;

app.get('/video', (req, res) => {
    const command = req.query.command;

    if (command === 'pause') {
        console.log('Servidor recebendo comando de pausa.');
        isPaused = true;
        res.status(200).send('Pausado');
        return;
    }

    if (command === 'resume') {
        console.log('Servidor recebendo comando de retomada.');
        isPaused = false;
        if (videoStream) {
            videoStream.resume();
        }
        res.status(200).send('Retomado');
        return;
    }

    fs.stat(videoPath, (err, stats) => {
        if (err) {
            console.error('Erro ao obter informações do arquivo de vídeo:', err);
            res.status(500).send('Erro interno do servidor');
            return;
        }

        res.writeHead(200, {
            'Content-Type': 'video/mp4',
            'Content-Length': stats.size
        });

        videoStream = fs.createReadStream(videoPath);

        videoStream.on('data', (chunk) => {
            if (isPaused) {
                videoStream.pause();
                console.log('Stream pausado.');
            } else {
                const canContinue = res.write(chunk);
                if (!canContinue) {
                    videoStream.pause();
                    res.once('drain', () => {
                        if (!isPaused) videoStream.resume();
                    });
                }
            }
        });

        videoStream.on('end', () => {
            res.end();
            console.log('Transmissão concluída.');
        });

        req.on('close', () => {
            videoStream.destroy();
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor HTTP rodando em http://localhost:${PORT}`);
});
