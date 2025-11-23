
import { NextRequest, NextResponse } from 'next/server';
import { getOracleStatus } from '@/lib/enhanced-oracle';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');
    const symbols = symbolsParam ? symbolsParam.split(',') : ['BTC', 'ETH', 'SOL'];
    
    const status = await getOracleStatus(symbols);
    
    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    console.error('[Oracle Status API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get oracle status',
      },
      { status: 500 }
    );
  }
}
