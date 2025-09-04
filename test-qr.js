const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const path = require('path');

async function testQR() {
    try {
        console.log('🔄 Iniciando teste de QR Code...');
        
        const authDir = path.join(__dirname, 'auth_test');
        const { state, saveCreds } = await useMultiFileAuthState(authDir);
        
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: true, // Habilitar QR no terminal
            browser: ['Test', 'Chrome', '1.0.0']
        });
        
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log('\n📱 QR CODE APARECEU ACIMA! Escaneie com seu WhatsApp\n');
            }
            
            if (connection === 'open') {
                console.log('✅ Conectado com sucesso!');
                process.exit(0);
            }
            
            if (connection === 'close') {
                console.log('❌ Conexão fechada');
                process.exit(1);
            }
        });
        
        sock.ev.on('creds.update', saveCreds);
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        
        if (error.message.includes("Cannot read properties of undefined (reading 'child')")) {
            console.log('\n🔧 SOLUÇÕES PARA TENTAR:');
            console.log('1. apt install -y build-essential python3-dev');
            console.log('2. npm install --unsafe-perm=true --allow-root');
            console.log('3. npm install @whiskeysockets/baileys@6.6.0');
        }
        
        process.exit(1);
    }
}

testQR();
