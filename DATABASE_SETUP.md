# Configuração do Banco de Dados - WhatsApp Bot System

## 📋 Pré-requisitos

- WAMP/XAMPP instalado e funcionando
- MySQL rodando na porta 3306
- Node.js instalado

## 🚀 Configuração Inicial

### 1. Configurar Variáveis de Ambiente

Copie o arquivo `env.example` para `.env`:

```bash
# Windows
copy env.example .env

# Linux/Mac
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=whatsapp_bot

# JWT Configuration (MUDE ESTA CHAVE!)
JWT_SECRET=sua_chave_super_secreta_aqui_12345
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Banco de Dados

O sistema criará automaticamente o banco de dados e executará as migrations na primeira execução, mas você pode fazer manualmente:

```bash
# Executar migrations
npm run migrate:up

# OU configurar tudo de uma vez
npm run db:setup
```

### 4. Iniciar o Sistema

```bash
# Desenvolvimento (com hot reload)
npm run dev:new

# Produção
npm run build
npm start
```

## 👤 Usuário Admin Padrão

Na primeira execução, o sistema criará automaticamente um usuário administrador:

- **Email:** `admin@admin.com`
- **Senha:** `admin123`

⚠️ **IMPORTANTE:** Altere a senha padrão após o primeiro login!

## 🗃️ Estrutura do Banco de Dados

### Tabelas Principais:

1. **users** - Usuários do sistema (Admin, Gestores, Operadores)
2. **whatsapp_instances** - Instâncias do WhatsApp por gestor
3. **message_projects** - Projetos de mensagens automáticas
4. **auto_messages** - Mensagens automáticas dos projetos
5. **contacts** - Contatos dos clientes
6. **human_chats** - Conversas em atendimento humano
7. **messages** - Todas as mensagens do sistema
8. **daily_stats** - Estatísticas diárias
9. **system_logs** - Logs do sistema

### Hierarquia de Usuários:

```
Admin (1)
├── Gestor 1
│   ├── Operador 1.1
│   ├── Operador 1.2
│   └── Instância WhatsApp 1
├── Gestor 2
│   ├── Operador 2.1
│   └── Instância WhatsApp 2
└── ...
```

## 🔧 Comandos Úteis

```bash
# Migrations
npm run migrate:up          # Executar migrations pendentes
npm run migrate:down        # Reverter última migration
npm run migrate:down 3      # Reverter 3 últimas migrations

# Desenvolvimento
npm run dev:new            # Novo sistema com banco
npm run dev                # Sistema antigo (localStorage)

# Build e Deploy
npm run build              # Build completo
npm run server:build       # Build apenas servidor
npm run client:build       # Build apenas cliente
```

## 🔐 Níveis de Acesso

### Admin
- Gerencia todos os gestores
- Acesso a todas as funcionalidades
- Visualiza estatísticas globais

### Gestor
- Gerencia seus próprios operadores
- Conecta sua instância do WhatsApp
- Cria projetos de mensagens automáticas
- Visualiza conversas e estatísticas

### Operador
- Atende conversas humanas
- Visualiza apenas conversas do seu gestor
- Não pode gerenciar configurações

## 📱 Funcionalidades por Gestor

Cada gestor possui:
- ✅ Sua própria instância do WhatsApp
- ✅ Seus próprios operadores
- ✅ Seus próprios projetos de mensagens
- ✅ Seus próprios contatos e conversas
- ✅ Suas próprias estatísticas

## 🛠️ Troubleshooting

### Erro de Conexão com MySQL
```bash
# Verificar se MySQL está rodando
# No WAMP: verificar se o ícone está verde
# Verificar as credenciais no arquivo .env
```

### Erro de Migrations
```bash
# Limpar e recriar banco (CUIDADO: apaga todos os dados!)
# 1. Deletar banco 'whatsapp_bot' no phpMyAdmin
# 2. Executar: npm run migrate:up
```

### Erro de Dependências
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📊 Monitoramento

O sistema inclui:
- 📈 Estatísticas em tempo real
- 📝 Logs detalhados
- 🔍 Monitoramento de instâncias
- 📱 Status de conexão por gestor

## 🔄 Migração do Sistema Antigo

Se você já tem dados no localStorage, eles não serão migrados automaticamente. O sistema antigo ainda funciona com `npm run dev`.

Para migrar dados manualmente:
1. Exporte dados do localStorage
2. Use as APIs para importar no novo sistema
3. Teste completamente antes de desativar o sistema antigo

---

## ⚡ Quick Start

```bash
# 1. Clonar e instalar
git clone <repo>
cd whatsapp-bot
npm install

# 2. Configurar .env
cp env.example .env
# Editar .env com suas configurações

# 3. Iniciar
npm run dev:new

# 4. Acessar
http://localhost:3000
# Login: admin@admin.com / admin123
```

🎉 **Pronto! O sistema está funcionando com banco de dados MySQL!**
