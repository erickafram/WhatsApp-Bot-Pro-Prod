-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 19/08/2025 às 03:56
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
(41, 8, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\"]', '🚌 Olá! {name} Bem-vindo à *Viação Palmas*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 1, '2025-08-16 15:25:26', '2025-08-16 15:25:26'),
(42, 8, '[\"1\", \"comprar\", \"passagem\", \"bilhete\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 1, 2, '2025-08-16 15:25:26', '2025-08-16 15:25:26'),
(43, 8, '[\"2\", \"horários\", \"horario\", \"hora\"]', '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫', 1, 3, '2025-08-16 15:25:26', '2025-08-16 15:25:26'),
(44, 8, '[\"3\", \"operador\", \"atendente\", \"humano\", \"pessoa\"]', '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 1, 4, '2025-08-16 15:25:26', '2025-08-16 15:25:26'),
(45, 8, '[\"CIDADE_DISPONIVEL\"]', '✅ *Excelente escolha! Temos passagens para {CIDADE_NOME}!*\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: {CIDADE_NOME}\n🕐 Horários disponíveis: Consulte digitando *2*\n\nPara finalizar sua compra, preciso de algumas informações:\n\n👤 *Nome completo*\n📱 *Telefone para contato*\n📅 *Data da viagem desejada*\n🆔 *CPF*\n\nOu se preferir, fale com nosso operador digitando *3*!\n\nVamos prosseguir? 😊🚌', 1, 5, '2025-08-16 15:25:26', '2025-08-16 15:25:26'),
(46, 8, '[\"CIDADE_NAO_DISPONIVEL\"]', '❌ *Infelizmente não temos passagens para {CIDADE_NOME}*\n\nMas não se preocupe! Você pode adquirir passagens para essa cidade através de outras viações parceiras:\n\n🚌 *Viações Recomendadas:*\n• Expresso Guanabara\n• Viação Útil\n• Real Expresso\n• Eucatur\n\nOu consulte nossos destinos disponíveis digitando *1*!\n\n*Destinos que atendemos:*\nSão Luís, Imperatriz, Brasília, Goiânia, Araguaína, Gurupi, Porto Nacional, Paraíso do Tocantins, Colinas do Tocantins, Barreiras, Luís Eduardo Magalhães, Teresina e Parnaíba!\n\nPosso ajudar com algo mais? 😊', 1, 6, '2025-08-16 15:25:26', '2025-08-16 15:25:26'),
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
) ENGINE=MyISAM AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `contacts`
--

INSERT INTO `contacts` (`id`, `manager_id`, `phone_number`, `name`, `avatar`, `tags`, `notes`, `is_blocked`, `created_at`, `updated_at`) VALUES
(25, 2, '556392410056', 'Erick Vinicius', NULL, NULL, NULL, 0, '2025-08-19 03:40:02', '2025-08-19 03:40:02');

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
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=MyISAM AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `human_chats`
--

INSERT INTO `human_chats` (`id`, `manager_id`, `contact_id`, `operator_id`, `assigned_to`, `status`, `transfer_reason`, `transfer_from`, `transfer_to`, `tags`, `created_at`, `updated_at`) VALUES
(26, 2, 25, NULL, 3, 'active', 'Solicitação do cliente', NULL, NULL, NULL, '2025-08-19 03:40:15', '2025-08-19 03:55:24');

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
) ENGINE=MyISAM AUTO_INCREMENT=187 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `messages`
--

INSERT INTO `messages` (`id`, `manager_id`, `chat_id`, `contact_id`, `whatsapp_message_id`, `sender_type`, `sender_id`, `content`, `message_type`, `media_url`, `is_read`, `delivered_at`, `read_at`, `created_at`) VALUES
(183, 2, 26, 25, NULL, 'operator', 2, 'opa', 'text', NULL, 0, NULL, NULL, '2025-08-19 03:55:05'),
(184, 2, 26, 25, NULL, 'operator', 3, 'olá', 'text', NULL, 0, NULL, NULL, '2025-08-19 03:55:31'),
(185, 2, 26, 25, NULL, 'operator', 3, 'como posso ajudar', 'text', NULL, 0, NULL, NULL, '2025-08-19 03:55:58'),
(186, 2, 26, 25, 'false_556392410056@c.us_3EB018A14F187D18B3C939', 'contact', NULL, 'olá', '', NULL, 0, NULL, NULL, '2025-08-19 03:56:09'),
(182, 2, 26, 25, 'false_556392410056@c.us_3EB0C797E2670C43369642', 'contact', NULL, 'quero falar com operador', '', NULL, 0, NULL, NULL, '2025-08-19 03:54:52'),
(174, 2, 26, 25, NULL, 'operator', 2, 'boa noite', 'text', NULL, 0, NULL, NULL, '2025-08-19 03:40:56'),
(175, 2, 26, 25, 'false_556392410056@c.us_3EB0941399A142A50BF1BD', 'contact', NULL, 'Boa noite', '', NULL, 0, NULL, NULL, '2025-08-19 03:41:03'),
(176, 2, 26, 25, 'false_556392410056@c.us_3EB0C39F85EB7BC059198A', 'contact', NULL, 'gostaria de comprar passagem', '', NULL, 0, NULL, NULL, '2025-08-19 03:41:07'),
(177, 2, 26, 25, NULL, 'operator', 2, 'certo', 'text', NULL, 0, NULL, NULL, '2025-08-19 03:41:18'),
(178, 2, 26, 25, NULL, 'operator', 2, 'vou transferir para um operador sua mensagem ok', 'text', NULL, 0, NULL, NULL, '2025-08-19 03:41:39'),
(179, 2, 26, 25, NULL, 'operator', 3, 'Boa noite', 'text', NULL, 0, NULL, NULL, '2025-08-19 03:42:28'),
(180, 2, 26, 25, 'false_556392410056@c.us_3EB00F978F613C509190D1', 'contact', NULL, 'boa noite', '', NULL, 0, NULL, NULL, '2025-08-19 03:42:59'),
(181, 2, 26, 25, 'false_556392410056@c.us_3EB04B52A2BABDE33937F5', 'contact', NULL, 'olá', '', NULL, 0, NULL, NULL, '2025-08-19 03:54:42'),
(173, 2, 26, 25, NULL, 'operator', 2, 'Olá', 'text', NULL, 0, NULL, NULL, '2025-08-19 03:40:54'),
(172, 2, 26, 25, NULL, 'bot', NULL, '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 'text', NULL, 0, NULL, NULL, '2025-08-19 03:40:21'),
(170, 2, 26, 25, NULL, 'bot', NULL, '🚌 Olá! Erick Bem-vindo à *Viação Palmas*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 'text', NULL, 0, NULL, NULL, '2025-08-19 03:40:12'),
(171, 2, 26, 25, 'false_556392410056@c.us_3EB0CEC46D5117A8908A00', 'contact', NULL, '3', '', NULL, 0, NULL, NULL, '2025-08-19 03:40:15'),
(167, 2, 26, 25, 'false_556392410056@c.us_3EB00D5D61F4987B5A9EB8', 'contact', NULL, 'Olá', '', NULL, 0, NULL, NULL, '2025-08-19 03:40:02'),
(168, 2, 26, 25, 'false_556392410056@c.us_3EB05345311790E6A4138C', 'contact', NULL, 'Boa noite', '', NULL, 0, NULL, NULL, '2025-08-19 03:40:06'),
(169, 2, 26, 25, NULL, 'bot', NULL, '🚌 Olá! Erick Bem-vindo à *Viação Palmas*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 'text', NULL, 0, NULL, NULL, '2025-08-19 03:40:08');

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
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `manager_id`, `phone`, `avatar`, `is_active`, `email_verified_at`, `created_at`, `updated_at`) VALUES
(1, 'Administrador', 'admin@admin.com', '$2b$12$V8Jv4eB.SU2rwoqxeIhh5OuTOIEAAL.9xfbeL4O/kEO5od2Ah4G0y', 'admin', NULL, NULL, NULL, 1, NULL, '2025-08-15 19:17:56', '2025-08-15 19:17:56'),
(2, 'Erick Vinicius', 'erickafram08@gmail.com', '$2b$12$93H2dYM2cQ7dIOUL80GVzOuY2sDIT2v2Tk6UJGfyguBjug3q7IZ/2', 'manager', NULL, '63981013083', NULL, 1, NULL, '2025-08-15 19:38:11', '2025-08-15 19:38:11'),
(3, 'amanda campos', 'erickafram123@gmail.com', '$2b$12$OT.XGkz6MG0fToAveBvcwe3QFQK9Imh8oOaYdBFGuaVyIv1cO.8Ei', 'operator', 2, '63981013083', NULL, 1, NULL, '2025-08-16 17:33:41', '2025-08-16 17:33:41');

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
) ENGINE=MyISAM AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `whatsapp_instances`
--

INSERT INTO `whatsapp_instances` (`id`, `manager_id`, `instance_name`, `phone_number`, `status`, `qr_code`, `session_data`, `webhook_url`, `is_active`, `connected_at`, `last_activity`, `created_at`, `updated_at`) VALUES
(47, 2, 'Instância Erick Vinicius', '556392901378', 'connected', 'data:image/png;base64,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', NULL, NULL, 1, '2025-08-19 03:54:26', '2025-08-19 03:56:08', '2025-08-19 03:54:04', '2025-08-19 03:56:08'),
(46, 2, 'Instância Erick Vinicius', '556392901378', 'connecting', 'data:image/png;base64,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', NULL, NULL, 1, '2025-08-19 03:39:20', '2025-08-19 03:42:58', '2025-08-19 03:38:46', '2025-08-19 03:51:09');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
