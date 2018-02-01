define(
  ['require', 'jquery', 'socket', 'main-ui', 'hangman', 'cursor'],
  (require, $, socket, ui, hangman, cursor) => {
    'use strict';

    var session = {},
      $lobby = $('#lobby'),
      $room = $('#room');

    function openRoom(room) {
      $lobby.fadeOut();
      $room.show();
      $room.find('.welcome').html('You are now in room ' + room);
      $lobby.off('click')
      // color = ui.getUserColor(socketId);
      $('#leaveRoom').html('Leave room ' + room);

      cursor.init(room);
    }

    function closeRoom() {
      $room.fadeOut();
      $room.off('click');
      $lobby.show();
    }

    session.create = $('#createSession').click(function () {
      var room = $('#roomName').val();

      if (!room) return alert('Please add new name');

      socket.connection.emit('createRoom', room, function (data) {
        console.log(data);
        if (data.type === 'Abort') {
          return alert('Error: ' + data.reason);
        }

        if (data.type === 'Ok') {
          openRoom(data.room);
        }
      });

      // prettier-ignore
      var words = ['musta', 'sininen', 'ruskea', 'värit', 'harmaa', 'vihreä', 'oranssi', 'punainen', 'valkoinen', 'keltainen', 'Persikoita', 'Päärynoitä', 'Pippureita', 'Ananaksia', 'pitsa', 'perunoita', 'Kurpitsoja', 'salaatti', 'suola', 'voileipä', 'limukka', 'limppari', 'mansikoita', 'sokeri', 'tee', 'tomaatteja', 'Vihannekset', 'vesi', 'Vesimeloneja',];

      hangman.init(words);
    });

    session.join = $('#joinSession').click(function () {
      var room = $('#joinRoom').val();
      socket.connection.emit('joinRoom', room, function (data) {
        if (data.type === 'Abort') {
          return alert('Error: ' + data.reason);
        }

        if (data.type === 'Ok') {
          openRoom(data.room);
          socket.connection.on('progress', function (data) {
            console.log(data);
            ui.updateProgress(data);
          });
        }
      });
    });

    session.leave = $('#leaveRoom').click(function () {
      socket.connection.emit('leaveRoom', room, function (data) {
        if (data.type === 'Ok') {
          closeRoom();
        }
      });
    });

    return session;
  }
);
