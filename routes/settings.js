/**
 * Created by Jozef on 13.04.2017.
 */

var express = require('express');
var router = express.Router();
var dataStore = require('../lib/dataAPI');

router.get('/', function(req, res, next) {
    res.render('settings', { title: '13. záhrada' });
});

router.post('/', function(req, res, next) {
    console.log(req.body);
    dataStore.saveHints(req.body.hints);
    res.end('{"result" : "ok", "status" : 200}');
});

module.exports = router;
