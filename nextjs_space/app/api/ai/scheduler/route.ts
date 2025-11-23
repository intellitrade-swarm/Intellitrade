
import { NextRequest, NextResponse } from 'next/server';
import { tradingScheduler } from '@/lib/trading-scheduler';

/**
 * GET /api/ai/scheduler
 * Get scheduler status
 */
export async function GET() {
  try {
    const status = tradingScheduler.getStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/scheduler
 * Start or stop the scheduler
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, intervalMinutes = 15 } = body;

    if (action === 'start') {
      await tradingScheduler.start(intervalMinutes);
      return NextResponse.json({ 
        success: true,
        message: `Scheduler started with ${intervalMinutes} minute interval`,
        status: tradingScheduler.getStatus()
      });
    } else if (action === 'stop') {
      await tradingScheduler.stop();
      return NextResponse.json({ 
        success: true,
        message: 'Scheduler stopped',
        status: tradingScheduler.getStatus()
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "start" or "stop"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error controlling scheduler:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ai/scheduler
 * Update scheduler settings
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { intervalMinutes, useAsterDex } = body;

    if (intervalMinutes !== undefined) {
      await tradingScheduler.updateInterval(intervalMinutes);
    }

    if (useAsterDex !== undefined) {
      await tradingScheduler.setTradingMode(useAsterDex);
    }

    return NextResponse.json({
      success: true,
      message: 'Scheduler settings updated',
      status: tradingScheduler.getStatus()
    });
  } catch (error) {
    console.error('Error updating scheduler:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
