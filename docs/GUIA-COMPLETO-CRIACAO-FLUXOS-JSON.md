# 📚 Guia Completo: Criação de Fluxos em JSON

## 🎯 Visão Geral

Este guia ensina como criar e editar fluxos de conversação completos usando JSON no Editor Visual de Fluxo. Você pode criar fluxos para **qualquer tipo de negócio**: restaurantes, lojas, clínicas, serviços, etc.

## 🏗️ Estrutura Básica do JSON

Todo fluxo deve seguir esta estrutura:

```json
{
  "metadata": {
    "version": "1.0",
    "created": "2024-08-21T16:00:00.000Z",
    "description": "Descrição do seu fluxo"
  },
  "nodes": [
    // Seus nós aqui
  ],
  "connections": [
    // Suas conexões aqui
  ]
}
```

## 📋 Tipos de Nós Suportados

### 1. **start** - Nó de Início
```json
{
  "id": "start-1",
  "type": "start",
  "position": { "x": 50, "y": 50 },
  "data": {
    "title": "Início",
    "description": "Usuário inicia conversa"
  },
  "connections": ["primeiro-no"]
}
```

### 2. **message** - Mensagem Automática
```json
{
  "id": "boas-vindas",
  "type": "message",
  "position": { "x": 200, "y": 100 },
  "data": {
    "title": "Boas-vindas",
    "triggers": ["oi", "olá", "menu", "início"],
    "response": "Olá! 👋 Como posso ajudar você hoje?",
    "active": true
  },
  "connections": ["menu-principal"]
}
```

### 3. **human** - Transferência para Operador
```json
{
  "id": "atendimento-humano",
  "type": "human",
  "position": { "x": 400, "y": 200 },
  "data": {
    "title": "Atendimento Humano",
    "triggers": ["operador", "atendente", "humano"],
    "response": "Vou transferir você para um operador. Aguarde um momento!",
    "active": true
  },
  "connections": []
}
```

### 4. **end** - Fim da Conversa
```json
{
  "id": "fim",
  "type": "end",
  "position": { "x": 600, "y": 300 },
  "data": {
    "title": "Fim",
    "description": "Conversa finalizada"
  },
  "connections": []
}
```

## 🔗 Sistema de Conexões

As conexões definem o fluxo entre os nós:

```json
"connections": [
  {
    "id": "start-1-boas-vindas",
    "source": "start-1",
    "target": "boas-vindas"
  },
  {
    "id": "boas-vindas-menu-principal",
    "source": "boas-vindas",
    "target": "menu-principal"
  }
]
```

## 🎯 Propriedades Importantes

### **triggers** - Palavras-chave que ativam o nó
```json
"triggers": [
  "cardapio",
  "menu",
  "comida",
  "pedido",
  "delivery"
]
```

### **response** - Resposta que será enviada
```json
"response": "🍕 *CARDÁPIO DELIVERY*\n\n🍔 Hambúrgueres - R$ 15,00\n🍕 Pizzas - R$ 25,00\n🥗 Saladas - R$ 12,00\n\nDigite o número do item desejado!"
```

### **active** - Se o nó está ativo
```json
"active": true  // ou false para desativar
```

### **position** - Posição no canvas visual
```json
"position": { "x": 300, "y": 150 }
```

## 📝 Exemplos Práticos por Segmento

### 🍕 **Restaurante/Delivery**
```json
{
  "metadata": {
    "version": "1.0",
    "created": "2024-08-21T16:00:00.000Z",
    "description": "Fluxo para Restaurante/Delivery"
  },
  "nodes": [
    {
      "id": "start-1",
      "type": "start",
      "position": { "x": 50, "y": 50 },
      "data": {
        "title": "Início",
        "description": "Cliente inicia conversa"
      },
      "connections": ["boas-vindas"]
    },
    {
      "id": "boas-vindas",
      "type": "message",
      "position": { "x": 200, "y": 50 },
      "data": {
        "title": "Boas-vindas",
        "triggers": ["oi", "olá", "menu", "cardapio"],
        "response": "🍕 Olá! Bem-vindo ao *Restaurante Sabor*!\n\n*1* - 📋 Ver Cardápio\n*2* - 🚚 Fazer Pedido\n*3* - 📞 Falar com Atendente\n\nDigite o número da opção!",
        "active": true
      },
      "connections": ["cardapio", "pedido", "atendente"]
    },
    {
      "id": "cardapio",
      "type": "message",
      "position": { "x": 100, "y": 200 },
      "data": {
        "title": "Cardápio",
        "triggers": ["1", "cardapio", "menu"],
        "response": "📋 *NOSSO CARDÁPIO*\n\n🍔 *Hambúrgueres*\n• X-Burger - R$ 15,00\n• X-Bacon - R$ 18,00\n• X-Tudo - R$ 22,00\n\n🍕 *Pizzas*\n• Margherita - R$ 25,00\n• Calabresa - R$ 28,00\n• Portuguesa - R$ 32,00\n\n🥤 *Bebidas*\n• Refrigerante - R$ 5,00\n• Suco Natural - R$ 8,00\n\nPara fazer pedido, digite *2*!",
        "active": true
      },
      "connections": ["pedido"]
    },
    {
      "id": "pedido",
      "type": "human",
      "position": { "x": 300, "y": 200 },
      "data": {
        "title": "Fazer Pedido",
        "triggers": ["2", "pedido", "pedir"],
        "response": "🛒 *FAZER PEDIDO*\n\nVou transferir você para nosso atendente que anotará seu pedido e calculará o valor total com entrega!\n\n📍 *Área de Entrega:* Centro e bairros próximos\n⏰ *Tempo de entrega:* 30-45 minutos\n\nAguarde que já vou te conectar! 🚚",
        "active": true
      },
      "connections": []
    },
    {
      "id": "atendente",
      "type": "human",
      "position": { "x": 500, "y": 200 },
      "data": {
        "title": "Atendimento Humano",
        "triggers": ["3", "atendente", "operador"],
        "response": "👨‍🍳 Vou conectar você com nosso atendente!\n\nEle pode ajudar com:\n• Pedidos personalizados\n• Informações sobre ingredientes\n• Promoções especiais\n• Dúvidas sobre entrega\n\nAguarde um momento! 📞",
        "active": true
      },
      "connections": []
    }
  ],
  "connections": [
    { "id": "start-1-boas-vindas", "source": "start-1", "target": "boas-vindas" },
    { "id": "boas-vindas-cardapio", "source": "boas-vindas", "target": "cardapio" },
    { "id": "boas-vindas-pedido", "source": "boas-vindas", "target": "pedido" },
    { "id": "boas-vindas-atendente", "source": "boas-vindas", "target": "atendente" },
    { "id": "cardapio-pedido", "source": "cardapio", "target": "pedido" }
  ]
}
```

### 🏥 **Clínica Médica**
```json
{
  "metadata": {
    "version": "1.0",
    "created": "2024-08-21T16:00:00.000Z",
    "description": "Fluxo para Clínica Médica"
  },
  "nodes": [
    {
      "id": "start-1",
      "type": "start",
      "position": { "x": 50, "y": 50 },
      "data": {
        "title": "Início",
        "description": "Paciente inicia conversa"
      },
      "connections": ["boas-vindas"]
    },
    {
      "id": "boas-vindas",
      "type": "message",
      "position": { "x": 200, "y": 50 },
      "data": {
        "title": "Boas-vindas",
        "triggers": ["oi", "olá", "consulta", "agendamento"],
        "response": "🏥 Olá! Bem-vindo à *Clínica Saúde*!\n\n*1* - 📅 Agendar Consulta\n*2* - 📋 Ver Especialidades\n*3* - 🕐 Horários de Funcionamento\n*4* - 👩‍⚕️ Falar com Atendente\n\nDigite o número da opção!",
        "active": true
      },
      "connections": ["agendar", "especialidades", "horarios", "atendente"]
    },
    {
      "id": "agendar",
      "type": "human",
      "position": { "x": 100, "y": 200 },
      "data": {
        "title": "Agendar Consulta",
        "triggers": ["1", "agendar", "consulta", "marcar"],
        "response": "📅 *AGENDAR CONSULTA*\n\nVou transferir você para nossa recepcionista que verificará:\n\n✅ Disponibilidade de horários\n✅ Especialidade desejada\n✅ Convênio médico\n✅ Documentos necessários\n\n⏰ *Horário de atendimento:*\nSegunda a Sexta: 7h às 18h\nSábado: 7h às 12h\n\nAguarde que já vou conectar você! 📞",
        "active": true
      },
      "connections": []
    },
    {
      "id": "especialidades",
      "type": "message",
      "position": { "x": 300, "y": 200 },
      "data": {
        "title": "Especialidades",
        "triggers": ["2", "especialidades", "medicos", "doutor"],
        "response": "👩‍⚕️ *NOSSAS ESPECIALIDADES*\n\n🫀 *Cardiologia*\n• Dr. João Silva - CRM 12345\n• Consultas e exames\n\n🦴 *Ortopedia*\n• Dra. Maria Santos - CRM 67890\n• Fraturas e lesões\n\n👁️ *Oftalmologia*\n• Dr. Pedro Costa - CRM 11111\n• Exames de vista\n\n🧠 *Neurologia*\n• Dra. Ana Lima - CRM 22222\n• Dores de cabeça e mais\n\nPara agendar, digite *1*!",
        "active": true
      },
      "connections": ["agendar"]
    },
    {
      "id": "horarios",
      "type": "message",
      "position": { "x": 500, "y": 200 },
      "data": {
        "title": "Horários",
        "triggers": ["3", "horarios", "funcionamento", "aberto"],
        "response": "🕐 *HORÁRIOS DE FUNCIONAMENTO*\n\n📅 *Segunda a Sexta*\n• Atendimento: 7h às 18h\n• Exames: 7h às 16h\n• Emergência: 24h\n\n📅 *Sábado*\n• Atendimento: 7h às 12h\n• Exames: 8h às 11h\n\n📅 *Domingo e Feriados*\n• Apenas emergências\n\n📍 *Endereço:*\nRua da Saúde, 123 - Centro\n\nPara agendar consulta, digite *1*!",
        "active": true
      },
      "connections": ["agendar"]
    },
    {
      "id": "atendente",
      "type": "human",
      "position": { "x": 700, "y": 200 },
      "data": {
        "title": "Atendimento Humano",
        "triggers": ["4", "atendente", "recepcionista"],
        "response": "👩‍⚕️ Vou conectar você com nossa recepcionista!\n\nEla pode ajudar com:\n• Agendamento de consultas\n• Informações sobre convênios\n• Resultados de exames\n• Localização da clínica\n• Documentos necessários\n\nAguarde um momento! 📞",
        "active": true
      },
      "connections": []
    }
  ],
  "connections": [
    { "id": "start-1-boas-vindas", "source": "start-1", "target": "boas-vindas" },
    { "id": "boas-vindas-agendar", "source": "boas-vindas", "target": "agendar" },
    { "id": "boas-vindas-especialidades", "source": "boas-vindas", "target": "especialidades" },
    { "id": "boas-vindas-horarios", "source": "boas-vindas", "target": "horarios" },
    { "id": "boas-vindas-atendente", "source": "boas-vindas", "target": "atendente" },
    { "id": "especialidades-agendar", "source": "especialidades", "target": "agendar" },
    { "id": "horarios-agendar", "source": "horarios", "target": "agendar" }
  ]
}
```

## 🛠️ Como Usar

### **1. Criar Novo Fluxo**
1. Abra o Editor Visual de Fluxo
2. Clique no botão 📄 (código)
3. Cole seu JSON personalizado
4. Clique em "Aplicar e Salvar"

### **2. Editar Fluxo Existente**
1. Abra o Editor Visual de Fluxo
2. Clique no botão 📄 (código)
3. Edite o JSON conforme necessário
4. Clique em "Aplicar e Salvar"

### **3. Testar Fluxo**
1. Use o simulador integrado
2. Teste no WhatsApp real
3. Monitore logs para debug

## ⚠️ Regras Importantes

### **IDs Únicos**
- Cada nó deve ter um ID único
- Use nomes descritivos: `"menu-principal"`, `"agendar-consulta"`

### **Triggers Eficazes**
- Use palavras que o cliente realmente digitaria
- Inclua variações: `["oi", "olá", "ola", "oie"]`
- Considere erros de digitação comuns

### **Respostas Claras**
- Use emojis para melhor visualização
- Seja específico nas instruções
- Inclua opções numeradas quando possível

### **Conexões Lógicas**
- Todo nó (exceto `end` e `human`) deve ter conexões
- Evite loops infinitos
- Teste todos os caminhos possíveis

## 🎯 Dicas Avançadas

### **Formatação de Texto**
```
*Texto em negrito*
_Texto em itálico_
~Texto riscado~
```

### **Quebras de Linha**
```
"response": "Linha 1\n\nLinha 3 (com espaço)\nLinha 4 (sem espaço)"
```

### **Emojis Recomendados**
- 🏠 Casa/Início
- 📋 Menu/Lista
- 📞 Contato/Telefone
- ⏰ Horário/Tempo
- 💰 Preço/Pagamento
- 🚚 Entrega/Envio
- ✅ Confirmação
- ❌ Erro/Cancelamento

## 🔧 Troubleshooting

### **Erro: "Projeto não encontrado"**
- Certifique-se de ter um projeto selecionado
- Use o projeto padrão se necessário

### **Nó não responde**
- Verifique se `"active": true`
- Confirme se os triggers estão corretos
- Teste com triggers mais simples

### **Fluxo não conecta**
- Verifique se os IDs nas conexões existem
- Confirme se `source` e `target` estão corretos

### **JSON inválido**
- Use um validador JSON online
- Verifique vírgulas e chaves
- Confirme se todas as strings estão entre aspas

---

**🎊 Agora você pode criar fluxos para qualquer tipo de negócio!**

Use este guia como referência e adapte os exemplos para sua necessidade específica.
