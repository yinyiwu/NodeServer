const fs = require('fs');
const axios = require('axios');
const Jimp = require('jimp');
const XLSX = require('xlsx');
const { Readable } = require('stream');
const { webworker } = require('webpack');


const ROOT_DIR = `./photosTemp`;
const FINISH_DIR = `./photosFinsh`;


module.exports = {
  UploadImages: async function (req, res, next) {
    if (req.files.length > 0) {
      const path = `${ROOT_DIR}/${Date.now()}`;
      fs.mkdirSync(path);
      for (const file of req.files) {
        fs.writeFileSync(`${path}/${file.originalname}`, file.buffer, 'binary');
      }
      res.json({});
    }
  },
  DownloadExcel: async function (req, res, next) {
    const ary = fs.readdirSync(ROOT_DIR);
    const dir = ary[ary.length - 1];
    const { files, base64String } = await quickstart(`${ROOT_DIR}/${dir}`, FINISH_DIR);
    const result = await visonAPI(base64String);
    const json =  regexpSplit(result, files.map(file=>file.replace(ROOT_DIR, `http://${req.headers.host}/${ROOT_DIR}`)));
    var ws = await XLSX.utils.json_to_sheet(json);


    // const wb = await XLSX.readFile('/Users/yinyiwu/git/yangyi/NodeServer/photosFinsh/test.xlsx');
    // console.log(wb.Sheets.order);

    let target;
    let j =0;
    do {
      j++;
      target = ws['D'+j];
      if(target){
        console.log(target);
        target.l = { Target:target.v, Tooltip:"link to image" };
        console.log(target);
      }
    } while(target);


    // console.log(ws);

    // return;
    // XLSX.utils.sheet_to_json();

    // var ws = XLSX.utils.json_to_sheet([
    //   {
    //     code:'725-091-0973',
    //     name:'a',
    //     phone:'0936491277',
    //     html:''
    //   },
    //   {
    //     code:'725-091-0973',
    //     name:'黃琪兒(黃琪兒)',
    //     phone:'0936491277',
    //     html:'2'
    //   },
    //   {
    //     code:'725-091-0973',
    //     name:'b',
    //     phone:'0936491277',
    //     html:'3'
    //   }
    // ]);


    // delete ws['D1'].v;
    // ws['D2'].h ='<html><Font Style=\"FONT-WEIGHT: bold;FONT-STYLE: italic;TEXT-DECORATION: underline;FONT-FAMILY: Arial;FONT-SIZE: 11pt;COLOR: #ff0000;\">This is simple HTML formatted text.</Font></html>';
    // ws['D2'].r ='<html><Font Style=\"FONT-WEIGHT: bold;FONT-STYLE: italic;TEXT-DECORATION: underline;FONT-FAMILY: Arial;FONT-SIZE: 11pt;COLOR: #ff0000;\">This is simple HTML formatted text.</Font></html>';

    // console.log(ws);

    const buffer = XLSX.write({
      SheetNames: ['order'],
      Sheets: {
        'order':ws
      }
    },{
      type:'buffer',
      bookType:'xlsx',
    })
    res.setHeader('Content-disposition', 'attachment; filename=test.xlsx');
    res.setHeader('Content-type', 'doument/xlsx');
    const stream = Readable.from(buffer);
    stream.pipe(res);
  }
};




async function quickstart(sourcePath, destPath) {
  // // Imports the Google Cloud client library
  // const vision = require('@google-cloud/vision');

  // // Creates a client
  // const client = new vision.ImageAnnotatorClient({
  //   keyFilename:'./yangyi/pure-environs-322906-4a15627c2614.json'
  // });

  // // Performs label detection on the image file
  // const [result] = await client.labelDetection('./yangyi/2021820_210820_142.jpg');
  // const labels = result.labelAnnotations;
  // console.log('Labels:');
  // labels.forEach(label => console.log(label.description));



  let files = fs.readdirSync(sourcePath);



  async function cutX(path) {
    const jimp = await Jimp.read(`${sourcePath}/${path}`);
    let cutL = 0;
    for (let i = 0; i < jimp.getWidth(); i++) {
      const v = await jimp.getPixelColor(i, jimp.getHeight() / 1.5);
      const { r, g, b } = Jimp.intToRGBA(v);
      // console.log(path, i, Jimp.intToRGBA(v));
      if (r < 105 && g < 105 && b < 105) {
        console.log(path, i, Jimp.intToRGBA(v));
        cutL = i;
        break;
      }
    }

    let cutR = 0;
    for (let j = jimp.getWidth() - 1; j > 0; j--) {
      // console.log(j);
      const v = await jimp.getPixelColor(j, jimp.getHeight() / 1.5);
      const { r, g, b } = Jimp.intToRGBA(v);
      // console.log(path, j, Jimp.intToRGBA(v));
      if (r < 95 && g < 95 && b < 95) {
        console.log(path, j, Jimp.intToRGBA(v));
        cutR = j;
        break;
      }
    }

    return { jimp, cutL, cutR };
  }

  const images = await Promise.all(files.filter((file, idx) => {
    return true;
    // return idx < 20
    // return idx >= 20 && idx < 40
    // return file === '2021820_210820_123.jpg';
  }).map(async (path) => {
    // const bitmap = fs.readFileSync(`./yangyi/${path}`);
    // const jimp = await Jimp.read(`./yangyi/${path}`);
    // let cut = 0;
    // for(let i=0;i<jimp.getWidth()-500;i++){
    //   const v = await jimp.getPixelColor(i, jimp.getHeight()/2);
    //   const { r,g,b} = Jimp.intToRGBA(v);
    //   if(r < 170 && g<170 && b< 170){
    //     console.log(i, Jimp.intToRGBA(v));
    //     cut = i;
    //     break;
    //   }
    // }
    // await jimp.crop(cut, 0, jimp.getWidth()-cut, jimp.getHeight());
    // await jimp.write(`./yangyi_tmp/${path.replace('.jpg', 'X.jpg')}`);


    // const jimp = await Jimp.read(`./yangyi/${path}`);

    //去邊距
    const { jimp, cutL: cX, cutR } = await cutX(path);
    await jimp.crop(cX, 0, cutR, jimp.getHeight() / 1.9);

    await jimp.crop(0, jimp.getHeight() / 2, jimp.getWidth(), jimp.getHeight() / 2);
    await jimp.crop(0, jimp.getHeight() / 3, jimp.getWidth() / 1.4, jimp.getHeight() / 3 * 2 - 1);

    const jimp2 = await Jimp.read(`${sourcePath}/${path}`);
    await jimp2.crop(cX, jimp2.getHeight() / 1.9, (jimp2.getWidth()), jimp2.getHeight() / 4.5);

    const W = jimp.getWidth();
    const H = jimp.getHeight() + jimp2.getHeight();

    const spaceJimp = new Jimp(80, H, '#FFFFFF');


    const jimpCombo = new Jimp(W, H, '#FFFFFF');
    await jimpCombo.blit(jimp, 0, 0);
    await jimpCombo.blit(jimp2, 0, jimp.getHeight());
    await jimpCombo.blit(spaceJimp, 0, 0);


    await jimpCombo.color([
      { apply: 'xor', params: ['#F0F0F0'] },
      // { 'apply':'lighten', params: [-20]},
      // { 'apply':'tint', params: [40]
    ]);
    await jimpCombo.scale(0.6);

    // await jimpCombo.write(`${destPath}/${path.replace('.jpg', 'F.jpg')}`);
    return jimpCombo;
  }));


  const { height, width } = images.reduce((sum, jimp) => {
    sum.height += jimp.getHeight();
    sum.width = jimp.getWidth() > sum.width ? jimp.getWidth() : sum.width;
    return sum;
  }, { height: 0, width: 0 });


  // console.log(width, height);
  const docJimp = new Jimp(width, height, '#000000');
  let h = 0;
  for (const jimp of images) {
    // console.log(h);
    await docJimp.blit(jimp, 0, h);
    h += jimp.getHeight();
    // await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then((f)=>docJimp.print(f, 0, h, '--Split--'));
    // h+=40;
  }
  // await docJimp.greyscale();
  // docJimp.color([
  //   // { 'apply': 'brighten', params:[10] },
  //   // { 'apply': 'darken', params: [20] },
  //   // { 'apply': 'greyscale', params: [] }
  // ]);

  await docJimp.write(`${FINISH_DIR}/F.jpg`);
  const v1 = await docJimp.getBase64Async(Jimp.MIME_JPEG);

  return { files:files.map(file=>`${sourcePath}/${file}`), base64String: v1.replace('data:image/jpeg;base64,', '')};




  // const requests = files.filter((file,idx)=>{
  //   return idx > 151;
  // }).map((path)=>{
  //   const bitmap = fs.readFileSync(`./yangyi/${path}`);
  //   return {
  //     features: [{ type: "TEXT_DETECTION" }],
  //     imageContext: {
  //       languageHints: ['zh-Hant']
  //     },
  //     image: {
  //       content: Buffer.from(bitmap).toString('base64')
  //     }
  //   }
  // });

  // console.log(requests);
  // return ;


}
// quickstart();

// regexpSplit(require('./vision.json'));

async function visonAPI(content) {
  const requests = [{
    features: [{
      type: "TEXT_DETECTION"
    }],
    imageContext: {
      languageHints: ['zh-Hant']
    },
    image: {
      content
    }
  }];

  try {
    let result = await axios({
      url: 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBkVT8VKk9PtnvDarPH-AOFD2IFbMTcqUI',
      method: 'post',
      data: {
        requests
      }
    });
    return result.data.responses[0];
    // console.log(result.data.responses[0]);
  } catch (e) {
    console.error(e.response.data);
    throw e;
  }
}

function regexpSplit(json, filesPath) {
  // const { textAnnotations } = require('./vision.json');
  const { textAnnotations } = json;
  const description = textAnnotations[0].description.split('\n');



  let obj = {};
  let ary = [];
  let i = 0;
  for (const text of description) {
    if (/\d{3}-\d{3}-\d{4}/.test(text)) {
      obj = {
        code: text,
        name: '',
        phone: '',
        imageUrl: filesPath[i++]
      }
      ary.push(obj);
    } else if (/[(]?(\S|\W)+[);》]?/.test(text) && obj.name === '' && (text.includes('(') || text.includes(')'))) {
      obj.name = text.replace(";", ")").replace("》", ")");
    } else if (/^([0]{1})(\d){8}(\d{1})$/.test(text) || /^(\d){7,8}(\d{1})$/.test(text) && obj.phone === '') {
      obj.phone = text;
    }
  }

  return ary;
}


