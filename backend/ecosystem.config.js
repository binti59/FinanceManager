module.exports = {
  apps: [
    {
      name: "finance-app-backend",
      script: "./src/server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      },
      watch: false,
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "/home/ubuntu/logs/finance-app/error.log",
      out_file: "/home/ubuntu/logs/finance-app/out.log",
      merge_logs: true
    }
  ]
}
