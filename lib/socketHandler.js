'use strict';

//var _ = require('lodash');

function socketHandler(app){
  var http = require('http').Server(app);
  var io = require('socket.io')(http);
  var users = {};

  io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('shake', function(shake){
      console.log('SHAKE!!! x: ' + shake.x + ', y: ' + shake.y + ', z: ' + shake.z );
      console.log(shake);
      var user = shake.user;

      if (!users[user.id]){
        io.emit('newUser', { id: user.id, name: user.name, count: user.count });
      }
      users[user.id] = { name: user.name, count: user.count };
      io.emit('shaked', shake);
    });

    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
  });

  return http;
}

module.exports = socketHandler;
