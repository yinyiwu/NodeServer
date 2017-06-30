"devDependencies": {
    "babel-core": "^6.17.0", // babel 核心程式
    "babel-loader": "^6.2.5", // webpack 使用的 babel 編譯器
    "babel-plugin-transform-runtime": "^6.15.0", // 預設 babel 會在每一隻編譯檔案注入 polyfill 的程式碼，為了避免重複而將這部分抽出去。詳細說明：http://babeljs.io/docs/plugins/transform-runtime/
    "babel-preset-es2015": "^6.16.0", // 支援 ES2015 語法
    "css-loader": "^0.25.0", // webpack 使用於處理 css
    "file-loader": "^0.9.0", // webpack 使用於處理檔案
    "style-loader": "^0.13.1", // webpack 將 css 整合進元件中
    "url-loader": "^0.5.7", // 編譯匯入檔案類型的資源，把檔案轉成 base64
    "vue-hot-reload-api": "^2.0.6", // 支援 Hot Reload
    "vue-loader": "^9.5.1", // 使用 Vue Component Spec
    "webpack": "^1.13.2",
    "webpack-dev-server": "^1.16.1", // webpack 開發伺服器
    "webpack-merge": "^0.14.1" // 合併 webpack 設定參數
  },