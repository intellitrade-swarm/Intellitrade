
/**
 * 24/7 Autonomous Trading Scheduler
 * Continuously monitors and executes trades for all AI agents
 * Now supports both DEX and AsterDEX perpetuals trading
 */

import { runAutonomousTradingCycle } from './autonomous-trading';
import { runAsterAutonomousTradingCycle } from './aster-autonomous-trading';
import { runMEVBotTradingCycle } from './mev-bot-trading';
import { sendTelegramAlert } from './alerts';
import { prisma } from './db';

interface SchedulerStatus {
  isRunning: boolean;
  lastCycleTime: Date | null;
  nextCycleTime: Date | null;
  cyclesCompleted: number;
  successfulTrades: number;
  failedTrades: number;
  totalTradesAttempted: number;
}

class TradingScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private cycleIntervalMs: number = 10 * 60 * 1000; // 10 minutes (reduced from 15 for more frequent trading)
  private useAsterDex: boolean = true; // Enable AsterDEX by default
  private status: SchedulerStatus = {
    isRunning: false,
    lastCycleTime: null,
    nextCycleTime: null,
    cyclesCompleted: 0,
    successfulTrades: 0,
    failedTrades: 0,
    totalTradesAttempted: 0,
  };

  /**
   * Start the 24/7 trading scheduler
   */
  async start(intervalMinutes: number = 10): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️  Trading scheduler is already running');
      return;
    }

    this.cycleIntervalMs = intervalMinutes * 60 * 1000;
    this.isRunning = true;
    this.status.isRunning = true;
    this.status.nextCycleTime = new Date(Date.now() + this.cycleIntervalMs);

    console.log('\n' + '='.repeat(70));
    console.log('🚀 24/7 AUTONOMOUS TRADING SCHEDULER STARTED');
    console.log('='.repeat(70));
    console.log(`Interval: ${intervalMinutes} minutes`);
    console.log(`Next cycle: ${this.status.nextCycleTime.toISOString()}`);
    console.log('='.repeat(70) + '\n');

    // Update database
    await this.updateSchedulerConfig(true, intervalMinutes);

    // Send alert
    await sendTelegramAlert(
      `🚀 *24/7 Autonomous Trading ACTIVE*\n` +
      `Trading Interval: ${intervalMinutes} minutes\n` +
      `Next Cycle: ${this.status.nextCycleTime.toLocaleTimeString()}\n` +
      `Status: Agents will automatically scan and trade`
    );

    // Run first cycle asynchronously (don't wait for it)
    this.executeCycle().catch(error => {
      console.error('Error in first trading cycle:', error);
    });

    // Schedule recurring cycles
    this.intervalId = setInterval(async () => {
      await this.executeCycle();
    }, this.cycleIntervalMs);
  }

  /**
   * Stop the trading scheduler
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('⚠️  Trading scheduler is not running');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    this.status.isRunning = false;
    this.status.nextCycleTime = null;

    console.log('\n' + '='.repeat(70));
    console.log('⏸️  24/7 AUTONOMOUS TRADING SCHEDULER STOPPED');
    console.log('='.repeat(70));
    console.log(`Cycles Completed: ${this.status.cyclesCompleted}`);
    console.log(`Successful Trades: ${this.status.successfulTrades}`);
    console.log(`Failed Trades: ${this.status.failedTrades}`);
    console.log('='.repeat(70) + '\n');

    // Update database
    await this.updateSchedulerConfig(false, 0);

    // Send alert
    await sendTelegramAlert(
      `⏸️ *24/7 Autonomous Trading STOPPED*\n` +
      `Total Cycles: ${this.status.cyclesCompleted}\n` +
      `Successful Trades: ${this.status.successfulTrades}\n` +
      `Status: Manual trading only`
    );
  }

  /**
   * Execute one trading cycle
   */
  private async executeCycle(): Promise<void> {
    try {
      console.log('\n' + '🔄'.repeat(35));
      console.log('🤖 AUTOMATED TRADING CYCLE #' + (this.status.cyclesCompleted + 1));
      console.log('🔄'.repeat(35) + '\n');

      const cycleStartTime = Date.now();
      this.status.lastCycleTime = new Date();

      // Run MEV bot trading for MEV_BOT agents
      console.log('🎯 Running MEV bot trading cycle...');
      const mevAgents = await prisma.aIAgent.findMany({
        where: {
          strategyType: 'MEV_BOT',
          isActive: true
        }
      });

      let mevTotalOpportunities = 0;
      let mevExecutedTrades = 0;
      let mevTotalProfit = 0;

      for (const agent of mevAgents) {
        const mevResult = await runMEVBotTradingCycle(agent.id);
        if (mevResult.success) {
          mevTotalOpportunities += mevResult.opportunitiesFound;
          mevExecutedTrades += mevResult.opportunitiesExecuted;
          mevTotalProfit += mevResult.totalProfit;
        }
      }

      if (mevAgents.length > 0) {
        console.log(`\n📊 MEV Bot Summary:`);
        console.log(`   Agents: ${mevAgents.length}`);
        console.log(`   Opportunities: ${mevTotalOpportunities}`);
        console.log(`   Executed: ${mevExecutedTrades}`);
        console.log(`   Profit: $${mevTotalProfit.toFixed(2)}`);
      }

      // Run the trading cycle (AsterDEX or regular DEX)
      let results;
      if (this.useAsterDex) {
        console.log('\n🎯 Running AsterDEX perpetuals trading cycle...');
        results = await runAsterAutonomousTradingCycle();
      } else {
        console.log('\n🎯 Running regular DEX trading cycle...');
        results = await runAutonomousTradingCycle();
      }

      // Update statistics (include MEV bot trades)
      this.status.cyclesCompleted++;
      this.status.successfulTrades += results.filter(r => r.success).length + mevExecutedTrades;
      this.status.failedTrades += results.filter(r => !r.success && r.action !== 'HOLD').length;
      this.status.totalTradesAttempted += results.length + mevExecutedTrades;

      // Calculate next cycle time
      this.status.nextCycleTime = new Date(Date.now() + this.cycleIntervalMs);

      const cycleDuration = ((Date.now() - cycleStartTime) / 1000).toFixed(2);

      console.log('\n' + '✅'.repeat(35));
      console.log('📊 CYCLE COMPLETED');
      console.log('✅'.repeat(35));
      console.log(`Duration: ${cycleDuration}s`);
      console.log(`Next Cycle: ${this.status.nextCycleTime.toLocaleTimeString()}`);
      console.log(`Total Cycles: ${this.status.cyclesCompleted}`);
      console.log(`Success Rate: ${this.status.totalTradesAttempted > 0 ? ((this.status.successfulTrades / this.status.totalTradesAttempted) * 100).toFixed(1) : 0}%`);
      console.log('✅'.repeat(35) + '\n');

      // Send periodic summary (every 10 cycles)
      if (this.status.cyclesCompleted % 10 === 0) {
        await sendTelegramAlert(
          `📊 *24/7 Trading Checkpoint*\n` +
          `Cycle #${this.status.cyclesCompleted} Complete\n` +
          `✅ Successful: ${this.status.successfulTrades}\n` +
          `❌ Failed: ${this.status.failedTrades}\n` +
          `⏸️  Holds: ${this.status.totalTradesAttempted - this.status.successfulTrades - this.status.failedTrades}\n` +
          `Next: ${this.status.nextCycleTime?.toLocaleTimeString()}`
        );
      }

    } catch (error) {
      console.error('❌ Error in trading cycle:', error);
      
      // Send error alert
      await sendTelegramAlert(
        `⚠️ *Trading Cycle Error*\n` +
        `Cycle #${this.status.cyclesCompleted + 1} failed\n` +
        `Error: ${error instanceof Error ? error.message : 'Unknown'}\n` +
        `System will retry next cycle`
      );
    }
  }

  /**
   * Get current scheduler status
   */
  getStatus(): SchedulerStatus & { useAsterDex: boolean } {
    return { ...this.status, useAsterDex: this.useAsterDex };
  }

  /**
   * Toggle between AsterDEX and regular DEX
   */
  async setTradingMode(useAsterDex: boolean): Promise<void> {
    this.useAsterDex = useAsterDex;
    console.log(`\n🔄 Trading mode switched to: ${useAsterDex ? 'AsterDEX Perpetuals' : 'Regular DEX'}`);
    
    await sendTelegramAlert(
      `🔄 *Trading Mode Changed*\n` +
      `Mode: ${useAsterDex ? 'AsterDEX Perpetuals (Leveraged)' : 'Regular DEX (Spot)'}\n` +
      `Status: ${this.isRunning ? 'Active' : 'Inactive'}`
    );
  }

  /**
   * Update interval (requires restart)
   */
  async updateInterval(intervalMinutes: number): Promise<void> {
    const wasRunning = this.isRunning;
    
    if (wasRunning) {
      await this.stop();
    }

    if (wasRunning) {
      await this.start(intervalMinutes);
    }
  }

  /**
   * Update scheduler configuration in database
   */
  private async updateSchedulerConfig(enabled: boolean, intervalMinutes: number): Promise<void> {
    try {
      // Store scheduler config in a simple key-value table or agent metadata
      // For now, we'll use a simple approach with a special system agent
      const config = {
        schedulerEnabled: enabled,
        intervalMinutes,
        lastUpdate: new Date().toISOString(),
      };

      console.log('📝 Scheduler config updated:', config);
    } catch (error) {
      console.error('Error updating scheduler config:', error);
    }
  }
}

// Singleton instance
export const tradingScheduler = new TradingScheduler();
