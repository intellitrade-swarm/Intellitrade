
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/cross-chain/stats
 * 
 * Get cross-chain routing statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const agentId = searchParams.get('agentId');
    
    // Get execution statistics
    const executions = await prisma.crossChainExecution.findMany({
      where: agentId ? { agentId } : undefined,
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
    
    // Get route statistics
    const routes = await prisma.crossChainRoute.findMany({
      where: agentId ? { agentId } : userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    
    // Calculate aggregate stats
    const totalRoutes = routes.length;
    const totalExecutions = executions.length;
    const totalVolume = routes.reduce((sum, r) => sum + r.amountIn, 0);
    const totalSavings = routes.reduce((sum, r) => sum + (r.savingsVsCEX * r.amountIn / 100), 0);
    const totalGas = routes.reduce((sum, r) => sum + r.totalGasUSD, 0);
    const totalFees = routes.reduce((sum, r) => sum + r.totalCostUSD - r.totalGasUSD, 0);
    
    // Calculate average stats
    const avgSlippage = totalRoutes > 0
      ? routes.reduce((sum, r) => sum + r.estimatedSlippage, 0) / totalRoutes
      : 0;
    
    const avgExecutionTime = totalRoutes > 0
      ? routes.reduce((sum, r) => sum + r.executionTimeSeconds, 0) / totalRoutes
      : 0;
    
    const avgSavingsPercent = totalRoutes > 0
      ? routes.reduce((sum, r) => sum + r.savingsVsCEX, 0) / totalRoutes
      : 0;
    
    // Chain distribution
    const chainDistribution: Record<string, number> = {};
    routes.forEach(route => {
      chainDistribution[route.fromChain] = (chainDistribution[route.fromChain] || 0) + 1;
      if (route.fromChain !== route.toChain) {
        chainDistribution[route.toChain] = (chainDistribution[route.toChain] || 0) + 1;
      }
    });
    
    // Bridge usage
    const bridgeUsage: Record<string, number> = {};
    executions
      .filter(e => e.stepType === 'BRIDGE')
      .forEach(exec => {
        bridgeUsage[exec.protocol] = (bridgeUsage[exec.protocol] || 0) + 1;
      });
    
    // Recent routes
    const recentRoutes = routes.slice(0, 10).map(route => ({
      id: route.id,
      fromChain: route.fromChain,
      toChain: route.toChain,
      fromToken: route.fromToken,
      toToken: route.toToken,
      amountIn: route.amountIn,
      totalCost: route.totalCostUSD,
      savings: route.savingsVsCEX,
      status: route.status,
      createdAt: route.createdAt,
      completedAt: route.completedAt,
    }));
    
    return NextResponse.json({
      success: true,
      stats: {
        total: {
          routes: totalRoutes,
          executions: totalExecutions,
          volumeUSD: totalVolume,
          savingsUSD: totalSavings,
          gasUSD: totalGas,
          feesUSD: totalFees,
        },
        averages: {
          slippagePercent: avgSlippage,
          executionTimeSeconds: avgExecutionTime,
          savingsPercent: avgSavingsPercent,
        },
        distribution: {
          chains: chainDistribution,
          bridges: bridgeUsage,
        },
      },
      recentRoutes,
    });
  } catch (error) {
    console.error('Error getting cross-chain stats:', error);
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}
