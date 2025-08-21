# 🚀 Guia Rápido: Como Aplicar o Novo Fluxo

## ⚡ Passo a Passo Simples

### **1. Abrir o Editor de Código**
1. Vá para **Templates/Mensagens Automáticas**
2. Clique em **"Ver Fluxo"** 
3. Clique no botão **📄** (código) no toolbar

### **2. Colar o Novo Fluxo**
1. **Apague** todo o código atual na textarea
2. **Cole** o código JSON que você criou (o fluxo melhorado)
3. Verifique se não há erros de sintaxe

### **3. Aplicar e Salvar no Banco**
1. Clique no botão **"Aplicar e Salvar"** (botão verde)
2. ⚠️ **IMPORTANTE**: Certifique-se de ter um projeto selecionado (não "default")
3. Aguarde a confirmação de sucesso

### **4. Verificar se Funcionou**
1. Volte para visualização visual (clique no 📄 novamente)
2. Veja se os novos nós aparecem no fluxo
3. Teste o bot enviando uma mensagem

---

## 🔧 Solução de Problemas

### **Problema: Botão "Aplicar e Salvar" está desabilitado**
**Solução**: 
- Verifique se você tem um projeto selecionado
- Se estiver em "default", crie um novo projeto primeiro

### **Problema: Fluxo não mudou no WhatsApp**
**Solução**:
- Verifique se o projeto correto está selecionado
- Reinicie o servidor se necessário
- Teste com uma palavra-chave específica do novo fluxo

### **Problema: Erro ao aplicar código**
**Solução**:
- Verifique se o JSON está válido
- Use um validador JSON online se necessário
- Certifique-se de que todas as chaves estão entre aspas

---

## 📋 Seu Fluxo Atual

Você criou um fluxo com coleta sequencial de dados:

1. **Boas-vindas** → Menu de opções
2. **Comprar Passagem** → Escolher cidade
3. **Cidade Confirmada** → Solicitar nome
4. **Coletar Telefone** → Próximo passo
5. **Coletar Data** → Próximo passo  
6. **Coletar CPF** → Transferir para operador

### **Palavras-chave importantes:**
- `"1"`, `"comprar"`, `"passagem"` → Inicia processo de compra
- `"teresina"`, `"são luís"`, etc. → Confirma cidade
- Qualquer texto → Coleta dados sequencialmente

---

## ✅ Checklist Final

- [ ] Projeto selecionado (não "default")
- [ ] Código JSON colado corretamente
- [ ] Clicado em "Aplicar e Salvar" (botão verde)
- [ ] Confirmação de sucesso recebida
- [ ] Testado no WhatsApp

---

## 🆘 Se Ainda Não Funcionar

### **Opção 1: Verificar Templates Individuais**
1. Vá para a aba **"Templates"** (não o editor visual)
2. Veja se os templates foram criados
3. Verifique se estão ativos (toggle verde)

### **Opção 2: Recriar Manualmente**
1. Delete todos os templates existentes
2. Crie cada template manualmente:
   - **Template 1**: Triggers `["1", "comprar"]` → Resposta com lista de cidades
   - **Template 2**: Triggers `["teresina", "são luís"]` → Solicitar nome
   - E assim por diante...

### **Opção 3: Verificar Logs**
1. Abra o console do navegador (F12)
2. Procure por erros em vermelho
3. Verifique se há mensagens de sucesso em verde

---

## 🎯 Resultado Esperado

Quando funcionar corretamente:

**Cliente digita**: "1" ou "comprar"
**Bot responde**: Lista de cidades disponíveis

**Cliente digita**: "teresina" 
**Bot responde**: "Por favor, digite seu nome completo:"

**Cliente digita**: "João Silva"
**Bot responde**: "Obrigado, João Silva! Agora digite seu telefone..."

E assim por diante até transferir para operador com todos os dados coletados.

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique este guia primeiro
2. Teste cada passo individualmente  
3. Documente exatamente onde está travando
4. Compartilhe prints ou logs de erro

**Lembre-se**: O sistema funciona, só precisa ser aplicado corretamente! 💪
