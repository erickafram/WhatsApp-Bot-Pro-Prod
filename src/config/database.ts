import mysql from 'mysql2/promise';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'whatsapp_bot'
};

let connection: mysql.Connection | null = null;

export async function connectDatabase(): Promise<mysql.Connection> {
  if (!connection) {
    try {
      connection = await mysql.createConnection(dbConfig);

      // Garantir que autocommit está habilitado
      await connection.execute('SET autocommit = 1');
      console.log('✅ Conectado ao banco de dados MySQL com autocommit habilitado');

      return connection;
    } catch (error) {
      console.error('❌ Erro ao conectar ao banco de dados:', error);
      throw error;
    }
  }
  return connection;
}

export async function createDatabaseIfNotExists(): Promise<void> {
  try {
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    console.log(`✅ Database '${dbConfig.database}' criado/verificado`);
    
    await tempConnection.end();
  } catch (error) {
    console.error('❌ Erro ao criar database:', error);
    throw error;
  }
}

export async function executeQuery(query: string, params?: any[]): Promise<any> {
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
    } catch (preparedError) {
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
  } catch (error) {
    console.error('❌ Erro ao executar query:', error);
    console.error('❌ Query que falhou:', query);
    console.error('❌ Params que falharam:', params);
    throw error;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  if (connection) {
    await connection.end();
    connection = null;
    console.log('✅ Conexão com banco de dados fechada');
  }
}

// Pool de conexões para uso geral
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
