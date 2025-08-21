# Editor Visual de Fluxo - Visualização de Código

## Visão Geral

O Editor Visual de Fluxo agora inclui uma funcionalidade para visualizar e editar o código JSON do fluxo de conversação. Esta funcionalidade permite que desenvolvedores e usuários avançados tenham controle total sobre a estrutura do fluxo através de código.

## Como Acessar

1. Abra o **Editor Visual de Fluxo** clicando em "Ver Fluxo" na seção de Templates
2. No toolbar do editor, clique no botão **📄** (ícone de arquivo) para alternar para a visualização de código
3. Para voltar à visualização visual, clique novamente no mesmo botão

## Funcionalidades

### 1. Visualização de Código
- Exibe o fluxo atual em formato JSON estruturado
- Mostra todos os nós (nodes) e conexões (connections) do fluxo
- Inclui metadados como versão e data de criação

### 2. Edição de Código
- Editor de texto com syntax highlighting para JSON
- Validação em tempo real da estrutura JSON
- Mensagens de erro claras quando há problemas de sintaxe

### 3. Aplicar Alterações
- Botão "Aplicar Alterações" para converter o código editado de volta para o fluxo visual
- Validação automática antes da aplicação
- Feedback visual de sucesso ou erro

### 4. Exportar/Importar
- **Exportar**: Salva o fluxo atual como arquivo JSON
- **Importar**: Carrega um fluxo de um arquivo JSON externo

## Estrutura do Código JSON

```json
{
  "metadata": {
    "version": "1.0",
    "created": "2024-01-01T00:00:00.000Z",
    "description": "Fluxo de conversação automática"
  },
  "nodes": [
    {
      "id": "start-1",
      "type": "start",
      "position": { "x": 50, "y": 50 },
      "data": {
        "title": "Início",
        "description": "Usuário inicia conversa"
      },
      "connections": ["message-1"]
    }
  ],
  "connections": [
    {
      "id": "start-1-message-1",
      "source": "start-1",
      "target": "message-1"
    }
  ]
}
```

### Propriedades dos Nós

#### Propriedades Comuns
- **id**: Identificador único do nó
- **type**: Tipo do nó (start, message, condition, options, human, end)
- **position**: Coordenadas x,y no canvas
- **data**: Dados específicos do nó
- **connections**: Array com IDs dos nós conectados

#### Tipos de Nós

**1. Start (Início)**
```json
{
  "type": "start",
  "data": {
    "title": "Início",
    "description": "Usuário inicia conversa"
  }
}
```

**2. Message (Mensagem/Template)**
```json
{
  "type": "message",
  "data": {
    "title": "Boas-vindas",
    "triggers": ["oi", "olá", "menu"],
    "response": "Olá! Como posso ajudar?",
    "active": true
  }
}
```

**3. Condition (Condição)**
```json
{
  "type": "condition",
  "data": {
    "title": "Verificar horário",
    "conditions": [
      {
        "field": "time",
        "operator": "between",
        "value": "09:00-18:00"
      }
    ]
  }
}
```

**4. Options (Opções/Menu)**
```json
{
  "type": "options",
  "data": {
    "title": "Menu Principal",
    "options": [
      { "id": "1", "label": "Vendas", "value": "vendas" },
      { "id": "2", "label": "Suporte", "value": "suporte" }
    ]
  }
}
```

**5. Human (Atendimento Humano)**
```json
{
  "type": "human",
  "data": {
    "title": "Transferir para Atendente",
    "description": "Conversa será transferida para um operador humano"
  }
}
```

**6. End (Fim)**
```json
{
  "type": "end",
  "data": {
    "title": "Fim da Conversa",
    "description": "Conversa finalizada"
  }
}
```

### Propriedades das Conexões

- **id**: Identificador único da conexão
- **source**: ID do nó de origem
- **target**: ID do nó de destino
- **sourceHandle**: (Opcional) Handle específico do nó de origem
- **targetHandle**: (Opcional) Handle específico do nó de destino

## Casos de Uso

### 1. Edição Avançada
- Modificar múltiplos nós simultaneamente
- Ajustar posicionamento preciso dos nós
- Configurar propriedades avançadas não disponíveis na interface visual

### 2. Backup e Versionamento
- Exportar fluxos para backup
- Controle de versão usando sistemas como Git
- Compartilhamento de fluxos entre equipes

### 3. Automação
- Geração programática de fluxos
- Integração com ferramentas externas
- Scripts para criação de fluxos complexos

### 4. Debugging
- Análise detalhada da estrutura do fluxo
- Identificação de problemas de conectividade
- Validação de dados dos nós

## Dicas e Boas Práticas

### 1. Validação
- Sempre valide o JSON antes de aplicar alterações
- Use ferramentas online de validação JSON se necessário
- Mantenha backup do fluxo antes de fazer alterações grandes

### 2. Nomenclatura
- Use IDs descritivos para os nós
- Mantenha consistência na nomenclatura
- Documente alterações complexas

### 3. Estrutura
- Mantenha a estrutura hierárquica clara
- Evite conexões circulares desnecessárias
- Organize nós logicamente no canvas

### 4. Performance
- Evite fluxos muito complexos com muitos nós
- Otimize conexões para melhor performance
- Teste fluxos após alterações significativas

## Solução de Problemas

### Erro de JSON Inválido
- Verifique vírgulas, chaves e colchetes
- Use um validador JSON online
- Confira se todas as strings estão entre aspas

### Nós Não Aparecem
- Verifique se o array "nodes" está presente
- Confirme se cada nó tem ID único
- Verifique se as posições são válidas

### Conexões Quebradas
- Confirme se os IDs de source e target existem
- Verifique se o array "connections" está correto
- Teste as conexões na visualização visual

## Suporte

Para dúvidas ou problemas com a funcionalidade de código:
1. Verifique esta documentação
2. Teste na visualização visual primeiro
3. Use a funcionalidade de exportar/importar para backup
4. Entre em contato com o suporte técnico se necessário
