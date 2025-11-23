
import { NextRequest, NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

export const dynamic = 'force-dynamic';

/**
 * Token Transfers API Endpoint
 * Fetches recent token transfer events for a specific token
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

    // Fetch transactions and filter for transfers
    // Using smart money DEX trades as a proxy for transfers
    const allTrades = await nansenAPI.getSmartMoneyDEXTrades(address, chain, limit * 2);
    
    // Filter for transfer-type transactions
    const transfers = allTrades.filter((t: any) => t.type === 'TRANSFER' || t.type === 'BUY' || t.type === 'SELL');

    // Aggregate transfer statistics
    const totalVolume = transfers.reduce((sum: number, t: any) => sum + (t.amountUsd || 0), 0);
    const avgTransferSize = transfers.length > 0 ? totalVolume / transfers.length : 0;

    // Group by wallet to find most active addresses
    const walletActivity: Record<string, { count: number; volume: number }> = {};
    transfers.forEach((t: any) => {
      const wallet = t.walletAddress || t.from || 'unknown';
      if (!walletActivity[wallet]) {
        walletActivity[wallet] = { count: 0, volume: 0 };
      }
      walletActivity[wallet].count++;
      walletActivity[wallet].volume += t.amountUsd || 0;
    });

    const topWallets = Object.entries(walletActivity)
      .map(([wallet, stats]) => ({ wallet, ...stats }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        transfers: transfers.slice(0, limit),
        statistics: {
          totalTransfers: transfers.length,
          totalVolume,
          avgTransferSize,
          topWallets,
        },
      },
      chain,
      tokenAddress: address,
      count: transfers.length,
    });
  } catch (error: any) {
    console.error('[Token Transfers API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch token transfers' },
      { status: 500 }
    );
  }
}
