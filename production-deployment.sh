#!/bin/bash

# Script completo de deploy para produção
# Execute este script no servidor: bash production-deployment.sh

echo "🚀 Iniciando configuração de produção para WhatsApp Bot Pro..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir com cores
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Configurar Nginx
echo "🔧 Configurando Nginx..."

# Backup da configuração existente se houver
if [ -f "/etc/nginx/sites-available/chatbotwhats.online" ]; then
    cp /etc/nginx/sites-available/chatbotwhats.online /etc/nginx/sites-available/chatbotwhats.online.backup
    print_warning "Backup da configuração Nginx existente criado"
fi

# Copiar nova configuração
cp nginx-config.conf /etc/nginx/sites-available/chatbotwhats.online

# Criar link simbólico se não existir
if [ ! -L "/etc/nginx/sites-enabled/chatbotwhats.online" ]; then
    ln -s /etc/nginx/sites-available/chatbotwhats.online /etc/nginx/sites-enabled/
    print_status "Link simbólico do Nginx criado"
fi

# Testar configuração do Nginx
if nginx -t; then
    print_status "Configuração do Nginx válida"
    systemctl reload nginx
    print_status "Nginx recarregado"
else
    print_error "Erro na configuração do Nginx"
    exit 1
fi

# 2. Configurar banco de dados
echo "🗄️  Configurando banco de dados..."

print_warning "IMPORTANTE: Configure o banco de dados MySQL manualmente:"
echo "1. Acesse: mysql -u root -p"
echo "2. Execute o script: source $(pwd)/database-setup.sql"
echo "3. Defina uma senha forte para o usuário 'chatbotwhats'"
echo ""

# 3. Executar migrations
echo "📊 Executando migrations do banco..."

if [ -f ".env" ]; then
    npm run migrate:up
    print_status "Migrations executadas"
else
    print_error "Arquivo .env não encontrado! Configure as variáveis de ambiente primeiro."
    exit 1
fi

# 4. Configurar PM2
echo "⚙️  Configurando PM2..."

# Parar processo se estiver rodando
pm2 stop whatsapp-bot 2>/dev/null || true

# Iniciar com ecosystem.config.js
pm2 start ecosystem.config.js --env production

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar com o sistema
pm2 startup

print_status "PM2 configurado e aplicação iniciada"

# 5. Configurar SSL (Let's Encrypt)
echo "🔒 Configuração SSL opcional..."

print_warning "Para configurar SSL (recomendado para produção):"
echo "1. Instale certbot: sudo apt install certbot python3-certbot-nginx"
echo "2. Obtenha certificado: sudo certbot --nginx -d chatbotwhats.online"
echo "3. Teste renovação: sudo certbot renew --dry-run"
echo ""

# 6. Configurar firewall
echo "🛡️  Configurando firewall..."

# Permitir portas necessárias
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 8443/tcp  # CloudPanel

print_status "Regras do firewall configuradas"

# 7. Status final
echo ""
echo "🎉 Configuração de produção concluída!"
echo ""
print_status "Serviços configurados:"
echo "  • Nginx: Proxy reverso configurado"
echo "  • PM2: Gerenciando processo da aplicação"
echo "  • Banco: Pronto para uso (configure manualmente)"
echo "  • Firewall: Portas necessárias liberadas"
echo ""
print_warning "Próximos passos:"
echo "1. Configure o banco de dados MySQL"
echo "2. Edite o arquivo .env com as credenciais corretas"
echo "3. Reinicie a aplicação: pm2 restart whatsapp-bot"
echo "4. Configure SSL para HTTPS (recomendado)"
echo "5. Acesse: http://chatbotwhats.online"
echo ""
echo "📊 Monitoramento:"
echo "  • Logs da aplicação: pm2 logs whatsapp-bot"
echo "  • Status PM2: pm2 status"
echo "  • Logs Nginx: tail -f /var/log/nginx/chatbotwhats.online.error.log"
echo ""
print_status "Deploy concluído com sucesso! 🚀"
