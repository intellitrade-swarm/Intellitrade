
import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalData } from '@/lib/enhanced-oracle';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol.toUpperCase();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    
    const data = getHistoricalData(symbol, limit);
    
    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error: any) {
    console.error('[Oracle Historical API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch historical data',
      },
      { status: 500 }
    );
  }
}
