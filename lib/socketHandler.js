'use strict';

var async = require('async');
var _ = require('lodash');

function socketHandler(app){
  var http = require('http').Server(app);
  var io = require('socket.io')(http);
  var users = {};

  // Return the existing user information
  // when the user came to the page for the first time
  app.post('/getUsers', function(req, res){
    res.json(users);
  });

  io.on('connection', function(socket){
    console.log('a user connected');

    //TODO add new user はコネクション時に書こう
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
      io.emit('ready');
    });

    // cancel face detection
    socket.on('cancel ready', function(){
      io.emit('waiting');
    });

    // start from smile detection
    var playing = false;
    socket.on('start', function(){
      // count down
      var countTime = 3000;
      var countDown;
      function startCountDown(callback){
        playing = true;
        countDown = setInterval(function(){
          socket.volatile.emit('countDown', { countTime: countTime });
          if (countTime === 0) {
            clearCountDown(callback);
          }
          countTime--;
        }, 1);
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
          socket.volatile.emit('playTime', { playTime: playTime });
          if (playTime === 0) {
            clearPlayCount(callback);
          }
          playTime--;
        }, 1);
      }
      function clearPlayCount(callback){
        clearInterval(playCount);
        callback();
      }

      // finish game
      function finish(callback){
        var winner = _.max(_.values(users));

        // TODO 終わった直後にemit.('start')したら開始しないように注意
        playing = false;
        callback(winner);
      }

      if (!playing) {
        async.series([
          startCountDown,
          startGame,
          finish
        ], function(err, result){
          io.emit('finish', result);
        });
      }

    });

    socket.on('disconnect', function(){
      console.log('user disconnected');
      delete users[socket.userId];
      socket.broadcast.emit('user left', { id: socket.userId });
    });
  });

  return http;
}

module.exports = socketHandler;
