

// Blockchain RPC Configuration

export const BLOCKCHAIN_CONFIG = {
  base: {
    name: 'Base',
    rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    chainId: 8453,
    nativeToken: 'ETH',
    blockTime: 2, // seconds
    explorer: 'https://basescan.org',
  },
  bsc: {
    name: 'BNB Smart Chain',
    rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/',
    chainId: 56,
    nativeToken: 'BNB',
    blockTime: 3,
    explorer: 'https://bscscan.com',
  },
  ethereum: {
    name: 'Ethereum',
    rpcUrl: process.env.ETH_RPC_URL || 'https://eth.llamarpc.com',
    chainId: 1,
    nativeToken: 'ETH',
    blockTime: 12,
    explorer: 'https://etherscan.io',
  },
} as const;

// Common DEX router addresses for price feeds
export const DEX_ADDRESSES = {
  // Uniswap V3 Factory (Ethereum, Base)
  uniswapV3Factory: {
    ethereum: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    base: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
  },
  // PancakeSwap (BSC)
  pancakeswap: {
    bsc: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73', // PancakeSwap Factory
    router: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap Router V2
  },
  // Uniswap V2 Router
  uniswapV2Router: {
    ethereum: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  },
};

// Token addresses for different chains
export const TOKEN_ADDRESSES = {
  ethereum: {
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    BTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
  },
  bsc: {
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    BTCB: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    ETH: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
  },
  base: {
    WETH: '0x4200000000000000000000000000000000000006',
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDbC: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
  },
} as const;

export type ChainName = keyof typeof BLOCKCHAIN_CONFIG;

// Helper to get network info for wallets
export function getNetworkInfo(chain: ChainName) {
  const config = BLOCKCHAIN_CONFIG[chain];
  return {
    chainId: `0x${config.chainId.toString(16)}`,
    chainName: config.name,
    nativeCurrency: {
      name: config.nativeToken,
      symbol: config.nativeToken,
      decimals: 18,
    },
    rpcUrls: [config.rpcUrl],
    blockExplorerUrls: [config.explorer],
  };
}

