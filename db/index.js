var Datastore = require('nedb');
////"220.133.135.177",
module.exports = {
	items:new Datastore({ filename: 'items.db', autoload: true })
}