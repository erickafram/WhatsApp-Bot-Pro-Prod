const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const path = require('path');

async function connectBaileys() {
    console.log('🔄 Conectando Baileys com configurações otimizadas...');
    
    try {
        const authDir = path.join(__dirname, 'baileys_auth_' + Date.now());
        const { state, saveCreds } = await useMultiFileAuthState(authDir);
        
        const sock = makeWASocket({
            auth: state,
            browser: ['WhatsApp-Bot', 'Chrome', '120.0.0'],
            // Configurações otimizadas para servidor
            syncFullHistory: false,
            markOnlineOnConnect: false,
            generateHighQualityLinkPreview: false,
            // Timeouts aumentados
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000,
            qrTimeout: 120000,
            // Configurações de reconexão
            retryRequestDelayMs: 1000,
            maxMsgRetryCount: 3,
            // Configurações de keep alive
            keepAliveIntervalMs: 30000,
            // Configurações importantes para evitar erro 515
            emitOwnEvents: false,
            fireInitQueries: true,
            shouldSyncHistoryMessage: () => false,
            // Configuração de versão específica
            version: [2, 2329, 9],
            // Logger mínimo
            logger: undefined
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
                console.log('💡 Escaneie o QR code acima com seu WhatsApp');
                console.log('='.repeat(60));
            }
            
            if (connection === 'open') {
                console.log('\n✅ CONECTADO COM SUCESSO!');
                console.log('📱 WhatsApp funcionando!');
                console.log('🆔 ID:', sock.user?.id);
                console.log('📞 Nome:', sock.user?.name);
                
                // Configurar presença inicial
                try {
                    await sock.sendPresenceUpdate('available');
                    console.log('✅ Presença configurada');
                } catch (presenceError) {
                    console.log('⚠️ Erro na presença:', presenceError.message);
                }
                
                // Manter conexão ativa
                console.log('🔄 Mantendo conexão ativa... (Ctrl+C para sair)');
                
                // Não sair automaticamente - deixar rodando
                setInterval(() => {
                    console.log('💓 Heartbeat - Conexão ativa');
                }, 30000);
            }
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                
                console.log('❌ Conexão fechada. Status:', statusCode);
                console.log('📋 Erro:', lastDisconnect?.error?.message);
                
                if (statusCode === 515) {
                    console.log('🔧 Erro 515 detectado - tentando com configurações diferentes...');
                    // Aguardar mais tempo antes de reconectar
                    setTimeout(() => {
                        console.log('🔄 Reconectando com delay aumentado...');
                        connectBaileys();
                    }, 10000);
                } else if (shouldReconnect) {
                    console.log('🔄 Reconectando...');
                    setTimeout(() => connectBaileys(), 5000);
                } else {
                    console.log('❌ Não reconectando - usuário deslogado');
                    process.exit(1);
                }
            }
        });
        
        sock.ev.on('creds.update', saveCreds);
        
        // Handler para mensagens (teste)
        sock.ev.on('messages.upsert', (messageUpsert) => {
            const messages = messageUpsert.messages;
            for (const msg of messages) {
                if (!msg.message) continue;
                if (msg.key.fromMe) continue;
                
                const sender = msg.key.remoteJid;
                const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
                
                console.log('📨 Nova mensagem de:', sender);
                console.log('💬 Texto:', text);
            }
        });
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.error('📋 Stack:', error.stack);
        
        // Tentar novamente após erro
        setTimeout(() => {
            console.log('🔄 Tentando novamente...');
            connectBaileys();
        }, 5000);
    }
}

// Capturar Ctrl+C
process.on('SIGINT', () => {
    console.log('\n🔄 Encerrando...');
    process.exit(0);
});

connectBaileys();
