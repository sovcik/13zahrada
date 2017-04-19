var express = require('express');
var path = require('path');
var env = require('dotenv').config();
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var dataAPI = require('./lib/dataAPI.js');
var utils = require('./lib/utils.js');




var rtLogin = require('./routes/route-login');
//var rtLogin = require('./routes/login');
var rtAdmin = require('./routes/route-admin');
var rtAdminLogin = require('./routes/route-adminlogin');
var rtHints = require('./routes/route-hints');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use(express.cookieParser());

console.log("TimeZone: "+process.env.TZ);

app.use('/adminlogin', rtAdminLogin);
app.use('/admin', rtAdmin);
app.use('/hints', rtHints);
app.use('/login', rtLogin);

app.get('/logout', function (req, res, next){
    console.log("Removing authentication cookie");
    res.cookie('Auth13zahrada',"0000",{expires:new Date('2000-01-01')});
    console.log("Redirecting to login");
    res.redirect('/login');
});

app.get('/',function(req,res,next){
    res.redirect('/hints');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
