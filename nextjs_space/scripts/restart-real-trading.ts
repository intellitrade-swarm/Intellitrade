
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { testConnection } from '@/lib/aster-dex';
import { tradingScheduler } from '@/lib/trading-scheduler';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function restartRealTrading() {
  try {
    console.log('\n🚀 RESTARTING REAL MONEY TRADING SYSTEM\n');
    console.log('=' .repeat(60));

    // Step 1: Verify AsterDEX Connection
    console.log('\n📡 Step 1: Testing AsterDEX Connection...\n');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ ERROR: Cannot connect to AsterDEX API');
      console.error('   Please check your API credentials in .env file');
      process.exit(1);
    }
    
    console.log('✅ AsterDEX connection successful\n');

    // Step 2: Verify Agent Balances
    console.log('📊 Step 2: Verifying Agent Balances...\n');
    const agents = await prisma.aIAgent.findMany({
      where: { isActive: true },
      select: { 
        name: true, 
        realBalance: true, 
        currentBalance: true,
        totalProfitLoss: true
      }
    });
    
    let totalCapital = 0;
    agents.forEach(a => {
      const balance = a.realBalance || a.currentBalance || 0;
      totalCapital += balance;
      console.log(`  ${a.name}: $${balance.toFixed(2)} (PnL: $${(a.totalProfitLoss || 0).toFixed(2)})`);
    });
    
    console.log(`\n💰 Total Trading Capital: $${totalCapital.toFixed(2)}\n`);
    
    if (totalCapital < 10) {
      console.warn('⚠️  WARNING: Low total capital. Consider funding agents before starting.');
      console.log('   Minimum recommended: $100 per agent\n');
    }

    // Step 3: Check for Open Positions
    console.log('🔓 Step 3: Checking for Open Positions...\n');
    const openPositions = await prisma.trade.findMany({
      where: { 
        status: 'OPEN',
        isRealTrade: true 
      },
      select: {
        symbol: true,
        side: true,
        entryPrice: true,
        entryTime: true,
        agent: { select: { name: true } }
      }
    });
    
    if (openPositions.length > 0) {
      console.log(`  Found ${openPositions.length} open position(s):`);
      openPositions.forEach(p => {
        console.log(`    - ${p.agent.name}: ${p.side} ${p.symbol} @ $${p.entryPrice}`);
      });
      console.log('\n  ⚠️  Scheduler will monitor these positions for profit-taking\n');
    } else {
      console.log('  ✅ No open positions. Ready for fresh trades.\n');
    }

    // Step 4: Stop existing scheduler (if running)
    console.log('⏹️  Step 4: Stopping any existing scheduler...\n');
    await tradingScheduler.stop();
    console.log('  ✅ Scheduler stopped\n');

    // Step 5: Configure for Real Trading
    console.log('⚙️  Step 5: Configuring Trading Mode...\n');
    await tradingScheduler.setTradingMode(true); // AsterDEX mode
    console.log('  ✅ Trading mode set to: REAL MONEY (AsterDEX)\n');

    // Step 6: Start Scheduler
    console.log('▶️  Step 6: Starting 24/7 Trading Scheduler...\n');
    const intervalMinutes = 15; // Check markets every 15 minutes
    await tradingScheduler.start(intervalMinutes);
    
    console.log(`  ✅ Scheduler started with ${intervalMinutes}-minute intervals\n`);

    // Step 7: Verify Scheduler is Running
    console.log('✔️  Step 7: Verifying Scheduler Status...\n');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    const status = tradingScheduler.getStatus();
    console.log(`  Status: ${status.isRunning ? '🟢 RUNNING' : '🔴 STOPPED'}`);
    console.log(`  Mode: ${status.useAsterDex ? 'Real Money (AsterDEX)' : 'Simulation'}`);
    console.log(`  Interval: ${intervalMinutes} minutes`);
    console.log(`  Next cycle: ${status.nextCycleTime || 'Calculating...'}\n`);

    if (!status.isRunning) {
      console.error('❌ ERROR: Scheduler failed to start');
      process.exit(1);
    }

    // Final Summary
    console.log('=' .repeat(60));
    console.log('\n🎉 TRADING SYSTEM ACTIVATED!\n');
    console.log('Configuration Summary:');
    console.log('  • Mode: REAL MONEY TRADING');
    console.log('  • Platform: AsterDEX Perpetuals');
    console.log('  • Active Agents: ' + agents.length);
    console.log('  • Total Capital: $' + totalCapital.toFixed(2));
    console.log('  • Trading Cycle: Every ' + intervalMinutes + ' minutes');
    console.log('  • Profit-Taking: 1.5%+ (Aggressive)');
    console.log('  • Stop-Loss: -2.5%');
    console.log('\n📊 The system will now:');
    console.log('  1. Analyze markets every ' + intervalMinutes + ' minutes');
    console.log('  2. Execute profitable trades with real money');
    console.log('  3. Monitor open positions continuously');
    console.log('  4. Close positions at 1.5%+ profit');
    console.log('  5. Apply stop-loss at -2.5% loss');
    console.log('\n⚠️  IMPORTANT REMINDERS:');
    console.log('  • This is REAL MONEY TRADING');
    console.log('  • Monitor your positions regularly');
    console.log('  • Check the dashboard: https://intellitrade.xyz/arena');
    console.log('  • Trading activity will appear within 15 minutes');
    console.log('\n✅ Trading scheduler is now running autonomously!\n');
    console.log('=' .repeat(60));

    await prisma.$disconnect();
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

restartRealTrading();
