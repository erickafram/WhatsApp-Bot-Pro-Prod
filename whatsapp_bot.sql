-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 27/08/2025 às 16:23
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
) ENGINE=MyISAM AUTO_INCREMENT=289 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `auto_messages`
--

INSERT INTO `auto_messages` (`id`, `project_id`, `trigger_words`, `response_text`, `is_active`, `order_index`, `created_at`, `updated_at`) VALUES
(288, 8, '[\"3\", \"outro operador\", \"nova conversa\", \"novo atendimento\"]', '👥 *NOVO ATENDIMENTO*\n\nEntendi! Vou direcioná-lo para um novo atendimento.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato para ajudá-lo!\n\nObrigado pela preferência! 🚌✨', 1, 0, '2025-08-27 14:38:16', '2025-08-27 14:38:16'),
(286, 8, '[\"CHAT_ENDED_BY_OPERATOR\"]', '✅ *CONVERSA ENCERRADA*\n\nSua conversa com o operador {operatorName} foi finalizada.\n\nVocê pode a qualquer momento:\n\n*1* - 👨‍💼 Voltar a falar com o operador {operatorName}\n*2* - 🏠 Ir para o Menu Principal\n*3* - 👥 Falar com outro operador\n\nDigite o número da opção desejada! 😊', 1, 0, '2025-08-27 14:38:15', '2025-08-27 14:38:15'),
(287, 8, '[\"1\", \"operador\", \"mesmo operador\", \"voltar\"]', '👨‍💼 *RECONECTANDO COM OPERADOR*\n\nPerfeito! Estou reconectando você com o operador {operatorName}.\n\n⏰ *Status:* Aguardando operador disponível\n\nEm alguns instantes {operatorName} retornará para continuar o atendimento!\n\n*Observação:* Se o operador não estiver disponível, outro membro da equipe poderá ajudá-lo.', 1, 0, '2025-08-27 14:38:15', '2025-08-27 14:38:15'),
(278, 8, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\", \"passagem\", \"kleiber\", \"tocantins\", \"0\", \"principal\", \"voltar\", \"inicio\"]', '🚌 Olá! {name} Bem-vindo à *Kleiber Passagens/ Tocantins*! \n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 📦 Encomendas e Cargas\n*4* - 🚐 Turismo/Locação\n*5* - 🚌 Atendimento Real Expresso\n\nDigite o número da opção desejada! 😊', 1, 0, '2025-08-27 14:38:13', '2025-08-27 14:38:13'),
(279, 8, '[\"1\", \"comprar\", \"passagem\", \"bilhete\", \"ticket\"]', '🎫 *COMPRAR PASSAGEM*\n\nPara prosseguir com a compra, preciso das seguintes informações:\n\n📍 *Qual cidade de origem?*\n📍 *Qual cidade de destino?*\n📅 *Qual a data da viagem?*\n\n💡 *Dica:* Digite as informações no formato:\nOrigem - Destino - Data\n\n*Exemplo:* Palmas - Brasília - 25/01/2025\n\nDigite as informações da sua viagem! ✈️', 1, 0, '2025-08-27 14:38:14', '2025-08-27 14:38:14'),
(280, 8, '[\"default\"]', '✅ *Recebemos sua solicitação de passagem!*\n\n👨‍💼 *Transferindo para operador especializado...*\n\nNosso atendente verificará:\n• Disponibilidade de horários\n• Valores das passagens\n• Formas de pagamento\n• Finalização da compra\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato! 🚌✨', 1, 0, '2025-08-27 14:38:14', '2025-08-27 14:38:14'),
(281, 8, '[\"2\", \"horários\", \"horario\", \"hora\", \"saida\"]', '🕐 *HORÁRIOS DE SAÍDA - KLEIBER PASSAGENS*\n\n📋 *Principais Rotas e Horários:*\n\n🌅 *MANHÃ*\n• 06:00 - Brasília, Goiânia\n• 07:30 - São Luís, Imperatriz\n• 08:00 - Araguaína, Gurupi\n• 09:00 - Teresina, Parnaíba\n\n🌞 *TARDE*\n• 14:00 - Barreiras, L.E. Magalhães\n• 15:30 - Porto Nacional, Paraíso\n• 16:00 - Colinas do Tocantins\n\n🌙 *NOITE*\n• 20:00 - Brasília, Goiânia\n• 21:30 - São Luís, Imperatriz\n• 22:00 - Palmas (retorno)\n\n*Horários sujeitos a alterações*\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 📦 Encomendas e Cargas\n*4* - 🚐 Turismo/Locação\n*5* - 🚌 Atendimento Real Expresso\n\n*0* - 🏠 Menu Principal', 1, 0, '2025-08-27 14:38:14', '2025-08-27 14:38:14'),
(282, 8, '[\"3\", \"encomenda\", \"encomendas\", \"carga\", \"cargas\", \"envio\", \"remessa\"]', '📦 *ENCOMENDAS E CARGAS*\n\nPara envio de encomendas e cargas, entre em contato diretamente:\n\n📱 *WhatsApp Especializado:*\n*63984666203*\n\nNossos especialistas em logística irão ajudá-lo com:\n• Tarifas de envio\n• Prazos de entrega\n• Documentação necessária\n• Rastreamento de encomendas\n\n🕐 *Horário de Atendimento:*\nSegunda a Sexta: 7h às 18h\nSábado: 7h às 12h\n\n*0* - 🏠 Voltar ao Menu Principal\n\nObrigado pela preferência! 📦🚌', 1, 0, '2025-08-27 14:38:14', '2025-08-27 14:38:14'),
(283, 8, '[\"4\", \"turismo\", \"locacao\", \"locação\", \"fretamento\", \"excursao\", \"excursão\"]', '🚐 *TURISMO E LOCAÇÃO*\n\nPara serviços de turismo e locação de veículos, entre em contato:\n\n📱 *WhatsApp Especializado:*\n*63984666184*\n\nNossos consultores oferecerão:\n• Pacotes turísticos\n• Locação de ônibus e vans\n• Fretamento para eventos\n• Excursões personalizadas\n• Transporte executivo\n\n🕐 *Horário de Atendimento:*\nSegunda a Sexta: 8h às 17h\nSábado: 8h às 12h\n\n*0* - 🏠 Voltar ao Menu Principal\n\nVenha viajar conosco! 🚐✨', 1, 0, '2025-08-27 14:38:14', '2025-08-27 14:38:14'),
(285, 8, '[\"default\"]', '👨‍💼 *TRANSFERINDO PARA ATENDIMENTO HUMANO*\n\n🤔 Não consegui processar sua mensagem automaticamente, mas nossa equipe especializada poderá ajudá-lo melhor!\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela paciência! 🚌✨', 1, 0, '2025-08-27 14:38:15', '2025-08-27 14:38:15'),
(284, 8, '[\"5\", \"real expresso\", \"real\", \"expresso\"]', '🚌 *ATENDIMENTO REAL EXPRESSO*\n\nPara atendimento específico da Real Expresso, entre em contato:\n\n📱 *WhatsApp Especializado:*\n*63992405166*\n\nServiços Real Expresso:\n• Passagens interestaduais\n• Rotas específicas\n• Informações de horários\n• Reservas e cancelamentos\n\n🕐 *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\n*0* - 🏠 Voltar ao Menu Principal\n\nObrigado pela preferência! 🚌', 1, 0, '2025-08-27 14:38:15', '2025-08-27 14:38:15');

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
) ENGINE=MyISAM AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `contacts`
--

INSERT INTO `contacts` (`id`, `manager_id`, `phone_number`, `name`, `avatar`, `tags`, `notes`, `is_blocked`, `created_at`, `updated_at`) VALUES
(117, 2, '556392134638', 'Junior Moreira', NULL, NULL, NULL, 0, '2025-08-27 13:19:58', '2025-08-27 13:19:58'),
(118, 2, '556385125988', '.', NULL, NULL, NULL, 0, '2025-08-27 13:23:33', '2025-08-27 13:23:33');

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
) ENGINE=MyISAM AUTO_INCREMENT=133 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=MyISAM AUTO_INCREMENT=1351 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `messages`
--

INSERT INTO `messages` (`id`, `manager_id`, `chat_id`, `contact_id`, `whatsapp_message_id`, `sender_type`, `sender_id`, `content`, `message_type`, `media_url`, `is_read`, `delivered_at`, `read_at`, `created_at`) VALUES
(1350, 2, 132, 125, NULL, 'bot', NULL, '📋 *DADOS RECEBIDOS*\n\nPerfeito! Recebi suas informações:\n\nPalmas,Goiânia,28/01/2025\n\n⏰ *FORA DO HORÁRIO DE ATENDIMENTO*\n\nNo momento não temos operadores online, pois estamos fora do nosso horário de funcionamento.\n\n🕐 *Horário de Atendimento:*\nDe segunda a sexta feira:\nDas 08:00 às 12:00\nDas 14:00 às 18:00\nAos sábados:\nDas 08:00 às 12:00\nDomingo fechado\n\n🤝 Suas informações foram registradas e você será atendido assim que possível dentro do nosso horário de funcionamento.\n\n*Obrigado pela compreensão!* 🚌✨', 'text', NULL, 0, NULL, NULL, '2025-08-27 16:20:17'),
(1349, 2, 132, 125, 'false_556392410056@c.us_3EB06D8029128B506A1568', 'contact', NULL, 'Palmas,Goiânia,28/01/2025', 'text', NULL, 0, NULL, NULL, '2025-08-27 16:20:11'),
(1347, 2, 132, 125, 'false_556392410056@c.us_3EB081123A3D1AA083B881', 'contact', NULL, 'olá', 'text', NULL, 0, NULL, NULL, '2025-08-27 16:19:51'),
(1348, 2, 132, 125, NULL, 'bot', NULL, '🚌 Olá! Erick Bem-vindo à *Kleiber Passagens/ Tocantins*! \n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 📦 Encomendas e Cargas\n*4* - 🚐 Turismo/Locação\n*5* - 🚌 Atendimento Real Expresso\n\nDigite o número da opção desejada! 😊', 'text', NULL, 0, NULL, NULL, '2025-08-27 16:19:57');

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
) ENGINE=MyISAM AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `phone`, `avatar`, `is_active`, `email_verified_at`, `created_at`, `updated_at`, `last_login`, `subscription_status`, `subscription_plan`, `subscription_start_date`, `subscription_end_date`, `subscription_payment_method`, `subscription_amount`) VALUES
(1, 'Administrador', 'admin@admin.com', '$2b$12$V8Jv4eB.SU2rwoqxeIhh5OuTOIEAAL.9xfbeL4O/kEO5od2Ah4G0y', 'admin', NULL, NULL, NULL, 1, NULL, '2025-08-15 19:17:56', '2025-08-23 18:21:08', NULL, 'active', 'admin_unlimited', '2025-08-23 18:21:08', '2026-08-23 18:21:08', NULL, NULL),
(2, 'Erick Vinicius', 'erickafram08@gmail.com', '$2b$12$93H2dYM2cQ7dIOUL80GVzOuY2sDIT2v2Tk6UJGfyguBjug3q7IZ/2', 'manager', NULL, '63981013083', NULL, 1, NULL, '2025-08-15 19:38:11', '2025-08-23 20:27:58', NULL, 'active', 'Gestor', '2025-08-23 18:21:08', '2026-09-28 18:21:08', 'credit_card', 149.90),
(5, 'teste', 'teste@gmail.com', '$2b$12$ekXfByhtEQtfy9hgWnyVSOE8Yo4FXABtmk3zo.d5688GXpJ.9z/Ey', 'operator', 2, '63981013083', NULL, 0, NULL, '2025-08-22 18:04:49', '2025-08-23 23:11:24', NULL, 'free', NULL, NULL, NULL, NULL, NULL),
(6, 'Paula', 'paula@tocantins.com.br', '$2b$12$PLpHVAkz2LPLk/VH0xNOH.IrMXHQx4vUrUfxp60gLn4Qcb8q11aba', 'operator', 2, '63991092465', NULL, 1, NULL, '2025-08-22 19:04:11', '2025-08-22 19:04:11', NULL, 'free', NULL, NULL, NULL, NULL, NULL),
(7, 'Kamylla Costa', 'kamila@gmail.com', '$2b$12$kw9kpzpJr1.CODbZaEBJae31ondvlNm5Pxmzju0oziiMbgKTOZ1LO', 'operator', 2, '63991078778', NULL, 1, NULL, '2025-08-22 19:04:53', '2025-08-22 19:04:53', NULL, 'free', NULL, NULL, NULL, NULL, NULL),
(8, 'Laryna Moreira', 'larynamoreira@gmail.com', '$2b$12$8Pq1Wv3x7y.OPt.boYMPdOJFkkflq6VgYfukv6NIu0rQXeRQS9C9G', 'operator', 2, '63984430626', NULL, 1, NULL, '2025-08-22 19:05:25', '2025-08-22 19:05:25', NULL, 'free', NULL, NULL, NULL, NULL, NULL),
(9, 'Cícero Junior', 'cicero@gmail.com', '$2b$12$t4a5ekINVAM1Pm25z1C38us5jTt2E74i2.BXH4aXdKWmIDdGdE2py', 'operator', 2, '63991052622', NULL, 1, NULL, '2025-08-22 19:05:52', '2025-08-22 19:05:52', NULL, 'free', NULL, NULL, NULL, NULL, NULL),
(10, 'Tathielly Sousa', 'tathielly@gmail.com', '$2b$12$7R8mFOnqpevAq/GEUBue0OQ8UOrzMvbD2ipncG0AVfu3DMjZPqeEi', 'operator', 2, '63992570354', NULL, 1, NULL, '2025-08-22 19:06:45', '2025-08-22 19:06:45', NULL, 'free', NULL, NULL, NULL, NULL, NULL),
(11, 'Gabriel ', 'gabriel@gmail.com', '$2b$12$R1jq9W1fn2NjEwNQ9cIU6u72QCuOdZ8AxaSUemFc3XylW5XyQHuZi', 'operator', 2, '634992023537', NULL, 1, NULL, '2025-08-22 19:07:35', '2025-08-22 19:07:35', NULL, 'free', NULL, NULL, NULL, NULL, NULL),
(12, 'Natália ', 'natalia@gmail.com', '$2b$12$elCsd8opsgDRtK2n2sp1Bet8Az2nSBj69CtUZo8fYnFMdZaQk56PW', 'operator', 2, '63992804489', NULL, 1, NULL, '2025-08-22 19:08:12', '2025-08-22 19:08:12', NULL, 'free', NULL, NULL, NULL, NULL, NULL),
(13, 'Operador', 'operador@gmail.com', '$2b$12$MLr62I8KF8kdq7CrmqpgzejMwGVsI/goIaamhRAOfZ3LVr65wvA7e', 'operator', 2, '63985125981', NULL, 1, NULL, '2025-08-22 19:08:52', '2025-08-22 19:08:52', NULL, 'free', NULL, NULL, NULL, NULL, NULL),
(14, 'Kauany', 'kauany@gmail.com', '$2b$12$YjSFmQdPUeL/38wbUHahdOc/8reuhPxhAwpMnS9VLyZ1YhtBC4/R.', 'manager', NULL, '63981013011', NULL, 1, NULL, '2025-08-23 23:17:33', '2025-08-23 23:17:53', NULL, 'active', 'Básico', '2025-08-23 23:17:53', '2025-09-22 23:17:53', 'credit_card', 39.90);

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
) ENGINE=MyISAM AUTO_INCREMENT=146 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=MyISAM AUTO_INCREMENT=173 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
