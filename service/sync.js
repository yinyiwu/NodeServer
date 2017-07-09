const db = require('../db');
const _ = require('underscore');
const moment = require('moment');
//const JsBarcode = require('jsbarcode');
//const Canvas = require("canvas");
const fs = require("fs");
module.exports = {
    items: async function(req, res, next) {
        try {
            let result = await db.XMLY5000.query(`
                    SELECT SK_NO,SK_NAME,SK_BCODE FROM SSTOCK 
                        /*WHERE 
                        LENGTH(SK_BCODE) > 12 
                        AND SK_NAME not like '%不用%' 
                        AND SK_NAME not like '%停用%' 
                        AND SK_NAME not like '%不要用%'
                        AND SK_NAME not like '%停賣%'
                        AND SK_NAME not like '%停售%'
                        AND SK_STOP = 0*/
                    `);
            res.send(result);
        } catch (e) {
            res.status(500).send(e);
        }
    },
    customer: async function(req, res, next) {
        try {
            let result = await db.XMLY5000.query(`SELECT * FROM PCUST WHERE CT_NO not like '%-%'`);
            res.send(result);
        } catch (e) {
            res.status(500).send(e);
        }

    },
    customerOrderHistory: async function(req, res, next) {
        try {
            let result = await db.XMLY5000.query(`
                       DROP temporary TABLE IF EXISTS sstock_tmp;
                       CREATE TEMPORARY TABLE sstock_tmp (INDEX index_skno (SK_NO))        
                        SELECT SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,SK_SUPPNO,
                                SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,SK_LPRICE2,SK_IKIND,SK_NOWQTY
                                ,CASE WHEN (k.SK_KINDNAME IS null) THEN '' ELSE k.SK_KINDNAME END SK_KINDNAME
                                 FROM SSTOCK s
                                 LEFT JOIN SSTOCKKIND k ON (s.SK_IKIND = k.SK_KINDID);
                                 
                       DROP temporary TABLE IF EXISTS sorddt_tmp;
                       CREATE TEMPORARY TABLE sorddt_tmp (INDEX index_skno (OD_SKNO))        
                        SELECT st.OD_ID,st.OD_CTNO,st.OD_SKNO,st.OD_PRICE,OD_NO,OD_QTY 
                                        FROM SORDDT st JOIN (
                                            SELECT MAX(OD_ID) OD_ID FROM SORDDT WHERE OD_NO > '2014-06-01' AND OD_QTY > 0
                                            GROUP BY OD_CTNO,OD_SKNO ORDER BY OD_ID
                                        ) stt 
                                        ON (st.OD_ID = stt.OD_ID)
                                        ORDER BY st.OD_CTNO,st.OD_SKNO;  
                                        
                       DROP temporary TABLE IF EXISTS sstock_tmp2;
                       CREATE TEMPORARY TABLE sstock_tmp2        
                        SELECT null AS OD_NO,null AS OD_CTNO,0 AS FirstSale,SK_LPRICE2 AS Price,null OD_PRICE ,0 Amount, sstock_tmp.* FROM sstock_tmp;
         
                        SELECT * FROM         
                        (
                            SELECT DISTINCT OD_NO,OD_CTNO,FirstSale,Price,OD_PRICE,SUM(Amount) Amount,
                            SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,SK_SUPPNO,
                            SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,SK_LPRICE2,SK_IKIND,SK_NOWQTY,SK_KINDNAME 
                            FROM (         
                               SELECT  
                                CASE WHEN (sd.OD_PRICE is null) THEN 0 ELSE 1 END FirstSale 
                                ,CASE WHEN(sd.OD_PRICE is null) THEN SK_LPRICE2 ELSE sd.OD_PRICE END Price
                                ,CASE WHEN(sd.OD_QTY is null) THEN 0 ELSE sd.OD_QTY END Amount
                                ,SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,SK_SUPPNO,SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,SK_LPRICE2,SK_IKIND,SK_NOWQTY,SK_KINDNAME 
                                ,OD_PRICE
                                ,OD_NO
                                ,OD_CTNO
                                FROM
                                    sstock_tmp
                                    LEFT JOIN sorddt_tmp sd 
                                    ON (SK_NO = sd.OD_SKNO )
                                ) t1 
                                where OD_NO is not null
                                group by OD_NO,OD_CTNO,FirstSale,Price,OD_PRICE,
                                SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,
                                SK_SUPPNO,SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,
                                SK_LPRICE2,SK_IKIND,SK_NOWQTY,SK_KINDNAME
                            UNION 
                            SELECT * FROM sstock_tmp2
                        ) b        
                        ORDER BY OD_CTNO;
                        `);
            res.send(result[result.length - 1]);
        } catch (e) {
            res.status(500).send(e);
        }
    },
    barcode: function(req, res, next) {

        let barcode = req.param('barcode');

        var canvas = new Canvas();
        JsBarcode(canvas, barcode);
        let now = new Date().getTime();
        let ws = fs.createWriteStream(`${barcode}.png`);
        ws.on('close', function() {
            res.download(`${barcode}.png`);
        });

        let stream = canvas.pngStream();
        stream.on('data', function(chunk) {
            ws.write(chunk);
        });

        stream.on('end', function() {
            ws.end();
        });

    },
    test: function(req, res, next) {
        console.log(res.pipe);
        //var writer = getWritableStreamSomehow();
        //res.pipe(writer);
        //writer.pipe("my test GGGG!");
        res.write("my test !!!!");
        res.write("8888889");
        res.write("999999");
        res.end();

        //req.pipe("my test GGG!").pipe(res);
    }
}
