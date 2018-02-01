define(['socket.io'], io => {
  var signallingLocalServerAddr = 'http://localhost:9999';
  var signallingHerokuServerAddr = 'https://localhost:9999';
  var socketConnection = io.connect({
    url: signallingLocalServerAddr,
  });

  var socket = {
    connection: socketConnection,
    getClientId: function () {
      return this.connection.id;
    }
  };

  return socket;
});
