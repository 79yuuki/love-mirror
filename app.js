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
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

passport.serializeUser(function(user, done){
  done(null, user);
});
passport.deserializeUser(function(obj, done){
  done(null, obj);
});

// facebook auth
var FACEBOOK_APP_ID = "734337516630340";
var FACEBOOK_APP_SECRET = "6bc43f6db0a4dcd1e09d92a0acecd4ad";
var CALLBACK_URL = "http://localhost:3000/auth/facebook/callback";

passport.use(new FacebookStrategy({
  // TODO http://creator.cotapon.org/articles/node-js/node_js-oauth-passport-facebook-twitter
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: CALLBACK_URL
},function(accessToken, refreshToken, profile, done){
  process.nextTick(function(){
    done(null, profile);
  });
}));

function facebookEnsureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

app.get('/account/facebook', facebookEnsureAuthenticated, routes.account);
app.get('/login/facebook', routes.login_facebook);
app.get('/auth/facebook',
  passport.authenticate('facebook')
);
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login/facebook' }),
  function(req, res){
    res.redirect('/');
  }
);

app.get('/logout/facebook', function(req, res){
  req.logout();
  res.redirect('/');
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


module.exports = app;
