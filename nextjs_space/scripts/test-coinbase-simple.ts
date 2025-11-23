/**
 * Simple Coinbase API Test
 */

import crypto from 'crypto';

const COINBASE_API_KEY = process.env.COINBASE_API_KEY || '';
const COINBASE_API_SECRET = process.env.COINBASE_API_SECRET || '';
const COINBASE_BASE_URL = 'https://api.coinbase.com';

async function testSimpleRequest() {
  console.log('🧪 Testing simple Coinbase API request...\n');
  
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const method = 'GET';
  const requestPath = '/api/v3/brokerage/accounts';
  const body = '';
  
  // Create the prehash string
  const message = timestamp + method + requestPath + body;
  
  // Create HMAC signature - try base64 encoding
  const signature = crypto
    .createHmac('sha256', COINBASE_API_SECRET)
    .update(message)
    .digest('base64');
  
  const url = `${COINBASE_BASE_URL}${requestPath}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'CB-ACCESS-KEY': COINBASE_API_KEY,
    'CB-ACCESS-SIGN': signature,
    'CB-ACCESS-TIMESTAMP': timestamp,
  };
  
  console.log('Request URL:', url);
  console.log('Request Headers:', headers);
  console.log();
  
  try {
    const response = await fetch(url, {
      method,
      headers
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('\nResponse body:');
    console.log(responseText.substring(0, 500));
    
    if (response.ok) {
      console.log('\n✅ Request successful!');
      const data = JSON.parse(responseText);
      console.log('Parsed data:', JSON.stringify(data, null, 2).substring(0, 500));
    } else {
      console.log('\n❌ Request failed');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testSimpleRequest();
