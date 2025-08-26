#!/bin/bash

# Script de deploy para produção
# Este script deve ser executado no servidor de produção

set -e

echo "🚀 Iniciando deploy de produção..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    error "PM2 não está instalado. Instalando..."
    npm install -g pm2
fi

# Diretório do projeto
PROJECT_DIR=$(pwd)

log "📁 Diretório do projeto: $PROJECT_DIR"

# Fazer backup do processo atual
log "💾 Fazendo backup da configuração atual..."
pm2 save || warn "Falha ao salvar estado do PM2"

# Parar processos antigos se existirem
log "🛑 Parando processos antigos..."
pm2 stop whatsapp-bot 2>/dev/null || warn "Processo whatsapp-bot não estava rodando"

# Instalar dependências
log "📦 Instalando/atualizando dependências..."
npm ci --production

# Compilar TypeScript
log "🔨 Compilando TypeScript..."
npm run build

# Verificar se o build foi bem-sucedido
if [ ! -f "dist/server.js" ]; then
    error "Build falhou - arquivo dist/server.js não encontrado"
    exit 1
fi

# Criar diretórios necessários
log "📁 Criando diretórios necessários..."
mkdir -p logs
mkdir -p tmp

# Testar conexão com banco de dados
log "🗃️ Testando conexão com banco de dados..."
if command -v node &> /dev/null && [ -f "dist/scripts/test-db-connection.js" ]; then
    node dist/scripts/test-db-connection.js || {
        warn "Teste de conexão com banco falhou, mas continuando..."
    }
fi

# Iniciar/reiniciar com PM2
log "🚀 Iniciando aplicação com PM2..."
pm2 start ecosystem.config.js --env production

# Aguardar um pouco para verificar se a aplicação iniciou corretamente
sleep 5

# Verificar status da aplicação
log "🔍 Verificando status da aplicação..."
pm2 status

# Testar health check se disponível
log "🏥 Testando health check..."
if command -v curl &> /dev/null; then
    sleep 10 # Aguardar aplicação inicializar completamente
    
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        log "✅ Health check passou!"
    else
        error "❌ Health check falhou!"
        log "📋 Logs da aplicação:"
        pm2 logs whatsapp-bot --lines 20
        exit 1
    fi
else
    warn "curl não disponível - pulando teste de health check"
fi

# Salvar configuração do PM2
log "💾 Salvando configuração do PM2..."
pm2 save

# Configurar PM2 para iniciar no boot (se ainda não configurado)
log "⚡ Configurando PM2 para iniciar no boot..."
pm2 startup || warn "Falha ao configurar startup do PM2"

# Limpar logs antigos (manter últimos 7 dias)
log "🧹 Limpando logs antigos..."
find logs/ -name "*.log" -mtime +7 -delete 2>/dev/null || warn "Falha ao limpar logs antigos"

# Recarregar logs do PM2
pm2 reloadLogs

log "🎉 Deploy concluído com sucesso!"
log "📊 Para monitorar a aplicação:"
log "   pm2 status"
log "   pm2 logs whatsapp-bot"
log "   pm2 monit"
log ""
log "🔗 Aplicação disponível em: http://localhost:3000"
log "🏥 Health check: http://localhost:3000/health"
