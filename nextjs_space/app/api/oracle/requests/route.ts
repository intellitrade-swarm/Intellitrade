
import { NextResponse } from 'next/server';
import { getOracleManager } from '@/lib/work-oracle';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');

    const oracleManager = getOracleManager();
    
    let requests;
    if (agentId) {
      requests = await oracleManager.getAgentRequests(agentId);
    } else if (status === 'pending') {
      requests = await oracleManager.getPendingRequests();
    } else {
      // Get all requests (limited implementation for demo)
      requests = await oracleManager.getPendingRequests();
    }

    return NextResponse.json({
      success: true,
      requests,
      count: requests.length,
    });
  } catch (error: any) {
    console.error('Error fetching oracle requests:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch oracle requests' },
      { status: 500 }
    );
  }
}
