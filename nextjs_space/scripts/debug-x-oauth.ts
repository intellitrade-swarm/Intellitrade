import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Load credentials
const secretsPath = '/home/ubuntu/.config/abacusai_auth_secrets.json';
const secretsData = JSON.parse(fs.readFileSync(secretsPath, 'utf-8'));
const xSecrets = secretsData['x (twitter)'].secrets;

const credentials = {
  apiKey: xSecrets.api_key.value,
  apiKeySecret: xSecrets.api_key_secret.value,
  accessToken: xSecrets.access_token.value,
  accessTokenSecret: xSecrets.access_token_secret.value,
};

console.log('🔐 Loaded Credentials:');
console.log('API Key:', credentials.apiKey.substring(0, 10) + '...');
console.log('API Secret:', credentials.apiKeySecret.substring(0, 10) + '...');
console.log('Access Token:', credentials.accessToken.substring(0, 20) + '...');
console.log('Access Token Secret:', credentials.accessTokenSecret.substring(0, 10) + '...');
console.log('');

// Generate OAuth signature
function generateOAuth1Signature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string = ''
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  
  console.log('📝 Signature Base String:');
  console.log(signatureBaseString.substring(0, 200) + '...');
  console.log('');
  
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(signatureBaseString)
    .digest('base64');
  
  return signature;
}

// Test with a simple request
async function testXAPI() {
  const baseUrl = 'https://api.twitter.com/2/tweets/search/recent';
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(32).toString('base64').replace(/\W/g, '');
  
  const queryParams: Record<string, string> = {
    query: 'ETH crypto',
    max_results: '10',
  };
  
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: credentials.apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: credentials.accessToken,
    oauth_version: '1.0',
  };
  
  // Merge all params for signature
  const allParams = { ...oauthParams, ...queryParams };
  
  const signature = generateOAuth1Signature(
    'GET',
    baseUrl,
    allParams,
    credentials.apiKeySecret,
    credentials.accessTokenSecret
  );
  
  oauthParams.oauth_signature = signature;
  
  const authHeader = 'OAuth ' + Object.keys(oauthParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
    .join(', ');
  
  console.log('🔑 OAuth Header:');
  console.log(authHeader.substring(0, 200) + '...');
  console.log('');
  
  const urlParams = new URLSearchParams(queryParams);
  const url = `${baseUrl}?${urlParams.toString()}`;
  
  console.log('🌐 Request URL:');
  console.log(url);
  console.log('');
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': authHeader,
      },
    });
    
    console.log('📡 Response Status:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('📦 Response Body:');
    console.log(responseText);
    
    if (response.ok) {
      console.log('✅ SUCCESS!');
    } else {
      console.log('❌ FAILED');
    }
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

testXAPI();
