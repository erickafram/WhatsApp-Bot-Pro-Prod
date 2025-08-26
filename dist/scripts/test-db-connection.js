#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDatabaseConnection = testDatabaseConnection;
const database_1 = require("../config/database");
async function testDatabaseConnection() {
    console.log('🔍 Testando conexão com banco de dados...\n');
    try {
        // Teste 1: Query simples
        console.log('1️⃣ Testando query simples...');
        const result1 = await (0, database_1.executeQuery)('SELECT NOW() as current_time, VERSION() as mysql_version');
        console.log('✅ Query simples executada:', result1[0]);
        // Teste 2: Query com parâmetros
        console.log('\n2️⃣ Testando query com parâmetros...');
        const result2 = await (0, database_1.executeQuery)('SELECT ? as test_param, ? as test_number', ['teste', 123]);
        console.log('✅ Query com parâmetros executada:', result2[0]);
        // Teste 3: Verificar usuários (exemplo)
        console.log('\n3️⃣ Testando query em tabela existente...');
        try {
            const result3 = await (0, database_1.executeQuery)('SELECT COUNT(*) as total_users FROM users');
            console.log('✅ Total de usuários:', result3[0]);
        }
        catch (error) {
            if (error.message.includes("doesn't exist")) {
                console.log('ℹ️ Tabela users não existe ainda - normal para primeira execução');
            }
            else {
                throw error;
            }
        }
        // Teste 4: Estatísticas do pool
        console.log('\n4️⃣ Verificando estatísticas do pool...');
        const stats = (0, database_1.getPoolStats)();
        console.log('📊 Pool Stats:', stats);
        // Teste 5: Teste de reconexão
        console.log('\n5️⃣ Testando função de ensure connection...');
        await (0, database_1.ensurePoolConnection)();
        console.log('✅ Pool de conexões funcionando corretamente');
        console.log('\n🎉 Todos os testes passaram! Conexão com banco está funcionando perfeitamente.');
    }
    catch (error) {
        console.error('\n❌ Erro no teste de conexão:', error);
        process.exit(1);
    }
}
// Executar teste se arquivo for chamado diretamente
if (require.main === module) {
    testDatabaseConnection()
        .then(() => {
        console.log('\n✅ Teste concluído com sucesso');
        process.exit(0);
    })
        .catch((error) => {
        console.error('\n❌ Teste falhou:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=test-db-connection.js.map