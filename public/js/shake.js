/* global io */
'use strict';

var socket = io();
var count = 0;

window.addEventListener('devicemotion', function(event) {
  var gv = event.accelerationIncludingGravity;
  if ( gv.x > 17) {
    count++;
    socket.emit('shake', {x: gv.x, y: gv.y, z: gv.z, count: count});
  }
});
