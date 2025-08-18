"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConfig = void 0;
exports.connectDatabase = connectDatabase;
exports.createDatabaseIfNotExists = createDatabaseIfNotExists;
exports.executeQuery = executeQuery;
exports.closeDatabaseConnection = closeDatabaseConnection;
const promise_1 = __importDefault(require("mysql2/promise"));
exports.dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'whatsapp_bot'
};
let connection = null;
async function connectDatabase() {
    if (!connection) {
        try {
            connection = await promise_1.default.createConnection(exports.dbConfig);
            console.log('✅ Conectado ao banco de dados MySQL');
            return connection;
        }
        catch (error) {
            console.error('❌ Erro ao conectar ao banco de dados:', error);
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
    try {
        const conn = await connectDatabase();
        console.log(`🔍 executeQuery - Query: ${query.replace(/\s+/g, ' ').trim()}`);
        console.log(`🔍 executeQuery - Params:`, params || []);
        console.log(`🔍 executeQuery - Params type:`, typeof params, Array.isArray(params));
        // Para MySQL 9.x, usar query simples se prepared statement falhar
        const safeParams = params || [];
        try {
            const [results] = await conn.execute(query, safeParams);
            return results;
        }
        catch (preparedError) {
            console.log('⚠️ Prepared statement falhou, tentando query simples...');
            // Fallback: usar query() em vez de execute() para MySQL 9.x
            let simpleQuery = query;
            // Substituir ? por valores reais (escape manual)
            if (safeParams.length > 0) {
                safeParams.forEach((param, index) => {
                    const escapedParam = typeof param === 'string' ? `'${param.replace(/'/g, "''")}'` : param;
                    simpleQuery = simpleQuery.replace('?', escapedParam.toString());
                });
            }
            console.log(`🔄 Query simples: ${simpleQuery}`);
            const [results] = await conn.query(simpleQuery);
            return results;
        }
    }
    catch (error) {
        console.error('❌ Erro ao executar query:', error);
        console.error('❌ Query que falhou:', query);
        console.error('❌ Params que falharam:', params);
        throw error;
    }
}
async function closeDatabaseConnection() {
    if (connection) {
        await connection.end();
        connection = null;
        console.log('✅ Conexão com banco de dados fechada');
    }
}
// Pool de conexões para uso geral
const pool = promise_1.default.createPool({
    ...exports.dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
exports.default = pool;
//# sourceMappingURL=database.js.map