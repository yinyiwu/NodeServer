const db = require('../db');
const XLSX = require('xlsx');
const _ = require('underscore');
const moment = require('moment');
module.exports = {
    findByBcode: async function(req, res, next) {
        try {
            let result = await db.XMLY5000.query(
                `SELECT DISTINCT OD_NO,OD_CTNO,FirstSale,Price,OD_PRICE,SUM(Amount) Amount,SK_NO,SK_BCODE,SK_NAME,CAST(SK_SPEC AS varchar(max)) SK_SPEC,SK_UNIT,SK_SUPPNO,SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,SK_LPRICE2,SK_IKIND,SK_NOWQTY,SK_KINDNAME 
						FROM (         
						   SELECT  
							CASE WHEN (sd.OD_PRICE is null) THEN 0 ELSE 1 END FirstSale 
		 					,CASE WHEN(sd.OD_PRICE is null) THEN SK_LPRICE2 ELSE sd.OD_PRICE END Price
		 					,CASE WHEN(sd.OD_QTY is null) THEN 0 ELSE sd.OD_QTY END Amount
		 					,CASE WHEN (b.SK_KINDNAME IS null) THEN '' ELSE b.SK_KINDNAME END SK_KINDNAME
							,a.*
							,OD_NO
							,OD_PRICE
							,OD_CTNO
							,rank() OVER (PARTITION BY SK_NO,OD_CTNO ORDER BY sd.OD_NO DESC) r
							FROM 
								(SELECT SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,SK_SUPPNO,
								SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,SK_LPRICE2,SK_IKIND,SK_NOWQTY
								 from SSTOCK WHERE SK_BCODE = ? ) a 
								left join SSTOCKKIND b ON (a.SK_IKIND = b.SK_KINDID)
								left join (select * from SORDDT WHERE OD_CTNO = ? AND OD_NO > '2014-06-01' AND OD_QTY > 0) sd 
								ON (a.SK_NO = sd.OD_SKNO )
							) t WHERE r = 1 
							group by OD_NO,OD_CTNO,FirstSale,Price,OD_PRICE,
							SK_NO,SK_BCODE,SK_NAME,CAST(SK_SPEC AS varchar(max)),SK_UNIT,
							SK_SUPPNO,SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,
							SK_LPRICE2,SK_IKIND,SK_NOWQTY,SK_KINDNAME
							ORDER BY OD_CTNO`, [req.params.code, req.get('CustomerNO')]);
            if (result.length > 0)
                res.send(result);
            else
                res.send([]);
        } catch (e) {
            res.status(500).send(e);
        }
    },
    findByNo: async function(req, res, next) {
        try {
            let result = await db.XMLY5000.query(` 
            	SELECT FirstSale,Price,Amount,SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,SK_SUPPNO,SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,SK_LPRICE2,SK_IKIND,SK_NOWQTY,SK_KINDNAME 
						FROM (         
						   SELECT  
							CASE WHEN (sd.OD_PRICE is null) then 0 else 1 end FirstSale 
							,CASE WHEN(sd.OD_PRICE is null) then SK_LPRICE2 else sd.OD_PRICE end as Price
							,CASE WHEN(sd.OD_QTY is null) then 0 else sd.OD_QTY end as Amount
							,CASE WHEN (b.SK_KINDNAME IS null) then '' else b.SK_KINDNAME end SK_KINDNAME
							,a.*
							,rank() OVER (PARTITION BY SK_NO ORDER BY sd.OD_DATE1 DESC) r
							FROM 
								(SELECT * FROM SSTOCK WHERE SK_NO = ? ) a 
								LEFT JOIN SSTOCKKIND b ON(a.SK_IKIND = b.SK_KINDID)
								LEFT JOIN (SELECT * FROM SORDDT where OD_CTNO = ? ) sd 
								ON (a.SK_NO = sd.OD_SKNO AND OD_CTNO = ? )
							) t WHERE r = 1`, [req.params.no, req.get('CustomerNO'), req.get('CustomerNO')]);
            if (result.length > 0)
                res.send(result);
            else
                res.send([]);
        } catch (e) {
            res.status(500).send(e);
        }
    },

}
