import { executeQuery } from '../config/database';

async function createSessionsTable() {
  try {
    console.log('🔄 Criando tabela user_sessions...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        session_token VARCHAR(255) NOT NULL,
        refresh_token VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        ip_address VARCHAR(45) DEFAULT NULL,
        user_agent TEXT,
        is_active TINYINT(1) DEFAULT 1,
        UNIQUE KEY session_token (session_token(191)),
        UNIQUE KEY refresh_token (refresh_token(191)),
        KEY idx_user_id (user_id),
        KEY idx_expires_at (expires_at),
        KEY idx_session_token (session_token(191))
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `;
    
    await executeQuery(createTableQuery, []);
    console.log('✅ Tabela user_sessions criada com sucesso!');
    
    // Verificar se a tabela foi criada
    const checkQuery = 'SHOW TABLES LIKE "user_sessions"';
    const result = await executeQuery(checkQuery, []);
    
    if (Array.isArray(result) && result.length > 0) {
      console.log('✅ Verificação: Tabela user_sessions existe no banco de dados');
    } else {
      console.log('❌ Erro: Tabela user_sessions não foi encontrada após criação');
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela user_sessions:', error);
    throw error;
  }
}

async function cleanupExpiredSessions() {
  try {
    console.log('🧹 Limpando sessões expiradas...');
    
    const cleanupQuery = 'DELETE FROM user_sessions WHERE expires_at < NOW() OR is_active = FALSE';
    const result = await executeQuery(cleanupQuery, []);
    
    console.log(`✅ ${(result as any)?.affectedRows || 0} sessões expiradas removidas`);
  } catch (error) {
    console.error('❌ Erro ao limpar sessões expiradas:', error);
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando migração do sistema de sessões...');
    
    await createSessionsTable();
    await cleanupExpiredSessions();
    
    console.log('✅ Migração concluída com sucesso!');
    console.log('');
    console.log('📋 Próximos passos:');
    console.log('1. Reinicie o servidor para aplicar as mudanças');
    console.log('2. Os usuários precisarão fazer login novamente');
    console.log('3. O sistema agora usa sessões seguras no banco de dados');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

export { createSessionsTable, cleanupExpiredSessions };
