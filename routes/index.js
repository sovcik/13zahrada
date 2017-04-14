var express = require('express');
var dataAPI = require('../lib/dataAPI.js');
var assert = require('assert');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: '13. záhrada' });
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
            var titles = await dataAPI.getHintTitles();
            console.log('Titles length='+titles.length);
            r = {result:"ok",titles:titles,status:200};
            dataAPI.log2db(pin,"titlesLoaded","");
            break;
        case 'loadHint':
            console.log('cmd=loadHint');
            var text = await dataAPI.getHint(req.body.id,req.body.level);
            r = {result:"ok",hint:text,status:200};
            dataAPI.log2db(pin,"hintLoaded-L"+req.body.level,"Hint L"+req.body.level+" loaded for task #"+req.body.id);
            break;

        default:
            console.log('cmd=unknown');
            break;
    }

    console.log("result "+JSON.stringify(r));

    res.json(r);
    //res.end({result:'error',errorMsg:'something happened',status:200});

});




module.exports = router;
