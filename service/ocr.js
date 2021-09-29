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
    const dir = fs.readdirSync(FINISH_DIR).filter(file=>file.endsWith('.xlsx'));
    if(dir.length > 0){
      const lastFile = dir[dir.length-1];
      const wb = await XLSX.readFile(`${FINISH_DIR}/${lastFile}`);
      const files = fs.readdirSync(`${ROOT_DIR}/${lastFile.replace('.xlsx','')}`).filter(file=>file.endsWith('.jpg'));
      console.log(files);
      res.json({
        data:dir.map((file)=>{
          let percent = 100;
          if(file === lastFile){
            let ws = wb.Sheets.order;
            const ref = ws['!ref'].split(':');
            let len = Number(ref[ref.length-1].replace('H',''));
            percent = Math.floor(len*100/files.length);
          }
          return {
            key: file.replace('.xlsx', ''),
            fileName: file,
            percent,
          }
        })
      });
    } else {
      res.json({
        data:[]
      });
    }
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
    res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const stream = Readable.from(buffer);
    stream.pipe(res);
  }
};




