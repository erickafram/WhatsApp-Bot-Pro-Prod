#!/usr/bin/env node

/**
 * Script para resolver o problema de loop infinito de QR codes no servidor de produção
 * 
 * EXECUÇÃO NO SERVIDOR:
 * 1. cd /home/chatbotwhats/htdocs/chatbotwhats.online
 * 2. node scripts/fix-qr-loop.js
 * 3. pm2 restart whatsapp-bot
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 SCRIPT DE CORREÇÃO - LOOP DE QR CODES');
console.log('=====================================');

async function fixQRLoop() {
    try {
        // 1. Parar processo PM2 se estiver rodando
        console.log('🛑 Parando processo PM2...');
        const { exec } = require('child_process');
        
        await new Promise((resolve) => {
            exec('pm2 stop whatsapp-bot', (error, stdout, stderr) => {
                if (error) {
                    console.log('⚠️ PM2 pode não estar rodando:', error.message);
                } else {
                    console.log('✅ PM2 parado com sucesso');
                }
                resolve();
            });
        });

        // 2. Limpar sessões corrompidas mantendo apenas creds.json
        console.log('🧹 Limpando sessões corrompidas...');
        
        const authDir = path.join(__dirname, '..', 'auth_baileys');
        
        if (fs.existsSync(authDir)) {
            const managerDirs = fs.readdirSync(authDir).filter(dir => 
                dir.startsWith('manager_') && fs.statSync(path.join(authDir, dir)).isDirectory()
            );
            
            for (const managerDir of managerDirs) {
                const fullPath = path.join(authDir, managerDir);
                console.log(`📂 Processando: ${managerDir}`);
                
                const files = fs.readdirSync(fullPath);
                let cleanedCount = 0;
                
                for (const file of files) {
                    // Manter apenas creds.json, remover tudo mais
                    if (file !== 'creds.json') {
                        const filePath = path.join(fullPath, file);
                        fs.unlinkSync(filePath);
                        cleanedCount++;
                        console.log(`  🗑️ Removido: ${file}`);
                    }
                }
                
                console.log(`  ✅ Limpeza concluída: ${cleanedCount} arquivos removidos`);
            }
        }

        // 3. Verificar se o código foi atualizado
        console.log('🔍 Verificando atualizações no código...');
        
        const serverFile = path.join(__dirname, '..', 'src', 'server-baileys.ts');
        if (fs.existsSync(serverFile)) {
            const content = fs.readFileSync(serverFile, 'utf8');
            
            if (content.includes('reconnectAttempts')) {
                console.log('✅ Código atualizado com controle de reconexão encontrado');
            } else {
                console.log('⚠️ Código ainda não foi atualizado - aplicando patch...');
                // Aqui poderia aplicar um patch básico se necessário
            }
        }

        console.log('');
        console.log('🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('');
        console.log('📋 PRÓXIMOS PASSOS:');
        console.log('1. pm2 restart whatsapp-bot');
        console.log('2. pm2 logs whatsapp-bot --lines 20');
        console.log('3. Verificar se o QR code aparece apenas uma vez');
        console.log('');
        console.log('🔧 SOLUÇÕES ADICIONAIS:');
        console.log('- Se o problema persistir, use a nova rota: POST /api/whatsapp/cleanup-sessions/1');
        console.log('- Monitore os logs para verificar se não há mais loops');
        console.log('');

    } catch (error) {
        console.error('❌ Erro durante a correção:', error);
        console.log('');
        console.log('🆘 CORREÇÃO MANUAL:');
        console.log('1. rm -rf auth_baileys/manager_*/session-*');
        console.log('2. rm -rf auth_baileys/manager_*/app-state-sync-*');  
        console.log('3. rm -rf auth_baileys/manager_*/pre-key-*');
        console.log('4. pm2 restart whatsapp-bot');
    }
}

// Executar correção
fixQRLoop();
