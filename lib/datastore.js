/**
 * Created by Jozef on 12.04.2017.
 */

var exports = module.exports = {};

const mongoClient = module.exports.client = require('mongodb').MongoClient, assert = require('assert');

// Connection URL
var dbUrl = "mongodb://"+process.env.DB_USER+":"+process.env.DB_PWD+"@"+process.env.DB_SERVER;

mongoClient.connect(dbUrl, function(err, dbconn){
    assert.equal(null, err);
    console.log("Connected successfully to server");
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
            (function(col){
                if (!(itm = items.find(c => c.name === col.name))){
                    console.log('Collection does not exist: '+col.name);

                    con.createCollection(col.name,{capped:col.cap}, function (err, col){
                        col.insertMany(col.docs, function (err,r){
                            if (!err) {
                                console.log('Created '+r.insertedCount+' documents');
                            } else {
                                console.log('FAILED creating collection: '+col.name);

                            }
                        });
                    });
                }
            })(cols[i]);

        }
        console.log('Database initialized');
    });


};






