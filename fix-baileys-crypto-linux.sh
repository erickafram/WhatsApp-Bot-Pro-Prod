#!/bin/bash

# Script para corrigir especificamente o erro do noise-handler do Baileys no Linux
# Resolve a diferença entre Windows (local) e Ubuntu (servidor)

set -e

echo "🔧 Corrigindo erro específico do noise-handler (Linux vs Windows)..."

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

# 1. Instalar bibliotecas cripto específicas para o erro do noise-handler
log "🔐 Instalando bibliotecas cripto específicas do Linux..."
apt install -y libssl-dev libcrypto++-dev libcrypto++8 openssl

# 2. Instalar dependências de desenvolvimento C++
log "🛠️ Instalando ferramentas de desenvolvimento C++..."
apt install -y gcc g++ make

# 3. Verificar e instalar libnode específica
log "📦 Verificando libnode..."
apt install -y libnode-dev libnode108 || warn "Libnode pode já estar instalada"

# 4. Forçar recompilação do Baileys especificamente
log "🔨 Recompilando Baileys para Linux..."
cd node_modules/@whiskeysockets/baileys
npm rebuild --build-from-source || warn "Rebuild direto do Baileys falhou"
cd ../../..

# 5. Alternativa: Usar versão estável específica do Baileys
log "📦 Tentando versão mais estável do Baileys..."
npm uninstall @whiskeysockets/baileys
npm install @whiskeysockets/baileys@6.7.8 --force

# 6. Instalar dependências cripto alternativas
log "🔐 Instalando dependências cripto alternativas..."
npm install libsodium-wrappers --save
npm install node-webcrypto-ossl --save

# 7. Verificar se os módulos nativos foram compilados
log "✅ Verificando compilação de módulos nativos..."
find node_modules -name "*.node" -type f | head -10

# 8. Limpar e recompilar tudo
log "🔄 Limpeza final e recompilação..."
npm cache clean --force
npm rebuild

# 9. Compilar projeto
log "🔨 Compilando projeto..."
npm run build

log "✅ Correção específica do noise-handler concluída!"
echo ""
echo "🚀 Diferenças resolvidas entre Windows e Linux!"
echo "Execute: npm start"
