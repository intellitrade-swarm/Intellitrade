import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { getPositionInfo, executeMarketTrade } from '../lib/aster-dex';

const prisma = new PrismaClient();

const PROFIT_TARGET = 5.0; // 5% profit target

async function checkAndCloseProfitablePositions() {
  console.log(`\n🎯 Checking for positions at ${PROFIT_TARGET}% profit...\n`);

  try {
    const positions = await getPositionInfo();
    const openPositions = positions.filter((p: any) => parseFloat(p.positionAmt) !== 0);
    
    if (openPositions.length === 0) {
      console.log('No open positions');
      return;
    }

    let closedCount = 0;

    for (const position of openPositions) {
      const symbol = position.symbol;
      const positionAmt = parseFloat(position.positionAmt);
      const entryPrice = parseFloat(position.entryPrice);
      const markPrice = parseFloat(position.markPrice || position.entryPrice);
      const unrealizedPnl = parseFloat(position.unRealizedProfit || '0');
      const leverage = parseFloat(position.leverage || '1');
      
      const side = positionAmt > 0 ? 'LONG' : 'SHORT';
      const size = Math.abs(positionAmt);
      
      // Calculate leveraged profit percentage
      let profitPercent = 0;
      if (side === 'LONG') {
        profitPercent = ((markPrice - entryPrice) / entryPrice) * 100 * leverage;
      } else {
        profitPercent = ((entryPrice - markPrice) / entryPrice) * 100 * leverage;
      }

      console.log(`📊 ${symbol} ${side} ${leverage}x: ${profitPercent.toFixed(2)}% profit ($${unrealizedPnl.toFixed(2)})`);

      // Close if profit >= target
      if (profitPercent >= PROFIT_TARGET) {
        console.log(`   ✅ CLOSING at ${profitPercent.toFixed(2)}% profit!`);
        
        try {
          const closeSide = side === 'LONG' ? 'SELL' : 'BUY';
          const result = await executeMarketTrade(symbol, closeSide, size);
          
          if (result) {
            console.log(`   🎉 Closed successfully! Profit: $${unrealizedPnl.toFixed(2)}`);
            closedCount++;
            
            // Update database
            const updatedTrades = await prisma.trade.updateMany({
              where: {
                symbol: symbol,
                status: 'OPEN'
              },
              data: {
                status: 'CLOSED',
                exitPrice: markPrice,
                exitTime: new Date(),
                profitLoss: unrealizedPnl
              }
            });
            
            console.log(`   💾 Database updated (${updatedTrades.count} trades)`);
            console.log(`   💰 Profit: $${unrealizedPnl.toFixed(2)} (${profitPercent.toFixed(2)}%)`)
          }
        } catch (error) {
          console.log(`   ❌ Error:`, error);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    if (closedCount > 0) {
      console.log(`\n✅ Closed ${closedCount} profitable positions`);
    } else {
      console.log(`\n⏳ No positions ready to close yet (need ${PROFIT_TARGET}% profit)`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run immediately and then every 5 minutes
checkAndCloseProfitablePositions();

setInterval(() => {
  checkAndCloseProfitablePositions();
}, 5 * 60 * 1000);

console.log('🚀 Profit-taking monitor running (checking every 5 minutes)...');
