# 🔧 Referência Técnica: Criação de Fluxos JSON

## 📋 Especificação Completa

### **Estrutura Raiz**
```json
{
  "metadata": {
    "version": "string",
    "created": "ISO 8601 date",
    "description": "string"
  },
  "nodes": [Array<Node>],
  "connections": [Array<Connection>]
}
```

### **Tipos de Nós Suportados**

#### **1. start** - Nó de Início
```typescript
{
  id: string,           // Identificador único
  type: "start",        // Tipo fixo
  position: {x: number, y: number},
  data: {
    title: string,      // Nome do nó
    description: string // Descrição opcional
  },
  connections: string[] // IDs dos próximos nós
}
```

#### **2. message** - Mensagem Automática
```typescript
{
  id: string,
  type: "message",
  position: {x: number, y: number},
  data: {
    title: string,        // Nome do nó
    triggers: string[],   // Palavras-chave que ativam
    response: string,     // Mensagem enviada
    active: boolean       // Se está ativo
  },
  connections: string[]
}
```

#### **3. human** - Transferência para Operador
```typescript
{
  id: string,
  type: "human",
  position: {x: number, y: number},
  data: {
    title: string,
    triggers: string[],   // Palavras que transferem
    response: string,     // Mensagem antes da transferência
    active: boolean
  },
  connections: string[]   // Geralmente vazio
}
```

#### **4. end** - Fim da Conversa
```typescript
{
  id: string,
  type: "end",
  position: {x: number, y: number},
  data: {
    title: string,
    description: string
  },
  connections: string[]   // Sempre vazio
}
```

### **Conexões**
```typescript
{
  id: string,           // Identificador único
  source: string,       // ID do nó de origem
  target: string        // ID do nó de destino
}
```

## 🎯 Regras de Validação

### **IDs**
- ✅ Devem ser únicos em todo o fluxo
- ✅ Podem conter letras, números, hífens e underscores
- ✅ Recomendado: usar nomes descritivos (`menu-principal`, `agendar-consulta`)

### **Triggers**
- ✅ Array de strings (palavras-chave)
- ✅ Case-insensitive (não diferencia maiúsculas/minúsculas)
- ✅ Suporta acentos e caracteres especiais
- ✅ Trigger especial `"*"` captura qualquer texto

### **Responses**
- ✅ Suporta formatação WhatsApp: `*negrito*`, `_itálico_`, `~riscado~`
- ✅ Quebras de linha: `\n`
- ✅ Emojis suportados
- ✅ Variáveis: `{nome_variavel}` (futuro)

### **Connections**
- ✅ `source` e `target` devem existir como IDs de nós
- ✅ Nós `end` e `human` geralmente não têm conexões de saída
- ✅ Evitar loops infinitos

## 📊 Exemplos por Segmento

### **🛒 E-commerce**
```json
{
  "id": "catalogo",
  "type": "message",
  "position": { "x": 200, "y": 100 },
  "data": {
    "title": "Catálogo de Produtos",
    "triggers": ["catalogo", "produtos", "loja", "comprar"],
    "response": "🛒 *NOSSO CATÁLOGO*\n\n👕 *Roupas*\n• Camisetas - R$ 29,90\n• Calças - R$ 59,90\n\n👟 *Calçados*\n• Tênis - R$ 89,90\n• Sandálias - R$ 39,90\n\n📱 Para comprar, digite *pedido*!",
    "active": true
  },
  "connections": ["fazer-pedido"]
}
```

### **🏥 Saúde**
```json
{
  "id": "agendar-consulta",
  "type": "human",
  "position": { "x": 300, "y": 200 },
  "data": {
    "title": "Agendar Consulta",
    "triggers": ["agendar", "consulta", "marcar", "medico"],
    "response": "📅 *AGENDAR CONSULTA*\n\nVou conectar você com nossa recepcionista para:\n\n✅ Verificar disponibilidade\n✅ Confirmar especialidade\n✅ Validar convênio\n\n⏰ Horário: Seg-Sex 7h-18h\n\nAguarde a conexão! 👩‍⚕️",
    "active": true
  },
  "connections": []
}
```

### **🍕 Restaurante**
```json
{
  "id": "cardapio",
  "type": "message",
  "position": { "x": 150, "y": 150 },
  "data": {
    "title": "Cardápio",
    "triggers": ["cardapio", "menu", "comida", "pratos"],
    "response": "🍽️ *CARDÁPIO DO DIA*\n\n🍕 *Pizzas*\n• Margherita - R$ 25,00\n• Calabresa - R$ 28,00\n• Portuguesa - R$ 32,00\n\n🍔 *Hambúrgueres*\n• X-Burger - R$ 15,00\n• X-Bacon - R$ 18,00\n\n🥤 *Bebidas*\n• Refrigerante - R$ 5,00\n• Suco - R$ 8,00\n\nPara fazer pedido: *delivery*",
    "active": true
  },
  "connections": ["delivery"]
}
```

## 🔧 Ferramentas de Desenvolvimento

### **Validação JSON**
- Use validadores online: jsonlint.com
- Verifique chaves, vírgulas e aspas
- Confirme estrutura de arrays e objetos

### **Teste de Triggers**
```json
// ✅ Bom - múltiplas variações
"triggers": ["oi", "olá", "ola", "oie", "hello"]

// ❌ Ruim - muito específico
"triggers": ["oi como vai"]

// ✅ Bom - captura tudo
"triggers": ["*"]
```

### **Formatação de Respostas**
```json
// ✅ Boa formatação
"response": "🏠 *BEM-VINDO*\n\nEscolha uma opção:\n\n*1* - Produtos\n*2* - Serviços\n*3* - Contato"

// ❌ Difícil de ler
"response": "Bem-vindo escolha 1 produtos 2 servicos 3 contato"
```

## ⚠️ Problemas Comuns

### **JSON Inválido**
```json
// ❌ Erro - vírgula extra
{
  "id": "test",
  "type": "message",
}

// ✅ Correto
{
  "id": "test",
  "type": "message"
}
```

### **IDs Duplicados**
```json
// ❌ Erro - IDs iguais
[
  {"id": "menu", "type": "message"},
  {"id": "menu", "type": "human"}
]

// ✅ Correto - IDs únicos
[
  {"id": "menu-principal", "type": "message"},
  {"id": "menu-atendente", "type": "human"}
]
```

### **Conexões Quebradas**
```json
// ❌ Erro - nó "inexistente" não existe
"connections": [
  {"source": "menu", "target": "inexistente"}
]

// ✅ Correto - todos os IDs existem
"connections": [
  {"source": "menu", "target": "opcao-1"}
]
```

## 🚀 Fluxo de Desenvolvimento

### **1. Planejamento**
- Defina o objetivo do fluxo
- Mapeie as principais interações
- Liste as palavras-chave que os clientes usarão

### **2. Estruturação**
- Comece com o template básico
- Adicione nós um por vez
- Teste cada adição

### **3. Personalização**
- Substitua textos genéricos
- Adicione emojis relevantes
- Configure triggers específicos

### **4. Teste**
- Use o simulador integrado
- Teste todos os caminhos possíveis
- Verifique transferências para operador

### **5. Refinamento**
- Ajuste respostas baseado no feedback
- Adicione novos triggers conforme necessário
- Otimize fluxos longos

## 📈 Boas Práticas

### **Triggers Eficazes**
- Inclua variações comuns: "oi", "olá", "ola"
- Considere erros de digitação: "obrigado", "obrigada", "obrigdo"
- Use sinônimos: "ajuda", "suporte", "apoio"

### **Respostas Claras**
- Use emojis para destacar seções
- Numere opções claramente
- Inclua instruções específicas

### **Fluxo Lógico**
- Mantenha caminhos curtos para ações importantes
- Sempre ofereça saída para atendimento humano
- Evite loops sem saída

### **Performance**
- Limite a 20-30 nós por fluxo
- Use conexões diretas quando possível
- Evite aninhamento excessivo

---

**🎯 Com esta referência, você pode criar fluxos profissionais para qualquer tipo de negócio!**
