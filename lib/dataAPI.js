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

exports.saveHints = async function(hints){
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
        data.push({_id:''+id, title:lines[i],l1:lines[i+1],l2:lines[i+2]});
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

exports.getHint = function(id,level,callback){
    if (level > 2)
        return;
    console.log('getHint id='+id+" level="+level);
    var q = {_id:id};
    dataStore.db.collection('hints').findOne(q,callback);
};

exports.getHintTitles = function(callback){
    console.log('getHintTitles');
    dataStore.db.collection('hints').find({},{fields:{_id:1, title:1}}).toArray(callback);
};

exports.getActivePINs = function(callback){
    console.log('getActivePINs');
    dataStore.db.collection('pins').find({}).toArray(callback);
};


exports.addPIN = async function(newPin, callback) {
    assert((typeof newPin) === 'string', "New PIN should be string");
    console.log('addPIN newPin='+newPin);
    dataStore.db.collection('pins').insertOne({pin: newPin, createdOn:new Date()}, callback);
};

exports.deletePIN = function(pinId, callback) {
    assert((typeof pinId) === 'string', "Pin ID should be string");
    var id = dataStore.mongo.ObjectID(pinId);
    console.log('deletePIN pinId='+id);
    dataStore.db.collection('pins').deleteOne({_id: id}, callback);
};

exports.checkPIN = async function(enteredPin){
    console.log('checkPin');
    var found = false;
    var hint = await dataStore.db.collection('hints').findOne({pin:enteredPin}, function(err,res){
        "use strict";
        assert.equal(null, err);
        var a = res.toArray(function(err,res){
            found = (res.length > 0);
            console.log('checkPin found='+found);
        });
    });
    return found;

};