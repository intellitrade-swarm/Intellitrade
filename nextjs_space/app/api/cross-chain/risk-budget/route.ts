
import { NextRequest, NextResponse } from 'next/server';
import { crossChainRouter, RiskLevel, DEFAULT_RISK_BUDGETS } from '@/lib/cross-chain-router';

/**
 * GET /api/cross-chain/risk-budget?userId=xxx
 * 
 * Get risk budget for a user/agent
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }
    
    const budget = await crossChainRouter.getRiskBudget(userId);
    
    return NextResponse.json({
      success: true,
      budget,
      availableRiskLevels: Object.keys(RiskLevel),
      defaultBudgets: DEFAULT_RISK_BUDGETS,
    });
  } catch (error) {
    console.error('Error getting risk budget:', error);
    return NextResponse.json(
      { error: 'Failed to get risk budget' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cross-chain/risk-budget
 * 
 * Set risk budget for a user/agent
 * 
 * Body:
 * {
 *   userId: string,
 *   riskLevel?: string,
 *   maxSlippagePercent?: number,
 *   maxGasUSD?: number,
 *   maxExecutionTimeSeconds?: number,
 *   allowedChains?: string[],
 *   allowedBridges?: string[],
 *   minLiquidityUSD?: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...budgetParams } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }
    
    // Validate risk level if provided
    if (budgetParams.riskLevel && !Object.values(RiskLevel).includes(budgetParams.riskLevel)) {
      return NextResponse.json(
        { error: 'Invalid risk level' },
        { status: 400 }
      );
    }
    
    console.log(`\n📊 Setting risk budget for ${userId}`);
    console.log(`   Risk Level: ${budgetParams.riskLevel || 'MODERATE'}`);
    
    const budget = await crossChainRouter.setRiskBudget(userId, budgetParams);
    
    console.log(`✅ Risk budget updated`);
    console.log(`   Max Slippage: ${budget.maxSlippagePercent}%`);
    console.log(`   Max Gas: $${budget.maxGasUSD}`);
    console.log(`   Allowed Chains: ${budget.allowedChains.length}`);
    
    return NextResponse.json({
      success: true,
      budget,
    });
  } catch (error) {
    console.error('Error setting risk budget:', error);
    return NextResponse.json(
      { error: 'Failed to set risk budget' },
      { status: 500 }
    );
  }
}
