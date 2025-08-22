-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 22/08/2025 às 03:23
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
) ENGINE=MyISAM AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(47, 9, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\"]', '🚌 Olá! {name} Bem-vindo à *Viação Palmas*!\n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários\n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 1, '2025-08-16 18:48:20', '2025-08-16 18:48:20'),
(48, 9, '[\"1\", \"comprar\", \"passagem\", \"bilhete\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n*Cidades disponíveis:*\n• São Luís - MA\n• Imperatriz - MA\n• Brasília - DF\n• Goiânia - GO\n• Araguaína - TO\n• Gurupi - TO\n• Porto Nacional - TO\n• Paraíso do Tocantins - TO\n• Colinas do Tocantins - TO\n• Barreiras - BA\n• Luís Eduardo Magalhães - BA\n• Teresina - PI\n• Parnaíba - PI\n\nDigite o nome da cidade de destino! ✈️', 1, 2, '2025-08-16 18:48:20', '2025-08-16 18:48:20'),
(49, 9, '[\"2\", \"horários\", \"horario\", \"hora\"]', '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz\n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*\n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫', 1, 3, '2025-08-16 18:48:20', '2025-08-16 18:48:20'),
(50, 9, '[\"3\", \"operador\", \"atendente\", \"humano\", \"pessoa\"]', '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada em vendas de passagens.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h\nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato!\n\nObrigado pela preferência! 🚌✨', 1, 4, '2025-08-16 18:48:20', '2025-08-16 18:48:20'),
(51, 9, '[\"CIDADE_DISPONIVEL\"]', '✅ *Excelente escolha! Temos passagens para {CIDADE_NOME}!*\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: {CIDADE_NOME}\n🕐 Horários disponíveis: Consulte digitando *2*\n\nPara finalizar sua compra, preciso de algumas informações:\n\n👤 *Nome completo*\n📱 *Telefone para contato*\n📅 *Data da viagem desejada*\n🆔 *CPF*\n\nOu se preferir, fale com nosso operador digitando *3*!\n\nVamos prosseguir? 😊🚌', 1, 5, '2025-08-16 18:48:20', '2025-08-16 18:48:20'),
(52, 9, '[\"CIDADE_NAO_DISPONIVEL\"]', '❌ *Infelizmente não temos passagens para {CIDADE_NOME}*\n\nMas não se preocupe! Você pode adquirir passagens para essa cidade através de outras viações parceiras:\n\n🚌 *Viações Recomendadas:*\n• Expresso Guanabara\n• Viação Útil\n• Real Expresso\n• Eucatur\n\nOu consulte nossos destinos disponíveis digitando *1*!\n\n*Destinos que atendemos:*\nSão Luís, Imperatriz, Brasília, Goiânia, Araguaína, Gurupi, Porto Nacional, Paraíso do Tocantins, Colinas do Tocantins, Barreiras, Luís Eduardo Magalhães, Teresina e Parnaíba!\n\nPosso ajudar com algo mais? 😊', 1, 6, '2025-08-16 18:48:20', '2025-08-16 18:48:20'),
(121, 8, '[\"default\"]', '😔 *Ops! Infelizmente não temos passagens para este destino.*\n\n🚌 *Atualmente operamos saídas de Palmas - TO para:*\n• Estados: MA, DF, GO, TO, BA, PI\n• Principais cidades do interior\n\n*O que você gostaria de fazer?*\n\n*1* - 🎫 Escolher outro destino\n*2* - 🕐 Ver horários disponíveis\n*3* - 👨‍💼 Falar com operador para mais informações\n\nDigite o número da opção! 😊', 1, 0, '2025-08-21 23:44:46', '2025-08-21 23:44:46'),
(118, 8, '[\"CIDADE_NAO_ENCONTRADA\"]', '❌ *Não encontramos passagens para este destino*\n\n😔 Infelizmente não atendemos esta cidade com viagens diretas de Palmas.\n\n🚌 *Algumas opções:*\n• Consulte cidades próximas\n• Verifique conexões com outras viações\n• Fale com nosso operador para mais informações\n\n*Para falar com operador, digite* *3*\n*Para ver horários, digite* *2*\n*Para tentar outra cidade, digite* *1*\n\nObrigado pelo contato! 🚌', 1, 0, '2025-08-21 23:26:26', '2025-08-21 23:53:02'),
(120, 8, '[\"default\"]', '😔 *Ops! Infelizmente não temos passagens para este destino.*\n\n🚌 *Atualmente operamos saídas de Palmas - TO para:*\n• Estados: MA, DF, GO, TO, BA, PI\n• Principais cidades do interior\n\n*O que você gostaria de fazer?*\n\n*1* - 🎫 Escolher outro destino\n*2* - 🕐 Ver horários disponíveis\n*3* - 👨‍💼 Falar com operador para mais informações\n\nDigite o número da opção! 😊', 1, 0, '2025-08-21 23:41:17', '2025-08-21 23:41:17'),
(117, 8, '[\"*\"]', '✅ *Perfeito! Vou verificar a disponibilidade para seu destino!*\n\n🎫 *Informações:*\n📍 Origem: Palmas - TO\n📍 Destino: {CIDADE_NOME}\n\nPara finalizar sua consulta e possível compra, vou transferir você para nosso operador especializado que irá:\n\n✅ Verificar disponibilidade de passagens\n✅ Informar horários e preços\n✅ Coletar seus dados se houver passagem\n✅ Processar sua compra\n\n⏰ *Operador entrando em contato em instantes!*\n\nObrigado pela preferência na *Viação Tocantins*! 🚌✨', 1, 0, '2025-08-21 23:26:26', '2025-08-22 02:16:16'),
(116, 8, '[\"3\", \"operador\", \"atendente\", \"humano\", \"pessoa\"]', '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h  \nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato! \n\nObrigado pela preferência! 🚌✨', 1, 0, '2025-08-21 23:26:26', '2025-08-21 23:54:58'),
(115, 8, '[\"2\", \"horários\", \"horario\", \"hora\"]', '🕐 *HORÁRIOS DE SAÍDA*\n\n*Saídas de Palmas - TO:*\n\n🌅 *Manhã*\n• 06:00 - Destinos: Brasília, Goiânia\n• 07:30 - Destinos: São Luís, Imperatriz  \n• 08:00 - Destinos: Araguaína, Gurupi\n\n🌞 *Tarde*  \n• 14:00 - Destinos: Teresina, Parnaíba\n• 15:30 - Destinos: Barreiras, L.E. Magalhães\n• 16:00 - Destinos: Porto Nacional, Paraíso\n\n🌙 *Noite*\n• 20:00 - Destinos: Brasília, Goiânia\n• 21:30 - Destinos: São Luís, Imperatriz\n• 22:00 - Destinos: Colinas do Tocantins\n\nPara comprar sua passagem, digite *1*! 🎫\nPara falar com operador, digite *3*! 👨‍💼', 1, 0, '2025-08-21 23:26:26', '2025-08-21 23:54:58'),
(113, 8, '[\"oi\", \"olá\", \"menu\", \"dia\", \"tarde\", \"noite\", \"bom dia\", \"boa tarde\", \"boa noite\"]', '🚌 Olá! {name} Bem-vindo à *Viação Tocantins*! \n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários  \n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 1, 0, '2025-08-21 23:26:26', '2025-08-21 23:54:58'),
(114, 8, '[\"1\", \"comprar\", \"passagem\", \"bilhete\"]', '🎫 *COMPRAR PASSAGEM*\n\nNossa origem é sempre: *Palmas - TO* 🏙️\n\nPara qual cidade você gostaria de viajar?\n\n💡 *Dica:* Digite apenas o nome da cidade\n\nDigite o nome da cidade de destino! ✈️', 1, 0, '2025-08-21 23:26:26', '2025-08-21 23:54:58'),
(119, 8, '[\"default\"]', '✅ *Excelente escolha! Temos passagens para seu destino!*\n\n🎫 *Informações da Viagem:*\n📍 Origem: Palmas - TO\n📍 Destino: {cidade_escolhida}\n\n👨‍💼 *Vou transferir você para nosso operador especializado para finalizar sua compra!*\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h  \nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato para ajudá-lo com:\n• Escolha de horários\n• Formas de pagamento\n• Finalização da compra\n\nObrigado pela preferência! 🚌✨', 1, 0, '2025-08-21 23:41:17', '2025-08-21 23:41:17');

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
) ENGINE=MyISAM AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `contacts`
--

INSERT INTO `contacts` (`id`, `manager_id`, `phone_number`, `name`, `avatar`, `tags`, `notes`, `is_blocked`, `created_at`, `updated_at`) VALUES
(45, 2, '556392410056', 'Erick Vinicius', NULL, NULL, NULL, 0, '2025-08-22 02:56:02', '2025-08-22 02:56:02');

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
) ENGINE=MyISAM AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `human_chats`
--

INSERT INTO `human_chats` (`id`, `manager_id`, `contact_id`, `operator_id`, `assigned_to`, `status`, `transfer_reason`, `transfer_from`, `transfer_to`, `tags`, `created_at`, `updated_at`) VALUES
(48, 2, 45, NULL, 2, 'active', 'Solicitação do cliente', NULL, NULL, NULL, '2025-08-22 03:19:53', '2025-08-22 03:20:07');

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
) ENGINE=MyISAM AUTO_INCREMENT=449 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `messages`
--

INSERT INTO `messages` (`id`, `manager_id`, `chat_id`, `contact_id`, `whatsapp_message_id`, `sender_type`, `sender_id`, `content`, `message_type`, `media_url`, `is_read`, `delivered_at`, `read_at`, `created_at`) VALUES
(447, 2, 48, 45, NULL, 'bot', NULL, '👨‍💼 *FALAR COM OPERADOR*\n\n🙋‍♀️ Entendi que você gostaria de falar com um de nossos operadores!\n\nVou transferir você para nossa equipe de atendimento especializada.\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 6h às 22h\nSábado: 6h às 18h  \nDomingo: 8h às 20h\n\nEm alguns instantes um operador entrará em contato! \n\nObrigado pela preferência! 🚌✨', 'text', NULL, 0, NULL, NULL, '2025-08-22 03:19:58'),
(448, 2, 48, 45, 'false_556392410056@c.us_3EB0C73972D08FB49B135A', 'contact', NULL, 'ok', '', NULL, 0, NULL, NULL, '2025-08-22 03:20:11'),
(445, 2, 48, 45, NULL, 'bot', NULL, '🚌 Olá! Erick Bem-vindo à *Viação Tocantins*! \n\nComo posso ajudá-lo hoje?\n\n*1* - 🎫 Comprar Passagem\n*2* - 🕐 Ver Horários  \n*3* - 👨‍💼 Falar com Operador\n\nDigite o número da opção desejada! 😊', 'text', NULL, 0, NULL, NULL, '2025-08-22 03:19:51'),
(446, 2, 48, 45, 'false_556392410056@c.us_3EB057467A6A2F37F91CDA', 'contact', NULL, '3', '', NULL, 0, NULL, NULL, '2025-08-22 03:19:52'),
(444, 2, 48, 45, 'false_556392410056@c.us_3EB041C233FBD709FF8806', 'contact', NULL, 'Olá', '', NULL, 0, NULL, NULL, '2025-08-22 03:19:45');

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
) ENGINE=MyISAM AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `session_token`, `refresh_token`, `expires_at`, `created_at`, `updated_at`, `ip_address`, `user_agent`, `is_active`) VALUES
(14, 2, '2740d6dae602a90f7cc6861fb8680bdac7deaff3fc34a96cf8c8e96e217bdaae', '1434d53fa5428924c9e78340d1c635177729f85164dfe769bb6bf8d59f78729a', '2025-08-23 00:19:23', '2025-08-22 00:19:23', '2025-08-22 00:20:07', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 1);

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
) ENGINE=MyISAM AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `whatsapp_instances`
--

INSERT INTO `whatsapp_instances` (`id`, `manager_id`, `instance_name`, `phone_number`, `status`, `qr_code`, `session_data`, `webhook_url`, `is_active`, `connected_at`, `last_activity`, `created_at`, `updated_at`) VALUES
(82, 2, 'Instância Erick Vinicius', '556392901378', 'connected', 'data:image/png;base64,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', NULL, NULL, 1, '2025-08-22 03:19:37', '2025-08-22 03:20:11', '2025-08-22 03:19:26', '2025-08-22 03:20:11');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
