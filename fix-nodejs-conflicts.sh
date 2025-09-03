#!/bin/bash

# Script para resolver conflitos do Node.js/npm no Ubuntu
# Corrige conflitos entre repositórios nodesource e Ubuntu

set -e

echo "🔧 Resolvendo conflitos do Node.js/npm..."

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

# 1. Remover npm conflitante
log "🗑️ Removendo npm conflitante..."
apt remove -y npm || warn "npm não estava instalado"

# 2. Limpar cache de pacotes
log "🧹 Limpando cache de pacotes..."
apt clean
apt autoclean
apt autoremove -y

# 3. Atualizar lista de pacotes
log "📦 Atualizando lista de pacotes..."
apt update

# 4. Instalar dependências básicas do sistema
log "📦 Instalando dependências básicas..."
apt install -y build-essential python3 python3-pip curl wget git

# 5. Verificar Node.js atual
log "🔍 Verificando Node.js atual..."
node --version || error "Node.js não encontrado"
which node

# 6. Instalar npm usando o instalador oficial do Node.js
log "📦 Instalando npm oficial..."
curl -qL https://www.npmjs.com/install.sh | sh

# Se falhar, tentar método alternativo
if ! command -v npm &> /dev/null; then
    warn "Método 1 falhou, tentando método alternativo..."
    
    # Baixar e instalar npm manualmente
    cd /tmp
    wget https://registry.npmjs.org/npm/-/npm-10.8.2.tgz
    tar -xzf npm-10.8.2.tgz
    cd package
    make install
    cd /home/chatbotwhats/htdocs/chatbotwhats.online
fi

# 7. Verificar instalação
log "✅ Verificando instalações..."
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# 8. Instalar dependências de build
log "📦 Instalando dependências de build..."
apt install -y libgcc-s1 libc6-dev

# 9. Instalar node-gyp globalmente
log "🔨 Instalando node-gyp..."
npm install -g node-gyp

# 10. Limpar cache do npm
log "🧹 Limpando cache do npm..."
npm cache clean --force

# 11. Remover node_modules e package-lock.json
log "🗑️ Removendo módulos antigos..."
rm -rf node_modules
rm -rf package-lock.json

# 12. Instalar dependências do projeto
log "📦 Instalando dependências do projeto..."
npm install

# 13. Rebuild módulos nativos
log "🔨 Fazendo rebuild dos módulos nativos..."
npm rebuild

# 14. Verificar se o Baileys foi instalado
log "✅ Verificando Baileys..."
if [ -d "node_modules/@whiskeysockets/baileys" ]; then
    log "Baileys instalado com sucesso!"
else
    error "Falha na instalação do Baileys"
    exit 1
fi

# 15. Compilar TypeScript
log "🔨 Compilando TypeScript..."
npm run build

# 16. Criar diretórios necessários
log "📁 Criando diretórios necessários..."
mkdir -p auth_baileys
mkdir -p sessions  
mkdir -p uploads/media
mkdir -p logs

# 17. Definir permissões
log "🔐 Definindo permissões..."
chmod -R 755 auth_baileys
chmod -R 755 sessions
chmod -R 755 uploads
chmod -R 755 logs

log "✅ Correção concluída com sucesso!"
echo ""
echo "🚀 Para testar, execute:"
echo "npm start"
