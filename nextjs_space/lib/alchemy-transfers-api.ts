
/**
 * Alchemy Transfers API Integration
 * Track asset movements and trading activity in real-time
 */

import { getAlchemyApiEndpoint, type AlchemyChain } from './alchemy-config';

interface Transfer {
  blockNum: string;
  hash: string;
  from: string;
  to: string;
  value: string | null;
  asset: string;
  category: string;
  timestamp?: string;
}

interface AssetTransfersResponse {
  transfers: Transfer[];
  pageKey?: string;
}

/**
 * Get asset transfers for a wallet
 */
export async function getAssetTransfers(
  chain: AlchemyChain,
  params: {
    fromAddress?: string;
    toAddress?: string;
    fromBlock?: string;
    toBlock?: string;
    contractAddresses?: string[];
    category?: ('external' | 'internal' | 'erc20' | 'erc721' | 'erc1155')[];
    maxCount?: number;
    pageKey?: string;
  }
): Promise<AssetTransfersResponse> {
  try {
    const endpoint = getAlchemyApiEndpoint(chain);
    
    const requestParams: any = {
      fromBlock: params.fromBlock || '0x0',
      toBlock: params.toBlock || 'latest',
      category: params.category || ['external', 'erc20'],
      withMetadata: true,
      maxCount: params.maxCount || 1000,
    };

    if (params.fromAddress) {
      requestParams.fromAddress = params.fromAddress;
    }

    if (params.toAddress) {
      requestParams.toAddress = params.toAddress;
    }

    if (params.contractAddresses) {
      requestParams.contractAddresses = params.contractAddresses;
    }

    if (params.pageKey) {
      requestParams.pageKey = params.pageKey;
    }

    const response = await fetch(`${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getAssetTransfers',
        params: [requestParams],
        id: Date.now(),
      }),
    });

    if (!response.ok) {
      console.error(`[Alchemy Transfers API] Request failed: ${response.statusText}`);
      return { transfers: [] };
    }

    const data = await response.json();
    
    if (data.error) {
      console.error(`[Alchemy Transfers API] Error:`, data.error);
      return { transfers: [] };
    }

    return {
      transfers: data.result?.transfers || [],
      pageKey: data.result?.pageKey,
    };
  } catch (error) {
    console.error('[Alchemy Transfers API] Error getting asset transfers:', error);
    return { transfers: [] };
  }
}

/**
 * Track recent trading activity for an agent wallet
 */
export async function getRecentTradingActivity(
  chain: AlchemyChain,
  walletAddress: string,
  lookbackBlocks: number = 1000
): Promise<Transfer[]> {
  try {
    const currentBlock = await getCurrentBlockNumber(chain);
    const fromBlock = `0x${(currentBlock - lookbackBlocks).toString(16)}`;

    // Get both sent and received transfers
    const [sentTransfers, receivedTransfers] = await Promise.all([
      getAssetTransfers(chain, {
        fromAddress: walletAddress,
        fromBlock,
        category: ['external', 'erc20'],
      }),
      getAssetTransfers(chain, {
        toAddress: walletAddress,
        fromBlock,
        category: ['external', 'erc20'],
      }),
    ]);

    // Combine and sort by block number
    const allTransfers = [
      ...sentTransfers.transfers,
      ...receivedTransfers.transfers,
    ].sort((a, b) => parseInt(b.blockNum, 16) - parseInt(a.blockNum, 16));

    return allTransfers;
  } catch (error) {
    console.error('[Alchemy Transfers API] Error getting trading activity:', error);
    return [];
  }
}

/**
 * Get current block number
 */
async function getCurrentBlockNumber(chain: AlchemyChain): Promise<number> {
  try {
    const endpoint = getAlchemyApiEndpoint(chain);
    
    const response = await fetch(`${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: Date.now(),
      }),
    });

    const data = await response.json();
    return parseInt(data.result, 16);
  } catch (error) {
    console.error('[Alchemy Transfers API] Error getting block number:', error);
    return 0;
  }
}

/**
 * Calculate trading volume for a wallet
 */
export async function calculateTradingVolume(
  chain: AlchemyChain,
  walletAddress: string,
  timeframeBlocks: number = 7200 // ~1 day on Base
): Promise<{
  totalVolume: number;
  transferCount: number;
  uniqueTokens: Set<string>;
}> {
  try {
    const transfers = await getRecentTradingActivity(chain, walletAddress, timeframeBlocks);

    const uniqueTokens = new Set<string>();
    let totalVolume = 0;

    transfers.forEach(transfer => {
      if (transfer.asset) {
        uniqueTokens.add(transfer.asset);
      }
      if (transfer.value) {
        totalVolume += parseFloat(transfer.value);
      }
    });

    return {
      totalVolume,
      transferCount: transfers.length,
      uniqueTokens,
    };
  } catch (error) {
    console.error('[Alchemy Transfers API] Error calculating trading volume:', error);
    return {
      totalVolume: 0,
      transferCount: 0,
      uniqueTokens: new Set(),
    };
  }
}
