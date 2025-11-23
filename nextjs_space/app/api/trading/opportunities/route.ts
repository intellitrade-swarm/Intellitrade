
/**
 * API endpoint for profitable trading opportunities
 * Shows real-time high-probability setups across markets
 */

import { NextResponse } from 'next/server';
import { getProfitableOpportunities } from '@/lib/profitable-trading-engine';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const opportunities = await getProfitableOpportunities();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: opportunities.length,
      opportunities: opportunities.map((opp) => ({
        symbol: opp.symbol,
        action: opp.signal.action,
        confidence: Math.round(opp.signal.confidence * 100),
        score: Math.round(opp.score * 100),
        entryPrice: opp.signal.entryPrice,
        stopLoss: opp.signal.stopLoss,
        takeProfit: opp.signal.takeProfitLevels[0],
        positionSize: opp.signal.positionSize,
        leverage: opp.signal.leverage,
        riskReward: opp.signal.riskRewardRatio.toFixed(2),
        expectedProfit: opp.signal.expectedProfit,
        reasoning: opp.signal.reasoning,
        marketRegime: opp.signal.marketRegime.type,
        indicators: {
          rsi: Math.round(opp.signal.indicators.rsi),
          macd: opp.signal.indicators.macd.value.toFixed(4),
          volatility: opp.signal.indicators.volatility.toFixed(2),
          volumeRatio: opp.signal.indicators.volume.ratio.toFixed(2),
        },
      })),
    });
  } catch (error: any) {
    console.error('Error fetching profitable opportunities:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch profitable opportunities',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
