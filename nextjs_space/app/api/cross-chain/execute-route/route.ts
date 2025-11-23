
import { NextRequest, NextResponse } from 'next/server';
import { crossChainRouter } from '@/lib/cross-chain-router';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/cross-chain/execute-route
 * 
 * Execute a cross-chain route
 * 
 * Body:
 * {
 *   pathId: string,
 *   agentId: string,
 *   userId: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pathId, path, agentId, userId } = body;
    
    if (!pathId && !path) {
      return NextResponse.json(
        { error: 'Path ID or path object required' },
        { status: 400 }
      );
    }
    
    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID required' },
        { status: 400 }
      );
    }
    
    console.log(`\n🚀 Executing cross-chain route ${pathId || 'inline'}`);
    console.log(`   Agent: ${agentId}`);
    
    // Execute the path
    const result = await crossChainRouter.executeOptimalPath(path, agentId);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error,
          txHashes: result.txHashes
        },
        { status: 500 }
      );
    }
    
    // Record the route in database
    await prisma.crossChainRoute.create({
      data: {
        fromChain: path.steps[0].chain,
        toChain: path.steps[path.steps.length - 1].chain,
        fromToken: path.steps[0].fromToken,
        toToken: path.steps[path.steps.length - 1].toToken,
        amountIn: path.steps[0].amountIn,
        totalCostUSD: path.totalCostUSD,
        totalGasUSD: path.totalGasUSD,
        estimatedSlippage: path.estimatedSlippage,
        executionTimeSeconds: path.executionTimeSeconds,
        confidenceScore: path.confidenceScore,
        riskLevel: path.riskLevel,
        savingsVsCEX: path.savingsVsCEX,
        steps: path.steps,
        agentId,
        userId,
        status: 'COMPLETED',
        txHashes: result.txHashes,
        completedAt: new Date(),
      },
    });
    
    console.log(`✅ Route execution complete`);
    console.log(`   Transactions: ${result.txHashes.length}`);
    
    return NextResponse.json({
      success: true,
      txHashes: result.txHashes,
      path,
    });
  } catch (error) {
    console.error('Error executing route:', error);
    return NextResponse.json(
      { error: 'Failed to execute route' },
      { status: 500 }
    );
  }
}
