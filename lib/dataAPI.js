/**
 * Created by Jozef on 12.04.2017.
 */

var dataStore = require('./datastore.js');
var assert = require('assert');

var exports = module.exports = {};

exports.log2db = function(pin,pinId,eventType,msg){
    dataStore.con.collection('log').insertOne({date:new Date(),pin:pin, pinId:pinId, event:eventType, message:msg}, function(err, r) {
        assert.equal(null, err);
        assert.equal(1, r.insertedCount)
    });
};

exports.logHintLogin = function(usageDate, pin, pinId){
    var doc = {pin:pin, pinId:pinId.toString(), date:usageDate, usedHints:[], sent:0};
    console.log("logHintLogin pin="+pin+" id="+pinId);
    dataStore.con.collection('reports').insertOne(doc, function(err, r) {
        assert.equal(null, err);
        assert.equal(1, r.insertedCount)
    });
};

exports.logHintUsage = function(pinId, taskId, hintLevel){
    var q = {pinId:pinId};
    var u = { $addToSet: { usedHints: "T-"+taskId+" L-"+hintLevel } };
    console.log("logHintUsage id="+pinId+" update="+JSON.stringify(u));
    dataStore.con.collection('reports').findOneAndUpdate(q,u,{returnOriginal:false},function (err,r){
        //console.log(JSON.stringify(r.value));
        assert.equal(null, err);
        assert.equal(1, r.ok);
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

    var dbs = dataStore.con.collection('hints');

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
    dataStore.con.collection('hints').findOne(q,callback);
};

exports.getHintTitles = function(callback){
    console.log('getHintTitles');
    dataStore.con.collection('hints').find({},{fields:{_id:1, title:1}}).toArray(callback);
};

exports.getActivePINs = function(callback){
    console.log('getActivePINs');
    dataStore.con.collection('pins').find({$or:[ {expired:null}, {expired:{$gt:new Date()}}]}).toArray(callback);
};

exports.addPIN = async function(newPin, callback) {
    assert((typeof newPin) === 'string', "New PIN should be string");
    console.log('addPIN newPin='+newPin);
    dataStore.con.collection('pins').insertOne({pin: newPin, createdOn:new Date()}, callback);
};

exports.deletePIN = function(pinId, callback) {
    assert((typeof pinId) === 'string', "Pin ID should be string");
    var id = new dataStore.mongo.ObjectID(pinId);
    console.log('deletePIN pinId='+id);
    dataStore.con.collection('pins').deleteOne({_id: id}, callback);
};

exports.checkPIN = function(enteredPin, callback){
    console.log('checkPin pin='+enteredPin);
    var q = {pin:enteredPin, $or:[ {expired:null}, {expired:{$gt:new Date()}}]}; // find by pin AND (expired == null) or (expired is in the future)
    var pinExpires = new Date();
    pinExpires.setMinutes(pinExpires.getMinutes()+60);
    var u = {$set:{expired:pinExpires}};
    dataStore.con.collection('pins').findOneAndUpdate(q, u, {returnOriginal:false}, callback);
    console.log('checkPin done');
};

exports.getSettings = function(callback){
    console.log('getSettings');
    dataStore.con.collection('settings').findOne({}, callback);
    console.log('getSettings done');
};

exports.getHintUsage = function(pin, pinDate, callback){
    var report = {pin:"error"};
    console.log('getHintUsage pin='+pin+"  pinDate="+pinDate);
    // find out id for PIN/date
    // get "login-ok" records for specified date & PIN
    var startDate = new Date(pinDate);
    var endDate = new Date(pinDate);
    startDate.setHours(0,0,0);
    endDate.setHours(23,59,59,999);

    var q = {};
    q.pin = pin;
    q.date = {$gte:startDate,$lte:endDate};

    dataStore.con.collection('reports').findOne(q,callback);

    console.log('getHintUsage Done');
};

exports.getReportsWaitingForEmail = function(callback){
    console.log('getReportsWaitingForEmail');
    dataStore.con.collection('reports').find({sent:0},{fields:{pin:1, date:1}}).toArray(callback);
    console.log('getReportsWaitingForEmail Done');
};

exports.markSentReport = function(repId, callback){

    var id = new dataStore.mongo.ObjectID(repId);
    var q = {_id:id};
    console.log('markSentReport id='+repId);
    dataStore.con.collection('reports').findOneAndUpdate(q, {$set:{sent:1}}, callback);
    console.log('markSentReport Done');
};

exports.loadAllHints = function(callback){
    console.log('loadAllHints');
    dataStore.con.collection('hints').find({}).sort({title:1}).toArray(callback);
};