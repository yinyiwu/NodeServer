const fs = require('fs');
const XLSX = require('xlsx');
const { Readable } = require('stream');
const moment = require('moment');


const ROOT_DIR = `./photosTemp`;
const FINISH_DIR = `./photosFinish`;


module.exports = {
  UploadImages: async function (req, res, next) {
    if (req.files.length > 0) {
      const path = `${ROOT_DIR}/${moment().format('YYYY-MM-DD')}`;
      if(!fs.existsSync(path))
        fs.mkdirSync(path);
      for (const file of req.files) {
        fs.writeFileSync(`${path}/${file.originalname}`, file.buffer, 'binary');
      }
      res.json({msg:'success'});
    } else {
      res.json({msg:'error'});
    }
  },
  GetDailyOCRList: async function(req, res, next){
    const dir = fs.readdirSync(FINISH_DIR);
    res.json({
      data:dir.map((file)=>({
        key: file.replace('.xlsx', ''),
        fileName: file
      }))
    });
  },
  DownloadExcel: async function (req, res, next) {
    const buffer = XLSX.write({
      SheetNames: ['order'],
      Sheets: {
        'order':ws
      }
    },{
      type:'buffer',
      bookType:'xlsx',
    })
    res.setHeader(`Content-disposition', 'attachment; filename=${moment().format('YYYY/MM/DD')}.xlsx`);
    res.setHeader('Content-type', 'doument/xlsx');
    const stream = Readable.from(buffer);
    stream.pipe(res);
  }
};




