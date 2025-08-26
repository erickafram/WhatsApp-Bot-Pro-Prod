#!/usr/bin/env node

/**
 * Script de monitoramento do sistema WhatsApp Bot
 * Monitora saúde da aplicação e reinicia se necessário
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurações
const CONFIG = {
    healthCheckUrl: 'http://localhost:3000/health',
    maxFailures: 3,
    checkInterval: 30000, // 30 segundos
    logFile: path.join(__dirname, '..', 'logs', 'monitor.log'),
    pm2ProcessName: 'whatsapp-bot'
};

// Contador de falhas consecutivas
let consecutiveFailures = 0;
let lastHealthStatus = null;

// Função de log
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    console.log(logMessage);
    
    // Criar diretório de logs se não existir
    const logDir = path.dirname(CONFIG.logFile);
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Escrever no arquivo de log
    fs.appendFileSync(CONFIG.logFile, logMessage + '\n');
}

// Função para executar comandos shell
function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject({ error, stderr });
            } else {
                resolve(stdout);
            }
        });
    });
}

// Função para verificar se PM2 está instalado
async function checkPM2() {
    try {
        await executeCommand('pm2 --version');
        return true;
    } catch (error) {
        log('PM2 não está disponível', 'ERROR');
        return false;
    }
}

// Função para fazer health check
async function performHealthCheck() {
    try {
        // Usar curl se disponível, senão usar node
        const command = process.platform === 'win32' 
            ? `powershell -Command "(Invoke-WebRequest -Uri '${CONFIG.healthCheckUrl}' -UseBasicParsing).StatusCode"`
            : `curl -s -o /dev/null -w "%{http_code}" ${CONFIG.healthCheckUrl}`;
        
        const result = await executeCommand(command);
        const statusCode = parseInt(result.trim());
        
        if (statusCode === 200) {
            return { success: true, statusCode };
        } else {
            return { success: false, statusCode, error: `HTTP ${statusCode}` };
        }
    } catch (error) {
        return { success: false, error: error.error?.message || 'Connection failed' };
    }
}

// Função para obter status do PM2
async function getPM2Status() {
    try {
        const result = await executeCommand(`pm2 jlist`);
        const processes = JSON.parse(result);
        const targetProcess = processes.find(p => p.name === CONFIG.pm2ProcessName);
        
        if (!targetProcess) {
            return { exists: false };
        }
        
        return {
            exists: true,
            status: targetProcess.pm2_env.status,
            pid: targetProcess.pid,
            restarts: targetProcess.pm2_env.restart_time,
            uptime: targetProcess.pm2_env.pm_uptime,
            memory: targetProcess.monit.memory,
            cpu: targetProcess.monit.cpu
        };
    } catch (error) {
        log(`Erro ao obter status do PM2: ${error.error?.message || error}`, 'ERROR');
        return { exists: false, error: error.error?.message || error };
    }
}

// Função para reiniciar o processo
async function restartProcess() {
    try {
        log('Tentando reiniciar processo via PM2...', 'WARN');
        await executeCommand(`pm2 restart ${CONFIG.pm2ProcessName}`);
        log('Processo reiniciado com sucesso', 'INFO');
        
        // Aguardar um pouco para o processo inicializar
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        return true;
    } catch (error) {
        log(`Erro ao reiniciar processo: ${error.error?.message || error}`, 'ERROR');
        return false;
    }
}

// Função principal de monitoramento
async function monitorSystem() {
    log('Iniciando verificação de saúde do sistema...');
    
    try {
        // 1. Verificar se PM2 está disponível
        const pm2Available = await checkPM2();
        if (!pm2Available) {
            log('PM2 não está disponível - não é possível monitorar', 'ERROR');
            return;
        }
        
        // 2. Verificar status do PM2
        const pm2Status = await getPM2Status();
        if (!pm2Status.exists) {
            log('Processo não encontrado no PM2', 'ERROR');
            consecutiveFailures++;
        } else if (pm2Status.status !== 'online') {
            log(`Processo não está online (status: ${pm2Status.status})`, 'WARN');
            consecutiveFailures++;
        } else {
            // 3. Fazer health check HTTP
            const healthCheck = await performHealthCheck();
            
            if (healthCheck.success) {
                if (consecutiveFailures > 0) {
                    log(`Sistema voltou ao normal após ${consecutiveFailures} falhas`);
                }
                consecutiveFailures = 0;
                
                // Log status detalhado apenas se mudou
                const currentStatus = `Online - PID: ${pm2Status.pid}, Restarts: ${pm2Status.restarts}, Memory: ${Math.round(pm2Status.memory / 1024 / 1024)}MB, CPU: ${pm2Status.cpu}%`;
                if (lastHealthStatus !== currentStatus) {
                    log(`Status: ${currentStatus}`);
                    lastHealthStatus = currentStatus;
                }
            } else {
                consecutiveFailures++;
                log(`Health check falhou (tentativa ${consecutiveFailures}/${CONFIG.maxFailures}): ${healthCheck.error}`, 'WARN');
            }
        }
        
        // 4. Verificar se precisa reiniciar
        if (consecutiveFailures >= CONFIG.maxFailures) {
            log(`Máximo de falhas atingido (${consecutiveFailures}), tentando reiniciar...`, 'ERROR');
            
            const restarted = await restartProcess();
            if (restarted) {
                consecutiveFailures = 0;
            } else {
                log('Falha ao reiniciar - necessária intervenção manual', 'ERROR');
            }
        }
        
    } catch (error) {
        log(`Erro durante monitoramento: ${error.message}`, 'ERROR');
    }
}

// Função para cleanup no shutdown
function cleanup() {
    log('Encerrando monitor do sistema...');
    process.exit(0);
}

// Handlers de sinal
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Iniciar monitoramento
log(`Monitor iniciado - verificando a cada ${CONFIG.checkInterval/1000}s`);
log(`Health check URL: ${CONFIG.healthCheckUrl}`);
log(`Máximo de falhas consecutivas: ${CONFIG.maxFailures}`);
log(`Logs sendo salvos em: ${CONFIG.logFile}`);

// Executar primeira verificação imediatamente
monitorSystem();

// Agendar verificações regulares
setInterval(monitorSystem, CONFIG.checkInterval);
