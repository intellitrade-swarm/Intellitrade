
/**
 * Alchemy Enhanced Provider
 * Leverages Alchemy's superior RPC infrastructure for faster, more reliable blockchain interactions
 */

import { getAlchemyRpcUrl, isAlchemyConfigured, type AlchemyChain } from './alchemy-config';
import { BLOCKCHAIN_CONFIG } from './blockchain-config';

interface EnhancedRpcResponse {
  success: boolean;
  data?: any;
  error?: string;
  latency?: number;
}

/**
 * Make an enhanced RPC call using Alchemy
 */
export async function makeEnhancedRpcCall(
  chain: AlchemyChain,
  method: string,
  params: any[] = []
): Promise<EnhancedRpcResponse> {
  const startTime = Date.now();
  
  try {
    // Use Alchemy RPC if configured, otherwise fallback to default
    const rpcUrl = isAlchemyConfigured()
      ? getAlchemyRpcUrl(chain)
      : BLOCKCHAIN_CONFIG[chain === 'polygon' || chain === 'arbitrum' || chain === 'optimism' ? 'base' : chain]?.rpcUrl;

    if (!rpcUrl) {
      throw new Error(`No RPC URL found for chain: ${chain}`);
    }

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error(`RPC request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    if (data.error) {
      return {
        success: false,
        error: data.error.message || 'Unknown RPC error',
        latency,
      };
    }

    return {
      success: true,
      data: data.result,
      latency,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    console.error(`[Alchemy Enhanced Provider] Error making RPC call:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      latency,
    };
  }
}

/**
 * Get current gas price with Alchemy optimization
 */
export async function getEnhancedGasPrice(chain: AlchemyChain): Promise<{
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}> {
  try {
    // Try to get EIP-1559 gas price first
    const feeDataResponse = await makeEnhancedRpcCall(chain, 'eth_feeHistory', [
      '0x4', // 4 blocks
      'latest',
      [25, 50, 75], // percentiles
    ]);

    if (feeDataResponse.success && feeDataResponse.data) {
      const feeHistory = feeDataResponse.data;
      const baseFee = feeHistory.baseFeePerGas[feeHistory.baseFeePerGas.length - 1];
      const priorityFee = feeHistory.reward[feeHistory.reward.length - 1][1]; // median

      return {
        gasPrice: baseFee,
        maxFeePerGas: (BigInt(baseFee) * BigInt(2) + BigInt(priorityFee)).toString(),
        maxPriorityFeePerGas: priorityFee,
      };
    }

    // Fallback to legacy gas price
    const gasPriceResponse = await makeEnhancedRpcCall(chain, 'eth_gasPrice', []);
    
    if (gasPriceResponse.success && gasPriceResponse.data) {
      return {
        gasPrice: gasPriceResponse.data,
      };
    }

    throw new Error('Failed to get gas price');
  } catch (error) {
    console.error('[Alchemy Enhanced Provider] Error getting gas price:', error);
    // Return a safe default
    return {
      gasPrice: '0x3b9aca00', // 1 gwei
    };
  }
}

/**
 * Get block number with enhanced reliability
 */
export async function getEnhancedBlockNumber(chain: AlchemyChain): Promise<number | null> {
  const response = await makeEnhancedRpcCall(chain, 'eth_blockNumber', []);
  
  if (response.success && response.data) {
    return parseInt(response.data, 16);
  }
  
  return null;
}

/**
 * Get transaction receipt with retry logic
 */
export async function getEnhancedTransactionReceipt(
  chain: AlchemyChain,
  txHash: string
): Promise<any> {
  const maxRetries = 3;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    const response = await makeEnhancedRpcCall(chain, 'eth_getTransactionReceipt', [txHash]);
    
    if (response.success && response.data) {
      return response.data;
    }

    lastError = response.error;
    
    // Wait before retry (exponential backoff)
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  throw new Error(lastError || 'Failed to get transaction receipt');
}

/**
 * Simulate transaction before execution
 */
export async function simulateTransaction(
  chain: AlchemyChain,
  transaction: {
    from: string;
    to: string;
    data?: string;
    value?: string;
  }
): Promise<{ success: boolean; gasUsed?: string; error?: string }> {
  try {
    const response = await makeEnhancedRpcCall(chain, 'eth_call', [
      {
        from: transaction.from,
        to: transaction.to,
        data: transaction.data || '0x',
        value: transaction.value || '0x0',
      },
      'latest',
    ]);

    if (response.success) {
      // Estimate gas
      const gasResponse = await makeEnhancedRpcCall(chain, 'eth_estimateGas', [
        {
          from: transaction.from,
          to: transaction.to,
          data: transaction.data || '0x',
          value: transaction.value || '0x0',
        },
      ]);

      return {
        success: true,
        gasUsed: gasResponse.data,
      };
    }

    return {
      success: false,
      error: response.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Simulation failed',
    };
  }
}
