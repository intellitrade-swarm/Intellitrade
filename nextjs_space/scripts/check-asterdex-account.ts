
import * as dotenv from 'dotenv';
import * as path from 'path';
import { getAccountInfo } from '@/lib/aster-dex';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function checkAsterDexAccount() {
  try {
    console.log('\n🔍 CHECKING ASTERDEX ACCOUNT BALANCE\n');
    console.log('=' .repeat(60));

    const accountInfo = await getAccountInfo();
    
    console.log('\n📊 ACCOUNT SUMMARY:\n');
    console.log(`  Total Wallet Balance: $${accountInfo.totalWalletBalance}`);
    console.log(`  Available Balance: $${accountInfo.availableBalance}`);
    console.log(`  Total Margin Balance: $${accountInfo.totalMarginBalance}`);
    console.log(`  Unrealized Profit: $${accountInfo.totalUnrealizedProfit}`);

    console.log('\n💰 ASSETS:\n');
    accountInfo.assets.forEach(asset => {
      console.log(`  ${asset.asset}:`);
      console.log(`    Wallet Balance: $${asset.walletBalance}`);
      console.log(`    Available: $${asset.availableBalance}`);
      console.log(`    Unrealized P&L: $${asset.unrealizedProfit}`);
    });

    console.log('\n📈 OPEN POSITIONS:\n');
    if (accountInfo.positions.length === 0) {
      console.log('  No open positions');
    } else {
      accountInfo.positions.forEach(pos => {
        console.log(`  ${pos.symbol}:`);
        console.log(`    Position Size: ${pos.positionAmt}`);
        console.log(`    Entry Price: $${pos.entryPrice}`);
        console.log(`    Mark Price: $${pos.markPrice}`);
        console.log(`    Unrealized P&L: $${pos.unRealizedProfit}`);
        console.log(`    Leverage: ${pos.leverage}x`);
      });
    }

    console.log('\n' + '=' .repeat(60));
    
    const availableBalance = parseFloat(accountInfo.availableBalance);
    if (availableBalance < 10) {
      console.log('\n⚠️  WARNING: INSUFFICIENT FUNDS\n');
      console.log('  Your AsterDEX account has insufficient balance to trade.');
      console.log('  Current available: $' + availableBalance.toFixed(2));
      console.log('  Minimum recommended: $100+\n');
      console.log('📝 TO FUND YOUR ACCOUNT:\n');
      console.log('  1. Log in to https://asterdex.com');
      console.log('  2. Go to Wallet > Deposit');
      console.log('  3. Transfer USDT/USDC to your futures account');
      console.log('  4. Wait for deposit confirmation');
      console.log('  5. Run this script again to verify\n');
    } else {
      console.log('\n✅ ACCOUNT FUNDED\n');
      console.log('  Available balance: $' + availableBalance.toFixed(2));
      console.log('  Ready to trade!\n');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    console.error('\nPlease check:');
    console.error('  1. API credentials are correct in .env file');
    console.error('  2. AsterDEX API is accessible');
    console.error('  3. Account is activated on AsterDEX\n');
    process.exit(1);
  }
}

checkAsterDexAccount();
