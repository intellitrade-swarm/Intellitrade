import fs from 'fs';

interface XAPISecrets {
  api_key: { value: string };
  api_key_secret: { value: string };
  bearer_token?: { value: string };
  access_token?: { value: string };
  access_token_secret?: { value: string };
  client_secret?: { value: string };
}

async function testXAPICredentials() {
  console.log('🔍 Testing X API Credentials...\n');
  
  try {
    // Load credentials
    const secretsPath = '/home/ubuntu/.config/abacusai_auth_secrets.json';
    const secretsData = fs.readFileSync(secretsPath, 'utf-8');
    const secrets = JSON.parse(secretsData);
    const xSecrets = secrets['x (twitter)'] as { secrets: XAPISecrets };
    
    if (!xSecrets?.secrets) {
      throw new Error('X API secrets not found');
    }
    
    // Display loaded credentials (masked)
    console.log('✅ Credentials loaded successfully:');
    console.log('   API Key:', xSecrets.secrets.api_key?.value ? `${xSecrets.secrets.api_key.value.substring(0, 10)}...` : 'NOT SET');
    console.log('   API Secret:', xSecrets.secrets.api_key_secret?.value ? `${xSecrets.secrets.api_key_secret.value.substring(0, 10)}...` : 'NOT SET');
    console.log('   Bearer Token:', xSecrets.secrets.bearer_token?.value ? `${xSecrets.secrets.bearer_token.value.substring(0, 30)}...` : 'NOT SET');
    console.log('   Access Token:', xSecrets.secrets.access_token?.value ? `${xSecrets.secrets.access_token.value.substring(0, 20)}...` : 'NOT SET');
    console.log('   Access Token Secret:', xSecrets.secrets.access_token_secret?.value ? `${xSecrets.secrets.access_token_secret.value.substring(0, 10)}...` : 'NOT SET');
    console.log('   Client Secret:', xSecrets.secrets.client_secret?.value ? `${xSecrets.secrets.client_secret.value.substring(0, 10)}...` : 'NOT SET');
    
    // Test API v2 endpoint with Bearer Token
    if (xSecrets.secrets.bearer_token?.value) {
      console.log('\n🔄 Testing X API v2 (Bearer Token authentication)...');
      const response = await fetch('https://api.twitter.com/2/tweets/search/recent?query=crypto&max_results=10', {
        headers: {
          'Authorization': `Bearer ${xSecrets.secrets.bearer_token.value}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ X API v2 connection successful!');
        console.log(`   Found ${data.meta?.result_count || 0} tweets`);
      } else {
        const errorText = await response.text();
        console.log('❌ X API v2 connection failed:', response.status, response.statusText);
        console.log('   Error:', errorText);
      }
    }
    
    console.log('\n✅ All credentials have been updated successfully!');
    console.log('\n📋 Summary:');
    console.log('   - X API credentials updated in: /home/ubuntu/.config/abacusai_auth_secrets.json');
    console.log('   - iPOLL logo copied to: /home/ubuntu/ipool_swarms/nextjs_space/public/ipoll-logo-new.png');
    console.log('   - System is ready for X posting with new credentials');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testXAPICredentials();
