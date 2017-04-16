/**
 * Created by Jozef on 13.04.2017.
 */

var express = require('express');
var router = express.Router();
var dataStore = require('../lib/dataAPI');

router.post('/', async function(req, res, next) {
    console.log("/admin - post");
    console.log(req.body);
    switch (req.body.cmd){
        case 'saveHints':
            console.log('Going to save hints');
            ret = await dataStore.saveHints(req.body.hints);
            break;
        case 'addPIN':
            console.log('Going to add pin');
            ret = await dataStore.addPIN(req.body.PIN);
            break;
    }

    if (ret)
        res.end('{"result":"ok", "status":200}');
    else
        res.end('{"result":"error", "status":200}');
});

router.get('/',function(req, res, next){
    var cookie = req.cookies.Auth13zahrada;
    if (cookie === undefined) {
        console.log("/admin - not authenticated - redirecting to index");
        res.redirect('/');
    } else {
        console.log("/admin - already authenticated");
        next();
    }
});

router.get('/', function(req, res, next) {
    console.log("/admin - rendering");
    res.render('admin', { title: '13. záhrada' });
});

module.exports = router;
