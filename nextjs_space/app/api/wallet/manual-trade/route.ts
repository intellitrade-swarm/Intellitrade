
/**
 * API endpoint for manual trading execution
 * Executes trades via 1inch DEX Aggregator (On-Chain Trading)
 * Flow: USD → Token Amount → Execute Swap
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { executeCryptoTrade, assessTradeRisk } from '@/lib/trading-flow';
import { getSecurityConfig, validateTradeSecurity } from '@/lib/security-config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, symbol, action, amount, usdAmount, chain = 'base' } = body;

    // Support both 'amount' and 'usdAmount' parameters
    const tradeAmount = usdAmount || amount;

    // Validate inputs
    if (!agentId || !symbol || !action || !tradeAmount) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: agentId, symbol, action, and amount/usdAmount are required'
      }, { status: 400 });
    }

    if (action !== 'BUY' && action !== 'SELL') {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Must be BUY or SELL'
      }, { status: 400 });
    }

    const parsedAmount = parseFloat(tradeAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid amount - must be a positive number'
      }, { status: 400 });
    }

    // Get agent
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
      include: {
        trades: {
          where: { status: 'OPEN' }
        }
      }
    });

    if (!agent) {
      return NextResponse.json({
        success: false,
        error: 'Agent not found'
      }, { status: 404 });
    }

    // Check if agent has wallet configured
    if (!agent.walletAddress || !agent.encryptedPrivateKey) {
      return NextResponse.json({
        success: false,
        error: 'Agent wallet not configured. Please set up wallet first.'
      }, { status: 400 });
    }

    // Risk assessment
    const riskCheck = assessTradeRisk(
      agent.realBalance,
      parsedAmount,
      agent.trades.length
    );

    if (!riskCheck.safe) {
      console.warn(`⚠️ Trade risk warnings for ${agent.name}:`, riskCheck.warnings);
      return NextResponse.json({
        success: false,
        error: 'Trade risk assessment failed',
        warnings: riskCheck.warnings
      }, { status: 400 });
    }

    // Security validation
    const securityConfig = getSecurityConfig();
    const securityCheck = validateTradeSecurity(
      parsedAmount,
      20e9, // 20 gwei estimate
      securityConfig.slippage.maxBasisPoints / 10000
    );

    if (!securityCheck.valid) {
      console.error(`❌ Security validation failed:`, securityCheck.violations);
      return NextResponse.json({
        success: false,
        error: 'Security validation failed',
        violations: securityCheck.violations
      }, { status: 400 });
    }

    console.log(`🚀 Executing ${action} trade via new trading flow:`, {
      agent: agent.name,
      symbol,
      action,
      usdAmount: `$${parsedAmount.toFixed(2)}`,
      chain
    });

    // Execute trade using new USD → Token → Swap flow
    const result = await executeCryptoTrade(
      {
        agentId: agent.id,
        symbol,
        action,
        usdAmount: parsedAmount,
        chain: chain as any
      },
      {
        address: agent.walletAddress,
        encryptedPrivateKey: agent.encryptedPrivateKey
      },
      {
        chain: chain as any,
        maxSlippage: securityConfig.slippage.maxBasisPoints / 100,
        useFlashbotsProtect: securityConfig.mevProtection.enabled && chain === 'ethereum',
        dynamicGas: securityConfig.gas.strategy === 'dynamic'
      }
    );

    if (result.success) {
      // Update agent stats
      await prisma.aIAgent.update({
        where: { id: agent.id },
        data: {
          totalTrades: { increment: 1 }
        }
      });

      return NextResponse.json({
        success: true,
        txHash: result.txHash,
        message: `Successfully executed ${action} trade for ${result.tokenAmount?.toFixed(8)} ${symbol}`,
        details: {
          symbol,
          side: action,
          usdAmount: `$${parsedAmount.toFixed(2)}`,
          tokenAmount: result.tokenAmount?.toFixed(8),
          executionPrice: `$${result.executionPrice?.toFixed(2)}`,
          txHash: result.txHash,
          chain,
          gasUsed: result.gasUsed,
          tradingFlow: 'USD → Token → Swap'
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Trade execution failed'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in manual trade:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
