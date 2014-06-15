'use strict';

function socketHandler(app){
  var http = require('http').Server(app);
  var io = require('socket.io')(http);

  io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });

    socket.on('shake', function(shake){
      console.log('SHAKE!!! x: ' + shake.x + ', y: ' + shake.y + ', z: ' + shake.z );
      socket.emit('shaked', {user: 'test', count: shake.count});
    });
  });

  return http;
}

module.exports = socketHandler;
