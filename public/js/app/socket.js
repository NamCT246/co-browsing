define(["socket.io"], function (io) {
  var signallingLocalServerAddr = "http://localhost:9999";
  var signallingHerokuServerAddr = "https://localhost:9999";
  var socketConnection =  io.connect({
    url: signallingLocalServerAddr
  });

  var socket = {
    connection: socketConnection
    // listRooms: listRooms()
  };

  // function listRooms () {
  //   io.adapter.allRooms(function (err, rooms) {
  //     console.log(rooms); // an array containing all rooms (accross every node)
  //     return rooms;
  //   });
  // }
  return socket;
});