
import { NextResponse } from 'next/server';
import { initializeTradingScheduler, isSchedulerActive } from '@/lib/startup-scheduler';

let initStarted = false;

/**
 * GET /api/trading/init
 * Initialize the 24/7 trading scheduler
 * Called automatically when the app starts
 */
export async function GET() {
  try {
    // Prevent multiple initialization attempts
    if (initStarted || isSchedulerActive()) {
      return NextResponse.json({
        success: true,
        message: 'Trading scheduler already initialized',
        active: isSchedulerActive(),
      });
    }

    initStarted = true;

    // Initialize the scheduler in the background
    initializeTradingScheduler().catch((error) => {
      console.error('Error during scheduler initialization:', error);
      initStarted = false;
    });

    return NextResponse.json({
      success: true,
      message: 'Trading scheduler initialization started',
      active: true,
    });
  } catch (error) {
    console.error('Error initializing trading:', error);
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
 * POST /api/trading/init
 * Force re-initialization of trading scheduler
 */
export async function POST() {
  try {
    initStarted = false;
    await initializeTradingScheduler();

    return NextResponse.json({
      success: true,
      message: 'Trading scheduler re-initialized',
      active: isSchedulerActive(),
    });
  } catch (error) {
    console.error('Error re-initializing trading:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
