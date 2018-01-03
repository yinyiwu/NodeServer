var path = require('path');
var webpack = require('webpack');
var config = {
    entry: [
        'webpack/hot/dev-server',
        path.join(__dirname, 'src', 'main')
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/dist/'
    },
    module: {
        loaders: [{
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/
            }, {
                test: /\.vue$/,
                loader: 'vue'
            }, {
                test: /\.json$/,
                loader: 'json'
            }

        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    resolve: {
        extensions: ['', '.js', '.vue', '.json'],
        /**
         * Vue v2.x 之後 NPM Package 預設只會匯出 runtime-only 版本，若要使用 standalone 功能則需下列設定
         */
        alias: {
            vue: 'vue/dist/vue.js'
        }
    }
}

module.exports = config
