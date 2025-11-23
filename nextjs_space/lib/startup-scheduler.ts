
/**
 * Auto-start 24/7 AsterDEX Trading Scheduler
 * This module automatically starts the trading scheduler when the server starts
 */

import { tradingScheduler } from './trading-scheduler';

let isInitialized = false;
let initPromise: Promise<void> | null = null;

/**
 * Initialize and start the 24/7 trading scheduler
 */
export async function initializeTradingScheduler() {
  // If already initializing, wait for that to complete
  if (initPromise) {
    console.log('⏳ Trading scheduler initialization already in progress...');
    return initPromise;
  }

  // If already initialized, don't reinitialize
  if (isInitialized) {
    const status = tradingScheduler.getStatus();
    if (status.isRunning) {
      console.log('✅ Trading scheduler already initialized and running');
      return;
    } else {
      console.log('⚠️  Trading scheduler initialized but not running, restarting...');
      isInitialized = false; // Reset to allow restart
    }
  }

  // Create initialization promise
  initPromise = (async () => {
    try {
      console.log('\n' + '='.repeat(70));
      console.log('🚀 INITIALIZING 24/7 ASTERDEX TRADING SYSTEM');
      console.log('='.repeat(70));

      // Enable AsterDEX mode
      await tradingScheduler.setTradingMode(true);
      
      // Start the scheduler with 15-minute intervals
      await tradingScheduler.start(15);

      isInitialized = true;

      console.log('✅ 24/7 AsterDEX trading system is now ACTIVE');
      console.log('   Trading Interval: 15 minutes');
      console.log('   Mode: AsterDEX Perpetuals (Leveraged)');
      console.log('   Status: Agents will trade continuously');
      console.log('='.repeat(70) + '\n');

    } catch (error) {
      console.error('❌ Error initializing trading scheduler:', error);
      isInitialized = false;
      // Don't throw - let the app start anyway
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

/**
 * Check if scheduler is initialized and running
 */
export function isSchedulerActive(): boolean {
  return isInitialized && tradingScheduler.getStatus().isRunning;
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus() {
  return {
    isInitialized,
    status: tradingScheduler.getStatus(),
  };
}

// Auto-initialize when module is loaded (only once)
const shouldAutoStart = 
  process.env.NODE_ENV === 'production' || 
  process.env.AUTO_START_TRADING === 'true';

if (shouldAutoStart && typeof window === 'undefined') {
  console.log('🔄 Auto-starting trading scheduler...');
  
  // Start after a short delay to ensure everything is loaded
  setTimeout(() => {
    initializeTradingScheduler().catch(error => {
      console.error('Failed to auto-start trading scheduler:', error);
    });
  }, 3000); // 3 second delay
}
