console.log('Testing Baileys import...');
try {
    const baileys = require('@whiskeysockets/baileys');
    console.log('✅ Baileys imported successfully');
    console.log('Available functions:', Object.keys(baileys));
} catch (error) {
    console.error('❌ Baileys import failed:', error.message);
}
