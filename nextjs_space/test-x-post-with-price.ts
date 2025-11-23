import { postTradingSignal } from './lib/x-api';
import { getCurrentPrice } from './lib/price-feed';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function main() {
  console.log('🧪 Testing X post with real-time price...\n');
  
  // Test price feed first
  console.log('📊 Fetching real-time ETH price...');
  const ethPrice = await getCurrentPrice('ETH');
  
  if (ethPrice) {
    console.log(`✅ Got ETH price: $${ethPrice.price} from ${ethPrice.source}\n`);
    
    // Create a test signal
    const signal = {
      token: 'ETH',
      action: 'LONG' as const,
      price: ethPrice.price,
      leverage: 10,
      confidence: 85,
      reasoning: 'Test post from Defidash Agents | Verifying accurate real-time prices',
    };
    
    console.log('📱 Posting test signal to X...\n');
    const success = await postTradingSignal(signal);
    
    if (success) {
      console.log('\n✅ Test post successful!');
      console.log('   Price used:', ethPrice.price);
      console.log('   Source:', ethPrice.source);
    } else {
      console.log('\n⚠️ Test post failed - check X API credentials');
    }
  } else {
    console.log('❌ Could not fetch ETH price');
  }
}

main().catch(console.error);
