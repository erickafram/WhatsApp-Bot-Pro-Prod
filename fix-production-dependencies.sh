#!/bin/bash

# Script para corrigir dependências do Baileys em produção Ubuntu
# Este script resolve o erro "Cannot read properties of undefined (reading 'child')"

set -e

echo "🔧 Corrigindo dependências do Baileys para produção..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# 1. Atualizar sistema e instalar dependências necessárias
log "📦 Instalando dependências do sistema..."
apt update
apt install -y build-essential python3 python3-pip nodejs npm

# Instalar ferramentas de build do Node.js
apt install -y node-gyp

# Instalar dependências cripto específicas
apt install -y libgcc-s1 libc6-dev libnode-dev

# 2. Limpar cache do npm e node_modules
log "🧹 Limpando cache e módulos antigos..."
npm cache clean --force
rm -rf node_modules
rm -rf package-lock.json

# 3. Instalar dependências com rebuild forçado
log "🔨 Instalando dependências com rebuild..."
npm install --build-from-source
npm rebuild

# 4. Verificar se o Baileys foi instalado corretamente
log "✅ Verificando instalação do Baileys..."
if [ -d "node_modules/@whiskeysockets/baileys" ]; then
    log "Baileys instalado com sucesso!"
else
    error "Falha na instalação do Baileys"
    exit 1
fi

# 5. Compilar TypeScript
log "🔨 Compilando TypeScript..."
npm run build

# 6. Criar diretórios necessários
log "📁 Criando diretórios necessários..."
mkdir -p auth_baileys
mkdir -p sessions
mkdir -p uploads/media
mkdir -p logs

# 7. Definir permissões corretas
log "🔐 Definindo permissões..."
chmod -R 755 auth_baileys
chmod -R 755 sessions
chmod -R 755 uploads
chmod -R 755 logs

log "✅ Correção concluída! Tente executar o servidor novamente."
echo ""
echo "Para testar, execute:"
echo "npm start"
