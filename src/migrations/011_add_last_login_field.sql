-- Migração 011: Adicionar campo last_login na tabela users
-- Descrição: Adiciona campo para rastrear último login dos usuários

-- Adicionar campo last_login à tabela users
ALTER TABLE users 
ADD COLUMN last_login TIMESTAMP NULL;

-- Adicionar índice para melhor performance nas consultas de status
ALTER TABLE users 
ADD INDEX idx_last_login (last_login);
