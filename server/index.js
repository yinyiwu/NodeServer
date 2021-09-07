
const {
  NODE_ENV,
  CONFIG_FLOADER_PATH
} = process.env;
const fs = require('fs');
const path = require('path');
const express = require('express');
const consola = require('consola');
const { Nuxt, Builder } = require('nuxt');
let systemConfig;
try {
  let configPath = path.resolve(`${CONFIG_FLOADER_PATH}/index.js`);

  try {
    systemConfig = require(`${configPath}`);
  } catch (error) {
    systemConfig = require(path.resolve('./config/index.js'));
  }
} catch (e) {
  throw new Error(`Please check config file.`);
}

const app = express();
const host = systemConfig.system.server.host || '127.0.0.1';
const port = systemConfig.system.server.port || 80;

const servicePort = systemConfig.system.proxy.port || 8080;

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js');
// const { express } = require('cookies');
config.dev = !(app.env === 'production');

async function start() {
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config);

  // Build in development
  if (config.dev) {
    const builder = new Builder(nuxt);
    await builder.build();
  }

  app.use((req, res) => {
    const { url } = req;

    // res.status = 200;

    // for ops-server header
    if (url.includes('/service')) {
      req.headers['x-backend'] = 'ocms-ap';
      req.headers['x-backend-port'] = '8087';
    }

    return new Promise((resolve, reject) => {
      res.on('close', resolve);
      res.on('finish', resolve);

      if (req.path == '/loading') {
        res.type = 'html';
        res.body = fs.readFileSync(path.resolve('themes/static/loading.html'), 'utf8');
        resolve();
      } else {
        nuxt.render(req, res, (promise) => {
          // nuxt.render passes a rejected promise into callback on error.
          promise.then(resolve).catch(reject);
        });
      }
    });
  });


  const service = express();
  const timeout = require('connect-timeout');
  const bodyParser = require('body-parser');
  const morgan = require('morgan');
  const compression = require('compression');
  service.use(compression());
  service.use(morgan('tiny'));
  service.use(timeout(60000));

  service.use(bodyParser.urlencoded({
      extended: false
  }));
  service.use(bodyParser.json());



  //use service
  const customer = require('../service/customer');
  const sync = require('../service/sync');
  const product = require('../service/product');
  const { gitPush:datapull } = require('../service/datapull');
  const { UploadImages, GetDailyOCRList, DownloadExcel} = require('../service/ocr');

  service.get('/Customer/Order/List', customer.orderList);
  service.post('/Customer/Order/Upload', customer.orderUpload);
  service.post('/Customer/Order/Create', customer.orderCreate);
  service.get('/Customer/Order/Delete/:id', customer.orderDelete);
  service.get('/Customer/Order/Update/:id/:amount/:price/:memo?', customer.orderUpdate);

  service.get('/Customer/Order/XLSX/:start/:end', customer.orderToExcle);
  service.get('/Customer/Order/History/Item/:no', customer.orderHistory);

  service.get('/Customer/Daily/Key', customer.orderDaily);

  service.get('/Product/Find/:no', product.findByNo);
  // service.get('/Product/Find/:no/:CustomerNO', product.findByNo);

  service.get('/Product/Find/Barcode/:code', product.findByBcode);
  // service.get('/Product/Find/Barcode/:code/:CustomerNO', product.findByBcode);
    service.get('/Sync/Item', sync.items);
    service.get('/Sync/Customer', sync.customer);
    service.get('/Sync/Customer/Order/History', sync.customerOrderHistory);
    service.get('/Sync/Barcode/:barcode', sync.barcode);
    service.get('/Test', sync.test);
    service.get('/DataPull', datapull);




    const multer  = require('multer')
    const upload = multer();
    service.post('/Ocr/Order/UploadImages', upload.array('file', 50), UploadImages);
    service.get('/Ocr/Order/GetDailyOCRList', GetDailyOCRList);
    service.get('/Ocr/Order/DownloadExcel', DownloadExcel);
    service.get('/photosTemp/*', function(req, res) {
      res.sendFile(req.originalUrl, { root: './' });
    });
    service.get('/photosFinish/*', function(req, res) {
      res.sendFile(req.originalUrl, { root: './' });
    });
    service.listen(servicePort);
    consola.ready({
      message: `Service Server listening on ${host}:${servicePort}`,
      badge: true
    });
  // app.listen(port, host)
  app.listen(port);
  consola.ready({
    message: `Server listening on ${host}:${port}`,
    badge: true
  });
}

start();
