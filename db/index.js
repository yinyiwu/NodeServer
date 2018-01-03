var Datastore = require('nedb-promise');
var mysql = require('mysql');
var config = require('../config/database.json');
var mysqlPool = mysql.createPool(config.XMLY5000);
var storePath = `${__dirname}/store/`;
console.log(storePath);
module.exports = {
    "XMLY5000": {
        "query": function(sql, params) {
            return new Promise(function(resolve, reject) {
                mysqlPool.getConnection(function(err, conn) {
                    if (err) {
                        console.error(err);
                        reject(err);
                        return;
                    }
                    conn.query(sql, params || [], function(e, results, field) {
                        if (e) {
                            console.error(e);
                            reject(e);
                        } else
                            resolve(results);
                    });
                    conn.release();
                });

            });
        }
    },
    p:{

    },
    "items": Datastore({
        filename: `${storePath}items.db`,
        autoload: true
    }),
    "pcust": Datastore({
        filename: `${storePath}pcust.db`,
        autoload: true
    }),
    "sstock": Datastore({
        filename: `${storePath}sstock.db`,
        autoload: true
    }),
    "sorddt": Datastore({
        filename: `${storePath}sorddt.db`,
        autoload: true
    })
}
