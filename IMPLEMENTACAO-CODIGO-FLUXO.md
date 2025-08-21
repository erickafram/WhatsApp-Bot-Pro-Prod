# Implementação: Visualização de Código no Editor Visual de Fluxo

## ✅ Funcionalidades Implementadas

### 1. **Botão de Alternância de Visualização**
- Novo botão no toolbar do Editor Visual de Fluxo (ícone 📄)
- Alterna entre visualização visual e visualização de código
- Estado visual ativo quando em modo código

### 2. **Editor de Código JSON**
- Interface completa para visualizar e editar código JSON do fluxo
- Textarea com fonte monospace para melhor legibilidade
- Validação de sintaxe JSON em tempo real
- Mensagens de erro claras e informativas

### 3. **Conversão Bidirecional**
- **Visual → Código**: Converte fluxo visual para JSON estruturado
- **Código → Visual**: Aplica alterações do código de volta ao fluxo visual
- Preserva todas as propriedades dos nós e conexões

### 4. **Funcionalidades Avançadas**
- **Exportar**: Salva fluxo como arquivo JSON
- **Importar**: Carrega fluxo de arquivo JSON externo
- **Exemplo**: Carrega fluxo de demonstração para aprendizado
- **Aplicar Alterações**: Converte código editado para fluxo visual

### 5. **Interface Responsiva**
- Design adaptativo para diferentes tamanhos de tela
- Otimizada para desktop e mobile
- Estilos consistentes com o resto da aplicação

## 🔧 Arquivos Modificados

### `client/src/components/Messages.tsx`
- **Novos Estados**: `showCodeView`, `flowCode`, `codeError`
- **Novas Funções**:
  - `convertFlowToCode()`: Converte fluxo para JSON
  - `convertCodeToFlow()`: Converte JSON para fluxo
  - `toggleCodeView()`: Alterna visualização
  - `handleCodeChange()`: Gerencia mudanças no código
  - `applyCodeChanges()`: Aplica código ao fluxo
  - `exportFlowCode()`: Exporta como arquivo
  - `importFlowCode()`: Importa de arquivo
  - `loadExampleFlow()`: Carrega exemplo

### `client/src/App.css`
- **Novos Estilos**:
  - `.code-editor-container`: Container principal
  - `.code-editor-header`: Cabeçalho com ações
  - `.code-textarea`: Área de edição de código
  - `.code-error`: Mensagens de erro
  - `.code-help`: Seção de ajuda
  - `.toolbar-btn.active`: Estado ativo do botão

### `docs/editor-visual-codigo.md`
- Documentação completa da funcionalidade
- Exemplos de estrutura JSON
- Guia de uso e boas práticas
- Solução de problemas

## 🚀 Como Usar

### Passo 1: Acessar o Editor
1. Vá para a seção **Templates/Mensagens Automáticas**
2. Clique em **"Ver Fluxo"** para abrir o Editor Visual
3. O editor será exibido com o fluxo atual

### Passo 2: Alternar para Código
1. No toolbar do editor, clique no botão **📄** (FileText)
2. A visualização mudará para o editor de código
3. O código JSON do fluxo atual será exibido

### Passo 3: Editar Código
1. Edite o JSON diretamente na textarea
2. Use o botão **"Exemplo"** para carregar um fluxo de demonstração
3. Observe as mensagens de erro se houver problemas de sintaxe

### Passo 4: Aplicar Alterações
1. Clique em **"Aplicar Alterações"** para converter o código para fluxo visual
2. Se houver erros, eles serão exibidos em vermelho
3. Se bem-sucedido, você pode voltar à visualização visual

### Passo 5: Exportar/Importar
- **Exportar**: Use o botão ⬇️ no toolbar para salvar como JSON
- **Importar**: Use o botão ⬆️ no toolbar para carregar de arquivo

## 📋 Estrutura do JSON

```json
{
  "metadata": {
    "version": "1.0",
    "created": "2024-08-21T15:00:00.000Z",
    "description": "Fluxo de conversação automática"
  },
  "nodes": [
    {
      "id": "start-1",
      "type": "start|message|condition|options|human|end",
      "position": { "x": 50, "y": 50 },
      "data": {
        "title": "Título do Nó",
        "description": "Descrição opcional",
        "triggers": ["palavra1", "palavra2"],
        "response": "Resposta automática",
        "active": true
      },
      "connections": ["id-do-proximo-no"]
    }
  ],
  "connections": [
    {
      "id": "conexao-1",
      "source": "no-origem",
      "target": "no-destino"
    }
  ]
}
```

## 🎯 Casos de Uso

### 1. **Edição Avançada**
- Modificar múltiplos nós simultaneamente
- Ajustar posicionamento preciso
- Configurar propriedades avançadas

### 2. **Backup e Versionamento**
- Exportar fluxos para backup
- Controle de versão com Git
- Compartilhamento entre equipes

### 3. **Automação**
- Geração programática de fluxos
- Scripts para criação em massa
- Integração com ferramentas externas

### 4. **Debugging**
- Análise detalhada da estrutura
- Identificação de problemas
- Validação de conectividade

## ⚠️ Considerações Importantes

### Validação
- Sempre valide o JSON antes de aplicar
- Mantenha backup antes de alterações grandes
- Teste o fluxo após modificações

### Performance
- Evite fluxos muito complexos
- Otimize conexões desnecessárias
- Monitore performance com muitos nós

### Compatibilidade
- Mantenha estrutura JSON consistente
- Use IDs únicos para nós
- Preserve propriedades obrigatórias

## 🔍 Exemplo Prático

O botão "Exemplo" carrega um fluxo completo com:
- Nó de início
- Mensagem de boas-vindas
- Menu de opções
- Respostas para vendas e suporte
- Transferência para atendimento humano
- Nó de finalização

Este exemplo serve como base para criar seus próprios fluxos ou entender a estrutura JSON.

## 📞 Suporte

Para dúvidas sobre a implementação:
1. Consulte a documentação em `docs/editor-visual-codigo.md`
2. Use o fluxo de exemplo para aprender
3. Teste sempre na visualização visual após alterações
4. Mantenha backups dos fluxos importantes

---

**Status**: ✅ Implementação Completa e Funcional
**Versão**: 1.0
**Data**: 21/08/2024
