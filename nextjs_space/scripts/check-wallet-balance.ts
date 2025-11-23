import { getTradingBalances } from '../lib/oneinch';

const walletAddress = '0x88Bd590873550C92fA308f46e7d0C9Bc66Dff0C6';
const chain = 'base';

async function main() {
  console.log('Checking wallet balance...');
  console.log('Address:', walletAddress);
  console.log('Chain:', chain);
  console.log('---');
  
  try {
    const balances = await getTradingBalances(chain, walletAddress);
    
    console.log('Results:');
    console.log('  Native:', balances.native, balances.nativeSymbol);
    console.log('  USDC:', balances.usdc);
    console.log('  Total USD:', balances.totalUsd);
    
    if (balances.totalUsd < 1) {
      console.log('\n⚠️  Balance below $1 - insufficient for trading');
    } else {
      console.log('\n✅ Balance sufficient for trading');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
