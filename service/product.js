const db = require('../db');
const XLSX = require('xlsx');
const _ = require('underscore');
const moment = require('moment');
module.exports = {
    findByBcode: async function(req, res, next) {
        try {

            // let result = await db.XMLY5000.query(`
            //  DROP temporary TABLE IF EXISTS sorddt_tmp;
            //            CREATE TEMPORARY TABLE sorddt_tmp (INDEX index_skno (OD_SKNO))        
            //             SELECT st.OD_ID,st.OD_CTNO,st.OD_SKNO,st.OD_PRICE,OD_NO,OD_QTY 
            //                             FROM SORDDT st JOIN (
            //                                 SELECT MAX(OD_ID) OD_ID FROM SORDDT WHERE OD_CTNO = ? AND OD_NO > '2014-06-01' AND OD_QTY > 0
            //                                 GROUP BY OD_CTNO,OD_SKNO ORDER BY OD_ID
            //                             ) stt 
            //                             ON (st.OD_ID = stt.OD_ID)
            //                             ORDER BY st.OD_CTNO,st.OD_SKNO;  
            //     SELECT DISTINCT OD_NO,OD_CTNO,FirstSale,Price,OD_PRICE,SUM(Amount) Amount,SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,SK_SUPPNO,SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,SK_LPRICE2,SK_IKIND,SK_NOWQTY,SK_KINDNAME 
            //             FROM (         
            //                SELECT  
            //              CASE WHEN (sd.OD_PRICE is null) THEN 0 ELSE 1 END FirstSale 
            //              ,CASE WHEN(sd.OD_PRICE is null) THEN SK_LPRICE2 ELSE sd.OD_PRICE END Price
            //              ,CASE WHEN(sd.OD_QTY is null) THEN 0 ELSE sd.OD_QTY END Amount
            //              ,CASE WHEN (b.SK_KINDNAME IS null) THEN '' ELSE b.SK_KINDNAME END SK_KINDNAME
            //              ,a.*
            //              ,OD_NO
            //              ,OD_PRICE
            //              ,OD_CTNO
            //              FROM 
            //                  (SELECT SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,SK_SUPPNO,
            //                  SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,SK_LPRICE2,SK_IKIND,SK_NOWQTY
            //                   from SSTOCK WHERE SK_BCODE = ? ) a 
            //                  left join SSTOCKKIND b ON (a.SK_IKIND = b.SK_KINDID)
            //                  left join sorddt_tmp sd 
            //                  ON (a.SK_NO = sd.OD_SKNO )
            //              ) t
            //              group by OD_NO,OD_CTNO,FirstSale,Price,OD_PRICE,
            //              SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,
            //              SK_SUPPNO,SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,
            //              SK_LPRICE2,SK_IKIND,SK_NOWQTY,SK_KINDNAME
            //              ORDER BY OD_CTNO`, [req.get('CustomerNO'), req.params.code]);
            // if (result[result.length - 1].length > 0)
            //     res.send(result[result.length - 1]);
            // else
            //     res.send([]);
            let cno = req.get('CustomerNO')||req.params.CustomerNO;
            let code = req.get('code')||req.params.code;

        	let sorddt = await db.sorddt.find({
                OD_CTNO:cno
            },{_id:0});

            let sd = _.indexBy(sorddt,'OD_SKNO');

            let sstock = await db.sstock.find({
                SK_BCODE:code
            },{_id:0});
            
            let t = _.reduce(sstock,(ret,item,key)=>{

                let mkey = `${item.OD_NO}-${item.OD_CTNO}-${item.FirstSale}
                -${item.Price}-${item.OD_PRICE}-${item.SK_NO}-
                -${item.SK_BCODE}-${item.SK_NAME}-${item.SK_SPEC}-
                -${item.SK_UNIT}-${item.SK_SUPPNO}-${item.SK_SUPPNAME}-
                -${item.SK_LOCATE}-${item.SK_LPRICE1}-${item.SK_LPRICE2}-
                -${item.SK_IKIND}-${item.SK_NOWQTY}-${item.SK_KINDNAME}-`;

                if(ret[mkey]){
                    ret[mkey]['Amount'] += item.Amount;
                }
                else{
                    ret[mkey] = item;
                }
                //join
                let join = sd[item.SK_NO];
                if(join){
                    ret[mkey]['FirstSale'] = join.OD_PRICE?0:1;
                    ret[mkey]['Price'] = join.OD_PRICE?join.OD_PRICE:join.SK_LPRICE2;
                    ret[mkey]['Amount'] = join.OD_QTY?join.OD_QTY:0;
                    ret[mkey]['SK_KINDNAME'] = item.SK_KINDNAME?item.SK_KINDNAME:'';
                    ret[mkey]['OD_NO'] = join.OD_NO;
                    ret[mkey]['OD_PRICE'] = join.OD_PRICE;
                    ret[mkey]['OD_CTNO'] = join.OD_CTNO;                    
                }
                else{
                    ret[mkey]['FirstSale'] = 0;
                    ret[mkey]['Price'] = item.SK_LPRICE2;
                    ret[mkey]['Amount'] = 0;
                    ret[mkey]['SK_KINDNAME'] = item.SK_KINDNAME?item.SK_KINDNAME:'';
                    ret[mkey]['OD_NO'] = item.OD_NO;
                    ret[mkey]['OD_PRICE'] = item.OD_PRICE;
                    ret[mkey]['OD_CTNO'] = item.OD_CTNO;
                }

                return ret;
            },{});

            let recordset = _.values(t);

            res.send(recordset); 
        } catch (e) {
            console.error(e);
            res.status(500).send(e);
        }
    },
    findByNo: async function(req, res, next) {
        try {
      //       let result = await db.XMLY5000.query(`
      //       	DROP temporary TABLE IF EXISTS sorddt_tmp;
      //                  CREATE TEMPORARY TABLE sorddt_tmp (INDEX index_skno (OD_SKNO))        
      //                   SELECT st.OD_ID,st.OD_CTNO,st.OD_SKNO,st.OD_PRICE,OD_NO,OD_QTY 
      //                                   FROM SORDDT st JOIN (
      //                                       SELECT MAX(OD_ID) OD_ID FROM SORDDT WHERE OD_CTNO = ? AND OD_NO > '2014-06-01' AND OD_QTY > 0
      //                                       GROUP BY OD_CTNO,OD_SKNO ORDER BY OD_ID
      //                                   ) stt 
      //                                   ON (st.OD_ID = stt.OD_ID)
      //                                   ORDER BY st.OD_CTNO,st.OD_SKNO;

      //       	SELECT FirstSale,Price,Amount,SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,SK_SUPPNO,SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,SK_LPRICE2,SK_IKIND,SK_NOWQTY,SK_KINDNAME 
						// FROM (         
						//    SELECT  
						// 	CASE WHEN (sd.OD_PRICE is null) then 0 else 1 end FirstSale 
						// 	,CASE WHEN(sd.OD_PRICE is null) then SK_LPRICE2 else sd.OD_PRICE end as Price
						// 	,CASE WHEN(sd.OD_QTY is null) then 0 else sd.OD_QTY end as Amount
						// 	,CASE WHEN (b.SK_KINDNAME IS null) then '' else b.SK_KINDNAME end SK_KINDNAME
						// 	,a.*
						// 	FROM 
						// 		(SELECT * FROM SSTOCK WHERE SK_NO = ? ) a 
						// 		LEFT JOIN SSTOCKKIND b ON(a.SK_IKIND = b.SK_KINDID)
						// 		LEFT JOIN sorddt_tmp sd
						// 		ON (a.SK_NO = sd.OD_SKNO)
						// 	) t `, [req.get('CustomerNO'), req.params.no]);
      //       if (result[result.length - 1].length > 0)
      //           res.send(result[result.length - 1]);
      //       else
      //           res.send([]);


            let cno = req.get('CustomerNO')||req.params.CustomerNO;
            let no = req.get('no')||req.params.no;

            let sorddt = await db.sorddt.find({
                OD_CTNO:cno
            },{_id:0});

            let sd = _.indexBy(sorddt,'OD_SKNO');

            let sstock = await db.sstock.find({
                SK_NO:no
            },{_id:0});
            if(sstock.length>0){
                let item = sstock[0];
                let join = sd[item.SK_NO];
                if(join){
                    item['FirstSale'] = join.OD_PRICE?0:1;
                    item['Price'] = join.OD_PRICE?join.OD_PRICE:join.SK_LPRICE2;
                    item['Amount'] = join.OD_QTY?join.OD_QTY:0;
                }
                else{
                    item['FirstSale'] = 0;
                    item['Price'] = item.SK_LPRICE2;
                    item['Amount'] = 0;
                }
                item['SK_KINDNAME'] = item.SK_KINDNAME||'';
                res.send([item]); 
            }
            else{
                res.send([]);
            }

            

        } catch (e) {
            res.status(500).send(e);
        }
    },

}
