
'use client';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { ReactNode, useEffect, useState, useMemo } from 'react';
import { wagmiConfig, projectId } from '../lib/walletconnect-config';

export function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [modalInitialized, setModalInitialized] = useState(false);

  // Create queryClient with useMemo to avoid recreation
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
    []
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Create modal only once on client side after mount
    if (mounted && !modalInitialized && typeof window !== 'undefined') {
      try {
        createWeb3Modal({
          wagmiConfig,
          projectId,
          enableAnalytics: true,
          enableOnramp: true
        });
        setModalInitialized(true);
      } catch (error) {
        console.error('Web3Modal initialization error:', error);
      }
    }
  }, [mounted, modalInitialized]);

  // Always render providers to maintain consistent hook count
  // Critical fix: removed early return to prevent "Rendered more hooks" error
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
