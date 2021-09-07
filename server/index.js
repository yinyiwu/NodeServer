
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

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js');
// const { express } = require('cookies');
config.dev = !(app.env === 'production');

async function start() {
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config);

  // Build in development
  // if (config.dev) {
  //   const builder = new Builder(nuxt);
  //   await builder.build();
  // }

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

  // app.listen(port, host)
  app.listen(port);
  consola.ready({
    message: `Server listening on ${host}:${port}`,
    badge: true
  });
}

start();
