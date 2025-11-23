
import { NextRequest, NextResponse } from 'next/server';
import { startOracleNode, getOracleNode } from '@/lib/blockchain-oracle';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    // Check if already running
    const existingNode = getOracleNode();
    if (existingNode) {
      const status = await existingNode.getStatus();
      return NextResponse.json({
        success: true,
        message: 'Oracle node already running',
        data: status
      });
    }

    const body = await request.json().catch(() => ({}));
    const network = body.network || 'astar-zkevm';

    // Start the oracle node
    const oracleNode = await startOracleNode(network);
    const status = await oracleNode.getStatus();

    return NextResponse.json({
      success: true,
      message: `Oracle node started on ${network}`,
      data: status
    });
  } catch (error: any) {
    console.error('Error starting oracle node:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
