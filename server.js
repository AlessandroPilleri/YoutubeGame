//  Dependencies
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const ytdl = require('ytdl-core');

// Initializing server, port and websocket
let app = express();
let server = http.Server(app);
let io = socketIO(server);

app.set('port', 8080);
app.use('/public', express.static(__dirname + '/public'));

// Routing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start the server
server.listen(8080, () => {
    console.log('Starting server on port 8080');
});

// HTTP handlers
app.get('/bcgaudio', (req, res) => {
    let id = req.query.v;

    ytdl.getInfo(id, (err, info) => {
        if (err) throw err;
        let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
        console.log('Formats with only audio: ' + audioFormats.length);
    });

    res.writeHead(200, {
        'Content-Type': 'audio/mp3',
        'Content-Disposition': 'attachment; filename=' + id
    });

    ytdl('http://www.youtube.com/watch?v=' + id)
        .pipe(res);
});

// Socket handlers