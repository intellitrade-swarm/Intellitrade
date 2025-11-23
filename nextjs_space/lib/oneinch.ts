
/**
 * 1inch DEX Aggregator Integration
 * Autonomous on-chain trading for Ethereum, Base, BSC, and more
 * AI Agent → Detects Signal → Signs Tx → Submits to Blockchain → Trades Crypto
 */

import { ethers } from 'ethers';

// 1inch API v6.0 endpoints for different chains
const ONEINCH_API_BASE = 'https://api.1inch.dev/swap/v6.0';

// Chain IDs supported by 1inch
export const CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  base: 8453,
  bsc: 56,
  polygon: 137,
  arbitrum: 42161,
  optimism: 10,
};

// Token addresses for major tokens
export const TOKEN_ADDRESSES: Record<number, Record<string, string>> = {
  1: { // Ethereum
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  },
  8453: { // Base
    WETH: '0x4200000000000000000000000000000000000006',
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDbC: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
  },
  56: { // BSC
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    BTCB: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
  },
};

interface QuoteResponse {
  dstAmount: string;
  estimatedGas: string;
}

interface SwapResponse {
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gas: string;
    gasPrice?: string;
  };
}

interface TradeResult {
  success: boolean;
  txHash?: string;
  error?: string;
  blockNumber?: number;
}

/**
 * Get RPC provider for a specific chain
 */
function getProvider(chain: string): ethers.JsonRpcProvider {
  const rpcUrls: Record<string, string> = {
    ethereum: process.env.ETH_RPC_URL || 'https://rpc.ankr.com/eth',
    base: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    bsc: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
  };

  const rpcUrl = rpcUrls[chain];
  if (!rpcUrl) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Get signer from private key
 */
function getSigner(privateKey: string, chain: string): ethers.Wallet {
  if (!privateKey) {
    throw new Error('Private key is required for trading');
  }
  return new ethers.Wallet(privateKey, getProvider(chain));
}

/**
 * Get 1inch API headers (if you have an API key, otherwise it's open)
 */
function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'accept': 'application/json',
  };

  // Optional: Add 1inch API key if available for higher rate limits
  if (process.env.ONEINCH_API_KEY) {
    headers['Authorization'] = `Bearer ${process.env.ONEINCH_API_KEY}`;
  }

  return headers;
}

/**
 * Get a price quote from 1inch
 */
export async function getQuote(
  chain: string,
  fromToken: string,
  toToken: string,
  amount: string
): Promise<QuoteResponse> {
  const chainId = CHAIN_IDS[chain];
  if (!chainId) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  const url = `${ONEINCH_API_BASE}/${chainId}/quote`;
  const params = new URLSearchParams({
    src: fromToken,
    dst: toToken,
    amount: amount,
  });

  const response = await fetch(`${url}?${params.toString()}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`1inch quote failed: ${error}`);
  }

  return response.json();
}

/**
 * Get swap transaction data from 1inch
 */
export async function getSwapData(
  chain: string,
  fromToken: string,
  toToken: string,
  amount: string,
  fromAddress: string,
  slippage: number = 1
): Promise<SwapResponse> {
  const chainId = CHAIN_IDS[chain];
  if (!chainId) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  const url = `${ONEINCH_API_BASE}/${chainId}/swap`;
  const params = new URLSearchParams({
    src: fromToken,
    dst: toToken,
    amount: amount,
    from: fromAddress,
    slippage: slippage.toString(),
    disableEstimate: 'false',
    allowPartialFill: 'false',
  });

  const response = await fetch(`${url}?${params.toString()}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`1inch swap data failed: ${error}`);
  }

  return response.json();
}

/**
 * Check token allowance
 */
export async function checkAllowance(
  chain: string,
  tokenAddress: string,
  walletAddress: string,
  spenderAddress: string
): Promise<bigint> {
  const provider = getProvider(chain);
  const erc20Abi = [
    'function allowance(address owner, address spender) external view returns (uint256)',
  ];
  
  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
  return await tokenContract.allowance(walletAddress, spenderAddress);
}

/**
 * Approve token for 1inch router
 */
export async function approveToken(
  chain: string,
  tokenAddress: string,
  spenderAddress: string,
  amount: string,
  privateKey: string
): Promise<string> {
  const signer = getSigner(privateKey, chain);
  const erc20Abi = [
    'function approve(address spender, uint256 amount) external returns (bool)',
  ];
  
  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer);
  const tx = await tokenContract.approve(spenderAddress, amount);
  await tx.wait();
  
  console.log('✅ Token approved:', tx.hash);
  return tx.hash;
}

/**
 * Get native token balance (ETH, BNB, etc.)
 */
export async function getNativeBalance(chain: string, address: string): Promise<number> {
  try {
    const provider = getProvider(chain);
    const balance = await provider.getBalance(address);
    return parseFloat(ethers.formatEther(balance));
  } catch (error) {
    console.error('Error fetching native balance:', error);
    return 0;
  }
}

/**
 * Get ERC20 token balance
 */
export async function getTokenBalance(
  chain: string,
  tokenAddress: string,
  walletAddress: string,
  decimals: number = 18
): Promise<number> {
  try {
    const provider = getProvider(chain);
    const erc20Abi = [
      'function balanceOf(address account) external view returns (uint256)',
    ];
    
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    const balance = await tokenContract.balanceOf(walletAddress);
    return parseFloat(ethers.formatUnits(balance, decimals));
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
  }
}

/**
 * Get trading balances (native + USDC)
 */
export async function getTradingBalances(
  chain: string,
  address: string
): Promise<{ native: number; usdc: number; totalUsd: number; nativeSymbol: string }> {
  try {
    const nativeBalance = await getNativeBalance(chain, address);
    
    // Get USDC balance based on chain
    const chainId = CHAIN_IDS[chain];
    const usdcAddress = TOKEN_ADDRESSES[chainId]?.USDC || TOKEN_ADDRESSES[chainId]?.USDbC;
    const usdcBalance = usdcAddress ? await getTokenBalance(chain, usdcAddress, address, 6) : 0;
    
    // Estimate native token price (simplified - in production, fetch real prices)
    const nativePrices: Record<string, number> = {
      ethereum: 2500,
      base: 2500,
      bsc: 600,
    };
    
    const nativePrice = nativePrices[chain] || 0;
    const totalUsd = (nativeBalance * nativePrice) + usdcBalance;
    
    const nativeSymbols: Record<string, string> = {
      ethereum: 'ETH',
      base: 'ETH',
      bsc: 'BNB',
    };
    
    return {
      native: nativeBalance,
      usdc: usdcBalance,
      totalUsd,
      nativeSymbol: nativeSymbols[chain] || 'NATIVE',
    };
  } catch (error) {
    console.error('Error fetching trading balances:', error);
    return { native: 0, usdc: 0, totalUsd: 0, nativeSymbol: 'NATIVE' };
  }
}

/**
 * Execute a token swap using 1inch
 */
export async function executeSwap(
  chain: string,
  fromToken: string,
  toToken: string,
  amount: string,
  privateKey: string,
  slippage: number = 1
): Promise<TradeResult> {
  try {
    const signer = getSigner(privateKey, chain);
    const address = await signer.getAddress();
    
    console.log(`🔄 Executing 1inch swap on ${chain}:`, {
      from: fromToken,
      to: toToken,
      amount,
      wallet: address,
    });
    
    // Check if we need to approve (for ERC20 tokens)
    const isNative = fromToken === ethers.ZeroAddress;
    
    if (!isNative) {
      // Get 1inch router address (we'll use a placeholder, typically fetched from 1inch)
      const routerAddress = '0x1111111254EEB25477B68fb85Ed929f73A960582'; // 1inch v5 Router
      
      const allowance = await checkAllowance(chain, fromToken, address, routerAddress);
      if (allowance < BigInt(amount)) {
        console.log('Approving token...');
        await approveToken(chain, fromToken, routerAddress, amount, privateKey);
      }
    }
    
    // Get swap data from 1inch
    const swapData = await getSwapData(chain, fromToken, toToken, amount, address, slippage);
    
    // Prepare transaction
    const tx = {
      to: swapData.tx.to,
      data: swapData.tx.data,
      value: swapData.tx.value,
      gasLimit: BigInt(swapData.tx.gas) * BigInt(120) / BigInt(100), // +20% gas buffer
    };
    
    console.log('⏳ Sending transaction...');
    const txResponse = await signer.sendTransaction(tx);
    
    console.log('⏳ Waiting for confirmation...');
    const receipt = await txResponse.wait();
    
    console.log(`✅ Swap executed successfully:`, {
      txHash: receipt?.hash,
      blockNumber: receipt?.blockNumber,
    });
    
    return {
      success: true,
      txHash: receipt?.hash,
      blockNumber: receipt?.blockNumber,
    };
    
  } catch (error) {
    console.error('❌ Swap execution failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get current market price for a token (simplified version using Coinbase API)
 */
export async function getCurrentPrice(symbol: string): Promise<number> {
  try {
    const normalized = symbol.replace(/USDT?$/i, '').replace(/USD$/i, '').toUpperCase();
    const response = await fetch(`https://api.coinbase.com/v2/prices/${normalized}-USD/spot`);
    const data = await response.json();
    return parseFloat(data.data.amount);
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    
    // Fallback prices
    const fallbackPrices: Record<string, number> = {
      BTC: 65000,
      ETH: 2500,
      SOL: 150,
      BNB: 600,
    };
    
    return fallbackPrices[symbol] || 0;
  }
}

/**
 * Token to native chain mapping
 * Maps each token to its primary/native blockchain
 */
export const TOKEN_NATIVE_CHAIN: Record<string, string> = {
  BNB: 'bsc',      // BNB is native to BSC
  WBNB: 'bsc',     // Wrapped BNB on BSC
  ETH: 'base',     // ETH trading on Base (cheaper gas than Ethereum mainnet)
  WETH: 'base',    // Wrapped ETH on Base
  BTC: 'ethereum', // WBTC is on Ethereum
  WBTC: 'ethereum',
  BTCB: 'bsc',     // Bitcoin on BSC
  USDC: 'base',    // USDC is multi-chain, Base has good liquidity
  USDT: 'ethereum', // USDT is multi-chain, default to Ethereum
};

/**
 * Get the correct chain for a given token
 */
export function getChainForToken(symbol: string, defaultChain: string = 'ethereum'): string {
  const normalizedSymbol = symbol.replace(/USD[T]?$/i, '').toUpperCase();
  
  // Check token-specific chain mapping
  const nativeChain = TOKEN_NATIVE_CHAIN[normalizedSymbol];
  if (nativeChain) {
    return nativeChain;
  }
  
  // If no specific mapping, use the default chain
  return defaultChain;
}

/**
 * Convert symbol to token address for a specific chain
 */
export function getTokenAddress(symbol: string, chain: string): string {
  const chainId = CHAIN_IDS[chain];
  if (!chainId) {
    throw new Error(`Unsupported chain: ${chain}`);
  }
  
  const normalizedSymbol = symbol.replace(/USD[T]?$/i, '').toUpperCase();
  const tokenMap: Record<string, string> = {
    ETH: 'WETH',
    BTC: 'WBTC',
    BNB: 'WBNB',
  };
  
  const lookupSymbol = tokenMap[normalizedSymbol] || normalizedSymbol;
  const tokens = TOKEN_ADDRESSES[chainId];
  
  if (!tokens) {
    throw new Error(`No tokens configured for chain ${chain}`);
  }
  
  const address = tokens[lookupSymbol];
  if (!address) {
    throw new Error(`Token ${symbol} not found on chain ${chain}. Hint: ${symbol} should be traded on ${getChainForToken(symbol, chain)} chain.`);
  }
  
  return address;
}

/**
 * Test 1inch connection
 */
export async function testConnection(chain: string = 'ethereum'): Promise<boolean> {
  try {
    const provider = getProvider(chain);
    const network = await provider.getNetwork();
    console.log('✅ Connected to network:', network.name, network.chainId);
    
    // Test price fetch
    const ethPrice = await getCurrentPrice('ETH');
    console.log('✅ ETH price:', ethPrice);
    
    return true;
  } catch (error) {
    console.error('❌ 1inch connection test failed:', error);
    return false;
  }
}
