console.log('🔍 Testando dependências de criptografia...');

try {
  const crypto = require('crypto');
  console.log('✅ Crypto nativo: OK');
} catch (e) {
  console.log('❌ Crypto nativo: ERRO', e.message);
}

try {
  const sodium = require('libsodium-wrappers');
  console.log('✅ Libsodium: OK');
} catch (e) {
  console.log('❌ Libsodium: ERRO', e.message);
}

try {
  const baileys = require('@whiskeysockets/baileys');
  console.log('✅ Baileys: OK');
} catch (e) {
  console.log('❌ Baileys: ERRO', e.message);
}

console.log('🔍 Teste concluído');
