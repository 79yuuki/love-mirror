/* global io, $ */
'use strict';

var socket = io();
var users = {};

socket.on('shaked', function(shaked){
  var user = shaked.user;
  console.log(user.id, user.count);
  users[user.id] = { name: user.name, count: user.count };
  $('#'+user.id).html(formatList(user.name, user.count));
});

socket.on('newUser', function(userData){
  console.log('Here comes a new challenger', userData);
  $('#users')
  .append('<li id="' + userData.id + '"><img src="https://graph.facebook.com/' + userData.id + '/picture?height=300" />' + formatList(userData.name, userData.count) + '</li>');
});

socket.on('countDown', function(data){
console.log('#####countDown ', data);
  $('#countDown').html(data.countTime);
});

socket.on('playTime', function(data){
console.log('#######playTime ', data);
  $('#playTime').html(data.playTime);
});

socket.on('finish', function(winner){
console.log('####winner""""',winner);
  $('#winner').html(winner.name);
});

socket.on('user left', function(user){
  $('#'+user.id).remove();
});

function formatList(name, count){
  return name + ' : ' + count;
}
