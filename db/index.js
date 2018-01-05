var Datastore = require('nedb-promise');
var mysql = require('mysql');
var config = require('../config/database.json');
var mysqlPool = mysql.createPool(config.XMLY5000);
var storePath = `${__dirname}/store/`;

let items = Datastore({
    filename: `${storePath}items.db`,
    autoload: true
});

items.ensureIndex({
    fieldName: 'CustomerNO'
}, function(err) {
    if (err)
        console.error(err);
});
items.ensureIndex({
    fieldName: 'SK_BCODE'
}, function(err) {
    if (err)
        console.error(err);
});



let pcust = Datastore({
    filename: `${storePath}pcust.db`,
    autoload: true
});

let sstock = Datastore({
    filename: `${storePath}sstock.db`,
    autoload: true
});

sstock.ensureIndex({
    fieldName: 'SK_BCODE'
}, function(err) {
    if (err)
        console.error(err);
});


let sorddt = Datastore({
    filename: `${storePath}sorddt.db`,
    autoload: true
});

sorddt.ensureIndex({
    fieldName: 'OD_CTNO'
}, function(err) {
    if (err)
        console.error(err);
});



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
    p: {

    },
    "items": items,
    "pcust": pcust,
    "sstock": sstock,
    "sorddt": sorddt
}