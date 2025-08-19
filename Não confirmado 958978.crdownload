-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 19/08/2025 às 16:59
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
) ENGINE=MyISAM AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `auto_messages`
--

INSERT INTO `auto_messages` (`id`, `project_id`, `trigger_words`, `response_text`, `is_active`, `order_index`, `created_at`, `updated_at`) VALUES
(13, 3, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\"]', '🚌 Olá! {name} Bem-vindo à *Viação Palmas*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 1, '2025-08-15 20:28:55', '2025-08-15 20:28:55'),
(14, 3, '[\"1\", \"comprar\", \"passagem\", \"bilhete\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 1, 2, '2025-08-15 20:28:55', '2025-08-15 20:28:55'),
(15, 3, '[\"2\", \"horários\", \"horario\", \"hora\"]', '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫', 1, 3, '2025-08-15 20:28:55', '2025-08-15 20:28:55'),
(16, 3, '[\"3\", \"operador\", \"atendente\", \"humano\", \"pessoa\"]', '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 1, 4, '2025-08-15 20:28:55', '2025-08-15 20:28:55'),
(17, 3, '[\"CIDADE_DISPONIVEL\"]', '✅ *Excelente escolha! Temos passagens para {CIDADE_NOME}!*\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: {CIDADE_NOME}\n🕐 Horários disponíveis: Consulte digitando *2*\n\nPara finalizar sua compra, preciso de algumas informações:\n\n👤 *Nome completo*\n📱 *Telefone para contato*\n📅 *Data da viagem desejada*\n🆔 *CPF*\n\nOu se preferir, fale com nosso operador digitando *3*!\n\nVamos prosseguir? 😊🚌', 1, 5, '2025-08-15 20:28:55', '2025-08-15 20:28:55'),
(18, 3, '[\"CIDADE_NAO_DISPONIVEL\"]', '❌ *Infelizmente não temos passagens para {CIDADE_NOME}*\n\nMas não se preocupe! Você pode adquirir passagens para essa cidade através de outras viações parceiras:\n\n🚌 *Viações Recomendadas:*\n• Expresso Guanabara\n• Viação Útil\n• Real Expresso\n• Eucatur\n\nOu consulte nossos destinos disponíveis digitando *1*!\n\n*Destinos que atendemos:*\nSão Luís, Imperatriz, Brasília, Goiânia, Araguaína, Gurupi, Porto Nacional, Paraíso do Tocantins, Colinas do Tocantins, Barreiras, Luís Eduardo Magalhães, Teresina e Parnaíba!\n\nPosso ajudar com algo mais? 😊', 1, 6, '2025-08-15 20:28:55', '2025-08-15 20:28:55'),
(19, 4, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\"]', '🚌 Olá! {name} Bem-vindo à *Viação Palmas*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 1, '2025-08-16 00:58:38', '2025-08-16 00:58:38'),
(20, 4, '[\"1\", \"comprar\", \"passagem\", \"bilhete\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 1, 2, '2025-08-16 00:58:38', '2025-08-16 00:58:38'),
(21, 4, '[\"2\", \"horários\", \"horario\", \"hora\"]', '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫', 1, 3, '2025-08-16 00:58:38', '2025-08-16 00:58:38'),
(22, 4, '[\"3\", \"operador\", \"atendente\", \"humano\", \"pessoa\"]', '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 1, 4, '2025-08-16 00:58:38', '2025-08-16 00:58:38'),
(23, 4, '[\"CIDADE_DISPONIVEL\"]', '✅ *Excelente escolha! Temos passagens para {CIDADE_NOME}!*\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: {CIDADE_NOME}\n🕐 Horários disponíveis: Consulte digitando *2*\n\nPara finalizar sua compra, preciso de algumas informações:\n\n👤 *Nome completo*\n📱 *Telefone para contato*\n📅 *Data da viagem desejada*\n🆔 *CPF*\n\nOu se preferir, fale com nosso operador digitando *3*!\n\nVamos prosseguir? 😊🚌', 1, 5, '2025-08-16 00:58:38', '2025-08-16 00:58:38'),
(24, 4, '[\"CIDADE_NAO_DISPONIVEL\"]', '❌ *Infelizmente não temos passagens para {CIDADE_NOME}*\n\nMas não se preocupe! Você pode adquirir passagens para essa cidade através de outras viações parceiras:\n\n🚌 *Viações Recomendadas:*\n• Expresso Guanabara\n• Viação Útil\n• Real Expresso\n• Eucatur\n\nOu consulte nossos destinos disponíveis digitando *1*!\n\n*Destinos que atendemos:*\nSão Luís, Imperatriz, Brasília, Goiânia, Araguaína, Gurupi, Porto Nacional, Paraíso do Tocantins, Colinas do Tocantins, Barreiras, Luís Eduardo Magalhães, Teresina e Parnaíba!\n\nPosso ajudar com algo mais? 😊', 1, 6, '2025-08-16 00:58:38', '2025-08-16 00:58:38'),
(25, 5, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\"]', 'Olá! {name} Como posso ajudá-lo hoje? Digite uma das opções:\n\n1 - Informações\n2 - Suporte\n3 - Atendimento Humano', 1, 1, '2025-08-16 01:19:42', '2025-08-16 01:19:42'),
(26, 5, '[\"1\", \"informações\", \"info\"]', 'Aqui estão as informações disponíveis. Como posso ajudar você especificamente?', 1, 2, '2025-08-16 01:19:42', '2025-08-16 01:19:42'),
(27, 5, '[\"2\", \"suporte\", \"ajuda\"]', 'Estou aqui para ajudar! Descreva sua dúvida ou problema.', 1, 3, '2025-08-16 01:19:42', '2025-08-16 01:19:42'),
(28, 5, '[\"3\", \"humano\", \"atendente\", \"operador\", \"pessoa\"]', 'Transferindo você para um atendente humano. Por favor, aguarde...', 1, 4, '2025-08-16 01:19:42', '2025-08-16 01:19:42'),
(29, 6, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\"]', '🚌 Olá! {name} Bem-vindo à *Viação Palmas*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 1, '2025-08-16 01:22:09', '2025-08-16 01:22:09'),
(30, 6, '[\"1\", \"comprar\", \"passagem\", \"bilhete\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 1, 2, '2025-08-16 01:22:09', '2025-08-16 01:22:09'),
(31, 6, '[\"2\", \"horários\", \"horario\", \"hora\"]', '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫', 1, 3, '2025-08-16 01:22:09', '2025-08-16 01:22:09'),
(32, 6, '[\"3\", \"operador\", \"atendente\", \"humano\", \"pessoa\"]', '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 1, 4, '2025-08-16 01:22:09', '2025-08-16 01:22:09'),
(33, 6, '[\"CIDADE_DISPONIVEL\"]', '✅ *Excelente escolha! Temos passagens para {CIDADE_NOME}!*\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: {CIDADE_NOME}\n🕐 Horários disponíveis: Consulte digitando *2*\n\nPara finalizar sua compra, preciso de algumas informações:\n\n👤 *Nome completo*\n📱 *Telefone para contato*\n📅 *Data da viagem desejada*\n🆔 *CPF*\n\nOu se preferir, fale com nosso operador digitando *3*!\n\nVamos prosseguir? 😊🚌', 1, 5, '2025-08-16 01:22:09', '2025-08-16 01:22:09'),
(34, 6, '[\"CIDADE_NAO_DISPONIVEL\"]', '❌ *Infelizmente não temos passagens para {CIDADE_NOME}*\n\nMas não se preocupe! Você pode adquirir passagens para essa cidade através de outras viações parceiras:\n\n🚌 *Viações Recomendadas:*\n• Expresso Guanabara\n• Viação Útil\n• Real Expresso\n• Eucatur\n\nOu consulte nossos destinos disponíveis digitando *1*!\n\n*Destinos que atendemos:*\nSão Luís, Imperatriz, Brasília, Goiânia, Araguaína, Gurupi, Porto Nacional, Paraíso do Tocantins, Colinas do Tocantins, Barreiras, Luís Eduardo Magalhães, Teresina e Parnaíba!\n\nPosso ajudar com algo mais? 😊', 1, 6, '2025-08-16 01:22:09', '2025-08-16 01:22:09'),
(35, 7, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\"]', '🚌 Olá! {name} Bem-vindo à *Viação Palmas*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 1, '2025-08-16 15:21:06', '2025-08-16 15:21:06'),
(36, 7, '[\"1\", \"comprar\", \"passagem\", \"bilhete\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 1, 2, '2025-08-16 15:21:06', '2025-08-16 15:21:06'),
(37, 7, '[\"2\", \"horários\", \"horario\", \"hora\"]', '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫', 1, 3, '2025-08-16 15:21:06', '2025-08-16 15:21:06'),
(38, 7, '[\"3\", \"operador\", \"atendente\", \"humano\", \"pessoa\"]', '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 1, 4, '2025-08-16 15:21:06', '2025-08-16 15:21:06'),
(39, 7, '[\"CIDADE_DISPONIVEL\"]', '✅ *Excelente escolha! Temos passagens para {CIDADE_NOME}!*\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: {CIDADE_NOME}\n🕐 Horários disponíveis: Consulte digitando *2*\n\nPara finalizar sua compra, preciso de algumas informações:\n\n👤 *Nome completo*\n📱 *Telefone para contato*\n📅 *Data da viagem desejada*\n🆔 *CPF*\n\nOu se preferir, fale com nosso operador digitando *3*!\n\nVamos prosseguir? 😊🚌', 1, 5, '2025-08-16 15:21:06', '2025-08-16 15:21:06'),
(40, 7, '[\"CIDADE_NAO_DISPONIVEL\"]', '❌ *Infelizmente não temos passagens para {CIDADE_NOME}*\n\nMas não se preocupe! Você pode adquirir passagens para essa cidade através de outras viações parceiras:\n\n🚌 *Viações Recomendadas:*\n• Expresso Guanabara\n• Viação Útil\n• Real Expresso\n• Eucatur\n\nOu consulte nossos destinos disponíveis digitando *1*!\n\n*Destinos que atendemos:*\nSão Luís, Imperatriz, Brasília, Goiânia, Araguaína, Gurupi, Porto Nacional, Paraíso do Tocantins, Colinas do Tocantins, Barreiras, Luís Eduardo Magalhães, Teresina e Parnaíba!\n\nPosso ajudar com algo mais? 😊', 1, 6, '2025-08-16 15:21:06', '2025-08-16 15:21:06'),
(41, 8, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\"]', '🚌 Olá! {name} Bem-vindo à *Viação Tocantins*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 0, '2025-08-16 15:25:26', '2025-08-19 16:25:59'),
(42, 8, '[\"1\", \"comprar\", \"passagem\", \"bilhete\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 1, 0, '2025-08-16 15:25:26', '2025-08-19 16:25:59'),
(43, 8, '[\"2\", \"horários\", \"horario\", \"hora\"]', '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫', 1, 0, '2025-08-16 15:25:26', '2025-08-19 16:25:59'),
(44, 8, '[\"3\", \"operador\", \"atendente\", \"humano\", \"pessoa\"]', '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 1, 0, '2025-08-16 15:25:26', '2025-08-19 16:25:59'),
(45, 8, '[\"CIDADE_DISPONIVEL\"]', '✅ *Excelente escolha! Temos passagens para {CIDADE_NOME}!*\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: {CIDADE_NOME}\n🕐 Horários disponíveis: Consulte digitando *2*\n\nPara finalizar sua compra, preciso de algumas informações:\n\n👤 *Nome completo*\n📱 *Telefone para contato*\n📅 *Data da viagem desejada*\n🆔 *CPF*\n\nOu se preferir, fale com nosso operador digitando *3*!\n\nVamos prosseguir? 😊🚌', 1, 0, '2025-08-16 15:25:26', '2025-08-19 16:25:59'),
(46, 8, '[\"CIDADE_NAO_DISPONIVEL\"]', '❌ *Infelizmente não temos passagens para {CIDADE_NOME}*\n\nMas não se preocupe! Você pode adquirir passagens para essa cidade através de outras viações parceiras:\n\n🚌 *Viações Recomendadas:*\n• Expresso Guanabara\n• Viação Útil\n• Real Expresso\n• Eucatur\n\nOu consulte nossos destinos disponíveis digitando *1*!\n\n*Destinos que atendemos:*\nSão Luís, Imperatriz, Brasília, Goiânia, Araguaína, Gurupi, Porto Nacional, Paraíso do Tocantins, Colinas do Tocantins, Barreiras, Luís Eduardo Magalhães, Teresina e Parnaíba!\n\nPosso ajudar com algo mais? 😊', 1, 0, '2025-08-16 15:25:26', '2025-08-19 16:25:59'),
(47, 9, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\"]', '🚌 Olá! {name} Bem-vindo à *Viação Palmas*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 1, '2025-08-16 18:48:20', '2025-08-16 18:48:20'),
(48, 9, '[\"1\", \"comprar\", \"passagem\", \"bilhete\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 1, 2, '2025-08-16 18:48:20', '2025-08-16 18:48:20'),
(49, 9, '[\"2\", \"horários\", \"horario\", \"hora\"]', '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫', 1, 3, '2025-08-16 18:48:20', '2025-08-16 18:48:20'),
(50, 9, '[\"3\", \"operador\", \"atendente\", \"humano\", \"pessoa\"]', '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 1, 4, '2025-08-16 18:48:20', '2025-08-16 18:48:20'),
(51, 9, '[\"CIDADE_DISPONIVEL\"]', '✅ *Excelente escolha! Temos passagens para {CIDADE_NOME}!*\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: {CIDADE_NOME}\n🕐 Horários disponíveis: Consulte digitando *2*\n\nPara finalizar sua compra, preciso de algumas informações:\n\n👤 *Nome completo*\n📱 *Telefone para contato*\n📅 *Data da viagem desejada*\n🆔 *CPF*\n\nOu se preferir, fale com nosso operador digitando *3*!\n\nVamos prosseguir? 😊🚌', 1, 5, '2025-08-16 18:48:20', '2025-08-16 18:48:20'),
(52, 9, '[\"CIDADE_NAO_DISPONIVEL\"]', '❌ *Infelizmente não temos passagens para {CIDADE_NOME}*\n\nMas não se preocupe! Você pode adquirir passagens para essa cidade através de outras viações parceiras:\n\n🚌 *Viações Recomendadas:*\n• Expresso Guanabara\n• Viação Útil\n• Real Expresso\n• Eucatur\n\nOu consulte nossos destinos disponíveis digitando *1*!\n\n*Destinos que atendemos:*\nSão Luís, Imperatriz, Brasília, Goiânia, Araguaína, Gurupi, Porto Nacional, Paraíso do Tocantins, Colinas do Tocantins, Barreiras, Luís Eduardo Magalhães, Teresina e Parnaíba!\n\nPosso ajudar com algo mais? 😊', 1, 6, '2025-08-16 18:48:20', '2025-08-16 18:48:20');

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
) ENGINE=MyISAM AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `contacts`
--

INSERT INTO `contacts` (`id`, `manager_id`, `phone_number`, `name`, `avatar`, `tags`, `notes`, `is_blocked`, `created_at`, `updated_at`) VALUES
(33, 2, '556392410056', 'Erick Vinicius', NULL, NULL, NULL, 0, '2025-08-19 16:51:07', '2025-08-19 16:51:07');

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
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=MyISAM AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `human_chats`
--

INSERT INTO `human_chats` (`id`, `manager_id`, `contact_id`, `operator_id`, `assigned_to`, `status`, `transfer_reason`, `transfer_from`, `transfer_to`, `tags`, `created_at`, `updated_at`) VALUES
(34, 2, 33, NULL, NULL, 'pending', 'Solicitação do cliente', NULL, NULL, NULL, '2025-08-19 16:58:37', '2025-08-19 16:58:37');

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
) ENGINE=MyISAM AUTO_INCREMENT=271 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `messages`
--

INSERT INTO `messages` (`id`, `manager_id`, `chat_id`, `contact_id`, `whatsapp_message_id`, `sender_type`, `sender_id`, `content`, `message_type`, `media_url`, `is_read`, `delivered_at`, `read_at`, `created_at`) VALUES
(268, 2, 34, 33, NULL, 'bot', NULL, '✅ *Excelente escolha! Temos passagens para São Luís - MA!*\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: São Luís - MA\n🕐 Horários disponíveis: Consulte digitando *2*\n\nPara finalizar sua compra, preciso de algumas informações:\n\n👤 *Nome completo*\n📱 *Telefone para contato*\n📅 *Data da viagem desejada*\n🆔 *CPF*\n\nOu se preferir, fale com nosso operador digitando *3*!\n\nVamos prosseguir? 😊🚌', 'text', NULL, 0, NULL, NULL, '2025-08-19 16:58:02'),
(267, 2, 34, 33, 'false_556392410056@c.us_3EB006A39F55C9154F99B9', 'contact', NULL, 'São Luís - MA', '', NULL, 0, NULL, NULL, '2025-08-19 16:57:56'),
(259, 2, 34, 33, 'false_556392410056@c.us_3EB0EE0F0D9052FF0BD88B', 'contact', NULL, 'Olá', '', NULL, 0, NULL, NULL, '2025-08-19 16:56:46'),
(260, 2, 34, 33, NULL, 'bot', NULL, '🚌 Olá! Erick Bem-vindo à *Viação Tocantins*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 'text', NULL, 0, NULL, NULL, '2025-08-19 16:56:52'),
(261, 2, 34, 33, 'false_556392410056@c.us_3EB0E4C64EE2D77C44E217', 'contact', NULL, '1', '', NULL, 0, NULL, NULL, '2025-08-19 16:56:58'),
(262, 2, 34, 33, NULL, 'bot', NULL, '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 'text', NULL, 0, NULL, NULL, '2025-08-19 16:57:04'),
(266, 2, 34, 33, NULL, 'bot', NULL, '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 'text', NULL, 0, NULL, NULL, '2025-08-19 16:57:48'),
(265, 2, 34, 33, 'false_556392410056@c.us_3EB038A7B530B87D73355A', 'contact', NULL, 'Erick Vinicius Rodrigues\n63981013083\n10/10/1986\n01758848111', '', NULL, 0, NULL, NULL, '2025-08-19 16:57:42'),
(264, 2, 34, 33, NULL, 'bot', NULL, '✅ *Excelente escolha! Temos passagens para São Luís - MA!*\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: São Luís - MA\n🕐 Horários disponíveis: Consulte digitando *2*\n\nPara finalizar sua compra, preciso de algumas informações:\n\n👤 *Nome completo*\n📱 *Telefone para contato*\n📅 *Data da viagem desejada*\n🆔 *CPF*\n\nOu se preferir, fale com nosso operador digitando *3*!\n\nVamos prosseguir? 😊🚌', 'text', NULL, 0, NULL, NULL, '2025-08-19 16:57:16'),
(263, 2, 34, 33, 'false_556392410056@c.us_3EB0D861FB8121D2032653', 'contact', NULL, 'São Luis', '', NULL, 0, NULL, NULL, '2025-08-19 16:57:10'),
(269, 2, 34, 33, 'false_556392410056@c.us_3EB00CF0E15420ABB0F744', 'contact', NULL, '3', '', NULL, 0, NULL, NULL, '2025-08-19 16:58:37'),
(270, 2, 34, 33, NULL, 'bot', NULL, '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 'text', NULL, 0, NULL, NULL, '2025-08-19 16:58:43');

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
('010_add_transfer_fields', 'Adicionar campos transfer_from, transfer_to e status transfer_pending para gerenciar transferências de conversas', '2025-08-18 23:51:27');

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
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_manager_id` (`manager_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `phone`, `avatar`, `is_active`, `email_verified_at`, `created_at`, `updated_at`) VALUES
(1, 'Administrador', 'admin@admin.com', '$2b$12$V8Jv4eB.SU2rwoqxeIhh5OuTOIEAAL.9xfbeL4O/kEO5od2Ah4G0y', 'admin', NULL, NULL, NULL, 1, NULL, '2025-08-15 19:17:56', '2025-08-15 19:17:56'),
(2, 'Erick Vinicius', 'erickafram08@gmail.com', '$2b$12$93H2dYM2cQ7dIOUL80GVzOuY2sDIT2v2Tk6UJGfyguBjug3q7IZ/2', 'manager', NULL, '63981013083', NULL, 1, NULL, '2025-08-15 19:38:11', '2025-08-15 19:38:11'),
(3, 'amanda campos', 'erickafram123@gmail.com', '$2b$12$OT.XGkz6MG0fToAveBvcwe3QFQK9Imh8oOaYdBFGuaVyIv1cO.8Ei', 'operator', 2, '63981013083', NULL, 1, NULL, '2025-08-16 17:33:41', '2025-08-16 17:33:41'),
(4, 'Mattiello', 'mattiello@gmail.com', '$2b$12$7c2UHrW86TC/CztraQyh9eS9zZCk06/tPOo61P50S9QWFtU9XP00S', 'operator', 2, '63981013083', NULL, 1, NULL, '2025-08-19 15:51:49', '2025-08-19 15:51:49');

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
) ENGINE=MyISAM AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `whatsapp_instances`
--

INSERT INTO `whatsapp_instances` (`id`, `manager_id`, `instance_name`, `phone_number`, `status`, `qr_code`, `session_data`, `webhook_url`, `is_active`, `connected_at`, `last_activity`, `created_at`, `updated_at`) VALUES
(57, 2, 'Instância Erick Vinicius', '556392901378', 'connected', 'data:image/png;base64,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laliqnij4qTijYoTlaliUpkqTiomlZOKSWWqmFROKk4qTlROKt6omFSmiknlNz2stdYlD2utdcnDWmtd8sNHFW9UTConFZPKVDGpvKHyRcWkMlVMKicVN6mcVEwqU8VUMalMFTepfKHyRcWkMlVMKm9UfKEyVZxU/KaHtda65GGttS55WGutS+wPPlA5qXhD5Y2KN1Smii9U3qh4Q+WLii9UTireUHmj4g2VNyq+UJkqTlROKiaVk4pJ5aTiNz2stdYlD2utdcnDWmtdYn/wgcpUMalMFZPKScWJyn+p4kTlpGJSOamYVKaKE5WpYlI5qThRmSomlTcq3lD5ouJE5Y2KN1TeqDhROam46WGttS55WGutSx7WWusS+4O/SOWLihOVqWJSuaniRGWqmFSmihOVNyomlZOKSeWmihOVk4pJ5YuKSeWk4jepnFRMKlPFGypTxRcPa611ycNaa13ysNZal9gf/CKVk4pJZao4UfmiYlKZKk5UTip+k8obFScqJxWTyknFicpUMalMFV+oTBWTylTxhspUMamcVHyhMlX8TQ9rrXXJw1prXfKw1lqX2B98oHJSMan8TRUnKm9UTConFZPKScWk8kbFicpvqjhReaPiC5WTihOV/yUVv+lhrbUueVhrrUse1lrrEvuD/5DKVPGGylRxovJGxW9SmSpOVE4qJpU3Kt5QOamYVN6omFSmiknlpOJEZao4UTmpOFGZKt5Q+aLipoe11rrkYa21LnlYa61LfrhMZaqYVN5QmSpOVKaKk4oTlZOK36TyRcWJyonKVHFSMalMFScqb6hMFScqU8VUMalMFVPFpDKpfKEyVbxRcaIyVXzxsNZalzystdYlD2utdYn9wX9IZap4Q+WNihOVk4rfpHJSMalMFScqJxVvqPxLKt5QuaniROWk4g2VqeJE5aTii4e11rrkYa21LnlYa61LfvhI5SaVLypOVG5SOal4o2JSmVR+k8oXFScqb1RMKlPFicpJxaQyVUwqb6i8ofKFyknFpHLTw1prXfKw1lqXPKy11iU/fFRxojJVTCpTxYnK31RxUnGiMlVMKicVk8qJyknFpHJSMan8poqTihOV31RxojJVTCpTxRsqU8Wk8kbFTQ9rrXXJw1prXfKw1lqX2B98oHJSMalMFZPKScWkMlVMKlPFpPJGxaRyU8WkMlVMKl9UTCpTxRcq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', NULL, NULL, 1, '2025-08-19 16:56:34', '2025-08-19 16:58:37', '2025-08-19 16:56:11', '2025-08-19 16:58:37');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
