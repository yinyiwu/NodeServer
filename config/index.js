const config = {
  project: {
    name: 'OP System',
  },
  system: {
    proxy: {
      host: 'http://127.0.0.1',
      port: 8080,
    },
    language: 'en',
    server: {
      host: 'http://127.0.0.1',
      port: 80,
    },
  },
  cdnConfig: {},
  // for debug model
  isDebugger: true
}

module.exports = {
  ...config,
}