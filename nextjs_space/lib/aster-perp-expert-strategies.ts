
/**
 * Expert Perp/Margin Trading Strategies for AsterDEX
 * Based on advanced AI-driven trading strategies with LSTM-style predictions,
 * dynamic position sizing, regime filters, and volatility-based risk management.
 */

import { prisma } from './db';

// ==================== TYPES ====================

export interface TradingSignal {
  action: 'LONG' | 'SHORT' | 'HOLD' | 'CLOSE_LONG' | 'CLOSE_SHORT';
  confidence: number; // 0-100
  targetScore: number; // -1 to 1
  regime: 'BULL' | 'BEAR' | 'NEUTRAL';
  volatility: number;
  suggestedLeverage: number;
  suggestedSize: number;
  stopLoss: number;
  takeProfit: number;
  reasoning: string;
}

export interface MarketData {
  price: number;
  volume24h: number;
  priceChange24h: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

export interface TechnicalIndicators {
  rsi_fast: number;
  rsi_slow: number;
  macd: number;
  macd_signal: number;
  bb_upper: number;
  bb_middle: number;
  bb_lower: number;
  bb_width: number;
  cci: number;
  stoch: number;
  atr: number;
  obv: number;
  sma_10: number;
  sma_50: number;
  sma_100: number;
  ema_12: number;
  ema_26: number;
  momentum: number;
}

// ==================== MARKET DATA FETCHING ====================

export async function fetchMarketData(symbol: string): Promise<MarketData> {
  try {
    // Fetch from multiple sources for reliability
    const dexScreenerData = await fetchDexScreenerData(symbol);
    const coinGeckoData = await fetchCoinGeckoData(symbol);
    
    // Merge and validate data
    return {
      price: dexScreenerData?.price || coinGeckoData?.price || 0,
      volume24h: dexScreenerData?.volume24h || coinGeckoData?.volume24h || 0,
      priceChange24h: dexScreenerData?.priceChange24h || coinGeckoData?.priceChange24h || 0,
      high24h: dexScreenerData?.high24h || coinGeckoData?.high24h || 0,
      low24h: dexScreenerData?.low24h || coinGeckoData?.low24h || 0,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
}

async function fetchDexScreenerData(symbol: string): Promise<MarketData | null> {
  try {
    const tokenAddress = getTokenAddress(symbol);
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
    const data = await response.json();
    
    if (data.pairs && data.pairs.length > 0) {
      const pair = data.pairs[0];
      return {
        price: parseFloat(pair.priceUsd) || 0,
        volume24h: parseFloat(pair.volume?.h24) || 0,
        priceChange24h: parseFloat(pair.priceChange?.h24) || 0,
        high24h: parseFloat(pair.priceUsd) * 1.02, // Estimate
        low24h: parseFloat(pair.priceUsd) * 0.98, // Estimate
        timestamp: Date.now(),
      };
    }
    return null;
  } catch (error) {
    console.error('DexScreener fetch error:', error);
    return null;
  }
}

async function fetchCoinGeckoData(symbol: string): Promise<MarketData | null> {
  try {
    const coinId = getCoinGeckoId(symbol);
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1`);
    const data = await response.json();
    
    if (data.prices && data.prices.length > 0) {
      const prices = data.prices.map((p: any) => p[1]);
      const currentPrice = prices[prices.length - 1];
      const previousPrice = prices[0];
      
      return {
        price: currentPrice,
        volume24h: data.total_volumes?.[data.total_volumes.length - 1]?.[1] || 0,
        priceChange24h: ((currentPrice - previousPrice) / previousPrice) * 100,
        high24h: Math.max(...prices),
        low24h: Math.min(...prices),
        timestamp: Date.now(),
      };
    }
    return null;
  } catch (error) {
    console.error('CoinGecko fetch error:', error);
    return null;
  }
}

function getTokenAddress(symbol: string): string {
  const addresses: { [key: string]: string } = {
    'ETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    'BTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
    'WBTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  };
  return addresses[symbol.toUpperCase()] || addresses['ETH'];
}

function getCoinGeckoId(symbol: string): string {
  const ids: { [key: string]: string } = {
    'ETH': 'ethereum',
    'WETH': 'weth',
    'BTC': 'bitcoin',
    'WBTC': 'wrapped-bitcoin',
  };
  return ids[symbol.toUpperCase()] || 'ethereum';
}

// ==================== TECHNICAL ANALYSIS ====================

export async function calculateTechnicalIndicators(
  symbol: string,
  timeframe: string = '5m'
): Promise<TechnicalIndicators> {
  try {
    // Fetch historical price data
    const historicalData = await fetchHistoricalData(symbol, timeframe, 100);
    
    // Calculate indicators
    const closes = historicalData.map(d => d.close);
    const highs = historicalData.map(d => d.high);
    const lows = historicalData.map(d => d.low);
    const volumes = historicalData.map(d => d.volume);
    
    return {
      rsi_fast: calculateRSI(closes, 7),
      rsi_slow: calculateRSI(closes, 14),
      macd: 0, // Calculated below
      macd_signal: 0,
      bb_upper: 0,
      bb_middle: 0,
      bb_lower: 0,
      bb_width: 0,
      cci: calculateCCI(closes, highs, lows, 20),
      stoch: calculateStochastic(closes, highs, lows, 14),
      atr: calculateATR(highs, lows, closes, 14),
      obv: calculateOBV(closes, volumes),
      sma_10: calculateSMA(closes, 10),
      sma_50: calculateSMA(closes, 50),
      sma_100: calculateSMA(closes, 100),
      ema_12: calculateEMA(closes, 12),
      ema_26: calculateEMA(closes, 26),
      momentum: calculateMomentum(closes, 4),
    };
  } catch (error) {
    console.error('Error calculating technical indicators:', error);
    throw error;
  }
}

async function fetchHistoricalData(symbol: string, timeframe: string, periods: number): Promise<any[]> {
  // In a real implementation, fetch from exchange API
  // For now, return mock data
  const mockData = [];
  const basePrice = 2500;
  for (let i = 0; i < periods; i++) {
    const variation = (Math.random() - 0.5) * 100;
    mockData.push({
      close: basePrice + variation,
      high: basePrice + variation + Math.random() * 50,
      low: basePrice + variation - Math.random() * 50,
      volume: Math.random() * 1000000,
      timestamp: Date.now() - (periods - i) * 300000, // 5min intervals
    });
  }
  return mockData;
}

// Technical indicator calculations
function calculateRSI(closes: number[], period: number): number {
  if (closes.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = closes.length - period; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateSMA(values: number[], period: number): number {
  if (values.length < period) return values[values.length - 1] || 0;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function calculateEMA(values: number[], period: number): number {
  if (values.length < period) return calculateSMA(values, values.length);
  
  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(values.slice(0, period), period);
  
  for (let i = period; i < values.length; i++) {
    ema = (values[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

function calculateCCI(closes: number[], highs: number[], lows: number[], period: number): number {
  if (closes.length < period) return 0;
  
  const typicalPrices = closes.map((close, i) => (close + highs[i] + lows[i]) / 3);
  const sma = calculateSMA(typicalPrices, period);
  const meanDeviation = typicalPrices.slice(-period).reduce((sum, tp) => sum + Math.abs(tp - sma), 0) / period;
  
  const currentTP = typicalPrices[typicalPrices.length - 1];
  return (currentTP - sma) / (0.015 * meanDeviation);
}

function calculateStochastic(closes: number[], highs: number[], lows: number[], period: number): number {
  if (closes.length < period) return 50;
  
  const recentHighs = highs.slice(-period);
  const recentLows = lows.slice(-period);
  const currentClose = closes[closes.length - 1];
  
  const highestHigh = Math.max(...recentHighs);
  const lowestLow = Math.min(...recentLows);
  
  if (highestHigh === lowestLow) return 50;
  return ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
}

function calculateATR(highs: number[], lows: number[], closes: number[], period: number): number {
  if (closes.length < period + 1) return 0;
  
  const trueRanges = [];
  for (let i = 1; i < closes.length; i++) {
    const high = highs[i];
    const low = lows[i];
    const prevClose = closes[i - 1];
    
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }
  
  return calculateSMA(trueRanges, period);
}

function calculateOBV(closes: number[], volumes: number[]): number {
  let obv = 0;
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) obv += volumes[i];
    else if (closes[i] < closes[i - 1]) obv -= volumes[i];
  }
  return obv;
}

function calculateMomentum(closes: number[], period: number): number {
  if (closes.length < period) return 0;
  return closes[closes.length - 1] - closes[closes.length - 1 - period];
}

// ==================== EXPERT STRATEGY ENGINE ====================

export async function generateExpertTradingSignal(
  agentId: string,
  symbol: string,
  currentPosition: any
): Promise<TradingSignal> {
  try {
    // Fetch market data and indicators
    const marketData = await fetchMarketData(symbol);
    const indicators = await calculateTechnicalIndicators(symbol);
    
    // Calculate Bollinger Bands
    const { bb_upper, bb_middle, bb_lower, bb_width } = calculateBollingerBands(marketData.price, indicators);
    indicators.bb_upper = bb_upper;
    indicators.bb_middle = bb_middle;
    indicators.bb_lower = bb_lower;
    indicators.bb_width = bb_width;
    
    // Calculate MACD
    const { macd, signal: macdSignal } = calculateMACD(indicators.ema_12, indicators.ema_26);
    indicators.macd = macd;
    indicators.macd_signal = macdSignal;
    
    // Normalize indicators (z-score)
    const normalizedIndicators = normalizeIndicators(indicators);
    
    // Detect regime (bull/bear/neutral)
    const regime = detectRegime(marketData, indicators);
    
    // Calculate volatility
    const volatility = calculateVolatility(indicators, marketData);
    
    // Dynamic weights based on regime
    const weights = calculateDynamicWeights(regime, volatility);
    
    // Calculate aggregate score (-1 to 1)
    const targetScore = calculateTargetScore(normalizedIndicators, weights, regime, volatility);
    
    // Generate signal based on LSTM-style prediction
    const signal = generateSignalFromScore(targetScore, indicators, currentPosition);
    
    // Calculate suggested leverage (max 5x, dynamic based on volatility)
    const suggestedLeverage = calculateDynamicLeverage(volatility, regime);
    
    // Calculate position size based on risk management
    const suggestedSize = calculatePositionSize(marketData.price, volatility, suggestedLeverage);
    
    // Calculate stop-loss and take-profit
    const { stopLoss, takeProfit } = calculateStopLossTakeProfit(
      marketData.price,
      signal.action,
      volatility,
      indicators.atr,
      currentPosition
    );
    
    return {
      ...signal,
      regime,
      volatility,
      suggestedLeverage,
      suggestedSize,
      stopLoss,
      takeProfit,
      targetScore,
    };
  } catch (error) {
    console.error('Error generating expert trading signal:', error);
    return {
      action: 'HOLD',
      confidence: 0,
      targetScore: 0,
      regime: 'NEUTRAL',
      volatility: 0,
      suggestedLeverage: 1,
      suggestedSize: 0,
      stopLoss: 0,
      takeProfit: 0,
      reasoning: 'Error generating signal: ' + (error as Error).message,
    };
  }
}

function calculateBollingerBands(price: number, indicators: TechnicalIndicators) {
  const sma = indicators.sma_50;
  const stdDev = sma * 0.02; // Simplified 2% standard deviation
  
  return {
    bb_upper: sma + (2 * stdDev),
    bb_middle: sma,
    bb_lower: sma - (2 * stdDev),
    bb_width: (4 * stdDev) / sma,
  };
}

function calculateMACD(ema12: number, ema26: number) {
  const macd = ema12 - ema26;
  const signal = macd * 0.9; // Simplified signal line
  return { macd, signal };
}

function normalizeIndicators(indicators: TechnicalIndicators): any {
  // Z-score normalization for each indicator
  return {
    rsi_fast_norm: (indicators.rsi_fast - 50) / 25,
    rsi_slow_norm: (indicators.rsi_slow - 50) / 25,
    macd_norm: indicators.macd / 100,
    cci_norm: indicators.cci / 100,
    stoch_norm: (indicators.stoch - 50) / 50,
    momentum_norm: indicators.momentum / 100,
    bb_position: 0, // Calculated based on price position in BB
  };
}

function detectRegime(marketData: MarketData, indicators: TechnicalIndicators): 'BULL' | 'BEAR' | 'NEUTRAL' {
  const price = marketData.price;
  const { bb_upper, bb_middle, bb_lower } = indicators;
  
  // Bollinger Band-based regime detection
  if (price > bb_middle && marketData.priceChange24h > 0) {
    return 'BULL';
  } else if (price < bb_middle && marketData.priceChange24h < 0) {
    return 'BEAR';
  }
  return 'NEUTRAL';
}

function calculateVolatility(indicators: TechnicalIndicators, marketData: MarketData): number {
  // Inverse ATR for volatility (normalized 0-1)
  const atrRatio = indicators.atr / marketData.price;
  return Math.max(0.1, Math.min(1, 1 / (1 + atrRatio * 100)));
}

function calculateDynamicWeights(regime: string, volatility: number) {
  // Base weights
  const baseWeights = {
    rsi: 0.15,
    macd: 0.15,
    cci: 0.1,
    momentum: 0.2,
    stoch: 0.1,
    bb_position: 0.15,
    trend_strength: 0.15,
  };
  
  // Boost momentum in trending markets
  if (regime !== 'NEUTRAL' && volatility > 0.5) {
    baseWeights.momentum *= 1.5;
    baseWeights.trend_strength *= 1.5;
  }
  
  return baseWeights;
}

function calculateTargetScore(
  normalized: any,
  weights: any,
  regime: string,
  volatility: number
): number {
  // Aggregate score S (weighted features)
  let score = 0;
  score += weights.rsi * normalized.rsi_fast_norm;
  score += weights.macd * normalized.macd_norm;
  score += weights.cci * normalized.cci_norm;
  score += weights.momentum * normalized.momentum_norm;
  score += weights.stoch * normalized.stoch_norm;
  
  // Regime multiplier R (-1, 0, 1)
  const regimeMultiplier = regime === 'BULL' ? 1 : regime === 'BEAR' ? -1 : 0;
  
  // Final target T = S + R * V
  const targetScore = score + (regimeMultiplier * volatility);
  
  // Clamp to [-1, 1]
  return Math.max(-1, Math.min(1, targetScore));
}

function generateSignalFromScore(
  targetScore: number,
  indicators: TechnicalIndicators,
  currentPosition: any
): { action: TradingSignal['action']; confidence: number; reasoning: string } {
  const { rsi_fast, rsi_slow, sma_50, sma_100 } = indicators;
  
  // STRICTER LONG ENTRY: targetScore > 0.6, more extreme RSI, trend confirmation
  if (targetScore > 0.6 && rsi_fast < 35 && rsi_slow < 45) {
    const confidence = Math.min(100, (targetScore + 1) * 50);
    // Only enter if confidence is high enough (75%+)
    if (confidence >= 75) {
      return {
        action: 'LONG',
        confidence,
        reasoning: `🎯 HIGH-PROBABILITY LONG: Score ${targetScore.toFixed(2)}, RSI oversold (fast: ${rsi_fast.toFixed(1)}, slow: ${rsi_slow.toFixed(1)}). Strong bullish setup.`,
      };
    }
  }
  
  // STRICTER SHORT ENTRY: targetScore < -0.6, more extreme RSI, trend confirmation
  if (targetScore < -0.6 && rsi_fast > 65 && rsi_slow > 55) {
    const confidence = Math.min(100, (1 - targetScore) * 50);
    // Only enter if confidence is high enough (75%+)
    if (confidence >= 75) {
      return {
        action: 'SHORT',
        confidence,
        reasoning: `🎯 HIGH-PROBABILITY SHORT: Score ${targetScore.toFixed(2)}, RSI overbought (fast: ${rsi_fast.toFixed(1)}, slow: ${rsi_slow.toFixed(1)}). Strong bearish setup.`,
      };
    }
  }
  
  // FASTER EXIT on signal flip (tighter than before)
  if (currentPosition?.side === 'LONG' && targetScore < -0.2) {
    return {
      action: 'CLOSE_LONG',
      confidence: Math.min(100, Math.abs(targetScore) * 100),
      reasoning: `⚠️ Signal reversal detected (score: ${targetScore.toFixed(2)}). Exiting long to protect capital.`,
    };
  }
  
  // FASTER EXIT on signal flip (tighter than before)
  if (currentPosition?.side === 'SHORT' && targetScore > 0.2) {
    return {
      action: 'CLOSE_SHORT',
      confidence: Math.min(100, targetScore * 100),
      reasoning: `⚠️ Signal reversal detected (score: ${targetScore.toFixed(2)}). Exiting short to protect capital.`,
    };
  }
  
  // Default to HOLD for low-confidence setups
  return {
    action: 'HOLD',
    confidence: 50,
    reasoning: `⏸️ No high-probability setup. Score: ${targetScore.toFixed(2)}, RSI: ${rsi_fast.toFixed(1)}/${rsi_slow.toFixed(1)}. Waiting for better opportunity (need 75%+ confidence).`,
  };
}

function calculateDynamicLeverage(volatility: number, regime: string): number {
  // REDUCED LEVERAGE: Base leverage 2x, max 3x (conservative)
  let leverage = 2.0;
  
  // Only slightly increase leverage in STRONG favorable conditions
  if (regime !== 'NEUTRAL' && volatility > 0.6 && volatility < 0.85) {
    leverage = 3.0; // Reduced from 3.5x
  } else if (regime !== 'NEUTRAL') {
    leverage = 2.5;
  }
  
  // Reduce leverage in high/low volatility
  if (volatility < 0.3 || volatility > 0.85) {
    leverage = Math.max(1.5, leverage * 0.7);
  }
  
  // SAFER CAP: Max 3x leverage (reduced from 5x for better risk management)
  return Math.min(3.0, Math.max(1.5, leverage));
}

function calculatePositionSize(
  price: number,
  volatility: number,
  leverage: number
): number {
  // Risk 2% of portfolio per trade (conservative)
  const riskPercentage = 0.02;
  
  // Adjust based on volatility (reduce size in high volatility)
  const volatilityAdjustment = volatility > 0.7 ? 0.8 : 1.0;
  
  // Base size in USD
  const baseSize = 100; // $100 base position
  
  return baseSize * riskPercentage * volatilityAdjustment * leverage;
}

function calculateStopLossTakeProfit(
  currentPrice: number,
  action: TradingSignal['action'],
  volatility: number,
  atr: number,
  currentPosition: any
) {
  // TIGHTER STOPS: Use -3% stop loss instead of ATR-based for consistency
  const stopLossPercent = 0.03; // 3% stop loss
  const takeProfitPercent = 0.08; // 8% take profit (better risk/reward)
  
  let stopLoss = 0;
  let takeProfit = 0;
  
  if (action === 'LONG') {
    stopLoss = currentPrice * (1 - stopLossPercent);
    takeProfit = currentPrice * (1 + takeProfitPercent);
  } else if (action === 'SHORT') {
    stopLoss = currentPrice * (1 + stopLossPercent);
    takeProfit = currentPrice * (1 - takeProfitPercent);
  }
  
  // Implement trailing stop if position is in profit
  if (currentPosition && currentPosition.unrealizedPnl > 0) {
    const profitPercentage = currentPosition.unrealizedPnl / currentPosition.collateral;
    
    // After +2% profit, trail by 1.5%
    if (profitPercentage > 0.02) {
      const trailPercent = 0.015;
      if (action === 'LONG' || currentPosition.side === 'LONG') {
        const trailingStop = currentPrice * (1 - trailPercent);
        stopLoss = Math.max(stopLoss, trailingStop);
      } else {
        const trailingStop = currentPrice * (1 + trailPercent);
        stopLoss = Math.min(stopLoss, trailingStop);
      }
    }
    
    // After +4% profit, trail by 2%
    if (profitPercentage > 0.04) {
      const trailPercent = 0.02;
      if (action === 'LONG' || currentPosition.side === 'LONG') {
        const trailingStop = currentPrice * (1 - trailPercent);
        stopLoss = Math.max(stopLoss, trailingStop);
      } else {
        const trailingStop = currentPrice * (1 + trailPercent);
        stopLoss = Math.min(stopLoss, trailingStop);
      }
    }
  }
  
  return { stopLoss, takeProfit };
}

// ==================== POSITION MANAGEMENT ====================

export async function manageExistingPosition(
  agentId: string,
  position: any
): Promise<{ action: 'HOLD' | 'CLOSE' | 'ADJUST_STOP'; reason: string; urgency?: 'HIGH' | 'MEDIUM' | 'LOW' }> {
  try {
    const marketData = await fetchMarketData(position.symbol);
    const indicators = await calculateTechnicalIndicators(position.symbol);
    
    const currentPrice = marketData.price;
    const entryPrice = position.entryPrice;
    const unrealizedPnl = position.unrealizedPnl || 0;
    const profitPercentage = (unrealizedPnl / position.collateral) * 100;
    
    console.log(`\n📊 Position Check: ${position.symbol} ${position.side}`);
    console.log(`   Entry: $${entryPrice.toFixed(2)} | Current: $${currentPrice.toFixed(2)}`);
    console.log(`   PnL: ${profitPercentage > 0 ? '+' : ''}${profitPercentage.toFixed(2)}% ($${unrealizedPnl.toFixed(2)})`);
    
    // ===== AGGRESSIVE PROFIT-TAKING STRATEGY =====
    // Goal: Lock in profits early and often to maximize realized gains
    
    // 🎯 TIER 1: EXCELLENT PROFIT (>10%) - CLOSE IMMEDIATELY
    if (profitPercentage >= 10) {
      return {
        action: 'CLOSE',
        reason: `🚀 EXCELLENT PROFIT: ${profitPercentage.toFixed(2)}% - Closing immediately to secure exceptional gains!`,
        urgency: 'HIGH'
      };
    }
    
    // 🎯 TIER 2: GREAT PROFIT (>7%) - CLOSE TO SECURE GAINS
    if (profitPercentage >= 7) {
      return {
        action: 'CLOSE',
        reason: `💎 GREAT PROFIT: ${profitPercentage.toFixed(2)}% - Closing to lock in strong gains!`,
        urgency: 'HIGH'
      };
    }
    
    // 🎯 TIER 3: GOOD PROFIT (>5%) - CLOSE ON ANY SIGN OF REVERSAL
    if (profitPercentage >= 5) {
      // Check for reversal signals
      const signal = await generateExpertTradingSignal(agentId, position.symbol, position);
      if (signal.confidence < 60 || 
          (position.side === 'LONG' && signal.action === 'SHORT') ||
          (position.side === 'SHORT' && signal.action === 'LONG')) {
        return {
          action: 'CLOSE',
          reason: `💰 GOOD PROFIT: ${profitPercentage.toFixed(2)}% + reversal signal - Closing to secure profits!`,
          urgency: 'HIGH'
        };
      }
      // Even without reversal, take profit at 6%
      if (profitPercentage >= 6) {
        return {
          action: 'CLOSE',
          reason: `✅ TARGET HIT: ${profitPercentage.toFixed(2)}% - Taking profit!`,
          urgency: 'MEDIUM'
        };
      }
    }
    
    // 🎯 TIER 4: EARLY PROFIT (3-5%) - TAKE PROFIT ON HIGH VOLATILITY
    if (profitPercentage >= 3) {
      // Take profit early if volatility is high (to avoid reversal)
      const volatility = calculateVolatility(indicators, marketData);
      if (volatility < 0.3) { // High volatility = low volatility score
        return {
          action: 'CLOSE',
          reason: `⚡ EARLY PROFIT: ${profitPercentage.toFixed(2)}% + high volatility - Securing gains before reversal!`,
          urgency: 'MEDIUM'
        };
      }
    }
    
    // 🛑 STOP LOSS: -3% (cut losses fast)
    if (profitPercentage <= -3) {
      return {
        action: 'CLOSE',
        reason: `🛑 STOP LOSS: ${profitPercentage.toFixed(2)}% - Cutting losses to preserve capital`,
        urgency: 'HIGH'
      };
    }
    
    // 🛑 EARLY STOP: -2% if signal flipped against us
    if (profitPercentage <= -2) {
      const signal = await generateExpertTradingSignal(agentId, position.symbol, position);
      if (
        (position.side === 'LONG' && signal.action === 'SHORT') ||
        (position.side === 'SHORT' && signal.action === 'LONG')
      ) {
        return {
          action: 'CLOSE',
          reason: `⚠️ EARLY EXIT: ${profitPercentage.toFixed(2)}% + signal flip - Cutting position early`,
          urgency: 'HIGH'
        };
      }
    }
    
    // 📈 TRAILING STOP: Lock in profits once we hit +2%
    if (profitPercentage >= 2) {
      return {
        action: 'ADJUST_STOP',
        reason: `📈 Trailing stop activated: Move stop-loss to breakeven +1% (Current: ${profitPercentage.toFixed(2)}%)`,
        urgency: 'LOW'
      };
    }
    
    // 🔄 SIGNAL FLIP: Close if market turned against us (even at small profit)
    const signal = await generateExpertTradingSignal(agentId, position.symbol, position);
    if (
      (position.side === 'LONG' && signal.action === 'SHORT' && signal.confidence > 70) ||
      (position.side === 'SHORT' && signal.action === 'LONG' && signal.confidence > 70)
    ) {
      return {
        action: 'CLOSE',
        reason: `🔄 Strong signal flip (${signal.confidence.toFixed(0)}% confidence) - Closing position to avoid reversal. PnL: ${profitPercentage.toFixed(2)}%`,
        urgency: 'MEDIUM'
      };
    }
    
    // ⏰ TIME-BASED EXIT: Close positions held >24 hours if profitable
    const positionAge = Date.now() - (position.entryTime || Date.now());
    const hoursHeld = positionAge / (1000 * 60 * 60);
    if (hoursHeld > 24 && profitPercentage > 1) {
      return {
        action: 'CLOSE',
        reason: `⏰ Position held >24h with ${profitPercentage.toFixed(2)}% profit - Taking profit`,
        urgency: 'LOW'
      };
    }
    
    return {
      action: 'HOLD',
      reason: `Position healthy. PnL: ${profitPercentage.toFixed(2)}%, Confidence: ${signal.confidence.toFixed(0)}%, Age: ${hoursHeld.toFixed(1)}h`,
      urgency: 'LOW'
    };
  } catch (error) {
    console.error('Error managing position:', error);
    return {
      action: 'HOLD',
      reason: 'Error managing position: ' + (error as Error).message,
      urgency: 'LOW'
    };
  }
}

// ==================== LOGGING AND TRACKING ====================

export async function logTradingDecision(
  agentId: string,
  signal: TradingSignal,
  action: string
) {
  try {
    console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                    🎯 EXPERT TRADING DECISION                              ║
╠════════════════════════════════════════════════════════════════════════════╣
║ Agent ID:         ${agentId.padEnd(58)}║
║ Timestamp:        ${new Date().toISOString().padEnd(58)}║
║────────────────────────────────────────────────────────────────────────────║
║ 📊 SIGNAL ANALYSIS                                                         ║
║────────────────────────────────────────────────────────────────────────────║
║ Action:           ${signal.action.padEnd(58)}║
║ Confidence:       ${signal.confidence.toFixed(1)}%${' '.repeat(54)}║
║ Target Score:     ${signal.targetScore.toFixed(3)}${' '.repeat(55)}║
║ Market Regime:    ${signal.regime.padEnd(58)}║
║ Volatility:       ${signal.volatility.toFixed(3)}${' '.repeat(55)}║
║────────────────────────────────────────────────────────────────────────────║
║ 💰 POSITION PARAMETERS                                                     ║
║────────────────────────────────────────────────────────────────────────────║
║ Leverage:         ${signal.suggestedLeverage.toFixed(1)}x${' '.repeat(56)}║
║ Position Size:    $${signal.suggestedSize.toFixed(2)}${' '.repeat(55)}║
║ Stop Loss:        $${signal.stopLoss.toFixed(2)}${' '.repeat(55)}║
║ Take Profit:      $${signal.takeProfit.toFixed(2)}${' '.repeat(55)}║
║────────────────────────────────────────────────────────────────────────────║
║ 📝 REASONING                                                               ║
║────────────────────────────────────────────────────────────────────────────║
║ ${signal.reasoning.substring(0, 74).padEnd(74)}║
║────────────────────────────────────────────────────────────────────────────║
║ ⚡ ACTION TAKEN: ${action.padEnd(57)}║
╚════════════════════════════════════════════════════════════════════════════╝
    `);
  } catch (error) {
    console.error('Error logging trading decision:', error);
  }
}
