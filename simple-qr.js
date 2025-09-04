const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

async function simpleQR() {
    console.log('🔄 Tentativa de QR mais simples...');
    
    try {
        // Auth completamente limpo
        const { state, saveCreds } = await useMultiFileAuthState('./temp_auth_' + Date.now());
        
        const sock = makeWASocket({
            auth: state,
            browser: ['Bot', 'Desktop', '1.0']
        });
        
        sock.ev.on('connection.update', (update) => {
            if (update.qr) {
                console.log('\n📱 QR CODE:');
                console.log('=' * 40);
                qrcode.generate(update.qr, { small: true });
                console.log('=' * 40);
                console.log('Escaneie com WhatsApp!');
            }
            
            if (update.connection === 'open') {
                console.log('✅ Sucesso!');
                process.exit(0);
            }
        });
        
        sock.ev.on('creds.update', saveCreds);
        
    } catch (error) {
        console.error('Erro:', error.message);
    }
}

simpleQR();
