
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route for batch oracle requests
 * Allows multiple requests to be processed in a single call
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requests } = body;

    if (!requests || !Array.isArray(requests)) {
      return NextResponse.json(
        { error: 'Missing required parameter: requests (array)' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Process all requests in parallel
    const results = await Promise.all(
      requests.map(async (request: any, index: number) => {
        try {
          const { type, params } = request;
          let endpoint = '';

          switch (type) {
            case 'market':
              endpoint = '/api/oracle/market-data';
              break;
            case 'ai':
              endpoint = '/api/oracle/ai-analysis';
              break;
            case 'signals':
              endpoint = '/api/oracle/trading-signals';
              break;
            case 'liquidity':
              endpoint = '/api/oracle/cross-chain-liquidity';
              break;
            default:
              throw new Error(`Unknown request type: ${type}`);
          }

          const response = await fetch(`${req.nextUrl.origin}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
          });

          if (!response.ok) {
            throw new Error(`Request ${index} failed: ${response.statusText}`);
          }

          const data = await response.json();
          return {
            index,
            type,
            success: true,
            data,
          };
        } catch (error: any) {
          console.error(`Batch request ${index} error:`, error);
          return {
            index,
            type: request.type,
            success: false,
            error: error.message,
          };
        }
      })
    );

    const processingTime = Date.now() - startTime;

    // Generate batch ID
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      batchId,
      results,
      totalRequests: requests.length,
      successfulRequests: results.filter((r) => r.success).length,
      failedRequests: results.filter((r) => !r.success).length,
      timestamp: new Date().toISOString(),
      processingTime,
      status: 'fulfilled',
    });
  } catch (error: any) {
    console.error('Batch oracle error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
