

import { ethers, JsonRpcProvider } from 'ethers';
import { BLOCKCHAIN_CONFIG, ChainName, TOKEN_ADDRESSES } from './blockchain-config';

// ERC20 ABI (minimal for balance and decimals)
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
];

// Uniswap V2 Pair ABI (for price feeds)
const UNISWAP_V2_PAIR_ABI = [
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() view returns (address)',
  'function token1() view returns (address)',
];

// Chainlink Price Feed ABI
const CHAINLINK_AGGREGATOR_ABI = [
  'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
  'function decimals() view returns (uint8)',
];

// Chainlink Price Feed addresses (most reliable source)
const CHAINLINK_FEEDS = {
  ethereum: {
    'BTC/USD': '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
    'ETH/USD': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    'BNB/USD': '0x14e613AC84a31f709eadbdF89C6CC390fDc9540A',
    'SOL/USD': '0x4ffC43a60e009B551865A93d232E33Fce9f01507',
    'ADA/USD': '0xAE48c91dF1fE419994FFDa27da09D5aC69c30f55',
    'DOGE/USD': '0x2465CefD3b488BE410b941b1d4b2767088e2A028',
  },
} as const;

interface PriceData {
  price: number;
  source: 'chainlink' | 'dex' | 'fallback';
  timestamp: Date;
  chain: string;
}

// Cache for providers to avoid creating new instances
const providerCache: Map<ChainName, JsonRpcProvider> = new Map();

export function getProvider(chain: ChainName): JsonRpcProvider {
  if (!providerCache.has(chain)) {
    const config = BLOCKCHAIN_CONFIG[chain];
    const provider = new JsonRpcProvider(config.rpcUrl);
    providerCache.set(chain, provider);
  }
  return providerCache.get(chain)!;
}

/**
 * Fetch price from Chainlink oracle (most reliable)
 */
async function fetchChainlinkPrice(symbol: string): Promise<PriceData | null> {
  try {
    const feedAddress = CHAINLINK_FEEDS.ethereum[`${symbol}/USD` as keyof typeof CHAINLINK_FEEDS.ethereum];
    if (!feedAddress) {
      return null;
    }

    const provider = getProvider('ethereum');
    const priceFeed = new ethers.Contract(feedAddress, CHAINLINK_AGGREGATOR_ABI, provider);

    const [roundData, decimals] = await Promise.all([
      priceFeed.latestRoundData(),
      priceFeed.decimals(),
    ]);

    const price = Number(roundData.answer) / Math.pow(10, Number(decimals));

    return {
      price,
      source: 'chainlink',
      timestamp: new Date(Number(roundData.updatedAt) * 1000),
      chain: 'ethereum',
    };
  } catch (error) {
    console.error(`Error fetching Chainlink price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get current block number for a chain
 */
export async function getBlockNumber(chain: ChainName): Promise<number> {
  try {
    const provider = getProvider(chain);
    return await provider.getBlockNumber();
  } catch (error) {
    console.error(`Error getting block number for ${chain}:`, error);
    return 0;
  }
}

/**
 * Get native token balance
 */
export async function getBalance(chain: ChainName, address: string): Promise<string> {
  try {
    const provider = getProvider(chain);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error(`Error getting balance for ${address} on ${chain}:`, error);
    return '0';
  }
}

/**
 * Get ERC20 token balance
 */
export async function getTokenBalance(
  chain: ChainName,
  tokenAddress: string,
  walletAddress: string
): Promise<string> {
  try {
    const provider = getProvider(chain);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const [balance, decimals] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.decimals(),
    ]);
    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    console.error(`Error getting token balance:`, error);
    return '0';
  }
}

/**
 * Fetch live crypto prices from blockchain oracles
 */
export async function fetchBlockchainPrices(): Promise<Map<string, PriceData>> {
  const priceMap = new Map<string, PriceData>();
  const symbols = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'DOGE'];

  // Fetch all prices in parallel using Chainlink oracles
  const pricePromises = symbols.map(async (symbol) => {
    const priceData = await fetchChainlinkPrice(symbol);
    if (priceData) {
      priceMap.set(symbol, priceData);
    }
    return { symbol, priceData };
  });

  await Promise.all(pricePromises);

  return priceMap;
}

/**
 * Get gas price for a chain
 */
export async function getGasPrice(chain: ChainName): Promise<bigint> {
  try {
    const provider = getProvider(chain);
    const feeData = await provider.getFeeData();
    return feeData.gasPrice || BigInt(0);
  } catch (error) {
    console.error(`Error getting gas price for ${chain}:`, error);
    return BigInt(0);
  }
}

/**
 * Monitor blockchain health across all chains
 */
export async function getBlockchainHealth() {
  const healthPromises = Object.entries(BLOCKCHAIN_CONFIG).map(async ([chainKey, config]) => {
    const chain = chainKey as ChainName;
    try {
      const provider = getProvider(chain);
      const [blockNumber, gasPrice, network] = await Promise.all([
        provider.getBlockNumber(),
        getGasPrice(chain),
        provider.getNetwork(),
      ]);

      return {
        chain: config.name,
        chainId: Number(network.chainId),
        blockNumber,
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        status: 'healthy',
        rpcUrl: config.rpcUrl.split('/')[2], // Just show domain
      };
    } catch (error) {
      return {
        chain: config.name,
        chainId: config.chainId,
        blockNumber: 0,
        gasPrice: '0',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        rpcUrl: config.rpcUrl.split('/')[2],
      };
    }
  });

  return Promise.all(healthPromises);
}

/**
 * Get transaction details
 */
export async function getTransaction(chain: ChainName, txHash: string) {
  try {
    const provider = getProvider(chain);
    const [tx, receipt] = await Promise.all([
      provider.getTransaction(txHash),
      provider.getTransactionReceipt(txHash),
    ]);

    return {
      transaction: tx,
      receipt,
      success: receipt?.status === 1,
    };
  } catch (error) {
    console.error(`Error getting transaction ${txHash}:`, error);
    return null;
  }
}

export type { PriceData };
