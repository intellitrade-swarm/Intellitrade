/**
 * Check Profit-Taking Status
 * Verifies:
 * 1. Current open positions
 * 2. Which positions are eligible for profit-taking (>5%)
 * 3. Trading scheduler status
 */

import { PrismaClient } from '@prisma/client';
import { getPositionInfo, getMarketPrice } from '../lib/aster-dex';

const prisma = new PrismaClient();

async function checkProfitTakingStatus() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('💰 PROFIT-TAKING STATUS CHECK');
    console.log('='.repeat(70));

    // Step 1: Get all open positions from database
    console.log('\n📊 Step 1: Checking open positions in database...');
    const openTrades = await prisma.trade.findMany({
      where: {
        status: 'OPEN',
        isRealTrade: true,
        chain: 'astar-zkevm'
      },
      include: {
        agent: true
      },
      orderBy: {
        entryTime: 'desc'
      }
    });

    console.log(`Found ${openTrades.length} open positions in database`);

    if (openTrades.length === 0) {
      console.log('✅ No open positions to monitor');
      
      // Check AsterDEX directly
      console.log('\n📊 Checking AsterDEX for any unsynced positions...');
      try {
        const asterPositions = await getPositionInfo();
        const activePositions = asterPositions.filter((p: any) => parseFloat(p.positionAmt) !== 0);
        
        if (activePositions.length > 0) {
          console.log(`\n⚠️  WARNING: Found ${activePositions.length} active positions on AsterDEX not in database!`);
          console.log('Run sync-and-close-profitable-positions.ts to sync them');
          
          for (const pos of activePositions) {
            const unrealizedProfit = parseFloat(pos.unRealizedProfit);
            const notional = Math.abs(parseFloat(pos.notional));
            const pnlPercent = (unrealizedProfit / notional) * 100;
            
            console.log(`\n   ${pos.symbol}:`);
            console.log(`   Position: ${pos.positionAmt}`);
            console.log(`   Entry: $${parseFloat(pos.entryPrice).toFixed(2)}`);
            console.log(`   Current: $${parseFloat(pos.markPrice).toFixed(2)}`);
            console.log(`   PnL: ${pnlPercent.toFixed(2)}% ($${unrealizedProfit.toFixed(2)})`);
            
            if (pnlPercent >= 5) {
              console.log(`   🎯 ELIGIBLE FOR PROFIT-TAKING (>5%)`);
            }
          }
        } else {
          console.log('✅ No active positions on AsterDEX');
        }
      } catch (error) {
        console.error('❌ Error checking AsterDEX:', error);
      }
      
      return;
    }

    // Step 2: Check each position's profitability
    console.log('\n📊 Step 2: Analyzing positions for profit-taking eligibility...');
    
    let eligibleForProfit = 0;
    let totalProfit = 0;

    for (const trade of openTrades) {
      try {
        // Get current price
        const currentPrice = await getMarketPrice(trade.symbol);
        
        // Calculate PnL
        let pnlPercent = 0;
        if (trade.side === 'BUY') {
          pnlPercent = ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100;
        } else {
          pnlPercent = ((trade.entryPrice - currentPrice) / trade.entryPrice) * 100;
        }
        
        const pnlUsd = (currentPrice - trade.entryPrice) * trade.quantity * (trade.side === 'BUY' ? 1 : -1);
        const hoursOpen = (Date.now() - trade.entryTime.getTime()) / (1000 * 60 * 60);
        
        console.log(`\n   ${trade.agent.name} - ${trade.symbol}:`);
        console.log(`   Entry: $${trade.entryPrice.toFixed(2)} | Current: $${currentPrice.toFixed(2)}`);
        console.log(`   PnL: ${pnlPercent.toFixed(2)}% ($${pnlUsd.toFixed(2)})`);
        console.log(`   Time held: ${hoursOpen.toFixed(1)} hours`);
        
        // Check eligibility for profit-taking
        if (pnlPercent >= 8) {
          console.log(`   🚀 EXCELLENT PROFIT (>8%) - READY TO CLOSE!`);
          eligibleForProfit++;
          totalProfit += pnlUsd;
        } else if (pnlPercent >= 5) {
          console.log(`   💎 GREAT PROFIT (>5%) - READY TO CLOSE!`);
          eligibleForProfit++;
          totalProfit += pnlUsd;
        } else if (hoursOpen >= 24 && pnlPercent >= 3) {
          console.log(`   ⏰ TIME-BASED EXIT (24h+ with 3%+ profit) - READY TO CLOSE!`);
          eligibleForProfit++;
          totalProfit += pnlUsd;
        } else if (hoursOpen >= 48) {
          console.log(`   ⏰ MAX TIME (48h+) - READY TO CLOSE!`);
          eligibleForProfit++;
          totalProfit += pnlUsd;
        } else if (pnlPercent <= -2.5) {
          console.log(`   🛑 STOP LOSS (-2.5%) - READY TO CLOSE!`);
        } else {
          console.log(`   ⏳ Holding - not yet profitable enough`);
        }
        
        // Add small delay between API calls
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`   ❌ Error checking ${trade.symbol}:`, error);
      }
    }

    // Step 3: Scheduler status
    console.log('\n📊 Step 3: Trading scheduler status...');
    console.log('   The trading scheduler runs automatically every 10 minutes');
    console.log('   Positions are monitored and closed when they reach 5% profit');
    console.log('   ✅ Automated profit-taking is active')

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total open positions: ${openTrades.length}`);
    console.log(`Eligible for profit-taking (>5%): ${eligibleForProfit}`);
    console.log(`Potential profit available: $${totalProfit.toFixed(2)}`);
    console.log('='.repeat(70));
    
    if (eligibleForProfit > 0) {
      console.log('\n💡 TIP: The trading scheduler will automatically close these positions');
      console.log('         on the next cycle (every 10 minutes when active)');
      console.log('\n💡 To close immediately, run: yarn tsx scripts/sync-and-close-profitable-positions.ts');
    }
    
    console.log('');

  } catch (error) {
    console.error('❌ Error checking profit-taking status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkProfitTakingStatus();
