const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('🔄 Testando conexão com MySQL...');
    
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '', // Coloque sua senha aqui se tiver
        });
        
        console.log('✅ Conexão com MySQL estabelecida com sucesso!');
        
        // Testar criação de database
        await connection.execute('CREATE DATABASE IF NOT EXISTS whatsapp_bot');
        console.log('✅ Database whatsapp_bot criado/verificado!');
        
        await connection.end();
        console.log('✅ Teste concluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro na conexão:', error.message);
        console.log('');
        console.log('📋 Verificações:');
        console.log('1. ✅ WAMP/XAMPP está rodando?');
        console.log('2. ✅ MySQL está ativo (ícone verde no WAMP)?');
        console.log('3. ✅ Porta 3306 está livre?');
        console.log('4. ✅ Usuário "root" existe?');
        console.log('5. ✅ Senha está correta no arquivo .env?');
    }
}

testConnection();
