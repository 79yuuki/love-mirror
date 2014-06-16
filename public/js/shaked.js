/* global io */
'use strict';

var socket = io();
var users = {};

socket.on('shaked', function(shaked){
  var user = shaked.user;
  console.log(user.id, user.count);
  users[user.id] = { name: user.name, count: user.count };
});

socket.on('newUser', function(userData){
  console.log('Here comes a new challenger', userData);
});


