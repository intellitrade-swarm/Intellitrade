
/**
 * Real Trading Execution Library
 * Handles trading through 1inch DEX Aggregator (On-Chain Trading) for EVM
 * and Jupiter DEX for Solana
 * Autonomous AI Agent Trading with Direct Blockchain Execution
 */

import { ethers } from 'ethers';
import { ChainName, TOKEN_ADDRESSES } from './blockchain-config';
import { decryptPrivateKey } from './wallet';
import { prisma } from './db';
import * as OneInch from './oneinch';
import * as Jupiter from './jupiter';
import * as Solana from './solana';

// Map blockchain config chain names to 1inch chain names
const CHAIN_MAP: Record<ChainName, string> = {
  ethereum: 'ethereum',
  base: 'base',
  bsc: 'bsc',
};

interface RealTradeResult {
  success: boolean;
  trade?: any;
  error?: string;
  txHash?: string;
}

/**
 * Execute a real on-chain trade using 1inch DEX Aggregator
 */
export async function executeRealTrade(
  agent: any,
  symbol: string,
  action: 'BUY' | 'SELL',
  usdAmount: number,
  marketPrice: number
): Promise<RealTradeResult> {
  try {
    if (!agent.walletAddress || !agent.encryptedPrivateKey) {
      return {
        success: false,
        error: 'Agent does not have wallet configured'
      };
    }

    // Auto-detect the correct chain based on the token being traded
    const defaultChain = (agent.primaryChain || 'base') as ChainName;
    const correctChain = OneInch.getChainForToken(symbol, CHAIN_MAP[defaultChain]);
    const chain = correctChain as ChainName;
    const oneInchChain = correctChain;
    
    console.log(`🔗 Trading ${symbol} on ${chain.toUpperCase()} chain (auto-selected)`);
    
    // Get current balances
    const balances = await OneInch.getTradingBalances(oneInchChain, agent.walletAddress);
    
    console.log(`💰 ${agent.name} wallet balance:`, {
      chain,
      native: `${balances.native.toFixed(4)} ${balances.nativeSymbol}`,
      usdc: `$${balances.usdc.toFixed(2)}`,
      total: `$${balances.totalUsd.toFixed(2)}`
    });

    // Determine token addresses for the swap
    let tokenIn: string;
    let tokenOut: string;
    let amountIn: string;

    if (action === 'BUY') {
      // BUY: Native token (ETH/BNB) -> Target token
      const nativePrice = await OneInch.getCurrentPrice(balances.nativeSymbol);
      const nativeAmount = usdAmount / nativePrice;
      
      // Check if we have enough native tokens
      if (balances.native < nativeAmount * 1.1) { // 10% buffer for gas
        return {
          success: false,
          error: `Insufficient ${balances.nativeSymbol} balance: have ${balances.native.toFixed(4)}, need ${(nativeAmount * 1.1).toFixed(4)}`
        };
      }
      
      tokenIn = ethers.ZeroAddress; // Native token
      tokenOut = OneInch.getTokenAddress(symbol, oneInchChain);
      amountIn = ethers.parseEther(nativeAmount.toFixed(18)).toString();
      
    } else {
      // SELL: Target token -> Native token (ETH/BNB)
      const tokenAmount = usdAmount / marketPrice;
      
      tokenIn = OneInch.getTokenAddress(symbol, oneInchChain);
      tokenOut = ethers.ZeroAddress; // Native token
      
      // For ERC20 tokens, we need to use the proper decimals
      amountIn = ethers.parseUnits(tokenAmount.toFixed(18), 18).toString();
    }

    console.log(`🚀 Executing ${action} trade via 1inch:`, {
      agent: agent.name,
      chain,
      symbol,
      usdAmount: `$${usdAmount.toFixed(2)}`,
      tokenIn,
      tokenOut,
      amountIn
    });

    // Decrypt the private key
    const privateKey = decryptPrivateKey(agent.encryptedPrivateKey);

    // Execute the swap on 1inch
    const swapResult = await OneInch.executeSwap(
      oneInchChain,
      tokenIn,
      tokenOut,
      amountIn,
      privateKey,
      1 // 1% slippage
    );

    if (!swapResult.success) {
      return {
        success: false,
        error: swapResult.error || 'Swap execution failed'
      };
    }

    // Record the trade in database
    const trade = await prisma.trade.create({
      data: {
        agentId: agent.id,
        symbol,
        type: 'SPOT',
        side: action,
        quantity: usdAmount / marketPrice,
        entryPrice: marketPrice,
        strategy: agent.strategyType,
        confidence: 0.8,
        status: 'CLOSED', // Spot trades are immediately closed
        isRealTrade: true,
        txHash: swapResult.txHash,
        blockNumber: swapResult.blockNumber ? BigInt(swapResult.blockNumber) : null,
        chain,
        profitLoss: 0,
        exitPrice: marketPrice,
        exitTime: new Date(),
        entryTime: new Date(),
      },
    });

    console.log(`✅ Real trade executed successfully via 1inch:`, {
      agent: agent.name,
      txHash: swapResult.txHash,
      blockNumber: swapResult.blockNumber
    });

    return {
      success: true,
      trade,
      txHash: swapResult.txHash
    };

  } catch (error) {
    console.error('Error executing real trade:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Execute a real Solana trade using Jupiter DEX Aggregator
 */
export async function executeSolanaRealTrade(
  agent: any,
  symbol: string,
  action: 'BUY' | 'SELL',
  usdAmount: number,
  marketPrice: number
): Promise<RealTradeResult> {
  try {
    if (!agent.solanaWalletAddress || !agent.solanaPrivateKey) {
      return {
        success: false,
        error: 'Agent does not have Solana wallet configured'
      };
    }

    // Get SOL balance and price
    const solBalance = await Solana.getSolBalance(agent.solanaWalletAddress);
    const solPrice = await Solana.getSolPrice();
    const usdBalance = solBalance * solPrice;

    console.log(`💰 ${agent.name} Solana wallet balance:`, {
      sol: `${solBalance.toFixed(4)} SOL`,
      usd: `$${usdBalance.toFixed(2)}`
    });

    let swapResult;
    const SOL_MINT = 'So11111111111111111111111111111111111111112';
    const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

    if (action === 'BUY') {
      // BUY: SOL -> Target token (if SOL, just hold. Otherwise swap to token)
      if (symbol === 'SOL') {
        // Already have SOL, no need to trade
        return {
          success: false,
          error: 'Already holding SOL, no trade needed'
        };
      }

      // Calculate SOL amount to trade
      const solAmount = usdAmount / solPrice;
      
      // Check if we have enough SOL (with buffer for gas)
      if (solBalance < solAmount * 1.02) { // 2% buffer for fees
        return {
          success: false,
          error: `Insufficient SOL balance: have ${solBalance.toFixed(4)}, need ${(solAmount * 1.02).toFixed(4)}`
        };
      }

      // For now, we'll swap SOL to USDC as a proxy for "buying"
      // In future, we can add more token mints
      const lamports = Math.floor(solAmount * 1e9);
      const quote = await Jupiter.getJupiterQuote(SOL_MINT, USDC_MINT, lamports);
      
      if (!quote) {
        return {
          success: false,
          error: 'Failed to get Jupiter quote'
        };
      }

      swapResult = await Jupiter.executeJupiterSwap(agent.solanaPrivateKey, quote);

    } else {
      // SELL: For Solana, we'll swap USDC back to SOL
      // This is a simplified approach
      return {
        success: false,
        error: 'SELL trades on Solana not yet implemented - need USDC/token balance tracking'
      };
    }

    if (!swapResult?.success) {
      return {
        success: false,
        error: swapResult?.error || 'Jupiter swap execution failed'
      };
    }

    console.log(`🚀 Executed ${action} trade via Jupiter:`, {
      agent: agent.name,
      symbol,
      usdAmount: `$${usdAmount.toFixed(2)}`,
      signature: swapResult.signature
    });

    // Record the trade in database
    const trade = await prisma.trade.create({
      data: {
        agentId: agent.id,
        symbol,
        type: 'SPOT',
        side: action,
        quantity: usdAmount / marketPrice,
        entryPrice: marketPrice,
        strategy: agent.strategyType,
        confidence: 0.8,
        status: 'CLOSED',
        isRealTrade: true,
        txHash: swapResult.signature,
        chain: 'solana',
        profitLoss: 0,
        exitPrice: marketPrice,
        exitTime: new Date(),
        entryTime: new Date(),
      },
    });

    console.log(`✅ Solana trade executed successfully via Jupiter:`, {
      agent: agent.name,
      signature: swapResult.signature
    });

    return {
      success: true,
      trade,
      txHash: swapResult.signature
    };

  } catch (error) {
    console.error('Error executing Solana trade:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Execute a perpetual trade (now using 1inch spot trades instead)
 * Note: 1inch doesn't support perpetual trading, so we do spot trades
 */
export async function executeOneInchTrade(
  agent: any,
  symbol: string,
  action: 'BUY' | 'SELL',
  usdAmount: number,
  marketPrice: number,
  leverage: number = 1 // Leverage not supported on 1inch, kept for compatibility
): Promise<RealTradeResult> {
  // Use spot trading via 1inch
  return executeRealTrade(agent, symbol, action, usdAmount, marketPrice);
}

// Keep backward compatibility with old function names
export const executeCoinbaseTrade = executeOneInchTrade;
export const executeAsterDexTrade = executeOneInchTrade;
export const executeAvantisTrade = executeOneInchTrade;

/**
 * Get trading balance using 1inch
 */
export async function getOneInchBalance(
  walletAddress: string,
  chain: ChainName = 'base'
): Promise<{ eth: number; usdc: number; totalUsd: number }> {
  try {
    const oneInchChain = CHAIN_MAP[chain];
    const balances = await OneInch.getTradingBalances(oneInchChain, walletAddress);
    
    return {
      eth: balances.native,
      usdc: balances.usdc,
      totalUsd: balances.totalUsd
    };
  } catch (error) {
    console.error('Error getting 1inch balance:', error);
    return { eth: 0, usdc: 0, totalUsd: 0 };
  }
}

// Keep backward compatibility
export const getCoinbaseBalance = getOneInchBalance;
export const getAsterDexBalance = getOneInchBalance;
export const getAvantisBalance = getOneInchBalance;

export async function getAvantisUSDCBalance(walletAddress: string): Promise<number> {
  const balance = await getOneInchBalance(walletAddress);
  return balance.usdc;
}

export async function getAvantisETHBalance(walletAddress: string): Promise<number> {
  const balance = await getOneInchBalance(walletAddress);
  return balance.eth;
}

/**
 * Calculate optimal trade size based on balance and risk parameters
 */
export function calculateTradeSize(
  balance: number,
  maxPositionPercent: number = 0.2,
  minTradeUsd: number = 1,
  maxTradeUsd: number = 10000
): number {
  const tradeSize = balance * maxPositionPercent;
  
  if (tradeSize < minTradeUsd) {
    return 0; // Don't trade if below minimum
  }
  
  return Math.min(tradeSize, maxTradeUsd);
}

/**
 * Estimate gas cost for a trade
 */
export function estimateGasCost(
  chain: ChainName,
  gasPriceGwei: number = 20
): number {
  // Approximate gas usage for DEX swap
  const gasLimit = 250000;
  const gasCost = gasLimit * gasPriceGwei * 1e-9; // Convert to ETH
  
  // Convert to USD (assuming $2500 ETH)
  const ethPrice = 2500;
  return gasCost * ethPrice;
}
