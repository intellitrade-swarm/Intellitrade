
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { postTradingSignal, postMarketUpdate } from '../lib/x-api';

const prisma = new PrismaClient();

// Manual script to post a specific trading signal or update
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  Post trading signal:');
    console.log('    yarn tsx scripts/post-manual-signal.ts signal ETH LONG 2500 10 75 "Breaking resistance"');
    console.log('  Post market update:');
    console.log('    yarn tsx scripts/post-manual-signal.ts update "Market analysis text here"');
    return;
  }

  try {
    await prisma.$connect();
    
    const type = args[0];
    
    if (type === 'signal') {
      // Post trading signal
      const [_, token, action, price, leverage, confidence, reasoning] = args;
      
      const signal = {
        token,
        action: action.toUpperCase() as 'LONG' | 'SHORT' | 'CLOSE',
        price: parseFloat(price),
        leverage: parseInt(leverage),
        confidence: parseInt(confidence),
        reasoning,
      };
      
      console.log('📱 Posting trading signal:', signal);
      const success = await postTradingSignal(signal);
      
      if (success) {
        console.log('✅ Signal posted successfully to @defidash_agent');
      } else {
        console.log('❌ Failed to post signal');
      }
      
    } else if (type === 'update') {
      // Post market update
      const text = args.slice(1).join(' ');
      
      console.log('📱 Posting market update:', text);
      const success = await postMarketUpdate(text);
      
      if (success) {
        console.log('✅ Update posted successfully to @defidash_agent');
      } else {
        console.log('❌ Failed to post update');
      }
      
    } else {
      console.log('❌ Unknown type. Use "signal" or "update"');
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
