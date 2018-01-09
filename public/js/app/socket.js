define(['socket.io'], io => {
  var signallingLocalServerAddr = 'http://localhost:9999';
  var signallingHerokuServerAddr = 'https://localhost:9999';
  var socketConnection = io.connect({
    url: signallingLocalServerAddr,
  });

  var socket = {
    connection: socketConnection,
  };

  return socket;
});
