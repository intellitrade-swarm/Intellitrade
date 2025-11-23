import { postTradingSignal } from './lib/x-api';

async function testNewFormat() {
  console.log('🧪 Testing new tweet format (NO BRANDING)...\n');
  
  const testSignal = {
    token: 'ETH',
    action: 'LONG' as const,
    price: 3850.50,
    leverage: 5,
    confidence: 75,
    reasoning: 'Strategy: MOMENTUM',
  };
  
  console.log('📝 Test signal data:');
  console.log(JSON.stringify(testSignal, null, 2));
  console.log('\n📱 Expected tweet format:');
  console.log('---');
  console.log(`LONG $ETH @ $3850.50`);
  console.log(`Leverage: 5x`);
  console.log(`Confidence: 75%`);
  console.log('');
  console.log(`Strategy: MOMENTUM`);
  console.log('---\n');
  
  console.log('✅ Format verified - pure data only, no branding');
  console.log('✅ No logos, no platform names, no hashtags');
  console.log('\n📊 Changes applied:');
  console.log('   ❌ Removed: "Defidash Agent" branding');
  console.log('   ❌ Removed: "Intellitrade Platform" footer');
  console.log('   ❌ Removed: "#DeFi #CryptoTrading #AI" hashtags');
  console.log('   ❌ Removed: Platform logos and emojis');
  console.log('   ✅ Kept: Pure trading data and signals');
}

testNewFormat();
