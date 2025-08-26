# 🚀 Deploy em Produção - WhatsApp Bot Pro

Este documento contém instruções detalhadas para deploy e manutenção do sistema em produção, especialmente focado em resolver problemas de conexão com banco de dados.

## 🔧 Principais Melhorias Implementadas

### 1. Pool de Conexões Robusto
- ✅ Substituído conexão singleton por pool de conexões
- ✅ Configurado keepalive e timeouts adequados
- ✅ Reconexão automática em caso de falha
- ✅ Retry automático com backoff exponencial

### 2. Tratamento de Erros Aprimorado
- ✅ Detecção automática de conexões perdidas
- ✅ 3 tentativas automáticas antes de falhar
- ✅ Logs detalhados para debugging
- ✅ Graceful shutdown adequado

### 3. Monitoramento e Health Check
- ✅ Endpoint `/health` para verificação de status
- ✅ Estatísticas do pool de conexões
- ✅ Script de monitoramento automático
- ✅ Configuração PM2 otimizada

## 📋 Pré-requisitos

1. **Node.js 18+**
2. **PM2 instalado globalmente**: `npm install -g pm2`
3. **MySQL 8.0+**
4. **Variáveis de ambiente configuradas**

## 🛠️ Deploy Passo a Passo

### 1. Preparar o Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2
npm install -g pm2

# Verificar instalações
node --version
npm --version
pm2 --version
```

### 2. Clonar e Configurar Projeto

```bash
# Clonar repositório
git clone <seu-repositorio>
cd WhatsApp-Bot-Pro-Prod

# Instalar dependências
npm ci --production

# Compilar TypeScript
npm run build

# Configurar variáveis de ambiente
cp env.example .env
nano .env  # Editar conforme necessário
```

### 3. Configurar Banco de Dados

```bash
# Testar conexão
node dist/scripts/test-db-connection.js

# Se tudo estiver OK, continuar
# Se houver erro, verificar configurações no .env
```

### 4. Deploy com PM2

```bash
# Usar script automatizado
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh

# OU manualmente:
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 5. Verificar Deploy

```bash
# Verificar status
pm2 status

# Verificar logs
pm2 logs whatsapp-bot

# Testar health check
curl http://localhost:3000/health

# Verificar no navegador
curl http://localhost:3000
```

## 🔍 Monitoramento

### Health Check Endpoint

```bash
# Verificar saúde da aplicação
curl -s http://localhost:3000/health | jq

# Resposta esperada (saudável):
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "memory": {...},
  "database": "connected",
  "whatsappInstances": 2
}
```

### Script de Monitoramento Automático

```bash
# Iniciar monitor em background
nohup node scripts/monitor-system.js > /dev/null 2>&1 &

# Verificar logs do monitor
tail -f logs/monitor.log
```

### Comandos PM2 Úteis

```bash
# Status detalhado
pm2 status
pm2 info whatsapp-bot

# Logs em tempo real
pm2 logs whatsapp-bot --lines 100

# Monitoramento visual
pm2 monit

# Reiniciar aplicação
pm2 restart whatsapp-bot

# Recarregar sem downtime
pm2 reload whatsapp-bot

# Parar aplicação
pm2 stop whatsapp-bot

# Remover da lista
pm2 delete whatsapp-bot
```

## 🚨 Troubleshooting

### Problema: "Can't add new command when connection is in closed state"

**Sintomas:**
- Aplicação para de responder após algumas horas
- Erros de conexão no log
- Necessidade de restart manual

**Solução Implementada:**
1. Pool de conexões com reconexão automática
2. Retry automático com backoff
3. Health check para detecção precoce
4. Graceful shutdown

**Verificação:**
```bash
# Ver logs específicos do banco
pm2 logs whatsapp-bot | grep -i "database\|connection\|mysql"

# Testar conexão diretamente
node dist/scripts/test-db-connection.js
```

### Problema: Alto uso de memória

**Diagnóstico:**
```bash
# Monitorar memória
pm2 info whatsapp-bot

# Ver estatísticas do pool
curl -s http://localhost:3000/health | jq '.memory'
```

**Soluções:**
1. Configurado `max_memory_restart: '500M'` no PM2
2. Pool limitado a 15 conexões
3. Idle timeout configurado para 5 minutos

### Problema: Aplicação não inicia

**Verificação:**
```bash
# Verificar se porta está em uso
netstat -tlnp | grep :3000

# Verificar logs de erro
pm2 logs whatsapp-bot --err

# Verificar variáveis de ambiente
pm2 env whatsapp-bot

# Testar manualmente
node dist/server.js
```

### Problema: Banco de dados inacessível

**Diagnóstico:**
```bash
# Testar conexão MySQL diretamente
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME

# Verificar se MySQL está rodando
systemctl status mysql

# Verificar logs do MySQL
tail -f /var/log/mysql/error.log
```

## 📊 Configurações Otimizadas

### MySQL (my.cnf)
```ini
[mysqld]
# Configurações de conexão
max_connections = 100
wait_timeout = 300
interactive_timeout = 300
max_allowed_packet = 16M

# Configurações de performance
innodb_buffer_pool_size = 512M
innodb_log_file_size = 128M
```

### PM2 (ecosystem.config.js)
```javascript
{
  max_memory_restart: '500M',
  max_restarts: 10,
  min_uptime: '10s',
  restart_delay: 5000,
  cron_restart: '0 4 * * *'  // Restart diário às 4h
}
```

## 🔄 Manutenção Regular

### Daily
```bash
# Verificar status
pm2 status

# Verificar logs de erro
pm2 logs whatsapp-bot --err --lines 50

# Verificar saúde
curl http://localhost:3000/health
```

### Weekly
```bash
# Limpar logs antigos
pm2 flush

# Verificar uso de disco
df -h

# Verificar atualizações
npm outdated
```

### Monthly
```bash
# Backup do banco
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > backup_$(date +%Y%m%d).sql

# Restart programado
pm2 restart whatsapp-bot

# Verificar performance
pm2 monit
```

## 📞 Suporte

Se os problemas persistirem:

1. **Verificar logs detalhados**: `pm2 logs whatsapp-bot --lines 200`
2. **Testar conexão manual**: `node dist/scripts/test-db-connection.js`
3. **Verificar recursos**: `htop`, `free -h`, `df -h`
4. **Reiniciar componentes**: MySQL → PM2 → Sistema

## 🎯 Resultados Esperados

Após implementar essas melhorias:
- ✅ Conexões estáveis por dias/semanas
- ✅ Reconexão automática em falhas
- ✅ Logs claros para debugging
- ✅ Monitoramento proativo
- ✅ Zero downtime em operação normal
