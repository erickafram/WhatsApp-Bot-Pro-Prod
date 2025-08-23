# 🔧 Guia de Desenvolvimento - WhatsApp Bot

## 🚀 Comandos para Desenvolvimento

### Iniciar ambiente de desenvolvimento
```bash
# Comando principal - roda frontend e backend simultaneamente
npm run dev
```

### Comandos separados (se necessário)
```bash
# Apenas o backend (servidor + WhatsApp)
npm run server:dev

# Apenas o frontend (React)
npm run client:dev
```

## ✅ Vantagens do modo desenvolvimento

### Frontend (React + Vite)
- **Hot Reload**: Mudanças aparecem instantaneamente no navegador
- **Sem rebuild**: Não precisa recompilar
- **CSS ao vivo**: Mudanças de estilo aplicadas em tempo real

### Backend (Node.js + TypeScript)
- **Watch mode**: Monitora mudanças nos arquivos `.ts`
- **Restart inteligente**: Reinicia apenas o necessário
- **WhatsApp preservado**: A instância permanece conectada

## 🎯 Fluxo de Trabalho

1. **Primeira vez**: 
   ```bash
   npm install
   cd client && npm install
   cd ..
   npm run dev
   ```

2. **Desenvolvimento diário**:
   ```bash
   npm run dev
   ```

3. **Fazer alterações**:
   - Edite arquivos `.tsx`, `.ts`, `.css`
   - Mudanças aparecem automaticamente
   - WhatsApp permanece conectado

4. **Deploy/Produção** (apenas quando terminar):
   ```bash
   npm run build
   npm run start
   ```

## ⚠️ Comandos que REINICIAM o WhatsApp

**EVITE durante desenvolvimento:**
- `npm run build` - reconstrói tudo
- `npm run start` - modo produção
- `Ctrl+C` no terminal - para o servidor

## 🔄 Tipos de Mudanças

### ✅ SEM restart do WhatsApp
- Alterações no frontend (React, CSS, TypeScript)
- Mudanças em rotas de API
- Modificações em componentes

### ⚠️ COM restart do WhatsApp  
- Mudanças na configuração do WhatsApp
- Alterações no arquivo principal do servidor
- Modificações em dependências

## 🆘 Se perder a conexão

Se mesmo usando `npm run dev` a conexão cair:

1. Verifique se há erros no terminal
2. Escaneie o QR code novamente
3. Verifique se o arquivo `.env` está correto
