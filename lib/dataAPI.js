/**
 * Created by Jozef on 12.04.2017.
 */

var dataStore = require('./datastore.js');
var assert = assert = require('assert');

var exports = module.exports = {};

exports.log2db = function(msg){
    dataStore.db.collection('log').insertOne({date:new Date(),message:msg}, function(err, r) {
        assert.equal(null, err);
        assert.equal(1, r.insertedCount)
    });
};