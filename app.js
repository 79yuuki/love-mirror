'use strict';

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var routes = require('./routes/index');
var shake = require('./routes/shake');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({secret: 'loveMirror'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// PC page
app.use('/', routes);
// SmartPhone page or facebook login page
app.use('/shake', shake);

passport.serializeUser(function(user, done){
  done(null, user);
});
passport.deserializeUser(function(obj, done){
  done(null, obj);
});

// facebook auth
var FACEBOOK_APP_ID = "734337516630340";
var FACEBOOK_APP_SECRET = "6bc43f6db0a4dcd1e09d92a0acecd4ad";
var CALLBACK_URL = "http://love-mirror./auth/facebook/callback";
//var CALLBACK_URL = "http://localhost:3000/auth/facebook/callback";

passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: CALLBACK_URL
},function(accessToken, refreshToken, profile, done){
  process.nextTick(function(){
    return done(null, profile);
  });
}));


// from example
//function ensureAuthenticated(req, res, next) {
//  if (req.isAuthenticated()) { return next(); }
//  res.redirect('/login');
//}
// demo page
//app.get('/account/facebook', ensureAuthenticated, account);
//app.get('/login', login_facebook);

// login url
app.get('/auth/facebook',
  passport.authenticate('facebook')
);
// callback url after facebook login
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res){
    res.redirect('/shake');
  }
);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/shake');
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

// socket setting
var socketHandler = require('./lib/socketHandler');
var http = socketHandler(app);

http.listen(3000, function(){
  //console.log('listening on *:3000');
});

module.exports = app;
