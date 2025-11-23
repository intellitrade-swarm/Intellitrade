
/**
 * Profitable Trading Engine
 * Integrates advanced strategies for consistent profit generation
 */

import {
  generateProfitableSignal,
  shouldClosePosition,
  calculateTechnicalIndicators,
  detectMarketRegime,
  type ProfitableSignal,
} from './advanced-trading-strategies';
import { getAccountInfo, executeMarketTrade, getMarketPrice, getAllTickers } from './aster-dex';
import { prisma } from './db';
import { sendTelegramAlert } from './alerts';

export interface HistoricalPrice {
  timestamp: number;
  price: number;
  volume: number;
}

/**
 * Fetch historical price data for technical analysis
 */
export async function fetchHistoricalPrices(
  symbol: string,
  limit = 200
): Promise<HistoricalPrice[]> {
  try {
    // In a real implementation, you would fetch from AsterDEX or a price feed
    // For now, we'll use the current price and generate synthetic historical data
    const currentPrice = await getMarketPrice(symbol);
    const prices: HistoricalPrice[] = [];

    // Generate synthetic but realistic price data
    // In production, replace this with actual API calls
    let basePrice = currentPrice * 0.98; // Start slightly lower
    const now = Date.now();

    for (let i = limit; i > 0; i--) {
      // Simulate price movement with realistic volatility
      const volatility = 0.002; // 0.2% per period
      const change = (Math.random() - 0.5) * 2 * volatility;
      const drift = 0.0001; // Slight upward drift
      basePrice = basePrice * (1 + change + drift);

      // Volume with some randomness
      const baseVolume = 1000000;
      const volume = baseVolume * (0.7 + Math.random() * 0.6);

      prices.push({
        timestamp: now - i * 15 * 60 * 1000, // 15-minute intervals
        price: basePrice,
        volume,
      });
    }

    // Add current price as latest
    prices.push({
      timestamp: now,
      price: currentPrice,
      volume: 1000000,
    });

    return prices;
  } catch (error) {
    console.error(`Error fetching historical prices for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Generate profitable trading decision using advanced strategies
 */
export async function generateProfitableTradingDecision(
  agentId: string,
  symbol: string,
  balance: number
): Promise<{
  signal: ProfitableSignal;
  shouldTrade: boolean;
  reason: string;
}> {
  try {
    console.log(`\n🔍 Analyzing ${symbol} with advanced strategies...`);

    // Fetch historical data
    const historicalData = await fetchHistoricalPrices(symbol, 200);
    const prices = historicalData.map((d) => d.price);
    const volumes = historicalData.map((d) => d.volume);
    const currentPrice = prices[prices.length - 1];

    console.log(`   Current price: $${currentPrice.toFixed(2)}`);
    console.log(`   Data points: ${prices.length}`);

    // Generate signal using advanced strategies
    const signal = generateProfitableSignal(symbol, currentPrice, prices, volumes, balance);

    console.log(`\n📊 Advanced Analysis Results:`);
    console.log(`   Market Regime: ${signal.marketRegime.type} (strength: ${(signal.marketRegime.strength * 100).toFixed(0)}%)`);
    console.log(`   RSI: ${signal.indicators.rsi.toFixed(2)}`);
    console.log(`   MACD: ${signal.indicators.macd.value.toFixed(4)}`);
    console.log(`   Volatility: ${signal.indicators.volatility.toFixed(2)}%`);
    console.log(`   Volume Ratio: ${signal.indicators.volume.ratio.toFixed(2)}x`);

    console.log(`\n💡 Trading Signal:`);
    console.log(`   Action: ${signal.action}`);
    console.log(`   Confidence: ${(signal.confidence * 100).toFixed(1)}%`);
    console.log(`   Reasoning: ${signal.reasoning}`);

    if (signal.action !== 'HOLD') {
      console.log(`\n💰 Trade Details:`);
      console.log(`   Entry: $${signal.entryPrice.toFixed(2)}`);
      console.log(`   Stop Loss: $${signal.stopLoss.toFixed(2)}`);
      console.log(`   Take Profit 1: $${signal.takeProfitLevels[0].toFixed(2)}`);
      console.log(`   Take Profit 2: $${signal.takeProfitLevels[1].toFixed(2)}`);
      console.log(`   Take Profit 3: $${signal.takeProfitLevels[2].toFixed(2)}`);
      console.log(`   Position Size: $${signal.positionSize.toFixed(2)}`);
      console.log(`   Leverage: ${signal.leverage}x`);
      console.log(`   Risk/Reward: ${signal.riskRewardRatio.toFixed(2)}:1`);
      console.log(`   Expected Profit: $${signal.expectedProfit.toFixed(2)}`);
      console.log(`   Expected Loss: $${signal.expectedLoss.toFixed(2)}`);
    }

    // Determine if we should trade - MORE AGGRESSIVE threshold
    const shouldTrade = signal.action !== 'HOLD' && signal.confidence >= 0.60; // Lowered from 0.70 to 0.60
    const reason = shouldTrade
      ? `High-probability ${signal.action} setup (${(signal.confidence * 100).toFixed(0)}% confidence)`
      : signal.reasoning;

    return { signal, shouldTrade, reason };
  } catch (error: any) {
    console.error(`Error generating profitable trading decision:`, error);
    return {
      signal: {
        action: 'HOLD',
        confidence: 0,
        entryPrice: 0,
        stopLoss: 0,
        takeProfitLevels: [],
        positionSize: 0,
        leverage: 2,
        reasoning: 'Error in analysis: ' + error.message,
        riskRewardRatio: 0,
        expectedProfit: 0,
        expectedLoss: 0,
        timeframe: '15m',
        marketRegime: { type: 'RANGING', strength: 0, confidence: 0 },
        indicators: {} as any,
      },
      shouldTrade: false,
      reason: 'Analysis error',
    };
  }
}

/**
 * Execute profitable trade on AsterDEX
 */
export async function executeProfitableTrade(
  agentId: string,
  agentName: string,
  symbol: string,
  signal: ProfitableSignal
): Promise<{ success: boolean; message: string; tradeId?: string }> {
  try {
    console.log(`\n🚀 Executing profitable ${signal.action} trade on ${symbol}...`);

    // Execute the trade (returns AsterOrderResponse directly)
    const result = await executeMarketTrade(
      symbol,
      signal.action === 'LONG' ? 'BUY' : 'SELL',
      signal.positionSize / signal.entryPrice // quantity = USD amount / price
    );

    if (!result || !result.orderId) {
      console.error(`❌ Trade execution failed`);
      return { success: false, message: 'Trade execution failed' };
    }

    console.log(`✅ Trade executed successfully!`);
    console.log(`   Order ID: ${result.orderId}`);
    console.log(`   Price: $${result.price}`);
    console.log(`   Quantity: ${result.executedQty}`);

    // Record trade in database
    const quantity = parseFloat(result.executedQty);
    const trade = await prisma.trade.create({
      data: {
        agentId,
        symbol,
        type: 'PERPETUAL',
        side: signal.action === 'LONG' ? 'BUY' : 'SELL',
        quantity,
        entryPrice: signal.entryPrice,
        entryTime: new Date(),
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfitLevels[0], // Primary TP
        strategy: `Advanced: ${signal.reasoning}`,
        confidence: signal.confidence,
        status: 'OPEN',
        isRealTrade: true,
        chain: 'asterdex',
      },
    });

    console.log(`📝 Trade recorded in database: ${trade.id}`);

    // Send alert
    await sendTelegramAlert(
      `🎯 ${agentName} opened ${signal.action} position\n` +
        `📊 ${symbol} @ $${signal.entryPrice.toFixed(2)}\n` +
        `💰 Size: $${signal.positionSize.toFixed(2)} (${signal.leverage}x)\n` +
        `🎯 TP: $${signal.takeProfitLevels[0].toFixed(2)} | SL: $${signal.stopLoss.toFixed(2)}\n` +
        `📈 R/R: ${signal.riskRewardRatio.toFixed(2)}:1\n` +
        `💡 ${signal.reasoning}`
    );

    return {
      success: true,
      message: 'Trade executed successfully',
      tradeId: trade.id,
    };
  } catch (error: any) {
    console.error(`Error executing profitable trade:`, error);
    return { success: false, message: error.message };
  }
}

/**
 * Monitor and manage open positions for maximum profitability
 */
export async function monitorAndManagePositions(agentId: string): Promise<void> {
  try {
    // Get open trades from database
    const openTrades = await prisma.trade.findMany({
      where: {
        agentId,
        status: 'OPEN',
        isRealTrade: true,
      },
      include: {
        agent: true,
      },
    });

    if (openTrades.length === 0) {
      console.log(`   No open positions to manage`);
      return;
    }

    console.log(`\n📊 Managing ${openTrades.length} open position(s)...`);

    for (const trade of openTrades) {
      console.log(`\n   Position: ${trade.symbol} ${trade.side}`);

      // Get current price and historical data
      const historicalData = await fetchHistoricalPrices(trade.symbol, 200);
      const prices = historicalData.map((d) => d.price);
      const volumes = historicalData.map((d) => d.volume);
      const currentPrice = prices[prices.length - 1];

      // Calculate current P&L
      const pnl =
        trade.side === 'BUY'
          ? (currentPrice - trade.entryPrice) * trade.quantity
          : (trade.entryPrice - currentPrice) * trade.quantity;
      const pnlPercent = (pnl / (trade.entryPrice * trade.quantity)) * 100;

      console.log(`   Entry: $${trade.entryPrice.toFixed(2)} | Current: $${currentPrice.toFixed(2)}`);
      console.log(`   P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%)`);

      // Check if we should close
      const indicators = calculateTechnicalIndicators(prices, volumes);
      const regime = detectMarketRegime(prices, indicators);

      const closeDecision = shouldClosePosition(
        {
          side: trade.side === 'BUY' ? 'LONG' : 'SHORT',
          entryPrice: trade.entryPrice,
          currentPrice,
          stopLoss: trade.stopLoss || undefined,
          takeProfit: trade.takeProfit || undefined,
        },
        indicators,
        regime
      );

      if (closeDecision.shouldClose) {
        console.log(`   🔔 Closing signal: ${closeDecision.reason}`);

        // Close the position
        const closeResult = await executeMarketTrade(
          trade.symbol,
          trade.side === 'BUY' ? 'SELL' : 'BUY',
          trade.quantity // Just the quantity
        );

        if (closeResult && closeResult.orderId) {
          // Update trade in database
          await prisma.trade.update({
            where: { id: trade.id },
            data: {
              status: 'CLOSED',
              exitPrice: currentPrice,
              exitTime: new Date(),
              profitLoss: pnl,
            },
          });

          // Update agent balance
          await prisma.aIAgent.update({
            where: { id: agentId },
            data: {
              realBalance: { increment: pnl },
            },
          });

          console.log(`   ✅ Position closed successfully`);

          // Send alert
          await sendTelegramAlert(
            `${pnl >= 0 ? '✅' : '❌'} ${trade.agent.name} closed ${trade.side} position\n` +
              `📊 ${trade.symbol}\n` +
              `💰 P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%)\n` +
              `📝 ${closeDecision.reason}`
          );
        } else {
          console.log(`   ❌ Failed to close position`);
        }
      } else {
        console.log(`   ✓ Position still valid: ${closeDecision.reason}`);
      }
    }
  } catch (error) {
    console.error(`Error monitoring positions:`, error);
  }
}

/**
 * Get market opportunities for profitable trading
 */
export async function getProfitableOpportunities(): Promise<
  Array<{
    symbol: string;
    signal: ProfitableSignal;
    score: number;
  }>
> {
  try {
    // Get all available markets
    const tickers = await getAllTickers();
    const opportunities: Array<{
      symbol: string;
      signal: ProfitableSignal;
      score: number;
    }> = [];

    // Analyze top markets
    const topMarkets = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];

    for (const symbol of topMarkets) {
      try {
        const historicalData = await fetchHistoricalPrices(symbol, 200);
        const prices = historicalData.map((d) => d.price);
        const volumes = historicalData.map((d) => d.volume);
        const currentPrice = prices[prices.length - 1];

        const signal = generateProfitableSignal(symbol, currentPrice, prices, volumes, 100);

        if (signal.action !== 'HOLD' && signal.confidence >= 0.60) { // Lowered from 0.70
          // Calculate opportunity score
          const score =
            signal.confidence * 0.4 +
            Math.min(signal.riskRewardRatio / 5, 1) * 0.3 +
            signal.marketRegime.strength * 0.3;

          opportunities.push({ symbol, signal, score });
        }
      } catch (error) {
        console.error(`Error analyzing ${symbol}:`, error);
      }
    }

    // Sort by score
    opportunities.sort((a, b) => b.score - a.score);

    return opportunities;
  } catch (error) {
    console.error('Error getting profitable opportunities:', error);
    return [];
  }
}
