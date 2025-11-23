
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

/**
 * Live Market Data API
 * Returns recent market data and trends
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch recent market data
    const marketData = await prisma.marketData.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    // Transform to readable format
    const formattedData = marketData.map((data: any) => ({
      id: data.id,
      symbol: data.symbol,
      price: parseFloat(data.price?.toString() || '0'),
      volume: parseFloat(data.volume?.toString() || '0'),
      timestamp: data.timestamp,
      metadata: data.metadata,
    }));

    return NextResponse.json(formattedData);
  } catch (error: any) {
    console.error('Error fetching live market data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch live market data',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
