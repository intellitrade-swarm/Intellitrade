
/**
 * Circuit Breaker & Risk Guardrails
 * Safety system that prevents catastrophic losses
 * 
 * Features:
 * - Maximum trade size limits
 * - Maximum drawdown protection
 * - Daily loss limits
 * - Position size limits
 * - Emergency shutdown
 */

import { prisma } from './db';

export interface CircuitBreakerConfig {
  maxTradeUsd: number;          // Maximum USD per trade
  maxDailyLossPercent: number;  // Maximum daily loss (%)
  maxDrawdownPercent: number;   // Maximum portfolio drawdown (%)
  maxOpenPositions: number;     // Maximum open positions per agent
  minBalanceUsd: number;        // Minimum balance to continue trading
  emergencyStop: boolean;       // Global emergency stop
}

export interface RiskCheckResult {
  allowed: boolean;
  reasons: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Default configuration - Optimized for consolidated agents ($70-120 balance each)
const DEFAULT_CONFIG: CircuitBreakerConfig = {
  maxTradeUsd: 50,           // Reduced from $500 to $50 (reasonable for $70-120 balances)
  maxDailyLossPercent: 30,   // Increased from 20% to 30% (more aggressive)
  maxDrawdownPercent: 40,    // Increased from 30% to 40% (more risk tolerance)
  maxOpenPositions: 5,       // Increased from 3 to 5 (more concurrent trades)
  minBalanceUsd: 10,         // Increased from $1 to $10 (proper minimum threshold)
  emergencyStop: false,
};

class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private trippedAgents: Set<string> = new Set();
  private dailyLosses: Map<string, { amount: number; timestamp: number }> = new Map();

  constructor(config: CircuitBreakerConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  /**
   * Check if agent can execute a trade
   */
  async canTrade(
    agentId: string,
    tradeAmount: number,
    currentBalance: number
  ): Promise<RiskCheckResult> {
    const reasons: string[] = [];
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check 1: Emergency stop
    if (this.config.emergencyStop) {
      return {
        allowed: false,
        reasons: ['Global emergency stop is active'],
        severity: 'critical',
      };
    }

    // Check 2: Agent is tripped
    if (this.trippedAgents.has(agentId)) {
      return {
        allowed: false,
        reasons: ['Circuit breaker tripped for this agent'],
        severity: 'critical',
      };
    }

    // Check 3: Maximum trade size
    if (tradeAmount > this.config.maxTradeUsd) {
      reasons.push(
        `Trade amount ($${tradeAmount.toFixed(2)}) exceeds maximum ($${this.config.maxTradeUsd.toFixed(2)})`
      );
      severity = 'high';
    }

    // Check 4: Minimum balance
    if (currentBalance < this.config.minBalanceUsd) {
      reasons.push(
        `Balance ($${currentBalance.toFixed(2)}) below minimum ($${this.config.minBalanceUsd.toFixed(2)})`
      );
      severity = 'critical';
    }

    // Check 5: Trade size vs balance - Increased to 40% for consolidated agents
    const tradePercent = (tradeAmount / currentBalance) * 100;
    if (tradePercent > 40) {
      reasons.push(
        `Trade size (${tradePercent.toFixed(1)}%) exceeds 40% of balance`
      );
      if (severity === 'low') severity = 'medium';
    }

    // Check 6: Daily loss limit
    const dailyLoss = await this.getDailyLoss(agentId);
    const dailyLossPercent = currentBalance > 0 ? (dailyLoss / currentBalance) * 100 : 0;
    
    if (dailyLossPercent > this.config.maxDailyLossPercent) {
      reasons.push(
        `Daily loss (${dailyLossPercent.toFixed(1)}%) exceeds limit (${this.config.maxDailyLossPercent}%)`
      );
      severity = 'critical';
      this.tripAgent(agentId);
    }

    // Check 7: Maximum drawdown
    const drawdown = await this.getMaxDrawdown(agentId);
    if (drawdown > this.config.maxDrawdownPercent) {
      reasons.push(
        `Drawdown (${drawdown.toFixed(1)}%) exceeds limit (${this.config.maxDrawdownPercent}%)`
      );
      severity = 'critical';
      this.tripAgent(agentId);
    }

    // Check 8: Open positions limit
    const openPositions = await this.getOpenPositionsCount(agentId);
    if (openPositions >= this.config.maxOpenPositions) {
      reasons.push(
        `Open positions (${openPositions}) at maximum (${this.config.maxOpenPositions})`
      );
      if (severity === 'low') severity = 'medium';
    }

    return {
      allowed: reasons.length === 0 && severity !== 'critical',
      reasons,
      severity,
    };
  }

  /**
   * Trip the circuit breaker for an agent
   */
  tripAgent(agentId: string): void {
    console.log(`🔴 CIRCUIT BREAKER TRIPPED for agent ${agentId}`);
    this.trippedAgents.add(agentId);
  }

  /**
   * Reset circuit breaker for an agent
   */
  resetAgent(agentId: string): void {
    console.log(`🟢 CIRCUIT BREAKER RESET for agent ${agentId}`);
    this.trippedAgents.delete(agentId);
    this.dailyLosses.delete(agentId);
  }

  /**
   * Global emergency stop
   */
  emergencyStopAll(): void {
    console.log('🚨 EMERGENCY STOP ACTIVATED - All trading halted');
    this.config.emergencyStop = true;
  }

  /**
   * Resume trading after emergency stop
   */
  resume(): void {
    console.log('✅ Emergency stop cleared - Trading resumed');
    this.config.emergencyStop = false;
  }

  /**
   * Get daily loss for an agent
   */
  private async getDailyLoss(agentId: string): Promise<number> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const trades = await prisma.trade.findMany({
      where: {
        agentId,
        entryTime: { gte: oneDayAgo },
        status: 'CLOSED',
        profitLoss: { lt: 0 },
      },
      select: {
        profitLoss: true,
      },
    });

    return trades.reduce((sum, t) => sum + Math.abs(t.profitLoss || 0), 0);
  }

  /**
   * Get maximum drawdown for an agent
   */
  private async getMaxDrawdown(agentId: string): Promise<number> {
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
      select: { maxDrawdown: true },
    });

    return agent?.maxDrawdown || 0;
  }

  /**
   * Get count of open positions
   */
  private async getOpenPositionsCount(agentId: string): Promise<number> {
    return prisma.trade.count({
      where: {
        agentId,
        status: 'OPEN',
      },
    });
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CircuitBreakerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current status
   */
  getStatus(): {
    config: CircuitBreakerConfig;
    trippedAgents: string[];
  } {
    return {
      config: this.config,
      trippedAgents: Array.from(this.trippedAgents),
    };
  }
}

// Singleton instance
export const circuitBreaker = new CircuitBreaker();

