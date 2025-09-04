const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const path = require('path');

async function testQR() {
    try {
        console.log('🔄 Iniciando teste de QR Code...');
        
        const authDir = path.join(__dirname, 'auth_test');
        const { state, saveCreds } = await useMultiFileAuthState(authDir);
        
        const sock = makeWASocket({
            auth: state,
            browser: ['Test', 'Chrome', '1.0.0']
        });
        
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log('\n📱 QR CODE GERADO! Escaneie com seu WhatsApp:');
                console.log('=' * 50);
                // Mostrar QR code no terminal
                qrcode.generate(qr, { small: true });
                console.log('=' * 50);
                console.log('💡 Escaneie o QR code acima com seu WhatsApp');
                console.log('📱 WhatsApp > Configurações > Aparelhos conectados > Conectar aparelho');
            }
            
            if (connection === 'open') {
                console.log('✅ Conectado com sucesso!');
                console.log('📱 WhatsApp está funcionando!');
                
                // Aguardar 5 segundos para manter conexão e depois sair
                setTimeout(() => {
                    console.log('🔄 Teste concluído, encerrando...');
                    process.exit(0);
                }, 5000);
            }
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
                console.log('❌ Conexão fechada:', lastDisconnect?.error);
                
                if (shouldReconnect) {
                    console.log('🔄 Tentando reconectar...');
                    setTimeout(() => testQR(), 3000);
                } else {
                    console.log('❌ Deslogado, pare o script e execute novamente');
                    process.exit(1);
                }
            }
        });
        
        sock.ev.on('creds.update', saveCreds);
        
        // Timeout de 2 minutos para gerar QR
        setTimeout(() => {
            console.log('⏰ Timeout - QR code não foi gerado em 2 minutos');
            process.exit(1);
        }, 120000);
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testQR();
