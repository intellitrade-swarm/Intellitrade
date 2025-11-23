
import { NextRequest, NextResponse } from 'next/server';
import { whaleMonitor } from '@/lib/whale-monitor';

/**
 * GET /api/whale-monitor/signals
 * 
 * Get AI signals for a token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const userId = searchParams.get('userId') || 'demo-user';
    const tokenAddress = searchParams.get('address'); // Optional: Nansen token address
    const chain = searchParams.get('chain') || 'ethereum';
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol required' },
        { status: 400 }
      );
    }
    
    console.log(`\n📊 Fetching signals for ${symbol}`);
    
    // Process traditional signals for the token
    const signal = await whaleMonitor.processSignals(symbol, userId);
    
    // If token address provided, also fetch Nansen signals for enhanced analysis
    let nansenData = null;
    if (tokenAddress) {
      try {
        console.log(`📊 Fetching Nansen data for ${tokenAddress}`);
        
        const [nansenSignals, tokenInfo, smartMoney] = await Promise.all([
          whaleMonitor.getNansenSignals(tokenAddress, chain),
          whaleMonitor.getTokenInfo(tokenAddress, chain),
          whaleMonitor.getSmartMoneyActivity(tokenAddress, chain),
        ]);
        
        nansenData = {
          signals: nansenSignals,
          tokenInfo,
          smartMoney,
        };
        
        console.log(`✅ Nansen data fetched: ${nansenSignals.length} signals, Smart Money Net Flow: ${smartMoney?.netFlow || 0}`);
      } catch (error) {
        console.warn('[Whale Monitor] Error fetching Nansen data:', error);
      }
    }
    
    return NextResponse.json({
      success: true,
      signal,
      nansen: nansenData,
    });
  } catch (error) {
    console.error('Error getting signals:', error);
    return NextResponse.json(
      { error: 'Failed to get signals' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/whale-monitor/signals
 * 
 * Manually trigger signal analysis for a token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, userId = 'demo-user' } = body;
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol required' },
        { status: 400 }
      );
    }
    
    console.log(`\n🔄 Triggering signal analysis for ${symbol}`);
    
    // Monitor whales and analyze sentiment
    await whaleMonitor.analyzeXSentiment(symbol);
    
    // Process signals
    const signal = await whaleMonitor.processSignals(symbol, userId);
    
    return NextResponse.json({
      success: true,
      signal,
      message: 'Signal analysis complete',
    });
  } catch (error) {
    console.error('Error triggering signal analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze signals' },
      { status: 500 }
    );
  }
}
