import { defaultWagmiConfig } from '@web3modal/wagmi';
import { mainnet, base, bsc, arbitrum, polygon } from 'wagmi/chains';

// Get projectId from environment variable
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// Get the base URL from environment or construct it
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXTAUTH_URL || 'https://intellitrade.xyz';
};

// Define metadata for your app
export const metadata = {
  name: 'Intellitrade',
  description: 'AI-Powered Autonomous Trading Platform',
  url: getBaseUrl(),
  icons: [getBaseUrl() + '/favicon.svg']
};

// Create wagmi config with proper SSR and mobile support
export const wagmiConfig = defaultWagmiConfig({
  chains: [base, bsc, mainnet, arbitrum, polygon],
  projectId,
  metadata,
  ssr: true,
  enableWalletConnect: true,
  enableInjected: true,
  enableCoinbase: true,
});

// Supported chains for copy trading
export const supportedChains = [
  { id: 8453, name: 'Base', symbol: 'ETH' },
  { id: 56, name: 'BSC', symbol: 'BNB' },
  { id: 1, name: 'Ethereum', symbol: 'ETH' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH' },
  { id: 137, name: 'Polygon', symbol: 'MATIC' }
];
