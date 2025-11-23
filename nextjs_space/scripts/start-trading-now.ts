
import dotenv from 'dotenv';
dotenv.config();

import { tradingScheduler } from '../lib/trading-scheduler';

async function startTrading() {
  console.log('🚀 Starting 24/7 AsterDEX Trading Scheduler...\n');

  try {
    // Start the scheduler with AsterDEX (interval in ms, e.g., 5 minutes)
    await tradingScheduler.start(5 * 60 * 1000); // 5 minutes interval

    console.log('✅ Trading scheduler started successfully!');
    console.log('📊 Status:', tradingScheduler.getStatus());
    console.log('\n💡 Trading will continue in the background');
    console.log('   Check status at: http://localhost:3000/api/aster-dex/status');
    console.log('\n⏹️  To stop trading, restart the server or use tradingScheduler.stop()');

  } catch (error) {
    console.error('❌ Error starting trading:', error);
    throw error;
  }
}

startTrading()
  .then(() => {
    console.log('\n✅ Scheduler is running! Keep this process alive or deploy to production.');
    // Keep process alive
    setInterval(() => {
      const status = tradingScheduler.getStatus();
      if (status.isRunning) {
        console.log(`📊 Cycles: ${status.cyclesCompleted} | Success: ${status.successfulTrades} | Failed: ${status.failedTrades}`);
      }
    }, 60000); // Log every minute
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
