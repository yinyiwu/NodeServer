const db = require('../db');
const _ = require('underscore');
const moment = require('moment');
//const JsBarcode = require('jsbarcode');
//const Canvas = require("canvas");
const fs = require("fs");
module.exports = {
    items: async function(req, res, next) {
        try {
            let result = await db.XMLY5000.query(`SELECT SK_NO,SK_NAME,SK_BCODE FROM SSTOCK 
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
            let result = await db.XMLY5000.query(`DECLARE @sstock table(  
                            SK_NO nvarchar(30),  
                            SK_BCODE nvarchar(30),  
                            SK_NAME nvarchar(60),  
                            SK_SPEC nvarchar(1000),
                            SK_UNIT nvarchar(8),
                            SK_SUPPNO nvarchar(10),
                            SK_SUPPNAME nvarchar(60),
                            SK_LOCATE nvarchar(60),
                            SK_LPRICE1 float,
                            SK_LPRICE2 float,
                            SK_IKIND nvarchar(10),
                            SK_NOWQTY float,
                            SK_KINDNAME nvarchar(60))  
                        INSERT INTO @sstock
                        SELECT SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,SK_SUPPNO,
                                SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,SK_LPRICE2,SK_IKIND,SK_NOWQTY
                                ,CASE WHEN (k.SK_KINDNAME IS null) THEN '' ELSE k.SK_KINDNAME END SK_KINDNAME
                                 FROM SSTOCK s
                                 LEFT JOIN SSTOCKKIND k ON (s.SK_IKIND = k.SK_KINDID)
                                    WHERE
                                    LEN(SK_BCODE) > 12 
                                        AND SK_NAME not like '%不用%' 
                                        AND SK_NAME not like '%停用%' 
                                        AND SK_NAME not like '%不要用%'
                                        AND SK_NAME not like '%停賣%'
                                        AND SK_NAME not like '%停售%'
                                        AND SK_STOP = 0

                        (SELECT DISTINCT OD_NO,OD_CTNO,FirstSale,Price,OD_PRICE,SUM(Amount) Amount,
                        SK_NO,SK_BCODE,SK_NAME,CAST(SK_SPEC AS varchar(max)) SK_SPEC,SK_UNIT,SK_SUPPNO,
                        SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,SK_LPRICE2,SK_IKIND,SK_NOWQTY,SK_KINDNAME 
                        FROM (         
                           SELECT  
                            CASE WHEN (sd.OD_PRICE is null) THEN 0 ELSE 1 END FirstSale 
                            ,CASE WHEN(sd.OD_PRICE is null) THEN SK_LPRICE2 ELSE sd.OD_PRICE END Price
                            ,CASE WHEN(sd.OD_QTY is null) THEN 0 ELSE sd.OD_QTY END Amount
                            ,a.*
                            ,OD_PRICE
                            ,OD_NO
                            ,OD_CTNO
                            ,rank() OVER (PARTITION BY SK_NO,OD_CTNO ORDER BY sd.OD_NO DESC) r
                            FROM
                                @sstock a
                                LEFT JOIN (select * from SORDDT WHERE OD_NO > '2014-06-01' AND OD_QTY > 0) sd 
                                ON (a.SK_NO = sd.OD_SKNO )
                            ) t WHERE r = 1 
                            group by OD_NO,OD_CTNO,FirstSale,Price,OD_PRICE,
                            SK_NO,SK_BCODE,SK_NAME,CAST(SK_SPEC AS varchar(max)),SK_UNIT,
                            SK_SUPPNO,SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,
                            SK_LPRICE2,SK_IKIND,SK_NOWQTY,SK_KINDNAME
                        UNION
                            SELECT null AS OD_NO,null AS OD_CTNO,0 AS FirstSale,SK_LPRICE2 AS Price,null OD_PRICE ,0 Amount,
                                *
                            FROM @sstock
                        )
                        ORDER BY OD_CTNO`);
            res.send(result);
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
