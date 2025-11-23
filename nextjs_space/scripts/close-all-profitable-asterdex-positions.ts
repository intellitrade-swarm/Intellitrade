
/**
 * Close ALL profitable positions on AsterDEX (>2% profit)
 * This script works directly with AsterDEX positions, regardless of database state
 */

import { getPositionInfo, getMarketPrice, executeMarketTrade } from '../lib/aster-dex';

async function closeAllProfitablePositions() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('💰 CLOSING ALL PROFITABLE ASTERDEX POSITIONS');
    console.log('='.repeat(70));

    // Get all open positions from AsterDEX
    console.log('\n📊 Fetching open positions from AsterDEX...');
    const positions = await getPositionInfo();
    const openPositions = positions.filter((p) => parseFloat(p.positionAmt) !== 0);
    
    console.log(`✅ Found ${openPositions.length} open positions on AsterDEX`);

    if (openPositions.length === 0) {
      console.log('✅ No open positions to close');
      return;
    }

    let closedCount = 0;
    let totalProfit = 0;
    let skippedCount = 0;

    // Process each position
    for (const pos of openPositions) {
      try {
        const symbol = pos.symbol;
        const positionAmt = parseFloat(pos.positionAmt);
        const entryPrice = parseFloat(pos.entryPrice);
        const unrealizedProfit = parseFloat(pos.unRealizedProfit);
        const notional = Math.abs(parseFloat(pos.notional));
        
        // Calculate PnL percentage
        const pnlPercent = (unrealizedProfit / notional) * 100;
        const side = positionAmt > 0 ? 'LONG' : 'SHORT';
        
        console.log(`\n📊 Position: ${symbol}`);
        console.log(`   Side: ${side}`);
        console.log(`   Entry: $${entryPrice.toFixed(2)}`);
        console.log(`   Size: ${Math.abs(positionAmt)}`);
        console.log(`   Unrealized PnL: $${unrealizedProfit.toFixed(2)} (${pnlPercent.toFixed(2)}%)`);

        // Check if position is profitable enough to close (>2% profit)
        if (pnlPercent >= 2) {
          console.log(`   💰 PROFITABLE! Closing position...`);
          
          try {
            // Close position on AsterDEX
            const closeSide = side === 'LONG' ? 'SELL' : 'BUY';
            const quantity = Math.abs(positionAmt);
            
            console.log(`   🔄 Executing: ${closeSide} ${quantity} ${symbol}...`);
            const closeOrder = await executeMarketTrade(symbol, closeSide, quantity);
            console.log(`   ✅ Position closed - Order ID: ${closeOrder.orderId}`);
            console.log(`   💵 Profit taken: $${unrealizedProfit.toFixed(2)}`);
            
            closedCount++;
            totalProfit += unrealizedProfit;
            
            // Wait between closes to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
            
          } catch (closeError) {
            console.error(`   ❌ Error closing position:`, closeError);
          }
        } else if (pnlPercent <= -2.5) {
          console.log(`   🛑 STOP LOSS! Closing position to cut losses...`);
          
          try {
            const closeSide = side === 'LONG' ? 'SELL' : 'BUY';
            const quantity = Math.abs(positionAmt);
            
            console.log(`   🔄 Executing: ${closeSide} ${quantity} ${symbol}...`);
            const closeOrder = await executeMarketTrade(symbol, closeSide, quantity);
            console.log(`   ✅ Position closed - Order ID: ${closeOrder.orderId}`);
            console.log(`   ✂️  Loss cut: $${unrealizedProfit.toFixed(2)}`);
            
            closedCount++;
            totalProfit += unrealizedProfit;
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
          } catch (closeError) {
            console.error(`   ❌ Error closing position:`, closeError);
          }
        } else {
          console.log(`   ⏳ Not profitable enough yet (${pnlPercent.toFixed(2)}%), keeping open`);
          skippedCount++;
        }

      } catch (error) {
        console.error(`   ❌ Error processing position:`, error);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ PROFIT-TAKING COMPLETE');
    console.log('='.repeat(70));
    console.log(`📊 Total positions: ${openPositions.length}`);
    console.log(`💰 Positions closed: ${closedCount}`);
    console.log(`⏳ Positions kept open: ${skippedCount}`);
    console.log(`💵 Total profit taken: $${totalProfit.toFixed(2)}`);
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the profit-taking
closeAllProfitablePositions();
