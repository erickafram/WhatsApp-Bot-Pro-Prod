# 🚀 Guia de Instalação - WhatsApp-Bot-Pro
## Instalação Completa em Servidor Local com WAMP

### 📋 Pré-requisitos

#### 1. Instalar WAMP64
```bash
# Baixar WAMP64 do site oficial:
# https://www.wampserver.com/en/download-wampserver-64bits/
# Instalar e iniciar o WAMP (ícone verde na bandeja)
```

#### 2. Instalar Node.js (versão LTS recomendada)
```bash
# Baixar Node.js LTS do site oficial:
# https://nodejs.org/en/download/
# Versão recomendada: 18.x ou 20.x

# Verificar instalação:
node --version
npm --version
```

#### 3. Instalar Git (se não tiver)
```bash
# Baixar Git do site oficial:
# https://git-scm.com/download/win
# Instalar com configurações padrão
```

### 🔧 Passos de Instalação

#### 1. Clonar o Repositório
```bash
# Navegar para o diretório www do WAMP
cd C:\wamp64\www

# Clonar o projeto
git clone https://github.com/erickafram/WhatsApp-Bot-Pro.git
cd WhatsApp-Bot-Pro
```

#### 2. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
copy env.example .env

# Editar o arquivo .env com suas configurações
notepad .env
```

**Configuração do arquivo .env:**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_mysql_do_wamp
DB_NAME=whatsapp_bot

# JWT Configuration (MUDE ESTA CHAVE!)
JWT_SECRET=sua_chave_super_secreta_aqui_12345_muito_segura
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# WhatsApp Configuration
WHATSAPP_SESSION_PATH=./sessions
```

#### 3. Configurar MySQL no WAMP
```sql
-- Acessar phpMyAdmin (http://localhost/phpmyadmin)
-- Criar banco de dados:
CREATE DATABASE whatsapp_bot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- OU usar o arquivo SQL fornecido:
-- Importar o arquivo whatsapp_bot.sql no phpMyAdmin
```

#### 4. Instalar Dependências do Servidor
```bash
# No diretório raiz do projeto
npm install

# Instalar dependências globais (opcional, mas recomendado)
npm install -g typescript tsx nodemon concurrently
```

#### 5. Instalar Dependências do Cliente (Frontend)
```bash
# Navegar para o diretório client
cd client

# Instalar dependências do React
npm install

# Voltar para o diretório raiz
cd ..
```

#### 6. Executar Migrations do Banco de Dados
```bash
# Executar migrations para criar tabelas
npm run migrate:up

# OU configurar banco completo
npm run db:setup
```

#### 7. Compilar o Projeto TypeScript
```bash
# Compilar servidor TypeScript
npm run server:build

# OU fazer build completo (servidor + cliente)
npm run build
```

### 🎯 Comandos para Iniciar o Sistema

#### Desenvolvimento (com hot reload)
```bash
# Iniciar sistema completo em modo desenvolvimento
npm run dev:new

# OU iniciar servidor e cliente separadamente:
# Terminal 1 - Servidor:
npm run server:dev:new

# Terminal 2 - Cliente:
npm run client:dev
```

#### Produção
```bash
# Build e iniciar
npm run build
npm start
```

### 🌐 Acessar o Sistema

Após iniciar o sistema:

- **Frontend (Cliente):** http://localhost:5173 (desenvolvimento) ou http://localhost:3000 (produção)
- **Backend (API):** http://localhost:3000/api
- **phpMyAdmin:** http://localhost/phpmyadmin

### 👤 Login Inicial

**Usuário Administrador Padrão:**
- **Email:** `admin@admin.com`
- **Senha:** `admin123`

⚠️ **IMPORTANTE:** Altere a senha após o primeiro login!

### 🔍 Verificações Importantes

#### 1. Verificar se WAMP está funcionando
```bash
# Acessar no navegador:
http://localhost
# Deve mostrar a página inicial do WAMP
```

#### 2. Verificar MySQL
```bash
# Acessar phpMyAdmin:
http://localhost/phpmyadmin
# Verificar se consegue logar com usuário root
```

#### 3. Verificar Node.js
```bash
node --version
# Deve mostrar versão 18.x ou superior

npm --version
# Deve mostrar versão 8.x ou superior
```

#### 4. Verificar se o banco foi criado
```sql
-- No phpMyAdmin, verificar se existe:
-- - Banco: whatsapp_bot
-- - Tabelas: users, whatsapp_instances, messages, etc.
```

### 🐛 Resolução de Problemas

#### Erro: "Cannot connect to MySQL"
```bash
# 1. Verificar se WAMP está rodando (ícone verde)
# 2. Verificar credenciais no arquivo .env
# 3. Testar conexão no phpMyAdmin
# 4. Verificar se a porta 3306 está livre
```

#### Erro: "Port 3000 already in use"
```bash
# Verificar processos usando a porta:
netstat -ano | findstr :3000

# Matar processo se necessário:
taskkill /PID <PID_NUMBER> /F

# OU alterar porta no arquivo .env:
PORT=3001
```

#### Erro: "Module not found"
```bash
# Limpar cache e reinstalar:
rmdir /s node_modules
del package-lock.json
npm install

# Para o cliente também:
cd client
rmdir /s node_modules
del package-lock.json
npm install
cd ..
```

#### Erro: "TypeScript compilation failed"
```bash
# Verificar se TypeScript está instalado:
npx tsc --version

# Instalar globalmente se necessário:
npm install -g typescript

# Compilar manualmente:
npx tsc
```

### 📁 Estrutura de Diretórios Esperada

```
C:\wamp64\www\WhatsApp-Bot-Pro\
├── client/                 # Frontend React
│   ├── node_modules/
│   ├── src/
│   ├── package.json
│   └── ...
├── src/                    # Backend TypeScript
│   ├── config/
│   ├── models/
│   ├── routes/
│   └── ...
├── dist/                   # Arquivos compilados
├── sessions/               # Sessões WhatsApp
├── .wwebjs_cache/          # Cache WhatsApp Web
├── node_modules/           # Dependências do servidor
├── .env                    # Configurações (CRIAR!)
├── package.json
└── ...
```

### ⚡ Script de Instalação Rápida

Salve este script como `install.bat` e execute:

```batch
@echo off
echo 🚀 Instalando WhatsApp-Bot-Pro...

echo ✅ Instalando dependências do servidor...
npm install

echo ✅ Instalando dependências do cliente...
cd client
npm install
cd ..

echo ✅ Copiando arquivo de configuração...
copy env.example .env

echo ✅ Compilando TypeScript...
npm run server:build

echo ✅ Configurando banco de dados...
npm run db:setup

echo 🎉 Instalação concluída!
echo.
echo 📝 Próximos passos:
echo 1. Editar arquivo .env com suas configurações
echo 2. Verificar se WAMP está rodando
echo 3. Executar: npm run dev:new
echo 4. Acessar: http://localhost:5173
echo 5. Login: admin@admin.com / admin123
echo.
pause
```

### 🔐 Configurações de Segurança

Após instalação, altere:

1. **Senha do usuário admin** (primeiro login)
2. **JWT_SECRET** no arquivo .env
3. **Senha do MySQL** (se usando padrão)
4. **Firewall** - liberar apenas portas necessárias

### 📞 Suporte

Se encontrar problemas:

1. Verificar logs do console
2. Verificar logs do WAMP
3. Verificar arquivo .env
4. Verificar se todas as dependências foram instaladas
5. Verificar se MySQL está rodando

---

**🎉 Após seguir estes passos, o sistema estará funcionando completamente no seu servidor local com WAMP!**
