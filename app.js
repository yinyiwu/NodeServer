var express = require('express');
var timeout = require('connect-timeout');
var sql = require('mssql');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var compression = require('compression');
var favicon = require('serve-favicon');
var path = require('path');

var app = express()
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//require route handlers and use the same connection pool everywhere
var customer = require('./service/customer');
var sync = require('./service/sync');
var product = require('./service/product');
var { gitPush:datapull } = require('./service/datapull');

//generic express stuff
var app = express();

app.use(compression());
app.use(morgan('tiny'));
app.use(timeout(60000));

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

//use service
app.get('/Customer/Order/List', customer.orderList);
app.post('/Customer/Order/Upload', customer.orderUpload);
app.post('/Customer/Order/Create', customer.orderCreate);
app.get('/Customer/Order/Delete/:id', customer.orderDelete);
app.get('/Customer/Order/Update/:id/:amount/:price/:memo?', customer.orderUpdate);

app.get('/Customer/Order/XLSX/:start/:end', customer.orderToExcle);
app.get('/Customer/Order/History/Item/:no', customer.orderHistory);

app.get('/Customer/Daily/Key', customer.orderDaily);

app.get('/Product/Find/:no', product.findByNo);
// app.get('/Product/Find/:no/:CustomerNO', product.findByNo);

app.get('/Product/Find/Barcode/:code', product.findByBcode);
// app.get('/Product/Find/Barcode/:code/:CustomerNO', product.findByBcode);


//app.get('/BarCode/Find/Item', barCodeItem.find);
//app.get('/BarCode/Delete/Item/:id', barCodeItem.delete);
//app.get('/BarCode/Update/Item/:id/:amount', barCodeItem.update);
//app.get('/BarCode/Find/XLSX', barCodeItem.dataToExcle);
//app.get('/Customer/Find/Item', customer.find);
//app.get('/Customer/History/Item/:no', customer.history);


app.get('/Sync/Item', sync.items);
app.get('/Sync/Customer', sync.customer);
app.get('/Sync/Customer/Order/History', sync.customerOrderHistory);
app.get('/Sync/Barcode/:barcode', sync.barcode);
app.get('/Test', sync.test);
app.get('/DataPull', datapull);




//app.post('/BarCode/Create/Item', barCodeItem.create);


//app.get('/BarCode/Create/Mapping/Item/:code', barCodeItem.get);

//view 
app.get('/dist/*', function(req, res) {
    res.sendFile('/dist/bundle.js', { root: __dirname });
});
app.get('/*', function(req, res) {
    res.sendFile('index.html', { root: __dirname });
});


var server = app.listen(8080, function() {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);

});
