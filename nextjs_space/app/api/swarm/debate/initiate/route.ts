
import { NextRequest, NextResponse } from 'next/server';
import { swarmOrchestrator } from '@/lib/swarm-orchestrator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, currentPrice, priceChange24h, volume24h, triggerReason, marketData } = body;

    if (!symbol || !currentPrice || !triggerReason) {
      return NextResponse.json(
        { error: 'Missing required fields: symbol, currentPrice, triggerReason' },
        { status: 400 }
      );
    }

    const debateId = await swarmOrchestrator.initiateDebate({
      symbol,
      currentPrice,
      priceChange24h: priceChange24h || 0,
      volume24h: volume24h || 0,
      triggerReason,
      marketData: marketData || {},
    });

    return NextResponse.json({
      success: true,
      debateId,
      message: 'Swarm debate initiated successfully',
    });

  } catch (error: any) {
    console.error('Error initiating swarm debate:', error);
    return NextResponse.json(
      { error: 'Failed to initiate debate', details: error.message },
      { status: 500 }
    );
  }
}
