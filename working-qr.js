const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

async function workingQR() {
    console.log('🔄 Iniciando WhatsApp com configurações otimizadas...');
    
    try {
        const { state, saveCreds } = await useMultiFileAuthState('./working_auth_' + Date.now());
        
        const sock = makeWASocket({
            auth: state,
            browser: ['WhatsApp-Bot', 'Chrome', '120.0.0'],
            // Configurações específicas para evitar erro 515
            syncFullHistory: false,
            markOnlineOnConnect: false,
            generateHighQualityLinkPreview: false,
            // Timeouts otimizados
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000,
            qrTimeout: 120000,
            // Configurações de keep-alive
            keepAliveIntervalMs: 30000,
            // Configurações de versão compatível
            version: [2, 2323, 4],
            // Configurações de retry
            retryRequestDelayMs: 250,
            maxMsgRetryCount: 5,
            // Logger mínimo
            logger: undefined,
            // Configurações importantes para estabilidade
            emitOwnEvents: false,
            fireInitQueries: true,
            // Configuração de getMessage para evitar erros
            getMessage: async (key) => {
                return {
                    conversation: 'Mensagem não encontrada'
                };
            }
        });
        
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            console.log('🔍 Status:', { connection, hasQR: !!qr, hasError: !!lastDisconnect?.error });
            
            if (qr) {
                console.log('\n' + '='.repeat(60));
                console.log('📱 QR CODE - Escaneie com WhatsApp:');
                console.log('='.repeat(60));
                qrcode.generate(qr, { small: true });
                console.log('='.repeat(60));
                console.log('💡 IMPORTANTE: Escaneie RAPIDAMENTE após aparecer!');
                console.log('📱 WhatsApp > Configurações > Aparelhos conectados > Conectar');
                console.log('='.repeat(60));
            }
            
            if (connection === 'open') {
                console.log('\n✅ CONECTADO COM SUCESSO!');
                console.log('🎉 WhatsApp funcionando perfeitamente!');
                console.log('📱 Usuário:', sock.user?.id);
                console.log('📞 Nome:', sock.user?.name);
                
                // Testar envio de presença para confirmar conexão
                try {
                    await sock.sendPresenceUpdate('available');
                    console.log('✅ Presença configurada com sucesso');
                } catch (presenceError) {
                    console.warn('⚠️ Erro na presença (normal):', presenceError.message);
                }
                
                console.log('\n🚀 SUCESSO! Agora você pode usar o PM2');
                console.log('🔄 Pressione Ctrl+C para sair e usar: pm2 restart whatsapp-bot');
            }
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                
                console.log('❌ Conexão fechada');
                console.log('📋 Status Code:', statusCode);
                console.log('🔍 Erro:', lastDisconnect?.error?.message);
                
                if (statusCode === 515) {
                    console.log('🔧 Erro 515 detectado - Problema de protocolo');
                    console.log('💡 Solução: Aguarde 30 segundos e tente novamente');
                    setTimeout(() => {
                        console.log('🔄 Tentando reconectar...');
                        workingQR();
                    }, 30000);
                } else if (shouldReconnect) {
                    console.log('🔄 Reconectando em 5 segundos...');
                    setTimeout(() => workingQR(), 5000);
                } else {
                    console.log('❌ Deslogado - execute o script novamente');
                    process.exit(1);
                }
            }
        });
        
        sock.ev.on('creds.update', saveCreds);
        
        // Handler para erros não capturados
        sock.ev.on('connection.error', (error) => {
            console.error('❌ Erro de conexão:', error);
        });
        
        console.log('⏳ Aguardando QR code...');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        setTimeout(() => {
            console.log('🔄 Tentando novamente...');
            workingQR();
        }, 10000);
    }
}

// Capturar Ctrl+C
process.on('SIGINT', () => {
    console.log('\n👋 Encerrando...');
    process.exit(0);
});

workingQR();
