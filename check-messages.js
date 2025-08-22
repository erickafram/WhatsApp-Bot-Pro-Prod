const mysql = require('mysql2/promise');

async function checkMessages() {
    console.log('🔍 Verificando mensagens com {cidade_digitada}...');
    
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '', // Coloque sua senha aqui se tiver
            database: 'whatsapp_bot'
        });
        
        console.log('✅ Conectado ao banco de dados!');
        
        // Buscar mensagens com {cidade_digitada}
        const [rows] = await connection.execute(
            'SELECT id, response_text FROM auto_messages WHERE response_text LIKE ?',
            ['%{cidade_digitada}%']
        );
        
        if (rows.length > 0) {
            console.log(`🔍 Encontradas ${rows.length} mensagem(ns) com {cidade_digitada}:`);
            rows.forEach(row => {
                console.log(`\nID: ${row.id}`);
                console.log(`Texto: ${row.response_text.substring(0, 200)}...`);
            });
        } else {
            console.log('✅ Nenhuma mensagem encontrada com {cidade_digitada}');
        }
        
        // Buscar mensagens com {cidade_escolhida}
        const [rows2] = await connection.execute(
            'SELECT id, response_text FROM auto_messages WHERE response_text LIKE ?',
            ['%{cidade_escolhida}%']
        );
        
        if (rows2.length > 0) {
            console.log(`\n🔍 Encontradas ${rows2.length} mensagem(ns) com {cidade_escolhida}:`);
            rows2.forEach(row => {
                console.log(`\nID: ${row.id}`);
                console.log(`Texto: ${row.response_text.substring(0, 200)}...`);
            });
        } else {
            console.log('✅ Nenhuma mensagem encontrada com {cidade_escolhida}');
        }
        
        // Buscar mensagens com CIDADE_DISPONIVEL
        const [rows3] = await connection.execute(
            'SELECT id, trigger_words, response_text FROM auto_messages WHERE trigger_words LIKE ?',
            ['%CIDADE_DISPONIVEL%']
        );
        
        if (rows3.length > 0) {
            console.log(`\n🔍 Encontradas ${rows3.length} mensagem(ns) com trigger CIDADE_DISPONIVEL:`);
            rows3.forEach(row => {
                console.log(`\nID: ${row.id}`);
                console.log(`Triggers: ${row.trigger_words}`);
                console.log(`Texto: ${row.response_text.substring(0, 200)}...`);
            });
        } else {
            console.log('✅ Nenhuma mensagem encontrada com trigger CIDADE_DISPONIVEL');
        }
        
        await connection.end();
        console.log('\n✅ Verificação concluída!');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

checkMessages();
