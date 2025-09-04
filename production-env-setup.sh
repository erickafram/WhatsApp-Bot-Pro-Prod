#!/bin/bash

# Script para configurar variáveis de ambiente em produção
# Execute este script no servidor: bash production-env-setup.sh

# Criar arquivo .env na produção
cat > .env << 'EOF'
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=chatbotwhats
DB_PASSWORD=sua_senha_mysql_aqui
DB_NAME=whatsapp_bot

# JWT Configuration
JWT_SECRET=sua_chave_jwt_super_secreta_producao_$(date +%s)$(openssl rand -hex 16)
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=production

# WhatsApp Configuration
WHATSAPP_SESSION_PATH=./sessions
EOF

echo "✅ Arquivo .env criado com sucesso!"
echo "⚠️  IMPORTANTE: Edite o arquivo .env e configure:"
echo "   - DB_PASSWORD: senha do MySQL"
echo "   - DB_USER: usuário do banco (se diferente)"
echo "   - DB_HOST: host do banco (se diferente de localhost)"

# Criar diretórios necessários
mkdir -p logs
mkdir -p sessions
mkdir -p uploads/media

# Definir permissões corretas
chown -R chatbotwhats:chatbotwhats /home/chatbotwhats/htdocs/chatbotwhats.online
chmod -R 755 /home/chatbotwhats/htdocs/chatbotwhats.online
chmod 600 .env

echo "✅ Diretórios e permissões configurados!"
