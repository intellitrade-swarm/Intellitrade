
/**
 * API endpoint to get Solana wallet balance
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getWalletInfo, getSolPrice } from '@/lib/solana';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agentId = searchParams.get('agentId');
    const address = searchParams.get('address');

    if (!agentId && !address) {
      return NextResponse.json(
        { success: false, error: 'Agent ID or address is required' },
        { status: 400 }
      );
    }

    let walletAddress = address;

    // If agentId provided, get wallet address from database
    if (agentId) {
      const agent = await prisma.aIAgent.findUnique({
        where: { id: agentId },
        select: { solanaWalletAddress: true },
      });

      if (!agent?.solanaWalletAddress) {
        return NextResponse.json(
          { success: false, error: 'Agent does not have a Solana wallet' },
          { status: 404 }
        );
      }

      walletAddress = agent.solanaWalletAddress;
    }

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address not found' },
        { status: 404 }
      );
    }

    // Get wallet info
    const walletInfo = await getWalletInfo(walletAddress);
    const solPrice = await getSolPrice();

    return NextResponse.json({
      success: true,
      ...walletInfo,
      solPrice,
    });
  } catch (error: any) {
    console.error('Error fetching Solana balance:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
