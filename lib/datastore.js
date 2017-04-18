/**
 * Created by Jozef on 12.04.2017.
 */

var exports = module.exports = {};

const mongoClient = module.exports.client = require('mongodb').MongoClient, assert = require('assert');

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
        {name:'settings', cap:0,
            docs:[{adminPassword:"adminHeslo"}]
        },
        {name:'log', cap:1,
            docs:[{event:'init'}]
        },
        {name:'reports', cap:0, docs:[]},
        {name:'pins', cap:0,
            docs:[{pin:"PIN01"}]
        },
        {name:'hints', cap:0,
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
            console.log("Collection "+i+"/"+cols.length+" = "+cols[i].name);
            (function(newcol){
                if (!(itm = items.find(c => c.name === newcol.name))){
                    console.log('Collection does not exist: '+newcol.name);

                    con.createCollection(newcol.name,{capped:newcol.cap}, function (err, col){
                        if (!err) {
                            col.insertMany(newcol.docs, function (err, r) {
                                if (!err) {
                                    console.log('Created ' + r.insertedCount + ' documents');
                                } else {
                                    console.log('FAILED creating collection: ' + newcol.name);

                                }
                            });
                        }
                    });
                }
            })(cols[i]);

        }
        console.log('Database initialized');
    });


};






