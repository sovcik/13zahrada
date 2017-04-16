var express = require('express');
var dataAPI = require('../lib/dataAPI.js');
var assert = require('assert');
var router = express.Router();
var utils = require('../lib/utils.js');

/* GET home page. */
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
    dataAPI.log2db(pin,'login','logged in');

    // create authentication cookie
    var cookieValue = utils.hashCode(pin);
    res.cookie('Auth13zahrada',cookieValue, { maxAge: 3600000, httpOnly: true });
    console.log('cookie created successfully');

    // redirect to hints
    console.log("redirecting from login to hints");
    res.redirect('/hints');
});

module.exports = router;
