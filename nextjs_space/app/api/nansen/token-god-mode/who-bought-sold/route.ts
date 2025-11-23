
import { NextRequest, NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

export const dynamic = 'force-dynamic';

/**
 * Who Bought/Sold API Endpoint
 * Fetches recent buyers and sellers of a token (DEX trades)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') || 'ethereum';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Token address is required' },
        { status: 400 }
      );
    }

    if (!nansenAPI.isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Nansen API not configured' },
        { status: 503 }
      );
    }

    // Fetch smart money DEX trades to see who bought/sold
    const trades = await nansenAPI.getSmartMoneyDEXTrades(address, chain, limit);

    // Separate buyers and sellers
    const buyers = trades.filter((t: any) => t.type === 'BUY');
    const sellers = trades.filter((t: any) => t.type === 'SELL');

    // Calculate volumes
    const totalBuyVolume = buyers.reduce((sum: number, t: any) => sum + (t.amountUsd || 0), 0);
    const totalSellVolume = sellers.reduce((sum: number, t: any) => sum + (t.amountUsd || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        buyers: {
          count: buyers.length,
          totalVolume: totalBuyVolume,
          trades: buyers.slice(0, 20), // Top 20 buyers
        },
        sellers: {
          count: sellers.length,
          totalVolume: totalSellVolume,
          trades: sellers.slice(0, 20), // Top 20 sellers
        },
        netFlow: totalBuyVolume - totalSellVolume,
        buyPressure: totalBuyVolume / (totalBuyVolume + totalSellVolume) * 100,
      },
      chain,
      tokenAddress: address,
    });
  } catch (error: any) {
    console.error('[Who Bought/Sold API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch buyers/sellers data' },
      { status: 500 }
    );
  }
}
