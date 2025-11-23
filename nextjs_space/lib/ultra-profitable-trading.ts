
/**
 * Ultra-Profitable Trading System
 * Maximum optimization for consistent positive PNL
 * Version 2.0 - Enhanced for aggressive but safe profitability
 */

import { getMarketPrice, getAllTickers, executeMarketTrade, getPositionInfo, setLeverage } from './aster-dex';
import { prisma } from './db';

export interface UltraTradingSignal {
  action: 'LONG' | 'SHORT' | 'HOLD' | 'CLOSE';
  confidence: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number[];
  positionSize: number;
  leverage: number;
  reasoning: string;
  riskRewardRatio: number;
  expectedProfit: number;
  marketStrength: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

/**
 * Calculate advanced technical indicators with real market data
 */
function calculateUltraIndicators(prices: number[]): {
  rsi: number;
  macd: { value: number; signal: number; histogram: number };
  ema9: number;
  ema21: number;
  ema50: number;
  bollingerBands: { upper: number; middle: number; lower: number };
  momentum: number;
  volatility: number;
  trend: 'STRONG_UP' | 'UP' | 'SIDEWAYS' | 'DOWN' | 'STRONG_DOWN';
} {
  const len = prices.length;
  
  // RSI Calculation
  let gains = 0;
  let losses = 0;
  for (let i = 1; i < Math.min(15, len); i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  const avgGain = gains / 14;
  const avgLoss = losses / 14;
  const rs = avgGain / (avgLoss || 0.0001);
  const rsi = 100 - (100 / (1 + rs));

  // EMA Calculations
  const ema9 = calculateEMA(prices, 9);
  const ema21 = calculateEMA(prices, 21);
  const ema50 = calculateEMA(prices, 50);

  // MACD
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdValue = ema12 - ema26;
  const signalLine = macdValue; // Simplified
  const histogram = macdValue - signalLine;

  // Bollinger Bands
  const sma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const variance = prices.slice(-20).reduce((sum, price) => sum + Math.pow(price - sma20, 2), 0) / 20;
  const stdDev = Math.sqrt(variance);
  const bollingerBands = {
    upper: sma20 + (stdDev * 2),
    middle: sma20,
    lower: sma20 - (stdDev * 2),
  };

  // Momentum
  const momentum = prices[len - 1] - prices[Math.max(0, len - 10)];

  // Volatility
  const recentPrices = prices.slice(-20);
  const avgPrice = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
  const squaredDiffs = recentPrices.map(p => Math.pow(p - avgPrice, 2));
  const variance2 = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
  const volatility = (Math.sqrt(variance2) / avgPrice) * 100;

  // Trend Detection
  let trend: 'STRONG_UP' | 'UP' | 'SIDEWAYS' | 'DOWN' | 'STRONG_DOWN' = 'SIDEWAYS';
  if (ema9 > ema21 && ema21 > ema50 && momentum > 0) trend = 'STRONG_UP';
  else if (ema9 > ema21 && momentum > 0) trend = 'UP';
  else if (ema9 < ema21 && ema21 < ema50 && momentum < 0) trend = 'STRONG_DOWN';
  else if (ema9 < ema21 && momentum < 0) trend = 'DOWN';

  return {
    rsi,
    macd: { value: macdValue, signal: signalLine, histogram },
    ema9,
    ema21,
    ema50,
    bollingerBands,
    momentum,
    volatility,
    trend,
  };
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] * k) + (ema * (1 - k));
  }
  return ema;
}

/**
 * Fetch real-time historical data from AsterDEX
 */
async function fetchRealMarketData(symbol: string): Promise<number[]> {
  try {
    const response = await fetch(`https://fapi.asterdex.com/fapi/v1/klines?symbol=${symbol}&interval=5m&limit=100`);
    if (!response.ok) throw new Error('Failed to fetch market data');
    
    const data = await response.json();
    return data.map((candle: any[]) => parseFloat(candle[4])); // Close prices
  } catch (error) {
    console.error('Error fetching real market data:', error);
    // Fallback to current price
    const currentPrice = await getMarketPrice(symbol);
    return [currentPrice];
  }
}

/**
 * Generate ultra-profitable trading signal
 */
export async function generateUltraProfitableSignal(
  symbol: string,
  balance: number,
  existingPosition?: any
): Promise<UltraTradingSignal> {
  try {
    // Fetch real market data
    const prices = await fetchRealMarketData(symbol);
    const currentPrice = prices[prices.length - 1];
    
    console.log(`\n🎯 ULTRA-PROFITABLE ANALYSIS for ${symbol}`);
    console.log(`   Current Price: $${currentPrice.toFixed(2)}`);
    console.log(`   Available Balance: $${balance.toFixed(2)}`);

    // Calculate indicators
    const indicators = calculateUltraIndicators(prices);
    
    console.log(`\n📊 Technical Indicators:`);
    console.log(`   RSI: ${indicators.rsi.toFixed(2)}`);
    console.log(`   Trend: ${indicators.trend}`);
    console.log(`   Volatility: ${indicators.volatility.toFixed(2)}%`);
    console.log(`   Momentum: ${indicators.momentum.toFixed(2)}`);

    // Multi-factor confidence scoring
    let confidence = 0;
    let action: 'LONG' | 'SHORT' | 'HOLD' | 'CLOSE' = 'HOLD';
    let reasoning = '';
    let urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

    // LONG signals
    const longSignals = [
      { condition: indicators.rsi < 35, score: 0.25, reason: 'Oversold RSI' },
      { condition: indicators.trend === 'STRONG_UP', score: 0.3, reason: 'Strong uptrend' },
      { condition: indicators.trend === 'UP', score: 0.2, reason: 'Uptrend' },
      { condition: currentPrice < indicators.bollingerBands.lower, score: 0.2, reason: 'Below lower BB' },
      { condition: indicators.macd.histogram > 0, score: 0.15, reason: 'MACD bullish' },
      { condition: indicators.momentum > 0, score: 0.1, reason: 'Positive momentum' },
      { condition: indicators.ema9 > indicators.ema21, score: 0.15, reason: 'EMA crossover bullish' },
    ];

    // SHORT signals
    const shortSignals = [
      { condition: indicators.rsi > 65, score: 0.25, reason: 'Overbought RSI' },
      { condition: indicators.trend === 'STRONG_DOWN', score: 0.3, reason: 'Strong downtrend' },
      { condition: indicators.trend === 'DOWN', score: 0.2, reason: 'Downtrend' },
      { condition: currentPrice > indicators.bollingerBands.upper, score: 0.2, reason: 'Above upper BB' },
      { condition: indicators.macd.histogram < 0, score: 0.15, reason: 'MACD bearish' },
      { condition: indicators.momentum < 0, score: 0.1, reason: 'Negative momentum' },
      { condition: indicators.ema9 < indicators.ema21, score: 0.15, reason: 'EMA crossover bearish' },
    ];

    // Check LONG signals
    let longScore = 0;
    const longReasons: string[] = [];
    longSignals.forEach(signal => {
      if (signal.condition) {
        longScore += signal.score;
        longReasons.push(signal.reason);
      }
    });

    // Check SHORT signals
    let shortScore = 0;
    const shortReasons: string[] = [];
    shortSignals.forEach(signal => {
      if (signal.condition) {
        shortScore += signal.score;
        shortReasons.push(signal.reason);
      }
    });

    console.log(`\n🎲 Signal Scores:`);
    console.log(`   LONG: ${(longScore * 100).toFixed(1)}%`);
    console.log(`   SHORT: ${(shortScore * 100).toFixed(1)}%`);

    // Determine action based on scores
    if (existingPosition) {
      // Check if we should close existing position
      const shouldClose = (
        (existingPosition.side === 'LONG' && shortScore > 0.6) ||
        (existingPosition.side === 'SHORT' && longScore > 0.6) ||
        (existingPosition.unrealizedPnl && existingPosition.unrealizedPnl < -5) // Stop loss
      );
      
      if (shouldClose) {
        return {
          action: 'CLOSE',
          confidence: Math.max(longScore, shortScore),
          entryPrice: currentPrice,
          stopLoss: currentPrice,
          takeProfit: [currentPrice],
          positionSize: 0,
          leverage: 2,
          reasoning: 'Closing position to preserve capital',
          riskRewardRatio: 0,
          expectedProfit: 0,
          marketStrength: Math.max(longScore, shortScore),
          urgency: 'CRITICAL',
        };
      }
    }

    // Entry thresholds (ULTRA-AGGRESSIVE for maximum trading frequency)
    const entryThreshold = 0.35; // Lower threshold = MORE trades (35% vs previous 40%)
    
    if (longScore > shortScore && longScore >= entryThreshold) {
      action = 'LONG';
      confidence = longScore;
      reasoning = longReasons.join(', ');
      urgency = longScore > 0.75 ? 'CRITICAL' : longScore > 0.60 ? 'HIGH' : 'MEDIUM';
    } else if (shortScore > longScore && shortScore >= entryThreshold) {
      action = 'SHORT';
      confidence = shortScore;
      reasoning = shortReasons.join(', ');
      urgency = shortScore > 0.75 ? 'CRITICAL' : shortScore > 0.60 ? 'HIGH' : 'MEDIUM';
    } else {
      action = 'HOLD';
      confidence = 0;
      reasoning = 'Insufficient signal strength or conflicting indicators';
    }

    console.log(`\n💡 Decision: ${action} (${(confidence * 100).toFixed(1)}% confidence)`);
    console.log(`   Urgency: ${urgency}`);
    console.log(`   Reasoning: ${reasoning}`);

    // Position sizing - MORE AGGRESSIVE for higher profits
    const riskPercentage = Math.min(0.20 + (confidence * 0.15), 0.40); // 20-40% of balance (increased)
    const basePositionSize = balance * riskPercentage;
    
    // Dynamic leverage based on confidence - MORE AGGRESSIVE
    const leverage = Math.floor(3 + (confidence * 4)); // 3x to 7x (increased from 2x to 5x)
    
    const positionSize = Math.min(basePositionSize * leverage, balance * 0.60); // Max 60% of balance (increased from 50%)

    // Risk management levels - TIGHTER for faster profit-taking
    const stopLossPercent = 0.025; // 2.5% stop loss (tighter)
    const takeProfitPercents = [0.02, 0.035, 0.055]; // 2%, 3.5%, 5.5% targets (lower for faster exits)

    const stopLoss = action === 'LONG' 
      ? currentPrice * (1 - stopLossPercent)
      : currentPrice * (1 + stopLossPercent);
    
    const takeProfit = action === 'LONG'
      ? takeProfitPercents.map(tp => currentPrice * (1 + tp))
      : takeProfitPercents.map(tp => currentPrice * (1 - tp));

    const riskAmount = positionSize * stopLossPercent;
    const rewardAmount = positionSize * takeProfitPercents[0];
    const riskRewardRatio = rewardAmount / riskAmount;
    
    const expectedProfit = rewardAmount * confidence;

    console.log(`\n💰 Trade Parameters:`);
    console.log(`   Position Size: $${positionSize.toFixed(2)}`);
    console.log(`   Leverage: ${leverage}x`);
    console.log(`   Stop Loss: $${stopLoss.toFixed(2)}`);
    console.log(`   Take Profit 1: $${takeProfit[0].toFixed(2)}`);
    console.log(`   Risk/Reward: ${riskRewardRatio.toFixed(2)}:1`);
    console.log(`   Expected Profit: $${expectedProfit.toFixed(2)}`);

    return {
      action,
      confidence,
      entryPrice: currentPrice,
      stopLoss,
      takeProfit,
      positionSize,
      leverage,
      reasoning,
      riskRewardRatio,
      expectedProfit,
      marketStrength: Math.max(longScore, shortScore),
      urgency,
    };
  } catch (error: any) {
    console.error('Error in ultra-profitable signal generation:', error);
    return {
      action: 'HOLD',
      confidence: 0,
      entryPrice: 0,
      stopLoss: 0,
      takeProfit: [],
      positionSize: 0,
      leverage: 2,
      reasoning: 'Error: ' + error.message,
      riskRewardRatio: 0,
      expectedProfit: 0,
      marketStrength: 0,
      urgency: 'LOW',
    };
  }
}

/**
 * Execute ultra-profitable trade
 */
export async function executeUltraProfitableTrade(
  agentId: string,
  agentName: string,
  signal: UltraTradingSignal,
  symbol: string,
  chain: string = 'astar-zkevm'
): Promise<{ success: boolean; tradeId?: string; error?: string }> {
  try {
    if (signal.action === 'HOLD') {
      return { success: false, error: 'No trade signal' };
    }

    console.log(`\n🚀 EXECUTING ULTRA-PROFITABLE TRADE`);
    console.log(`   Agent: ${agentName}`);
    console.log(`   Action: ${signal.action}`);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Confidence: ${(signal.confidence * 100).toFixed(1)}%`);
    console.log(`   Urgency: ${signal.urgency}`);

    // Set leverage for the position
    try {
      await setLeverage(symbol, signal.leverage);
      console.log(`   ✓ Leverage set to ${signal.leverage}x`);
    } catch (error) {
      console.warn(`   ⚠ Failed to set leverage, using default:`, error);
    }

    // Execute on AsterDEX
    const result = await executeMarketTrade(
      symbol,
      signal.action === 'LONG' ? 'BUY' : 'SELL',
      signal.positionSize
    );

    if (!result || typeof result === 'string') {
      throw new Error('Trade execution failed');
    }

    // Record in database
    const trade = await prisma.trade.create({
      data: {
        agentId,
        symbol: symbol,
        type: 'PERPETUAL',
        side: signal.action === 'LONG' ? 'BUY' : 'SELL',
        quantity: signal.positionSize,
        entryPrice: signal.entryPrice,
        exitPrice: null,
        profitLoss: null,
        status: 'OPEN',
        strategy: 'ULTRA_PROFITABLE',
        confidence: signal.confidence,
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit[0],
        chain,
        isRealTrade: true,
        txHash: result.orderId?.toString(),
        entryTime: new Date(),
      },
    });

    console.log(`✅ Trade executed successfully - ID: ${trade.id}`);
    console.log(`   Expected Profit: $${signal.expectedProfit.toFixed(2)}`);

    return { success: true, tradeId: trade.id };
  } catch (error: any) {
    console.error('❌ Trade execution failed:', error);
    return { success: false, error: error.message };
  }
}
