'use strict';

var async = require('async');
var _ = require('lodash');

// Rrame Rate
var FR = 10;

function socketHandler(app, done){
  var http = require('http').Server(app);
  var io = require('socket.io')(http);
  var users = {};
  var winner = {};

  io.on('connection', function(socket){
    console.log('a user connected');

    // Return the existing user information
    // when the user came to the page for the first time
    socket.on('getUsers', function(){
      socket.emit(users);
    });

    socket.on('newUser', function(user){
      socket.userId = user.id;
      io.emit('newUser', {id: user.id, name: user.name, count: 0});
      users[user.id] = { id: user.id, name: user.name, count: 0 };
    });

    socket.on('shake', function(shake){
      console.log('SHAKE!!! x: ' + shake.x + ', y: ' + shake.y + ', z: ' + shake.z );
      console.log(shake);
      var user = shake.user;

      users[user.id] = { id: user.id, name: user.name, count: user.count };
      io.emit('shaked', shake);
    });

    // ready from face detection
    socket.on('ready', function(){
      console.log('ready');
      io.emit('ready');
    });

    // cancel face detection
    socket.on('cancelReady', function(){
      console.log('cancelReady');
      io.emit('waiting');
    });

    // start from smile detection
    var playing = false;
    socket.on('start', function(){
      console.log('start');
      // count down
      var countTime = 3000;
      var countDown;
      function startCountDown(callback){
        playing = true;
        countDown = setInterval(function(){
          //socket.volatile.emit('countDown', { countTime: countTime });
          io.emit('countDown', { countTime: countTime });
          if (countTime === 0) {
            clearCountDown(callback);
          }
console.log('#######countTime:', countTime);
          countTime -= FR;
        }, FR);
      }
      function clearCountDown(callback){
        clearInterval(countDown);
        callback();
      }

      // start game
      var playTime = 10000;
      var playCount;
      function startGame(callback){
        playCount = setInterval(function(){
          //socket.volatile.emit('playTime', { playTime: playTime });
          io.emit('playTime', { playTime: playTime });
          if (playTime === 0) {
            clearPlayCount(callback);
          }
console.log('#######playTime:', playTime);
          playTime -= FR;
        }, FR);
      }
      function clearPlayCount(callback){
        clearInterval(playCount);
        callback();
      }

      // finish game
      function finish(callback){
        winner = _.max(_.values(users), 'count');

        // TODO 終わった直後にemit.('start')したら開始しないように注意
        playing = false;
console.log('####winner####', winner);
        callback(null, winner);
      }

      if (!playing) {
        async.waterfall([
          startCountDown,
          startGame,
          finish
        ], function(err, result){
          io.emit('finish', result);
          // TODO しばらくしたらリセットして winner 等初期化する。
        });
      }

    });

    socket.on('disconnect', function(){
      console.log('user disconnected');
      delete users[socket.userId];
      socket.broadcast.emit('user left', { id: socket.userId });
    });
  });

  return done(http);
}

module.exports = socketHandler;
