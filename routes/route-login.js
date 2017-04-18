var express = require('express');
var dataAPI = require('../lib/dataAPI.js');
var assert = require('assert');
var router = express.Router();
var utils = require('../lib/utils.js');

router.get('/',function(req, res, next){
    var cookie = req.cookies.Auth13zahrada;
    if (cookie === undefined) {
        console.log("Aot authenticated - continue");
        next();
    } else {
        console.log("Already authenticated");
        console.log("Cookie value="+cookie);
        console.log("Redirecting to hints");
        res.redirect('/hints');
    }
});

router.get('/', function(req, res, next) {
    console.log("Rendering login");
    res.render('login', { title: '13. záhrada - Prihlásenie' });
});

router.post('/', function(req, res, next) {
    if (req.body === null) {
        console.log("posting empty form?")
        next();
    }
    var pin=req.body.pin;
    dataAPI.checkPIN(pin, function(err, r){
        if (r.value != null){
            var doc = r.value;
            console.log("Pin is available docId="+doc._id);

            // create authentication cookie
            var cookieValue = doc._id;
            var cookieExpires;
            if (doc.expired != null)
                cookieExpires = new Date(doc.expired);

            console.log("Cookie value="+cookieValue+" expires="+cookieExpires);

            // record login
            //dataAPI.log2db(pin, cookieValue,'login','success');

            res.cookie('Auth13zahrada', cookieValue, { expires: cookieExpires, httpOnly: true });
            console.log('Cookie created successfully');

            // redirect to hints
            console.log("Login successful");
            res.json({"result":"ok"});

        } else {
            console.log("Pin not found in the list of active PINs");
            dataAPI.log2db(pin,null,'login','failed');
            res.json({"result":"error"});

        }
    });

});

module.exports = router;
