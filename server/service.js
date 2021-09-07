const {
  CONFIG_FLOADER_PATH
} = process.env;
const express = require('express');

const service = express();
const timeout = require('connect-timeout');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

service.use(compression());
service.use(morgan('tiny'));
service.use(timeout(60000));
const consola = require('consola');
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
const servicePort = systemConfig.system.proxy.port || 8080;


service.use(bodyParser.urlencoded({
  extended: false
}));
service.use(bodyParser.json());



//use service
const customer = require('../service/customer');
const sync = require('../service/sync');
const product = require('../service/product');
const { gitPush: datapull } = require('../service/datapull');
const { UploadImages, GetDailyOCRList, DownloadExcel } = require('../service/ocr');

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




const multer = require('multer')
const upload = multer();
service.post('/Ocr/Order/UploadImages', upload.array('file', 50), UploadImages);
service.get('/Ocr/Order/GetDailyOCRList', GetDailyOCRList);
service.get('/Ocr/Order/DownloadExcel', DownloadExcel);
service.get('/photosTemp/*', function (req, res) {
  res.sendFile(req.originalUrl, { root: './' });
});
service.get('/photosFinish/*', function (req, res) {
  res.sendFile(req.originalUrl, { root: './' });
});
service.listen(servicePort);
consola.ready({
  message: `Service Server listening on ${servicePort}`,
  badge: true
});