import dotenv from 'dotenv';
import { createDatabaseIfNotExists, connectDatabase, closeDatabaseConnection } from '../config/database';
import { runMigrations, rollbackMigrations } from '../migrations/migrations';

// Carregar variáveis de ambiente
dotenv.config();

async function runMigrationScript() {
    const command = process.argv[2];
    
    try {
        console.log('🔄 Conectando ao banco de dados...');
        
        // Criar database se não existir
        await createDatabaseIfNotExists();
        
        // Conectar ao banco
        await connectDatabase();
        
        switch (command) {
            case 'up':
                console.log('⚡ Executando migrations...');
                await runMigrations();
                break;
                
            case 'down':
                const steps = parseInt(process.argv[3]) || 1;
                console.log(`⚡ Revertendo ${steps} migration(s)...`);
                await rollbackMigrations(steps);
                break;
                
            default:
                console.log('📖 Uso:');
                console.log('  npm run migrate up     - Executar todas as migrations pendentes');
                console.log('  npm run migrate down [n] - Reverter n migrations (padrão: 1)');
                break;
        }
        
    } catch (error) {
        console.error('❌ Erro ao executar migrations:', error);
        process.exit(1);
    } finally {
        await closeDatabaseConnection();
        console.log('✅ Conexão com banco encerrada');
        process.exit(0);
    }
}

runMigrationScript();
