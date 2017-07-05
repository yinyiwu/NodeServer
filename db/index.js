var Datastore = require('nedb');
var mysql = require('mysql');
var config = require('../config/database.json');
var mysqlPool = mysql.createPool(config.XMLY5000);
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
    "items": new Datastore({
        filename: 'items.db',
        autoload: true
    })
}
