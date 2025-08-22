const mysql = require('mysql2/promise');

async function fixMessage() {
    console.log('🔧 Corrigindo mensagem com {cidade_digitada}...');
    
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '', // Coloque sua senha aqui se tiver
            database: 'whatsapp_bot'
        });
        
        console.log('✅ Conectado ao banco de dados!');
        
        // Buscar a mensagem atual
        const [rows] = await connection.execute(
            'SELECT id, response_text FROM auto_messages WHERE id = ?',
            [117]
        );
        
        if (rows.length > 0) {
            console.log('📋 Mensagem atual:');
            console.log(rows[0].response_text);
            
            // Corrigir a mensagem substituindo {cidade_digitada} por {CIDADE_NOME}
            const newText = rows[0].response_text.replace(/{cidade_digitada}/g, '{CIDADE_NOME}');
            
            // Atualizar no banco
            await connection.execute(
                'UPDATE auto_messages SET response_text = ? WHERE id = ?',
                [newText, 117]
            );
            
            console.log('\n✅ Mensagem corrigida!');
            console.log('📋 Nova mensagem:');
            console.log(newText);
            
        } else {
            console.log('❌ Mensagem com ID 117 não encontrada');
        }
        
        await connection.end();
        console.log('\n✅ Correção concluída!');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

fixMessage();
