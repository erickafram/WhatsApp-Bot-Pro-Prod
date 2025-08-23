-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 23/08/2025 às 18:19
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
) ENGINE=MyISAM AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `contacts`
--

INSERT INTO `contacts` (`id`, `manager_id`, `phone_number`, `name`, `avatar`, `tags`, `notes`, `is_blocked`, `created_at`, `updated_at`) VALUES
(92, 2, '556392410056', 'Erick Vinicius', NULL, NULL, NULL, 0, '2025-08-23 18:14:07', '2025-08-23 18:14:07');

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
) ENGINE=MyISAM AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `human_chats`
--

INSERT INTO `human_chats` (`id`, `manager_id`, `contact_id`, `operator_id`, `assigned_to`, `status`, `transfer_reason`, `transfer_from`, `transfer_to`, `tags`, `created_at`, `updated_at`) VALUES
(96, 2, 92, NULL, 2, 'pending', 'Solicitação do cliente', NULL, NULL, NULL, '2025-08-23 18:14:51', '2025-08-23 18:16:42');

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
) ENGINE=MyISAM AUTO_INCREMENT=858 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `messages`
--

INSERT INTO `messages` (`id`, `manager_id`, `chat_id`, `contact_id`, `whatsapp_message_id`, `sender_type`, `sender_id`, `content`, `message_type`, `media_url`, `is_read`, `delivered_at`, `read_at`, `created_at`) VALUES
(856, 2, 96, 92, NULL, 'bot', NULL, '👨‍💼 *RECONECTANDO COM OPERADOR*\n\nPerfeito! Estou reconectando você com o operador Erick Vinicius.\n\n⏰ *Status:* Aguardando operador disponível\n\nEm alguns instantes Erick Vinicius retornará para continuar o atendimento!\n\n*Observação:* Se o operador não estiver disponível, outro membro da equipe poderá ajudá-lo.', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:16:43'),
(855, 2, NULL, 92, NULL, 'bot', NULL, '🕐 *HORÁRIOS DE SAÍDA - KLEIBER PASSAGENS*\n\n📋 *Principais Rotas e Horários:*\n\n🌅 *MANHÃ*\n• 06:00 - Brasília, Goiânia\n• 07:30 - São Luís, Imperatriz\n• 08:00 - Araguaína, Gurupi\n• 09:00 - Teresina, Parnaíba\n\n🌞 *TARDE*\n• 14:00 - Barreiras, L.E. Magalhães\n• 15:30 - Porto Nacional, Paraíso\n• 16:00 - Colinas do Tocantins\n\n🌙 *NOITE*\n• 20:00 - Brasília, Goiânia\n• 21:30 - São Luís, Imperatriz\n• 22:00 - Palmas (retorno)\n\n*Horários sujeitos a alterações*\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 📦 Encomendas e Cargas\n*4* - 🚐 Turismo/Locação\n*5* - 🚌 Atendimento Real Expresso\n\n*0* - 🏠 Menu Principal', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:16:30'),
(853, 2, NULL, 92, NULL, 'bot', NULL, '🕐 *HORÁRIOS DE SAÍDA - KLEIBER PASSAGENS*\n\n📋 *Principais Rotas e Horários:*\n\n🌅 *MANHÃ*\n• 06:00 - Brasília, Goiânia\n• 07:30 - São Luís, Imperatriz\n• 08:00 - Araguaína, Gurupi\n• 09:00 - Teresina, Parnaíba\n\n🌞 *TARDE*\n• 14:00 - Barreiras, L.E. Magalhães\n• 15:30 - Porto Nacional, Paraíso\n• 16:00 - Colinas do Tocantins\n\n🌙 *NOITE*\n• 20:00 - Brasília, Goiânia\n• 21:30 - São Luís, Imperatriz\n• 22:00 - Palmas (retorno)\n\n*Horários sujeitos a alterações*\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 📦 Encomendas e Cargas\n*4* - 🚐 Turismo/Locação\n*5* - 🚌 Atendimento Real Expresso\n\n*0* - 🏠 Menu Principal', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:16:19'),
(857, 2, 96, 92, NULL, 'operator', 2, 'Olá', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:16:53'),
(854, 2, 96, 92, 'false_556392410056@c.us_3EB0530D00D9752DAE17A1', 'contact', NULL, '2', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:16:24'),
(852, 2, 96, 92, 'false_556392410056@c.us_3EB09C3EE91C3E586F47F5', 'contact', NULL, '2', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:16:14'),
(848, 2, 96, 92, NULL, 'bot', NULL, '📋 *DADOS RECEBIDOS*\n\nPerfeito! Recebi suas informações:\n\nPalmas \nGoiania\n01/07/2025\n\n🤝 Vou transferir você para um de nossos operadores especializados em vendas para finalizar sua compra e processar o pagamento.\n\n⏰ *Em alguns instantes um operador entrará em contato!*\n\nAguarde um momento... 🚌✨', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:14:56'),
(845, 2, 96, 92, 'false_556392410056@c.us_3EB08D1C8F5EBABAA1800B', 'contact', NULL, '1', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:14:33'),
(846, 2, 96, 92, NULL, 'bot', NULL, '🎫 *COMPRAR PASSAGEM*\n\nPara prosseguir com a compra, preciso das seguintes informações:\n\n📍 *Qual cidade de origem?*\n📍 *Qual cidade de destino?*\n📅 *Qual a data da viagem?*\n\n💡 *Dica:* Digite as informações no formato:\nOrigem - Destino - Data\n\n*Exemplo:* Palmas - Brasília - 25/01/2025\n\nDigite as informações da sua viagem! ✈️', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:14:38'),
(847, 2, 96, 92, 'false_556392410056@c.us_3EB03CDF2EDBAFA9FAEF26', 'contact', NULL, 'Palmas \nGoiania\n01/07/2025', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:14:51'),
(849, 2, 96, 92, NULL, 'operator', 2, 'Vou te enviar', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:15:37'),
(850, 2, 96, 92, NULL, 'operator', 2, 'um minuto', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:15:38'),
(851, 2, 96, 92, NULL, 'bot', NULL, '✅ *CONVERSA ENCERRADA*\n\nSua conversa com o operador Erick Vinicius foi finalizada.\n\nVocê pode a qualquer momento:\n\n*1* - 👨‍💼 Voltar a falar com o operador Erick Vinicius\n*2* - 🏠 Ir para o Menu Principal  \n*3* - 👥 Falar com outro operador\n\nDigite o número da opção desejada! 😊', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:15:42'),
(843, 2, 96, 92, 'false_556392410056@c.us_3EB0D48B9B66B5129E2BDB', 'contact', NULL, 'Olá', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:14:07'),
(844, 2, 96, 92, NULL, 'bot', NULL, '🚌 Olá! Erick Bem-vindo à *Kleiber Passagens/ Tocantins*! \n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 📦 Encomendas e Cargas\n*4* - 🚐 Turismo/Locação\n*5* - 🚌 Atendimento Real Expresso\n\nDigite o número da opção desejada! 😊', 'text', NULL, 0, NULL, NULL, '2025-08-23 18:14:13');

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
('011_add_last_login_field', 'Adicionar campo last_login para rastrear último login dos usuários', '2025-08-20 03:21:43');

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
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_manager_id` (`manager_id`),
  KEY `idx_last_login` (`last_login`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `phone`, `avatar`, `is_active`, `email_verified_at`, `created_at`, `updated_at`, `last_login`) VALUES
(1, 'Administrador', 'admin@admin.com', '$2b$12$V8Jv4eB.SU2rwoqxeIhh5OuTOIEAAL.9xfbeL4O/kEO5od2Ah4G0y', 'admin', NULL, NULL, NULL, 1, NULL, '2025-08-15 19:17:56', '2025-08-15 19:17:56', NULL),
(2, 'Erick Vinicius', 'erickafram08@gmail.com', '$2b$12$93H2dYM2cQ7dIOUL80GVzOuY2sDIT2v2Tk6UJGfyguBjug3q7IZ/2', 'manager', NULL, '63981013083', NULL, 1, NULL, '2025-08-15 19:38:11', '2025-08-15 19:38:11', NULL),
(5, 'teste', 'teste@gmail.com', '$2b$12$ekXfByhtEQtfy9hgWnyVSOE8Yo4FXABtmk3zo.d5688GXpJ.9z/Ey', 'operator', 2, '63981013083', NULL, 1, NULL, '2025-08-22 18:04:49', '2025-08-22 18:04:49', NULL),
(6, 'Paula', 'paula@tocantins.com.br', '$2b$12$PLpHVAkz2LPLk/VH0xNOH.IrMXHQx4vUrUfxp60gLn4Qcb8q11aba', 'operator', 2, '63991092465', NULL, 1, NULL, '2025-08-22 19:04:11', '2025-08-22 19:04:11', NULL),
(7, 'Kamylla Costa', 'kamila@gmail.com', '$2b$12$kw9kpzpJr1.CODbZaEBJae31ondvlNm5Pxmzju0oziiMbgKTOZ1LO', 'operator', 2, '63991078778', NULL, 1, NULL, '2025-08-22 19:04:53', '2025-08-22 19:04:53', NULL),
(8, 'Laryna Moreira', 'larynamoreira@gmail.com', '$2b$12$8Pq1Wv3x7y.OPt.boYMPdOJFkkflq6VgYfukv6NIu0rQXeRQS9C9G', 'operator', 2, '63984430626', NULL, 1, NULL, '2025-08-22 19:05:25', '2025-08-22 19:05:25', NULL),
(9, 'Cícero Junior', 'cicero@gmail.com', '$2b$12$t4a5ekINVAM1Pm25z1C38us5jTt2E74i2.BXH4aXdKWmIDdGdE2py', 'operator', 2, '63991052622', NULL, 1, NULL, '2025-08-22 19:05:52', '2025-08-22 19:05:52', NULL),
(10, 'Tathielly Sousa', 'tathielly@gmail.com', '$2b$12$7R8mFOnqpevAq/GEUBue0OQ8UOrzMvbD2ipncG0AVfu3DMjZPqeEi', 'operator', 2, '63992570354', NULL, 1, NULL, '2025-08-22 19:06:45', '2025-08-22 19:06:45', NULL),
(11, 'Gabriel ', 'gabriel@gmail.com', '$2b$12$R1jq9W1fn2NjEwNQ9cIU6u72QCuOdZ8AxaSUemFc3XylW5XyQHuZi', 'operator', 2, '634992023537', NULL, 1, NULL, '2025-08-22 19:07:35', '2025-08-22 19:07:35', NULL),
(12, 'Natália ', 'natalia@gmail.com', '$2b$12$elCsd8opsgDRtK2n2sp1Bet8Az2nSBj69CtUZo8fYnFMdZaQk56PW', 'operator', 2, '63992804489', NULL, 1, NULL, '2025-08-22 19:08:12', '2025-08-22 19:08:12', NULL),
(13, 'Operador', 'operador@gmail.com', '$2b$12$MLr62I8KF8kdq7CrmqpgzejMwGVsI/goIaamhRAOfZ3LVr65wvA7e', 'operator', 2, '63985125981', NULL, 1, NULL, '2025-08-22 19:08:52', '2025-08-22 19:08:52', NULL);

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
) ENGINE=MyISAM AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `session_token`, `refresh_token`, `expires_at`, `created_at`, `updated_at`, `ip_address`, `user_agent`, `is_active`) VALUES
(88, 2, '920c8a2bf242ecf9e32f44e706b51316120b2a26f700664377bfc8dcb80b4afa', 'dee24c5571a1e83f56637754eed6fb016082918f8dc3221e267d22973b22280e', '2025-08-24 15:13:29', '2025-08-23 15:13:28', '2025-08-23 15:17:44', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 1);

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
) ENGINE=MyISAM AUTO_INCREMENT=141 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `whatsapp_instances`
--

INSERT INTO `whatsapp_instances` (`id`, `manager_id`, `instance_name`, `phone_number`, `status`, `qr_code`, `session_data`, `webhook_url`, `is_active`, `connected_at`, `last_activity`, `created_at`, `updated_at`) VALUES
(140, 2, 'Instância Erick Vinicius', '556392901378', 'connected', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARQAAAEUCAYAAADqcMl5AAAAAklEQVR4AewaftIAABIiSURBVO3BQY4gx7LgQDJR978yp3ffVwEkMqolvXEz+4O11rrgYa21LnlYa61LHtZa65KHtda65GGttS55WGutSx7WWuuSh7XWuuRhrbUueVhrrUse1lrrkoe11rrkYa21LnlYa61LHtZa65IfPlL5mypuUjmpmFSmikllqnhD5Y2KSeWk4iaVqWJSmSomlaliUpkqJpWpYlKZKt5QmSq+UDmpmFT+poovHtZa65KHtda65GGttS754bKKm1ROVE4qTiomlZOKSWWqmFROKqaKSWWqeKPiRGWqmFSmiqnipOKk4qRiUpkqJpUTlTcq/k0qblK56WGttS55WGutSx7WWuuSH36ZyhsVN6lMFScVk8oXFScqU8WJyhsqU8WJyonKVPGGyhsVU8Wk8kbFpDJVnKhMFScqv0nljYrf9LDWWpc8rLXWJQ9rrXXJD/9jKiaVE5W/SWWqeKPiROWNihOVqWJSualiUvmiYlI5UZkqpopJ5Y2KSeV/ycNaa13ysNZalzystdYlP/zHVdxUMalMFZPKpPKGylRxojJVTBUnKl+ovFFxojKpTBWTylQxqUwqb1S8UTGpnKhMFf9LHtZa65KHtda65GGttS754ZdV/JMqJpWpYlKZKk4qJpWpYlL5ouJE5aRiUpkq3lA5UZkqTiomlROVqeJE5UTlpOKLipsq/k0e1lrrkoe11rrkYa21LvnhMpW/SWWqmFSmikllqphUpopJZaqYVKaKSeULlaliUvlCZao4qZhUbqqYVE5UpopJZaqYVE5UpopJ5URlqjhR+Td7WGutSx7WWuuSh7XWusT+4D9MZar4QuWNihOVqWJSeaNiUrmp4g2Vk4oTlaniROWNikllqphUpopJZapY/+dhrbUueVhrrUse1lrrkh8+UpkqblKZKt5QOak4qThRmSpOVKaKE5UvKiaVE5UvKiaVL1ROKm6qOKmYVKaKSWWqmFTeqDhReaPipoe11rrkYa21LnlYa61LfrhMZao4UZkqporfpDJVTConFZPKVDGpnKhMFScV/6SKSeWk4kTlpGJS+ULli4p/k4pJ5W96WGutSx7WWuuSh7XWusT+4CKVNypOVKaKSWWqmFSmihOVqWJSmSq+UJkqJpV/k4o3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', NULL, NULL, 1, '2025-08-23 18:14:00', '2025-08-23 18:16:41', '2025-08-23 18:13:37', '2025-08-23 18:16:41');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
