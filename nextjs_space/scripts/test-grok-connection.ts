
import dotenv from 'dotenv';
dotenv.config();

import { testGrokConnection } from '../lib/grok';

async function main() {
  console.log('Testing Grok AI connection...\n');
  
  try {
    const success = await testGrokConnection();
    
    if (success) {
      console.log('\n✅ Grok AI is properly configured and working!');
    } else {
      console.log('\n❌ Grok AI connection failed');
    }
  } catch (error) {
    console.error('❌ Error testing Grok:', error);
  }
}

main();
