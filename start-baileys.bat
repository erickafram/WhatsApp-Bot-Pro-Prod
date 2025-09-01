@echo off
echo ========================================
echo 🚀 INICIANDO WHATSAPP BOT COM BAILEYS
echo ========================================
echo.
echo 📋 Verificando dependências...
npm install
echo.
echo 🔨 Compilando TypeScript...
npm run server:build
echo.
echo 🗄️ Configurando banco de dados...
npm run db:setup
echo.
echo 🎯 Iniciando servidor Baileys...
echo ✅ Acesse: http://localhost:3001
echo.
npm run start:baileys
