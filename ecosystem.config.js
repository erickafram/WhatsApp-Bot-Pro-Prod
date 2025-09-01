module.exports = {
  apps: [
    {
      name: 'whatsapp-bot',
      script: './dist/server-baileys.js',
      instances: 1, // Não use cluster mode para WhatsApp (conexões WebSocket)
      exec_mode: 'fork',
      
      // Configurações de ambiente
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      // Configurações de restart automático
      watch: false, // Não usar watch em produção
      ignore_watch: ['node_modules', 'logs', 'tmp'],
      
      // Configurações de logs
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Configurações de restart
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 5000,
      
      // Configurações de memória
      max_memory_restart: '500M',
      
      // Configurações de saúde
      health_check_url: 'http://localhost:3000/health',
      health_check_grace_period: 3000,
      
      // Configurações avançadas
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Configurações de autorestart
      autorestart: true,
      cron_restart: '0 4 * * *', // Restart diário às 4h da manhã
      
      // Variáveis de ambiente específicas
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ],
  
  // Configurações de deploy (opcional)
  deploy: {
    production: {
      user: 'root',
      host: 'seu-servidor.com',
      ref: 'origin/main',
      repo: 'git@github.com:seu-usuario/seu-repo.git',
      path: '/home/deploy',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install git -y'
    }
  }
};
