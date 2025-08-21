-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 21/08/2025 às 16:58
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
) ENGINE=MyISAM AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(41, 8, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\"]', '🚌 Olá! {name} Bem-vindo à *Viação Tocantins*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 0, '2025-08-16 15:25:26', '2025-08-21 16:48:16'),
(42, 8, '[\"1\", \"comprar\", \"passagem\", \"bilhete\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 1, 0, '2025-08-16 15:25:26', '2025-08-21 16:48:16'),
(43, 8, '[\"2\", \"horários\", \"horario\", \"hora\"]', '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫', 1, 0, '2025-08-16 15:25:26', '2025-08-21 16:48:16'),
(44, 8, '[\"3\", \"operador\", \"atendente\", \"humano\", \"pessoa\"]', '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 1, 0, '2025-08-16 15:25:26', '2025-08-21 16:48:16'),
(45, 8, '[\"CIDADE_DISPONIVEL\"]', '✅ *Excelente escolha! Temos passagens para {CIDADE_NOME}!*\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: {CIDADE_NOME}\n🕐 Horários disponíveis: Consulte digitando *2*\n\nPara finalizar sua compra, preciso de algumas informações:\n\n👤 *Nome completo*\n📱 *Telefone para contato*\n📅 *Data da viagem desejada*\n🆔 *CPF*\n\nOu se preferir, fale com nosso operador digitando *3*!\n\nVamos prosseguir? 😊🚌', 1, 0, '2025-08-16 15:25:26', '2025-08-21 16:48:16'),
(46, 8, '[\"CIDADE_NAO_DISPONIVEL\"]', '❌ *Infelizmente não temos passagens para {CIDADE_NOME}*\n\nMas não se preocupe! Você pode adquirir passagens para essa cidade através de outras viações parceiras:\n\n🚌 *Viações Recomendadas:*\n• Expresso Guanabara\n• Viação Útil\n• Real Expresso\n• Eucatur\n\nOu consulte nossos destinos disponíveis digitando *1*!\n\n*Destinos que atendemos:*\nSão Luís, Imperatriz, Brasília, Goiânia, Araguaína, Gurupi, Porto Nacional, Paraíso do Tocantins, Colinas do Tocantins, Barreiras, Luís Eduardo Magalhães, Teresina e Parnaíba!\n\nPosso ajudar com algo mais? 😊', 1, 0, '2025-08-16 15:25:26', '2025-08-21 16:48:16'),
(47, 9, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\"]', '🚌 Olá! {name} Bem-vindo à *Viação Palmas*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 1, '2025-08-16 18:48:20', '2025-08-16 18:48:20'),
(48, 9, '[\"1\", \"comprar\", \"passagem\", \"bilhete\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 1, 2, '2025-08-16 18:48:20', '2025-08-16 18:48:20'),
(49, 9, '[\"2\", \"horários\", \"horario\", \"hora\"]', '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫', 1, 3, '2025-08-16 18:48:20', '2025-08-16 18:48:20'),
(50, 9, '[\"3\", \"operador\", \"atendente\", \"humano\", \"pessoa\"]', '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 1, 4, '2025-08-16 18:48:20', '2025-08-16 18:48:20'),
(51, 9, '[\"CIDADE_DISPONIVEL\"]', '✅ *Excelente escolha! Temos passagens para {CIDADE_NOME}!*\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: {CIDADE_NOME}\n🕐 Horários disponíveis: Consulte digitando *2*\n\nPara finalizar sua compra, preciso de algumas informações:\n\n👤 *Nome completo*\n📱 *Telefone para contato*\n📅 *Data da viagem desejada*\n🆔 *CPF*\n\nOu se preferir, fale com nosso operador digitando *3*!\n\nVamos prosseguir? 😊🚌', 1, 5, '2025-08-16 18:48:20', '2025-08-16 18:48:20'),
(52, 9, '[\"CIDADE_NAO_DISPONIVEL\"]', '❌ *Infelizmente não temos passagens para {CIDADE_NOME}*\n\nMas não se preocupe! Você pode adquirir passagens para essa cidade através de outras viações parceiras:\n\n🚌 *Viações Recomendadas:*\n• Expresso Guanabara\n• Viação Útil\n• Real Expresso\n• Eucatur\n\nOu consulte nossos destinos disponíveis digitando *1*!\n\n*Destinos que atendemos:*\nSão Luís, Imperatriz, Brasília, Goiânia, Araguaína, Gurupi, Porto Nacional, Paraíso do Tocantins, Colinas do Tocantins, Barreiras, Luís Eduardo Magalhães, Teresina e Parnaíba!\n\nPosso ajudar com algo mais? 😊', 1, 6, '2025-08-16 18:48:20', '2025-08-16 18:48:20'),
(53, 8, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\"]', '🚌 Olá! {name} Bem-vindo à *Viação Tocantins*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 0, '2025-08-21 15:58:45', '2025-08-21 16:48:16'),
(54, 8, '[\"1\", \"comprar\", \"passagem\", \"bilhete\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 1, 0, '2025-08-21 16:02:05', '2025-08-21 16:48:16'),
(55, 8, '[\"teste\", \"debug\"]', 'Este é um template de teste criado via debug!', 1, 0, '2025-08-21 16:03:02', '2025-08-21 16:48:16'),
(56, 8, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\"]', '🚌 Olá! {name} Bem-vindo à *Viação Tocantins*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 0, '2025-08-21 16:03:08', '2025-08-21 16:48:16'),
(57, 8, '[\"1\", \"comprar\", \"passagem\", \"bilhete\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 1, 0, '2025-08-21 16:03:08', '2025-08-21 16:48:16'),
(58, 8, '[\"2\", \"horários\", \"horario\", \"hora\"]', '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫', 1, 0, '2025-08-21 16:03:08', '2025-08-21 16:48:16'),
(59, 8, '[\"3\", \"operador\", \"atendente\", \"humano\", \"pessoa\"]', '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 1, 0, '2025-08-21 16:03:08', '2025-08-21 16:48:16'),
(60, 8, '[\"*\"]', '✅ *DADOS COLETADOS COM SUCESSO!*\n\n📝 *Resumo das suas informações:*\n👤 Nome: {nome_completo}\n📱 Telefone: {telefone}\n📅 Data da viagem: {data_viagem}\n🆔 CPF: {cpf}\n📍 Destino: {CIDADE_NOME}\n\n🚌 Agora vou transferir você para nosso operador que finalizará sua compra e processará o pagamento!\n\n⏰ *Em alguns instantes um operador especializado entrará em contato!*\n\nObrigado pela preferência na *Viação Tocantins*! 😊✨', 1, 0, '2025-08-21 16:03:08', '2025-08-21 16:48:16'),
(61, 8, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\", \"inicio\", \"começar\"]', '🚌 Olá! Bem-vindo à *Viação Tocantins*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 0, '2025-08-21 16:14:40', '2025-08-21 16:48:16'),
(62, 8, '[\"1\", \"comprar\", \"passagem\", \"bilhete\", \"ticket\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 1, 0, '2025-08-21 16:14:40', '2025-08-21 16:48:16'),
(63, 8, '[\"2\", \"horários\", \"horario\", \"hora\", \"saida\", \"partida\"]', '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫', 1, 0, '2025-08-21 16:14:40', '2025-08-21 16:48:16'),
(64, 8, '[\"3\", \"operador\", \"atendente\", \"humano\", \"pessoa\", \"falar\", \"conversar\"]', '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 1, 0, '2025-08-21 16:14:40', '2025-08-21 16:48:16'),
(65, 8, '[\"teresina\", \"são luís\", \"sao luis\", \"imperatriz\", \"brasília\", \"brasilia\", \"goiânia\", \"goiania\", \"araguaína\", \"araguaina\", \"gurupi\", \"porto nacional\", \"paraíso\", \"paraiso\", \"colinas\", \"barreiras\", \"luís eduardo\", \"luis eduardo\", \"parnaíba\", \"parnaiba\"]', '✅ Excelente escolha! Temos passagens para seu destino!\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: {cidade_escolhida}\n\nPara prosseguir com sua reserva, vou precisar de algumas informações.\n\n👤 *PASSO 1 de 4*\n\nPor favor, digite seu *nome completo*:', 1, 0, '2025-08-21 16:14:40', '2025-08-21 16:48:16'),
(66, 8, '[\"NOME_COLETADO\"]', '✅ Nome registrado com sucesso!\n\n📱 *PASSO 2 de 4*\n\nAgora preciso do seu *telefone para contato*:\n\n📝 Digite apenas os números\n💡 Exemplo: 63999887766', 1, 0, '2025-08-21 16:14:40', '2025-08-21 16:48:16'),
(67, 8, '[\"TELEFONE_COLETADO\"]', '✅ Telefone registrado com sucesso!\n\n📅 *PASSO 3 de 4*\n\nQual a *data da viagem desejada*?\n\n📝 Digite no formato DD/MM/AAAA\n💡 Exemplo: 25/08/2024', 1, 0, '2025-08-21 16:14:40', '2025-08-21 16:48:16'),
(68, 8, '[\"DATA_COLETADA\"]', '✅ Data da viagem registrada!\n\n🆔 *PASSO 4 de 4*\n\nPor último, preciso do seu *CPF*:\n\n📝 Digite apenas os números\n💡 Exemplo: 12345678901', 1, 0, '2025-08-21 16:14:40', '2025-08-21 16:48:16'),
(69, 8, '[\"CPF_COLETADO\"]', '✅ *DADOS COLETADOS COM SUCESSO!*\n\n📋 *Resumo da sua solicitação:*\n👤 Nome: {nome_cliente}\n📱 Telefone: {telefone_cliente}\n📅 Data da viagem: {data_viagem}\n🆔 CPF: {cpf_cliente}\n📍 Rota: Palmas-TO → {cidade_escolhida}\n\n🎫 Agora vou transferir você para um de nossos operadores que finalizará sua compra e enviará as informações de pagamento.\n\n⏰ Aguarde alguns instantes, um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 1, 0, '2025-08-21 16:14:40', '2025-08-21 16:48:16'),
(70, 8, '[\"CIDADE_NAO_DISPONIVEL\"]', '❌ *Infelizmente não temos passagens diretas para este destino*\n\nMas não se preocupe! Você pode:\n\n🔄 *Opção 1:* Consultar conexões com outras viações\n🚌 *Opção 2:* Escolher um de nossos destinos disponíveis\n👨‍💼 *Opção 3:* Falar com operador (digite *3*)\n\n*Nossos destinos diretos:*\nSão Luís, Imperatriz, Brasília, Goiânia, Araguaína, Gurupi, Porto Nacional, Paraíso do Tocantins, Colinas do Tocantins, Barreiras, Luís Eduardo Magalhães, Teresina e Parnaíba!\n\nDigite o nome de uma cidade da lista ou *3* para falar com operador! 😊', 1, 0, '2025-08-21 16:14:40', '2025-08-21 16:48:16'),
(71, 8, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\"]', '🚌 Olá! {name} Bem-vindo à *Viação Tocantins*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 0, '2025-08-21 16:15:42', '2025-08-21 16:48:16'),
(72, 8, '[\"1\", \"comprar\", \"passagem\", \"bilhete\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 1, 0, '2025-08-21 16:15:42', '2025-08-21 16:48:16'),
(73, 8, '[\"2\", \"horários\", \"horario\", \"hora\"]', '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫', 1, 0, '2025-08-21 16:15:42', '2025-08-21 16:48:16'),
(74, 8, '[\"3\", \"operador\", \"atendente\", \"humano\", \"pessoa\"]', '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 1, 0, '2025-08-21 16:15:42', '2025-08-21 16:48:16'),
(75, 8, '[\"*\"]', '✅ *DADOS COLETADOS COM SUCESSO!*\n\n📝 *Resumo das suas informações:*\n👤 Nome: {nome_completo}\n📱 Telefone: {telefone}\n📅 Data da viagem: {data_viagem}\n🆔 CPF: {cpf}\n📍 Destino: {CIDADE_NOME}\n\n🚌 Agora vou transferir você para nosso operador que finalizará sua compra e processará o pagamento!\n\n⏰ *Em alguns instantes um operador especializado entrará em contato!*\n\nObrigado pela preferência na *Viação Tocantins*! 😊✨', 1, 0, '2025-08-21 16:15:42', '2025-08-21 16:48:16'),
(76, 8, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\", \"inicio\", \"começar\"]', '🚌 Olá! Bem-vindo à *Viação Tocantins*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 0, '2025-08-21 16:33:51', '2025-08-21 16:48:16'),
(77, 8, '[\"1\", \"comprar\", \"passagem\", \"bilhete\", \"ticket\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 1, 0, '2025-08-21 16:33:51', '2025-08-21 16:48:16'),
(78, 8, '[\"2\", \"horários\", \"horario\", \"hora\", \"saida\", \"partida\"]', '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫', 1, 0, '2025-08-21 16:33:51', '2025-08-21 16:48:16'),
(79, 8, '[\"3\", \"operador\", \"atendente\", \"humano\", \"pessoa\", \"falar\", \"conversar\"]', '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 1, 0, '2025-08-21 16:33:51', '2025-08-21 16:48:16'),
(80, 8, '[\"teresina\", \"são luís\", \"sao luis\", \"imperatriz\", \"brasília\", \"brasilia\", \"goiânia\", \"goiania\", \"araguaína\", \"araguaina\", \"gurupi\", \"porto nacional\", \"paraíso\", \"paraiso\", \"colinas\", \"barreiras\", \"luís eduardo\", \"luis eduardo\", \"parnaíba\", \"parnaiba\"]', '✅ Excelente escolha! Temos passagens para seu destino!\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: {cidade_escolhida}\n\nPara prosseguir com sua reserva, vou precisar de algumas informações.\n\n👤 *PASSO 1 de 4*\n\nPor favor, digite seu *nome completo*:', 1, 0, '2025-08-21 16:33:51', '2025-08-21 16:48:17'),
(81, 8, '[\"*\"]', '✅ Nome registrado com sucesso!\n\n� *COLETA DE DADOS COMPLETA*\n\nAgora vou transferir você para nosso operador que coletará:\n📱 Seu telefone para contato\n📅 Data da viagem desejada  \n🆔 Seu CPF\n\nE finalizará sua compra com as informações de pagamento!\n\n⏰ *Em alguns instantes um operador especializado entrará em contato!*\n\nObrigado pela preferência na *Viação Tocantins*! 🚌✨', 1, 0, '2025-08-21 16:33:51', '2025-08-21 16:48:17'),
(82, 8, '[\"CIDADE_NAO_DISPONIVEL\"]', '❌ *Infelizmente não temos passagens diretas para este destino*\n\nMas não se preocupe! Você pode:\n\n🔄 *Opção 1:* Consultar conexões com outras viações\n🚌 *Opção 2:* Escolher um de nossos destinos disponíveis\n👨‍💼 *Opção 3:* Falar com operador (digite *3*)\n\n*Nossos destinos diretos:*\nSão Luís, Imperatriz, Brasília, Goiânia, Araguaína, Gurupi, Porto Nacional, Paraíso do Tocantins, Colinas do Tocantins, Barreiras, Luís Eduardo Magalhães, Teresina e Parnaíba!\n\nDigite o nome de uma cidade da lista ou *3* para falar com operador! 😊', 1, 0, '2025-08-21 16:33:51', '2025-08-21 16:48:17'),
(83, 8, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\", \"inicio\", \"começar\"]', '🚌 Olá! Bem-vindo à *Viação Tocantins*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 0, '2025-08-21 16:41:39', '2025-08-21 16:48:17'),
(84, 8, '[\"1\", \"comprar\", \"passagem\", \"bilhete\", \"ticket\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 1, 0, '2025-08-21 16:41:39', '2025-08-21 16:48:17'),
(85, 8, '[\"2\", \"horários\", \"horario\", \"hora\", \"saida\", \"partida\"]', '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫', 1, 0, '2025-08-21 16:41:39', '2025-08-21 16:48:17'),
(86, 8, '[\"3\", \"operador\", \"atendente\", \"humano\", \"pessoa\", \"falar\", \"conversar\"]', '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 1, 0, '2025-08-21 16:41:39', '2025-08-21 16:48:17'),
(87, 8, '[\"teresina\", \"são luís\", \"sao luis\", \"imperatriz\", \"brasília\", \"brasilia\", \"goiânia\", \"goiania\", \"araguaína\", \"araguaina\", \"gurupi\", \"porto nacional\", \"paraíso\", \"paraiso\", \"colinas\", \"barreiras\", \"luís eduardo\", \"luis eduardo\", \"parnaíba\", \"parnaiba\"]', '✅ Excelente escolha! Temos passagens para seu destino!\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: {cidade_escolhida}\n\nPara prosseguir com sua reserva, vou precisar de algumas informações.\n\n👤 *PASSO 1 de 4*\n\nPor favor, digite seu *nome completo*:', 1, 0, '2025-08-21 16:41:39', '2025-08-21 16:48:17'),
(88, 8, '[\"*\"]', '✅ Nome registrado com sucesso!\n\n� *COLETA DE DADOS COMPLETA*\n\nAgora vou transferir você para nosso operador que coletará:\n📱 Seu telefone para contato\n📅 Data da viagem desejada  \n🆔 Seu CPF\n\nE finalizará sua compra com as informações de pagamento!\n\n⏰ *Em alguns instantes um operador especializado entrará em contato!*\n\nObrigado pela preferência na *Viação Tocantins*! 🚌✨', 1, 0, '2025-08-21 16:41:39', '2025-08-21 16:48:17'),
(89, 8, '[\"CIDADE_NAO_DISPONIVEL\"]', '❌ *Infelizmente não temos passagens diretas para este destino*\n\nMas não se preocupe! Você pode:\n\n🔄 *Opção 1:* Consultar conexões com outras viações\n🚌 *Opção 2:* Escolher um de nossos destinos disponíveis\n👨‍💼 *Opção 3:* Falar com operador (digite *3*)\n\n*Nossos destinos diretos:*\nSão Luís, Imperatriz, Brasília, Goiânia, Araguaína, Gurupi, Porto Nacional, Paraíso do Tocantins, Colinas do Tocantins, Barreiras, Luís Eduardo Magalhães, Teresina e Parnaíba!\n\nDigite o nome de uma cidade da lista ou *3* para falar com operador! 😊', 1, 0, '2025-08-21 16:41:39', '2025-08-21 16:48:17'),
(90, 8, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\", \"inicio\", \"começar\"]', '🚌 Olá! Bem-vindo à *Viação Tocantins*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 0, '2025-08-21 16:47:27', '2025-08-21 16:48:17'),
(91, 8, '[\"1\", \"comprar\", \"passagem\", \"bilhete\", \"ticket\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 1, 0, '2025-08-21 16:47:27', '2025-08-21 16:48:17'),
(92, 8, '[\"2\", \"horários\", \"horario\", \"hora\", \"saida\", \"partida\"]', '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫', 1, 0, '2025-08-21 16:47:27', '2025-08-21 16:48:17'),
(93, 8, '[\"3\", \"operador\", \"atendente\", \"humano\", \"pessoa\", \"falar\", \"conversar\"]', '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 1, 0, '2025-08-21 16:47:27', '2025-08-21 16:48:17'),
(94, 8, '[\"teresina\", \"são luís\", \"sao luis\", \"imperatriz\", \"brasília\", \"brasilia\", \"goiânia\", \"goiania\", \"araguaína\", \"araguaina\", \"gurupi\", \"porto nacional\", \"paraíso\", \"paraiso\", \"colinas\", \"barreiras\", \"luís eduardo\", \"luis eduardo\", \"parnaíba\", \"parnaiba\"]', '✅ Excelente escolha! Temos passagens para seu destino!\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: {cidade_escolhida}\n\nPara prosseguir com sua reserva, vou precisar de algumas informações.\n\n👤 *PASSO 1 de 4*\n\nPor favor, digite seu *nome completo*:', 1, 0, '2025-08-21 16:47:27', '2025-08-21 16:48:17'),
(95, 8, '[\"*\"]', '✅ Nome registrado com sucesso!\n\n� *COLETA DE DADOS COMPLETA*\n\nAgora vou transferir você para nosso operador que coletará:\n📱 Seu telefone para contato\n📅 Data da viagem desejada  \n🆔 Seu CPF\n\nE finalizará sua compra com as informações de pagamento!\n\n⏰ *Em alguns instantes um operador especializado entrará em contato!*\n\nObrigado pela preferência na *Viação Tocantins*! 🚌✨', 1, 0, '2025-08-21 16:47:27', '2025-08-21 16:48:17'),
(96, 8, '[\"CIDADE_NAO_DISPONIVEL\"]', '❌ *Infelizmente não temos passagens diretas para este destino*\n\nMas não se preocupe! Você pode:\n\n🔄 *Opção 1:* Consultar conexões com outras viações\n🚌 *Opção 2:* Escolher um de nossos destinos disponíveis\n👨‍💼 *Opção 3:* Falar com operador (digite *3*)\n\n*Nossos destinos diretos:*\nSão Luís, Imperatriz, Brasília, Goiânia, Araguaína, Gurupi, Porto Nacional, Paraíso do Tocantins, Colinas do Tocantins, Barreiras, Luís Eduardo Magalhães, Teresina e Parnaíba!\n\nDigite o nome de uma cidade da lista ou *3* para falar com operador! 😊', 1, 0, '2025-08-21 16:47:27', '2025-08-21 16:48:17'),
(97, 8, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\", \"inicio\", \"começar\"]', '🚌 Olá! Bem-vindo à *Viação Tocantins*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 0, '2025-08-21 16:48:13', '2025-08-21 16:48:17'),
(98, 8, '[\"1\", \"comprar\", \"passagem\", \"bilhete\", \"ticket\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 1, 0, '2025-08-21 16:48:13', '2025-08-21 16:48:17'),
(99, 8, '[\"2\", \"horários\", \"horario\", \"hora\", \"saida\", \"partida\"]', '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫', 1, 0, '2025-08-21 16:48:13', '2025-08-21 16:48:17'),
(100, 8, '[\"3\", \"operador\", \"atendente\", \"humano\", \"pessoa\", \"falar\", \"conversar\"]', '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 1, 0, '2025-08-21 16:48:13', '2025-08-21 16:48:17'),
(101, 8, '[\"teresina\", \"são luís\", \"sao luis\", \"imperatriz\", \"brasília\", \"brasilia\", \"goiânia\", \"goiania\", \"araguaína\", \"araguaina\", \"gurupi\", \"porto nacional\", \"paraíso\", \"paraiso\", \"colinas\", \"barreiras\", \"luís eduardo\", \"luis eduardo\", \"parnaíba\", \"parnaiba\"]', '✅ Excelente escolha! Temos passagens para seu destino!\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: {cidade_escolhida}\n\nPara prosseguir com sua reserva, vou precisar de algumas informações.\n\n👤 *PASSO 1 de 4*\n\nPor favor, digite seu *nome completo*:', 1, 0, '2025-08-21 16:48:13', '2025-08-21 16:48:17'),
(102, 8, '[\"*\"]', '✅ Nome registrado com sucesso!\n\n� *COLETA DE DADOS COMPLETA*\n\nAgora vou transferir você para nosso operador que coletará:\n📱 Seu telefone para contato\n📅 Data da viagem desejada  \n🆔 Seu CPF\n\nE finalizará sua compra com as informações de pagamento!\n\n⏰ *Em alguns instantes um operador especializado entrará em contato!*\n\nObrigado pela preferência na *Viação Tocantins*! 🚌✨', 1, 0, '2025-08-21 16:48:13', '2025-08-21 16:48:17'),
(103, 8, '[\"CIDADE_NAO_DISPONIVEL\"]', '❌ *Infelizmente não temos passagens diretas para este destino*\n\nMas não se preocupe! Você pode:\n\n🔄 *Opção 1:* Consultar conexões com outras viações\n🚌 *Opção 2:* Escolher um de nossos destinos disponíveis\n👨‍💼 *Opção 3:* Falar com operador (digite *3*)\n\n*Nossos destinos diretos:*\nSão Luís, Imperatriz, Brasília, Goiânia, Araguaína, Gurupi, Porto Nacional, Paraíso do Tocantins, Colinas do Tocantins, Barreiras, Luís Eduardo Magalhães, Teresina e Parnaíba!\n\nDigite o nome de uma cidade da lista ou *3* para falar com operador! 😊', 1, 0, '2025-08-21 16:48:13', '2025-08-21 16:48:17'),
(104, 8, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\"]', '🚌 Olá! {name} Bem-vindo à *Viação Tocantins*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 0, '2025-08-21 16:48:51', '2025-08-21 16:48:51'),
(105, 8, '[\"1\", \"comprar\", \"passagem\", \"bilhete\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 1, 0, '2025-08-21 16:48:51', '2025-08-21 16:48:51'),
(106, 8, '[\"2\", \"horários\", \"horario\", \"hora\"]', '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫', 1, 0, '2025-08-21 16:48:51', '2025-08-21 16:48:51'),
(107, 8, '[\"3\", \"operador\", \"atendente\", \"humano\", \"pessoa\"]', '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 1, 0, '2025-08-21 16:48:51', '2025-08-21 16:48:51');

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
) ENGINE=MyISAM AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `contacts`
--

INSERT INTO `contacts` (`id`, `manager_id`, `phone_number`, `name`, `avatar`, `tags`, `notes`, `is_blocked`, `created_at`, `updated_at`) VALUES
(40, 2, '556392410056', 'Erick Vinicius', NULL, NULL, NULL, 0, '2025-08-21 16:34:17', '2025-08-21 16:34:17');

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
) ENGINE=MyISAM AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=MyISAM AUTO_INCREMENT=376 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `messages`
--

INSERT INTO `messages` (`id`, `manager_id`, `chat_id`, `contact_id`, `whatsapp_message_id`, `sender_type`, `sender_id`, `content`, `message_type`, `media_url`, `is_read`, `delivered_at`, `read_at`, `created_at`) VALUES
(373, 2, NULL, 40, NULL, 'bot', NULL, '✅ Excelente escolha! Temos passagens para seu destino!\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: {cidade_escolhida}\n\nPara prosseguir com sua reserva, vou precisar de algumas informações.\n\n👤 *PASSO 1 de 4*\n\nPor favor, digite seu *nome completo*:', 'text', NULL, 0, NULL, NULL, '2025-08-21 16:34:40'),
(374, 2, NULL, 40, 'false_556392410056@c.us_3EB0A18F6D95BCCBF9C100', 'contact', NULL, 'Erick Vinicius', '', NULL, 0, NULL, NULL, '2025-08-21 16:34:47'),
(375, 2, NULL, 40, NULL, 'bot', NULL, '❌ *Infelizmente não temos passagens para Erick Vinicius*\n\nMas não se preocupe! Você pode adquirir passagens para essa cidade através de outras viações parceiras:\n\n🚌 *Viações Recomendadas:*\n• Expresso Guanabara\n• Viação Útil\n• Real Expresso\n• Eucatur\n\nOu consulte nossos destinos disponíveis digitando *1*!\n\n*Destinos que atendemos:*\nSão Luís, Imperatriz, Brasília, Goiânia, Araguaína, Gurupi, Porto Nacional, Paraíso do Tocantins, Colinas do Tocantins, Barreiras, Luís Eduardo Magalhães, Teresina e Parnaíba!\n\nPosso ajudar com algo mais? 😊', 'text', NULL, 0, NULL, NULL, '2025-08-21 16:34:53'),
(372, 2, NULL, 40, 'false_556392410056@c.us_3EB05C3E5A0A54494338A0', 'contact', NULL, 'São Luís - MA', '', NULL, 0, NULL, NULL, '2025-08-21 16:34:34'),
(369, 2, NULL, 40, NULL, 'bot', NULL, '🚌 Olá! Erick Bem-vindo à *Viação Tocantins*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 'text', NULL, 0, NULL, NULL, '2025-08-21 16:34:23'),
(370, 2, NULL, 40, 'false_556392410056@c.us_3EB0E16EAF666E8CE3DBDB', 'contact', NULL, '1', '', NULL, 0, NULL, NULL, '2025-08-21 16:34:25'),
(371, 2, NULL, 40, NULL, 'bot', NULL, '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 'text', NULL, 0, NULL, NULL, '2025-08-21 16:34:31'),
(368, 2, NULL, 40, 'false_556392410056@c.us_3EB0315FDCF062DE6CF14B', 'contact', NULL, 'oLÁ', '', NULL, 0, NULL, NULL, '2025-08-21 16:34:17');

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
) ENGINE=MyISAM AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `whatsapp_instances`
--

INSERT INTO `whatsapp_instances` (`id`, `manager_id`, `instance_name`, `phone_number`, `status`, `qr_code`, `session_data`, `webhook_url`, `is_active`, `connected_at`, `last_activity`, `created_at`, `updated_at`) VALUES
(69, 2, 'Instância Erick Vinicius', '556392901378', 'connecting', 'data:image/png;base64,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', NULL, NULL, 1, '2025-08-21 16:21:20', '2025-08-21 16:21:19', '2025-08-21 16:20:50', '2025-08-21 16:32:29'),
(70, 2, 'Instância Erick Vinicius', '556392901378', 'connecting', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARQAAAEUCAYAAADqcMl5AAAAAklEQVR4AewaftIAABIjSURBVO3BQW4AR5LAQLKh/3+Z62OeCmh0SfYsMsL+wVprXfCw1lqXPKy11iUPa611ycNaa13ysNZalzystdYlD2utdcnDWmtd8rDWWpc8rLXWJQ9rrXXJw1prXfKw1lqXPKy11iUPa611yQ8fqfylikllqphUbqqYVE4qTlSmijdUpoo3VKaKSeWk4guVk4o3VE4qvlCZKt5QOamYVP5SxRcPa611ycNaa13ysNZal/xwWcVNKl9UTCpvVEwqb6hMFVPFicoXKlPFicpJxaRyUnFScaJyk8pNKicVN1XcpHLTw1prXfKw1lqXPKy11iU//DKVNyreqJhUblKZKk5UpopJ5aRiqjhRmVROVKaKSWWqOKk4UZkqJpWpYqo4UTmpmFSmihOVk4pJZVL5TSpvVPymh7XWuuRhrbUueVhrrUt++B+nMlV8oTJVnKhMFZPKv6niRGWqmFSmijcqJpWbKiaVSeUNlaliUplU3qiYVP4/eVhrrUse1lrrkoe11rrkh/9xFScqJxVTxU0Vk8qJylQxqUwVk8qkMlWcqJyonFScVEwqk8pJxaQyVbyhMlW8UTGpnKhMFf+fPKy11iUPa611ycNaa13ywy+r+C9TeaPiDZWpYlKZKiaVE5Wp4ouKN1Qmlanii4qTikllqjip+ELljYqbKv5LHtZa65KHtda65GGttS754TKVv6QyVZxUTCpTxaTyX1IxqZyoTBVvqEwVJxWTylRxUjGpTBWTylQxqUwVk8pUMalMFZPKVDGpnKhMFScq/2UPa611ycNaa13ysNZal/zwUcV/WcVJxUnFpDJVTCpTxaQyVfwllTcqvqiYVL5QOVGZKiaVqeINlaliUnmj4qTif8nDWmtd8rDWWpc8rLXWJT98pDJVTConFZPKGxUnKm9UnFRMKicqU8WkMlWcqLxRcaIyqfyliknlJpWp4jdVTConKlPFpDJVnKhMFZPKScUXD2utdcnDWmtd8rDWWpf88FHFFypTxYnKFxWTyhcVk8qJyhsVN6m8UXGi8oXKScWJyhsqJxVTxYnKScVJxaRyojJVfFFx08Naa13ysNZalzystdYlP3ykclJxojKp3FQxqUwVk8pJxaQyVdyk8kXFVDGpvKFyojJVTBVvqEwVU8Wk8r+s4g2VqWJS+UsPa611ycNaa13ysNZal9g/uEjlpopJ5YuKSeWk4g2VNyomlf+SiknlpOINlaniROWNijdUbqqYVKaKSWWqmFS+qPhND2utdcnDWmtd8rDWWpf88JHKScWkMlVMKpPKVHGiMlWcVEwqk8pfqjhReaNiUpkqJpWTikllUrlJZao4UTlRmSreqJhUTlROVKaKNypOVP7Sw1prXfKw1lqXPKy11iU/fFTxmyomlZOKSeU3VUwqb6i8UfGGylQxqZyonFRMKlPFf0nFGxWTylRxonJS8UbFpDJVTBWTyknFFw9rrXXJw1prXfKw1lqX2D/4QGWqOFH5omJSOak4UZkqTlROKr5Q+UsVk8pU8YbKVHGi8pcq3lB5o2JSOal4Q2WqOFE5qbjpYa21LnlYa61LHtZa65IffpnKGxUnKicVk8pU8YbKFypTxaQyVfwmlTdUpopJ5Q2VLyomlZOKE5WTikllqjipmFS+qJhUpoqpYlKZVKaKLx7WWuuSh7XWuuRhrbUu+eE/TmWqeKPipGJSmSpOVCaVqeINlaniDZWTipOKNypOVKaKL1SmikllUnmjYlKZKr6omFROKiaVN1Smiknlpoe11rrkYa21LnlYa61LfrhMZaqYVE5Upoo3VKaKE5WpYlL5QuULlanipOI3qUwVX6hMFScVb1RMKv8mlS8qvlD5TQ9rrXXJw1prXfKw1lqX/HBZxRsVk8qkMlWcVJyoTBVvVEwqb1ScqLyhMlWcqLxRcZPKGypTxRsqU8Wk8obKFxWTylTxhsobFZPKTQ9rrXXJw1prXfKw1lqX/PDHKiaVk4pJ5aTiC5UvKk5UfpPKGxWTyhcqU8WkMlVMKl9UvFExqUwVk8pU8UXFpDJVnFRMKlPFX3pYa61LHtZa65KHtda65IePKn6TylQxqUwqU8VU8UbFpDJVnKhMFScqU8WkMlVMKlPFpPKGyr+pYlJ5o+KNir+kcqIyVZxUTCp/6WGttS55WGutSx7WWusS+wcXqXxRcZPKVDGpTBUnKl9UTCpvVJyoTBVvqEwVJypTxYnKGxVvqJxUTConFScqU8VNKicVJyonFTc9rLXWJQ9rrXXJw1prXfLDH6uYVE5UTip+k8pUMamcVEwqU8WJyhcqJxUnKr+pYlJ5Q+UNlaliUplUTiomlaliUpkqvlB5o+I3Pay11iUPa611ycNaa13yw3+MylTxhsoXKicqJxUnFW9UTCpTxVQxqUwVk8pNKlPFVHFSMamcVJyofFFxovJGxYnKVHGi8l/ysNZalzystdYlD2utdckPH6lMFV9UTCpTxaTyRcWJylTxhsobFW+onFScVJyoTBVfqLxR8YbKFxWTyhsVk8pJxYnKVDFVTCr/poe11rrkYa21LnlYa61L7B/8IpWp4guVqeINlaniDZWTikllqjhReaPiRGWqOFE5qZhUpoo3VN6omFSmijdUTiomlZsq3lD5omJSmSq+eFhrrUse1lrrkoe11rrkh49UpooTlaniRGWqmFRuUpkq/k0Vk8qJyonKVDFVTCo3qUwVJyonFScqJxVvVJyovKEyVUwqU8WJyonKVHHTw1prXfKw1lqXPKy11iU//LGKE5Wp4qaKLypOVKaKNypOKiaVNypOVL5QOak4UZkqfpPKVPGGyknFGyonKlPFScWJylTxxcNaa13ysNZalzystdYl9g8uUvkvqThRmSreUHmjYlL5SxWTyk0Vk8pUcaIyVUwqU8UbKm9UfKEyVUwqN1VMKicVNz2stdYlD2utdcnDWmtd8sNlFScqJxVvqLyhcqIyVXxRMamcVEwqJxWTylQxqZxUvKEyqbyhMlX8pYpJZVKZKiaVqWKqeKPiDZVJ5Q2VqeKLh7XWuuRhrbUueVhrrUt++EhlqphUpopJ5URlqnhD5Y2KNyomlUnlpOKk4kTljYpJ5URlqnij4guVN1SmijcqTlTeUJkq3lCZKr6omFRuelhrrUse1lrrkoe11rrkh48q3lB5o+KmihOVqWJSeaNiUplUTipOKiaVSWWqeKPiN1VMKlPFicqJyhcq/6aKNypOVH7Tw1prXfKw1lqXPKy11iX2Dz5QmSomlX9TxW9SeaPiJpWTiknlL1VMKlPFicobFScqU8WJyknFpDJVnKj8poq/9LDWWpc8rLXWJQ9rrXWJ/YN/kcpJxRcqU8WkclLxhcobFScqX1RMKicVk8obFZPKScVNKlPFFypvVEwqN1WcqEwVk8pU8cXDWmtd8rDWWpc8rLXWJT9cpnJS8YbKScWkMlW8UXFTxaTyRcWkMlVMKicVk8obFScqU8WkMqlMFZPKVPGFylQxqUwVk8pUMam8UXGiclPFTQ9rrXXJw1prXfKw1lqX2D/4QOWkYlKZKiaVqWJSOamYVH5TxaRyUvGFylTxhspJxRcqb1R8oTJVnKicVLyh8kXFpDJVTCpTxaRyUvGbHtZa65KHtda65GGttS754bKKSeWNiknlDZWp4kRlqphUpoqbVN6oOFGZKk4qJpU3KqaKE5VJ5Y2KqeJE5aTiDZWTihOVm1T+Sx7WWuuSh7XWuuRhrbUu+eGXVZyoTBVTxaQyVUwqb1ScVEwqb1S8UfFFxaQyVUwqb1RMKlPFScWJyhsqU8VU8YbKVHFSMamcVLyh8kbFicpJxRcPa611ycNaa13ysNZal/xwmcpJxVQxqZxUTCpTxaQyVbyhMlVMKicqU8WJylQxqZxU3FTxhspU8UXFpHKiMlVMKlPFVPFfUvGFyl96WGutSx7WWuuSh7XWuuSHyypuqvii4g2VE5WpYlKZKt6o+E0qU8WJyknFpHKi8psqTipOVKaKNyreUHlDZaqYVKaKE5WbHtZa65KHtda65GGttS754TKVqeJEZaqYVN5Q+U0Vk8pU8UbFpPJGxaQyVZyoTBVTxYnKVDGpTBUnKm9UnKi8UTGpTBVvqEwVU8WJyhcqJxU3Pay11iUPa611ycNaa11i/+ADlaniC5Wp4g2VqeINlS8qTlROKk5U3qiYVL6omFS+qHhDZaqYVKaKSWWqmFROKiaVqeJEZao4UZkqvlA5qfjiYa21LnlYa61LHtZa65IffpnKGxWTyknFVDGpvFHxhspvUpkqTlRuqphUpoo3VCaVqeI3VZxUTConFZPKVDFVTCpvqLxR8Zce1lrrkoe11rrkYa21LrF/8IdUpopJZaqYVL6oeEPli4pJ5YuKSeWLijdUvqiYVN6omFS+qDhRmSomlaniRGWqOFF5o+JEZaq46WGttS55WGutSx7WWusS+wcXqZxUTCpTxaQyVUwqv6liUvmiYlKZKiaVk4ovVKaKE5Wp4kTlpOJE5aaKN1SmijdUpooTlaliUjmpOFE5qfjiYa21LnlYa61LHtZa65IfPlJ5Q+WNipsqJpWpYlI5qZhUvlB5Q+UvVUwqJxUnKicVk8pUMam8oTJVTBVvqEwVk8pUMVVMKicVJyp/6WGttS55WGutSx7WWusS+wcXqUwVJyo3VbyhMlVMKl9UnKi8UXGiMlVMKlPFpDJVTCpTxaRyUnGi8kbFGypTxaQyVUwqU8WkclIxqUwV/8se1lrrkoe11rrkYa21LvnhI5UTlaliqphUpoq/pPJGxRsqN6lMFZPKTRUnFZPKGxWTyk0Vb6i8UfFGxYnKVHGi8kbFTQ9rrXXJw1prXfKw1lqX2D/4QGWqmFSmijdU3qg4UTmpOFE5qZhUpooTlaniROWk4kRlqphUTiomlS8qblI5qZhUbqqYVKaKE5U3KiaVNyq+eFhrrUse1lrrkoe11rrE/sFFKlPFpHJS8YbKScUbKlPFFyonFb9J5aTiv0TlpGJSmSreUDmpOFH5omJSuaniRGWq+OJhrbUueVhrrUse1lrrEvsHv0jlN1WcqJxUTConFb9J5aTiDZWpYlI5qZhUpopJZap4Q+WLiknlpGJSeaNiUrmp4guVk4qbHtZa65KHtda65GGttS6xf/CByhsVk8pUcaJyUnGTyknFpPJGxYnKScWkMlVMKicVX6icVHyhMlVMKm9UfKHyRsWk8kXFGypTxU0Pa611ycNaa13ysNZal/zwx1SmihOV36QyVZxUnFScqLxR8UbFpPKGyr9JZap4o+JEZVKZKiaVqWKq+DepnFT8pYe11rrkYa21LnlYa61Lfvio4jdVnKj8m1TeqJhUpooTlaliUvmi4g2Vmyq+UJkqfpPKVPFFxRsqJyp/6WGttS55WGutSx7WWuuSHz5S+UsVN1VMKlPFpDJV3KTyRcUbKicqU8UbFZPKGxVvVLxR8YbKGypTxRsqU8VJxYnKpDJVfPGw1lqXPKy11iUPa611yQ+XVdyk8oXKVDGpnKh8oTJVTBUnKicqv6nipooTlUnlROWk4qaKSWVSuaniDZWp4i89rLXWJQ9rrXXJw1prXfLDL1N5o+KNijdUpopJZaqYVCaVk4pJ5aTijYovVCaVm1ROKqaKSWWqmFSmii9UTlSmihOVSeVE5YuKSeWk4qaHtda65GGttS55WGutS374H6cyVZxUfFHxlyomlUnlpOKk4kTlpOILlZOKN1ROKk4qvlCZKk5UpopJ5aTipOJEZar44mGttS55WGutSx7WWuuSH/6fUZkqJpU3VKaKE5WpYqqYVE5UpopJZaqYVKaKLyomlaliUnmj4kRlqphUpooTlaliUpkq3lA5qTipmFQmlaliUjmpuOlhrbUueVhrrUse1lrrkh9+WcVvqphU3qg4UTlRmSomlaliqphUpopJZao4qZhUTireqJhUTipOVL6o+E0qU8VNKlPFVDGpTConFb/pYa21LnlYa61LHtZa65IfLlP5SypTxRcqU8WkMlVMKm+ofKEyVZxUfKEyVUwVk8qkclIxqbyhMlWcVHyhMlVMKm9UTCpTxRsVk8pJxRcPa611ycNaa13ysNZal9g/WGutCx7WWuuSh7XWuuRhrbUueVhrrUse1lrrkoe11rrkYa21LnlYa61LHtZa65KHtda65GGttS55WGutSx7WWuuSh7XWuuRhrbUu+T8IHWeY46xguAAAAABJRU5ErkJggg==', NULL, NULL, 1, '2025-08-21 16:33:35', '2025-08-21 16:34:46', '2025-08-21 16:32:30', '2025-08-21 16:40:08');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
