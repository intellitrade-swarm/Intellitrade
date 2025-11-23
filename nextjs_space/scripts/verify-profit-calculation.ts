import 'dotenv/config';
import { getPositionInfo, getMarketPrice } from '../lib/aster-dex';

async function verifyProfitCalculation() {
  console.log('🔍 Verifying profit calculations...\n');

  try {
    const positions = await getPositionInfo();
    const openPositions = positions.filter((p: any) => parseFloat(p.positionAmt) !== 0);
    
    console.log(`📊 Current open positions: ${openPositions.length}\n`);

    for (const position of openPositions) {
      const symbol = position.symbol;
      const positionAmt = parseFloat(position.positionAmt);
      const entryPrice = parseFloat(position.entryPrice);
      const markPrice = parseFloat(position.markPrice || position.entryPrice);
      const unrealizedPnl = parseFloat(position.unRealizedProfit || '0');
      const notional = parseFloat(position.notional || '0');
      const leverage = parseFloat(position.leverage || '1');
      const isolatedWallet = parseFloat(position.isolatedWallet || '0');
      
      // Determine side
      const side = positionAmt > 0 ? 'LONG' : 'SHORT';
      const size = Math.abs(positionAmt);
      const notionalValue = size * markPrice;
      
      // Calculate profit percentage (various methods)
      
      // Method 1: Based on entry vs mark price with leverage
      let profitPercent1 = 0;
      if (side === 'LONG') {
        profitPercent1 = ((markPrice - entryPrice) / entryPrice) * 100 * leverage;
      } else {
        profitPercent1 = ((entryPrice - markPrice) / entryPrice) * 100 * leverage;
      }
      
      // Method 2: Based on PnL vs notional (position value)
      const profitPercent2 = (unrealizedPnl / notionalValue) * 100;
      
      // Method 3: Based on PnL vs isolated wallet (margin)
      const profitPercent3 = isolatedWallet > 0 ? (unrealizedPnl / isolatedWallet) * 100 : 0;
      
      // Get current market price
      const currentPrice = await getMarketPrice(symbol);
      
      console.log(`\n${'='.repeat(70)}`);
      console.log(`📈 ${symbol} - ${side} Position (${leverage}x leverage)`);
      console.log(`${'='.repeat(70)}`);
      console.log(`Entry Price:         $${entryPrice.toFixed(2)}`);
      console.log(`Mark Price:          $${markPrice.toFixed(2)}`);
      console.log(`Current Price:       $${currentPrice.toFixed(2)}`);
      console.log(`Position Size:       ${size} ${symbol.replace('USDT', '')}`);
      console.log(`Notional Value:      $${notionalValue.toFixed(2)}`);
      console.log(`Isolated Wallet:     $${isolatedWallet.toFixed(2)}`);
      console.log(`Unrealized PnL:      $${unrealizedPnl.toFixed(2)}`);
      console.log(``);
      console.log(`Profit % (Method 1): ${profitPercent1.toFixed(2)}% (Price movement × Leverage)`);
      console.log(`Profit % (Method 2): ${profitPercent2.toFixed(2)}% (PnL / Position Value)`);
      console.log(`Profit % (Method 3): ${profitPercent3.toFixed(2)}% (PnL / Margin)`);
      console.log(``);
      
      if (profitPercent1 >= 5.0 || profitPercent3 >= 5.0) {
        console.log(`✅ READY TO CLOSE - Profit threshold met!`);
      } else {
        console.log(`⏳ Hold - Need ${(5.0 - Math.max(profitPercent1, profitPercent3)).toFixed(2)}% more`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifyProfitCalculation();
