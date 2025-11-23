
/**
 * Start 24/7 Autonomous Trading Scheduler
 * 
 * This script starts the trading scheduler to run continuously
 * with AI agents trading every 15 minutes on AsterDEX
 */

import { initializeTradingScheduler, getSchedulerStatus } from '../lib/startup-scheduler';

async function main() {
  try {
    console.log('\n🚀 Starting 24/7 Autonomous Trading Scheduler...\n');

    // Initialize and start the trading scheduler
    await initializeTradingScheduler();

    // Wait a moment for it to fully start
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check status
    const status = getSchedulerStatus();
    
    console.log('\n📊 Current Scheduler Status:');
    console.log('  ✅ Initialized:', status.isInitialized);
    console.log('  🔄 Running:', status.status.isRunning);
    console.log('  ⚡ Trading Mode:', status.status.useAsterDex ? 'AsterDEX Perpetuals' : 'Standard');
    console.log('  ⏰ Interval:', '15 minutes');
    console.log('  🎯 Cycles Completed:', status.status.cyclesCompleted);
    console.log('  📈 Successful Trades:', status.status.successfulTrades);
    console.log('  📉 Failed Trades:', status.status.failedTrades);
    
    if (status.status.lastCycleTime) {
      console.log('  🕐 Last Cycle:', new Date(status.status.lastCycleTime).toLocaleString());
    }
    
    if (status.status.nextCycleTime) {
      console.log('  ⏭️  Next Cycle:', new Date(status.status.nextCycleTime).toLocaleString());
    }

    console.log('\n✅ Trading scheduler is now running 24/7!');
    console.log('   Agents will execute trades every 15 minutes');
    console.log('   Press Ctrl+C to stop (but scheduler will keep running in background)\n');

  } catch (error) {
    console.error('\n❌ Error starting trading scheduler:', error);
    process.exit(1);
  }
}

main();
