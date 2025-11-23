
import { NextResponse } from 'next/server';
import { initializeTradingScheduler } from '@/lib/startup-scheduler';

export const dynamic = 'force-dynamic';

/**
 * API endpoint to manually start the 24/7 autonomous trading scheduler
 */
export async function POST() {
  try {
    console.log('🚀 Manual start of 24/7 trading scheduler requested');
    
    await initializeTradingScheduler();
    
    return NextResponse.json({
      success: true,
      message: '24/7 AsterDEX trading scheduler started successfully',
    });
  } catch (error) {
    console.error('Error starting trading scheduler:', error);
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
 * GET: Check if scheduler is active
 */
export async function GET() {
  try {
    const { tradingScheduler } = await import('@/lib/trading-scheduler');
    const status = tradingScheduler.getStatus();
    
    return NextResponse.json({
      success: true,
      isActive: status.isRunning,
      status,
    });
  } catch (error) {
    console.error('Error checking scheduler status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
