const XLSX = require('xlsx');
const _ = require('underscore');
const db = require('../db');
const moment = require('moment');
const fs = require('fs');

module.exports = {
    orderList: function(req, res, next) {
        let no = req.get('CustomerNO');
        db.items.find({
            SK_BCODE: {
                $exists: true
            },
            CreateTime: {
                $gte: moment(0, "HH").toDate(),
                $lte: new Date()
            },
            CustomerNO: no
        }).sort({
            CreateTime: -1
        }).exec(async function(err, data) {
            if (err) {
                res.status(500).send(err);
            } else {
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

                            SELECT DISTINCT OD_NO,OD_CTNO,FirstSale,Price,OD_PRICE,SUM(Amount) Amount,
                                SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,SK_SUPPNO,SK_SUPPNAME,
                                SK_LOCATE,SK_LPRICE1,SK_LPRICE2,SK_IKIND,SK_NOWQTY,SK_KINDNAME 
                                FROM (         
                                   SELECT  
                                    CASE WHEN (sd.OD_PRICE is null) THEN 0 ELSE 1 END FirstSale 
                                    ,CASE WHEN(sd.OD_PRICE is null) THEN SK_LPRICE2 ELSE sd.OD_PRICE END Price
                                    ,CASE WHEN(sd.OD_QTY is null) THEN 0 ELSE sd.OD_QTY END Amount
                                    ,CASE WHEN (b.SK_KINDNAME IS null) THEN '' ELSE b.SK_KINDNAME END SK_KINDNAME
                                    ,a.*
                                    ,OD_PRICE
                                    ,OD_CTNO
                                    ,OD_NO
                                    FROM 
                                        (SELECT SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,SK_SUPPNO,
                                        SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,SK_LPRICE2,SK_IKIND,SK_NOWQTY
                                         from SSTOCK) a 
                                        join sorddt_tmp sd ON (a.SK_NO = sd.OD_SKNO )
                                        left join SSTOCKKIND b ON (a.SK_IKIND = b.SK_KINDID)
                                    ) t
                                    GROUP BY OD_NO,OD_CTNO,FirstSale,Price,OD_PRICE,
                                    SK_NO,SK_BCODE,SK_NAME,SK_SPEC,SK_UNIT,
                                    SK_SUPPNO,SK_SUPPNAME,SK_LOCATE,SK_LPRICE1,
                                    SK_LPRICE2,SK_IKIND,SK_NOWQTY,SK_KINDNAME
                                    ORDER BY OD_NO DESC;
                            `, [no]);

                    let indexData = _.indexBy(data, 'SK_NO');
                    let ret = _.reduce(result[result.length - 1], (sum, value, key) => {
                        let v = indexData[value['SK_NO']];
                        if (v) {
                            value = _.extend(value, v, {
                                ordered: 1
                            });
                            //data = _.without(data,v);
                        } else {
                            sum.push(value);
                        }
                        return sum;
                    }, []);
                    res.send(_.union(data, ret));

                } catch (e) {
                    res.status(500).send(e);
                }
            }
        });
    },
    orderUpload: function(req, res, next) {
        let datas = req.body;
        _.each(datas, data => {
            data.CustomerNO = req.get('CustomerNO');
            data.CreateTime = new Date(data.CreateTime);
        })
        db.items.insert(datas, function(err, datas) {
            if (err) {
                res.send(err);
            } else {
                res.send(datas);
            }
        });
    },
    orderCreate: function(req, res, next) {
        let data = req.body;
        data.CustomerNO = req.get('CustomerNO');
        data.CreateTime = new Date();
        db.items.insert(data, function(err, data) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.send(data);
            }
        });
    },
    orderUpdate: function(req, res, next) {
        let id = req.params.id;
        let amount = req.params.amount;
        let price = req.params.price;
        let memo = req.params.memo;
        db.items.update({
                _id: id
            }, {
                $set: {
                    Amount: amount,
                    Price: price,
                    Memo: memo
                }
            }, {},
            function(err, data) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.send({
                        numUpdated: data
                    });
                }
            });
    },
    orderDelete: function(req, res, next) {
        db.items.remove({
            _id: req.params.id
        }, {}, function(err, numRemoved) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.send({
                    numRemoved: numRemoved
                });
            }
        });
    },
    orderDaily: function(req, res, next) {
        db.items.find({
            SK_BCODE: {
                $exists: true
            }
        }).sort({
            CreateTime: -1
        }).exec(function(err, result) {
            if (err) {
                res.status(500).send(err);
            } else {
                let v = _.reduce(result, (sum, data) => {
                    let key = moment(data.CreateTime).format("YYYY-MM-DD");
                    if (!sum[key]) {
                        //sum[key] = {key:key,start:moment(key).format("YYYY-MM-DD 00:00:00"),end:moment(key).format("YYYY-MM-DD 23:59:59")};
                        sum[key] = {
                            key: key,
                            start: moment(data.CreateTime),
                            end: moment(data.CreateTime),
                            Date: key,
                            Download: '下載'
                        }
                    } else {
                        let dataDate = moment(data.CreateTime);
                        if (dataDate.isBefore(sum[key].start)) {
                            sum[key].start = dataDate;
                        } else if (dataDate.isAfter(sum[key].end)) {
                            sum[key].end = dataDate;
                        }
                    }
                    return sum;
                }, {});
                res.send(_.values(v));
            }
        });
    },
    orderHistory: async function(req, res, next) {
        try {
            let result = await db.XMLY5000.query(`SELECT * from SORDDT WHERE OD_SKNO = ? AND OD_CTNO = ? ORDER BY OD_NO ASC`, [req.params.no, req.get('CustomerNO')]);
            if (result.length > 0)
                res.send(result);
            else
                res.send([]);
        } catch (e) {
            res.status(500).send(e);
        }
    },
    orderToExcle: function(req, res, next) {
        let start = req.params.start;
        let end = req.params.end;
        res.set("fileName", moment(start).format('YYYYMMDD'));
        db.items.find({
                $and: [{
                    CreateTime: {
                        $gte: moment(start).toDate(),
                        $lte: moment(end).toDate()
                    }
                }, {
                    SK_BCODE: {
                        $exists: true
                    }
                }]
            })
            .sort({
                CreateTime: -1
            }).exec(
                function(err, dataSet) {
                    //console.log(dataSet);
                    if (err) {
                        res.status(500).send(err);
                    } else {
                        let groupData = _.groupBy(dataSet, 'Customer');
                        let wb = {
                            SheetNames: [],
                            Sheets: {}
                        };


                        //案名稱不得使用下列字元: 大於或小於符號 (< >)、星號 ( * )、問號 ( ? )、雙引號 ( " )、分隔號或縱線字元 ( | )、冒號 ( : )、正斜線 ( / ) 或括弧 ( [] )。

                        function fixSheetName(name) {
                            name = name.replace(/[\[\]\:\<\>\*\/\|\?\"\\\：]/g, " ");
                            console.log(name);
                            return name.substring(0, 30);
                        }


                        _.each(groupData, (datas, key) => {
                            key = fixSheetName(key);
                            let _data = _.reduce(datas, function(sum, item) {
                                sum.push({
                                    '貨號': item.SK_NO,
                                    '條碼': item.SK_BCODE,
                                    '品名': item.SK_NAME,
                                    '價格': item.Price,
                                    '數量': item.Amount,
                                    '備註': `${item.SK_SPEC} ${item.Memo}`
                                });
                                return sum;
                            }, []);

                            //console.log(_data);

                            let _headers = [];
                            if (_data.length > 0) {
                                _headers = _.keys(_data[0]) || [];
                            }
                            let headers = _headers
                                .map((v, i) => Object.assign({}, {
                                    v: v,
                                    position: String.fromCharCode(65 + i) + 1
                                }))
                                .reduce((prev, next) => Object.assign({}, prev, {
                                    [next.position]: {
                                        v: next.v
                                    }
                                }), {});
                            let data = _data
                                .map((v, i) => _headers.map((k, j) => Object.assign({}, {
                                    v: v[k],
                                    position: String.fromCharCode(65 + j) + (i + 2)
                                })))
                                .reduce((prev, next) => prev.concat(next))
                                .reduce((prev, next) => Object.assign({}, prev, {
                                    [next.position]: {
                                        v: next.v
                                    }
                                }), {});
                            let output = Object.assign({}, headers, data);
                            let outputPos = Object.keys(output);
                            let ref = outputPos[0] + ':' + outputPos[outputPos.length - 1];



                            wb.SheetNames.push(key);
                            wb.Sheets[key] = Object.assign({}, output, {
                                '!ref': ref,
                                '!cols': [{
                                    wch: 8
                                }, {
                                    wch: 20
                                }, {
                                    wch: 30
                                }, {
                                    wch: 5
                                }, {
                                    wch: 5
                                }, {
                                    wch: 60
                                }, {
                                    wch: 30
                                }],
                                /*'!rows': [{
                                    hpt: 10
                                },{
                                    hpt: 20
                                },{
                                    hpt: 30
                                },{
                                    hpt: 40
                                },{
                                    hpt: 50
                                },{
                                    hpt: 60
                                },{
                                    hpt: 70
                                }],*/
                                '!images': [{
                                    /*name: 'text.png',
                                    fs.readFileSync('text.png');
                                    data: pic.toString('base64'),
                                    opts: {
                                        base64: true
                                    },
                                    position: {
                                        type: 'twoCellAnchor',
                                        attrs: {
                                            editAs: 'oneCell'
                                        },
                                        from: {
                                            col: 6,
                                            row: 1
                                        },
                                        to: {
                                            col: 7,
                                            row: 5
                                        }
                                    }*/
                                }]
                            });


                        });
                        let fileName = "./temp/" + new Date().getTime() + '.xlsx';
                        XLSX.writeFile(wb, fileName);
                        res.download(fileName);
                    }
                });
    }
};
