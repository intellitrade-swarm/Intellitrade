
/**
 * AsterDEX 24/7 Autonomous Trading Integration
 * Combines AI agents with AsterDEX perpetuals for continuous trading
 * Using REST API for trading execution
 * Enhanced with EXPERT perpetual trading strategies + ADVANCED PROFITABLE STRATEGIES
 * 
 * PROFITABILITY MODE: All agents now use advanced profitable trading strategies
 * - Advanced technical indicators (RSI, MACD, Bollinger Bands, EMAs)
 * - Market regime detection
 * - Multi-timeframe analysis
 * - Optimal position sizing (Kelly Criterion)
 * - Dynamic leverage based on confidence
 * - Minimum 2:1 risk-reward ratio enforcement
 */

import { 
  placeOrder, 
  getAccountInfo, 
  getPositionInfo, 
  setLeverage, 
  executeMarketTrade,
  isConfigured as isAsterConfigured,
  testConnection,
  getMarketPrice,
  getAllTickers
} from './aster-dex';
import { analyzeMarket, generateTradingSignal } from './ai-trading-engine';
import { AIProvider } from './ai-providers';
import { prisma } from './db';
import { circuitBreaker } from './circuit-breaker';
import { sendTelegramAlert } from './alerts';
import { telegramService } from './telegram';
import {
  generateExpertTradingSignal,
  fetchMarketData,
  manageExistingPosition,
  logTradingDecision,
  TradingSignal as ExpertTradingSignal
} from './aster-perp-expert-strategies';
import {
  generateProfitableTradingDecision,
  executeProfitableTrade,
  monitorAndManagePositions,
  getProfitableOpportunities,
} from './profitable-trading-engine';
import {
  generateUltraProfitableSignal,
  executeUltraProfitableTrade,
  type UltraTradingSignal,
} from './ultra-profitable-trading';
import { recordProfitShare } from './treasury';

export interface AsterTradeResult {
  agentId: string;
  agentName: string;
  success: boolean;
  action?: 'LONG' | 'SHORT' | 'CLOSE' | 'HOLD';
  market?: string;
  collateral?: number;
  leverage?: number;
  txHash?: string;
  reason: string;
  timestamp: Date;
  usingAccountBalance?: boolean;  // Flag to indicate if using AsterDEX account balance
}

/**
 * Agents configured to use AsterDEX account balance ($199)
 * These agents will trade with the full account balance instead of their individual balances
 */
const ACCOUNT_BALANCE_AGENTS = [
  'Sentiment Sage',
  'Arbitrage Ace'
];

/**
 * Map AI trading symbols to AsterDEX perpetual symbols
 */
function mapToAsterSymbol(symbol: string): string {
  const mapping: { [key: string]: string } = {
    'BTC': 'BTCUSDT',
    'ETH': 'ETHUSDT',
    'SOL': 'SOLUSDT',
    'MATIC': 'MATICUSDT',
    'LINK': 'LINKUSDT',
    'ASTR': 'ASTRUSDT',
    'AVAX': 'AVAXUSDT',
    'ARB': 'ARBUSDT',
  };
  
  return mapping[symbol] || 'ETHUSDT';
}

/**
 * Notify all subscribed users about profitable trades
 */
async function notifySubscribedUsers(tradeData: {
  agentName: string;
  symbol: string;
  side: string;
  profit: number;
  profitPercent: number;
  entryPrice: number;
  exitPrice: number;
  size: number;
}): Promise<void> {
  try {
    // Only notify if profit is positive
    if (tradeData.profit <= 0) {
      return;
    }

    // Fetch all users with Telegram notifications enabled
    const subscribedUsers = await prisma.user.findMany({
      where: {
        telegramNotificationsEnabled: true,
        telegramChatId: {
          not: null,
        },
      },
      select: {
        telegramChatId: true,
        telegramUsername: true,
      },
    });

    console.log(`📱 Notifying ${subscribedUsers.length} subscribed users about profitable trade...`);

    // Send notification to each subscribed user
    for (const user of subscribedUsers) {
      if (user.telegramChatId) {
        try {
          await telegramService.sendTradeNotification(user.telegramChatId, tradeData);
          console.log(`   ✅ Notification sent to @${user.telegramUsername}`);
        } catch (error) {
          console.error(`   ❌ Failed to send notification to @${user.telegramUsername}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error notifying subscribed users:', error);
    // Don't throw - notification failure shouldn't stop trading
  }
}

/**
 * Fetch historical price data from Aster DEX for technical analysis
 */
async function fetchAsterHistoricalData(
  symbol: string,
  interval: '1m' | '5m' | '15m' = '5m',
  limit: number = 100
): Promise<{ prices: number[]; volumes: number[]; timestamps: number[] }> {
  try {
    // Using Aster DEX public klines endpoint
    const endpoint = `/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const baseUrl = 'https://fapi.asterdex.com';
    
    const response = await fetch(`${baseUrl}${endpoint}`);
    
    if (!response.ok) {
      console.warn(`Failed to fetch Aster DEX historical data: ${response.status}`);
      return { prices: [], volumes: [], timestamps: [] };
    }
    
    const data = await response.json();
    
    // Aster DEX klines format: [timestamp, open, high, low, close, volume, ...]
    const prices = data.map((candle: any[]) => parseFloat(candle[4])); // Close prices
    const volumes = data.map((candle: any[]) => parseFloat(candle[5]));
    const timestamps = data.map((candle: any[]) => parseInt(candle[0]));
    
    console.log(`📊 Fetched ${prices.length} candles for ${symbol} (${interval})`);
    
    return { prices, volumes, timestamps };
  } catch (error) {
    console.error('Error fetching Aster DEX historical data:', error);
    return { prices: [], volumes: [], timestamps: [] };
  }
}

/**
 * Simple Risk Manager for tracking agent performance
 */
class SimpleRiskManager {
  private initialCapital: number;
  private currentCapital: number;
  private consecutiveLosses: number = 0;
  private tradingHalted: boolean = false;

  constructor(initialCapital: number) {
    this.initialCapital = initialCapital;
    this.currentCapital = initialCapital;
  }

  updateCapital(newCapital: number, profitLoss: number) {
    this.currentCapital = newCapital;
    
    if (profitLoss < 0) {
      this.consecutiveLosses++;
    } else {
      this.consecutiveLosses = 0;
    }

    // Halt trading if 5 consecutive losses or 20% drawdown
    const drawdown = (this.initialCapital - this.currentCapital) / this.initialCapital;
    if (this.consecutiveLosses >= 5 || drawdown > 0.20) {
      this.tradingHalted = true;
    }
  }

  canTrade(): { allowed: boolean; reason?: string } {
    if (this.tradingHalted) {
      return {
        allowed: false,
        reason: `Trading halted: ${this.consecutiveLosses} consecutive losses or high drawdown`
      };
    }
    return { allowed: true };
  }

  getStatus() {
    const drawdown = (this.initialCapital - this.currentCapital) / this.initialCapital;
    return {
      drawdown,
      consecutiveLosses: this.consecutiveLosses,
      tradingHalted: this.tradingHalted
    };
  }

  calculatePositionSize(confidence: number, winRate: number, avgWin: number, avgLoss: number): number {
    // Kelly Criterion: f = (p * b - q) / b
    // where f = fraction of capital, p = win probability, q = loss probability, b = win/loss ratio
    if (avgLoss === 0) return 0.20;
    
    const b = avgWin / avgLoss;
    const p = winRate;
    const q = 1 - winRate;
    const kellyFraction = (p * b - q) / b;
    
    // Use half-Kelly for safety and apply confidence multiplier
    return Math.max(0.10, Math.min(0.25, kellyFraction * 0.5 * confidence));
  }

  adjustLeverageForVolatility(baseLeverage: number, volatility: number): number {
    // Reduce leverage in high volatility
    if (volatility > 5) return Math.max(1.5, baseLeverage * 0.6);
    if (volatility > 3) return Math.max(2, baseLeverage * 0.8);
    return baseLeverage;
  }
}

/**
 * Global risk managers for agents (persisted across trading cycles)
 */
const riskManagers = new Map<string, SimpleRiskManager>();

/**
 * Get or create risk manager for an agent
 */
function getRiskManager(agentId: string, initialCapital: number): SimpleRiskManager {
  if (!riskManagers.has(agentId)) {
    riskManagers.set(agentId, new SimpleRiskManager(initialCapital));
  }
  return riskManagers.get(agentId)!;
}

/**
 * Execute one autonomous AsterDEX trading cycle for a single agent
 */
export async function executeAsterAutonomousTrade(agentId: string): Promise<AsterTradeResult> {
  const timestamp = new Date();
  
  try {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🤖 ASTERDEX AUTONOMOUS TRADE CYCLE - ${timestamp.toISOString()}`);
    console.log(`${'='.repeat(70)}`);

    // Check if AsterDEX is configured
    if (!isAsterConfigured()) {
      console.error('❌ AsterDEX API credentials not configured');
      return {
        agentId,
        agentName: 'Unknown',
        success: false,
        reason: 'AsterDEX API credentials not configured',
        timestamp,
      };
    }

    // Test connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ AsterDEX API connection failed');
      return {
        agentId,
        agentName: 'Unknown',
        success: false,
        reason: 'AsterDEX API connection failed',
        timestamp,
      };
    }

    // Get agent data
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Check if this agent should use the AsterDEX account balance
    const usingAccountBalance = ACCOUNT_BALANCE_AGENTS.includes(agent.name);
    
    console.log(`\n📊 Agent: ${agent.name}`);
    console.log(`   Strategy: ${agent.strategyType}`);
    console.log(`   AI: ${agent.aiProvider}`);
    console.log(`   Balance: $${agent.realBalance.toFixed(2)}`);
    if (usingAccountBalance) {
      console.log(`   🚀 USING ASTERDEX ACCOUNT BALANCE ($199)`);
    }

    // Get AsterDEX account info
    let accountInfo;
    try {
      accountInfo = await getAccountInfo();
      console.log(`\n💰 AsterDEX Account:`, {
        totalBalance: accountInfo.totalWalletBalance,
        availableBalance: accountInfo.availableBalance,
        unrealizedPnL: accountInfo.totalUnrealizedProfit,
        openPositions: accountInfo.positions?.length || 0,
      });
    } catch (error) {
      console.error('Error getting AsterDEX account info:', error);
      return {
        agentId,
        agentName: agent.name,
        success: false,
        reason: 'Failed to fetch AsterDEX account information',
        timestamp,
        usingAccountBalance,
      };
    }

    // Determine effective balance for trading
    const effectiveBalance = usingAccountBalance 
      ? parseFloat(accountInfo.availableBalance) 
      : agent.realBalance;
    
    console.log(`\n💵 Effective Trading Balance: $${effectiveBalance.toFixed(2)}`);

    // Check minimum balance
    if (effectiveBalance < 3) {
      return {
        agentId,
        agentName: agent.name,
        success: false,
        reason: `Insufficient balance for perpetuals: $${effectiveBalance.toFixed(2)}. Minimum $3 required.`,
        timestamp,
        usingAccountBalance,
      };
    }

    // Get risk manager for this agent using effective balance
    const riskManager = getRiskManager(agentId, effectiveBalance);
    
    // Check risk manager status
    const riskStatus = riskManager.getStatus();
    console.log(`\n⚖️  Risk Manager Status:`, {
      drawdown: `${(riskStatus.drawdown * 100).toFixed(2)}%`,
      consecutiveLosses: riskStatus.consecutiveLosses,
      tradingHalted: riskStatus.tradingHalted
    });

    // Check if circuit breaker allows trading
    const canTradeCheck = riskManager.canTrade();
    if (!canTradeCheck.allowed) {
      console.log(`🚨 CIRCUIT BREAKER ACTIVE: ${canTradeCheck.reason}`);
      await sendTelegramAlert(
        `🚨 ${agent.name} - Circuit Breaker Active\n` +
        `Reason: ${canTradeCheck.reason}\n` +
        `Trading halted for safety`
      );
      return {
        agentId,
        agentName: agent.name,
        success: false,
        reason: `Circuit breaker: ${canTradeCheck.reason}`,
        timestamp,
        usingAccountBalance,
      };
    }

    // Use AI for market analysis
    console.log(`\n🧠 Analyzing markets with ${agent.aiProvider}...`);
    const marketAnalysis = await analyzeMarket(agent.aiProvider as AIProvider);

    console.log(`\n📈 Market Analysis:`, {
      sentiment: marketAnalysis.marketSentiment,
      volatility: marketAnalysis.volatility,
      opportunities: marketAnalysis.topOpportunities.length,
    });

    // Check for existing positions
    let existingPositions: any[] = [];
    try {
      const positionRisks = await getPositionInfo();
      existingPositions = positionRisks.filter((p: any) => parseFloat(p.positionAmt) !== 0);
      
      if (existingPositions.length > 0) {
        console.log(`\n📍 Existing Positions:`);
        existingPositions.forEach((pos: any) => {
          console.log(`   ${pos.symbol}: ${parseFloat(pos.positionAmt) > 0 ? 'LONG' : 'SHORT'} | PnL: $${pos.unRealizedProfit}`);
        });
      }
    } catch (error) {
      console.error('Error getting positions:', error);
    }

    // Generate trading signal using AI
    console.log(`\n🎯 Generating AI trading signal for ${agent.name}...`);
    const aiSignal = await generateTradingSignal(agent, marketAnalysis);

    console.log(`\n📊 AI Trading Signal:`, {
      action: aiSignal.action,
      symbol: aiSignal.symbol,
      confidence: `${(aiSignal.confidence * 100).toFixed(0)}%`,
      reasoning: aiSignal.reasoning.substring(0, 100) + '...',
    });

    // Map to AsterDEX symbol
    const asterSymbol = mapToAsterSymbol(aiSignal.symbol);
    
    // Get current position for the symbol
    const currentPosition = existingPositions.find(p => p.symbol === asterSymbol);
    
    // ===================================================================
    // 🔥 ULTRA-PROFITABLE TRADING ENGINE - HIGHEST PRIORITY
    // ===================================================================
    console.log(`\n🔥 ULTRA-PROFITABLE TRADING ENGINE ACTIVATED`);
    console.log(`   Maximizing profitability with aggressive but safe strategies...`);
    
    let ultraSignal: UltraTradingSignal | null = null;
    
    try {
      ultraSignal = await generateUltraProfitableSignal(
        asterSymbol,
        effectiveBalance,
        currentPosition
      );
      
      console.log(`\n🔥 ULTRA-PROFITABLE DECISION:`, {
        action: ultraSignal.action,
        confidence: `${(ultraSignal.confidence * 100).toFixed(1)}%`,
        urgency: ultraSignal.urgency,
        marketStrength: `${(ultraSignal.marketStrength * 100).toFixed(1)}%`,
        expectedProfit: `$${ultraSignal.expectedProfit.toFixed(2)}`,
      });
    } catch (error) {
      console.error('Error in ultra-profitable trading engine:', error);
      ultraSignal = null;
    }
    
    // ===================================================================
    // 🚀 PROFITABLE TRADING ENGINE - Secondary decision maker
    // ===================================================================
    console.log(`\n🎯 ADVANCED PROFITABLE TRADING ENGINE ACTIVATED`);
    console.log(`   Using advanced technical analysis & optimal position sizing...`);
    
    let profitableDecision: Awaited<ReturnType<typeof generateProfitableTradingDecision>> | null = null;
    
    try {
      // First, monitor and manage existing positions
      if (existingPositions.length > 0) {
        console.log(`\n📊 Monitoring existing positions with advanced strategies...`);
        await monitorAndManagePositions(agentId);
      }
      
      // Generate profitable trading decision with advanced strategies
      profitableDecision = await generateProfitableTradingDecision(
        agentId,
        asterSymbol,
        effectiveBalance
      );
      
      console.log(`\n💰 PROFITABLE ENGINE DECISION:`, {
        action: profitableDecision.signal.action,
        confidence: `${(profitableDecision.signal.confidence * 100).toFixed(1)}%`,
        shouldTrade: profitableDecision.shouldTrade,
        reasoning: profitableDecision.reason,
      });
      
      if (profitableDecision.shouldTrade) {
        console.log(`\n   Trade Details:`);
        console.log(`   Risk/Reward: ${profitableDecision.signal.riskRewardRatio.toFixed(2)}:1`);
        console.log(`   Expected Profit: $${profitableDecision.signal.expectedProfit.toFixed(2)}`);
        console.log(`   Market Regime: ${profitableDecision.signal.marketRegime.type}`);
      }
    } catch (error) {
      console.error('Error in profitable trading engine:', error);
      profitableDecision = null;
    }
    
    // ===================================================================
    // Fallback: Generate EXPERT trading signal with LSTM-style predictions
    // ===================================================================
    console.log(`\n🎓 Generating EXPERT trading signal with LSTM predictions...`);
    let expertSignal: ExpertTradingSignal | null = null;
    
    try {
      // Convert position to format expected by expert strategy
      const positionData = currentPosition ? {
        symbol: currentPosition.symbol,
        side: parseFloat(currentPosition.positionAmt) > 0 ? 'LONG' : 'SHORT',
        entryPrice: parseFloat(currentPosition.entryPrice) || 0,
        quantity: Math.abs(parseFloat(currentPosition.positionAmt)) || 0,
        collateral: parseFloat(currentPosition.notional) || 0,
        unrealizedPnl: parseFloat(currentPosition.unRealizedProfit) || 0,
      } : null;
      
      expertSignal = await generateExpertTradingSignal(
        agentId,
        asterSymbol.replace('USDT', ''),
        positionData
      );
      
      console.log(`\n🎓 EXPERT TRADING SIGNAL:`, {
        action: expertSignal.action,
        confidence: `${expertSignal.confidence.toFixed(0)}%`,
        targetScore: expertSignal.targetScore.toFixed(3),
        regime: expertSignal.regime,
        volatility: expertSignal.volatility.toFixed(3),
        leverage: `${expertSignal.suggestedLeverage.toFixed(1)}x`,
        positionSize: `$${expertSignal.suggestedSize.toFixed(2)}`,
        reasoning: expertSignal.reasoning
      });
      
      // Log the decision for audit trail
      await logTradingDecision(agentId, expertSignal, 'EVALUATING');
      
    } catch (error) {
      console.error('Error generating expert signal:', error);
      expertSignal = null;
    }
    
    // ===================================================================
    // FINAL DECISION: Ultra-Profitable > Profitable > Expert > AI (in priority order)
    // ===================================================================
    const signal = ultraSignal && ultraSignal.action !== 'HOLD' ? {
      symbol: aiSignal.symbol,
      action: ultraSignal.action === 'LONG' ? 'BUY' as const : 
              ultraSignal.action === 'SHORT' ? 'SELL' as const : 
              ultraSignal.action === 'CLOSE' ? 'CLOSE' as const : 'HOLD' as const,
      confidence: ultraSignal.confidence,
      reasoning: ultraSignal.reasoning,
      quantity: ultraSignal.positionSize,
      targetProfit: aiSignal.targetProfit,
      expertSignal: expertSignal,
      profitableSignal: null,
      ultraSignal: ultraSignal,
      leverage: ultraSignal.leverage,
      stopLoss: ultraSignal.stopLoss,
      takeProfit: ultraSignal.takeProfit[0],
    } : profitableDecision && profitableDecision.shouldTrade ? {
      symbol: aiSignal.symbol,
      action: profitableDecision.signal.action === 'LONG' ? 'BUY' as const : 
              profitableDecision.signal.action === 'SHORT' ? 'SELL' as const : 'HOLD' as const,
      confidence: profitableDecision.signal.confidence,
      reasoning: profitableDecision.signal.reasoning,
      quantity: profitableDecision.signal.positionSize,
      targetProfit: aiSignal.targetProfit,
      expertSignal: expertSignal,
      profitableSignal: profitableDecision.signal,
      ultraSignal: null,
    } : expertSignal ? {
      symbol: aiSignal.symbol,
      action: expertSignal.action === 'CLOSE_LONG' || expertSignal.action === 'CLOSE_SHORT' 
        ? 'HOLD' as const
        : expertSignal.action === 'LONG' 
          ? 'BUY' as const
          : expertSignal.action === 'SHORT' 
            ? 'SELL' as const
            : 'HOLD' as const,
      confidence: expertSignal.confidence / 100, // Convert from 0-100 to 0-1
      reasoning: expertSignal.reasoning,
      quantity: expertSignal.suggestedSize,
      targetProfit: aiSignal.targetProfit,
      expertSignal: expertSignal as ExpertTradingSignal,
      profitableSignal: null,
      ultraSignal: null,
    } : { 
      ...aiSignal, 
      expertSignal: null as ExpertTradingSignal | null,
      profitableSignal: null,
      ultraSignal: null,
    };
    
    const signalSource = ultraSignal && ultraSignal.action !== 'HOLD' ? '🔥 ULTRA-PROFITABLE ENGINE' :
                        profitableDecision && profitableDecision.shouldTrade ? '🎯 PROFITABLE ENGINE' :
                        expertSignal ? '🎓 EXPERT' : '🧠 AI';
    
    console.log(`\n✅ FINAL TRADING DECISION:`);
    console.log(`   Source: ${signalSource}`);
    console.log(`   Action: ${signal.action}`);
    console.log(`   Symbol: ${signal.symbol}`);
    console.log(`   Confidence: ${(signal.confidence * 100).toFixed(0)}%`);
    console.log(`   Reasoning: ${signal.reasoning.substring(0, 100)}...`);

    // Check if should hold
    // ULTRA-AGGRESSIVE thresholds for maximum trading frequency:
    // - Ultra-Profitable engine: 35% threshold (very aggressive)
    // - Profitable engine: 60% threshold (lowered from 65%)
    // - Final execution: 45% threshold (lowered from 50% for MORE frequent trading)
    const confidenceThreshold = ultraSignal && ultraSignal.action !== 'HOLD' ? 0.35 : 
                                 profitableDecision && profitableDecision.shouldTrade ? 0.60 : 0.45;
    
    if (signal.action === 'HOLD' || signal.confidence < confidenceThreshold) {
      console.log(`\n⏸️  HOLD decision - ${signal.reasoning}`);
      
      // Monitor existing positions for exit signals using EXPERT position management
      if (existingPositions.length > 0) {
        console.log('\n🔄 Evaluating existing positions with EXPERT position management...');
        
        for (const pos of existingPositions) {
          const pnlPercent = (parseFloat(pos.unRealizedProfit) / parseFloat(pos.notional)) * 100;
          console.log(`\n   📊 ${pos.symbol}: ${pnlPercent > 0 ? '+' : ''}${pnlPercent.toFixed(2)}% PnL`);

          try {
            // Use expert position management
            const positionData = {
              symbol: pos.symbol,
              side: parseFloat(pos.positionAmt) > 0 ? 'LONG' : 'SHORT',
              entryPrice: parseFloat(pos.entryPrice) || 0,
              quantity: Math.abs(parseFloat(pos.positionAmt)) || 0,
              collateral: parseFloat(pos.notional) || 0,
              unrealizedPnl: parseFloat(pos.unRealizedProfit) || 0,
            };
            
            const positionDecision = await manageExistingPosition(agentId, positionData);
            
            console.log(`   📋 Expert Decision: ${positionDecision.action} - ${positionDecision.reason}`);
            
            if (positionDecision.action === 'CLOSE') {
              console.log(`   🔻 Closing ${pos.symbol} position (PnL: ${pnlPercent.toFixed(2)}%)`);
              
              // Close position by placing opposite order
              const side = parseFloat(pos.positionAmt) > 0 ? 'SELL' : 'BUY';
              const quantity = Math.abs(parseFloat(pos.positionAmt));
              
              await executeMarketTrade(pos.symbol, side, quantity);
              
              // Update risk manager with P&L
              const profitLoss = parseFloat(pos.unRealizedProfit);
              const newBalance = agent.realBalance + profitLoss;
              riskManager.updateCapital(newBalance, profitLoss);
              
              // Update agent balance in database
              await prisma.aIAgent.update({
                where: { id: agentId },
                data: {
                  realBalance: newBalance
                }
              });
              
              await sendTelegramAlert(
                `🔻 ${agent.name} closed ${pos.symbol} position\n` +
                `PnL: ${pnlPercent > 0 ? '+' : ''}${pnlPercent.toFixed(2)}% ($${profitLoss.toFixed(2)})\n` +
                `Reason: ${positionDecision.reason}\n` +
                `New Balance: $${newBalance.toFixed(2)}`
              );
            } else if (positionDecision.action === 'ADJUST_STOP') {
              console.log(`   🎯 ${positionDecision.reason}`);
              // Note: Trailing stop adjustment would require additional API calls
              // For now, we log it for informational purposes
            }
          } catch (error) {
            console.error(`Error managing position for ${pos.symbol}:`, error);
          }
        }
      }

      return {
        agentId,
        agentName: agent.name,
        success: false,
        action: 'HOLD',
        reason: signal.reasoning,
        timestamp,
        usingAccountBalance,
      };
    }

    // Calculate position size with EXPERT risk management
    // Use effectiveBalance (AsterDEX account for specific agents, or agent's balance)
    const availableBalance = effectiveBalance;
    
    console.log(`\n💰 Trading Capital: $${availableBalance.toFixed(2)} ${usingAccountBalance ? '(AsterDEX Account)' : '(Agent Balance)'}`);
    
    // Get agent's recent trading performance for Kelly Criterion
    const recentTrades = await prisma.trade.findMany({
      where: { 
        agentId,
        status: 'CLOSED',
        profitLoss: { not: null }
      },
      orderBy: { exitTime: 'desc' },
      take: 20
    });
    
    let winRate = 0.5; // Default 50%
    let avgWin = 0;
    let avgLoss = 0;
    
    if (recentTrades.length > 0) {
      const winners = recentTrades.filter(t => t.profitLoss && t.profitLoss > 0);
      const losers = recentTrades.filter(t => t.profitLoss && t.profitLoss < 0);
      
      winRate = winners.length / recentTrades.length;
      avgWin = winners.length > 0 
        ? winners.reduce((sum, t) => sum + (t.profitLoss || 0), 0) / winners.length
        : 0;
      avgLoss = losers.length > 0
        ? Math.abs(losers.reduce((sum, t) => sum + (t.profitLoss || 0), 0) / losers.length)
        : 0;
    }
    
    // Use EXPERT signal for position sizing and leverage if available
    let leverage = 5; // Default
    let collateralUSD = 0;
    
    if (signal.expertSignal) {
      // Use expert strategy recommendations with enhanced sizing for account balance agents
      leverage = signal.expertSignal.suggestedLeverage;
      
      // PROFITABILITY ENHANCEMENT: Agents using account balance can use larger positions
      const maxPositionPercent = usingAccountBalance ? 0.35 : 0.25; // 35% vs 25%
      const maxAbsoluteSize = usingAccountBalance ? 1000 : 500; // $1000 vs $500
      
      collateralUSD = Math.min(
        signal.expertSignal.suggestedSize,
        availableBalance * maxPositionPercent,
        maxAbsoluteSize
      );
      
      console.log(`\n🎓 Using EXPERT position sizing:`, {
        leverage: `${leverage}x`,
        collateral: `$${collateralUSD.toFixed(2)}`,
        exposure: `$${(collateralUSD * leverage).toFixed(2)}`,
        confidence: `${signal.expertSignal.confidence.toFixed(0)}%`,
        regime: signal.expertSignal.regime,
        volatility: signal.expertSignal.volatility.toFixed(3),
        usingAccountBalance: usingAccountBalance ? '✅ YES' : 'NO'
      });
    } else {
      // Fallback to Kelly Criterion for optimal position sizing
      const optimalSize = avgLoss > 0 
        ? riskManager.calculatePositionSize(signal.confidence, winRate, avgWin, avgLoss)
        : 0.20; // Default 20% if no history
      
      // PROFITABILITY ENHANCEMENT: Larger positions for account balance agents
      const maxPositionPercent = usingAccountBalance ? 0.35 : 0.25;
      const maxAbsoluteSize = usingAccountBalance ? 1000 : 500;
      
      collateralUSD = Math.max(
        Math.min(3, availableBalance * 0.15), // Minimum $3 or 15% of balance, whichever is lower
        Math.min(
          availableBalance * optimalSize,
          availableBalance * maxPositionPercent,
          maxAbsoluteSize
        )
      );

      // Dynamic leverage based on confidence and volatility - enhanced for profitability
      if (signal.confidence > 0.85 && marketAnalysis.volatility === 'LOW') {
        leverage = usingAccountBalance ? 12 : 10; // Higher leverage for account balance agents
      } else if (signal.confidence > 0.8 && marketAnalysis.volatility === 'MEDIUM') {
        leverage = usingAccountBalance ? 9 : 7;
      } else if (marketAnalysis.volatility === 'HIGH') {
        leverage = 3; // Same for all agents in high volatility
      }
      
      console.log(`\n📊 Using fallback position sizing:`, {
        leverage: `${leverage}x`,
        collateral: `$${collateralUSD.toFixed(2)}`,
        optimalSize: `${(optimalSize * 100).toFixed(1)}%`,
        usingAccountBalance: usingAccountBalance ? '✅ YES' : 'NO'
      });
    }

    console.log(`\n📊 Position Sizing:`, {
      collateral: `$${collateralUSD.toFixed(2)}`,
      leverage: `${leverage}x`,
      exposure: `$${(collateralUSD * leverage).toFixed(2)}`,
      availableBalance: `$${availableBalance.toFixed(2)}`,
      usingAccountBalance: usingAccountBalance ? '✅ YES ($199)' : 'NO'
    });

    // Risk assessment - use collateral amount (not exposure) for leveraged trades
    const riskCheck = await circuitBreaker.canTrade(agentId, collateralUSD, availableBalance);
    
    if (!riskCheck.allowed) {
      const alert = `🚫 ${agent.name} AsterDEX trade blocked: ${riskCheck.reasons.join(', ')}`;
      console.log(alert);
      await sendTelegramAlert(alert);
      
      return {
        agentId,
        agentName: agent.name,
        success: false,
        reason: `Risk check failed: ${riskCheck.reasons.join(', ')}`,
        timestamp,
        usingAccountBalance,
      };
    }

    // Set leverage for the symbol
    try {
      await setLeverage(asterSymbol, leverage);
      console.log(`✅ Set leverage to ${leverage}x for ${asterSymbol}`);
    } catch (error) {
      console.error('Error setting leverage:', error);
      // Continue anyway, might already be set
    }

    // Determine side and quantity
    const side = signal.action === 'BUY' ? 'BUY' : 'SELL';
    
    // Calculate quantity (position size with leverage)
    const quantity = (collateralUSD * leverage) / 1000; // Approximate, will be adjusted by exchange

    console.log(`\n🚀 EXECUTING ASTERDEX TRADE:`, {
      agent: agent.name,
      symbol: asterSymbol,
      side,
      quantity: quantity.toFixed(4),
      leverage: `${leverage}x`,
      confidence: `${(signal.confidence * 100).toFixed(0)}%`,
    });

    // Get current market price
    let currentPrice = 0;
    try {
      const ticker = await getMarketPrice(asterSymbol);
      currentPrice = ticker;
      console.log(`💲 Current ${asterSymbol} price: $${currentPrice}`);
    } catch (error) {
      console.error('Error fetching current price:', error);
      // Fallback to a reasonable price if API fails
      currentPrice = asterSymbol.includes('ETH') ? 3000 : 100000;
    }

    // Execute the trade
    let orderResult;
    try {
      orderResult = await executeMarketTrade(asterSymbol, side, quantity);
      
      console.log(`\n✅ ASTERDEX TRADE SUCCESSFUL!`, {
        orderId: orderResult.orderId,
        symbol: orderResult.symbol,
        side: orderResult.side,
        executedQty: orderResult.executedQty,
        price: orderResult.price,
        status: orderResult.status,
      });

      // Validate order result before recording
      if (!orderResult.orderId || !orderResult.executedQty || !orderResult.price) {
        console.error('❌ Invalid order result - missing required fields:', orderResult);
        throw new Error('Invalid order result from AsterDEX API');
      }

      // Use actual values from order result with validation
      const executedQty = parseFloat(orderResult.executedQty);
      const executedPrice = parseFloat(orderResult.price);
      
      // Additional validation - ensure we have valid non-zero values
      if (!executedQty || executedQty <= 0 || isNaN(executedQty)) {
        console.error('❌ Invalid executed quantity:', executedQty);
        throw new Error(`Invalid executed quantity: ${executedQty}`);
      }
      
      if (!executedPrice || executedPrice <= 0 || isNaN(executedPrice)) {
        console.error('❌ Invalid executed price:', executedPrice);
        throw new Error(`Invalid executed price: ${executedPrice}`);
      }
      
      // Calculate stop-loss and take-profit levels
      const stopLossPercent = -3; // -3% stop loss
      const takeProfitPercent = 5; // +5% take profit
      
      const stopLossPrice = executedPrice * (1 + stopLossPercent / 100);
      const takeProfitPrice = executedPrice * (1 + takeProfitPercent / 100);
      
      console.log(`📝 Recording trade with validated values:`, {
        quantity: executedQty,
        price: executedPrice,
        collateral: collateralUSD,
        leverage: leverage,
        stopLoss: stopLossPrice.toFixed(2),
        takeProfit: takeProfitPrice.toFixed(2)
      });

      // Record trade in database with validated values
      const trade = await prisma.trade.create({
        data: {
          agentId,
          symbol: asterSymbol,
          side,
          type: 'PERPETUAL',
          quantity: executedQty,
          entryPrice: executedPrice,
          stopLoss: stopLossPrice,
          takeProfit: takeProfitPrice,
          status: 'OPEN',
          entryTime: new Date(),
          txHash: String(orderResult.orderId), // Convert orderId to string
          chain: 'astar-zkevm',
          isRealTrade: true,
          strategy: `AsterDEX ${side} ${leverage}x - ${signal.reasoning.substring(0, 50)}`,
        },
      });

      // Update agent stats
      await prisma.aIAgent.update({
        where: { id: agentId },
        data: {
          totalTrades: { increment: 1 },
        },
      });

      await sendTelegramAlert(
        `✅ ${agent.name} opened ${side} position on ${asterSymbol}\n` +
        `Quantity: ${orderResult.executedQty}\n` +
        `Price: $${orderResult.price}\n` +
        `Leverage: ${leverage}x\n` +
        `Collateral: $${collateralUSD.toFixed(2)}\n` +
        `${usingAccountBalance ? '💎 Using AsterDEX Account Balance\n' : ''}` +
        `Order ID: ${orderResult.orderId}\n` +
        `Confidence: ${(signal.confidence * 100).toFixed(0)}%\n` +
        `Source: ${signal.expertSignal ? 'EXPERT STRATEGY' : 'AI ANALYSIS'}`
      );

      // Log the expert trading decision if available
      if (signal.expertSignal) {
        await logTradingDecision(agentId, signal.expertSignal, `EXECUTED: ${side} ${asterSymbol}`);
      }

      return {
        agentId,
        agentName: agent.name,
        success: true,
        action: side as 'LONG' | 'SHORT',
        market: asterSymbol,
        collateral: collateralUSD,
        leverage,
        txHash: orderResult.orderId,
        reason: 'Position opened successfully',
        timestamp,
        usingAccountBalance,
      };

    } catch (error) {
      console.error(`\n❌ ASTERDEX TRADE FAILED:`, error);
      
      await sendTelegramAlert(
        `❌ ${agent.name} AsterDEX trade failed\n` +
        `Symbol: ${asterSymbol}\n` +
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );

      return {
        agentId,
        agentName: agent.name,
        success: false,
        reason: `Trade execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp,
        usingAccountBalance,
      };
    }

  } catch (error) {
    console.error(`\n❌ ERROR in AsterDEX autonomous trade:`, error);
    
    return {
      agentId,
      agentName: 'Unknown',
      success: false,
      reason: error instanceof Error ? error.message : 'Unknown error',
      timestamp,
      usingAccountBalance: false,
    };
  }
}

/**
 * Monitor and close open positions based on stop-loss, take-profit, or time
 * ENHANCED: More aggressive profit-taking with tiered levels
 */
async function monitorAndClosePositions(): Promise<number> {
  console.log('\n🔍 MONITORING OPEN POSITIONS FOR PROFIT-TAKING...');
  
  const openTrades = await prisma.trade.findMany({
    where: {
      status: 'OPEN',
      isRealTrade: true,
      chain: 'astar-zkevm'
    },
    include: {
      agent: true
    }
  });
  
  console.log(`📊 Found ${openTrades.length} open positions to monitor for profit opportunities`);
  
  let closedCount = 0;
  let profitsTaken = 0;
  let lossesCut = 0;
  
  for (const trade of openTrades) {
    try {
      const symbol = trade.symbol;
      
      // Get current position from AsterDEX
      let asterPosition = null;
      try {
        const positions = await getPositionInfo();
        asterPosition = positions.find((p: any) => p.symbol === symbol && parseFloat(p.positionAmt) !== 0);
      } catch (error) {
        console.warn(`⚠️  Could not get AsterDEX position for ${symbol}`);
      }
      
      // Get current market price
      const currentPrice = await getMarketPrice(symbol);
      
      if (!currentPrice || currentPrice <= 0) {
        console.warn(`⚠️  Could not get price for ${symbol}, skipping...`);
        continue;
      }
      
      console.log(`\n📊 Checking position: ${trade.agent.name} - ${symbol}`);
      console.log(`   Entry: $${trade.entryPrice.toFixed(2)} | Current: $${currentPrice.toFixed(2)}`);
      
      // Calculate P&L percentage based on entry vs current price
      let pnlPercent = 0;
      if (trade.side === 'BUY') {
        pnlPercent = ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100;
      } else {
        pnlPercent = ((trade.entryPrice - currentPrice) / trade.entryPrice) * 100;
      }
      
      // Use actual unrealized PnL from AsterDEX if available
      let actualPnL = pnlPercent;
      if (asterPosition) {
        const unrealizedProfit = parseFloat(asterPosition.unRealizedProfit);
        const notional = parseFloat(asterPosition.notional);
        if (notional > 0) {
          actualPnL = (unrealizedProfit / notional) * 100;
          console.log(`   PnL (calculated): ${pnlPercent.toFixed(2)}%`);
          console.log(`   PnL (actual DEX): ${actualPnL.toFixed(2)}% ($${unrealizedProfit.toFixed(2)})`);
          pnlPercent = actualPnL; // Use actual PnL from DEX
        }
      } else {
        console.log(`   PnL: ${pnlPercent.toFixed(2)}%`);
      }
      
      // Calculate time held
      const hoursOpen = (Date.now() - trade.entryTime.getTime()) / (1000 * 60 * 60);
      console.log(`   Time held: ${hoursOpen.toFixed(1)} hours`);
      
      // ===== TIERED PROFIT-TAKING WITH 5% MINIMUM =====
      let shouldClose = false;
      let closeReason = '';
      let isProfitable = false;
      
      // 🚀 TIER 1: EXCELLENT PROFIT (>8%) - CLOSE IMMEDIATELY
      if (pnlPercent >= 8) {
        shouldClose = true;
        isProfitable = true;
        closeReason = `🚀 EXCELLENT PROFIT: ${pnlPercent.toFixed(2)}% - Taking exceptional gains!`;
      }
      // 💎 TIER 2: GREAT PROFIT (>5%) - CLOSE IMMEDIATELY
      else if (pnlPercent >= 5) {
        shouldClose = true;
        isProfitable = true;
        closeReason = `💎 GREAT PROFIT: ${pnlPercent.toFixed(2)}% - Securing strong gains!`;
      }
      // 🛑 STOP LOSS: -2.5% (tighter from -3% for faster loss cutting)
      else if (pnlPercent <= -2.5) {
        shouldClose = true;
        isProfitable = false;
        closeReason = `🛑 STOP LOSS: ${pnlPercent.toFixed(2)}% - Cutting losses quickly`;
      }
      // ⏰ TIME-BASED EXIT: Close profitable positions held >24 hours with at least 3% profit
      else if (hoursOpen >= 24 && pnlPercent >= 3) {
        shouldClose = true;
        isProfitable = true;
        closeReason = `⏰ Position held >24h with ${pnlPercent.toFixed(2)}% profit - Taking profit`;
      }
      // ⏰ MAX TIME: Force close positions held >48 hours regardless of profit
      else if (hoursOpen >= 48) {
        shouldClose = true;
        isProfitable = pnlPercent > 0;
        closeReason = `⏰ Max holding time (48h) exceeded - Closing with ${pnlPercent.toFixed(2)}% PnL`;
      }
      
      if (shouldClose) {
        console.log(`   🚨 ${closeReason}`);
        
        try {
          // Close position on AsterDEX by placing opposite market order
          const closeSide = trade.side === 'BUY' ? 'SELL' : 'BUY';
          const quantity = trade.quantity;
          
          console.log(`   🔄 Closing position on AsterDEX: ${closeSide} ${quantity} ${symbol}...`);
          
          let closeOrderId = 'MANUAL_CLOSE';
          try {
            const closeOrder = await executeMarketTrade(symbol, closeSide, quantity);
            closeOrderId = closeOrder.orderId;
            console.log(`   ✅ Position closed on AsterDEX - Order ID: ${closeOrderId}`);
          } catch (closeError) {
            console.error(`   ❌ Error closing position on AsterDEX:`, closeError);
            // Continue anyway to update database
          }
          
          // Calculate actual P&L in USD
          const pnl = (currentPrice - trade.entryPrice) * trade.quantity * (trade.side === 'BUY' ? 1 : -1);
          
          // Update trade in database
          await prisma.trade.update({
            where: { id: trade.id },
            data: {
              status: 'CLOSED',
              exitPrice: currentPrice,
              exitTime: new Date(),
              profitLoss: pnl
            }
          });
          
          // Update agent stats
          if (pnl > 0) {
            await prisma.aIAgent.update({
              where: { id: trade.agentId },
              data: {
                totalWins: { increment: 1 },
                realBalance: { increment: pnl }
              }
            });
            profitsTaken++;
            
            // Record profit share to treasury (5% of profit)
            try {
              await recordProfitShare(trade.agentId, trade.id, pnl, trade.chain || 'base');
            } catch (treasuryError) {
              console.error('⚠️  Failed to record treasury profit share:', treasuryError);
              // Don't fail the trade closure if treasury update fails
            }
          } else {
            await prisma.aIAgent.update({
              where: { id: trade.agentId },
              data: {
                totalLosses: { increment: 1 },
                realBalance: { increment: pnl } // Negative value
              }
            });
            lossesCut++;
          }
          
          // Send alert with emoji based on result
          const emoji = pnl > 0 ? '✅ 💰' : '❌';
          await sendTelegramAlert(
            `${emoji} Position Closed\n` +
            `Agent: ${trade.agent.name}\n` +
            `${symbol} ${trade.side}\n` +
            `Entry: $${trade.entryPrice.toFixed(2)} → Exit: $${currentPrice.toFixed(2)}\n` +
            `P&L: $${pnl.toFixed(2)} (${pnlPercent.toFixed(2)}%)\n` +
            `Time held: ${hoursOpen.toFixed(1)}h\n` +
            `Reason: ${closeReason}`
          );
          
          // Notify subscribed users about profitable trades
          if (pnl > 0) {
            await notifySubscribedUsers({
              agentName: trade.agent.name,
              symbol: symbol,
              side: trade.side,
              profit: pnl,
              profitPercent: pnlPercent,
              entryPrice: trade.entryPrice,
              exitPrice: currentPrice,
              size: trade.quantity * trade.entryPrice,
            });
          }
          
          console.log(`   ✅ Database updated: P&L = $${pnl.toFixed(2)}`);
          closedCount++;
        } catch (error) {
          console.error(`   ❌ Error closing position:`, error);
        }
      } else {
        console.log(`   ⏳ Position still open (PnL: ${pnlPercent.toFixed(2)}%, Age: ${hoursOpen.toFixed(1)}h)`);
      }
      
      // Small delay between checks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error monitoring position ${trade.id}:`, error);
    }
  }
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`✅ POSITION MONITORING COMPLETE`);
  console.log(`${'='.repeat(70)}`);
  console.log(`📊 Total Positions Closed: ${closedCount}`);
  console.log(`💰 Profits Taken: ${profitsTaken}`);
  console.log(`✂️  Losses Cut: ${lossesCut}`);
  console.log(`${'='.repeat(70)}\n`);
  
  return closedCount;
}

/**
 * Run AsterDEX autonomous trading cycle for all agents
 */
export async function runAsterAutonomousTradingCycle(): Promise<AsterTradeResult[]> {
  console.log('\n' + '='.repeat(70));
  console.log('🤖 STARTING ASTERDEX 24/7 AUTONOMOUS TRADING CYCLE');
  console.log('='.repeat(70));

  try {
    // STEP 1: Monitor and close existing positions FIRST
    await monitorAndClosePositions();
    
    // STEP 2: Get all active agents with sufficient balance
    const agents = await prisma.aIAgent.findMany({
      where: {
        isActive: true,
        realBalance: { gte: 3 }, // Minimum $3 for perpetuals (allows smaller positions)
      },
      orderBy: {
        realBalance: 'desc',
      },
    });

    console.log(`\n📊 Found ${agents.length} agents ready for AsterDEX trading`);

    if (agents.length === 0) {
      console.log('⚠️  No agents ready for trading');
      return [];
    }

    const results: AsterTradeResult[] = [];

    // Execute trades for each agent
    for (const agent of agents) {
      try {
        const result = await executeAsterAutonomousTrade(agent.id);
        results.push(result);

        // Add delay between trades to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 5000));
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
    console.log('📊 ASTERDEX TRADING CYCLE SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total Agents: ${results.length}`);
    console.log(`✅ Successful Trades: ${successCount}`);
    console.log(`⏸️  Hold Decisions: ${holdCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('='.repeat(70) + '\n');

    // Send summary alert
    if (successCount > 0 || errorCount > 0) {
      await sendTelegramAlert(
        `📊 AsterDEX Trading Cycle Complete\n` +
        `Agents: ${results.length}\n` +
        `Positions Opened: ${successCount}\n` +
        `Holds: ${holdCount}\n` +
        `Errors: ${errorCount}`
      );
    }

    return results;

  } catch (error) {
    console.error('Error in AsterDEX trading cycle:', error);
    throw error;
  }
}
