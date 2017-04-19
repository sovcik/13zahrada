var express = require('express');
var path = require('path');
var env = require('dotenv').config();
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var dataAPI = require('./lib/dataAPI.js');
var utils = require('./lib/utils.js');

var CronJob = require('cron').CronJob;

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

// get cron job recurrence pattern from environment variable
var cronPatSendReport = process.env.CRON_SEND_RPT;
// if not set, set default
if (!cronPatSendReport || cronPatSendReport.trim() == "") cronPatSendReport = '20 * * * * *';

console.log("Configuring CRON job SendReport pattern="+cronPatSendReport);
var jobSendReport = new CronJob(cronPatSendReport, function() {
    console.log("Starting jobSendReport pattern="+cronPatSendReport);
    // get reports which has not been emailed yet
    dataAPI.getReportsWaitingForEmail(function(err,list){
        if (err) {
            console.log("Error occurred while getting not sent reports. "+JSON.stringify(err));
            return;
        }
        for (var i=0; i<list.length; i++) {
            console.log("Sending report "+(i+1)+"/"+list.length);
            utils.createReport(list[i].pin, list[i].date, {$set:{sent: 1}}, function (err, r) {
                if (err) {
                    console.log("Error occurred while generating report. " + JSON.stringify(err));
                }
                console.log("Data="+JSON.stringify(r.reportData));

            });
        }

    });

    }, null,
    true, // start now
    process.env.TZ // timezone
);

module.exports = app;
