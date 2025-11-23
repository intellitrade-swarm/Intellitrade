
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { fetchSocialTradingSignals, aggregateSocialSignals } from '../../../lib/x-api';

// Force dynamic rendering to avoid static generation errors
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tokens from query params or use defaults
    const { searchParams } = new URL(request.url);
    const tokensParam = searchParams.get('tokens');
    const tokens = tokensParam ? tokensParam.split(',') : ['ETH', 'BTC', 'USDC'];

    // Fetch social trading signals
    const signals = await fetchSocialTradingSignals(tokens);
    
    // Aggregate signals by token
    const aggregated = aggregateSocialSignals(signals);
    const aggregatedData: Record<string, any> = {};
    aggregated.forEach((value, key) => {
      aggregatedData[key] = value;
    });

    return NextResponse.json({
      signals,
      aggregated: aggregatedData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching social signals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social trading signals' },
      { status: 500 }
    );
  }
}
