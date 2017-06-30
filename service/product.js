const sql = require('mssql');
const db = require('../db');
const XLSX = require('xlsx');
const _ = require('underscore');
const moment = require('moment');
module.exports = cp => {
    return {
        findByBcode: function(req, res, next) {
            let customerNO = req.get('CustomerNO');

            console.log(req.params.code);
            console.log(customerNO);
            new sql.Request(cp)
                .input('barCode', req.params.code)
                .input('customerNO', customerNO)
                //.query('select a.*,b.SK_KINDNAME from (select * from SSTOCK WHERE SK_BCODE = @barCode ) a join SSTOCKKIND b on(a.SK_IKIND = b.SK_KINDID)')
                .query(
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
								 from SSTOCK WHERE SK_BCODE = @barCode) a 
								left join SSTOCKKIND b ON (a.SK_IKIND = b.SK_KINDID)
								left join (select * from SORDDT WHERE OD_CTNO = @customerNO AND OD_NO > '2014-06-01' AND OD_QTY > 0) sd 
								ON (a.SK_NO = sd.OD_SKNO )
							) t WHERE r = 1 
							group by OD_NO,OD_CTNO,FirstSale,Price,OD_PRICE,
							SK_NO,SK_BCODE,SK_NAME,CAST(SK_SPEC AS varchar(max)),SK_UNIT,
							SK_SUPPNO,SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,
							SK_LPRICE2,SK_IKIND,SK_NOWQTY,SK_KINDNAME
							ORDER BY OD_CTNO`
                )
                .then(result => {
                    console.log(result.recordset);
                    res.send(result.recordset);
                    return Promise.resolve(result);
                }).
            catch(e => {
                console.log(e);
                res.status(500).send(e)
            });
        },
        findByNo: function(req, res, next) {
            let customerNO = req.get('CustomerNO');
            new sql.Request(cp)
                .input('no', req.param('no'))
                .input('customerNO', customerNO)
                //.query('select a.*,b.SK_KINDNAME from (select * from SSTOCK WHERE SK_BCODE = @barCode ) a join SSTOCKKIND b on(a.SK_IKIND = b.SK_KINDID)')
                .query(` select FirstSale,Price,Amount,SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,SK_SUPPNO,SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,SK_LPRICE2,SK_IKIND,SK_NOWQTY,SK_KINDNAME 
						from (         
						   select  
							case when (sd.OD_PRICE is null) then 0 else 1 end FirstSale 
							,case when(sd.OD_PRICE is null) then SK_LPRICE2 else sd.OD_PRICE end as Price
							,case when(sd.OD_QTY is null) then 0 else sd.OD_QTY end as Amount
							,case when (b.SK_KINDNAME IS null) then '' else b.SK_KINDNAME end SK_KINDNAME
							,a.*
							,rank() OVER (PARTITION BY SK_NO ORDER BY sd.OD_DATE1 DESC) r
							from 
								(select * from SSTOCK WHERE SK_NO = @no ) a 
								left join SSTOCKKIND b on(a.SK_IKIND = b.SK_KINDID)
								left join (select * from SORDDT where OD_CTNO = @customerNO ) sd 
								on (a.SK_NO = sd.OD_SKNO and OD_CTNO = @customerNO )
							) t where r = 1`)
                .then(result => {
                    res.send(result.recordset);
                    return Promise.resolve(result);
                }).
            catch(e => res.status(500).send(e));
        },

    }
}
