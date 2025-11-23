import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { getPositionInfo, getMarketPrice, executeMarketTrade } from '../lib/aster-dex';

const prisma = new PrismaClient();

async function close5PercentPositions() {
  console.log('🎯 Closing all positions at 5%+ profit...\n');

  try {
    // Get all open positions from AsterDEX
    const positions = await getPositionInfo();
    const openPositions = positions.filter((p: any) => parseFloat(p.positionAmt) !== 0);
    
    console.log(`📊 Found ${openPositions.length} open positions\n`);

    if (openPositions.length === 0) {
      console.log('✅ No open positions');
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
      
      // Determine side
      const side = positionAmt > 0 ? 'LONG' : 'SHORT';
      const size = Math.abs(positionAmt);
      
      // Calculate profit percentage
      let profitPercent = 0;
      if (side === 'LONG') {
        profitPercent = ((markPrice - entryPrice) / entryPrice) * 100 * leverage;
      } else {
        profitPercent = ((entryPrice - markPrice) / entryPrice) * 100 * leverage;
      }

      console.log(`\n📈 ${symbol} ${side} ${leverage}x`);
      console.log(`   Entry: $${entryPrice.toFixed(2)} | Mark: $${markPrice.toFixed(2)}`);
      console.log(`   Size: ${size} | PnL: $${unrealizedPnl.toFixed(2)} (${profitPercent.toFixed(2)}%)`);

      // Close if profit >= 5%
      if (profitPercent >= 5.0) {
        console.log(`   ✅ CLOSING - Profit threshold met!`);
        
        try {
          // Execute closing trade (opposite direction)
          const closeSide = side === 'LONG' ? 'SELL' : 'BUY';
          
          const closeResult = await executeMarketTrade(
            symbol,
            closeSide,
            size
          );
          
          if (closeResult) {
            console.log(`   🎉 Position closed successfully!`);
            closedCount++;
            
            // Update database
            await prisma.trade.updateMany({
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
            
            console.log(`   💾 Database updated`);
          }
        } catch (error) {
          console.log(`   ❌ Error closing position:`, error);
        }
        
        // Wait between closes
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        console.log(`   ⏳ Holding - Only ${profitPercent.toFixed(2)}% profit`);
      }
    }

    console.log(`\n✅ Closed ${closedCount} positions at 5%+ profit`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

close5PercentPositions();
