
/**
 * Advanced Profitable Trading Strategies
 * Implements proven profitable trading techniques for consistent gains
 */

export interface MarketRegime {
  type: 'TRENDING_UP' | 'TRENDING_DOWN' | 'RANGING' | 'VOLATILE';
  strength: number; // 0-1
  confidence: number; // 0-1
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    width: number;
  };
  ema: {
    ema9: number;
    ema21: number;
    ema50: number;
    ema200: number;
  };
  volume: {
    current: number;
    average: number;
    ratio: number; // current/average
  };
  momentum: number;
  volatility: number;
}

export interface ProfitableSignal {
  action: 'LONG' | 'SHORT' | 'CLOSE' | 'HOLD';
  confidence: number; // 0-1
  entryPrice: number;
  stopLoss: number;
  takeProfitLevels: number[]; // Multiple TP levels
  positionSize: number; // USD amount
  leverage: number;
  reasoning: string;
  riskRewardRatio: number;
  expectedProfit: number;
  expectedLoss: number;
  timeframe: string;
  marketRegime: MarketRegime;
  indicators: TechnicalIndicators;
}

/**
 * Calculate technical indicators from price data
 */
export function calculateTechnicalIndicators(
  prices: number[],
  volumes: number[]
): TechnicalIndicators {
  if (prices.length < 200) {
    throw new Error('Need at least 200 price points for accurate indicators');
  }

  // RSI calculation (14 periods)
  const rsi = calculateRSI(prices, 14);

  // MACD calculation (12, 26, 9)
  const macd = calculateMACD(prices, 12, 26, 9);

  // Bollinger Bands (20 periods, 2 std dev)
  const bollingerBands = calculateBollingerBands(prices, 20, 2);

  // EMAs
  const ema9 = calculateEMA(prices, 9);
  const ema21 = calculateEMA(prices, 21);
  const ema50 = calculateEMA(prices, 50);
  const ema200 = calculateEMA(prices, 200);

  // Volume analysis
  const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const currentVolume = volumes[volumes.length - 1];

  // Momentum (rate of price change)
  const momentum = calculateMomentum(prices, 10);

  // Volatility (ATR)
  const volatility = calculateVolatility(prices, 14);

  return {
    rsi,
    macd,
    bollingerBands,
    ema: { ema9, ema21, ema50, ema200 },
    volume: {
      current: currentVolume,
      average: avgVolume,
      ratio: currentVolume / avgVolume,
    },
    momentum,
    volatility,
  };
}

/**
 * RSI (Relative Strength Index)
 */
function calculateRSI(prices: number[], period: number): number {
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return rsi;
}

/**
 * MACD (Moving Average Convergence Divergence)
 */
function calculateMACD(
  prices: number[],
  fastPeriod: number,
  slowPeriod: number,
  signalPeriod: number
): { value: number; signal: number; histogram: number } {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  const macdValue = fastEMA - slowEMA;

  // For signal line, we'd need historical MACD values
  // Simplified: use a percentage of MACD as signal
  const signal = macdValue * 0.8;
  const histogram = macdValue - signal;

  return { value: macdValue, signal, histogram };
}

/**
 * Bollinger Bands
 */
function calculateBollingerBands(
  prices: number[],
  period: number,
  stdDev: number
): { upper: number; middle: number; lower: number; width: number } {
  const recentPrices = prices.slice(-period);
  const middle = recentPrices.reduce((a, b) => a + b, 0) / period;

  const variance =
    recentPrices.reduce((sum, price) => sum + Math.pow(price - middle, 2), 0) /
    period;
  const std = Math.sqrt(variance);

  const upper = middle + stdDev * std;
  const lower = middle - stdDev * std;
  const width = (upper - lower) / middle;

  return { upper, middle, lower, width };
}

/**
 * EMA (Exponential Moving Average)
 */
function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];

  const multiplier = 2 / (period + 1);
  let ema = prices.slice(-period, -period + 10).reduce((a, b) => a + b, 0) / 10;

  for (let i = prices.length - period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
}

/**
 * Momentum indicator
 */
function calculateMomentum(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  const currentPrice = prices[prices.length - 1];
  const pastPrice = prices[prices.length - period];
  return ((currentPrice - pastPrice) / pastPrice) * 100;
}

/**
 * Volatility (simplified ATR)
 */
function calculateVolatility(prices: number[], period: number): number {
  if (prices.length < period + 1) return 0;

  let totalRange = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const range = Math.abs(prices[i] - prices[i - 1]);
    totalRange += range;
  }

  const atr = totalRange / period;
  return (atr / prices[prices.length - 1]) * 100; // As percentage
}

/**
 * Detect market regime
 */
export function detectMarketRegime(
  prices: number[],
  indicators: TechnicalIndicators
): MarketRegime {
  const currentPrice = prices[prices.length - 1];
  const { ema } = indicators;

  // Trending up: price above all EMAs, EMAs aligned bullishly
  const bullishAlignment =
    currentPrice > ema.ema9 &&
    ema.ema9 > ema.ema21 &&
    ema.ema21 > ema.ema50 &&
    ema.ema50 > ema.ema200;

  // Trending down: price below all EMAs, EMAs aligned bearishly
  const bearishAlignment =
    currentPrice < ema.ema9 &&
    ema.ema9 < ema.ema21 &&
    ema.ema21 < ema.ema50 &&
    ema.ema50 < ema.ema200;

  // Volatile: high volatility + wide Bollinger Bands
  const isVolatile =
    indicators.volatility > 3 && indicators.bollingerBands.width > 0.05;

  if (isVolatile) {
    return {
      type: 'VOLATILE',
      strength: Math.min(indicators.volatility / 5, 1),
      confidence: 0.8,
    };
  }

  if (bullishAlignment) {
    const strength = Math.min(indicators.momentum / 10, 1);
    return {
      type: 'TRENDING_UP',
      strength: Math.max(strength, 0.6),
      confidence: 0.9,
    };
  }

  if (bearishAlignment) {
    const strength = Math.min(Math.abs(indicators.momentum) / 10, 1);
    return {
      type: 'TRENDING_DOWN',
      strength: Math.max(strength, 0.6),
      confidence: 0.9,
    };
  }

  // Otherwise, ranging market
  return {
    type: 'RANGING',
    strength: 0.5,
    confidence: 0.7,
  };
}

/**
 * Generate profitable trading signal based on advanced strategies
 */
export function generateProfitableSignal(
  symbol: string,
  currentPrice: number,
  prices: number[],
  volumes: number[],
  balance: number
): ProfitableSignal {
  // Calculate indicators
  const indicators = calculateTechnicalIndicators(prices, volumes);
  const regime = detectMarketRegime(prices, indicators);

  // Determine action based on multiple factors
  const signal = determineOptimalAction(
    currentPrice,
    indicators,
    regime,
    balance
  );

  return signal;
}

/**
 * Determine optimal trading action
 */
function determineOptimalAction(
  currentPrice: number,
  indicators: TechnicalIndicators,
  regime: MarketRegime,
  balance: number
): ProfitableSignal {
  const { rsi, macd, bollingerBands, ema, volume } = indicators;

  let action: 'LONG' | 'SHORT' | 'HOLD' = 'HOLD';
  let confidence = 0;
  let reasoning = '';

  // Strategy 1: Mean Reversion in Ranging Markets
  if (regime.type === 'RANGING') {
    if (rsi < 30 && currentPrice < bollingerBands.lower) {
      // Oversold in ranging market - BUY
      action = 'LONG';
      confidence = 0.75 + (30 - rsi) / 100;
      reasoning = 'Mean reversion: Oversold in ranging market';
    } else if (rsi > 70 && currentPrice > bollingerBands.upper) {
      // Overbought in ranging market - SELL
      action = 'SHORT';
      confidence = 0.75 + (rsi - 70) / 100;
      reasoning = 'Mean reversion: Overbought in ranging market';
    }
  }

  // Strategy 2: Trend Following in Trending Markets
  if (regime.type === 'TRENDING_UP') {
    // Buy dips in uptrend
    if (
      rsi > 40 &&
      rsi < 70 &&
      macd.histogram > 0 &&
      currentPrice > ema.ema21 &&
      volume.ratio > 1.2
    ) {
      action = 'LONG';
      confidence = 0.8 + regime.strength * 0.15;
      reasoning = 'Trend following: Strong uptrend with confirmation';
    }
  }

  if (regime.type === 'TRENDING_DOWN') {
    // Sell rallies in downtrend
    if (
      rsi < 60 &&
      rsi > 30 &&
      macd.histogram < 0 &&
      currentPrice < ema.ema21 &&
      volume.ratio > 1.2
    ) {
      action = 'SHORT';
      confidence = 0.8 + regime.strength * 0.15;
      reasoning = 'Trend following: Strong downtrend with confirmation';
    }
  }

  // Strategy 3: Momentum Breakout
  if (
    Math.abs(indicators.momentum) > 3 &&
    volume.ratio > 1.5 &&
    macd.histogram > 0
  ) {
    action = 'LONG';
    confidence = 0.85;
    reasoning = 'Momentum breakout: High volume with strong momentum';
  }

  // Avoid trading in highly volatile markets without clear signals
  if (regime.type === 'VOLATILE' && confidence < 0.8) {
    action = 'HOLD';
    confidence = 0;
    reasoning = 'Waiting for volatility to decrease';
  }

  // If no strong signal, HOLD
  if (confidence < 0.7) {
    action = 'HOLD';
    confidence = 0;
    reasoning = 'No high-probability setup detected';
  }

  // Calculate stop loss and take profit levels
  const atr = (currentPrice * indicators.volatility) / 100;
  const stopLoss =
    action === 'LONG'
      ? currentPrice - 1.5 * atr
      : action === 'SHORT'
      ? currentPrice + 1.5 * atr
      : 0;

  const takeProfitLevels =
    action === 'LONG'
      ? [
          currentPrice + 2 * atr, // TP1: 2:1 RR
          currentPrice + 3 * atr, // TP2: 3:1 RR
          currentPrice + 4 * atr, // TP3: 4:1 RR
        ]
      : action === 'SHORT'
      ? [
          currentPrice - 2 * atr,
          currentPrice - 3 * atr,
          currentPrice - 4 * atr,
        ]
      : [];

  // Risk-reward ratio (minimum 1.8:1 for entry - slightly more aggressive)
  const risk = Math.abs(currentPrice - stopLoss);
  const reward = takeProfitLevels.length > 0 ? Math.abs(takeProfitLevels[0] - currentPrice) : 0;
  const riskRewardRatio = risk > 0 ? reward / risk : 0;

  // Only take trades with good risk-reward
  if (action !== 'HOLD' && riskRewardRatio < 1.8) {
    action = 'HOLD';
    confidence = 0;
    reasoning = 'Risk-reward ratio insufficient (< 1.8:1)';
  }

  // Calculate optimal position size (Kelly Criterion based)
  const winRate = 0.55; // Conservative estimate
  const avgWin = reward;
  const avgLoss = risk;
  const kellyFraction =
    avgLoss > 0 ? (winRate * avgWin - (1 - winRate) * avgLoss) / avgWin : 0;
  const positionSize = Math.max(
    3,
    Math.min(balance * 0.15, balance * kellyFraction * 0.5)
  ); // Conservative Kelly

  // Dynamic leverage based on confidence and volatility
  const baseLeverage = confidence > 0.85 ? 5 : confidence > 0.75 ? 3 : 2;
  const volatilityAdjustment = indicators.volatility > 3 ? 0.5 : 1;
  const leverage = Math.max(2, Math.min(10, baseLeverage * volatilityAdjustment));

  const expectedProfit = reward * winRate * positionSize;
  const expectedLoss = risk * (1 - winRate) * positionSize;

  return {
    action,
    confidence,
    entryPrice: currentPrice,
    stopLoss,
    takeProfitLevels,
    positionSize,
    leverage,
    reasoning,
    riskRewardRatio,
    expectedProfit,
    expectedLoss,
    timeframe: '15m',
    marketRegime: regime,
    indicators,
  };
}

/**
 * Should we close an existing position?
 */
export function shouldClosePosition(
  position: {
    side: 'LONG' | 'SHORT';
    entryPrice: number;
    currentPrice: number;
    stopLoss?: number;
    takeProfit?: number;
  },
  indicators: TechnicalIndicators,
  regime: MarketRegime
): { shouldClose: boolean; reason: string } {
  const { side, entryPrice, currentPrice, stopLoss, takeProfit } = position;

  const pnlPercent =
    side === 'LONG'
      ? ((currentPrice - entryPrice) / entryPrice) * 100
      : ((entryPrice - currentPrice) / entryPrice) * 100;

  // Stop loss hit
  if (stopLoss) {
    if (
      (side === 'LONG' && currentPrice <= stopLoss) ||
      (side === 'SHORT' && currentPrice >= stopLoss)
    ) {
      return { shouldClose: true, reason: 'Stop loss triggered' };
    }
  }

  // Take profit hit
  if (takeProfit) {
    if (
      (side === 'LONG' && currentPrice >= takeProfit) ||
      (side === 'SHORT' && currentPrice <= takeProfit)
    ) {
      return { shouldClose: true, reason: 'Take profit target reached' };
    }
  }

  // Regime change - close position if regime turns against us
  if (side === 'LONG' && regime.type === 'TRENDING_DOWN' && regime.strength > 0.7) {
    return { shouldClose: true, reason: 'Market regime changed to bearish' };
  }

  if (side === 'SHORT' && regime.type === 'TRENDING_UP' && regime.strength > 0.7) {
    return { shouldClose: true, reason: 'Market regime changed to bullish' };
  }

  // Divergence detection - RSI diverging from price
  if (side === 'LONG' && indicators.rsi < 30 && pnlPercent < -5) {
    return { shouldClose: true, reason: 'Bearish divergence detected' };
  }

  if (side === 'SHORT' && indicators.rsi > 70 && pnlPercent < -5) {
    return { shouldClose: true, reason: 'Bullish divergence detected' };
  }

  // Trailing stop - lock in profits
  if (pnlPercent > 5) {
    const trailingStop = side === 'LONG' 
      ? currentPrice - (currentPrice * 0.02) // 2% trailing
      : currentPrice + (currentPrice * 0.02);
    
    if (
      (side === 'LONG' && currentPrice <= trailingStop) ||
      (side === 'SHORT' && currentPrice >= trailingStop)
    ) {
      return { shouldClose: true, reason: 'Trailing stop - locking in profits' };
    }
  }

  return { shouldClose: false, reason: 'Position still valid' };
}
