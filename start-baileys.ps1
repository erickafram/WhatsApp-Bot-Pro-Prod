Write-Host "========================================" -ForegroundColor Green
Write-Host "🚀 INICIANDO WHATSAPP BOT COM BAILEYS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Verificando dependências..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "🔨 Compilando TypeScript..." -ForegroundColor Yellow
npm run server:build

Write-Host ""
Write-Host "🗄️ Configurando banco de dados..." -ForegroundColor Yellow
npm run db:setup

Write-Host ""
Write-Host "🎯 Iniciando servidor Baileys..." -ForegroundColor Green
Write-Host "✅ Acesse: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""

npm run start:baileys
