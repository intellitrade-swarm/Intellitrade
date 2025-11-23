
/**
 * Enhanced Defidash Intellitrade Oracle Service
 * Multi-source data aggregation with signing and validation
 */

import crypto from 'crypto';

export interface PriceSource {
  name: string;
  price: number;
  timestamp: Date;
  success: boolean;
  error?: string;
  latency?: number;
}

export interface AggregatedPrice {
  symbol: string;
  price: number;
  median: number;
  mean: number;
  variance: number;
  sources: PriceSource[];
  timestamp: Date;
  signature: string;
  confidence: number;
}

export interface HistoricalDataPoint {
  symbol: string;
  price: number;
  timestamp: Date;
  sources: number;
  variance: number;
}

export interface OracleStatus {
  isHealthy: boolean;
  totalSources: number;
  activeSources: number;
  lastUpdate: Date;
  uptime: number;
  alerts: string[];
}

// In-memory cache for prices (in production, use Redis)
const priceCache = new Map<string, AggregatedPrice>();
const historicalCache = new Map<string, HistoricalDataPoint[]>();

/**
 * Fetch price from CoinGecko
 */
async function fetchFromCoinGecko(symbol: string): Promise<PriceSource> {
  const startTime = Date.now();
  const coinMap: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'BNB': 'binancecoin',
    'SOL': 'solana',
    'XRP': 'ripple',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
    'MATIC': 'polygon',
    'DOT': 'polkadot',
    'AVAX': 'avalanche-2',
  };

  const coinId = coinMap[symbol] || symbol.toLowerCase();

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const price = data[coinId]?.usd;

    if (!price) {
      throw new Error('Price not found');
    }

    return {
      name: 'CoinGecko',
      price,
      timestamp: new Date(),
      success: true,
      latency: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      name: 'CoinGecko',
      price: 0,
      timestamp: new Date(),
      success: false,
      error: error.message,
      latency: Date.now() - startTime,
    };
  }
}

/**
 * Fetch price from DexScreener
 */
async function fetchFromDexScreener(symbol: string): Promise<PriceSource> {
  const startTime = Date.now();

  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${symbol}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const pair = data.pairs?.[0];

    if (!pair || !pair.priceUsd) {
      throw new Error('Price not found');
    }

    return {
      name: 'DexScreener',
      price: parseFloat(pair.priceUsd),
      timestamp: new Date(),
      success: true,
      latency: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      name: 'DexScreener',
      price: 0,
      timestamp: new Date(),
      success: false,
      error: error.message,
      latency: Date.now() - startTime,
    };
  }
}

/**
 * Fetch price from Binance
 */
async function fetchFromBinance(symbol: string): Promise<PriceSource> {
  const startTime = Date.now();

  try {
    const ticker = `${symbol}USDT`;
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${ticker}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const price = parseFloat(data.price);

    if (!price) {
      throw new Error('Price not found');
    }

    return {
      name: 'Binance',
      price,
      timestamp: new Date(),
      success: true,
      latency: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      name: 'Binance',
      price: 0,
      timestamp: new Date(),
      success: false,
      error: error.message,
      latency: Date.now() - startTime,
    };
  }
}

/**
 * Fetch price from Kraken
 */
async function fetchFromKraken(symbol: string): Promise<PriceSource> {
  const startTime = Date.now();

  try {
    const pair = `${symbol}USD`;
    const response = await fetch(
      `https://api.kraken.com/0/public/Ticker?pair=${pair}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const pairData = data.result?.[Object.keys(data.result)[0]];
    const price = parseFloat(pairData?.c?.[0]);

    if (!price) {
      throw new Error('Price not found');
    }

    return {
      name: 'Kraken',
      price,
      timestamp: new Date(),
      success: true,
      latency: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      name: 'Kraken',
      price: 0,
      timestamp: new Date(),
      success: false,
      error: error.message,
      latency: Date.now() - startTime,
    };
  }
}

/**
 * Calculate median of an array
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  
  return sorted[mid];
}

/**
 * Calculate variance
 */
function calculateVariance(values: number[], mean: number): number {
  if (values.length === 0) return 0;
  
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Sign data with HMAC-SHA256
 */
function signData(data: string): string {
  const secret = process.env.ORACLE_SECRET_KEY || 'defidash-oracle-secret-key';
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verify signed data
 */
export function verifySignature(data: string, signature: string): boolean {
  const expectedSignature = signData(data);
  return signature === expectedSignature;
}

/**
 * Fetch and aggregate prices from multiple sources
 */
export async function fetchAggregatedPrice(symbol: string): Promise<AggregatedPrice> {
  console.log(`\n🔮 [Oracle] Fetching aggregated price for ${symbol}...`);

  // Fetch from all sources in parallel
  const sources = await Promise.all([
    fetchFromCoinGecko(symbol),
    fetchFromDexScreener(symbol),
    fetchFromBinance(symbol),
    fetchFromKraken(symbol),
  ]);

  // Filter successful sources
  const successfulSources = sources.filter(s => s.success && s.price > 0);
  
  if (successfulSources.length === 0) {
    console.error(`❌ [Oracle] No successful sources for ${symbol}`);
    throw new Error(`No price data available for ${symbol}`);
  }

  const prices = successfulSources.map(s => s.price);
  const median = calculateMedian(prices);
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = calculateVariance(prices, mean);
  const variancePercent = (variance / mean) * 100;

  // Calculate confidence based on number of sources and variance
  const sourceConfidence = successfulSources.length / sources.length;
  const varianceConfidence = Math.max(0, 1 - (variancePercent / 10)); // Lower confidence if variance > 10%
  const confidence = (sourceConfidence + varianceConfidence) / 2;

  // Log high variance alert
  if (variancePercent > 5) {
    console.warn(`⚠️  [Oracle] HIGH VARIANCE for ${symbol}: ${variancePercent.toFixed(2)}%`);
  }

  // Create data string for signing
  const dataString = `${symbol}:${median}:${new Date().toISOString()}`;
  const signature = signData(dataString);

  const aggregated: AggregatedPrice = {
    symbol,
    price: median,
    median,
    mean,
    variance: variancePercent,
    sources,
    timestamp: new Date(),
    signature,
    confidence,
  };

  // Cache the result
  priceCache.set(symbol, aggregated);

  // Store historical data
  const historical = historicalCache.get(symbol) || [];
  historical.push({
    symbol,
    price: median,
    timestamp: new Date(),
    sources: successfulSources.length,
    variance: variancePercent,
  });

  // Keep last 1000 data points
  if (historical.length > 1000) {
    historical.shift();
  }
  historicalCache.set(symbol, historical);

  console.log(`✅ [Oracle] ${symbol}: $${median.toFixed(2)} (${successfulSources.length}/${sources.length} sources, ${variancePercent.toFixed(2)}% variance)`);

  return aggregated;
}

/**
 * Get cached price or fetch new
 */
export async function getPrice(symbol: string, maxAge: number = 60000): Promise<AggregatedPrice> {
  const cached = priceCache.get(symbol);
  
  if (cached && Date.now() - cached.timestamp.getTime() < maxAge) {
    return cached;
  }
  
  return fetchAggregatedPrice(symbol);
}

/**
 * Get historical data
 */
export function getHistoricalData(
  symbol: string,
  limit: number = 100
): HistoricalDataPoint[] {
  const data = historicalCache.get(symbol) || [];
  return data.slice(-limit);
}

/**
 * Get oracle status
 */
export async function getOracleStatus(symbols: string[]): Promise<OracleStatus> {
  const alerts: string[] = [];
  let totalSources = 0;
  let activeSources = 0;
  
  for (const symbol of symbols) {
    try {
      const cached = priceCache.get(symbol);
      if (cached) {
        const successfulSources = cached.sources.filter(s => s.success);
        totalSources += cached.sources.length;
        activeSources += successfulSources.length;
        
        // Check for high variance
        if (cached.variance > 5) {
          alerts.push(`High variance for ${symbol}: ${cached.variance.toFixed(2)}%`);
        }
        
        // Check for low source count
        if (successfulSources.length < 2) {
          alerts.push(`Low source count for ${symbol}: ${successfulSources.length}/${cached.sources.length}`);
        }
      }
    } catch (error) {
      alerts.push(`Error checking ${symbol}: ${error}`);
    }
  }
  
  const isHealthy = activeSources >= totalSources * 0.5 && alerts.length < 3;
  
  return {
    isHealthy,
    totalSources,
    activeSources,
    lastUpdate: new Date(),
    uptime: process.uptime(),
    alerts,
  };
}

/**
 * Batch fetch multiple symbols
 */
export async function fetchBatchPrices(symbols: string[]): Promise<AggregatedPrice[]> {
  console.log(`\n🔮 [Oracle] Batch fetching ${symbols.length} symbols...`);
  
  const results = await Promise.allSettled(
    symbols.map(symbol => fetchAggregatedPrice(symbol))
  );
  
  const prices = results
    .filter((r): r is PromiseFulfilledResult<AggregatedPrice> => r.status === 'fulfilled')
    .map(r => r.value);
  
  console.log(`✅ [Oracle] Batch complete: ${prices.length}/${symbols.length} successful`);
  
  return prices;
}
