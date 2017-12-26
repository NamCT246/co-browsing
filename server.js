var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var cors = require('cors');

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  
  socket.on('disconnect', function () {
    socket.broadcast.emit('onUserDisconnected', {
      id: socket.id
    });
  });

  socket.on('mouseMove', function (data) {
    socket.broadcast.emit('onMouseMove', {
      id: socket.id,
      mouseMoveData: data
    });
  });

  socket.on('mouseClick', function (data) {
    socket.broadcast.emit('onMouseClick', {
      id: socket.id,
      mouseClickData: data
    });
  });

  socket.on('mouseScroll', function (data) {
    socket.broadcast.emit('onMouseScroll', {
      id: socket.id,
      mouseScrollData: data
    });
  });

});

const port = process.env.PORT || 9999;
server.listen(port, function() {
  console.log('Example app listening on port ' + port);
});