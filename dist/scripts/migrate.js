"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("../config/database");
const migrations_1 = require("../migrations/migrations");
// Carregar variáveis de ambiente
dotenv_1.default.config();
async function runMigrationScript() {
    const command = process.argv[2];
    try {
        console.log('🔄 Conectando ao banco de dados...');
        // Criar database se não existir
        await (0, database_1.createDatabaseIfNotExists)();
        // Conectar ao banco
        await (0, database_1.connectDatabase)();
        switch (command) {
            case 'up':
                console.log('⚡ Executando migrations...');
                await (0, migrations_1.runMigrations)();
                break;
            case 'down':
                const steps = parseInt(process.argv[3]) || 1;
                console.log(`⚡ Revertendo ${steps} migration(s)...`);
                await (0, migrations_1.rollbackMigrations)(steps);
                break;
            default:
                console.log('📖 Uso:');
                console.log('  npm run migrate up     - Executar todas as migrations pendentes');
                console.log('  npm run migrate down [n] - Reverter n migrations (padrão: 1)');
                break;
        }
    }
    catch (error) {
        console.error('❌ Erro ao executar migrations:', error);
        process.exit(1);
    }
    finally {
        await (0, database_1.closeDatabaseConnection)();
        console.log('✅ Conexão com banco encerrada');
        process.exit(0);
    }
}
runMigrationScript();
//# sourceMappingURL=migrate.js.map