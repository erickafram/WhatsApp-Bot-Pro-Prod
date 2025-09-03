#!/bin/bash

# Script simples para corrigir dependências - sem conflitos
# Usa apenas o Node.js já instalado

set -e

echo "🔧 Corrigindo dependências do Baileys (método simples)..."

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

# 1. Verificar Node.js atual
log "🔍 Verificando Node.js..."
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# 2. Instalar apenas dependências essenciais
log "📦 Instalando dependências essenciais..."
apt install -y build-essential python3 libgcc-s1 libc6-dev

# 3. Configurar npm para usar Python3
log "⚙️ Configurando npm..."
npm config set python python3

# 4. Limpar cache
log "🧹 Limpando cache..."
npm cache clean --force

# 5. Remover node_modules
log "🗑️ Removendo módulos antigos..."
rm -rf node_modules
rm -rf package-lock.json

# 6. Instalar dependências
log "📦 Instalando dependências..."
npm install --no-optional --legacy-peer-deps

# 7. Verificar Baileys
log "✅ Verificando Baileys..."
if [ -d "node_modules/@whiskeysockets/baileys" ]; then
    log "Baileys instalado!"
else
    error "Baileys não encontrado, tentando novamente..."
    npm install @whiskeysockets/baileys --force
fi

# 8. Compilar
log "🔨 Compilando..."
npm run build

# 9. Criar diretórios
log "📁 Criando diretórios..."
mkdir -p auth_baileys sessions uploads/media logs
chmod -R 755 auth_baileys sessions uploads logs

log "✅ Correção simples concluída!"
echo "🚀 Execute: npm start"
