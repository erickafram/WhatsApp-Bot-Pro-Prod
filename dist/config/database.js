"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConfig = void 0;
exports.ensurePoolConnection = ensurePoolConnection;
exports.connectDatabase = connectDatabase;
exports.createDatabaseIfNotExists = createDatabaseIfNotExists;
exports.executeQuery = executeQuery;
exports.closeDatabaseConnection = closeDatabaseConnection;
exports.closePool = closePool;
exports.getPoolStats = getPoolStats;
const promise_1 = __importDefault(require("mysql2/promise"));
exports.dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'whatsapp_bot'
};
// Pool de conexões robusto com configurações otimizadas para produção
const pool = promise_1.default.createPool({
    ...exports.dbConfig,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    // Configurações para detectar conexões mortas
    idleTimeout: 300000, // 5 minutos
    maxIdle: 10,
    // Configurações MySQL específicas
    charset: 'utf8mb4',
    timezone: 'local'
});
// Variável para controle de conexão
let connection = null;
// Função para testar e reconectar o pool se necessário
async function ensurePoolConnection() {
    try {
        // Testa a conexão executando uma query simples
        await pool.execute('SELECT 1');
    }
    catch (error) {
        console.warn('⚠️ Pool de conexões com problema, tentando reconectar:', error);
        // Força a criação de novas conexões
        pool.end();
        throw error;
    }
}
async function connectDatabase() {
    if (!connection) {
        try {
            connection = await promise_1.default.createConnection({
                ...exports.dbConfig
            });
            // Garantir que autocommit está habilitado
            await connection.execute('SET autocommit = 1');
            console.log('✅ Conectado ao banco de dados MySQL com autocommit habilitado');
            // Configurar handlers para detectar desconexões
            connection.on('error', (err) => {
                console.error('❌ Erro na conexão MySQL:', err);
                if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
                    connection = null; // Força reconexão
                }
            });
            return connection;
        }
        catch (error) {
            console.error('❌ Erro ao conectar ao banco de dados:', error);
            connection = null;
            throw error;
        }
    }
    return connection;
}
async function createDatabaseIfNotExists() {
    try {
        const tempConnection = await promise_1.default.createConnection({
            host: exports.dbConfig.host,
            port: exports.dbConfig.port,
            user: exports.dbConfig.user,
            password: exports.dbConfig.password
        });
        await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${exports.dbConfig.database}\``);
        console.log(`✅ Database '${exports.dbConfig.database}' criado/verificado`);
        await tempConnection.end();
    }
    catch (error) {
        console.error('❌ Erro ao criar database:', error);
        throw error;
    }
}
async function executeQuery(query, params) {
    const maxRetries = 3;
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔍 executeQuery (tentativa ${attempt}) - Query: ${query.replace(/\s+/g, ' ').trim()}`);
            if (params && params.length > 0) {
                console.log(`🔍 executeQuery - Params:`, params);
            }
            // Usar pool de conexões em vez de conexão singleton
            const safeParams = params || [];
            try {
                // Tentar com prepared statement primeiro
                const [results] = await pool.execute(query, safeParams);
                if (attempt > 1) {
                    console.log(`✅ Query executada com sucesso na tentativa ${attempt}`);
                }
                return results;
            }
            catch (preparedError) {
                console.log('⚠️ Prepared statement falhou, tentando query simples...');
                // Fallback: usar query() em vez de execute() para MySQL 9.x
                let simpleQuery = query;
                // Substituir ? por valores reais (escape manual)
                if (safeParams.length > 0) {
                    safeParams.forEach((param, index) => {
                        let escapedParam;
                        if (param === null || param === undefined) {
                            escapedParam = 'NULL';
                        }
                        else if (typeof param === 'string') {
                            escapedParam = `'${param.replace(/'/g, "''")}'`;
                        }
                        else {
                            escapedParam = param.toString();
                        }
                        simpleQuery = simpleQuery.replace('?', escapedParam);
                    });
                }
                console.log(`🔄 Query simples: ${simpleQuery}`);
                const [results] = await pool.query(simpleQuery);
                if (attempt > 1) {
                    console.log(`✅ Query simples executada com sucesso na tentativa ${attempt}`);
                }
                return results;
            }
        }
        catch (error) {
            lastError = error;
            console.error(`❌ Erro na tentativa ${attempt}:`, error.message);
            // Verificar se é erro de conexão
            if (attempt < maxRetries &&
                (error.code === 'PROTOCOL_CONNECTION_LOST' ||
                    error.code === 'ECONNRESET' ||
                    error.code === 'ENOTFOUND' ||
                    error.message?.includes('connection is in closed state') ||
                    error.message?.includes('Connection lost'))) {
                console.log(`🔄 Tentando reconectar... (tentativa ${attempt + 1}/${maxRetries})`);
                // Aguardar antes de tentar novamente
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                // Resetar conexão singleton se existir
                if (connection) {
                    try {
                        await connection.end();
                    }
                    catch { }
                    connection = null;
                }
                continue;
            }
            // Se não é erro de conexão ou já esgotou tentativas, propagar o erro
            break;
        }
    }
    console.error('❌ Todas as tentativas falharam. Erro final:', lastError);
    console.error('❌ Query que falhou:', query);
    console.error('❌ Params que falharam:', params);
    throw lastError;
}
async function closeDatabaseConnection() {
    if (connection) {
        try {
            await connection.end();
        }
        catch (error) {
            console.warn('⚠️ Erro ao fechar conexão singleton:', error);
        }
        connection = null;
        console.log('✅ Conexão singleton com banco de dados fechada');
    }
}
// Função para fechar o pool de conexões
async function closePool() {
    try {
        await pool.end();
        console.log('✅ Pool de conexões fechado');
    }
    catch (error) {
        console.error('❌ Erro ao fechar pool de conexões:', error);
    }
}
// Função para obter estatísticas do pool
function getPoolStats() {
    // Nota: As propriedades internas do pool não estão tipadas no mysql2
    // Esta função fornece estatísticas básicas quando possível
    const poolAny = pool;
    try {
        return {
            totalConnections: poolAny.pool?._allConnections?.length || 0,
            idleConnections: poolAny.pool?._freeConnections?.length || 0,
            busyConnections: (poolAny.pool?._allConnections?.length || 0) - (poolAny.pool?._freeConnections?.length || 0),
            status: 'available'
        };
    }
    catch (error) {
        return {
            totalConnections: 0,
            idleConnections: 0,
            busyConnections: 0,
            status: 'unknown',
            error: 'Could not retrieve pool stats'
        };
    }
}
// Monitoramento do pool - log estatísticas a cada 5 minutos
setInterval(() => {
    const stats = getPoolStats();
    if (stats.totalConnections > 0) {
        console.log(`📊 Pool Stats - Total: ${stats.totalConnections}, Idle: ${stats.idleConnections}, Busy: ${stats.busyConnections}`);
    }
}, 5 * 60 * 1000);
// Exportar pool como default
exports.default = pool;
//# sourceMappingURL=database.js.map