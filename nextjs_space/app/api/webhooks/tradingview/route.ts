
import { NextRequest, NextResponse } from 'next/server';
import { webhookProcessor, type WebhookPayload } from '@/lib/webhook-processor';

export const dynamic = 'force-dynamic';

/**
 * TradingView Webhook Receiver
 * 
 * POST /api/webhooks/tradingview
 * Receives alerts from TradingView and triggers swarm analysis
 * 
 * Webhook URL to use in TradingView:
 * https://intellitrade.xyz/api/webhooks/tradingview
 * 
 * Example TradingView Alert Message:
 * {
 *   "ticker": "{{ticker}}",
 *   "exchange": "{{exchange}}",
 *   "action": "{{strategy.order.action}}",
 *   "strategy": "{{strategy.order.id}}",
 *   "price": {{close}},
 *   "time": "{{time}}",
 *   "alertType": "technical"
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse webhook payload
    let payload: WebhookPayload;
    
    try {
      payload = await request.json();
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON payload',
          hint: 'Ensure TradingView alert message is valid JSON'
        },
        { status: 400 }
      );
    }

    console.log('\n🔔 TradingView Webhook Received:', {
      ticker: payload.ticker,
      action: payload.action,
      alertType: payload.alertType,
      timestamp: new Date().toISOString(),
    });

    // Validate required fields
    if (!payload.ticker && !payload.tokenAddress) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: ticker or tokenAddress',
          received: payload,
        },
        { status: 400 }
      );
    }

    // Process webhook through webhook processor
    const response = await webhookProcessor.processTradingViewWebhook(payload, 'tradingview');

    console.log(`✅ Webhook processed successfully in ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      data: response,
      processingTime: Date.now() - startTime,
    });

  } catch (error) {
    console.error('❌ Error processing TradingView webhook:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for webhook status/documentation
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    endpoint: '/api/webhooks/tradingview',
    method: 'POST',
    description: 'TradingView webhook receiver for triggering swarm analysis',
    usage: {
      webhookUrl: 'https://intellitrade.xyz/api/webhooks/tradingview',
      method: 'POST',
      contentType: 'application/json',
    },
    examplePayload: {
      ticker: 'BTCUSDT',
      exchange: 'BINANCE',
      action: 'buy',
      strategy: 'RSI_Strategy',
      price: 45000,
      time: '2025-11-22T12:00:00Z',
      alertType: 'technical',
    },
    supportedAlertTypes: [
      'price',
      'volume',
      'whale',
      'technical',
      'custom',
    ],
    documentation: 'https://intellitrade.xyz/webhooks',
  });
}
