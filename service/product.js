const db = require('../db');
const XLSX = require('xlsx');
const _ = require('underscore');
const moment = require('moment');
module.exports = {
    findByBcode: async function(req, res, next) {
        try {
            let result = await db.XMLY5000.query(`

            	DROP temporary TABLE IF EXISTS sorddt_tmp;
                       CREATE TEMPORARY TABLE sorddt_tmp (INDEX index_skno (OD_SKNO))        
                        SELECT st.OD_ID,st.OD_CTNO,st.OD_SKNO,st.OD_PRICE,OD_NO,OD_QTY 
                                        FROM SORDDT st JOIN (
                                            SELECT MAX(OD_ID) OD_ID FROM SORDDT WHERE OD_CTNO = ? AND OD_NO > '2014-06-01' AND OD_QTY > 0
                                            GROUP BY OD_CTNO,OD_SKNO ORDER BY OD_ID
                                        ) stt 
                                        ON (st.OD_ID = stt.OD_ID)
                                        ORDER BY st.OD_CTNO,st.OD_SKNO;  


                SELECT DISTINCT OD_NO,OD_CTNO,FirstSale,Price,OD_PRICE,SUM(Amount) Amount,SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,SK_SUPPNO,SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,SK_LPRICE2,SK_IKIND,SK_NOWQTY,SK_KINDNAME 
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
							FROM 
								(SELECT SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,SK_SUPPNO,
								SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,SK_LPRICE2,SK_IKIND,SK_NOWQTY
								 from SSTOCK WHERE SK_BCODE = ? ) a 
								left join SSTOCKKIND b ON (a.SK_IKIND = b.SK_KINDID)
								left join sorddt_tmp sd 
								ON (a.SK_NO = sd.OD_SKNO )
							) t
							group by OD_NO,OD_CTNO,FirstSale,Price,OD_PRICE,
							SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,
							SK_SUPPNO,SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,
							SK_LPRICE2,SK_IKIND,SK_NOWQTY,SK_KINDNAME
							ORDER BY OD_CTNO`, [req.get('CustomerNO'), req.params.code]);
            if (result[result.length - 1].length > 0)
                res.send(result[result.length - 1]);
            else
                res.send([]);
        } catch (e) {
            res.status(500).send(e);
        }
    },
    findByNo: async function(req, res, next) {
        try {
            let result = await db.XMLY5000.query(`
            	DROP temporary TABLE IF EXISTS sorddt_tmp;
                       CREATE TEMPORARY TABLE sorddt_tmp (INDEX index_skno (OD_SKNO))        
                        SELECT st.OD_ID,st.OD_CTNO,st.OD_SKNO,st.OD_PRICE,OD_NO,OD_QTY 
                                        FROM SORDDT st JOIN (
                                            SELECT MAX(OD_ID) OD_ID FROM SORDDT WHERE OD_CTNO = ? AND OD_NO > '2014-06-01' AND OD_QTY > 0
                                            GROUP BY OD_CTNO,OD_SKNO ORDER BY OD_ID
                                        ) stt 
                                        ON (st.OD_ID = stt.OD_ID)
                                        ORDER BY st.OD_CTNO,st.OD_SKNO;

            	SELECT FirstSale,Price,Amount,SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,SK_SUPPNO,SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,SK_LPRICE2,SK_IKIND,SK_NOWQTY,SK_KINDNAME 
						FROM (         
						   SELECT  
							CASE WHEN (sd.OD_PRICE is null) then 0 else 1 end FirstSale 
							,CASE WHEN(sd.OD_PRICE is null) then SK_LPRICE2 else sd.OD_PRICE end as Price
							,CASE WHEN(sd.OD_QTY is null) then 0 else sd.OD_QTY end as Amount
							,CASE WHEN (b.SK_KINDNAME IS null) then '' else b.SK_KINDNAME end SK_KINDNAME
							,a.*
							FROM 
								(SELECT * FROM SSTOCK WHERE SK_NO = ? ) a 
								LEFT JOIN SSTOCKKIND b ON(a.SK_IKIND = b.SK_KINDID)
								LEFT JOIN sorddt_tmp sd
								ON (a.SK_NO = sd.OD_SKNO)
							) t `, [req.get('CustomerNO'), req.params.no]);
            if (result[result.length - 1].length > 0)
                res.send(result[result.length - 1]);
            else
                res.send([]);
        } catch (e) {
            res.status(500).send(e);
        }
    },

}
