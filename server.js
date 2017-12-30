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

var rooms = {},
  num_user = 0;

io.on('connection', function (socket) {
  // var rooms = Object.keys(socket.rooms);
  // console.log(rooms);

  // socket.on('createRoom', function (data) {
  //   console.log(rooms);
  //   if (rooms.indexOf(data.roomName) !== -1) {
  //     console.log("existed");
  //     socket.emit('response', {
  //       message: 'Room already exist. Try creating a new one'
  //     })

  //   }
  //   else {
  //     socket.join(data.roomName);
  //     rooms.push(data.roomName);
  //     var clients = io.nsps['/'].adapter.rooms[data.roomName];
  //     console.log(clients.length + " in this " + data.roomName);
  //   }
  //   // var clients = io.sockets.adapter.rooms[data.roomName];
  //   // console.log(io.sockets.adapter.rooms);


  //   // for (var clientId in clients) {
  //   //   console.log(io.sockets.clients);
  //   // }
  // });

  var currRoom,
    addedUser = false;

  ++num_user;

  console.log(socket.id + " has joined");

  function leaveRoom(oldRoom) {
    var leaver = {
      id: socket.id,
      username: socket.id
    }

    socket.leave(oldRoom);
    socket.to(oldRoom).emit('leaveRoom', leaver);
    
    if(rooms[oldRoom]){
      --rooms[oldRoom];
      console.log("gonna leave room " + oldRoom, rooms);
    }

    if (rooms[oldRoom] === 0) {
      console.log("no user in room " + oldRoom + " left");
      delete rooms[currRoom];
      console.log(rooms);
    }

  }

  function createRoom(newRoom) {
    socket.join(newRoom);
    addedUser = true;
    currRoom = newRoom;
    rooms[newRoom] = 1;
    updateRoom(newRoom);
  }

  function joinRoom(newRoom) {
    console.log(socket.id + "gonna join " + newRoom);
    socket.join(newRoom);
    addedUser = true;
    currRoom = newRoom;
    ++rooms[newRoom];
    console.log(rooms[newRoom], currRoom);
    updateRoom(newRoom);
  }

  function updateRoom(room) {
    socket.emit('success', room);
  }

  socket.on('createRoom', function (room) {

    if (currRoom && room !== currRoom) {
      leaveRoom(currRoom);
      socket.emit('message', 'Leave old room, create new one');
    }

    if (isRoomExist(room, rooms)) {
      socket.emit('message', 'Room already exist. Try creating a new one');
      return;
    }
    // todo: thing is, after leave and do a lot of stuff inside leave function
    // the createRoom run, and inside that we change addedUser = true;
    createRoom(room);
  })

  socket.on('joinRoom', function (room) {

    //better notify user that hes in room
    // if(addedUser) return;
    
    if (!isRoomExist(room, rooms)) {
      socket.emit('message', 'Room not exist. Better create a new one');
      return;
    }

    if (currRoom) {
      if (room !== currRoom) {
        leaveRoom(currRoom);
        socket.emit('message', 'Leave old room, join new one');
        console.log(rooms);
      }
      else {
        socket.emit('message', 'You are already in this room');
        return;
      }
    }

    joinRoom(room);
    // console.log(socket.id + " is now in " + currRoom);
    console.log(rooms);

  })

  socket.on('disconnect', function () {

    --num_user;

    if (addedUser) {
      --rooms[currRoom];
      socket.emit(leaveRoom, rooms[currRoom]);
    }

    if (rooms[currRoom] === 0) {
      console.log("no user in room " + rooms[currRoom] + " left");
      delete rooms[currRoom];
      console.log(rooms);
    }

    // clear all room if no user present
    if (num_user === 0) {
      rooms = {};
      console.log(rooms);
    }
  });

  socket.on('mouseMove', function (data) {
    socket.in(data.room).emit('onMouseMove', {
      id: socket.id,
      mouseMoveData: data
    });
  });

  socket.on('mouseClick', function (data) {
    socket.in(data.room).emit('onMouseClick', {
      id: socket.id,
      mouseClickData: data
    });
  });

  socket.on('mouseScroll', function (data) {
    socket.in(data.room).emit('onMouseScroll', {
      id: socket.id,
      mouseScrollData: data
    });
  });

  socket.on('inputChanged', function (data) {
    socket.in(data.room).emit('onInputChanged', {
      id: socket.id,
      inputData: data
    })
  });

});

function isRoomExist(roomName, roomList) {
  return roomList[roomName] >= 0;
}

const port = process.env.PORT || 9999;
server.listen(port, function () {
  console.log('Example app listening on port ' + port);
});