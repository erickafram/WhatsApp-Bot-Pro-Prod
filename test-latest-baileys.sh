#!/bin/bash

# Script para testar versões mais recentes do Baileys (2025)
# Resolve o erro do noise-handler com as versões mais atualizadas

set -e

echo "🔧 Testando versões mais recentes do Baileys (Setembro 2025)..."

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

# 1. Verificar versões disponíveis do Baileys
log "🔍 Verificando versões disponíveis do Baileys..."
npm view @whiskeysockets/baileys versions --json | tail -20

# 2. Tentar versão mais recente
log "📦 Instalando a versão mais recente do Baileys..."
npm uninstall @whiskeysockets/baileys
npm install @whiskeysockets/baileys@latest --force

# 3. Se falhar, tentar o novo pacote "baileys" oficial
if ! npm list @whiskeysockets/baileys &> /dev/null; then
    log "🔄 Tentando o novo pacote oficial 'baileys'..."
    npm install baileys@latest --force
fi

# 4. Verificar se existe versão beta ou rc
log "🧪 Verificando versões beta/rc..."
npm view baileys versions --json | grep -E "(beta|rc|alpha)" | tail -5 || warn "Nenhuma versão beta encontrada"

# 5. Se tudo falhar, usar versão específica testada
if ! npm list baileys &> /dev/null && ! npm list @whiskeysockets/baileys &> /dev/null; then
    log "🔧 Usando versão específica conhecida por funcionar..."
    npm install @whiskeysockets/baileys@6.6.0 --force
fi

# 6. Limpar cache e recompilar
log "🧹 Limpando cache e recompilando..."
npm cache clean --force
npm rebuild

# 7. Compilar projeto
log "🔨 Compilando projeto..."
npm run build

# 8. Verificar se o Baileys foi instalado corretamente
log "✅ Verificando instalação..."
if [ -d "node_modules/@whiskeysockets/baileys" ] || [ -d "node_modules/baileys" ]; then
    log "Baileys instalado com sucesso!"
    
    # Mostrar versão instalada
    npm list @whiskeysockets/baileys 2>/dev/null || npm list baileys 2>/dev/null || warn "Não foi possível verificar a versão"
else
    error "Falha na instalação do Baileys"
    exit 1
fi

log "✅ Teste de versões concluído!"
echo ""
echo "🚀 Execute: npm start"
echo ""
echo "📝 Se ainda der erro, as próximas opções são:"
echo "   1. Usar biblioteca alternativa (whatsapp-web.js)"
echo "   2. Usar versão ainda mais antiga (6.5.x)"
echo "   3. Usar container Docker com ambiente controlado"
