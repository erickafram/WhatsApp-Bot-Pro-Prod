# Fluxo Melhorado - Viação Tocantins

## 🎯 Objetivo da Melhoria

Transformar o processo de coleta de dados de **uma única mensagem com todas as informações** para um **processo sequencial passo a passo**, melhorando a experiência do usuário e aumentando a taxa de conversão.

## ✅ Principais Melhorias Implementadas

### 1. **Coleta Sequencial de Dados**
**Antes**: Uma mensagem pedindo todos os dados de uma vez
```
Para finalizar sua compra, preciso de algumas informações:
👤 Nome completo
📱 Telefone para contato  
📅 Data da viagem desejada
🆔 CPF
```

**Depois**: Processo passo a passo
- **Passo 1**: Solicita apenas o nome
- **Passo 2**: Solicita apenas o telefone
- **Passo 3**: Solicita apenas a data
- **Passo 4**: Solicita apenas o CPF
- **Final**: Transfere para operador com todos os dados

### 2. **Novos Nós Criados**

#### **collect-phone** (Coletar Telefone)
```json
{
  "title": "Coletar Telefone",
  "triggers": ["NOME_COLETADO"],
  "response": "✅ Nome registrado com sucesso!\n\n📱 *PASSO 2 de 4*\n\nAgora preciso do seu *telefone para contato*:\n\n📝 Digite apenas os números\n💡 Exemplo: 63999887766"
}
```

#### **collect-date** (Coletar Data)
```json
{
  "title": "Coletar Data da Viagem", 
  "triggers": ["TELEFONE_COLETADO"],
  "response": "✅ Telefone registrado com sucesso!\n\n📅 *PASSO 3 de 4*\n\nQual a *data da viagem desejada*?\n\n📝 Digite no formato DD/MM/AAAA\n💡 Exemplo: 25/08/2024"
}
```

#### **collect-cpf** (Coletar CPF)
```json
{
  "title": "Coletar CPF",
  "triggers": ["DATA_COLETADA"], 
  "response": "✅ Data da viagem registrada!\n\n🆔 *PASSO 4 de 4*\n\nPor último, preciso do seu *CPF*:\n\n📝 Digite apenas os números\n💡 Exemplo: 12345678901"
}
```

#### **transfer-to-operator** (Transferir para Operador)
```json
{
  "title": "Transferir para Operador",
  "triggers": ["CPF_COLETADO"],
  "response": "✅ *DADOS COLETADOS COM SUCESSO!*\n\n📋 *Resumo da sua solicitação:*\n👤 Nome: {nome_cliente}\n📱 Telefone: {telefone_cliente}\n📅 Data da viagem: {data_viagem}\n🆔 CPF: {cpf_cliente}\n📍 Rota: Palmas-TO → {cidade_escolhida}\n\n🎫 Agora vou transferir você para um de nossos operadores..."
}
```

### 3. **Melhorias na Experiência do Usuário**

#### **Feedback Visual Claro**
- ✅ Confirmação a cada passo completado
- 📊 Indicador de progresso (PASSO X de 4)
- 💡 Exemplos práticos para cada campo
- 📝 Instruções claras de formatação

#### **Mensagens Mais Amigáveis**
- Linguagem mais conversacional
- Emojis para melhor visualização
- Confirmações positivas a cada etapa
- Instruções específicas para cada campo

#### **Tratamento de Erros Melhorado**
- Nó específico para cidades não disponíveis
- Opções alternativas quando destino não está disponível
- Redirecionamento inteligente para operador

### 4. **Fluxo de Navegação Otimizado**

```
Início → Boas-vindas → Opções
    ↓
Comprar Passagem → Escolher Cidade
    ↓
Cidade Disponível → Coletar Nome
    ↓
Coletar Telefone → Coletar Data
    ↓
Coletar CPF → Transferir para Operador
```

## 🔧 Como Implementar

### **Opção 1: Usar o Editor Visual de Código**
1. Abra o Editor Visual de Fluxo
2. Clique no botão 📄 (código)
3. Clique em "Exemplo" para carregar o novo fluxo
4. Clique em "Aplicar Alterações"
5. Salve o fluxo

### **Opção 2: Importar Arquivo JSON**
1. Use o arquivo `fluxo-viacao-tocantins-melhorado.json`
2. No Editor Visual, clique em ⬆️ (importar)
3. Selecione o arquivo JSON
4. Confirme a importação

### **Opção 3: Criar Manualmente**
1. Adicione os novos nós no editor visual
2. Configure os triggers e respostas
3. Conecte os nós na sequência correta
4. Teste o fluxo

## 📊 Benefícios Esperados

### **Para o Cliente**
- ✅ **Processo Mais Simples**: Uma pergunta por vez
- ✅ **Menos Confusão**: Instruções claras e específicas
- ✅ **Feedback Imediato**: Confirmação a cada passo
- ✅ **Orientação Clara**: Exemplos práticos para cada campo

### **Para a Empresa**
- ✅ **Maior Taxa de Conversão**: Menos abandono no meio do processo
- ✅ **Dados Mais Precisos**: Coleta estruturada reduz erros
- ✅ **Melhor Qualificação**: Clientes chegam ao operador com dados completos
- ✅ **Processo Padronizado**: Todos os clientes seguem o mesmo fluxo

### **Para o Operador**
- ✅ **Informações Completas**: Recebe todos os dados organizados
- ✅ **Contexto Claro**: Sabe exatamente o que o cliente quer
- ✅ **Processo Agilizado**: Pode focar na finalização da venda
- ✅ **Menos Retrabalho**: Não precisa coletar dados básicos

## 🎨 Personalização Adicional

### **Triggers Expandidos**
Adicionei mais variações para capturar diferentes formas de escrita:
- "são luís" e "sao luis"
- "brasília" e "brasilia" 
- "goiânia" e "goiania"
- "araguaína" e "araguaina"
- "paraíso" e "paraiso"
- "parnaíba" e "parnaiba"

### **Validações Sugeridas**
Para implementação futura no backend:
- **Nome**: Mínimo 2 palavras
- **Telefone**: 10-11 dígitos numéricos
- **Data**: Formato DD/MM/AAAA, data futura
- **CPF**: 11 dígitos, validação de CPF

### **Variáveis de Contexto**
O fluxo usa variáveis para personalização:
- `{nome_cliente}` - Nome coletado
- `{telefone_cliente}` - Telefone coletado
- `{data_viagem}` - Data coletada
- `{cpf_cliente}` - CPF coletado
- `{cidade_escolhida}` - Destino selecionado

## 🚀 Próximos Passos

### **Implementação Imediata**
1. ✅ Importar o novo fluxo
2. ✅ Testar com diferentes cenários
3. ✅ Treinar operadores sobre o novo processo
4. ✅ Monitorar métricas de conversão

### **Melhorias Futuras**
- 🔄 Integração com sistema de reservas
- 💳 Processo de pagamento automatizado
- 📧 Envio automático de confirmação
- 📊 Dashboard de métricas de conversão

## 📞 Suporte

Para dúvidas sobre a implementação:
1. Consulte a documentação do Editor Visual de Código
2. Use o fluxo de exemplo para testes
3. Monitore logs do sistema para debugging
4. Colete feedback dos operadores

---

**Status**: ✅ Fluxo Melhorado e Pronto para Implementação
**Impacto Esperado**: Alto - Melhoria significativa na experiência do cliente
**Tempo de Implementação**: 15-30 minutos
**Data**: 21/08/2024
