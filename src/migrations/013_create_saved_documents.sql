-- Migration 013: Criar tabela para documentos salvos/catalogados
-- Permite que operadores salvem documentos importantes com descrições

CREATE TABLE IF NOT EXISTS `saved_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `manager_id` int NOT NULL,
  `message_id` int NOT NULL,
  `contact_id` int NOT NULL,
  `chat_id` int DEFAULT NULL,
  `operator_id` int NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `document_url` varchar(500) NOT NULL,
  `original_message_content` text,
  `description` text NOT NULL,
  `category` enum('pagamento','documento_pessoal','comprovante','contrato','outros') DEFAULT 'outros',
  `file_size` bigint DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `is_important` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_manager_id` (`manager_id`),
  KEY `idx_message_id` (`message_id`),
  KEY `idx_contact_id` (`contact_id`),
  KEY `idx_chat_id` (`chat_id`),
  KEY `idx_operator_id` (`operator_id`),
  KEY `idx_category` (`category`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_is_important` (`is_important`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
