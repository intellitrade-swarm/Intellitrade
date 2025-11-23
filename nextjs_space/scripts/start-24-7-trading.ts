
/**
 * Start 24/7 Autonomous Trading Scheduler
 * This script initializes the trading scheduler to run continuously
 */

import { tradingScheduler } from '../lib/trading-scheduler';
import { testConnection } from '../lib/aster-dex';

async function startTrading() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 STARTING 24/7 AUTONOMOUS TRADING');
  console.log('='.repeat(70) + '\n');

  try {
    // Test AsterDEX connection first
    console.log('🔌 Testing AsterDEX connection...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ AsterDEX connection failed!');
      console.log('\nPlease check:');
      console.log('  1. ASTER_DEX_API_KEY is set in .env');
      console.log('  2. ASTER_DEX_API_SECRET is set in .env');
      console.log('  3. Your API credentials are valid\n');
      process.exit(1);
    }
    
    console.log('✅ AsterDEX connection successful!\n');
    
    // Enable AsterDEX mode
    await tradingScheduler.setTradingMode(true);
    
    // Start the scheduler (15-minute intervals)
    console.log('🎯 Starting trading scheduler...\n');
    await tradingScheduler.start(15);
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ 24/7 TRADING IS NOW ACTIVE');
    console.log('='.repeat(70));
    console.log('\nThe scheduler will:');
    console.log('  • Monitor and close open positions based on stop-loss/take-profit');
    console.log('  • Generate new trading signals every 15 minutes');
    console.log('  • Execute trades automatically for all active agents');
    console.log('  • Send Telegram alerts for significant events');
    console.log('\nPress Ctrl+C to stop the scheduler\n');
    
    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('\n\n⏸️  Stopping trading scheduler...');
      await tradingScheduler.stop();
      console.log('✅ Trading scheduler stopped.\n');
      process.exit(0);
    });
    
    // Keep alive
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\n❌ Error starting trading scheduler:', error);
    process.exit(1);
  }
}

startTrading();
