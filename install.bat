@echo off
chcp 65001 >nul
title Instalação WhatsApp-Bot-Pro

echo.
echo 🚀 Instalando WhatsApp-Bot-Pro...
echo.

REM Verificar Node.js
echo 🔍 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo 📥 Baixe e instale Node.js LTS de: https://nodejs.org
    echo ⏸️ Pressione qualquer tecla para continuar após instalar Node.js...
    pause >nul
)

node --version
echo ✅ Node.js encontrado!
echo.

REM Verificar npm
echo 🔍 Verificando npm...
npm --version
echo ✅ npm encontrado!
echo.

REM Instalar dependências do servidor
echo 📦 Instalando dependências do servidor...
npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências do servidor!
    pause
    exit /b 1
)
echo ✅ Dependências do servidor instaladas!
echo.

REM Instalar dependências do cliente
echo 📦 Instalando dependências do cliente...
cd client
npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências do cliente!
    pause
    exit /b 1
)
cd ..
echo ✅ Dependências do cliente instaladas!
echo.

REM Copiar arquivo de configuração
echo ⚙️ Configurando arquivo de ambiente...
if exist ".env" (
    echo ⚠️ Arquivo .env já existe, mantendo configurações atuais...
) else (
    copy env.example .env >nul
    echo ✅ Arquivo .env criado!
)
echo.

REM Compilar TypeScript
echo 🔨 Compilando TypeScript...
npm run server:build
if %errorlevel% neq 0 (
    echo ❌ Erro ao compilar TypeScript!
    pause
    exit /b 1
)
echo ✅ TypeScript compilado!
echo.

REM Verificar WAMP
echo 🔍 Verificando WAMP...
tasklist /FI "IMAGENAME eq wampmanager.exe" 2>NUL | find /I /N "wampmanager.exe" >nul
if %errorlevel% equ 0 (
    echo ✅ WAMP está rodando!
) else (
    echo ⚠️ WAMP não foi detectado rodando!
    echo 📝 Certifique-se de que o WAMP está instalado e rodando (ícone verde)
)
echo.

REM Configurar banco de dados
echo 🗃️ Configurando banco de dados...
echo ⚠️ Certifique-se de que o MySQL está rodando no WAMP!
echo 📝 Executando migrations...
npm run db:setup
if %errorlevel% neq 0 (
    echo ⚠️ Erro ao configurar banco. Configure manualmente:
    echo    1. Edite o arquivo .env com suas credenciais MySQL
    echo    2. Execute: npm run db:setup
) else (
    echo ✅ Banco de dados configurado!
)
echo.

echo.
echo 🎉 INSTALAÇÃO CONCLUÍDA!
echo.
echo 📝 PRÓXIMOS PASSOS:
echo.
echo 1. ⚙️ Editar arquivo .env com suas configurações:
echo    - Senha do MySQL do WAMP
echo    - JWT_SECRET (chave secreta)
echo.
echo 2. 🗃️ Verificar banco de dados:
echo    - Acessar: http://localhost/phpmyadmin
echo    - Verificar se banco 'whatsapp_bot' foi criado
echo.
echo 3. 🚀 Iniciar o sistema:
echo    npm run dev:new
echo.
echo 4. 🌐 Acessar o sistema:
echo    - Frontend: http://localhost:5173
echo    - Login: admin@admin.com / admin123
echo.
echo ⚠️ IMPORTANTE: Altere a senha padrão após o primeiro login!
echo.
echo ⏸️ Pressione qualquer tecla para finalizar...
pause >nul
