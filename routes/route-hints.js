var express = require('express');
var dataAPI = require('../lib/dataAPI.js');
var assert = require('assert');
var router = express.Router();

router.get('/',function(req, res, next){
    var cookie = req.cookies.Auth13zahrada;
    if (cookie === undefined) {
        console.log("not authenticated - redirecting to index");
        res.redirect('/login');
    } else {
        console.log("already authenticated");
        next();
    }
});

router.get('/', function(req, res, next) {
    console.log("rendering hints");
    res.render('hints', { title: '13. záhrada' });
});

router.post('/', async function(req, res, next) {
    if (!req.body.cmd){
        console.log('Wrong post. Missing CMD.');
        next();
    }

    var r = {result:'error',errorMsg:'Unknown command',status:200};
    var pin="113322";
    switch (req.body.cmd){

        case 'loadTitles':
            console.log('cmd=loadTitles');
            var titles;
            dataAPI.getHintTitles(function (err,titles){
                if (!err){
                    dataAPI.log2db(pin,"titlesLoaded","count="+titles.length);
                    console.log('Titles count='+titles.length);
                    r={result:"ok",titles:titles,status:200};
                }
                res.json(r);
                res.end();
            });
            break;

        case 'loadHint':
            var _level=req.body.level;
            var _id=req.body.id;
            console.log('cmd=loadHint body='+JSON.stringify(req.body));
            dataAPI.getHint(_id,_level,function(err,doc){
                console.log("here");
                if (!err && doc != null){
                    var hintText = (_level == '1'?doc.l1:doc.l2);
                    r = {result:"ok",hint:hintText,status:200};
                    console.log("Loaded hint="+hintText);
                    dataAPI.log2db(pin,"hintLoaded-L"+_level,"Hint L"+_level+" loaded for task #"+_id);
                } else {
                    r = {result:'error', errorMsg:'Error or not found', status:200};
                    console.log("Error="+err);
                }
                res.json(r);
                res.end();
            });
            break;

        default:
            console.log('cmd=unknown');
            res.json(r);
            res.end();
            break;
    }

});

module.exports = router;