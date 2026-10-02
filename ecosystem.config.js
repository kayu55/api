module.exports = {
  apps: [{
    name: 'qris-dinamis',
    script: 'server.js',
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'production',
      PORT: 2007
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
