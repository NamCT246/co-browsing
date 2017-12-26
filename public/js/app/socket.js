define(["socket.io"], function (io) {
  var signallingLocalServerAddr = "http://localhost:9999";
  var signallingHerokuServerAddr = "https://localhost:9999";
  var socket = io.connect({
    url: signallingLocalServerAddr
  });
  return socket;
});