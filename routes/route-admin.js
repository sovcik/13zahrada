/**
 * Created by Jozef on 13.04.2017.
 */

var express = require('express');
var router = express.Router();
var dataStore = require('../lib/dataAPI');

router.post('/', async function(req, res, next) {
    console.log("/admin - post");
    console.log(req.body);
    var ret = true;
    var r = {"result":"error", "status":200};
    switch (req.body.cmd){
        case 'saveHints':
            console.log('Going to save hints');
            ret = await dataStore.saveHints(req.body.hints);
            if (ret)
                res.end('{"result":"ok", "status":200}');
            else
                res.end('{"result":"error", "status":200}');
            break;
        case 'addPin':
            console.log('Going to add pin='+req.body.pin);
            dataStore.addPIN(req.body.pin, function (err){
                ret = (err == null);
                console.log('addPIN result='+ret);
                if (ret)
                    res.end('{"result":"ok", "status":200}');
                else
                    res.end('{"result":"error", "status":200}');
            });
            break;
        case 'removePin':
            console.log('Going to remove pin id='+req.body.pinid);
            dataStore.deletePIN(req.body.pinid, function (err, res){
                ret = (err == null);
                console.log('removePIN deleted='+res.n+" ok="+res.ok);
                if (ret)
                    res.end('{"result":"ok", "status":200}');
                else
                    res.end('{"result":"error", "status":200}');
            });
            break;

        case 'getActivePins':
            console.log('Going to get active PINs');
            dataStore.getActivePINs(function (err, pins){
                ret = (err == null);
                console.log('getActivePINs result='+pins.length);
                if (ret)
                    r = {"result":"ok", "pins":pins, "status":200};
                res.json(r);
                res.end();
            });

            break;
    }

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
