
import { NextRequest, NextResponse } from 'next/server';
import { runAsterAutonomousTradingCycle, executeAsterAutonomousTrade } from '@/lib/aster-autonomous-trading';

/**
 * POST /api/aster-dex/autonomous
 * Run AsterDEX autonomous trading cycle
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId } = body;

    // If agentId provided, trade for specific agent
    // Otherwise, trade for all agents
    const results = agentId
      ? [await executeAsterAutonomousTrade(agentId)]
      : await runAsterAutonomousTradingCycle();

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        holds: results.filter(r => r.action === 'HOLD').length,
        errors: results.filter(r => !r.success && r.action !== 'HOLD').length,
      },
    });

  } catch (error) {
    console.error('Error in AsterDEX autonomous trading:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/aster-dex/autonomous
 * Get AsterDEX autonomous trading status
 */
export async function GET() {
  try {
    // Return status of AsterDEX autonomous trading
    return NextResponse.json({
      enabled: true,
      description: '24/7 autonomous perpetuals trading on Astar zkEVM',
      markets: ['BTC-USD', 'ETH-USD', 'MATIC-USD', 'LINK-USD', 'ASTR-USD'],
      features: [
        'AI-powered market analysis',
        'Intelligent position sizing',
        'Dynamic leverage (2x-5x)',
        'Risk management with circuit breakers',
        'Automatic position monitoring',
        'PnL-based position closing',
      ],
    });

  } catch (error) {
    console.error('Error getting AsterDEX status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
