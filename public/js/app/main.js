define(
  [
    'require',
    'jquery',
    'socket',
    'main-ui',
    'sessionManager'
  ],
  (require, $, socket, ui, session) => {
    $(document).ready(() => {
      /** **********************************
       * Connect to the signalling server *
       *********************************** */

      requirejs([
        'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'
      ]);

      socket.connection.on('connect', () => {
        console.log("User " + socket.getClientId() + " has connected");
      });

      socket.connection.on('message', (msg) => {
        console.log(msg);
      });

      socket.connection.on('leaveRoom', (data) => {
        console.log('User ' + data.username + 'has just left the room');
      });

      socket.connection.on('successJoin', (room) => {
        console.log('Successfully joined ' + room);
      });

      socket.connection.on('userJoin', (data) => {
        ui.sendProgress(data.user);
      });

    });
  }
);
