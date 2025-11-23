
/**
 * Alchemy Agent Performance Monitoring API
 */

import { NextResponse } from 'next/server';
import { monitorAgentPerformance } from '@/lib/alchemy-trading-enhancer';
import { prisma } from '@/lib/db';
import { isAlchemyConfigured } from '@/lib/alchemy-config';

export async function GET(request: Request) {
  try {
    if (!isAlchemyConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Alchemy not configured',
      });
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const timeframe = parseInt(searchParams.get('timeframe') || '7200'); // Default 1 day

    if (!agentId) {
      return NextResponse.json({
        success: false,
        error: 'Agent ID required',
      }, { status: 400 });
    }

    // Get agent details
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
    });

    if (!agent || !agent.walletAddress) {
      return NextResponse.json({
        success: false,
        error: 'Agent not found or no wallet address',
      }, { status: 404 });
    }

    // Monitor performance using Alchemy
    const performance = await monitorAgentPerformance(
      'base', // Chain
      agent.walletAddress,
      timeframe
    );

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        walletAddress: agent.walletAddress,
      },
      performance,
      alchemyEnhanced: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Alchemy Agent Performance API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
