requirejs.config({
  "baseUrl": "js/app",
  "paths": {
    "app": "../app",
    "jquery": "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min",
    "socket.io": "https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.7.4/socket.io.min",
    "scrollTo": "https://cdnjs.cloudflare.com/ajax/libs/jquery-scrollTo/2.1.2/jquery.scrollTo.min"
  },
  "shim": {
    "jquery": {
      exports: '$'
    },
    "socket.io": {
      exports: 'io'
    },
    "scrollTo": ["jquery"]
  }
});

// Load the main app module to start the app
requirejs(["app/main"]);