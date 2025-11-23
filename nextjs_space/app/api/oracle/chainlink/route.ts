
import { NextRequest, NextResponse } from 'next/server';
import { chainlinkOracle, requestPriceFeed, requestAIAnalysis, requestLiquidityData } from '@/lib/chainlink-oracle';

/**
 * Chainlink Oracle API Endpoints
 * Professional-grade oracle integration with external adapters
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'list_adapters':
        return NextResponse.json({
          success: true,
          adapters: chainlinkOracle.listAdapters(),
        });

      case 'list_jobs':
        return NextResponse.json({
          success: true,
          jobs: chainlinkOracle.listJobs(),
        });

      case 'list_requests':
        return NextResponse.json({
          success: true,
          requests: chainlinkOracle.listRequests(),
        });

      case 'get_request':
        const requestId = searchParams.get('requestId');
        if (!requestId) {
          return NextResponse.json(
            { success: false, error: 'Request ID required' },
            { status: 400 }
          );
        }
        const req = chainlinkOracle.getRequest(requestId);
        return NextResponse.json({
          success: true,
          request: req || null,
        });

      default:
        return NextResponse.json({
          success: true,
          message: 'Chainlink Oracle API',
          endpoints: {
            'GET /api/oracle/chainlink?action=list_adapters': 'List all external adapters',
            'GET /api/oracle/chainlink?action=list_jobs': 'List all job specifications',
            'GET /api/oracle/chainlink?action=list_requests': 'List active requests',
            'GET /api/oracle/chainlink?action=get_request&requestId=X': 'Get request status',
            'POST /api/oracle/chainlink': 'Create new oracle request',
          },
        });
    }
  } catch (error: any) {
    console.error('Chainlink Oracle API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'request_price_feed':
        const { symbol } = params;
        if (!symbol) {
          return NextResponse.json(
            { success: false, error: 'Symbol required' },
            { status: 400 }
          );
        }

        const priceData = await requestPriceFeed(symbol, params.requester);
        return NextResponse.json({
          success: true,
          data: priceData,
        });

      case 'request_ai_analysis':
        const { symbol: aiSymbol, marketData } = params;
        if (!aiSymbol) {
          return NextResponse.json(
            { success: false, error: 'Symbol required' },
            { status: 400 }
          );
        }

        const aiAnalysis = await requestAIAnalysis(aiSymbol, marketData, params.requester);
        return NextResponse.json({
          success: true,
          data: aiAnalysis,
        });

      case 'request_liquidity':
        const { protocol, chain } = params;
        if (!protocol) {
          return NextResponse.json(
            { success: false, error: 'Protocol required' },
            { status: 400 }
          );
        }

        const liquidityData = await requestLiquidityData(protocol, chain, params.requester);
        return NextResponse.json({
          success: true,
          data: liquidityData,
        });

      case 'create_request':
        const { jobId, requester, parameters, callbackUrl } = params;
        if (!jobId) {
          return NextResponse.json(
            { success: false, error: 'Job ID required' },
            { status: 400 }
          );
        }

        const newRequest = await chainlinkOracle.createRequest(
          jobId,
          requester || 'api',
          parameters || {},
          callbackUrl
        );

        return NextResponse.json({
          success: true,
          request: newRequest,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Chainlink Oracle request error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
