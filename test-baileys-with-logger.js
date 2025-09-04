const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const path = require('path');
const fs = require('fs');

async function testWithLogger() {
  console.log('🔄 Testando Baileys com logger...');
  
  // Criar logger silencioso
  const logger = P({ level: 'silent' });
  
  const managerId = 1;
  const instanceId = 999;
  const authDir = path.join(__dirname, 'auth_baileys', `manager_${managerId}_instance_${instanceId}`);
  
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }
  
  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: ['Ubuntu', 'Chrome', '120.0.0'],
    logger: logger, // Usar logger válido
    getMessage: async (key) => {
      return { conversation: 'hello' };
    }
  });

  sock.ev.on('connection.update', (update) => {
    console.log('📡 Connection update:', update.connection);
    if (update.qr) {
      console.log('📱 QR CODE GERADO!');
    }
    if (update.connection === 'open') {
      console.log('✅ CONECTADO COM SUCESSO!');
      process.exit(0);
    }
    if (update.connection === 'close') {
      console.log('❌ Conexão fechada');
      process.exit(1);
    }
  });

  sock.ev.on('creds.update', saveCreds);
  
  console.log('✅ Socket criado com sucesso - aguardando conexão...');
}

testWithLogger().catch((error) => {
  console.error('❌ Erro no teste:', error.message);
  process.exit(1);
});
