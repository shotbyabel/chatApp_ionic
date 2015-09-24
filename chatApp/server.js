var express = require('express'),
    app     = express(),
    server  = require('http').createServer(app),
    port    = process.env.PORT || 3000,

    io      = require('socket.io')().listen(server);


  server.listen(port);
      console.log('Server is listening on port ' + port);
