
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { getAITradingDecision } from '../../../../lib/openai';
import { executeRealTrade, executeAsterDexTrade, getAsterDexBalance } from '../../../../lib/trading';
import { getBalance } from '../../../../lib/blockchain';
import { ChainName } from '../../../../lib/blockchain-config';
import { isConfigured as isAsterDexConfigured } from '../../../../lib/aster-dex';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId } = await request.json();

    // Get agent data
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
      include: {
        trades: {
          where: { status: 'OPEN' },
          take: 5
        }
      }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Check if agent can do real trades
    const hasWallet = !!(agent.walletAddress && agent.encryptedPrivateKey);
    const hasRealBalance = agent.realBalance > 0;
    const canTradeReal = hasWallet && hasRealBalance;
    
    // Check for Avantis DEX availability (Base network)
    const hasAvantisDex = isAsterDexConfigured();
    let avantisDexBalance = 0;

    // Update balances from Avantis DEX
    if (hasAvantisDex && agent.walletAddress) {
      try {
        const balances = await getAsterDexBalance(agent.walletAddress);
        avantisDexBalance = balances.totalUsd;
        console.log(`Avantis DEX balances: ETH=${balances.eth.toFixed(4)}, USDC=$${balances.usdc.toFixed(2)}, Total=$${avantisDexBalance.toFixed(2)}`);
      } catch (error) {
        console.error('Error getting Avantis DEX balance:', error);
      }
    }

    // Update real balance from blockchain if wallet exists
    if (hasWallet && agent.walletAddress) {
      try {
        const chain = (agent.primaryChain || 'base') as ChainName;
        const nativeBalance = await getBalance(chain, agent.walletAddress);
        const balanceFloat = parseFloat(nativeBalance);
        
        // Get ETH price for USD value
        const ethPrice = 2500; // Simplified - in production, fetch from oracle
        const usdValue = balanceFloat * ethPrice;
        
        // Update agent's real balance in database
        await prisma.aIAgent.update({
          where: { id: agent.id },
          data: { realBalance: usdValue }
        });
        
        agent.realBalance = usdValue;
      } catch (error) {
        console.error('Error updating real balance:', error);
      }
    }

    // Get current market data
    const marketData = await prisma.marketData.findMany({
      orderBy: { timestamp: 'desc' },
      take: 6,
      distinct: ['symbol']
    });

    // Get AI trading decision
    const decision = await getAITradingDecision(
      {
        name: agent.name,
        strategyType: agent.strategyType,
        personality: agent.personality,
        parameters: agent.parameters,
        currentBalance: canTradeReal ? agent.realBalance : agent.currentBalance,
        winRate: agent.winRate,
        sharpeRatio: agent.sharpeRatio
      },
      marketData.map(m => ({
        symbol: m.symbol,
        price: m.price,
        priceChange: m.priceChange,
        volume: m.volume
      }))
    );

    // Execute the trade if action is not HOLD
    let trade = null;
    let tradeMode = 'simulated';
    
    if (decision.action !== 'HOLD' && decision.symbol) {
      const marketPrice = marketData.find(m => m.symbol === decision.symbol)?.price;
      
      if (marketPrice && decision.quantity > 0) {
        // Determine trading balance and mode
        const maxTradePercent = 0.2; // Max 20% per trade
        
        // Priority 1: Aster Dex (if configured and has balance)
        if (hasAvantisDex && avantisDexBalance > 10) { // Minimum $10 for Aster Dex
          const tradeAmount = avantisDexBalance * Math.min(decision.quantity, maxTradePercent);
          
          if (tradeAmount > 1) { // Minimum $1 trade
            try {
              tradeMode = 'aster-dex';
              console.log(`Attempting Aster Dex trade: ${decision.action} ${decision.symbol} for $${tradeAmount.toFixed(2)}`);
              
              const asterTradeResult = await executeAsterDexTrade(
                agent,
                decision.symbol,
                decision.action,
                tradeAmount,
                marketPrice
              );

              if (asterTradeResult.success) {
                trade = asterTradeResult.trade;
                
                await prisma.aIAgent.update({
                  where: { id: agent.id },
                  data: {
                    totalTrades: { increment: 1 }
                  }
                });
                
                console.log(`Aster Dex trade successful: ${asterTradeResult.txHash}`);
              } else {
                console.error('Aster Dex trade failed:', asterTradeResult.error);
                throw new Error(asterTradeResult.error || 'Aster Dex trade failed');
              }
            } catch (asterError) {
              console.error('Aster Dex trade error:', asterError);
              tradeMode = 'aster-dex-failed';
              // Continue to try other methods
            }
          }
        }
        
        // Priority 2: On-chain DEX (if Aster Dex not available or failed)
        if (!trade && canTradeReal && agent.realBalance > 0) {
          const tradeAmount = agent.realBalance * Math.min(decision.quantity, maxTradePercent);
          
          if (tradeAmount > 1) { // Minimum $1 trade
            try {
              tradeMode = 'on-chain';
              console.log(`Attempting on-chain DEX trade: ${decision.action} ${decision.symbol} for $${tradeAmount.toFixed(2)}`);
              
              const realTradeResult = await executeRealTrade(
                agent,
                decision.symbol,
                decision.action,
                tradeAmount,
                marketPrice
              );

              if (realTradeResult.success) {
                trade = realTradeResult.trade;
                
                // Update agent's real balance
                const newBalance = await getBalance(
                  (agent.primaryChain || 'base') as ChainName,
                  agent.walletAddress!
                );
                const ethPrice = 2500;
                const newUsdValue = parseFloat(newBalance) * ethPrice;
                
                await prisma.aIAgent.update({
                  where: { id: agent.id },
                  data: {
                    totalTrades: { increment: 1 },
                    realBalance: newUsdValue
                  }
                });
                
                console.log(`On-chain trade successful: ${realTradeResult.txHash}`);
              } else {
                console.error('On-chain trade failed:', realTradeResult.error);
                throw new Error(realTradeResult.error || 'On-chain trade failed');
              }
            } catch (realTradeError) {
              console.error('On-chain trade error:', realTradeError);
              tradeMode = 'on-chain-failed';
              // Continue to simulated trade
            }
          }
        }

        // Priority 3: Simulated trade (if no real trading available or all failed)
        if (!trade) {
          const tradingBalance = agent.currentBalance;
          const tradeAmount = tradingBalance * Math.min(decision.quantity, maxTradePercent);
          const quantity = tradeAmount / marketPrice;
          
          tradeMode = trade === null && tradeMode.includes('failed') ? 'simulated_fallback' : 'simulated';
          
          trade = await prisma.trade.create({
            data: {
              agentId: agent.id,
              symbol: decision.symbol,
              type: 'SPOT',
              side: decision.action === 'BUY' ? 'BUY' : 'SELL',
              quantity,
              entryPrice: marketPrice,
              strategy: agent.strategyType,
              confidence: decision.confidence,
              status: 'OPEN',
              isRealTrade: false
            }
          });

          // Update simulated balance
          await prisma.aIAgent.update({
            where: { id: agent.id },
            data: {
              totalTrades: { increment: 1 },
              currentBalance: decision.action === 'BUY' 
                ? agent.currentBalance - tradeAmount 
                : agent.currentBalance + tradeAmount
            }
          });
          
          console.log(`Simulated trade created: ${decision.action} ${decision.symbol}`);
        }
      }
    }

    return NextResponse.json({
      decision,
      trade,
      tradeMode,
      agent: {
        id: agent.id,
        name: agent.name,
        strategyType: agent.strategyType,
        hasWallet,
        realBalance: agent.realBalance,
        canTradeReal,
        hasAvantisDex,
        avantisDexBalance
      }
    });

  } catch (error) {
    console.error('Error getting AI trading decision:', error);
    return NextResponse.json(
      { error: 'Failed to get AI trading decision', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
