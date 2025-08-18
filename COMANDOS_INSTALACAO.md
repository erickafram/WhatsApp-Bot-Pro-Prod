# 📋 Comandos de Instalação Rápida - WhatsApp-Bot-Pro

## 🎯 Resumo Executivo

### Pré-requisitos (Download e Instalar):
1. **WAMP64**: https://www.wampserver.com/en/download-wampserver-64bits/
2. **Node.js LTS**: https://nodejs.org/en/download/ (versão 18.x ou 20.x)
3. **Git**: https://git-scm.com/download/win

### Comandos de Instalação:

```bash
# 1. Clonar projeto
cd C:\wamp64\www
git clone https://github.com/erickafram/WhatsApp-Bot-Pro.git
cd WhatsApp-Bot-Pro

# 2. Configurar ambiente
copy env.example .env
# EDITAR .env com suas configurações MySQL

# 3. Instalar dependências
npm install
cd client && npm install && cd ..

# 4. Compilar e configurar banco
npm run server:build
npm run db:setup

# 5. Iniciar sistema
npm run dev:new
```

### Acessos:
- **Sistema**: http://localhost:5173
- **Login**: admin@admin.com / admin123
- **phpMyAdmin**: http://localhost/phpmyadmin

## 🔧 Comandos Detalhados

### Instalação Automática:
```bash
# Executar script de instalação
.\install.bat
# OU
powershell -ExecutionPolicy Bypass -File install.ps1
```

### Instalação Manual:

#### 1. Preparar Ambiente
```bash
# Verificar versões
node --version
npm --version

# Navegar para diretório WAMP
cd C:\wamp64\www

# Clonar repositório
git clone https://github.com/erickafram/WhatsApp-Bot-Pro.git
cd WhatsApp-Bot-Pro
```

#### 2. Configurar Variáveis
```bash
# Copiar arquivo de configuração
copy env.example .env

# Editar configurações (usar notepad ou editor preferido)
notepad .env
```

**Configurações mínimas no .env:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_mysql_wamp
DB_NAME=whatsapp_bot
JWT_SECRET=sua_chave_secreta_muito_forte_12345
PORT=3000
NODE_ENV=development
```

#### 3. Instalar Dependências
```bash
# Servidor (backend)
npm install

# Cliente (frontend)
cd client
npm install
cd ..
```

#### 4. Configurar Banco de Dados
```bash
# Compilar TypeScript primeiro
npm run server:build

# Executar migrations
npm run db:setup

# OU manualmente:
npm run migrate:up
```

#### 5. Iniciar Sistema
```bash
# Desenvolvimento (recomendado)
npm run dev:new

# OU produção
npm run build
npm start
```

## 🗃️ Configuração MySQL no WAMP

### Via phpMyAdmin:
1. Acessar: http://localhost/phpmyadmin
2. Criar banco: `whatsapp_bot`
3. Importar: `whatsapp_bot.sql` (se existir)

### Via SQL:
```sql
CREATE DATABASE whatsapp_bot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 🔄 Comandos de Desenvolvimento

```bash
# Desenvolvimento completo
npm run dev:new

# Apenas servidor
npm run server:dev:new

# Apenas cliente
cd client && npm run dev

# Build completo
npm run build

# Migrations
npm run migrate:up    # Aplicar
npm run migrate:down  # Reverter
```

## 🐛 Resolução de Problemas

### Erro de Porta:
```bash
# Verificar porta em uso
netstat -ano | findstr :3000

# Alterar porta no .env
PORT=3001
```

### Erro MySQL:
```bash
# Verificar WAMP rodando
# Verificar credenciais no .env
# Testar conexão no phpMyAdmin
```

### Erro de Dependências:
```bash
# Limpar e reinstalar
rmdir /s node_modules
del package-lock.json
npm install

# Cliente também
cd client
rmdir /s node_modules  
del package-lock.json
npm install
cd ..
```

### Erro TypeScript:
```bash
# Instalar TypeScript globalmente
npm install -g typescript tsx

# Compilar manualmente
npx tsc
```

## ⚡ Comandos One-Liner

### Instalação Completa:
```bash
cd C:\wamp64\www && git clone https://github.com/erickafram/WhatsApp-Bot-Pro.git && cd WhatsApp-Bot-Pro && copy env.example .env && npm install && cd client && npm install && cd .. && npm run server:build && npm run db:setup
```

### Iniciar Desenvolvimento:
```bash
cd C:\wamp64\www\WhatsApp-Bot-Pro && npm run dev:new
```

## 🎯 Checklist de Verificação

- [ ] WAMP instalado e rodando (ícone verde)
- [ ] Node.js LTS instalado (18.x ou 20.x)
- [ ] Git instalado
- [ ] Projeto clonado em C:\wamp64\www\
- [ ] Arquivo .env configurado
- [ ] Dependências instaladas (npm install)
- [ ] Cliente instalado (cd client && npm install)
- [ ] TypeScript compilado (npm run server:build)
- [ ] Banco configurado (npm run db:setup)
- [ ] Sistema iniciado (npm run dev:new)
- [ ] Acesso funcionando (http://localhost:5173)

## 🔐 Login Inicial

**Primeiro Acesso:**
- **URL**: http://localhost:5173
- **Email**: admin@admin.com
- **Senha**: admin123

⚠️ **ALTERE A SENHA APÓS O PRIMEIRO LOGIN!**

---

💡 **Dica**: Execute o script `install.bat` para instalação automática ou siga os comandos manuais acima.
