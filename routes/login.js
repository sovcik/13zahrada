var express = require('express');
var router = express.Router();
var mongoDB = require('../lib/dataAPI');

/* GET users listing. */
router.post('/', function(req, res, next) {
    var pin="112233";
    mongoDB.log2db(pin,'login','logged in');
    res.send('respond with a resource');
});

module.exports = router;
