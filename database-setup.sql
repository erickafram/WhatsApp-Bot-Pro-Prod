-- Configuração do banco de dados para produção
-- Execute estes comandos no MySQL

-- 1. Criar banco de dados
CREATE DATABASE IF NOT EXISTS whatsapp_bot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Criar usuário específico para a aplicação (substituir 'sua_senha_forte' por uma senha segura)
CREATE USER IF NOT EXISTS 'chatbotwhats'@'localhost' IDENTIFIED BY 'sua_senha_forte';

-- 3. Conceder permissões ao usuário
GRANT ALL PRIVILEGES ON whatsapp_bot.* TO 'chatbotwhats'@'localhost';

-- 4. Aplicar as mudanças
FLUSH PRIVILEGES;

-- 5. Verificar se o usuário foi criado
SELECT User, Host FROM mysql.user WHERE User = 'chatbotwhats';

-- 6. Usar o banco de dados
USE whatsapp_bot;

-- 7. Mostrar tabelas (depois de executar as migrations)
-- SHOW TABLES;
