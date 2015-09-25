var express = require('express'),
    app     = express(),
    server  = require('http').createServer(app),
    port    = process.env.PORT || 3000,

    io      = require('socket.io')().listen(server);

//listening to events with '.on' method
    io.on("connection", function(socket) {
      console.log("A client has connected");

      socket.on("disconnect", function() {
        console.log("the client has disconnected");
      });

      //c. Event name 'Message' same as on client side
      socket.on("Message", function(data){
        //d. this function will take data as param
        //same object from app.js
        console.log(data.message);

        //e. server replies   //pass JSON obj key: value
        socket.emit("Message", {message: "Hello Client"})
        
      })

    })


  server.listen(port);
      console.log('Server is listening on port ' + port);
