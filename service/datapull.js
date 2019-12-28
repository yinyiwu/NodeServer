const spawn = require('spawn');
module.exports = {   
	gitPush: async function(req, res, next) {
		spawn.sync('git', ['status'], { stdio: 'inherit' });
		spawn.sync('git', ['pull'], { stdio: 'inherit' });
		next();
		spawn('pm2', ['restart', 'all'], { stdio: 'inherit' });
	}
}
