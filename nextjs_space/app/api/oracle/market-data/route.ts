
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * API route for market data oracle requests
 * Aggregates data from multiple sources for comprehensive market analysis
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symbol, chain, dataType, timeframe } = body;

    if (!symbol || !chain || !dataType) {
      return NextResponse.json(
        { error: 'Missing required parameters: symbol, chain, dataType' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Fetch market data based on the request
    let result: any = {};

    switch (dataType) {
      case 'price':
        result = await getPriceData(symbol, chain, timeframe);
        break;
      case 'volume':
        result = await getVolumeData(symbol, chain, timeframe);
        break;
      case 'liquidity':
        result = await getLiquidityData(symbol, chain);
        break;
      case 'sentiment':
        result = await getSentimentData(symbol, chain);
        break;
      case 'technical':
        result = await getTechnicalData(symbol, chain, timeframe);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown data type: ${dataType}` },
          { status: 400 }
        );
    }

    const processingTime = Date.now() - startTime;

    // Generate request ID
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      requestId,
      result,
      timestamp: new Date().toISOString(),
      processingTime,
      status: 'fulfilled',
    });
  } catch (error: any) {
    console.error('Market data oracle error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getPriceData(symbol: string, chain: string, timeframe?: string) {
  try {
    // Fetch from multiple sources for redundancy
    const sources = [];

    // DexScreener data
    try {
      const dexResponse = await fetch(
        `https://api.dexscreener.com/latest/dex/search?q=${symbol}`
      );
      if (dexResponse.ok) {
        const dexData = await dexResponse.json();
        sources.push({
          source: 'dexscreener',
          data: dexData.pairs?.[0] || null,
        });
      }
    } catch (error) {
      console.error('DexScreener fetch error:', error);
    }

    // CoinGecko data (if available)
    try {
      const cgResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
      );
      if (cgResponse.ok) {
        const cgData = await cgResponse.json();
        sources.push({
          source: 'coingecko',
          data: cgData,
        });
      }
    } catch (error) {
      console.error('CoinGecko fetch error:', error);
    }

    // Aggregate prices
    const prices = sources
      .map((s) => {
        if (s.source === 'dexscreener' && s.data) {
          return parseFloat(s.data.priceUsd || '0');
        }
        if (s.source === 'coingecko' && s.data) {
          const key = Object.keys(s.data)[0];
          return s.data[key]?.usd || 0;
        }
        return 0;
      })
      .filter((p) => p > 0);

    const avgPrice = prices.length > 0
      ? prices.reduce((a, b) => a + b, 0) / prices.length
      : 0;

    return {
      symbol,
      chain,
      price: avgPrice,
      sources: sources.length,
      timeframe: timeframe || 'current',
      raw: sources,
    };
  } catch (error: any) {
    console.error('Price data error:', error);
    return {
      symbol,
      chain,
      price: 0,
      error: error.message,
    };
  }
}

async function getVolumeData(symbol: string, chain: string, timeframe?: string) {
  try {
    const dexResponse = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${symbol}`
    );
    
    if (!dexResponse.ok) {
      throw new Error('Failed to fetch volume data');
    }

    const dexData = await dexResponse.json();
    const pair = dexData.pairs?.[0];

    return {
      symbol,
      chain,
      volume24h: pair?.volume?.h24 || 0,
      volumeChange: pair?.volume?.h24Change || 0,
      timeframe: timeframe || '24h',
      liquidity: pair?.liquidity?.usd || 0,
    };
  } catch (error: any) {
    console.error('Volume data error:', error);
    return {
      symbol,
      chain,
      volume24h: 0,
      error: error.message,
    };
  }
}

async function getLiquidityData(symbol: string, chain: string) {
  try {
    const dexResponse = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${symbol}`
    );
    
    if (!dexResponse.ok) {
      throw new Error('Failed to fetch liquidity data');
    }

    const dexData = await dexResponse.json();
    const pair = dexData.pairs?.[0];

    return {
      symbol,
      chain,
      liquidityUsd: pair?.liquidity?.usd || 0,
      liquidityBase: pair?.liquidity?.base || 0,
      liquidityQuote: pair?.liquidity?.quote || 0,
      dex: pair?.dexId || 'unknown',
      pairAddress: pair?.pairAddress || null,
    };
  } catch (error: any) {
    console.error('Liquidity data error:', error);
    return {
      symbol,
      chain,
      liquidityUsd: 0,
      error: error.message,
    };
  }
}

async function getSentimentData(symbol: string, chain: string) {
  // For now, return mock sentiment data
  // In production, this would aggregate from social media, news, etc.
  const mockSentiment = Math.random() * 100;
  
  return {
    symbol,
    chain,
    sentiment: mockSentiment > 50 ? 'bullish' : 'bearish',
    score: mockSentiment,
    sources: ['twitter', 'reddit', 'news'],
    confidence: 0.75,
  };
}

async function getTechnicalData(symbol: string, chain: string, timeframe?: string) {
  try {
    const dexResponse = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${symbol}`
    );
    
    if (!dexResponse.ok) {
      throw new Error('Failed to fetch technical data');
    }

    const dexData = await dexResponse.json();
    const pair = dexData.pairs?.[0];

    const priceChange5m = pair?.priceChange?.m5 || 0;
    const priceChange1h = pair?.priceChange?.h1 || 0;
    const priceChange6h = pair?.priceChange?.h6 || 0;
    const priceChange24h = pair?.priceChange?.h24 || 0;

    // Simple technical indicators
    const rsi = calculateRSI([priceChange5m, priceChange1h, priceChange6h, priceChange24h]);
    const momentum = priceChange24h;
    const volatility = Math.abs(priceChange5m - priceChange24h);

    return {
      symbol,
      chain,
      timeframe: timeframe || '24h',
      rsi,
      momentum,
      volatility,
      priceChange: {
        '5m': priceChange5m,
        '1h': priceChange1h,
        '6h': priceChange6h,
        '24h': priceChange24h,
      },
      trend: priceChange24h > 0 ? 'uptrend' : 'downtrend',
    };
  } catch (error: any) {
    console.error('Technical data error:', error);
    return {
      symbol,
      chain,
      error: error.message,
    };
  }
}

function calculateRSI(priceChanges: number[]): number {
  const gains = priceChanges.filter((c) => c > 0);
  const losses = priceChanges.filter((c) => c < 0).map((c) => Math.abs(c));

  if (losses.length === 0) return 100;
  if (gains.length === 0) return 0;

  const avgGain = gains.reduce((a, b) => a + b, 0) / gains.length;
  const avgLoss = losses.reduce((a, b) => a + b, 0) / losses.length;

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return rsi;
}
