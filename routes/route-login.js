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
    res.render('login', { title: '13. záhrada' });
});

router.post('/', function(req, res, next) {
    if (req.body === null) {
        console.log("posting empty form?")
        next();
    }
    var pin=req.body.pin;
    dataAPI.checkPIN(pin, function(err, r){
        console.log(JSON.stringify(r));
        if (r.value != null){
            var doc = r.value;
            console.log("Pin is available docId="+doc._id);

            // create authentication cookie
            var cookieValue = doc._id;
            var cookieExpires;
            if (doc.expired != null)
                cookieExpires = new Date(doc.expired);

            console.log("Cookie value="+cookieValue+" expires="+cookieExpires);
            res.cookie('Auth13zahrada', cookieValue, { expires: cookieExpires, httpOnly: true });
            console.log('Cookie created successfully');

            // redirect to hints
            console.log("Redirecting from login to hints");
            res.redirect('/hints');

            // record login
            dataAPI.log2db(pin, cookieValue,'login','success');

        } else {
            console.log("Pin not found in the list of active PINs");
            dataAPI.log2db(pin,null,'login','failed');
            res.json({"result":"error"});
            res.end();
        }
    });

});

module.exports = router;
