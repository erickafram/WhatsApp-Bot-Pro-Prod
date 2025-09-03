#!/bin/bash

# Script para usar whatsapp-web.js como alternativa ao Baileys
# Solução de backup se o Baileys não funcionar no Linux

set -e

echo "🔄 Configurando alternativa whatsapp-web.js..."

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

# 1. Fazer backup do package.json atual
log "💾 Fazendo backup do package.json..."
cp package.json package.json.backup

# 2. Remover Baileys e instalar whatsapp-web.js
log "🔄 Removendo Baileys e instalando whatsapp-web.js..."
npm uninstall @whiskeysockets/baileys baileys
npm install whatsapp-web.js@latest --save

# 3. Instalar dependências do puppeteer
log "🤖 Instalando dependências do Puppeteer..."
apt install -y chromium-browser fonts-liberation libasound2 libatk-bridge2.0-0 libdrm2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libu2f-udev libvulkan1

# 4. Criar arquivo de configuração para whatsapp-web.js
log "⚙️ Criando configuração para whatsapp-web.js..."
cat > whatsapp-web-config.js << 'EOF'
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
        executablePath: '/usr/bin/chromium-browser'
    }
});

module.exports = client;
EOF

# 5. Criar exemplo de uso
log "📝 Criando exemplo de uso..."
cat > test-whatsapp-web.js << 'EOF'
const client = require('./whatsapp-web-config');

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();
EOF

log "✅ Configuração do whatsapp-web.js concluída!"
echo ""
echo "🧪 Para testar a alternativa:"
echo "   node test-whatsapp-web.js"
echo ""
echo "📝 Para voltar ao Baileys:"
echo "   cp package.json.backup package.json"
echo "   npm install"
echo ""
echo "💡 whatsapp-web.js é mais estável no Linux mas usa mais recursos (Puppeteer)"
