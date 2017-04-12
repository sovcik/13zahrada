/**
 * Created by Jozef on 12.04.2017.
 */

const mongoClient = require('mongodb').MongoClient, assert = require('assert');

// Connection URL
var dbUrl = 'mongodb://webapp:API-13zahrada@ds119220.mlab.com:19220/dev';

var exports = module.exports = {};

mongoClient.connect(dbUrl, function(err, dbconn){
    assert.equal(null, err);
    console.log("Connected successfully to server");
    exports.db = dbconn;
    //db.close();
});






