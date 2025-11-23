
import { NextRequest, NextResponse } from 'next/server';
import { webhookProcessor, type WebhookPayload } from '@/lib/webhook-processor';

export const dynamic = 'force-dynamic';

/**
 * Nansen Whale Alert Webhook Receiver
 * 
 * POST /api/webhooks/nansen
 * Receives whale alerts from Nansen (or simulated) and triggers swarm analysis
 * 
 * Example Nansen Whale Alert Payload:
 * {
 *   "whaleAddress": "0x...",
 *   "tokenAddress": "0x...",
 *   "chain": "ethereum",
 *   "amount": 1000000,
 *   "transactionHash": "0x...",
 *   "alertType": "whale",
 *   "action": "buy",
 *   "confidence": 85
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
        },
        { status: 400 }
      );
    }

    console.log('\n🐋 Nansen Whale Alert Received:', {
      whaleAddress: payload.whaleAddress,
      tokenAddress: payload.tokenAddress,
      chain: payload.chain,
      amount: payload.amount,
      timestamp: new Date().toISOString(),
    });

    // Validate required fields for whale alerts
    if (!payload.whaleAddress && !payload.tokenAddress) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: whaleAddress or tokenAddress',
        },
        { status: 400 }
      );
    }

    // Ensure alertType is set to whale
    payload.alertType = 'whale';

    // Process webhook through webhook processor
    const response = await webhookProcessor.processTradingViewWebhook(payload, 'nansen');

    console.log(`✅ Whale alert processed successfully in ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      message: 'Whale alert processed successfully',
      data: response,
      processingTime: Date.now() - startTime,
    });

  } catch (error) {
    console.error('❌ Error processing Nansen webhook:', error);
    
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
    endpoint: '/api/webhooks/nansen',
    method: 'POST',
    description: 'Nansen whale alert webhook receiver for triggering swarm analysis',
    usage: {
      webhookUrl: 'https://intellitrade.xyz/api/webhooks/nansen',
      method: 'POST',
      contentType: 'application/json',
    },
    examplePayload: {
      whaleAddress: '0x1234567890abcdef1234567890abcdef12345678',
      tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      chain: 'ethereum',
      amount: 1000000,
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      alertType: 'whale',
      action: 'buy',
      confidence: 85,
    },
    documentation: 'https://intellitrade.xyz/webhooks',
  });
}
