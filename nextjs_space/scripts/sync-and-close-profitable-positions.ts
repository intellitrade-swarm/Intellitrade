
/**
 * Sync database with AsterDEX and close profitable positions
 * This script:
 * 1. Gets all open positions from AsterDEX
 * 2. Syncs them with database
 * 3. Closes profitable positions (>2% profit)
 * 4. Updates treasury with profit shares
 */

import { PrismaClient } from '@prisma/client';
import { getPositionInfo, getMarketPrice, executeMarketTrade } from '../lib/aster-dex';
import { recordProfitShare } from '../lib/treasury';

const prisma = new PrismaClient();

interface AsterPosition {
  symbol: string;
  positionAmt: string;
  entryPrice: string;
  unRealizedProfit: string;
  notional: string;
  positionSide: string;
}

async function syncAndCloseProfitablePositions() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🔄 SYNCING DATABASE WITH ASTERDEX AND CLOSING PROFITABLE POSITIONS');
    console.log('='.repeat(70));

    // Step 1: Get all open positions from AsterDEX
    console.log('\n📊 Step 1: Fetching open positions from AsterDEX...');
    const asterPositions = await getPositionInfo();
    const openPositions = asterPositions.filter((p: AsterPosition) => parseFloat(p.positionAmt) !== 0);
    
    console.log(`✅ Found ${openPositions.length} open positions on AsterDEX`);

    if (openPositions.length === 0) {
      console.log('✅ No open positions to sync or close');
      return;
    }

    // Step 2: Sync database - mark all AsterDEX trades as OPEN if they exist on AsterDEX
    console.log('\n🔄 Step 2: Syncing database with AsterDEX...');
    
    let syncedCount = 0;
    let closedCount = 0;
    let totalProfit = 0;

    for (const asterPos of openPositions) {
      try {
        const symbol = asterPos.symbol;
        const positionAmt = parseFloat(asterPos.positionAmt);
        const entryPrice = parseFloat(asterPos.entryPrice);
        const unrealizedProfit = parseFloat(asterPos.unRealizedProfit);
        const notional = Math.abs(parseFloat(asterPos.notional));
        
        // Get current market price
        let currentPrice = 0;
        try {
          currentPrice = await getMarketPrice(symbol);
        } catch (error) {
          console.warn(`⚠️  Could not get price for ${symbol}, skipping...`);
          continue;
        }

        // Calculate PnL percentage
        const pnlPercent = (unrealizedProfit / notional) * 100;
        const side = positionAmt > 0 ? 'BUY' : 'SELL';
        
        console.log(`\n📊 Position: ${symbol}`);
        console.log(`   Side: ${side}`);
        console.log(`   Entry: $${entryPrice.toFixed(2)}`);
        console.log(`   Current: $${currentPrice.toFixed(2)}`);
        console.log(`   Unrealized PnL: $${unrealizedProfit.toFixed(2)} (${pnlPercent.toFixed(2)}%)`);

        // Find corresponding trade in database
        const dbTrade = await prisma.trade.findFirst({
          where: {
            symbol: symbol,
            isRealTrade: true,
            chain: 'astar-zkevm',
            // Look for trades within 5% of entry price
            entryPrice: {
              gte: entryPrice * 0.95,
              lte: entryPrice * 1.05
            }
          },
          orderBy: {
            entryTime: 'desc'
          },
          include: {
            agent: true
          }
        });

        if (dbTrade) {
          // Update trade status to OPEN if it was closed
          if (dbTrade.status === 'CLOSED') {
            await prisma.trade.update({
              where: { id: dbTrade.id },
              data: {
                status: 'OPEN'
              }
            });
            console.log(`   🔄 Synced: Marked trade as OPEN in database`);
            syncedCount++;
          }

          // Check if position is profitable enough to close (>5% profit)
          if (pnlPercent >= 5) {
            console.log(`   💰 PROFITABLE: ${pnlPercent.toFixed(2)}% - Closing position...`);
            
            try {
              // Close position on AsterDEX
              const closeSide = side === 'BUY' ? 'SELL' : 'BUY';
              const quantity = Math.abs(positionAmt);
              
              console.log(`   🔄 Executing close order: ${closeSide} ${quantity} ${symbol}...`);
              const closeOrder = await executeMarketTrade(symbol, closeSide, quantity);
              console.log(`   ✅ Position closed on AsterDEX - Order ID: ${closeOrder.orderId}`);
              
              // Update database
              const pnl = unrealizedProfit;
              await prisma.trade.update({
                where: { id: dbTrade.id },
                data: {
                  status: 'CLOSED',
                  exitPrice: currentPrice,
                  exitTime: new Date(),
                  profitLoss: pnl
                }
              });

              // Update agent stats
              await prisma.aIAgent.update({
                where: { id: dbTrade.agentId },
                data: {
                  totalWins: { increment: 1 },
                  realBalance: { increment: pnl },
                  totalProfitLoss: { increment: pnl }
                }
              });

              // Record profit share to treasury (5% of profit)
              if (pnl > 0) {
                await recordProfitShare(dbTrade.agentId, dbTrade.id, pnl, 'astar-zkevm');
                console.log(`   💎 Treasury share: $${(pnl * 0.05).toFixed(4)} (5% of profit)`);
              }

              closedCount++;
              totalProfit += pnl;
              console.log(`   ✅ Trade closed with profit: $${pnl.toFixed(4)}`);
              
              // Wait between closes to avoid rate limits
              await new Promise(resolve => setTimeout(resolve, 1000));
              
            } catch (closeError) {
              console.error(`   ❌ Error closing position:`, closeError);
            }
          } else {
            console.log(`   ⏳ Not profitable enough yet (${pnlPercent.toFixed(2)}%), keeping open`);
          }
        } else {
          console.log(`   ⚠️  No matching trade found in database`);
        }

      } catch (error) {
        console.error(`   ❌ Error processing position:`, error);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ SYNC AND PROFIT-TAKING COMPLETE');
    console.log('='.repeat(70));
    console.log(`📊 Trades synced: ${syncedCount}`);
    console.log(`💰 Positions closed: ${closedCount}`);
    console.log(`💵 Total profit taken: $${totalProfit.toFixed(4)}`);
    console.log(`💎 Treasury received: $${(totalProfit * 0.05).toFixed(4)}`);
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Error in sync and close:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync and close process
syncAndCloseProfitablePositions();
