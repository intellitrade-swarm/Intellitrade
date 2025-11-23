
import { NextRequest, NextResponse } from 'next/server';
import { getAllTickers, getMarketPrice, isConfigured } from '../../../../lib/aster-dex';

export const dynamic = "force-dynamic";

/**
 * Get Aster Dex market data
 */
export async function GET(request: NextRequest) {
  try {
    // Public access - no authentication required

    // Check if Aster Dex is configured
    if (!isConfigured()) {
      return NextResponse.json({ 
        error: 'Aster Dex API not configured',
        configured: false 
      }, { status: 400 });
    }

    // Get all tickers
    const tickers = await getAllTickers();

    // Filter and format the most relevant trading pairs
    const relevantPairs = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 
                          'ADAUSDT', 'DOGEUSDT', 'MATICUSDT', 'DOTUSDT', 'AVAXUSDT'];
    
    const markets = tickers
      .filter(ticker => relevantPairs.includes(ticker.symbol))
      .map(ticker => ({
        symbol: ticker.symbol,
        lastPrice: parseFloat(ticker.lastPrice),
        priceChange: parseFloat(ticker.priceChange),
        priceChangePercent: parseFloat(ticker.priceChangePercent),
        volume: parseFloat(ticker.volume),
        quoteVolume: parseFloat(ticker.quoteVolume)
      }))
      .sort((a, b) => b.quoteVolume - a.quoteVolume); // Sort by volume

    return NextResponse.json({
      success: true,
      markets,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Error getting Aster Dex markets:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get Aster Dex market data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

