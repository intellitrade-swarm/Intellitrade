
/**
 * API endpoint to execute Solana trades via Jupiter DEX
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { swapSolForUsdc, swapUsdcForSol, swapTokens } from '@/lib/jupiter';
import { getSolBalance, getSolPrice } from '@/lib/solana';

export async function POST(request: NextRequest) {
  try {
    const { 
      agentId, 
      inputToken, 
      outputToken, 
      amount, 
      slippageBps = 50 
    } = await request.json();

    if (!agentId || !inputToken || !outputToken || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get agent with Solana wallet
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        name: true,
        solanaWalletAddress: true,
        solanaPrivateKey: true,
      },
    });

    if (!agent?.solanaWalletAddress || !agent.solanaPrivateKey) {
      return NextResponse.json(
        { success: false, error: 'Agent does not have a Solana wallet' },
        { status: 404 }
      );
    }

    // Check wallet balance
    const balance = await getSolBalance(agent.solanaWalletAddress);
    
    if (balance === 0) {
      return NextResponse.json(
        { success: false, error: 'Insufficient SOL balance for transaction' },
        { status: 400 }
      );
    }

    // Execute trade based on token pair
    let result;
    
    if (inputToken === 'SOL' && outputToken === 'USDC') {
      result = await swapSolForUsdc(agent.solanaPrivateKey, amount, slippageBps);
    } else if (inputToken === 'USDC' && outputToken === 'SOL') {
      result = await swapUsdcForSol(agent.solanaPrivateKey, amount, slippageBps);
    } else {
      // Generic token swap
      result = await swapTokens(
        agent.solanaPrivateKey,
        inputToken,
        outputToken,
        amount,
        slippageBps
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Record trade in database
    const solPrice = await getSolPrice();
    const usdValue = inputToken === 'SOL' 
      ? amount * solPrice 
      : (result.outputAmount || 0) * solPrice;

    await prisma.trade.create({
      data: {
        agentId: agent.id,
        symbol: `${inputToken}/${outputToken}`,
        type: 'SPOT',
        side: inputToken === 'SOL' ? 'SELL' : 'BUY',
        quantity: amount,
        entryPrice: solPrice,
        status: 'CLOSED',
        isRealTrade: true,
        txHash: result.signature,
        chain: 'solana',
        profitLoss: 0,
      },
    });

    return NextResponse.json({
      success: true,
      signature: result.signature,
      inputAmount: result.inputAmount,
      outputAmount: result.outputAmount,
      usdValue,
      message: 'Trade executed successfully on Solana',
    });
  } catch (error: any) {
    console.error('Error executing Solana trade:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to execute trade' },
      { status: 500 }
    );
  }
}
