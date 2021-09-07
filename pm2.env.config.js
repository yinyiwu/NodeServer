module.exports = {
  apps: [{ /*工作執行*/
    name: "enduser",
    script: "./server/index.js",
    // 以叢集方模式建立服務，正式機依狀況設定，跟 instances 一起
    exec_mode: "cluster",
    // 建構幾個node數量，正式機依狀況設定
    instances: 1,
    env: {
      NODE_ENV: "production",
    },
    merge_logs: true
  }, { /*工作執行*/
    name: "service",
    script: "./server/service.js",
    // 以叢集方模式建立服務，正式機依狀況設定，跟 instances 一起
    exec_mode: "cluster",
    // 建構幾個node數量，正式機依狀況設定
    instances: 2,
    env: {
      NODE_ENV: "production",
    },
    merge_logs: true
  }, { /*工作執行*/
    name: "job",
    script: "./schedule/index.js",
    // 以叢集方模式建立服務，正式機依狀況設定，跟 instances 一起
    exec_mode: "cluster",
    // 建構幾個node數量，正式機依狀況設定
    instances: 1,
    env: {
      NODE_ENV: "production",
    },
    merge_logs: true
  }]
};