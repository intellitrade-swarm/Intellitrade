
import { NextRequest, NextResponse } from 'next/server';
import { fetchBatchPrices } from '@/lib/enhanced-oracle';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbols } = body;
    
    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json(
        {
          success: false,
          error: 'symbols array is required',
        },
        { status: 400 }
      );
    }
    
    const prices = await fetchBatchPrices(symbols);
    
    return NextResponse.json({
      success: true,
      data: prices,
      count: prices.length,
    });
  } catch (error: any) {
    console.error('[Oracle Batch Price API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch batch prices',
      },
      { status: 500 }
    );
  }
}
