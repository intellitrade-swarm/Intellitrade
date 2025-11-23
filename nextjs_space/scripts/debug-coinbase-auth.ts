/**
 * Debug Coinbase Authentication
 */

import crypto from 'crypto';

const COINBASE_API_KEY = process.env.COINBASE_API_KEY || '';
const COINBASE_API_SECRET = process.env.COINBASE_API_SECRET || '';

console.log('🔍 Debugging Coinbase Authentication\n');

console.log('API Key length:', COINBASE_API_KEY.length);
console.log('API Secret length:', COINBASE_API_SECRET.length);
console.log('API Key (first 10 chars):', COINBASE_API_KEY.substring(0, 10) + '...');
console.log('API Secret (first 10 chars):', COINBASE_API_SECRET.substring(0, 10) + '...\n');

// Test signature generation
const timestamp = Math.floor(Date.now() / 1000).toString();
const method = 'GET';
const requestPath = '/api/v3/brokerage/accounts';
const body = '';

const message = timestamp + method + requestPath + body;
console.log('Signature message:', message);

const signature = crypto
  .createHmac('sha256', COINBASE_API_SECRET)
  .update(message)
  .digest('hex');

console.log('Generated signature:', signature.substring(0, 20) + '...\n');

console.log('Headers that will be sent:');
console.log({
  'Content-Type': 'application/json',
  'CB-ACCESS-KEY': COINBASE_API_KEY,
  'CB-ACCESS-SIGN': signature.substring(0, 20) + '...',
  'CB-ACCESS-TIMESTAMP': timestamp,
  'CB-VERSION': '2024-10-26'
});

console.log('\n📝 Note: Coinbase Advanced Trade API uses:');
console.log('- Base URL: https://api.coinbase.com');
console.log('- Authentication: CB-ACCESS-KEY, CB-ACCESS-SIGN, CB-ACCESS-TIMESTAMP');
console.log('- Signing: HMAC SHA256 of (timestamp + method + path + body)');
