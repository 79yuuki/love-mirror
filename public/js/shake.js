/* global io, userId, userName, $  */
'use strict';

var socket = io();
var count = 0;

(function(){
  console.log(userId, userName);
  if (userId && userName) {
    socket.emit('newUser', { id: userId, name: userName});
    countUp(0);
  }
})();

window.addEventListener('devicemotion', function(event) {
  var gv = event.accelerationIncludingGravity;
  if ( gv.x > 17) {
    count++;
    socket.emit('shake', {
      x: gv.x,
      y: gv.y,
      z: gv.z,
      user: { id: userId, name: userName, count: count }
    });
    countUp(count);
  }
});

function countUp(count){
  $('#count').html(count);
}
