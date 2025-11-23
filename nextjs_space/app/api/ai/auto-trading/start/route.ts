
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import { runAutonomousTradingCycle } from '../../../../../lib/autonomous-trading';

/**
 * Start autonomous trading cycle for all agents
 * 
 * This endpoint triggers a single complete trading cycle with:
 * - AI-powered market analysis
 * - Risk assessment and circuit breaker checks
 * - Intelligent trading signal generation
 * - Real-time on-chain execution via 1inch
 * - Comprehensive monitoring and alerts
 * 
 * For continuous operation, call this endpoint periodically:
 * - Via frontend timer (every 5-15 minutes)
 * - Via cron job or external scheduler
 * - Via monitoring service
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 Starting autonomous trading cycle...');
    
    // Execute one complete autonomous trading cycle
    const results = await runAutonomousTradingCycle();

    const successCount = results.filter(r => r.success).length;
    const holdCount = results.filter(r => r.action === 'HOLD').length;
    const errorCount = results.filter(r => !r.success && r.action !== 'HOLD').length;
    const totalCount = results.length;

    console.log(`✅ Autonomous trading cycle complete: ${successCount} trades, ${holdCount} holds, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      results,
      summary: {
        totalAgents: totalCount,
        successfulTrades: successCount,
        holdDecisions: holdCount,
        failedTrades: errorCount
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in autonomous trading cycle:', error);
    return NextResponse.json(
      { 
        error: 'Failed to execute autonomous trading cycle',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get status of automated trading
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Return current trading status
    return NextResponse.json({
      status: 'ready',
      message: 'Automated trading system is ready to execute',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking trading status:', error);
    return NextResponse.json(
      { error: 'Failed to check trading status' },
      { status: 500 }
    );
  }
}
