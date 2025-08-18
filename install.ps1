# 🚀 Script de Instalação Automática - WhatsApp-Bot-Pro
# Para Windows com WAMP

Write-Host "🚀 Iniciando instalação do WhatsApp-Bot-Pro..." -ForegroundColor Green

# Verificar se Node.js está instalado
Write-Host "🔍 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "📥 Baixe e instale Node.js LTS de: https://nodejs.org" -ForegroundColor Yellow
    Write-Host "⏸️ Pressione qualquer tecla para continuar após instalar Node.js..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Verificar se npm está disponível
Write-Host "🔍 Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não encontrado!" -ForegroundColor Red
    exit 1
}

# Instalar dependências do servidor
Write-Host "📦 Instalando dependências do servidor..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do servidor!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependências do servidor instaladas!" -ForegroundColor Green

# Instalar dependências do cliente
Write-Host "📦 Instalando dependências do cliente..." -ForegroundColor Yellow
Set-Location client
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do cliente!" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "✅ Dependências do cliente instaladas!" -ForegroundColor Green

# Copiar arquivo de configuração
Write-Host "⚙️ Configurando arquivo de ambiente..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "⚠️ Arquivo .env já existe, mantendo configurações atuais..." -ForegroundColor Yellow
} else {
    Copy-Item "env.example" ".env"
    Write-Host "✅ Arquivo .env criado!" -ForegroundColor Green
}

# Compilar TypeScript
Write-Host "🔨 Compilando TypeScript..." -ForegroundColor Yellow
npm run server:build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao compilar TypeScript!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ TypeScript compilado!" -ForegroundColor Green

# Verificar WAMP
Write-Host "🔍 Verificando WAMP..." -ForegroundColor Yellow
$wampProcesses = Get-Process -Name "wampmanager*" -ErrorAction SilentlyContinue
if ($wampProcesses) {
    Write-Host "✅ WAMP está rodando!" -ForegroundColor Green
} else {
    Write-Host "⚠️ WAMP não foi detectado rodando!" -ForegroundColor Yellow
    Write-Host "📝 Certifique-se de que o WAMP está instalado e rodando (ícone verde)" -ForegroundColor Yellow
}

# Configurar banco de dados
Write-Host "🗃️ Configurando banco de dados..." -ForegroundColor Yellow
Write-Host "⚠️ Certifique-se de que o MySQL está rodando no WAMP!" -ForegroundColor Yellow
Write-Host "📝 Editando arquivo .env para configurar banco..." -ForegroundColor Yellow

# Tentar executar migrations
Write-Host "🔄 Executando migrations do banco..." -ForegroundColor Yellow
try {
    npm run db:setup
    Write-Host "✅ Banco de dados configurado!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erro ao configurar banco. Configure manualmente:" -ForegroundColor Yellow
    Write-Host "   1. Edite o arquivo .env com suas credenciais MySQL" -ForegroundColor Yellow
    Write-Host "   2. Execute: npm run db:setup" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 INSTALAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. ⚙️ Editar arquivo .env com suas configurações:" -ForegroundColor White
Write-Host "   - Senha do MySQL do WAMP" -ForegroundColor Gray
Write-Host "   - JWT_SECRET (chave secreta)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🗃️ Verificar banco de dados:" -ForegroundColor White
Write-Host "   - Acessar: http://localhost/phpmyadmin" -ForegroundColor Gray
Write-Host "   - Verificar se banco 'whatsapp_bot' foi criado" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🚀 Iniciar o sistema:" -ForegroundColor White
Write-Host "   npm run dev:new" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 🌐 Acessar o sistema:" -ForegroundColor White
Write-Host "   - Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host "   - Login: admin@admin.com / admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️ IMPORTANTE: Altere a senha padrão após o primeiro login!" -ForegroundColor Red
Write-Host ""
Write-Host "⏸️ Pressione qualquer tecla para finalizar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
