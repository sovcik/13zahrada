/**
 * Created by Jozef on 12.04.2017.
 */

var exports = module.exports = {};

const mongo = module.exports.mongo = require('mongodb');
const mongoClient = module.exports.client = mongo.MongoClient, assert = require('assert');

// Connection URL
var dbUrl = "mongodb://"+process.env.DB_USER+":"+process.env.DB_PWD+"@"+process.env.DB_SERVER+"/"+process.env.DB_DATABASE;

console.log("Connecting to mongodb://DBUSER:DBPWD@"+process.env.DB_SERVER+"/"+process.env.DB_DATABASE);
mongoClient.connect(dbUrl, function(err, dbconn){
    if (err){
        console.log("Connection FAILED. Make sure DATABASE credentials and details are entered correctly.");
        assert.equal(null, err);
    }

    console.log("Connected successfully to database server");
    exports.con = dbconn;

    initDatabase(dbconn);

});

function initDatabase(con){
    console.log('initDatabase');

    var itm;
    var cols=[
        {name:'settings', options:{},
            docs:[{adminPassword:"adminHeslo"}]
        },
        {name:'log', options:{capped:true, size:1000000},
            docs:[{event:'init'}]
        },
        {name:'reports', options:{capped:false, max:500},
            docs:[
                {
                    "pin": "X01",
                    "pinId": "111111111111111111111111",
                    "date": new Date(),
                    "usedHints": [
                        "T-0 L-1",
                        "T-1 L-1"]
                },{
                    "pin": "X02",
                    "pinId": "222222222222222222222222",
                    "date": new Date(),
                    "usedHints": [
                        "T-0 L-1",
                        "T-1 L-1",
                        "T-0 L-2"]
                },{
                    "pin": "X03",
                    "pinId": "333333333333333333333333",
                    "date": new Date(),
                    "usedHints": [
                        "T-0 L-1",
                        "T-1 L-1",
                        "T-0 L-2",
                        "T-1 L-2"],
                    "sent":1
                }
                ]
        },
        {name:'pins', options:{capped:true, max:500},
            docs:[{pin:"PIN01"},{pin:"PIN02"}]
        },
        {name:'hints', options:{},
            docs:[
                {_id:"0",title:"Úloha 1",
                    l1:"Zatiaľ text. Ak potrebuješ vidieť aj obrázok, tak ťukni sem",
                    l2:"A tu je obrázok https://sites.google.com/site/escape13zahrada/img/demo-garden.jpg?attredirects=0"
                },
                {_id:"1",title:"Úloha 2",
                    l1:"A ďalšia nápoveda. Tento text by mal stačiť",
                    l2:""
                },
                {_id:"2",title:"Úloha 3",
                    l1:"A posledná nápoveda. Ťukni sem pre kompletné riešenie",
                    l2:"Toto je kompletné riešenie úlohy 2"
                }
            ]}
    ];

    console.log("Retrieving list of existing collections");
    con.listCollections().toArray(function(err, items){

        console.log("Updating database");
        for (var i=0;i<cols.length;i++){
            (function(newcol){
                console.log("Collection "+(i+1)+"/"+cols.length+" = "+cols[i].name);
                if (!(itm = items.find(c => c.name === newcol.name))){
                    console.log('Collection does not exist: '+newcol.name);

                    con.createCollection(newcol.name, newcol.options, function (err, col){
                        if (!err) {
                            console.log("Created collection "+newcol.name+" options="+newcol.options);
                            col.insertMany(newcol.docs, function (err, r) {
                                if (!err) {
                                    console.log('Created ' + r.insertedCount + ' documents in '+newcol.name);
                                } else {
                                    console.log('FAILED creating documents in ' + newcol.name+ " error="+err);

                                }
                            });
                        } else {
                            console.log('FAILED creating collection: ' + newcol.name+ " error="+err);
                        }
                    });
                }
            })(cols[i]);

        }
        console.log('Database initialized');
    });


};






