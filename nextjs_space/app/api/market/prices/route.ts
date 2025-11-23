
import { NextResponse } from 'next/server';
import { getAllTickers } from '@/lib/aster-dex';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch current prices from AsterDEX
    const tickers = await getAllTickers();
    
    const prices: { [key: string]: number } = {};
    
    if (tickers && Array.isArray(tickers)) {
      tickers.forEach((ticker: any) => {
        if (ticker.symbol && ticker.lastPrice) {
          prices[ticker.symbol] = parseFloat(ticker.lastPrice);
        }
      });
    }

    return NextResponse.json({
      success: true,
      prices,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching market prices:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch prices', 
        prices: {} 
      },
      { status: 500 }
    );
  }
}
