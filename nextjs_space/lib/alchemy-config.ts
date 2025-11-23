
/**
 * Alchemy API Configuration
 * Enhanced blockchain infrastructure with 99.99% uptime, real-time data streaming,
 * and advanced APIs for optimal trading performance
 */

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || '';

// Alchemy RPC endpoints for all supported chains
export const ALCHEMY_RPC_ENDPOINTS = {
  ethereum: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  base: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  polygon: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  arbitrum: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  optimism: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
} as const;

// Alchemy API endpoints
export const ALCHEMY_API_ENDPOINTS = {
  base: 'https://base-mainnet.g.alchemy.com/v2',
  ethereum: 'https://eth-mainnet.g.alchemy.com/v2',
  polygon: 'https://polygon-mainnet.g.alchemy.com/v2',
  arbitrum: 'https://arb-mainnet.g.alchemy.com/v2',
  optimism: 'https://opt-mainnet.g.alchemy.com/v2',
} as const;

export type AlchemyChain = keyof typeof ALCHEMY_RPC_ENDPOINTS;

// Enhanced blockchain configuration with Alchemy
export const ENHANCED_BLOCKCHAIN_CONFIG = {
  base: {
    name: 'Base',
    rpcUrl: ALCHEMY_RPC_ENDPOINTS.base,
    chainId: 8453,
    nativeToken: 'ETH',
    blockTime: 2,
    explorer: 'https://basescan.org',
    alchemySupported: true,
  },
  ethereum: {
    name: 'Ethereum',
    rpcUrl: ALCHEMY_RPC_ENDPOINTS.ethereum,
    chainId: 1,
    nativeToken: 'ETH',
    blockTime: 12,
    explorer: 'https://etherscan.io',
    alchemySupported: true,
  },
  polygon: {
    name: 'Polygon',
    rpcUrl: ALCHEMY_RPC_ENDPOINTS.polygon,
    chainId: 137,
    nativeToken: 'MATIC',
    blockTime: 2,
    explorer: 'https://polygonscan.com',
    alchemySupported: true,
  },
  arbitrum: {
    name: 'Arbitrum',
    rpcUrl: ALCHEMY_RPC_ENDPOINTS.arbitrum,
    chainId: 42161,
    nativeToken: 'ETH',
    blockTime: 0.25,
    explorer: 'https://arbiscan.io',
    alchemySupported: true,
  },
  optimism: {
    name: 'Optimism',
    rpcUrl: ALCHEMY_RPC_ENDPOINTS.optimism,
    chainId: 10,
    nativeToken: 'ETH',
    blockTime: 2,
    explorer: 'https://optimistic.etherscan.io',
    alchemySupported: true,
  },
} as const;

// Alchemy SDK configuration
export const ALCHEMY_SDK_CONFIG = {
  apiKey: ALCHEMY_API_KEY,
  network: 'base', // Default network
  maxRetries: 3,
  batchRequests: true,
};

/**
 * Get Alchemy RPC URL for a specific chain
 */
export function getAlchemyRpcUrl(chain: AlchemyChain): string {
  return ALCHEMY_RPC_ENDPOINTS[chain];
}

/**
 * Get Alchemy API endpoint
 */
export function getAlchemyApiEndpoint(chain: AlchemyChain): string {
  return `${ALCHEMY_API_ENDPOINTS[chain]}/${ALCHEMY_API_KEY}`;
}

/**
 * Check if Alchemy is configured
 */
export function isAlchemyConfigured(): boolean {
  return !!ALCHEMY_API_KEY && ALCHEMY_API_KEY !== '';
}
