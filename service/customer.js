const XLSX = require('xlsx');
const _ = require('lodash');
const db = require('../db');
const moment = require('moment');
const fs = require('fs');
const { Readable } = require('stream');


module.exports = {
    orderList: async function(req, res, next) {
        try {
            let cno = req.get('CustomerNO') || req.params.CustomerNO;
            let data = await db.items.cfind({
                SK_BCODE: {
                    $exists: true
                },
                CreateTime: {
                    $gte: moment(0, "HH").toDate(),
                    $lte: new Date()
                },
                CustomerNO: cno
            }).sort({
                CreateTime: -1
            }).exec();

            _.each(data, function(d) {
                if (!d.Price) {
                    d.Price = 0;
                }
            });

            let sorddt = await db.sorddt.find({
                OD_CTNO: cno
            });

            let sd = _.keyBy(sorddt, 'OD_SKNO');

            let sstock = await db.sstock.find({}, {
                _id: 0
            });

            let t = _.reduce(sstock, (ret, item, key) => {

                let mkey = `${item.OD_NO}-${item.OD_CTNO}-${item.FirstSale}
                        -${item.Price}-${item.OD_PRICE}-${item.SK_NO}-
                        -${item.SK_BCODE}-${item.SK_NAME}-${item.SK_SPEC}-
                        -${item.SK_UNIT}-${item.SK_SUPPNO}-${item.SK_SUPPNAME}-
                        -${item.SK_LOCATE}-${item.SK_LPRICE1}-${item.SK_LPRICE2}-
                        -${item.SK_IKIND}-${item.SK_NOWQTY}-${item.SK_KINDNAME}-`;

                //join
                let join = sd[item.SK_NO];
                if (join) {

                    if (ret[mkey]) {
                        ret[mkey]['Amount'] += item.Amount;
                    } else {
                        ret[mkey] = item;
                    }

                    ret[mkey]['FirstSale'] = join.OD_PRICE != undefined ? 0 : 1;
                    ret[mkey]['Price'] = join.OD_PRICE != undefined ? join.OD_PRICE : join.SK_LPRICE2;
                    ret[mkey]['Amount'] = join.OD_QTY ? join.OD_QTY : 0;
                    ret[mkey]['SK_KINDNAME'] = item.SK_KINDNAME ? item.SK_KINDNAME : '';
                    ret[mkey]['OD_NO'] = join.OD_NO;
                    ret[mkey]['OD_PRICE'] = join.OD_PRICE;
                    ret[mkey]['OD_CTNO'] = join.OD_CTNO;
                }
                // else {
                //     delete ret[mkey];
                //     // ret[mkey]['FirstSale'] = 0;
                //     // ret[mkey]['Price'] = item.SK_LPRICE2;
                //     // ret[mkey]['Amount'] = 0;
                //     // ret[mkey]['SK_KINDNAME'] = item.SK_KINDNAME ? item.SK_KINDNAME : '';
                //     // ret[mkey]['OD_NO'] = null;
                //     // ret[mkey]['OD_PRICE'] = null;
                //     // ret[mkey]['OD_CTNO'] = null;
                // }

                return ret;
            }, {});

            let result = _.values(t);

            let indexData = _.keyBy(data, 'SK_NO');

            let ret = _.reduce(result, (sum, value, key) => {
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
            console.error(e);
            res.status(500).send(e);
        }

    },
    orderUpload: function(req, res, next) {
        let datas = req.body;
        _.each(datas, data => {
            data.CustomerNO = req.get('CustomerNO');
            data.CreateTime = new Date(data.CreateTime);
        })

        console.info(datas);

        db.items.insert(datas, function(err, datas) {
            if (err) {
                res.send(err);
            } else {
                res.send(datas);
            }
        });
    },
    orderCreate: async function(req, res, next) {
        let data = req.body;
        data.CustomerNO = req.get('CustomerNO');
        data.CreateTime = new Date();
        console.info(data);
        try {
            let record = await db.items.insert(data);
            res.send(record);
        } catch (e) {
            res.status(500).send(e);
        }
    },
    orderUpdate: async function(req, res, next) {
        let id = req.params.id;
        let amount = req.params.amount;
        let price = req.params.price;
        let memo = req.params.memo;
        console.log({
                    id:id,
                    Amount: amount,
                    Price: price,
                    Memo: memo
                });
        try {
            let numUpdated = await db.items.update({
                _id: id
            }, {
                $set: {
                    Amount: amount,
                    Price: price,
                    Memo: memo
                }
            }, {});
            res.send({
                numUpdated: numUpdated
            });
        } catch (e) {
            res.status(500).send(e);
        }
    },
    orderDelete: async function(req, res, next) {
        try {
            let numRemoved = await db.items.remove({
                _id: req.params.id
            }, {});
            res.send({
                numRemoved: numRemoved
            });
        } catch (e) {
            res.status(500).send(e);
        }
    },
    orderDaily: async function(req, res, next) {
        try {
            let result = await db.items.cfind({
                SK_BCODE: {
                    $exists: true
                }
            }).sort({
                CreateTime: -1
            }).exec();
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
        } catch (e) {
            console.error(e);
            res.status(500).send(e);
        }
    },
    orderHistory: async function(req, res, next) {
        try {
            let skno = req.params.no;
            let cno = req.get('CustomerNO') || req.params.CustomerNO || '04099';
            let result = await db.sorddt.cfind({
                OD_SKNO: skno,
                OD_CTNO: cno
            }).
            sort({
                OD_NO: 1
            }).
            exec();

            //資料來源問題暫時自己產生1個月當間距
            let date = moment().subtract(result.length, 'months');

            _.each(result, function(item, index) {
                date = date.add(index, 'months');
                item['OD_DATE1'] = date.toDate();
            })
            res.send(result);
        } catch (e) {
            res.status(500).send(e);
        }
    },
    orderToExcle: async function(req, res, next) {
        let start = req.params.start;
        let end = req.params.end;
        try {
            let dataSet = await db.items.cfind({
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
                }).exec();

            let groupData = _.groupBy(dataSet, 'CustomerNO');
            let wb = {
                SheetNames: [],
                Sheets: {}
            };

            let customers = await db.pcust.find({});
            let customersIdx = _.keyBy(customers, 'CT_NO');

            function fixSheetName(code) {
                let customer = customersIdx[code];
                if (customer) {
                    //案名稱不得使用下列字元: 大於或小於符號 (< >)、星號 ( * )、問號 ( ? )、雙引號 ( " )、分隔號或縱線字元 ( | )、冒號 ( : )、正斜線 ( / ) 或括弧 ( [] )。
                    let name = customer.CT_NAME.replace(/[\[\]\:\<\>\*\/\|\?\"\\\：]/g, " ");
                    console.log(name);
                    return `${code} ${name.substring(0, 30)}`;
                }
                return code;
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
       XLSX.writeFile(wb, fileName);                     from: {
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
            console.log(wb.Sheets);
            const buffer = XLSX.write(wb,{
                type:'buffer',
                bookType:'xlsx',
              })
            res.setHeader('Content-disposition', `attachment; filename=${moment(start).format('YYYYMMDD')}.xlsx`);
            res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            const stream = Readable.from(buffer);
            stream.pipe(res);
        } catch (e) {
            res.status(500).send(e);
        }
    }
};