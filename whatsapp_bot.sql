-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 20/08/2025 às 04:01
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
(41, 8, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\"]', '🚌 Olá! {name} Bem-vindo à *Viação Tocantins*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 0, '2025-08-16 15:25:26', '2025-08-20 03:59:18'),
(42, 8, '[\"1\", \"comprar\", \"passagem\", \"bilhete\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 1, 0, '2025-08-16 15:25:26', '2025-08-20 03:59:18'),
(43, 8, '[\"2\", \"horários\", \"horario\", \"hora\"]', '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫', 1, 0, '2025-08-16 15:25:26', '2025-08-20 03:59:18'),
(44, 8, '[\"3\", \"operador\", \"atendente\", \"humano\", \"pessoa\"]', '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 1, 0, '2025-08-16 15:25:26', '2025-08-20 03:59:18'),
(45, 8, '[\"CIDADE_DISPONIVEL\"]', '✅ *Excelente escolha! Temos passagens para {CIDADE_NOME}!*\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: {CIDADE_NOME}\n🕐 Horários disponíveis: Consulte digitando *2*\n\nPara finalizar sua compra, preciso de algumas informações:\n\n👤 *Nome completo*\n📱 *Telefone para contato*\n📅 *Data da viagem desejada*\n🆔 *CPF*\n\nOu se preferir, fale com nosso operador digitando *3*!\n\nVamos prosseguir? 😊🚌', 1, 0, '2025-08-16 15:25:26', '2025-08-20 03:59:18'),
(46, 8, '[\"CIDADE_NAO_DISPONIVEL\"]', '❌ *Infelizmente não temos passagens para {CIDADE_NOME}*\n\nMas não se preocupe! Você pode adquirir passagens para essa cidade através de outras viações parceiras:\n\n🚌 *Viações Recomendadas:*\n• Expresso Guanabara\n• Viação Útil\n• Real Expresso\n• Eucatur\n\nOu consulte nossos destinos disponíveis digitando *1*!\n\n*Destinos que atendemos:*\nSão Luís, Imperatriz, Brasília, Goiânia, Araguaína, Gurupi, Porto Nacional, Paraíso do Tocantins, Colinas do Tocantins, Barreiras, Luís Eduardo Magalhães, Teresina e Parnaíba!\n\nPosso ajudar com algo mais? 😊', 1, 0, '2025-08-16 15:25:26', '2025-08-20 03:59:18'),
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
) ENGINE=MyISAM AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `contacts`
--

INSERT INTO `contacts` (`id`, `manager_id`, `phone_number`, `name`, `avatar`, `tags`, `notes`, `is_blocked`, `created_at`, `updated_at`) VALUES
(34, 2, '556392410056', 'Erick Vinicius', NULL, NULL, NULL, 0, '2025-08-20 02:05:29', '2025-08-20 02:05:29');

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

--
-- Despejando dados para a tabela `devices`
--

INSERT INTO `devices` (`id`, `manager_id`, `whatsapp_instance_id`, `device_name`, `device_type`, `device_model`, `os_name`, `os_version`, `browser_name`, `browser_version`, `ip_address`, `user_agent`, `screen_resolution`, `timezone`, `language`, `whatsapp_status`, `whatsapp_phone`, `status`, `is_trusted`, `is_primary`, `last_activity`, `location_data`, `device_fingerprint`, `session_token`, `push_token`, `metadata`, `created_at`, `updated_at`) VALUES
(16, 2, 62, 'Instância Erick Vinicius', 'smartphone', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'connecting', '556392901378', 'idle', 0, 0, '2025-08-20 03:47:52', NULL, NULL, NULL, NULL, NULL, '2025-08-20 03:49:19', '2025-08-20 03:50:21');

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
) ENGINE=MyISAM AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `human_chats`
--

INSERT INTO `human_chats` (`id`, `manager_id`, `contact_id`, `operator_id`, `assigned_to`, `status`, `transfer_reason`, `transfer_from`, `transfer_to`, `tags`, `created_at`, `updated_at`) VALUES
(37, 2, 34, NULL, 2, 'finished', 'Solicitação do cliente', NULL, NULL, NULL, '2025-08-20 03:47:52', '2025-08-20 04:00:20');

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
) ENGINE=MyISAM AUTO_INCREMENT=311 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `messages`
--

INSERT INTO `messages` (`id`, `manager_id`, `chat_id`, `contact_id`, `whatsapp_message_id`, `sender_type`, `sender_id`, `content`, `message_type`, `media_url`, `is_read`, `delivered_at`, `read_at`, `created_at`) VALUES
(309, 2, 37, 34, 'false_556392410056@c.us_3EB0B3A7CF6E535F4F2109', 'contact', NULL, '3', '', NULL, 0, NULL, NULL, '2025-08-20 03:47:52'),
(307, 2, 37, 34, 'false_556392410056@c.us_3EB0FFC1C52E91D10D47EF', 'contact', NULL, '2', '', NULL, 0, NULL, NULL, '2025-08-20 03:47:37'),
(308, 2, 37, 34, NULL, 'bot', NULL, '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫', 'text', NULL, 0, NULL, NULL, '2025-08-20 03:47:43'),
(305, 2, 37, 34, 'false_556392410056@c.us_3EB07BA05EDC6E5FB8AF6A', 'contact', NULL, 'Barreiras', '', NULL, 0, NULL, NULL, '2025-08-20 03:47:15'),
(306, 2, 37, 34, NULL, 'bot', NULL, '✅ *Excelente escolha! Temos passagens para Barreiras - BA!*\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: Barreiras - BA\n🕐 Horários disponíveis: Consulte digitando *2*\n\nPara finalizar sua compra, preciso de algumas informações:\n\n👤 *Nome completo*\n📱 *Telefone para contato*\n📅 *Data da viagem desejada*\n🆔 *CPF*\n\nOu se preferir, fale com nosso operador digitando *3*!\n\nVamos prosseguir? 😊🚌', 'text', NULL, 0, NULL, NULL, '2025-08-20 03:47:22'),
(310, 2, 37, 34, NULL, 'bot', NULL, '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 'text', NULL, 0, NULL, NULL, '2025-08-20 03:47:58'),
(303, 2, 37, 34, 'false_556392410056@c.us_3EB03A7E73695ECDD64A76', 'contact', NULL, '1', '', NULL, 0, NULL, NULL, '2025-08-20 03:45:01'),
(304, 2, 37, 34, NULL, 'bot', NULL, '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 'text', NULL, 0, NULL, NULL, '2025-08-20 03:45:07'),
(301, 2, 37, 34, 'false_556392410056@c.us_3EB04FDA24EC0B0DFF52EB', 'contact', NULL, 'Olá', '', NULL, 0, NULL, NULL, '2025-08-20 03:44:51'),
(302, 2, 37, 34, NULL, 'bot', NULL, '🚌 Olá! Erick Bem-vindo à *Viação Tocantins*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 'text', NULL, 0, NULL, NULL, '2025-08-20 03:44:57');

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
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `phone`, `avatar`, `is_active`, `email_verified_at`, `created_at`, `updated_at`, `last_login`) VALUES
(1, 'Administrador', 'admin@admin.com', '$2b$12$V8Jv4eB.SU2rwoqxeIhh5OuTOIEAAL.9xfbeL4O/kEO5od2Ah4G0y', 'admin', NULL, NULL, NULL, 1, NULL, '2025-08-15 19:17:56', '2025-08-15 19:17:56', NULL),
(2, 'Erick Vinicius', 'erickafram08@gmail.com', '$2b$12$93H2dYM2cQ7dIOUL80GVzOuY2sDIT2v2Tk6UJGfyguBjug3q7IZ/2', 'manager', NULL, '63981013083', NULL, 1, NULL, '2025-08-15 19:38:11', '2025-08-15 19:38:11', NULL),
(3, 'amanda campos', 'erickafram123@gmail.com', '$2b$12$OT.XGkz6MG0fToAveBvcwe3QFQK9Imh8oOaYdBFGuaVyIv1cO.8Ei', 'operator', 2, '63981013083', NULL, 1, NULL, '2025-08-16 17:33:41', '2025-08-16 17:33:41', NULL),
(4, 'Mattiello', 'mattiello@gmail.com', '$2b$12$7c2UHrW86TC/CztraQyh9eS9zZCk06/tPOo61P50S9QWFtU9XP00S', 'operator', 2, '63981013083', NULL, 1, NULL, '2025-08-19 15:51:49', '2025-08-19 15:51:49', NULL);

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
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `session_token`, `refresh_token`, `expires_at`, `created_at`, `updated_at`, `ip_address`, `user_agent`, `is_active`) VALUES
(1, 2, '408ccc107db08467817fd095a05bf00fb7b81134ff90db8e701894e066326261', 'c83f34b2623a50cc3b8070c0033daf3589d40e69c2220f87e5dc7891bbdbcc80', '2025-08-21 01:00:56', '2025-08-20 01:00:56', '2025-08-20 01:01:07', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 1);

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
) ENGINE=MyISAM AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `whatsapp_instances`
--

INSERT INTO `whatsapp_instances` (`id`, `manager_id`, `instance_name`, `phone_number`, `status`, `qr_code`, `session_data`, `webhook_url`, `is_active`, `connected_at`, `last_activity`, `created_at`, `updated_at`) VALUES
(62, 2, 'Instância Erick Vinicius', '556392901378', 'connecting', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARQAAAEUCAYAAADqcMl5AAAAAklEQVR4AewaftIAABI5SURBVO3BQY7gRhLAQFLo/3+ZO8c8FSCoeuw1MsL+YK21LnhYa61LHtZa65KHtda65GGttS55WGutSx7WWuuSh7XWuuRhrbUueVhrrUse1lrrkoe11rrkYa21LnlYa61LHtZa65KHtda65IePVP6mijdUpoo3VKaKSeWkYlKZKiaVk4pJZap4Q+WkYlKZKiaVqeINlaliUvmi4iaVk4pJ5aRiUvmbKr54WGutSx7WWuuSh7XWuuSHyypuUrlJZaqYVE5UpopJZVKZKt6oOKk4UflCZao4qZhU3qiYVKaKN1QmlaliUpkqJpV/UsVNKjc9rLXWJQ9rrXXJw1prXfLDL1N5o+INlaliqnijYlJ5o+INlaliUrmpYlJ5Q2WqmFTeqJhUpopJZaqYVKaKSWVSOVF5o2JS+U0qb1T8poe11rrkYa21LnlYa61LfviPUZkqJpU3KiaVSWWqmFSmijcqJpU3Kk4qJpWp4o2KN1TeqDipmFROKiaVqWJSOVE5qZhU/kse1lrrkoe11rrkYa21LvnhP07lpGJSOal4o2JSOVF5o+ILlROVLyomld+kclJxUnFS8YbKpDJV/Jc8rLXWJQ9rrXXJw1prXfLDL6v4N6k4qThReaPiN6lMFScqJxVvqEwVk8pU8YbKScVUMamcqEwVk8pU8UXFTRX/Jg9rrXXJw1prXfKw1lqX/HCZyj+pYlI5UZkqJpWpYlKZKiaVqWJSmSomlaliUjlRmSomlROVqeImlanipGJSmSr+JpWp4g2VqeJE5d/sYa21LnlYa61LHtZa65IfPqr4f1YxqUwVk8pU8YbKGxWTyonKVDGpvFHxRcU/qWJSOVGZKiaVqeINlanipOL/ycNaa13ysNZalzystdYl9gcfqEwVk8pNFScqv6liUpkqTlROKiaVk4pJZao4Ufk3qZhUTipOVE4qJpUvKk5UTiomlZsqftPDWmtd8rDWWpc8rLXWJfYHF6lMFZPKGxVfqEwVk8pUMalMFScqX1R8oXJSMalMFZPKVDGpTBUnKm9UTCpfVHyhMlVMKlPFpDJVTConFScqb1Tc9LDWWpc8rLXWJQ9rrXXJD5dVTCpvVEwqv6niDZWp4qRiUpkqvlCZKt6omFSmikllqphUporfVDGpvKFyUvE3VUwqJyonFScqU8UXD2utdcnDWmtd8rDWWpf8cJnKScWkclLxhsoXKm+onKhMFScqJxUnKicVb6i8UfFGxd+kMlV8oTJVvKEyVfwmld/0sNZalzystdYlD2utdckPH6mcVEwqU8Wk8kbFVPFFxU0qk8rfVDGpTBVTxaQyVbyhMlVMKlPFScUbFZPKicpU8YXKVPGFylRxojJV/KaHtda65GGttS55WGutS+wPfpHKVDGpnFRMKm9UTConFScqJxWTyknFpPJFxd+kMlW8oXJSMalMFZPKScWkclLxN6m8UTGpTBWTylRx08Naa13ysNZalzystdYl9gd/kcpUcaJyUjGpnFRMKlPFpDJVTCpTxRcqU8UXKlPFpDJVTConFZPKVPGFylRxovJGxYnKScWkclLxhspUMalMFW+oTBVfPKy11iUPa611ycNaa11if/CByknFTSonFZPKVPGGylQxqZxUTCpTxRcqJxVvqNxUcaIyVbyhMlX8JpWpYlKZKiaVqWJSeaPiC5Wp4ouHtda65GGttS55WGutS+wPLlL5omJSmSpOVKaKE5UvKr5QOak4UZkq/iaVqWJSeaNiUpkqvlCZKiaVqeJE5Y2KN1ROKiaVqWJSOan44mGttS55WGutSx7WWuuSHz5SOak4UZlUpopJ5aTijYpJZaqYVE5UpopJ5aRiUjmpmFTeqHhD5URlqnhDZaqYVKaKSeWk4qTijYpJZap4Q+Wk4qaKmx7WWuuSh7XWuuRhrbUu+eGyijcqTlSmikllUvmi4v+JylRxonKiMlVMFScqk8pUMamcqLxRMalMKlPFpDJVvFHxRcWkMqlMFScqU8WkMlV88bDWWpc8rLXWJQ9rrXWJ/cEHKm9UTCpTxRsqv6liUpkqTlS+qHhDZar4QuWkYlL5ouJEZaqYVH5TxaRyU8WkMlV8oTJV3PSw1lqXPKy11iUPa611yQ+XVUwqb6icVEwVk8obFZPKpHKiMlVMFScqU8UXFScqU8WkMlVMKicVJypvqEwVb1TcpPJFxaRyUjGpTBWTylTxNz2stdYlD2utdcnDWmtd8sMvq5hUpoqbKiaVLyomlS9UpopJZao4UTmpmCq+qPhNKlPFicqJyknFGxWTyknFpDJVTConFScV/6SHtda65GGttS55WGutS+wPLlI5qThReaPiROWk4kTlpOJvUjmp+E0qU8UbKl9UnKhMFW+oTBWTylQxqZxUvKEyVUwqJxUnKlPFFw9rrXXJw1prXfKw1lqX2B98oHJSMamcVJyonFS8oXJSMam8UTGp3FRxonJSMalMFZPKScWkMlVMKlPFpDJVnKi8UfGGyk0VJyonFW+oTBU3Pay11iUPa611ycNaa11if3CRyknFicobFScqU8WJyhsVJyonFZPKVDGpnFTcpDJVTCpTxYnKScWkMlV8oTJVTCpfVLyhclIxqUwVJypTxaQyVXzxsNZalzystdYlD2utdYn9wT9IZaq4SWWqOFGZKiaVqeJE5aTiC5WpYlI5qbhJZao4UZkqvlA5qZhUpoo3VE4qJpWpYlL5omJSOam46WGttS55WGutSx7WWusS+4OLVE4qTlROKiaVqWJS+TereEPljYpJZaqYVP6miknlpOImld9UcaLyRsUXKicVXzystdYlD2utdcnDWmtdYn/wF6lMFW+oTBWTyhcVb6icVEwqX1RMKm9UvKEyVUwqJxW/SeWNijdUpopJZaqYVE4qTlROKiaVqWJSOan44mGttS55WGutSx7WWusS+4NfpPJvUjGpTBUnKlPFFypvVEwqJxUnKjdVTCq/qWJSeaPiROWNihOVf1LFb3pYa61LHtZa65KHtda65IfLVE4qJpWp4g2VN1ROVE4qJpWp4kTlpOJE5QuVk4o3VE4qJpU3KiaVLyomlaliqjhRmVSmijcq3lA5qThRmSq+eFhrrUse1lrrkoe11rrkh79M5Q2VqeKNii9UJpWp4kRlqphUJpWp4qTiN6lMFV9UnKicVEwqU8WkclIxqXxRMalMFZPKicpU8YXKb3pYa61LHtZa65KHtda65IePVKaKSWWqmFROKt6omFSmikllqpgqTlROKiaVk4ovVKaKLyreUJkqvlA5qTipOFE5qThRmVSmiknljYo3Kk4qftPDWmtd8rDWWpc8rLXWJT/8soo3VL5QOVH5TRWTyknFpDJVnKhMFV+ofFFxovJGxRcqJxWTyonKScWk8obKFypfVHzxsNZalzystdYlD2utdYn9wQcqU8WkMlWcqEwVk8pU8YbKGxU3qUwVJyo3VUwqJxWTyknFGyonFZPKVDGpnFR8ofJGxRsqb1R8oTJVfPGw1lqXPKy11iUPa611if3BBypTxYnKb6p4Q2WqmFSmikllqjhRmSpOVE4q3lD5myreUPmi4g2V31QxqXxRMancVPHFw1prXfKw1lqXPKy11iX2B79IZar4QuWNihOVqWJSOal4Q+WkYlKZKk5Ubqr4QuWk4guVNyp+k8pJxRsqJxVvqJxUfPGw1lqXPKy11iUPa611yQ+XqbyhMlVMKm9UTCpTxU0qJxVTxRsVX1S8oTKpTBWTylRxUjGpvFExVUwqJypTxRsqJxUnKlPFTSonFb/pYa21LnlYa61LHtZa65IfflnFFxUnKicVk8pU8UXFpHKiclJxonJS8YbKVDGpfFFxUjGpTBX/JhUnKlPFVHGiclPF3/Sw1lqXPKy11iUPa611if3BByr/pIoTlaniRGWqmFSmihOVLypOVL6omFROKt5QmSomlaniC5WTihOVk4oTld9UcaIyVUwqU8VND2utdcnDWmtd8rDWWpfYH1ykclLxm1S+qHhD5Y2KSWWquEllqnhD5aTiDZWp4iaVNyomlaniRGWqmFS+qPhNKlPFFw9rrXXJw1prXfKw1lqX/PCRylQxqXyhMlVMKlPFpDJVTConKlPFGxVfqEwVk8pNKicVk8obFZPKVDGpTBUnFZPKGxWTym+qmFQmlaliUnmj4jc9rLXWJQ9rrXXJw1prXWJ/8IHKVHGiclJxonJSMal8UXGi8kbFicobFV+oTBUnKlPFGyonFTepnFTcpDJVnKicVEwqU8Wk8kbFTQ9rrXXJw1prXfKw1lqX/PBRxW9SmSreqJhUTiomlanipGJSOVF5o+INlTdUpoqbKk5Ubqo4UTmpmFROKm5S+aLiRGWq+OJhrbUueVhrrUse1lrrEvuD/yMqU8UbKlPF36RyUjGpnFRMKn9TxYnKVPGFyhsVk8pvqphUbqr4N3tYa61LHtZa65KHtda65IfLVKaKSeVvUnlDZaqYVKaKNypOVE4qJpWTikllqjhReUNlqphUvqh4Q+WkYlK5qWJSOak4UZkqJpWp4m96WGutSx7WWuuSh7XWuuSHj1Smipsq3lD5TRUnKlPFpDJVnFRMKjepTBVTxaQyqbxRcaIyVbyhclJxUnGicqIyVZxUTCpfVEwqb1R88bDWWpc8rLXWJQ9rrXXJDx9VnKhMFW+ovFHxN6lMFZPKVPGbKiaVqeINlaliUpkqJpWpYlI5UblJ5Y2KqeINlaliUrlJZaqYVH7Tw1prXfKw1lqXPKy11iU/fKQyVbyhclJxojKpTBUnKlPFGxWTym+qmFROKk5U3lCZKk4qJpWp4g2VNyomlZOKSWWqOFF5o+JE5aaKSeWmh7XWuuRhrbUueVhrrUt++MtUTiomlZOKSWVSmSpOVE4qTipOVE4qJpWpYqqYVKaKNyomlTdUTiomlaliUpkq3lA5qZhUpopJ5aTiRGWqeKNiUpkqJpW/6WGttS55WGutSx7WWusS+4O/SOWk4kTlpGJSeaNiUpkqJpWTikllqphUpooTlTcqTlROKiaVk4o3VKaKSWWqmFROKr5QmSpuUpkqJpWpYlI5qZhUpoovHtZa65KHtda65GGttS6xP/hFKjdV3KQyVUwqX1R8oTJVTCpfVEwqJxVvqJxUTCpTxYnKFxWTyknFpDJVTCr/Tyq+eFhrrUse1lrrkoe11rrkh49U3qiYVKaKL1SmipOKSeU3qXyhMlVMKlPFpDKpTBV/k8pUMancVPGFylQxqUwVJypvVHyh8pse1lrrkoe11rrkYa21LrE/+EDli4oTlaliUpkq3lCZKk5Upoo3VKaKE5WTii9UflPFpPJGxRsqU8WkMlVMKlPFpHJScaLymyomlTcqvnhYa61LHtZa65KHtda65IePKn5TxW+q+E0qU8UbFScqU8Wk8kbFGypTxUnFpPKFyonKVDGpTBVvVLxRMalMFW+ovFHxmx7WWuuSh7XWuuRhrbUu+eEjlb+pYqo4UXmjYlKZKiaVqeILlX8TlaniROWLiknlpOImlZOKE5WTijdUpooTlaliUjmp+OJhrbUueVhrrUse1lrrkh8uq7hJ5URlqvhC5QuVN1ROKk5U3qiYVE4qvqiYVKaKL1Smiknli4oTlanipoqbKn7Tw1prXfKw1lqXPKy11iU//DKVNyq+UJkq3lCZKiaVqeINlaniRGWqmComlaliUjlR+aLipGJSeaPiROWNihOVL1TeUPmiYlKZKn7Tw1prXfKw1lqXPKy11iU//MdUnKhMFW9UTCpTxUnFpHJSMamcVEwqJxWTyhsVb6icVPymikllqpgqJpWpYlKZKk5Uvqg4qThRmSq+eFhrrUse1lrrkoe11rrkh/8YlaniN1VMKlPFTRWTyknFpDKpTBWTylRxojJVvKFyU8UbKicVJxUnKlPFGyr/Zg9rrXXJw1prXfKw1lqX/PDLKn5TxaQyqUwVk8qJyhsVk8pU8ZtUpoqp4o2KE5UvKk5UTireUJkq3lCZKt6oOFF5Q2Wq+Cc9rLXWJQ9rrXXJw1prXfLDZSp/k8oXFV+oTConKlPFGyonFTepnFRMKm+oTBVTxRsqX6hMFVPFpDJVTCpTxUnFpPKFyt/0sNZalzystdYlD2utdYn9wVprXfCw1lqXPKy11iUPa611ycNaa13ysNZalzystdYlD2utdcnDWmtd8rDWWpc8rLXWJQ9rrXXJw1prXfKw1lqXPKy11iUPa611yf8AmDWfTg7s+L4AAAAASUVORK5CYII=', NULL, NULL, 1, '2025-08-20 03:44:42', '2025-08-20 03:47:52', '2025-08-20 03:44:03', '2025-08-20 03:50:02');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
