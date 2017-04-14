/**
 * Created by Jozef on 12.04.2017.
 */

var dataStore = require('./datastore.js');
var assert = require('assert');

var exports = module.exports = {};

exports.log2db = function(pin,eventType,msg){
    dataStore.db.collection('log').insertOne({date:new Date(),pin:pin, event:eventType, message:msg}, function(err, r) {
        assert.equal(null, err);
        assert.equal(1, r.insertedCount)
    });
};

exports.saveHints = function(hints){
    var ret = true;
    // split text into array containing single lines
    var lines = hints.split('\n');
    if (lines.length < 3) {
        console.log("Too few hint lines. At least 3 are needed.");
        return false;
    }

    // create empty array
    var data = [];

    // add records to array
    console.log('Parsing hints');
    var i = 0;
    var id = 0;
    while (i<lines.length){
        // find non-empty line
        while(lines[i] === "" && i<lines.length)i++;
        console.log("Hint found at "+i);
        // kazdy segment musi mat aspon 3 riadky, ak nema tak ignoruj
        if (i+2>lines.length) break;
        data.push({_id:id,title:lines[i],l1:lines[i+1],l2:lines[i+2]});
        id++;
        i+=3;
    }

    var dbs = dataStore.db.collection('hints');

    // remove all hints
    console.log('Removing old hints');
    dbs.deleteMany({});

    // save records to database
    if (data.length > 0){
        console.log("Writing new hints to database");
        dbs.insertMany(data,function(err, r) {
            assert.equal(null, err);
            assert.equal(data.length, r.insertedCount)
        });
    } else {
        ret = false;
        console.log('No hints found in provided text');
    }

    return ret;
};

exports.getHint = async function(id,level){
    if (level > 2)
        return "";
    var hint = await dataStore.db.collection('hints').findOne();
    console.log("Hint found: "+hint);

    var text = '';
    if (hint) {
        text = level == 1?hint.l1:hint.l2;
    } else {
        console.log("No hint found fo id="+id+" level="+level);
    }
    return text;
};

exports.getHintTitles = async function(){
    console.log('getHintTitles');
    //var titles = await dataStore.db.collection('hints').find({},{fields:{title:1, l1:0, l2:0}}).toArray();
    var titles = await dataStore.db.collection('hints').find().toArray();
    console.log('getHintTitles done '+titles.length);
    return titles;
};