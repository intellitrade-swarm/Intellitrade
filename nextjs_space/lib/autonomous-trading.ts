
/**
 * Fully Autonomous AI Trading Agent System (2025)
 * 
 * Architecture:
 * ┌────────────────────┐
 * │   AI Brain (LLM)   │ ← Grok, GPT-4o, Claude, Llama 3
 * └───────▲────────────┘
 *         │
 * ┌───────▼────────────┐
 * │   Decision Engine  │ ← Signal + Risk + Portfolio
 * └───────▲────────────┘
 *         │
 * ┌───────▼────────────┐
 * │   Tools Layer      │ ← Price, Swap, Balance, Tx
 * └───────▲────────────┘
 *         │
 * ┌───────▼────────────┐
 * │   Execution Engine │ ← Sign & Broadcast (EVM + Solana)
 * └───────▲────────────┘
 *         │
 * ┌───────▼────────────┐
 * │   Safety & Monitor │ ← Circuit Breaker, Alerts, Logs
 * └────────────────────┘
 */

import { AIProvider } from './ai-providers';
import { prisma } from './db';
import { getCurrentPrice, getTradingBalances } from './oneinch';
import { executeOneInchTrade, executeSolanaRealTrade } from './trading';
import { circuitBreaker } from './circuit-breaker';
import { sendTelegramAlert } from './alerts';
import { getSolBalance, getSolPrice } from './solana';
// Alchemy Enhanced Trading Features
import { 
  analyzeTrade, 
  getOptimalGasSettings,
  monitorAgentPerformance 
} from './alchemy-trading-enhancer';
import { getTokenPrice } from './alchemy-token-api';
import { getRecentTradingActivity } from './alchemy-transfers-api';
import { isAlchemyConfigured } from './alchemy-config';

// ============================================================================
// TOOLS LAYER - Price & Data Tools
// ============================================================================

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: Date;
}

/**
 * Get real-time price data for multiple tokens with Alchemy enhancement
 */
export async function getPriceData(symbols: string[]): Promise<PriceData[]> {
  const prices = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        let price = 0;
        
        // Try Alchemy Token API first for real-time pricing
        if (isAlchemyConfigured()) {
          try {
            // Map symbol to token address (would need proper mapping in production)
            const tokenAddress = getTokenAddressForSymbol(symbol);
            if (tokenAddress) {
              const alchemyPrice = await getTokenPrice('base', tokenAddress);
              if (alchemyPrice) {
                price = alchemyPrice.price;
                console.log(`[Alchemy Enhanced] Got price for ${symbol}: $${price}`);
              }
            }
          } catch (alchemyError) {
            console.log(`[Alchemy Enhanced] Fallback to standard price feed for ${symbol}`);
          }
        }
        
        // Fallback to standard price feed if Alchemy fails
        if (price === 0) {
          price = await getCurrentPrice(symbol);
        }
        
        return {
          symbol,
          price,
          change24h: 0, // TODO: Calculate from historical data
          volume24h: 0, // TODO: Use Alchemy Transfers API
          timestamp: new Date(),
        };
      } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
        return null;
      }
    })
  );

  return prices.filter((p): p is PriceData => p !== null);
}

/**
 * Helper function to map symbol to token address
 */
function getTokenAddressForSymbol(symbol: string): string | null {
  const tokenMap: Record<string, string> = {
    'ETH': '0x4200000000000000000000000000000000000006', // WETH on Base
    'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
    'WETH': '0x4200000000000000000000000000000000000006',
    // Add more mappings as needed
  };
  
  return tokenMap[symbol.toUpperCase()] || null;
}

/**
 * Get DEX price with route information
 */
export async function getDexPrice(
  chain: string,
  tokenIn: string,
  tokenOut: string,
  amount: number
): Promise<{ price: number; route: string[] }> {
  try {
    // Use 1inch for price quotes
    const price = await getCurrentPrice(tokenOut);
    return {
      price,
      route: ['1inch'], // Simplified - 1inch handles routing
    };
  } catch (error) {
    console.error('Error fetching DEX price:', error);
    throw error;
  }
}

// ============================================================================
// TOOLS LAYER - Portfolio & Balance Tools
// ============================================================================

export interface PortfolioBalance {
  native: number;
  usdc: number;
  totalUsd: number;
  nativeSymbol: string;
}

/**
 * Get agent's portfolio balances (supports both EVM and Solana)
 */
export async function getPortfolioBalance(
  chain: string,
  address: string
): Promise<PortfolioBalance> {
  try {
    // Handle Solana chain differently
    if (chain === 'solana') {
      const solBalance = await getSolBalance(address);
      const solPrice = await getSolPrice();
      const totalUsd = solBalance * solPrice;
      
      return {
        native: solBalance,
        usdc: 0, // TODO: Fetch USDC balance on Solana
        totalUsd,
        nativeSymbol: 'SOL'
      };
    }
    
    // Handle EVM chains (base, bsc, ethereum)
    const balances = await getTradingBalances(chain, address);
    return balances;
  } catch (error) {
    console.error('Error fetching portfolio balance:', error);
    return { native: 0, usdc: 0, totalUsd: 0, nativeSymbol: chain === 'solana' ? 'SOL' : 'ETH' };
  }
}

// ============================================================================
// DECISION ENGINE - Signal & Risk Assessment
// ============================================================================

export interface TradingSignal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 0-1
  reasoning: string;
  targetPrice: number;
  stopLoss: number;
  riskReward: number;
  quantity: number; // Position size as fraction of balance
}

export interface RiskAssessment {
  safe: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  warnings: string[];
  maxTradeSize: number; // Maximum USD to trade
}

/**
 * Assess trading risk before execution
 */
export async function assessTradingRisk(
  agentId: string,
  tradeAmount: number,
  currentBalance: number
): Promise<RiskAssessment> {
  const warnings: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

  // Check circuit breaker
  const cbCheck = await circuitBreaker.canTrade(agentId, tradeAmount, currentBalance);
  
  if (!cbCheck.allowed) {
    return {
      safe: false,
      riskLevel: cbCheck.severity,
      warnings: cbCheck.reasons,
      maxTradeSize: 0,
    };
  }

  // Additional risk checks
  const positionPercent = (tradeAmount / currentBalance) * 100;
  
  if (positionPercent > 20) {
    warnings.push(`Large position size: ${positionPercent.toFixed(1)}% of balance`);
    riskLevel = 'medium';
  }

  if (positionPercent > 30) {
    warnings.push(`Excessive position size: ${positionPercent.toFixed(1)}% of balance`);
    riskLevel = 'high';
  }

  // Check recent performance
  const recentTrades = await prisma.trade.findMany({
    where: {
      agentId,
      entryTime: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      status: 'CLOSED',
    },
    take: 10,
  });

  const recentLosses = recentTrades.filter(t => (t.profitLoss || 0) < 0).length;
  const lossRate = recentTrades.length > 0 ? recentLosses / recentTrades.length : 0;

  if (lossRate > 0.6) {
    warnings.push(`High recent loss rate: ${(lossRate * 100).toFixed(0)}%`);
    riskLevel = 'high';
  }

  // Calculate maximum safe trade size
  const maxTradeSize = Math.min(
    currentBalance * 0.2, // Max 20% of balance
    500 // Max $500 per trade
  );

  const isSafe = warnings.length === 0 && (riskLevel === 'low' || riskLevel === 'medium');

  return {
    safe: isSafe,
    riskLevel,
    warnings,
    maxTradeSize,
  };
}

/**
 * Check if agent should trade based on technical indicators (simplified)
 */
export async function shouldTrade(
  symbol: string,
  balance: number,
  openPositions: number
): Promise<{ shouldTrade: boolean; reason: string }> {
  // Simple checks - in production, use real technical indicators
  
  if (balance < 1) {
    return {
      shouldTrade: false,
      reason: 'Insufficient balance',
    };
  }

  if (openPositions >= 3) {
    return {
      shouldTrade: false,
      reason: 'Maximum open positions reached',
    };
  }

  try {
    const price = await getCurrentPrice(symbol);
    
    // Mock RSI - replace with real technical analysis
    const mockRSI = Math.random() * 100;
    
    if (mockRSI < 30) {
      return {
        shouldTrade: true,
        reason: `Oversold (RSI: ${mockRSI.toFixed(0)})`,
      };
    }

    if (mockRSI > 70) {
      return {
        shouldTrade: true,
        reason: `Overbought (RSI: ${mockRSI.toFixed(0)})`,
      };
    }

    return {
      shouldTrade: false,
      reason: `Neutral market conditions (RSI: ${mockRSI.toFixed(0)})`,
    };
  } catch (error) {
    return {
      shouldTrade: false,
      reason: 'Unable to fetch market data',
    };
  }
}

// ============================================================================
// AUTONOMOUS TRADING ENGINE
// ============================================================================

export interface AutonomousTradeResult {
  agentId: string;
  agentName: string;
  success: boolean;
  action?: 'BUY' | 'SELL' | 'HOLD';
  symbol?: string;
  amount?: number;
  txHash?: string;
  reason: string;
  riskAssessment?: RiskAssessment;
  timestamp: Date;
}

/**
 * Execute one autonomous trading cycle for a single agent
 */
export async function executeAutonomousTrade(agentId: string): Promise<AutonomousTradeResult> {
  const timestamp = new Date();
  
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🤖 AUTONOMOUS TRADE CYCLE - ${timestamp.toISOString()}`);
    console.log(`${'='.repeat(60)}`);

    // Get agent data
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
      include: {
        trades: {
          where: { status: 'OPEN' },
          take: 10,
        },
      },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    console.log(`\n📊 Agent: ${agent.name}`);
    console.log(`   Strategy: ${agent.strategyType}`);
    console.log(`   AI: ${agent.aiProvider}`);
    console.log(`   Balance: $${agent.realBalance.toFixed(2)}`);
    console.log(`   Open Positions: ${agent.trades.length}`);

    // Determine chain and wallet to use
    const chain = agent.primaryChain || 'base';
    const isSolana = chain === 'solana';
    
    // Check wallet configuration based on chain
    if (isSolana) {
      if (!agent.solanaWalletAddress || !agent.solanaPrivateKey) {
        return {
          agentId,
          agentName: agent.name,
          success: false,
          reason: 'Solana wallet not configured',
          timestamp,
        };
      }
    } else {
      if (!agent.walletAddress || !agent.encryptedPrivateKey) {
        return {
          agentId,
          agentName: agent.name,
          success: false,
          reason: 'EVM wallet not configured',
          timestamp,
        };
      }
    }

    // Get on-chain balance
    const walletAddress = isSolana ? agent.solanaWalletAddress! : agent.walletAddress!;
    const balances = await getPortfolioBalance(chain, walletAddress);

    console.log(`\n💰 On-Chain Balance:`, {
      native: `${balances.native.toFixed(4)} ${balances.nativeSymbol}`,
      usdc: `$${balances.usdc.toFixed(2)}`,
      total: `$${balances.totalUsd.toFixed(2)}`,
    });

    // Check minimum balance
    if (balances.totalUsd < 1) {
      const alert = `⚠️ ${agent.name} has insufficient balance: $${balances.totalUsd.toFixed(2)}. ${isSolana ? 'Solana' : 'EVM'} Wallet (${chain}): ${walletAddress}`;
      console.log(alert);
      await sendTelegramAlert(alert);
      
      return {
        agentId,
        agentName: agent.name,
        success: false,
        reason: `Insufficient balance: $${balances.totalUsd.toFixed(2)}. Fund ${isSolana ? 'Solana' : 'EVM'} wallet on ${chain}: ${walletAddress}`,
        timestamp,
      };
    }

    // Use existing AI trading engine for market analysis
    const { analyzeMarket, generateTradingSignal } = await import('./ai-trading-engine');
    
    console.log(`\n🧠 Analyzing market with ${agent.aiProvider}...`);
    const marketAnalysis = await analyzeMarket(agent.aiProvider as AIProvider);
    
    console.log(`\n📈 Market Analysis:`, {
      sentiment: marketAnalysis.marketSentiment,
      volatility: marketAnalysis.volatility,
      opportunities: marketAnalysis.topOpportunities.length,
    });

    // Generate trading signal
    console.log(`\n🎯 Generating trading signal for ${agent.name}...`);
    const signal = await generateTradingSignal(agent, marketAnalysis);

    console.log(`\n📊 Trading Signal:`, {
      action: signal.action,
      symbol: signal.symbol,
      confidence: `${(signal.confidence * 100).toFixed(0)}%`,
      reasoning: signal.reasoning.substring(0, 100) + '...',
    });

    // Check if should hold
    if (signal.action === 'HOLD' || signal.confidence < 0.65) {
      console.log(`\n⏸️  HOLD decision - ${signal.reasoning}`);
      return {
        agentId,
        agentName: agent.name,
        success: false,
        action: 'HOLD',
        reason: signal.reasoning,
        timestamp,
      };
    }

    // Calculate trade amount with intelligent position sizing
    let calculatedTradeAmount = Math.min(
      balances.totalUsd * 0.2, // Max 20% of balance
      balances.totalUsd * signal.quantity // AI suggested quantity
    );
    
    // SMART MINIMUM HANDLING: Ensure minimum $1 trade while respecting risk limits
    // If calculated amount is below $1, adjust to $1 if it's within risk tolerance
    const MIN_TRADE_AMOUNT = 1;
    const MAX_POSITION_PERCENT = 20; // Max 20% of balance per trade
    
    if (calculatedTradeAmount < MIN_TRADE_AMOUNT) {
      const minTradePercent = (MIN_TRADE_AMOUNT / balances.totalUsd) * 100;
      
      if (minTradePercent <= MAX_POSITION_PERCENT && balances.totalUsd >= 5) {
        // Agent has enough balance and $1 is within risk limits
        console.log(`\n📊 Position sizing adjustment:`);
        console.log(`   Original: $${calculatedTradeAmount.toFixed(2)} (${(signal.quantity * 100).toFixed(1)}% of balance)`);
        console.log(`   Adjusted: $${MIN_TRADE_AMOUNT.toFixed(2)} (${minTradePercent.toFixed(1)}% of balance)`);
        console.log(`   Reason: Enforcing $1 minimum trade amount`);
        
        calculatedTradeAmount = MIN_TRADE_AMOUNT;
      } else {
        // Balance too low to meet minimum safely
        return {
          agentId,
          agentName: agent.name,
          success: false,
          reason: `Insufficient balance for minimum trade. Need at least $5 to trade $1 safely. Current balance: $${balances.totalUsd.toFixed(2)}. Fund ${isSolana ? 'Solana' : 'EVM'} wallet on ${chain}: ${walletAddress}`,
          timestamp,
        };
      }
    }

    // Risk assessment with adjusted amount
    console.log(`\n🛡️  Assessing trade risk...`);
    const riskAssessment = await assessTradingRisk(agentId, calculatedTradeAmount, balances.totalUsd);

    console.log(`   Risk Level: ${riskAssessment.riskLevel}`);
    console.log(`   Safe: ${riskAssessment.safe ? 'Yes' : 'No'}`);
    if (riskAssessment.warnings.length > 0) {
      console.log(`   Warnings:`);
      riskAssessment.warnings.forEach(w => console.log(`     - ${w}`));
    }

    if (!riskAssessment.safe) {
      const alert = `🚫 ${agent.name} trade blocked by risk assessment. Warnings: ${riskAssessment.warnings.join(', ')}`;
      console.log(alert);
      await sendTelegramAlert(alert);
      
      return {
        agentId,
        agentName: agent.name,
        success: false,
        reason: `Trade blocked: ${riskAssessment.warnings.join(', ')}`,
        riskAssessment,
        timestamp,
      };
    }

    // Final trade amount (respecting risk assessment limits)
    const tradeAmount = Math.min(calculatedTradeAmount, riskAssessment.maxTradeSize);
    
    // Final validation: This should rarely trigger now due to the logic above
    if (tradeAmount < MIN_TRADE_AMOUNT) {
      return {
        agentId,
        agentName: agent.name,
        success: false,
        reason: `Trade amount ($${tradeAmount.toFixed(2)}) below minimum ($${MIN_TRADE_AMOUNT}). Balance: $${balances.totalUsd.toFixed(2)}. Fund wallet: ${agent.walletAddress}`,
        timestamp,
      };
    }

    console.log(`\n🚀 EXECUTING TRADE:`, {
      agent: agent.name,
      action: signal.action,
      symbol: signal.symbol,
      amount: `$${tradeAmount.toFixed(2)}`,
      confidence: `${(signal.confidence * 100).toFixed(0)}%`,
      chain,
    });

    // Get current price (use appropriate method for chain)
    let currentPrice: number;
    if (isSolana) {
      // For Solana tokens, use appropriate price source
      if (signal.symbol === 'SOL') {
        currentPrice = await getSolPrice();
      } else {
        // For other Solana tokens, use Jupiter price API or fallback
        currentPrice = await getCurrentPrice(signal.symbol);
      }
    } else {
      currentPrice = await getCurrentPrice(signal.symbol);
    }

    // Execute trade based on chain
    let tradeResult;
    if (isSolana) {
      // Execute on Solana via Jupiter
      tradeResult = await executeSolanaRealTrade(
        agent,
        signal.symbol,
        signal.action,
        tradeAmount,
        currentPrice
      );
    } else {
      // Execute on EVM via 1inch
      tradeResult = await executeOneInchTrade(
        agent,
        signal.symbol,
        signal.action,
        tradeAmount,
        currentPrice,
        1
      );
    }

    if (tradeResult.success) {
      console.log(`\n✅ TRADE SUCCESSFUL!`, {
        txHash: tradeResult.txHash,
        amount: `$${tradeAmount.toFixed(2)}`,
      });

      // Update agent stats
      await prisma.aIAgent.update({
        where: { id: agent.id },
        data: {
          totalTrades: { increment: 1 },
        },
      });

      // Send success alert
      await sendTelegramAlert(
        `✅ ${agent.name} executed ${signal.action} on ${signal.symbol}\n` +
        `Amount: $${tradeAmount.toFixed(2)}\n` +
        `Confidence: ${(signal.confidence * 100).toFixed(0)}%\n` +
        `TX: ${tradeResult.txHash}`
      );

      return {
        agentId,
        agentName: agent.name,
        success: true,
        action: signal.action,
        symbol: signal.symbol,
        amount: tradeAmount,
        txHash: tradeResult.txHash,
        reason: 'Trade executed successfully',
        riskAssessment,
        timestamp,
      };
    } else {
      console.error(`\n❌ TRADE FAILED:`, tradeResult.error);
      
      await sendTelegramAlert(
        `❌ ${agent.name} trade failed\n` +
        `Symbol: ${signal.symbol}\n` +
        `Error: ${tradeResult.error}`
      );

      return {
        agentId,
        agentName: agent.name,
        success: false,
        reason: `Trade execution failed: ${tradeResult.error}`,
        timestamp,
      };
    }

  } catch (error) {
    console.error(`\n❌ ERROR in autonomous trade:`, error);
    
    return {
      agentId,
      agentName: 'Unknown',
      success: false,
      reason: error instanceof Error ? error.message : 'Unknown error',
      timestamp,
    };
  }
}

/**
 * Run autonomous trading cycle for all agents
 */
export async function runAutonomousTradingCycle(): Promise<AutonomousTradeResult[]> {
  console.log('\n' + '='.repeat(70));
  console.log('🤖 STARTING AUTONOMOUS TRADING CYCLE FOR ALL AGENTS');
  console.log('='.repeat(70));

  try {
    // Get all active agents with real balance
    const agents = await prisma.aIAgent.findMany({
      where: {
        isActive: true,
        realBalance: { gt: 0 },
      },
      orderBy: {
        realBalance: 'desc',
      },
    });

    console.log(`\n📊 Found ${agents.length} active agents with balance`);

    if (agents.length === 0) {
      console.log('⚠️  No agents ready for trading');
      return [];
    }

    const results: AutonomousTradeResult[] = [];

    // Execute trades for each agent
    for (const agent of agents) {
      try {
        const result = await executeAutonomousTrade(agent.id);
        results.push(result);

        // Add delay between trades to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error(`Error trading for ${agent.name}:`, error);
        results.push({
          agentId: agent.id,
          agentName: agent.name,
          success: false,
          reason: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
        });
      }
    }

    // Summary
    const successCount = results.filter(r => r.success).length;
    const holdCount = results.filter(r => r.action === 'HOLD').length;
    const errorCount = results.filter(r => !r.success && r.action !== 'HOLD').length;

    console.log('\n' + '='.repeat(70));
    console.log('📊 TRADING CYCLE SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total Agents: ${results.length}`);
    console.log(`✅ Successful Trades: ${successCount}`);
    console.log(`⏸️  Hold Decisions: ${holdCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('='.repeat(70) + '\n');

    // Send summary alert
    if (successCount > 0 || errorCount > 0) {
      await sendTelegramAlert(
        `📊 Trading Cycle Complete\n` +
        `Agents: ${results.length}\n` +
        `Trades: ${successCount}\n` +
        `Holds: ${holdCount}\n` +
        `Errors: ${errorCount}`
      );
    }

    return results;

  } catch (error) {
    console.error('Error in autonomous trading cycle:', error);
    throw error;
  }
}

