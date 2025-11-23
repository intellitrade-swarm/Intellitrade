import { testConnection, getAccountBalances, getAccountInfo } from '../lib/coinbase';

async function testCoinbaseAdvanced() {
  console.log('🔐 Testing Coinbase Advanced Trade API with EC Key Authentication...\n');
  
  console.log('Environment Variables:');
  console.log('API Key:', process.env.COINBASE_API_KEY?.substring(0, 50) + '...');
  console.log('API Secret (EC Private Key):', process.env.COINBASE_API_SECRET?.substring(0, 50) + '...\n');
  
  try {
    console.log('Testing connection...');
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('\n✅ SUCCESS! Coinbase API is working correctly\n');
      
      // Fetch account info
      console.log('Fetching account information...');
      const accountInfo = await getAccountInfo();
      console.log('Account Info:', JSON.stringify(accountInfo, null, 2));
      
    } else {
      console.log('\n❌ Connection test failed');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

testCoinbaseAdvanced();
