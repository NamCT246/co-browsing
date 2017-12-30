define([
  'require',
  'jquery',
  'socket'
], function (require, $, socket) {
  'use strict';

  var session = {};

  session.create = $("#createSession").click(function () {
    // openModal()
    var room = $("#roomName").val();
    socket.connection.emit('createRoom', room);
  });

  session.join = $("#joinSession").click(function () {
    // openModal()
    var room = $("#joinRoom").val();
    console.log(room);
    socket.connection.emit('joinRoom', room);
  });

  return session;
});