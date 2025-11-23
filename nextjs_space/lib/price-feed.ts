/**
 * Real-time Price Feed
 * Fetches accurate current prices from multiple sources
 */

interface PriceData {
  symbol: string;
  price: number;
  source: string;
  timestamp: Date;
}

// Fetch price from CoinGecko (free, no API key required)
async function fetchFromCoinGecko(symbol: string): Promise<number | null> {
  try {
    // Map common symbols to CoinGecko IDs
    const symbolMap: Record<string, string> = {
      'ETH': 'ethereum',
      'ETHUSDT': 'ethereum',
      'BTC': 'bitcoin',
      'BTCUSDT': 'bitcoin',
      'USDC': 'usd-coin',
      'USDT': 'tether',
      'SOL': 'solana',
      'SOLUSDT': 'solana',
      'MATIC': 'matic-network',
      'AVAX': 'avalanche-2',
      'ARB': 'arbitrum',
    };

    const cleanSymbol = symbol.replace('/USD', '').replace('/USDC', '').replace('USDT', '');
    const coinId = symbolMap[cleanSymbol] || symbolMap[symbol] || cleanSymbol.toLowerCase();

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      { 
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      }
    );

    if (!response.ok) {
      console.warn(`CoinGecko API error for ${symbol}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const price = data[coinId]?.usd;

    if (price && typeof price === 'number') {
      console.log(`✅ CoinGecko price for ${symbol}: $${price}`);
      return price;
    }

    return null;
  } catch (error) {
    console.warn(`Error fetching from CoinGecko for ${symbol}:`, error);
    return null;
  }
}

// Fetch price from Binance (backup source)
async function fetchFromBinance(symbol: string): Promise<number | null> {
  try {
    const cleanSymbol = symbol.replace('/USD', '').replace('/USDC', '');
    const binanceSymbol = `${cleanSymbol}USDT`;

    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`,
      { 
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const price = parseFloat(data.price);

    if (price && !isNaN(price)) {
      console.log(`✅ Binance price for ${symbol}: $${price}`);
      return price;
    }

    return null;
  } catch (error) {
    console.warn(`Error fetching from Binance for ${symbol}:`, error);
    return null;
  }
}

// Get current real-time price with fallback sources
export async function getCurrentPrice(symbol: string): Promise<PriceData | null> {
  const cleanSymbol = symbol.replace('/USD', '').replace('/USDC', '');

  // Try CoinGecko first (most reliable and free)
  let price = await fetchFromCoinGecko(symbol);
  if (price) {
    return {
      symbol: cleanSymbol,
      price,
      source: 'CoinGecko',
      timestamp: new Date(),
    };
  }

  // Fallback to Binance
  price = await fetchFromBinance(symbol);
  if (price) {
    return {
      symbol: cleanSymbol,
      price,
      source: 'Binance',
      timestamp: new Date(),
    };
  }

  console.error(`❌ Could not fetch price for ${symbol} from any source`);
  return null;
}

// Get multiple prices at once
export async function getCurrentPrices(symbols: string[]): Promise<Map<string, PriceData>> {
  const priceMap = new Map<string, PriceData>();

  await Promise.all(
    symbols.map(async (symbol) => {
      const priceData = await getCurrentPrice(symbol);
      if (priceData) {
        priceMap.set(symbol, priceData);
      }
    })
  );

  return priceMap;
}

export default {
  getCurrentPrice,
  getCurrentPrices,
};
