
import { NextResponse } from 'next/server';
import { getOracleManager } from '@/lib/work-oracle';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, requestType, payload } = body;

    if (!agentId || !requestType || !payload) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, requestType, payload' },
        { status: 400 }
      );
    }

    const oracleManager = getOracleManager();
    const requestId = await oracleManager.submitRequest(agentId, requestType, payload);

    return NextResponse.json({
      success: true,
      requestId,
      message: 'Oracle request submitted successfully',
    });
  } catch (error: any) {
    console.error('Error submitting oracle request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit oracle request' },
      { status: 500 }
    );
  }
}
