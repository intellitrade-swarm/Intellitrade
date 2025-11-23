

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { executeSwap } from '../../../../lib/wallet';
import { ChainName } from '../../../../lib/blockchain-config';

export const dynamic = "force-dynamic";

// DEX Router addresses
const DEX_ROUTERS: Record<ChainName, string> = {
  ethereum: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2
  base: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24', // BaseSwap
  bsc: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap
};

/**
 * Execute a trade on behalf of an agent
 * POST /api/wallet/trade
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      agentId, 
      tokenIn, 
      tokenOut, 
      amountIn, 
      minAmountOut, 
      symbol 
    } = body;

    if (!agentId || !tokenIn || !tokenOut || !amountIn) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get agent with wallet info
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (!agent.walletAddress || !agent.encryptedPrivateKey) {
      return NextResponse.json({ 
        error: 'Agent does not have a wallet configured' 
      }, { status: 400 });
    }

    const chain = (agent.primaryChain || 'base') as ChainName;
    const routerAddress = DEX_ROUTERS[chain];

    // Execute the swap
    const result = await executeSwap(
      agent.encryptedPrivateKey,
      chain,
      tokenIn,
      tokenOut,
      amountIn,
      minAmountOut || '0',
      routerAddress
    );

    // Record the trade in database
    const trade = await prisma.trade.create({
      data: {
        agentId,
        symbol: symbol || `${tokenIn}/${tokenOut}`,
        type: 'SPOT',
        side: 'BUY',
        quantity: parseFloat(amountIn),
        entryPrice: parseFloat(amountIn) / parseFloat(minAmountOut || '1'),
        status: 'CLOSED',
        isRealTrade: true,
        txHash: result.txHash,
        blockNumber: result.blockNumber ? BigInt(result.blockNumber) : null,
        chain,
      },
    });

    return NextResponse.json({
      success: true,
      trade: {
        id: trade.id,
        txHash: result.txHash,
        blockNumber: result.blockNumber,
        chain,
      },
      message: 'Trade executed successfully on-chain',
    });
  } catch (error) {
    console.error('Error executing trade:', error);
    return NextResponse.json({ 
      error: 'Failed to execute trade',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
