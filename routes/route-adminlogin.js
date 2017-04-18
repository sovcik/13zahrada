var express = require('express');
var dataAPI = require('../lib/dataAPI.js');
var assert = require('assert');
var router = express.Router();
var utils = require('../lib/utils.js');
var pwdhash = require('../lib/password-hash');

router.get('/',function(req, res, next){
    var cookie = req.cookies.Auth13zahradaAdmin;
    if (cookie === undefined) {
        console.log("Not authenticated - continue");
        next();
    } else {
        console.log("Already authenticated");
        console.log("Cookie value="+cookie);
        console.log("Redirecting to admin");
        res.redirect('/admin');
    }
});

router.get('/', function(req, res, next) {
    console.log("Rendering admin login");
    res.render('adminlogin', { title: '13. záhrada - AdminLogin' });
});

router.post('/', function(req, res, next) {
    if (req.body === null) {
        console.log("posting empty form?")
        next();
    }
    var enteredPwd=req.body.password;
    dataAPI.getSettings(function(err, doc){
        console.log('adminlogin-post '+JSON.stringify(doc));
        if (doc != null){
            var ap = doc.adminPassword;
            var cookieValue;
            console.log("Pwd="+ap);

            // check password
            var pwdOK = (ap === enteredPwd);
            if (pwdhash.isHashed(ap))
                pwdOK = pwdhash.verify(enteredPwd,ap);

            if (!pwdOK) {
                dataAPI.log2db(null,null,'admin-login','failed');
                res.render('../views/error', {message: 'Nesprávne heslo', error:{status:''}});
                next();
                return;
            }

            dataAPI.log2db(null,null,'admin-login','ok');

            if (pwdhash.isHashed(ap))
                cookieValue = ap;
            else
                cookieValue = pwdhash.generate(ap);

            console.log("Cookie value="+cookieValue);
            res.cookie('Auth13zahradaAdmin', cookieValue, { maxAge: 1800000, httpOnly: true });
            console.log('Cookie created successfully');

            // if password is OK, but stored password is not hashed (e.g. it has been reset), then hash stored password
            //if (!pwdhash.isHashed(ap))
            //    dataAPI.updateAdminPassword(pwdhash.generate(ap));

            // redirect to hints
            console.log("Redirecting from adminlogin to admin");
            res.redirect('/admin');

        } else {
            console.log("Settings not found");
            res.render('../views/error',{message:'Interná chyba', error:{status:'Databáza nebola inicializovaná'}});

        }
    });

});

module.exports = router;
