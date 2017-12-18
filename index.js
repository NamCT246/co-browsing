const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.on('click', function (data) {
    console.log(data);
  });
});

const port = process.env.PORT || 9999;
server.listen(port, () => console.log('Example app listening on port ' + port));