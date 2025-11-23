
'use client';

import { ThemeProvider } from './theme-provider';
import { Toaster } from './ui/toaster';
import { TradingInitializer } from './trading-initializer';
import { ErrorBoundary } from './error-boundary';
import dynamic from 'next/dynamic';

// Dynamically import Web3Provider with SSR disabled to avoid indexedDB errors
const Web3Provider = dynamic(
  () => import('./web3-provider').then((mod) => mod.Web3Provider),
  { 
    ssr: false,
    loading: () => null,
  }
);

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <Web3Provider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TradingInitializer />
          {children}
          <Toaster />
        </ThemeProvider>
      </Web3Provider>
    </ErrorBoundary>
  );
}
