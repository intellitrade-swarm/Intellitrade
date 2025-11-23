
import { NextRequest, NextResponse } from 'next/server';
import { getOracleNode } from '@/lib/blockchain-oracle';

export async function GET(request: NextRequest) {
  try {
    const oracleNode = getOracleNode();
    
    if (!oracleNode) {
      return NextResponse.json({
        success: false,
        error: 'Oracle node not initialized',
        data: null
      }, { status: 503 });
    }

    const status = await oracleNode.getStatus();
    const balance = await oracleNode.getBalance();

    return NextResponse.json({
      success: true,
      data: {
        ...status,
        balance,
        balanceETH: balance
      }
    });
  } catch (error: any) {
    console.error('Error getting oracle node status:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      data: null
    }, { status: 500 });
  }
}
