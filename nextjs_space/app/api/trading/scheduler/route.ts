
import { NextRequest, NextResponse } from 'next/server';
import { tradingScheduler } from '@/lib/trading-scheduler';
import { testConnection } from '@/lib/aster-dex';

export const dynamic = 'force-dynamic';

/**
 * GET: Get scheduler status
 */
export async function GET() {
  try {
    const status = tradingScheduler.getStatus();
    
    return NextResponse.json({
      success: true,
      scheduler: {
        isRunning: status.isRunning,
        useAsterDex: status.useAsterDex,
        lastCycleTime: status.lastCycleTime,
        nextCycleTime: status.nextCycleTime,
        cyclesCompleted: status.cyclesCompleted,
        successfulTrades: status.successfulTrades,
        failedTrades: status.failedTrades,
        totalTradesAttempted: status.totalTradesAttempted,
      },
    });
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Start/stop scheduler
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, intervalMinutes } = body;

    if (action === 'start') {
      // Test connection first
      const connected = await testConnection();
      if (!connected) {
        return NextResponse.json(
          {
            success: false,
            error: 'AsterDEX connection failed. Check API credentials.',
          },
          { status: 400 }
        );
      }

      // Set to AsterDEX mode
      await tradingScheduler.setTradingMode(true);

      // Start scheduler
      await tradingScheduler.start(intervalMinutes || 15);

      return NextResponse.json({
        success: true,
        message: '24/7 trading scheduler started successfully',
        intervalMinutes: intervalMinutes || 15,
      });
    } else if (action === 'stop') {
      await tradingScheduler.stop();

      return NextResponse.json({
        success: true,
        message: 'Trading scheduler stopped',
      });
    } else if (action === 'restart') {
      await tradingScheduler.stop();
      
      // Test connection
      const connected = await testConnection();
      if (!connected) {
        return NextResponse.json(
          {
            success: false,
            error: 'AsterDEX connection failed. Check API credentials.',
          },
          { status: 400 }
        );
      }

      await tradingScheduler.setTradingMode(true);
      await tradingScheduler.start(intervalMinutes || 15);

      return NextResponse.json({
        success: true,
        message: 'Trading scheduler restarted successfully',
        intervalMinutes: intervalMinutes || 15,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "start", "stop", or "restart".' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error controlling scheduler:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
