/**
 * Test Coinbase API Connection
 * Verifies that API credentials are working correctly
 */

import * as Coinbase from '../lib/coinbase';

async function testCoinbaseConnection() {
  console.log('🔐 Testing Coinbase API Connection...\n');
  
  // Check if configured
  console.log('1. Checking API configuration...');
  const isConfigured = Coinbase.isConfigured();
  console.log(`   ✅ API Configured: ${isConfigured}`);
  
  if (!isConfigured) {
    console.log('   ❌ API credentials are missing!');
    console.log('   Please set COINBASE_API_KEY and COINBASE_API_SECRET in .env');
    process.exit(1);
  }
  
  try {
    // Test account info
    console.log('\n2. Fetching account information...');
    const accountInfo = await Coinbase.getAccountInfo();
    console.log(`   ✅ Account Balance: $${accountInfo.totalBalance}`);
    console.log(`   ✅ Available: $${accountInfo.availableBalance}`);
    console.log(`   ✅ Number of assets: ${accountInfo.balances.length}`);
    
    // Show balances
    console.log('\n3. Asset balances:');
    accountInfo.balances
      .filter((b: any) => parseFloat(b.free) > 0)
      .forEach((b: any) => {
        console.log(`   - ${b.asset}: ${parseFloat(b.free).toFixed(8)}`);
      });
    
    // Test market data
    console.log('\n4. Fetching market data...');
    const tickers = await Coinbase.getAllTickers();
    console.log(`   ✅ Loaded ${tickers.length} market tickers`);
    
    // Show top 3 by volume
    console.log('\n5. Top markets:');
    tickers
      .slice(0, 3)
      .forEach(t => {
        const change = parseFloat(t.change24h);
        const changeStr = change > 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
        console.log(`   ${t.symbol}: $${parseFloat(t.price).toLocaleString()} (${changeStr})`);
      });
    
    console.log('\n✅ Coinbase API connection test PASSED!');
    console.log('🚀 Ready for REAL trading!\n');
    
  } catch (error) {
    console.error('\n❌ Coinbase API connection test FAILED:');
    console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Verify API key and secret are correct');
    console.log('   2. Ensure API key has trading permissions');
    console.log('   3. Check if API key is not expired');
    console.log('   4. Verify Coinbase account is active');
    process.exit(1);
  }
}

testCoinbaseConnection();
