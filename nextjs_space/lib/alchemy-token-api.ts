
/**
 * Alchemy Token API Integration
 * Real-time token prices, metadata, and market data
 */

import { getAlchemyApiEndpoint, type AlchemyChain } from './alchemy-config';

interface TokenPrice {
  symbol: string;
  address: string;
  price: number;
  currency: string;
  lastUpdated: number;
}

interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
  address: string;
}

interface TokenBalance {
  contractAddress: string;
  tokenBalance: string;
  symbol?: string;
  decimals?: number;
  name?: string;
}

/**
 * Get real-time token price using Alchemy
 */
export async function getTokenPrice(
  chain: AlchemyChain,
  tokenAddress: string
): Promise<TokenPrice | null> {
  try {
    const endpoint = getAlchemyApiEndpoint(chain);
    
    const response = await fetch(`${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getTokenPrice',
        params: [tokenAddress],
        id: Date.now(),
      }),
    });

    if (!response.ok) {
      console.error(`[Alchemy Token API] Failed to get token price: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    if (data.error) {
      console.error(`[Alchemy Token API] Error:`, data.error);
      return null;
    }

    if (data.result) {
      return {
        symbol: data.result.symbol || 'UNKNOWN',
        address: tokenAddress,
        price: parseFloat(data.result.price || '0'),
        currency: data.result.currency || 'USD',
        lastUpdated: Date.now(),
      };
    }

    return null;
  } catch (error) {
    console.error('[Alchemy Token API] Error getting token price:', error);
    return null;
  }
}

/**
 * Get token metadata
 */
export async function getTokenMetadata(
  chain: AlchemyChain,
  tokenAddress: string
): Promise<TokenMetadata | null> {
  try {
    const endpoint = getAlchemyApiEndpoint(chain);
    
    const response = await fetch(`${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getTokenMetadata',
        params: [tokenAddress],
        id: Date.now(),
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.error || !data.result) {
      return null;
    }

    return {
      name: data.result.name || 'Unknown',
      symbol: data.result.symbol || 'UNKNOWN',
      decimals: data.result.decimals || 18,
      logo: data.result.logo,
      address: tokenAddress,
    };
  } catch (error) {
    console.error('[Alchemy Token API] Error getting token metadata:', error);
    return null;
  }
}

/**
 * Get all token balances for a wallet
 */
export async function getTokenBalances(
  chain: AlchemyChain,
  walletAddress: string
): Promise<TokenBalance[]> {
  try {
    const endpoint = getAlchemyApiEndpoint(chain);
    
    const response = await fetch(`${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getTokenBalances',
        params: [walletAddress, 'erc20'],
        id: Date.now(),
      }),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    
    if (data.error || !data.result || !data.result.tokenBalances) {
      return [];
    }

    // Filter out zero balances and enrich with metadata
    const balances: TokenBalance[] = [];
    
    for (const balance of data.result.tokenBalances) {
      if (balance.tokenBalance !== '0x0' && balance.tokenBalance !== '0') {
        const metadata = await getTokenMetadata(chain, balance.contractAddress);
        
        balances.push({
          contractAddress: balance.contractAddress,
          tokenBalance: balance.tokenBalance,
          symbol: metadata?.symbol,
          decimals: metadata?.decimals,
          name: metadata?.name,
        });
      }
    }

    return balances;
  } catch (error) {
    console.error('[Alchemy Token API] Error getting token balances:', error);
    return [];
  }
}

/**
 * Get multiple token prices in batch
 */
export async function getBatchTokenPrices(
  chain: AlchemyChain,
  tokenAddresses: string[]
): Promise<Map<string, TokenPrice>> {
  const prices = new Map<string, TokenPrice>();

  // Process in parallel with limit
  const BATCH_SIZE = 10;
  for (let i = 0; i < tokenAddresses.length; i += BATCH_SIZE) {
    const batch = tokenAddresses.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(address => getTokenPrice(chain, address))
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        prices.set(batch[index], result.value);
      }
    });
  }

  return prices;
}
