const http = require('http');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, 'downloaded_test.mp4'); // Arquivo onde o vídeo será salvo
const file = fs.createWriteStream(outputPath);

http.get('http://localhost:3000/video', (res) => {
    console.time('Upload')
    if (res.statusCode !== 200) {
        console.error(`Failed to get video: ${res.statusCode}`);
        return;
    }
    
    res.pipe(file);
    
    file.on('finish', () => {
        console.timeEnd('Upload')
        file.close();
        console.log('Download completed.');
    });
}).on('error', (err) => {
  fs.unlink(outputPath, () => {}); // Remove o arquivo em caso de erro
  console.error('Error downloading video:', err.message);
});
