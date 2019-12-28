const mssql = require('mssql');
const db = require('../db');
const spawn = require('cross-spawn');
const moment = require('moment');
const axios = require('axios');

const config = {
	user: 'yangyiwu',
	password: '0911853110',
	server: '127.0.0.1', //You can use 'localhost\\instance' to connect to named instance
	database: 'XMLY5000',
	options: {
		encrypt: true // Use this if you're on Windows Azure
	}
}
let pool = mssql.connect(config);

//PCUST
//SELECT * FROM PCUST WHERE CT_NO not like '%-%'



// function sync(recordset, tablename) {
// 	return new Promise(function(ok,fail){
// 		db[tablename].remove({}, {
// 			multi: true
// 		}, function(derr, numRemoved) {
// 			if (derr) {
// 				console.error(derr);
// 				fail(derr);
// 			} else {
// 				console.log(`remove ${tablename} ${numRemoved}`);
// 				db[tablename].insert(recordset, function(ierr, datas) {
// 					if (ierr) {
// 						console.error(ierr);
// 						fail(ierr);
// 					} else {
// 						console.log(`sync ${tablename} ${recordset.length}`);
// 						ok();
// 					}
// 				});
// 			}
// 		});
// 	});
// }
async function sync(recordset, tablename) {

	let numRemoved = await db[tablename].remove({}, {
			multi: true
		});
	console.log(`remove ${tablename} ${numRemoved}`);

	let r = await db[tablename].insert(recordset);
	console.log(`sync ${tablename} ${recordset.length}`);

	return r;
}

async function PCUST() {
	let con = await pool;
	let {
		recordset
	} = await con.request()
		.query(`SELECT * FROM PCUST WHERE CT_NO not like '%-%'`);
	await sync(recordset, 'pcust');
}



//SSTOCK
// SELECT SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,SK_SUPPNO,
//                                         SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,SK_LPRICE2,SK_IKIND,SK_NOWQTY
//                                          from SSTOCK
//                                         left join SSTOCKKIND b ON (SSTOCK.SK_IKIND = b.SK_KINDID)
//				WHERE 
//                         LEN(SK_BCODE) > 12 
//                         AND SK_NAME not like '%不用%' 
//                         AND SK_NAME not like '%停用%' 
//                         AND SK_NAME not like '%不要用%'
//                         AND SK_NAME not like '%停賣%'
//                         AND SK_NAME not like '%停售%'
//                         AND SK_STOP = 0


async function SSTOCK() {
	let con = await pool;
	let {
		recordset
	} = await con.request()
		.query(`
            	SELECT SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,SK_SUPPNO,
                                        SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,SK_LPRICE2,SK_IKIND,SK_NOWQTY
                                         from SSTOCK
                                        left join SSTOCKKIND b ON (SSTOCK.SK_IKIND = b.SK_KINDID)
				WHERE 
                        LEN(SK_BCODE) > 12 
                        AND SK_NAME not like '%不用%' 
                        AND SK_NAME not like '%停用%' 
                        AND SK_NAME not like '%不要用%'
                        AND SK_NAME not like '%停賣%'
                        AND SK_NAME not like '%停售%'
                        AND SK_STOP = 0`);

	await sync(recordset, 'sstock');

}

//SORDDT
// SELECT st.OD_ID,st.OD_CTNO,st.OD_SKNO,st.OD_PRICE,OD_NO,OD_QTY 
//                                         FROM SORDDT st JOIN (
//                                             SELECT TOP 1000000 MAX(OD_ID) OD_ID FROM SORDDT WHERE OD_NO > '2014-06-01' AND OD_QTY > 0
//                                             GROUP BY OD_CTNO,OD_SKNO ORDER BY OD_ID
//                                         ) stt 
//                                         ON (st.OD_ID = stt.OD_ID)
//                                         ORDER BY st.OD_CTNO,st.OD_SKNO; 

async function SORDDT() {
	let con = await pool;
	let {
		recordset
	} = await con.request().query(`
            	 SELECT st.OD_ID,st.OD_CTNO,st.OD_SKNO,st.OD_PRICE,OD_NO,OD_QTY 
                                        FROM SORDDT st JOIN (
                                            SELECT TOP 1000000 MAX(OD_ID) OD_ID FROM SORDDT WHERE OD_NO > '2014-06-01' AND OD_QTY > 0
                                            GROUP BY OD_CTNO,OD_SKNO ORDER BY OD_ID
                                        ) stt 
                                        ON (st.OD_ID = stt.OD_ID)
                                        ORDER BY st.OD_CTNO,st.OD_SKNO; 
                        `);
	await sync(recordset, 'sorddt');

}

function gitPush(){
	spawn.sync('git', ['status'], { stdio: 'inherit' });
	spawn.sync('git', ['add','.'], { stdio: 'inherit' });
	spawn.sync('git', ['commit','-m', moment().format()], { stdio: 'inherit' });
	spawn.sync('git', ['push'], { stdio: 'inherit' });
}

function gitRemotePull(){
	return axios.get('http://35.227.53.206:8080/DataPull');
}

async function run (){
	await PCUST();
	await SSTOCK();
	await SORDDT();
	console.log('db ok!');
	gitPush();
        console.log('push ok!');
	await gitRemotePull();
        console.log('pull ok!');
	process.exit(0);
}
run();
