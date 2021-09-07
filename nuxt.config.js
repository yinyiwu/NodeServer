const {
  NODE_ENV,
  CONFIG_FLOADER_PATH
} = process.env;
const isDev = NODE_ENV === 'development';
const path = require('path');
const isObject = require('lodash/isObject');
const cloneDeep = require('lodash/cloneDeep');
const i18nExtensions = require('vue-i18n-extensions');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

let systemConfig;
let utils;

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

const proxyHost = systemConfig.system.proxy.host || 'http://127.0.0.1';
const proxyPort = systemConfig.system.proxy.port || 8087;
const lang = systemConfig.system.language || 'zh-Hant';

const generateConfig = (baseCfg, assignCfg) => {
  let resultCfg = Object.assign({}, baseCfg);

  Object.keys(assignCfg).forEach((key) => {
    if (isObject(assignCfg[key])) {
      resultCfg[key] = resultCfg[key] || {};
      Object.assign(resultCfg[key], assignCfg[key]);
    } else {
      resultCfg[key] = assignCfg[key];
    }
  });

  return resultCfg;
};

const prodConfig = {
  vue: {
    config: {
      devtools: false,
      performance: false
    }
  },
  build: {
    filenames: {
      app: ({ isDev }) => isDev ? '[name].js' : '[name]_[chunkhash].js',
      chunk: ({ isDev }) => isDev ? '[name].js' : '[name]_[chunkhash].js',
      css: ({ isDev }) => isDev ? '[name].css' : '[name]_[contenthash].css',
      img: ({ isDev }) => isDev ? '[path][name].[ext]' : 'img/[name]_[hash:7].[ext]',
      font: ({ isDev }) => isDev ? '[path][name].[ext]' : 'fonts/[name]_[hash:7].[ext]',
      video: ({ isDev }) => isDev ? '[path][name].[ext]' : 'videos/[name]_[hash:7].[ext]'
    },
    publicPath: systemConfig.cdnConfig.domain ? `${systemConfig.cdnConfig.domain}${systemConfig.cdnConfig.filePath}` : '/_nuxt/'
  }
};

const devConfig = {
  proxy: {
    '/service': {
      target: `${proxyHost}:${proxyPort}`,
      pathRewrite: {
        '^/service/': '/'
      },
    }
  },
  vue: {
    config: {
      devtools: true,
      performance: true
    }
  }
};

let baseConfig = {
  mode: 'spa',
  head: {
    title: systemConfig.project.name,
    htmlAttrs: {
      lang
    },
    meta: [{
      charset: 'utf-8'
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1'
    }
    ],
    link: [{
      rel: 'icon',
      type: 'image/x-icon',
      href: '/static/favicon.ico'
    }]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: {
    color: '#111111'
  },

  /*
   ** Global CSS
   */
  css: [
    `src/assets/css/glyphicon.css`,
    `src/assets/fonts/font-awesome-4.7.0/css/font-awesome.min.css`,
    `src/assets/scss/index.scss`
  ],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    {
      src: `src/plugins/vueErrorHandler`,
      ssr: false
    },
    {
      src: `src/plugins/vueContext`,
      ssr: false
    },
    {
      src: `src/plugins/extendVue`,
      ssr: false
    },
    {
      src: `src/plugins/awaitCatch`,
      ssr: false
    },
    {
      src: `src/plugins/axios`,
      ssr: false
    },
    {
      src: `src/plugins/locale`,
      ssr: false
    },
    {
      src: `src/plugins/preInit`,
      ssr: false
    },
    {
      src: `src/plugins/init`,
      ssr: false
    },
    {
      src: `src/plugins/element-ui`,
      ssr: false
    }
  ],

  /*
   ** Nuxt.js modules
   */
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/proxy',
  ],
  svgSprite: {
    input: '@/src/assets/icons/svg/',
  },
  axios: {
    prefix: '/service',
    proxy: true
  },
  dir: {
    assets: `src/assets`,
    layouts: `src/layouts`,
    middleware: `src/middleware`,
    pages: `src/pages`,
    static: `src/static`,
    store: `src/store`
  },
  /*
   ** Build configuration
   */
  build: {
    postcss: {
      preset: {
        features: {
          customProperties: false
        },
        autoprefixer:{

        }
      }
    },
    plugins: [
      new SpriteLoaderPlugin()
    ],
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      const rootPath = path.resolve(__dirname);

      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        });

        config.devtool = 'source-map';
      }

      config.module.rules.push({
        test: /\.js$/,
        loader: 'babel-loader',
        include: /(node_modules)/,
        options: {
          presets: ['@babel/env']
        }
      });

      // FIXME
      // 要設定 svg-sprite-loader 需 url-loader exclude svg path
      // set url-loader exclude
      config.module.rules[11].exclude = `${rootPath}/src/assets/icons`;

      config.module.rules.push({
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-sprite-loader',
            options: {
              symbolId: 'icon-[name]'
            }
          },
        ],
        include: `${rootPath}/src/assets/icons`,
      });

      config.resolve.alias.vue$ = 'vue/dist/vue.esm.js';
      config.resolve.alias['@'] = `${rootPath}`;
    }
  },
  router: {
    scrollBehavior (to, from, savedPosition) {
      return {
        x: 0,
        y: 0
      };
    }
  },
  render: {
    bundleRenderer: {
      directives: {
        t: i18nExtensions.directive
      }
    }
  }
};

// use debugger
if (systemConfig.isDebugger) {
  baseConfig.plugins.push({
    src: `src/plugins/debugger`,
    ssr: false
  });
}

// let assignConfig = isDev ? devConfig : prodConfig;

module.exports = generateConfig(baseConfig, devConfig);
