
'use client';

import { useEffect, useState } from 'react';

/**
 * Component that initializes 24/7 trading on app load
 * This should be included in the root layout
 */
export function TradingInitializer() {
  const [initialized, setInitialized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client side after mount
    if (!mounted || initialized) return;

    const initTrading = async () => {
      try {
        console.log('🚀 Initializing 24/7 AsterDEX trading...');
        
        // Add timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch('/api/trading/init', {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Trading initialization:', data.message);
          setInitialized(true);
        } else {
          console.error('❌ Failed to initialize trading');
        }
      } catch (error) {
        // Silently fail on mobile or slow networks
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('⏱️ Trading initialization timeout - will retry later');
        } else {
          console.error('❌ Error initializing trading:', error);
        }
      }
    };

    // Initialize after a short delay to ensure database is ready
    const timer = setTimeout(initTrading, 3000);
    return () => clearTimeout(timer);
  }, [mounted, initialized]);

  // This component doesn't render anything
  return null;
}
