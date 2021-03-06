/**
 * Created by Jozef on 13.04.2017.
 */

var express = require('express');
var router = express.Router();
var dataAPI = require('../lib/dataAPI');
var utils =  require('../lib/utils');

router.post('/', async function(req, res, next) {
    console.log("/admin - post");
    console.log(req.body);
    var ret = true;
    var r = {"result":"error", "status":200};
    switch (req.body.cmd){
        case 'createReport':
            console.log('Going to create report');
            utils.createReport(req.body.pin, req.body.pinDate, function(err,r){
                res.json(r);
                res.end();
            });

            break;

        case 'saveHints':
            console.log('Going to save hints');
            ret = await dataAPI.saveHints(req.body.hints);
            if (ret)
                r = {result:"ok", status:200};
            res.json(r);
            res.end();
            break;

        case 'loadHints':
            console.log('Going to loadsave hints');
            utils.loadAllHints(function(h){
                console.log("HINTS="+h);
                r = {result:"ok", status:200, hints:h};
                res.json(r);
                res.end();
            });
            break;

        case 'addPin':
            console.log('Going to add pin='+req.body.pin);
            dataAPI.addPIN(req.body.pin, function (err){
                ret = (err == null);
                console.log('addPIN result='+ret);
                if (ret)
                    r = {result:"ok", status:200};
                res.json(r);
                res.end();
            });
            break;

        case 'removePin':
            console.log('Going to remove pin id='+req.body.pinid);
            dataAPI.deletePIN(req.body.pinid, function (err, res){
                ret = (err == null);
                console.log('removePIN deleted='+res.n+" ok="+res.ok);
                if (ret)
                    r = {"result":"ok", "status":200};
                res.json(r);
                res.end();
            });
            break;

        case 'getActivePins':
            console.log('Going to get active PINs');
            dataAPI.getActivePINs(function (err, pins){
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
    var cookie = req.cookies.Auth13zahradaAdmin;
    if (cookie === undefined) {
        console.log("/admin - not authenticated - redirecting to admin login");
        res.redirect('/adminlogin');
    } else {
        console.log("/admin - already authenticated");
        next();
    }
});

router.get('/', function(req, res, next) {
    console.log("/admin - rendering");
    res.render('admin', { title: '13. záhrada - Admin' });
});

module.exports = router;
