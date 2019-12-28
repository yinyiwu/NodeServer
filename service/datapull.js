const spawn = require('cross-spawn');
module.exports = {   
	gitPush: async function(req, res, next) {
		spawn.sync('git', ['status'], { stdio: 'inherit' });
		spawn.sync('git', ['checkout', 'db/store/pcust.db'], { stdio: 'inherit' });
		spawn.sync('git', ['checkout', 'db/store/sorddt.db'], { stdio: 'inherit' });
		spawn.sync('git', ['checkout', 'db/store/sstock.db'], { stdio: 'inherit' });
		spawn.sync('git', ['pull'], { stdio: 'inherit' });
		next();
		spawn('pm2', ['restart', 'all'], { stdio: 'inherit' });
	}
}
