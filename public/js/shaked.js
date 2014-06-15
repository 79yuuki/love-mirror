/* global io */
'use strict';

var socket = io();
socket.on('shaked', function(shaked){
  console.log(shaked.user, shaked.count);
});
