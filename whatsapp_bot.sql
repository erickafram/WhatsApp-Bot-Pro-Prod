-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 23/08/2025 às 20:15
-- Versão do servidor: 9.1.0
-- Versão do PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `whatsapp_bot`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `auto_messages`
--

DROP TABLE IF EXISTS `auto_messages`;
CREATE TABLE IF NOT EXISTS `auto_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `trigger_words` json NOT NULL,
  `response_text` text NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `order_index` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_order_index` (`order_index`)
) ENGINE=MyISAM AUTO_INCREMENT=262 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `auto_messages`
--

INSERT INTO `auto_messages` (`id`, `project_id`, `trigger_words`, `response_text`, `is_active`, `order_index`, `created_at`, `updated_at`) VALUES
(257, 8, '[\"5\", \"real expresso\", \"real\", \"expresso\"]', '🚌 *ATENDIMENTO REAL EXPRESSO*\n\nPara atendimento específico da Real Expresso, entre em contato:\n\n📱 *WhatsApp Especializado:*\n*63992405166*\n\nServiços Real Expresso:\n• Passagens interestaduais\n• Rotas específicas\n• Informações de horários\n• Reservas e cancelamentos\n\n🕐 *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\n*0* - 🏠 Voltar ao Menu Principal\n\nObrigado pela preferência! 🚌', 1, 0, '2025-08-23 16:57:03', '2025-08-23 16:57:03'),
(258, 8, '[\"default\"]', '👨‍💼 *TRANSFERINDO PARA ATENDIMENTO HUMANO*\n\n🤔 Não consegui processar sua mensagem automaticamente, mas nossa equipe especializada poderá ajudá-lo melhor!\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela paciência! 🚌✨', 1, 0, '2025-08-23 16:57:03', '2025-08-23 16:57:03'),
(259, 8, '[\"CHAT_ENDED_BY_OPERATOR\"]', '✅ *CONVERSA ENCERRADA*\n\nSua conversa com o operador {operatorName} foi finalizada.\n\nVocê pode a qualquer momento:\n\n*1* - 👨‍💼 Voltar a falar com o operador {operatorName}\n*2* - 🏠 Ir para o Menu Principal\n*3* - 👥 Falar com outro operador\n\nDigite o número da opção desejada! 😊', 1, 0, '2025-08-23 16:57:03', '2025-08-23 16:57:03'),
(260, 8, '[\"1\", \"operador\", \"mesmo operador\", \"voltar\"]', '👨‍💼 *RECONECTANDO COM OPERADOR*\n\nPerfeito! Estou reconectando você com o operador {operatorName}.\n\n⏰ *Status:* Aguardando operador disponível\n\nEm alguns instantes {operatorName} retornará para continuar o atendimento!\n\n*Observação:* Se o operador não estiver disponível, outro membro da equipe poderá ajudá-lo.', 1, 0, '2025-08-23 16:57:03', '2025-08-23 16:57:03'),
(261, 8, '[\"3\", \"outro operador\", \"nova conversa\", \"novo atendimento\"]', '👥 *NOVO ATENDIMENTO*\n\nEntendi! Vou direcioná-lo para um novo atendimento.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato para ajudá-lo!\n\nObrigado pela preferência! 🚌✨', 1, 0, '2025-08-23 16:57:03', '2025-08-23 16:57:03'),
(256, 8, '[\"4\", \"turismo\", \"locacao\", \"locação\", \"fretamento\", \"excursao\", \"excursão\"]', '🚐 *TURISMO E LOCAÇÃO*\n\nPara serviços de turismo e locação de veículos, entre em contato:\n\n📱 *WhatsApp Especializado:*\n*63984666184*\n\nNossos consultores oferecerão:\n• Pacotes turísticos\n• Locação de ônibus e vans\n• Fretamento para eventos\n• Excursões personalizadas\n• Transporte executivo\n\n🕐 *Horário de Atendimento:*\nSegunda a Sexta: 8h às 17h\nSábado: 8h às 12h\n\n*0* - 🏠 Voltar ao Menu Principal\n\nVenha viajar conosco! 🚐✨', 1, 0, '2025-08-23 16:57:03', '2025-08-23 16:57:03'),
(254, 8, '[\"2\", \"horários\", \"horario\", \"hora\", \"saida\"]', '🕐 *HORÁRIOS DE SAÍDA - KLEIBER PASSAGENS*\n\n📋 *Principais Rotas e Horários:*\n\n🌅 *MANHÃ*\n• 06:00 - Brasília, Goiânia\n• 07:30 - São Luís, Imperatriz\n• 08:00 - Araguaína, Gurupi\n• 09:00 - Teresina, Parnaíba\n\n🌞 *TARDE*\n• 14:00 - Barreiras, L.E. Magalhães\n• 15:30 - Porto Nacional, Paraíso\n• 16:00 - Colinas do Tocantins\n\n🌙 *NOITE*\n• 20:00 - Brasília, Goiânia\n• 21:30 - São Luís, Imperatriz\n• 22:00 - Palmas (retorno)\n\n*Horários sujeitos a alterações*\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 📦 Encomendas e Cargas\n*4* - 🚐 Turismo/Locação\n*5* - 🚌 Atendimento Real Expresso\n\n*0* - 🏠 Menu Principal', 1, 0, '2025-08-23 16:57:03', '2025-08-23 16:57:03'),
(251, 8, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\", \"passagem\", \"kleiber\", \"tocantins\", \"0\", \"principal\", \"voltar\", \"inicio\"]', '🚌 Olá! {name} Bem-vindo à *Kleiber Passagens/ Tocantins*! \n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 📦 Encomendas e Cargas\n*4* - 🚐 Turismo/Locação\n*5* - 🚌 Atendimento Real Expresso\n\nDigite o número da opção desejada! 😊', 1, 0, '2025-08-23 16:57:03', '2025-08-23 16:57:03'),
(255, 8, '[\"3\", \"encomenda\", \"encomendas\", \"carga\", \"cargas\", \"envio\", \"remessa\"]', '📦 *ENCOMENDAS E CARGAS*\n\nPara envio de encomendas e cargas, entre em contato diretamente:\n\n📱 *WhatsApp Especializado:*\n*63984666203*\n\nNossos especialistas em logística irão ajudá-lo com:\n• Tarifas de envio\n• Prazos de entrega\n• Documentação necessária\n• Rastreamento de encomendas\n\n🕐 *Horário de Atendimento:*\nSegunda a Sexta: 7h às 18h\nSábado: 7h às 12h\n\n*0* - 🏠 Voltar ao Menu Principal\n\nObrigado pela preferência! 📦🚌', 1, 0, '2025-08-23 16:57:03', '2025-08-23 16:57:03'),
(253, 8, '[\"default\"]', '✅ *Recebemos sua solicitação de passagem!*\n\n👨‍💼 *Transferindo para operador especializado...*\n\nNosso atendente verificará:\n• Disponibilidade de horários\n• Valores das passagens\n• Formas de pagamento\n• Finalização da compra\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato! 🚌✨', 1, 0, '2025-08-23 16:57:03', '2025-08-23 16:57:03'),
(252, 8, '[\"1\", \"comprar\", \"passagem\", \"bilhete\", \"ticket\"]', '🎫 *COMPRAR PASSAGEM*\n\nPara prosseguir com a compra, preciso das seguintes informações:\n\n📍 *Qual cidade de origem?*\n📍 *Qual cidade de destino?*\n📅 *Qual a data da viagem?*\n\n💡 *Dica:* Digite as informações no formato:\nOrigem - Destino - Data\n\n*Exemplo:* Palmas - Brasília - 25/01/2025\n\nDigite as informações da sua viagem! ✈️', 1, 0, '2025-08-23 16:57:03', '2025-08-23 16:57:03');

-- --------------------------------------------------------

--
-- Estrutura para tabela `contacts`
--

DROP TABLE IF EXISTS `contacts`;
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `manager_id` int NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `avatar` varchar(191) DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `notes` text,
  `is_blocked` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_manager_phone` (`manager_id`,`phone_number`),
  KEY `idx_manager_id` (`manager_id`),
  KEY `idx_phone_number` (`phone_number`),
  KEY `idx_name` (`name`)
) ENGINE=MyISAM AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `contacts`
--

INSERT INTO `contacts` (`id`, `manager_id`, `phone_number`, `name`, `avatar`, `tags`, `notes`, `is_blocked`, `created_at`, `updated_at`) VALUES
(93, 2, '556392410056', 'Erick Vinicius', NULL, NULL, NULL, 0, '2025-08-23 18:38:57', '2025-08-23 18:38:57');

-- --------------------------------------------------------

--
-- Estrutura para tabela `daily_stats`
--

DROP TABLE IF EXISTS `daily_stats`;
CREATE TABLE IF NOT EXISTS `daily_stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `manager_id` int NOT NULL,
  `date` date NOT NULL,
  `messages_sent` int DEFAULT '0',
  `messages_received` int DEFAULT '0',
  `human_chats_created` int DEFAULT '0',
  `human_chats_resolved` int DEFAULT '0',
  `bot_interactions` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_manager_date` (`manager_id`,`date`),
  KEY `idx_manager_id` (`manager_id`),
  KEY `idx_date` (`date`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `devices`
--

DROP TABLE IF EXISTS `devices`;
CREATE TABLE IF NOT EXISTS `devices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `manager_id` int NOT NULL,
  `whatsapp_instance_id` int DEFAULT NULL,
  `device_name` varchar(191) NOT NULL,
  `device_type` enum('smartphone','tablet','computer','other') DEFAULT 'smartphone',
  `device_model` varchar(191) DEFAULT NULL,
  `os_name` varchar(191) DEFAULT NULL,
  `os_version` varchar(191) DEFAULT NULL,
  `browser_name` varchar(191) DEFAULT NULL,
  `browser_version` varchar(191) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `screen_resolution` varchar(50) DEFAULT NULL,
  `timezone` varchar(100) DEFAULT NULL,
  `language` varchar(10) DEFAULT NULL,
  `whatsapp_status` enum('disconnected','connecting','connected','error') DEFAULT 'disconnected',
  `whatsapp_phone` varchar(20) DEFAULT NULL,
  `status` enum('online','offline','idle','blocked') DEFAULT 'offline',
  `is_trusted` tinyint(1) DEFAULT '0',
  `is_primary` tinyint(1) DEFAULT '0',
  `last_activity` timestamp NULL DEFAULT NULL,
  `location_data` json DEFAULT NULL,
  `device_fingerprint` varchar(100) DEFAULT NULL,
  `session_token` varchar(191) DEFAULT NULL,
  `push_token` varchar(191) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_manager_fingerprint` (`manager_id`,`device_fingerprint`),
  KEY `idx_manager_id` (`manager_id`),
  KEY `idx_status` (`status`),
  KEY `idx_device_type` (`device_type`),
  KEY `idx_last_activity` (`last_activity`),
  KEY `idx_device_fingerprint` (`device_fingerprint`),
  KEY `idx_session_token` (`session_token`),
  KEY `idx_whatsapp_instance_id` (`whatsapp_instance_id`),
  KEY `idx_whatsapp_status` (`whatsapp_status`)
) ENGINE=MyISAM AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `human_chats`
--

DROP TABLE IF EXISTS `human_chats`;
CREATE TABLE IF NOT EXISTS `human_chats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `manager_id` int NOT NULL,
  `contact_id` int NOT NULL,
  `operator_id` int DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  `status` enum('pending','active','waiting_payment','paid','finished','resolved','transfer_pending') DEFAULT 'pending',
  `transfer_reason` text,
  `transfer_from` int DEFAULT NULL,
  `transfer_to` int DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_manager_id` (`manager_id`),
  KEY `idx_contact_id` (`contact_id`),
  KEY `idx_operator_id` (`operator_id`),
  KEY `idx_status` (`status`),
  KEY `idx_assigned_to` (`assigned_to`),
  KEY `idx_transfer_from` (`transfer_from`),
  KEY `idx_transfer_to` (`transfer_to`)
) ENGINE=MyISAM AUTO_INCREMENT=98 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `human_chats`
--

INSERT INTO `human_chats` (`id`, `manager_id`, `contact_id`, `operator_id`, `assigned_to`, `status`, `transfer_reason`, `transfer_from`, `transfer_to`, `tags`, `created_at`, `updated_at`) VALUES
(97, 2, 93, NULL, 2, 'finished', 'Solicitação do cliente', NULL, NULL, NULL, '2025-08-23 18:39:20', '2025-08-23 18:40:17');

-- --------------------------------------------------------

--
-- Estrutura para tabela `messages`
--

DROP TABLE IF EXISTS `messages`;
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `manager_id` int NOT NULL,
  `chat_id` int DEFAULT NULL,
  `contact_id` int NOT NULL,
  `whatsapp_message_id` varchar(191) DEFAULT NULL,
  `sender_type` enum('contact','bot','operator') NOT NULL,
  `sender_id` int DEFAULT NULL,
  `content` text NOT NULL,
  `message_type` enum('text','image','audio','video','document','location') DEFAULT 'text',
  `media_url` varchar(191) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `delivered_at` timestamp NULL DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_manager_id` (`manager_id`),
  KEY `idx_chat_id` (`chat_id`),
  KEY `idx_contact_id` (`contact_id`),
  KEY `idx_sender_type` (`sender_type`),
  KEY `idx_sender_id` (`sender_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=MyISAM AUTO_INCREMENT=870 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `messages`
--

INSERT INTO `messages` (`id`, `manager_id`, `chat_id`, `contact_id`, `whatsapp_message_id`, `sender_type`, `sender_id`, `content`, `message_type`, `media_url`, `is_read`, `delivered_at`, `read_at`, `created_at`) VALUES
(868, 2, 97, 93, NULL, 'operator', 2, 'ok', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:40:12'),
(869, 2, 97, 93, NULL, 'bot', NULL, '✅ *CONVERSA ENCERRADA*\n\nSua conversa com o operador Erick Vinicius foi finalizada.\n\nVocê pode a qualquer momento:\n\n*1* - 👨‍💼 Voltar a falar com o operador Erick Vinicius\n*2* - 🏠 Ir para o Menu Principal  \n*3* - 👥 Falar com outro operador\n\nDigite o número da opção desejada! 😊', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:40:18'),
(863, 2, 97, 93, NULL, 'bot', NULL, '📋 *DADOS RECEBIDOS*\n\nPerfeito! Recebi suas informações:\n\npalmas\ngoiania\n01/07/2025\n\n🤝 Vou transferir você para um de nossos operadores especializados em vendas para finalizar sua compra e processar o pagamento.\n\n⏰ *Em alguns instantes um operador entrará em contato!*\n\nAguarde um momento... 🚌✨', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:39:25'),
(860, 2, 97, 93, 'false_556392410056@c.us_3EB00D5F7BCC92CF17E160', 'contact', NULL, '1', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:39:06'),
(861, 2, 97, 93, NULL, 'bot', NULL, '🎫 *COMPRAR PASSAGEM*\n\nPara prosseguir com a compra, preciso das seguintes informações:\n\n📍 *Qual cidade de origem?*\n📍 *Qual cidade de destino?*\n📅 *Qual a data da viagem?*\n\n💡 *Dica:* Digite as informações no formato:\nOrigem - Destino - Data\n\n*Exemplo:* Palmas - Brasília - 25/01/2025\n\nDigite as informações da sua viagem! ✈️', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:39:12'),
(864, 2, 97, 93, NULL, 'operator', 2, 'Olá', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:39:40'),
(865, 2, 97, 93, 'false_556392410056@c.us_3EB0FAAA60813803BCA89F', 'contact', NULL, 'Olá', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:39:45'),
(866, 2, 97, 93, NULL, 'bot', NULL, '✅ *CONVERSA ENCERRADA*\n\nSua conversa com o operador Erick Vinicius foi finalizada.\n\nVocê pode a qualquer momento:\n\n*1* - 👨‍💼 Voltar a falar com o operador Erick Vinicius\n*2* - 🏠 Ir para o Menu Principal  \n*3* - 👥 Falar com outro operador\n\nDigite o número da opção desejada! 😊', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:39:57'),
(867, 2, 97, 93, NULL, 'bot', NULL, '👨‍💼 *RECONECTANDO COM OPERADOR*\n\nPerfeito! Estou reconectando você com o operador Erick Vinicius.\n\n⏰ *Status:* Aguardando operador disponível\n\nEm alguns instantes Erick Vinicius retornará para continuar o atendimento!\n\n*Observação:* Se o operador não estiver disponível, outro membro da equipe poderá ajudá-lo.', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:40:05'),
(862, 2, 97, 93, 'false_556392410056@c.us_3EB0C7236F1FDC7C8A6213', 'contact', NULL, 'palmas\ngoiania\n01/07/2025', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:39:20'),
(858, 2, 97, 93, 'false_556392410056@c.us_3EB064928A86C8D058C0B7', 'contact', NULL, 'Olá', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:38:57'),
(859, 2, 97, 93, NULL, 'bot', NULL, '🚌 Olá! Erick Bem-vindo à *Kleiber Passagens/ Tocantins*! \n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 📦 Encomendas e Cargas\n*4* - 🚐 Turismo/Locação\n*5* - 🚌 Atendimento Real Expresso\n\nDigite o número da opção desejada! 😊', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:39:03');

-- --------------------------------------------------------

--
-- Estrutura para tabela `message_projects`
--

DROP TABLE IF EXISTS `message_projects`;
CREATE TABLE IF NOT EXISTS `message_projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `manager_id` int NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_manager_id` (`manager_id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_is_default` (`is_default`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `message_projects`
--

INSERT INTO `message_projects` (`id`, `manager_id`, `name`, `description`, `is_active`, `is_default`, `created_at`, `updated_at`) VALUES
(8, 2, 'Vendas de Passagem de Ônibus', 'Fluxo otimizado para vendas de passagens com sistema inteligente de verificação de cidades', 1, 1, '2025-08-16 15:25:26', '2025-08-16 15:25:26'),
(9, 3, 'Vendas de Passagem de Ônibus', 'Fluxo otimizado para vendas de passagens com sistema inteligente de verificação de cidades', 1, 1, '2025-08-16 18:48:20', '2025-08-16 18:48:20');

-- --------------------------------------------------------

--
-- Estrutura para tabela `migrations`
--

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `executed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `migrations`
--

INSERT INTO `migrations` (`id`, `description`, `executed_at`) VALUES
('001_create_users_table', 'Criar tabela de usuários com níveis de acesso', '2025-08-15 19:17:47'),
('002_create_whatsapp_instances', 'Criar tabelas para gerenciar instâncias do WhatsApp', '2025-08-15 19:17:47'),
('003_create_message_projects', 'Criar tabelas para projetos e mensagens automáticas', '2025-08-15 19:17:47'),
('004_create_contacts_and_chats', 'Criar tabelas para contatos e conversas', '2025-08-15 19:17:47'),
('005_create_messages_table', 'Criar tabela para armazenar todas as mensagens', '2025-08-15 19:17:47'),
('006_create_analytics_tables', 'Criar tabelas para analytics e logs do sistema', '2025-08-15 19:17:47'),
('007_create_devices_table', 'Criar tabela para gerenciar dispositivos conectados', '2025-08-16 16:22:33'),
('008_update_devices_whatsapp', 'Atualizar tabela devices para integração com WhatsApp', '2025-08-16 17:13:34'),
('009_add_chat_assignment', 'Adicionar campo assigned_to para controle de atribuição de conversas', '2025-08-16 18:53:38'),
('010_add_transfer_fields', 'Adicionar campos transfer_from, transfer_to e status transfer_pending para gerenciar transferências de conversas', '2025-08-18 23:51:27'),
('011_add_last_login_field', 'Adicionar campo last_login para rastrear último login dos usuários', '2025-08-20 03:21:43'),
('012_add_subscription_fields', 'Adicionar campos de assinatura para controle de acesso a instâncias', '2025-08-23 18:21:08');

-- --------------------------------------------------------

--
-- Estrutura para tabela `system_logs`
--

DROP TABLE IF EXISTS `system_logs`;
CREATE TABLE IF NOT EXISTS `system_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `manager_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `action` varchar(191) NOT NULL,
  `description` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_manager_id` (`manager_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','manager','operator') DEFAULT 'manager',
  `manager_id` int DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `subscription_status` enum('free','active','expired','cancelled') DEFAULT 'free',
  `subscription_plan` varchar(50) DEFAULT NULL,
  `subscription_start_date` timestamp NULL DEFAULT NULL,
  `subscription_end_date` timestamp NULL DEFAULT NULL,
  `subscription_payment_method` varchar(50) DEFAULT NULL,
  `subscription_amount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_manager_id` (`manager_id`),
  KEY `idx_last_login` (`last_login`),
  KEY `idx_subscription_status` (`subscription_status`),
  KEY `idx_subscription_end_date` (`subscription_end_date`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `phone`, `avatar`, `is_active`, `email_verified_at`, `created_at`, `updated_at`, `last_login`, `subscription_status`, `subscription_plan`, `subscription_start_date`, `subscription_end_date`, `subscription_payment_method`, `subscription_amount`) VALUES
(1, 'Administrador', 'admin@admin.com', '$2b$12$V8Jv4eB.SU2rwoqxeIhh5OuTOIEAAL.9xfbeL4O/kEO5od2Ah4G0y', 'admin', NULL, NULL, NULL, 1, NULL, '2025-08-15 19:17:56', '2025-08-23 18:21:08', NULL, 'active', 'admin_unlimited', '2025-08-23 18:21:08', '2026-08-23 18:21:08', NULL, NULL),
(2, 'Erick Vinicius', 'erickafram08@gmail.com', '$2b$12$93H2dYM2cQ7dIOUL80GVzOuY2sDIT2v2Tk6UJGfyguBjug3q7IZ/2', 'manager', NULL, '63981013083', NULL, 1, NULL, '2025-08-15 19:38:11', '2025-08-23 18:33:07', NULL, 'active', 'admin_unlimited', '2025-08-23 18:21:08', '2026-08-23 18:21:08', 'credit_card', 149.90),
(5, 'teste', 'teste@gmail.com', '$2b$12$ekXfByhtEQtfy9hgWnyVSOE8Yo4FXABtmk3zo.d5688GXpJ.9z/Ey', 'operator', 2, '63981013083', NULL, 1, NULL, '2025-08-22 18:04:49', '2025-08-22 18:04:49', NULL, 'free', NULL, NULL, NULL, NULL, NULL),
(6, 'Paula', 'paula@tocantins.com.br', '$2b$12$PLpHVAkz2LPLk/VH0xNOH.IrMXHQx4vUrUfxp60gLn4Qcb8q11aba', 'operator', 2, '63991092465', NULL, 1, NULL, '2025-08-22 19:04:11', '2025-08-22 19:04:11', NULL, 'free', NULL, NULL, NULL, NULL, NULL),
(7, 'Kamylla Costa', 'kamila@gmail.com', '$2b$12$kw9kpzpJr1.CODbZaEBJae31ondvlNm5Pxmzju0oziiMbgKTOZ1LO', 'operator', 2, '63991078778', NULL, 1, NULL, '2025-08-22 19:04:53', '2025-08-22 19:04:53', NULL, 'free', NULL, NULL, NULL, NULL, NULL),
(8, 'Laryna Moreira', 'larynamoreira@gmail.com', '$2b$12$8Pq1Wv3x7y.OPt.boYMPdOJFkkflq6VgYfukv6NIu0rQXeRQS9C9G', 'operator', 2, '63984430626', NULL, 1, NULL, '2025-08-22 19:05:25', '2025-08-22 19:05:25', NULL, 'free', NULL, NULL, NULL, NULL, NULL),
(9, 'Cícero Junior', 'cicero@gmail.com', '$2b$12$t4a5ekINVAM1Pm25z1C38us5jTt2E74i2.BXH4aXdKWmIDdGdE2py', 'operator', 2, '63991052622', NULL, 1, NULL, '2025-08-22 19:05:52', '2025-08-22 19:05:52', NULL, 'free', NULL, NULL, NULL, NULL, NULL),
(10, 'Tathielly Sousa', 'tathielly@gmail.com', '$2b$12$7R8mFOnqpevAq/GEUBue0OQ8UOrzMvbD2ipncG0AVfu3DMjZPqeEi', 'operator', 2, '63992570354', NULL, 1, NULL, '2025-08-22 19:06:45', '2025-08-22 19:06:45', NULL, 'free', NULL, NULL, NULL, NULL, NULL),
(11, 'Gabriel ', 'gabriel@gmail.com', '$2b$12$R1jq9W1fn2NjEwNQ9cIU6u72QCuOdZ8AxaSUemFc3XylW5XyQHuZi', 'operator', 2, '634992023537', NULL, 1, NULL, '2025-08-22 19:07:35', '2025-08-22 19:07:35', NULL, 'free', NULL, NULL, NULL, NULL, NULL),
(12, 'Natália ', 'natalia@gmail.com', '$2b$12$elCsd8opsgDRtK2n2sp1Bet8Az2nSBj69CtUZo8fYnFMdZaQk56PW', 'operator', 2, '63992804489', NULL, 1, NULL, '2025-08-22 19:08:12', '2025-08-22 19:08:12', NULL, 'free', NULL, NULL, NULL, NULL, NULL),
(13, 'Operador', 'operador@gmail.com', '$2b$12$MLr62I8KF8kdq7CrmqpgzejMwGVsI/goIaamhRAOfZ3LVr65wvA7e', 'operator', 2, '63985125981', NULL, 1, NULL, '2025-08-22 19:08:52', '2025-08-22 19:08:52', NULL, 'free', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `refresh_token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_token` (`session_token`(191)),
  UNIQUE KEY `refresh_token` (`refresh_token`(191)),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_session_token` (`session_token`(191))
) ENGINE=MyISAM AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `session_token`, `refresh_token`, `expires_at`, `created_at`, `updated_at`, `ip_address`, `user_agent`, `is_active`) VALUES
(98, 2, 'bd649bd96bb80253ffeed75c8931bc435a6ed7b5b37e90c82672811c02d01b50', '73881ed896a7fc1677731e75d636340ab229070e473eab73ef92593413f12e7f', '2025-08-24 15:38:15', '2025-08-23 15:38:14', '2025-08-23 17:08:37', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `whatsapp_instances`
--

DROP TABLE IF EXISTS `whatsapp_instances`;
CREATE TABLE IF NOT EXISTS `whatsapp_instances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `manager_id` int NOT NULL,
  `instance_name` varchar(191) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `status` enum('disconnected','connecting','connected','error') DEFAULT 'disconnected',
  `qr_code` text,
  `session_data` json DEFAULT NULL,
  `webhook_url` varchar(191) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `connected_at` timestamp NULL DEFAULT NULL,
  `last_activity` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_manager_id` (`manager_id`),
  KEY `idx_status` (`status`),
  KEY `idx_phone_number` (`phone_number`)
) ENGINE=MyISAM AUTO_INCREMENT=145 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `whatsapp_instances`
--

INSERT INTO `whatsapp_instances` (`id`, `manager_id`, `instance_name`, `phone_number`, `status`, `qr_code`, `session_data`, `webhook_url`, `is_active`, `connected_at`, `last_activity`, `created_at`, `updated_at`) VALUES
(144, 2, 'Instância Erick Vinicius', '556392901378', 'connecting', 'data:image/png;base64,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', NULL, NULL, 1, '2025-08-23 18:38:45', '2025-08-23 18:40:03', '2025-08-23 18:38:17', '2025-08-23 20:00:31');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
