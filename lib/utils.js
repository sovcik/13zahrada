var nodemailer = require('nodemailer');
var assert = require('assert');
var pug = require('pug');
var dataAPI = require('../lib/dataAPI');
var CronJob = require('cron').CronJob;

var exports = module.exports = {};

exports.createReport = createReport = function(pin, pinDate, callback)
{
    console.log('createReport pin='+pin+"  date="+pinDate);

    dataAPI.getHintUsage(pin, pinDate, function (err, r) {
        var res = {result:"error", status: 200};
        ret = (err == null && r != null);
        if (ret) {
            var rptData = r;

            var rptFunc = pug.compileFile('views/report.pug');
            var rHTML = rptFunc(rptData);

            rptData.usedHints.sort();
            res = {result: "ok", status: 200, reportHTML: rHTML, reportData:rptData};

        }
        //console.log("createRep="+JSON.stringify(res));
        callback(err,res);

    });
};

// get cron job recurrence pattern from environment variable
var cronPatSendReport = process.env.CRON_SEND_RPT;
// if not set, set default
if (!cronPatSendReport || cronPatSendReport.trim() == "") cronPatSendReport = '20 * * * * *';

console.log("Configuring cron job SendReport pattern="+cronPatSendReport);

exports.jobSendReport = new CronJob(cronPatSendReport,
    function() {
        console.log("jobSendReport starting. pattern="+cronPatSendReport);

        assert(process.env.SMTP_USER,"Environment variable SMTP_USER not set.");
        assert(process.env.SMTP_PWD,"Environment variable SMTP_PWD not set.");
        assert(process.env.SMTP_HOST,"Environment variable SMTP_SERVER not set.");
        assert(process.env.SMTP_PORT,"Environment variable SMTP_PORT not set.");
        assert(process.env.SMTP_TLS,"Environment variable SMTP_TLS not set.");

        var smtpConfig = {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: (process.env.SMTP_TLS == "yes"),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PWD
            }
        };

        // create reusable transporter object using the default SMTP transport
        console.log("Creating email transport via smtp://"+smtpConfig.auth.user+":****@"+smtpConfig.host+":"+smtpConfig.port+"  TLS="+smtpConfig.secure);
        var transporter = nodemailer.createTransport(smtpConfig);

        // setup email data with unicode symbols
        var mailOptions = {
            from: process.env.EMAIL_FROM, // sender address
            to: process.env.EMAIL_TO, // list of receivers
            subject: '', // Subject line
            text: '', // plain text body
            html: '' // html body
        };

        console.log("Emails will be sent FROM:"+mailOptions.from+"  TO:"+mailOptions.to);

        // get reports which has not been emailed yet
        dataAPI.getReportsWaitingForEmail(function(err,list){
            if (err) {
                console.log("Error occurred while getting not sent reports. "+JSON.stringify(err));
                return;
            }
            for (var i=0; i<list.length; i++) {
                console.log("Sending report "+(i+1)+"/"+list.length);
                createReport(list[i].pin, list[i].date, function (err, r) {
                    if (err) {
                        console.log("Error occurred while generating report. " + JSON.stringify(err));
                        return;
                    }

                    mailOptions.subject = "[13zahrada-"+process.env.DB_DATABASE+"] Použité nápovedy pre PIN "+r.reportData.pin+" zo dňa "+r.reportData.date.toLocaleDateString();
                    mailOptions.html = r.reportHTML;

                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.log("FAILED sending report to "+mailOptions.to);
                            return console.log(error);
                        }
                        console.log('Message %s sent: %s', info.messageId, info.response);
                        dataAPI.markSentReport(r.reportData._id,function(err,res){
                            if (err){
                                console.log("Failed marking report as sent id="+r.reportData._id);
                                return console.log(err);
                            }

                        });
                    });

                });
            }

        });

        console.log("jobSendReport Done");
    }, function(){
        console.log("jobSendReport Stopped");
    },
    true, // start now
    process.env.TZ // timezone
);

exports.loadAllHints = function(callback){
    dataAPI.loadAllHints(function(err,arr){
        var s = "";
        if (err){
            console.log("Failed to load hints");
            console.log(err);
            return s;
        }
        for (var i=0;i<arr.length;i++){
            console.log("Hint "+(i+1)+"/"+arr.length);
            s += arr[i].title+"\n"+arr[i].l1+"\n"+arr[i].l2+"\n\n";
        }
        callback(s);

    })
};
