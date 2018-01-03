define([
  'require',
  'jquery',
  'socket'
], function (require, $, socket) {
  'use strict';

  var session = {},
    $lobby = $('#lobby'),
    $room = $('#room');

  function openRoom(room) {
    $lobby.fadeOut();
    $room.show();
    $lobby.off('click');

    $('#leaveRoom').html('Leave room ' + room);
    
  }
  
  function closeRoom() {
    $room.fadeOut();
    $room.off('click');
    $lobby.show();
  }

  session.create = $("#createSession").click(function () {

    var room = $("#roomName").val();
    socket.connection.emit('createRoom', room, function (data) {
      console.log(data);
      if (data.type === 'Abort') {
        return alert("Error: " + data.reason);
      }

      if (data.type === 'Ok') {
        openRoom(data.room);
      }
    });
  });

  session.join = $("#joinSession").click(function () {

    var room = $("#joinRoom").val();
    socket.connection.emit('joinRoom', room, function (data) {

      if (data.type === 'Abort') {
        return alert("Error: " + data.reason);
      }

      if (data.type === 'Ok') {
        openRoom(data.room);
      }
    });
  });

  session.leave = $("#leaveRoom").click(function(){
    socket.connection.emit('leaveRoom', room, function(data){
      if(data.type === 'Ok'){
        closeRoom();
      }
    })
  })

  return session;
});