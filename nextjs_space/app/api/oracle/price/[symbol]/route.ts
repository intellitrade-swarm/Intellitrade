
import { NextRequest, NextResponse } from 'next/server';
import { getPrice } from '@/lib/enhanced-oracle';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol.toUpperCase();
    const price = await getPrice(symbol);
    
    return NextResponse.json({
      success: true,
      data: price,
    });
  } catch (error: any) {
    console.error('[Oracle Price API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch price',
      },
      { status: 500 }
    );
  }
}
