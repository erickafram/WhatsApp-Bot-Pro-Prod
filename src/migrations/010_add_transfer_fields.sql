-- Migração 010: Adicionar campos para sistema de transferências
-- Descrição: Adiciona campos transfer_from, transfer_to e status transfer_pending para gerenciar transferências de conversas

-- Adicionar novos campos à tabela human_chats
ALTER TABLE human_chats 
ADD COLUMN transfer_from INT DEFAULT NULL,
ADD COLUMN transfer_to INT DEFAULT NULL;

-- Modificar o enum status para incluir transfer_pending
ALTER TABLE human_chats 
MODIFY COLUMN status ENUM('pending', 'active', 'waiting_payment', 'paid', 'finished', 'resolved', 'transfer_pending') DEFAULT 'pending';

-- Adicionar índices para melhor performance
ALTER TABLE human_chats 
ADD INDEX idx_transfer_from (transfer_from),
ADD INDEX idx_transfer_to (transfer_to);

-- Adicionar chaves estrangeiras para integridade referencial
ALTER TABLE human_chats 
ADD CONSTRAINT fk_transfer_from FOREIGN KEY (transfer_from) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_transfer_to FOREIGN KEY (transfer_to) REFERENCES users(id) ON DELETE SET NULL;
