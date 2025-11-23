
import { NextResponse } from 'next/server';
import { getOracleManager } from '@/lib/work-oracle';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id;
    const oracleManager = getOracleManager();
    const oracleRequest = await oracleManager.getRequest(requestId);

    if (!oracleRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      request: oracleRequest,
    });
  } catch (error: any) {
    console.error('Error fetching oracle request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch oracle request' },
      { status: 500 }
    );
  }
}
