
import { NextRequest, NextResponse } from 'next/server';
import { webhookProcessor } from '@/lib/webhook-processor';

export const dynamic = 'force-dynamic';

/**
 * Webhook Statistics API
 * GET /api/webhooks/stats
 * Retrieves statistics about webhook processing
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = (searchParams.get('timeframe') as '24h' | '7d' | '30d') || '24h';

    console.log(`📊 Fetching webhook stats for timeframe: ${timeframe}`);

    const stats = await webhookProcessor.getWebhookStats(timeframe);

    return NextResponse.json({
      success: true,
      timeframe,
      stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching webhook stats:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
