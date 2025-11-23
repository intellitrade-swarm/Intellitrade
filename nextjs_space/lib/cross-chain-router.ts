
/**
 * Cross-Chain Liquidity Aggregator with AI Routing
 * 
 * This module implements intelligent routing across multiple DEXs, bridges, and chains
 * to find the optimal execution path based on:
 * - Total cost (fees + gas + slippage)
 * - Execution speed
 * - User risk budget
 * - Liquidity depth
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Supported chains
export enum Chain {
  ETHEREUM = 'ethereum',
  BASE = 'base',
  BSC = 'bsc',
  SOLANA = 'solana',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism',
  POLYGON = 'polygon',
}

// Supported DEXs per chain
export const DEX_BY_CHAIN = {
  [Chain.ETHEREUM]: ['uniswap', '1inch', 'sushiswap', 'curve'],
  [Chain.BASE]: ['aerodrome', 'baseswap', '1inch'],
  [Chain.BSC]: ['pancakeswap', '1inch', 'biswap'],
  [Chain.SOLANA]: ['jupiter', 'raydium', 'orca'],
  [Chain.ARBITRUM]: ['camelot', '1inch', 'sushiswap'],
  [Chain.OPTIMISM]: ['velodrome', '1inch', 'uniswap'],
  [Chain.POLYGON]: ['quickswap', '1inch', 'sushiswap'],
};

// Supported bridges
export const BRIDGES = [
  'across',
  'stargate',
  'hop',
  'synapse',
  'celer',
  'connext',
  'axelar',
];

// Risk levels for user-defined budgets
export enum RiskLevel {
  CONSERVATIVE = 'CONSERVATIVE', // Min slippage, established routes only
  MODERATE = 'MODERATE',         // Balanced approach
  AGGRESSIVE = 'AGGRESSIVE',     // Max speed, can use newer bridges
}

// Execution path interface
export interface ExecutionPath {
  id: string;
  steps: ExecutionStep[];
  totalCostUSD: number;
  totalGasUSD: number;
  estimatedSlippage: number;
  executionTimeSeconds: number;
  confidenceScore: number;
  riskLevel: RiskLevel;
  savingsVsCEX: number; // Percentage saved vs centralized exchange
}

export interface ExecutionStep {
  type: 'SWAP' | 'BRIDGE' | 'APPROVAL';
  chain: Chain;
  protocol: string;
  fromToken: string;
  toToken: string;
  amountIn: number;
  amountOut: number;
  feeUSD: number;
  gasUSD: number;
  slippage: number;
  durationSeconds: number;
}

// User risk budget configuration
export interface RiskBudget {
  userId: string;
  maxSlippagePercent: number;
  maxGasUSD: number;
  maxExecutionTimeSeconds: number;
  allowedChains: Chain[];
  allowedBridges: string[];
  riskLevel: RiskLevel;
  minLiquidityUSD: number;
}

// Default risk budgets by level
export const DEFAULT_RISK_BUDGETS: Record<RiskLevel, Omit<RiskBudget, 'userId'>> = {
  [RiskLevel.CONSERVATIVE]: {
    maxSlippagePercent: 0.5,
    maxGasUSD: 50,
    maxExecutionTimeSeconds: 300, // 5 minutes
    allowedChains: [Chain.ETHEREUM, Chain.BASE, Chain.ARBITRUM],
    allowedBridges: ['across', 'stargate', 'hop'],
    riskLevel: RiskLevel.CONSERVATIVE,
    minLiquidityUSD: 100000,
  },
  [RiskLevel.MODERATE]: {
    maxSlippagePercent: 1.0,
    maxGasUSD: 100,
    maxExecutionTimeSeconds: 600, // 10 minutes
    allowedChains: [Chain.ETHEREUM, Chain.BASE, Chain.BSC, Chain.ARBITRUM, Chain.OPTIMISM],
    allowedBridges: ['across', 'stargate', 'hop', 'synapse', 'celer'],
    riskLevel: RiskLevel.MODERATE,
    minLiquidityUSD: 50000,
  },
  [RiskLevel.AGGRESSIVE]: {
    maxSlippagePercent: 2.0,
    maxGasUSD: 200,
    maxExecutionTimeSeconds: 1800, // 30 minutes
    allowedChains: Object.values(Chain),
    allowedBridges: BRIDGES,
    riskLevel: RiskLevel.AGGRESSIVE,
    minLiquidityUSD: 10000,
  },
};

/**
 * Cross-Chain Router - Main orchestrator
 */
export class CrossChainRouter {
  private riskBudgets: Map<string, RiskBudget> = new Map();

  /**
   * Set risk budget for a user/agent
   */
  async setRiskBudget(userId: string, budget: Partial<RiskBudget>) {
    const defaultBudget = DEFAULT_RISK_BUDGETS[budget.riskLevel || RiskLevel.MODERATE];
    const fullBudget: RiskBudget = {
      userId,
      ...defaultBudget,
      ...budget,
    };
    
    this.riskBudgets.set(userId, fullBudget);
    
    // Persist to database
    await prisma.riskBudget.upsert({
      where: { userId },
      update: fullBudget,
      create: fullBudget,
    });
    
    return fullBudget;
  }

  /**
   * Get risk budget for a user/agent
   */
  async getRiskBudget(userId: string): Promise<RiskBudget> {
    if (this.riskBudgets.has(userId)) {
      return this.riskBudgets.get(userId)!;
    }
    
    // Load from database
    const dbBudget = await prisma.riskBudget.findUnique({
      where: { userId },
    });
    
    if (dbBudget) {
      this.riskBudgets.set(userId, dbBudget as RiskBudget);
      return dbBudget as RiskBudget;
    }
    
    // Return default moderate budget
    return {
      userId,
      ...DEFAULT_RISK_BUDGETS[RiskLevel.MODERATE],
    };
  }

  /**
   * Find optimal execution path across all chains and DEXs
   */
  async findOptimalPath(
    fromChain: Chain,
    toChain: Chain,
    fromToken: string,
    toToken: string,
    amountIn: number,
    userId: string
  ): Promise<ExecutionPath[]> {
    const riskBudget = await this.getRiskBudget(userId);
    
    console.log(`\n🔍 Finding optimal execution path:`);
    console.log(`   From: ${fromToken} on ${fromChain}`);
    console.log(`   To: ${toToken} on ${toChain}`);
    console.log(`   Amount: $${amountIn.toFixed(2)}`);
    console.log(`   Risk Level: ${riskBudget.riskLevel}`);
    
    // Generate all possible paths
    const allPaths: ExecutionPath[] = [];
    
    // Same chain swap (simplest case)
    if (fromChain === toChain) {
      const sameChainPaths = await this.generateSameChainPaths(
        fromChain,
        fromToken,
        toToken,
        amountIn,
        riskBudget
      );
      allPaths.push(...sameChainPaths);
    }
    
    // Cross-chain paths (bridge required)
    const crossChainPaths = await this.generateCrossChainPaths(
      fromChain,
      toChain,
      fromToken,
      toToken,
      amountIn,
      riskBudget
    );
    allPaths.push(...crossChainPaths);
    
    // Filter paths that exceed risk budget
    const validPaths = allPaths.filter(path => this.validatePath(path, riskBudget));
    
    // Sort by total cost (ascending)
    validPaths.sort((a, b) => a.totalCostUSD - b.totalCostUSD);
    
    console.log(`\n✅ Found ${validPaths.length} valid execution paths`);
    if (validPaths.length > 0) {
      console.log(`   Best path: $${validPaths[0].totalCostUSD.toFixed(2)} total cost`);
      console.log(`   Savings vs CEX: ${validPaths[0].savingsVsCEX.toFixed(1)}%`);
    }
    
    return validPaths;
  }

  /**
   * Generate same-chain execution paths
   */
  private async generateSameChainPaths(
    chain: Chain,
    fromToken: string,
    toToken: string,
    amountIn: number,
    riskBudget: RiskBudget
  ): Promise<ExecutionPath[]> {
    const paths: ExecutionPath[] = [];
    const dexes = DEX_BY_CHAIN[chain] || [];
    
    for (const dex of dexes) {
      // Fetch quote from DEX
      const quote = await this.fetchDEXQuote(chain, dex, fromToken, toToken, amountIn);
      
      if (!quote || quote.liquidity < riskBudget.minLiquidityUSD) {
        continue;
      }
      
      const path: ExecutionPath = {
        id: `${chain}-${dex}-${Date.now()}`,
        steps: [
          {
            type: 'SWAP',
            chain,
            protocol: dex,
            fromToken,
            toToken,
            amountIn,
            amountOut: quote.amountOut,
            feeUSD: quote.feeUSD,
            gasUSD: quote.gasUSD,
            slippage: quote.slippage,
            durationSeconds: 30, // Typical swap time
          },
        ],
        totalCostUSD: quote.feeUSD + quote.gasUSD,
        totalGasUSD: quote.gasUSD,
        estimatedSlippage: quote.slippage,
        executionTimeSeconds: 30,
        confidenceScore: this.calculateConfidenceScore(quote.liquidity, quote.slippage, dex),
        riskLevel: riskBudget.riskLevel,
        savingsVsCEX: this.calculateSavingsVsCEX(quote.feeUSD, amountIn),
      };
      
      paths.push(path);
    }
    
    return paths;
  }

  /**
   * Generate cross-chain execution paths
   */
  private async generateCrossChainPaths(
    fromChain: Chain,
    toChain: Chain,
    fromToken: string,
    toToken: string,
    amountIn: number,
    riskBudget: RiskBudget
  ): Promise<ExecutionPath[]> {
    const paths: ExecutionPath[] = [];
    
    // Strategy 1: Swap on source chain, bridge, swap on destination
    for (const bridge of riskBudget.allowedBridges) {
      const path = await this.generateSwapBridgeSwapPath(
        fromChain,
        toChain,
        fromToken,
        toToken,
        amountIn,
        bridge,
        riskBudget
      );
      
      if (path) {
        paths.push(path);
      }
    }
    
    // Strategy 2: Bridge native asset, then swap
    for (const bridge of riskBudget.allowedBridges) {
      const path = await this.generateBridgeThenSwapPath(
        fromChain,
        toChain,
        fromToken,
        toToken,
        amountIn,
        bridge,
        riskBudget
      );
      
      if (path) {
        paths.push(path);
      }
    }
    
    return paths;
  }

  /**
   * Generate swap-bridge-swap path
   */
  private async generateSwapBridgeSwapPath(
    fromChain: Chain,
    toChain: Chain,
    fromToken: string,
    toToken: string,
    amountIn: number,
    bridge: string,
    riskBudget: RiskBudget
  ): Promise<ExecutionPath | null> {
    try {
      const steps: ExecutionStep[] = [];
      let currentAmount = amountIn;
      let totalCost = 0;
      let totalGas = 0;
      let totalTime = 0;
      let maxSlippage = 0;
      
      // Step 1: Swap to bridgeable asset on source chain
      const bridgeableAsset = this.getBridgeableAsset(fromChain, bridge);
      if (fromToken !== bridgeableAsset) {
        const sourceSwapQuote = await this.fetchDEXQuote(
          fromChain,
          '1inch',
          fromToken,
          bridgeableAsset,
          currentAmount
        );
        
        if (!sourceSwapQuote) return null;
        
        steps.push({
          type: 'SWAP',
          chain: fromChain,
          protocol: '1inch',
          fromToken,
          toToken: bridgeableAsset,
          amountIn: currentAmount,
          amountOut: sourceSwapQuote.amountOut,
          feeUSD: sourceSwapQuote.feeUSD,
          gasUSD: sourceSwapQuote.gasUSD,
          slippage: sourceSwapQuote.slippage,
          durationSeconds: 30,
        });
        
        currentAmount = sourceSwapQuote.amountOut;
        totalCost += sourceSwapQuote.feeUSD + sourceSwapQuote.gasUSD;
        totalGas += sourceSwapQuote.gasUSD;
        totalTime += 30;
        maxSlippage = Math.max(maxSlippage, sourceSwapQuote.slippage);
      }
      
      // Step 2: Bridge to destination chain
      const bridgeQuote = await this.fetchBridgeQuote(
        fromChain,
        toChain,
        bridge,
        bridgeableAsset,
        currentAmount
      );
      
      if (!bridgeQuote) return null;
      
      steps.push({
        type: 'BRIDGE',
        chain: fromChain,
        protocol: bridge,
        fromToken: bridgeableAsset,
        toToken: bridgeableAsset,
        amountIn: currentAmount,
        amountOut: bridgeQuote.amountOut,
        feeUSD: bridgeQuote.feeUSD,
        gasUSD: bridgeQuote.gasUSD,
        slippage: bridgeQuote.slippage,
        durationSeconds: bridgeQuote.durationSeconds,
      });
      
      currentAmount = bridgeQuote.amountOut;
      totalCost += bridgeQuote.feeUSD + bridgeQuote.gasUSD;
      totalGas += bridgeQuote.gasUSD;
      totalTime += bridgeQuote.durationSeconds;
      maxSlippage = Math.max(maxSlippage, bridgeQuote.slippage);
      
      // Step 3: Swap to target token on destination chain
      if (bridgeableAsset !== toToken) {
        const destSwapQuote = await this.fetchDEXQuote(
          toChain,
          '1inch',
          bridgeableAsset,
          toToken,
          currentAmount
        );
        
        if (!destSwapQuote) return null;
        
        steps.push({
          type: 'SWAP',
          chain: toChain,
          protocol: '1inch',
          fromToken: bridgeableAsset,
          toToken,
          amountIn: currentAmount,
          amountOut: destSwapQuote.amountOut,
          feeUSD: destSwapQuote.feeUSD,
          gasUSD: destSwapQuote.gasUSD,
          slippage: destSwapQuote.slippage,
          durationSeconds: 30,
        });
        
        currentAmount = destSwapQuote.amountOut;
        totalCost += destSwapQuote.feeUSD + destSwapQuote.gasUSD;
        totalGas += destSwapQuote.gasUSD;
        totalTime += 30;
        maxSlippage = Math.max(maxSlippage, destSwapQuote.slippage);
      }
      
      return {
        id: `${fromChain}-${bridge}-${toChain}-${Date.now()}`,
        steps,
        totalCostUSD: totalCost,
        totalGasUSD: totalGas,
        estimatedSlippage: maxSlippage,
        executionTimeSeconds: totalTime,
        confidenceScore: this.calculatePathConfidence(steps, bridge),
        riskLevel: riskBudget.riskLevel,
        savingsVsCEX: this.calculateSavingsVsCEX(totalCost, amountIn),
      };
    } catch (error) {
      console.error(`Error generating path via ${bridge}:`, error);
      return null;
    }
  }

  /**
   * Generate bridge-then-swap path
   */
  private async generateBridgeThenSwapPath(
    fromChain: Chain,
    toChain: Chain,
    fromToken: string,
    toToken: string,
    amountIn: number,
    bridge: string,
    riskBudget: RiskBudget
  ): Promise<ExecutionPath | null> {
    // Implementation similar to swap-bridge-swap but optimized for native assets
    // This would be more efficient if fromToken is already a bridgeable asset
    const bridgeableAsset = this.getBridgeableAsset(fromChain, bridge);
    
    if (fromToken !== bridgeableAsset) {
      // This path requires a swap first, so it's the same as swap-bridge-swap
      return null;
    }
    
    // Continue with bridge + swap logic...
    return null; // Simplified for brevity
  }

  /**
   * Fetch DEX quote
   */
  private async fetchDEXQuote(
    chain: Chain,
    dex: string,
    fromToken: string,
    toToken: string,
    amountIn: number
  ): Promise<{
    amountOut: number;
    feeUSD: number;
    gasUSD: number;
    slippage: number;
    liquidity: number;
  } | null> {
    try {
      // Simulate DEX quote fetching
      // In production, integrate with 1inch API, Jupiter API, etc.
      
      const gasPrice = this.getChainGasPrice(chain);
      const feePercent = this.getDEXFeePercent(dex);
      
      return {
        amountOut: amountIn * (1 - feePercent / 100) * (1 - 0.005), // 0.5% slippage
        feeUSD: amountIn * (feePercent / 100),
        gasUSD: gasPrice,
        slippage: 0.5,
        liquidity: 1000000, // $1M default liquidity
      };
    } catch (error) {
      console.error(`Error fetching ${dex} quote:`, error);
      return null;
    }
  }

  /**
   * Fetch bridge quote
   */
  private async fetchBridgeQuote(
    fromChain: Chain,
    toChain: Chain,
    bridge: string,
    asset: string,
    amountIn: number
  ): Promise<{
    amountOut: number;
    feeUSD: number;
    gasUSD: number;
    slippage: number;
    durationSeconds: number;
  } | null> {
    try {
      // Simulate bridge quote fetching
      // In production, integrate with Across, Stargate, Hop, etc. APIs
      
      const bridgeFee = this.getBridgeFee(bridge, amountIn);
      const gasPrice = this.getChainGasPrice(fromChain) + this.getChainGasPrice(toChain);
      const duration = this.getBridgeDuration(bridge, fromChain, toChain);
      
      return {
        amountOut: amountIn - bridgeFee,
        feeUSD: bridgeFee,
        gasUSD: gasPrice,
        slippage: 0.1, // Bridges typically have low slippage
        durationSeconds: duration,
      };
    } catch (error) {
      console.error(`Error fetching ${bridge} quote:`, error);
      return null;
    }
  }

  /**
   * Validate path against risk budget
   */
  private validatePath(path: ExecutionPath, budget: RiskBudget): boolean {
    if (path.estimatedSlippage > budget.maxSlippagePercent) {
      return false;
    }
    
    if (path.totalGasUSD > budget.maxGasUSD) {
      return false;
    }
    
    if (path.executionTimeSeconds > budget.maxExecutionTimeSeconds) {
      return false;
    }
    
    // Check if all chains in path are allowed
    const pathChains = new Set(path.steps.map(s => s.chain));
    for (const chain of pathChains) {
      if (!budget.allowedChains.includes(chain)) {
        return false;
      }
    }
    
    // Check if all bridges in path are allowed
    const pathBridges = path.steps
      .filter(s => s.type === 'BRIDGE')
      .map(s => s.protocol);
    
    for (const bridge of pathBridges) {
      if (!budget.allowedBridges.includes(bridge)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidenceScore(liquidity: number, slippage: number, protocol: string): number {
    let score = 0;
    
    // Liquidity score (0-40 points)
    if (liquidity > 1000000) score += 40;
    else if (liquidity > 500000) score += 30;
    else if (liquidity > 100000) score += 20;
    else score += 10;
    
    // Slippage score (0-30 points)
    if (slippage < 0.3) score += 30;
    else if (slippage < 0.5) score += 20;
    else if (slippage < 1.0) score += 10;
    
    // Protocol reputation score (0-30 points)
    const establishedProtocols = ['1inch', 'uniswap', 'jupiter', 'pancakeswap'];
    if (establishedProtocols.includes(protocol)) score += 30;
    else score += 15;
    
    return Math.min(100, score);
  }

  /**
   * Calculate path confidence
   */
  private calculatePathConfidence(steps: ExecutionStep[], bridge: string): number {
    const avgStepConfidence = steps.reduce((sum, step) => {
      return sum + this.calculateConfidenceScore(1000000, step.slippage, step.protocol);
    }, 0) / steps.length;
    
    // Adjust for bridge reputation
    const bridgeBonus = ['across', 'stargate', 'hop'].includes(bridge) ? 10 : 0;
    
    return Math.min(100, avgStepConfidence + bridgeBonus);
  }

  /**
   * Calculate savings vs CEX
   */
  private calculateSavingsVsCEX(costUSD: number, amountIn: number): number {
    const cexFeePercent = 0.1; // 0.1% typical CEX fee
    const cexCost = amountIn * (cexFeePercent / 100);
    
    return ((cexCost - costUSD) / cexCost) * 100;
  }

  /**
   * Get bridgeable asset for a chain/bridge combination
   */
  private getBridgeableAsset(chain: Chain, bridge: string): string {
    // Most bridges support USDC/USDT/ETH
    return 'USDC';
  }

  /**
   * Get chain gas price
   */
  private getChainGasPrice(chain: Chain): number {
    const gasPrices: Record<Chain, number> = {
      [Chain.ETHEREUM]: 15,
      [Chain.BASE]: 0.5,
      [Chain.BSC]: 0.3,
      [Chain.SOLANA]: 0.0001,
      [Chain.ARBITRUM]: 1,
      [Chain.OPTIMISM]: 1,
      [Chain.POLYGON]: 0.5,
    };
    
    return gasPrices[chain] || 1;
  }

  /**
   * Get DEX fee percent
   */
  private getDEXFeePercent(dex: string): number {
    const fees: Record<string, number> = {
      'uniswap': 0.3,
      '1inch': 0.1,
      'pancakeswap': 0.25,
      'jupiter': 0.1,
      'sushiswap': 0.3,
      'curve': 0.04,
    };
    
    return fees[dex] || 0.3;
  }

  /**
   * Get bridge fee
   */
  private getBridgeFee(bridge: string, amountIn: number): number {
    const feePercents: Record<string, number> = {
      'across': 0.05,
      'stargate': 0.06,
      'hop': 0.04,
      'synapse': 0.08,
      'celer': 0.1,
      'connext': 0.05,
      'axelar': 0.1,
    };
    
    const feePercent = feePercents[bridge] || 0.1;
    return amountIn * (feePercent / 100);
  }

  /**
   * Get bridge duration
   */
  private getBridgeDuration(bridge: string, fromChain: Chain, toChain: Chain): number {
    // Across is fastest, others vary
    const baseDurations: Record<string, number> = {
      'across': 60,     // 1 minute
      'stargate': 120,  // 2 minutes
      'hop': 180,       // 3 minutes
      'synapse': 300,   // 5 minutes
      'celer': 240,     // 4 minutes
      'connext': 180,   // 3 minutes
      'axelar': 300,    // 5 minutes
    };
    
    return baseDurations[bridge] || 180;
  }

  /**
   * Execute optimal path
   */
  async executeOptimalPath(
    path: ExecutionPath,
    agentId: string
  ): Promise<{ success: boolean; txHashes: string[]; error?: string }> {
    console.log(`\n🚀 Executing optimal path ${path.id}`);
    console.log(`   Steps: ${path.steps.length}`);
    console.log(`   Total cost: $${path.totalCostUSD.toFixed(2)}`);
    console.log(`   Expected time: ${path.executionTimeSeconds}s`);
    
    const txHashes: string[] = [];
    
    try {
      for (const [index, step] of path.steps.entries()) {
        console.log(`\n   Step ${index + 1}/${path.steps.length}: ${step.type} on ${step.chain}`);
        console.log(`   Protocol: ${step.protocol}`);
        console.log(`   ${step.fromToken} → ${step.toToken}`);
        
        let txHash: string;
        
        if (step.type === 'SWAP') {
          txHash = await this.executeSwap(step, agentId);
        } else if (step.type === 'BRIDGE') {
          txHash = await this.executeBridge(step, agentId);
        } else {
          // APPROVAL
          txHash = await this.executeApproval(step, agentId);
        }
        
        txHashes.push(txHash);
        console.log(`   ✅ Transaction: ${txHash}`);
        
        // Record step in database
        await this.recordExecutionStep(path.id, step, txHash, agentId);
      }
      
      console.log(`\n✅ Path execution complete!`);
      console.log(`   Total transactions: ${txHashes.length}`);
      
      return { success: true, txHashes };
    } catch (error) {
      console.error(`\n❌ Path execution failed:`, error);
      return {
        success: false,
        txHashes,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute swap step
   */
  private async executeSwap(step: ExecutionStep, agentId: string): Promise<string> {
    // Integrate with actual DEX APIs (1inch, Jupiter, etc.)
    // This is a placeholder
    return `0x${Math.random().toString(16).substring(2, 66)}`;
  }

  /**
   * Execute bridge step
   */
  private async executeBridge(step: ExecutionStep, agentId: string): Promise<string> {
    // Integrate with actual bridge APIs (Across, Stargate, etc.)
    // This is a placeholder
    return `0x${Math.random().toString(16).substring(2, 66)}`;
  }

  /**
   * Execute approval step
   */
  private async executeApproval(step: ExecutionStep, agentId: string): Promise<string> {
    // Execute token approval
    return `0x${Math.random().toString(16).substring(2, 66)}`;
  }

  /**
   * Record execution step in database
   */
  private async recordExecutionStep(
    pathId: string,
    step: ExecutionStep,
    txHash: string,
    agentId: string
  ): Promise<void> {
    await prisma.crossChainExecution.create({
      data: {
        pathId,
        agentId,
        stepType: step.type,
        chain: step.chain,
        protocol: step.protocol,
        fromToken: step.fromToken,
        toToken: step.toToken,
        amountIn: step.amountIn,
        amountOut: step.amountOut,
        feeUSD: step.feeUSD,
        gasUSD: step.gasUSD,
        slippage: step.slippage,
        txHash,
        status: 'COMPLETED',
        timestamp: new Date(),
      },
    });
  }
}

// Export singleton instance
export const crossChainRouter = new CrossChainRouter();
