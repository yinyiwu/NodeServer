const schedule = require('node-schedule');
const fs = require('fs');
const ROOT_DIR = `./photosTemp`;
const FINISH_DIR = `./photosFinish`;
const XLSX = require('xlsx');
const Jimp = require('jimp');
const axios = require('axios');

schedule.scheduleJob('* * * * *', async function(){
  console.log('ocr job running!');
  const ary = fs.readdirSync(ROOT_DIR);
  const dir = ary[ary.length - 1];
  const filePath = `${FINISH_DIR}/${dir}.xlsx`;
  const isFileExists = fs.existsSync(filePath);
  if(isFileExists){
    const wb = await XLSX.readFile(filePath);
    let ws = wb.Sheets.order;
    let j =0;
    let target;
    const keys = [];
    do {
      j++;
      target = ws['H'+j];
      if(target){
        const l = target.v.split('/');
        keys.push(l[l.length-1]);
      }
    } while(target);
    const { files, base64String } = await quickstart(`${ROOT_DIR}/${dir}`, FINISH_DIR, (file)=>!keys.includes(file));
    if(files.length > 0){
      console.log('update', files);
      const result = await visonAPI(base64String);
      const json =  XLSX.utils.sheet_to_json(ws);
      const json_tmp = regexpSplit(result, files.map(file=>file.replace(ROOT_DIR, `http://35.206.254.19/service/${ROOT_DIR}`)));
      json.push(...json_tmp);
      ws = await XLSX.utils.json_to_sheet(json);
      j =0;
      do {
        j++;
        target = ws['D'+j];
        if(target){
          target.l = { Target:target.v, Tooltip:"link to image" };
        }
      } while(target);
      await XLSX.writeFile({
        SheetNames: ['order'],
        Sheets: {
          'order':ws
        }
      }, filePath);
    }
  } else {
    const { files, base64String } = await quickstart(`${ROOT_DIR}/${dir}`, FINISH_DIR);
    console.log('insert', files);
    const result = await visonAPI(base64String);
    const json =  regexpSplit(result, files.map(file=>file.replace(ROOT_DIR, `http://35.206.254.19:8080/${ROOT_DIR.replace('./','')}`)));
    const ws = XLSX.utils.json_to_sheet(json);
    let target;
    let j =0;
    do {
      j++;
      target = ws['H'+j];
      if(target){
        target.l = { Target:target.v, Tooltip:"link to image" };
      }
    } while(target);
    await XLSX.writeFile({
      SheetNames: ['order'],
      Sheets: {
        'order':ws
      }
    }, filePath);
  }
});










async function quickstart(sourcePath, destPath, filterFn = (file, idx) => {
  return true;
}) {
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
        // console.log(path, i, Jimp.intToRGBA(v));
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
        // console.log(path, j, Jimp.intToRGBA(v));
        cutR = j;
        break;
      }
    }

    return { jimp, cutL, cutR };
  }

  const fileFilter = files.filter(filterFn).filter;
  const images = await Promise.all(fileFilter.map(async (path) => {
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

  // await docJimp.write(`${FINISH_DIR}/F.jpg`);
  const v1 = await docJimp.getBase64Async(Jimp.MIME_JPEG);

  return { files:fileFilter.map(file=>`${sourcePath}/${file}`), base64String: v1.replace('data:image/jpeg;base64,', '')};




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
    console.error(e);
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
        '場次': text.replace(/\-/g,''),
        '更改日期':'',
        '托運單號':'',
        '收件人姓名':'',
        '電話':'',
        '更改前件數':1,
        '更改件數':'',
        '原圖':filesPath[i++],
      }
      ary.push(obj);
    } else if (/[(]?(\S|\W)+[);》]?/.test(text) && obj.name === '' && (text.includes('(') || text.includes(')'))) {
      obj['收件人姓名'] = text.replace(";", ")").replace("》", ")");
    } else if (/^([0]{1})(\d){8}(\d{1})$/.test(text) || /^(\d){7,8}(\d{1})$/.test(text) && obj.phone === '') {
      obj['電話'] = text;
    }
  }

  return ary;
}