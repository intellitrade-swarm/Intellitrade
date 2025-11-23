
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseRealTimeDataOptions {
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export function useRealTimeData<T>(
  fetchFn: () => Promise<T>,
  options: UseRealTimeDataOptions = {}
) {
  const {
    refreshInterval = 5000, // default 5 seconds
    enabled = true,
    onError
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled || !isMountedRef.current) return;

    try {
      const result = await fetchFn();
      if (isMountedRef.current) {
        setData(result);
        setLastUpdated(new Date());
        setError(null);
        setLoading(false);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      if (isMountedRef.current) {
        setError(error);
        setLoading(false);
        onError?.(error);
      }
    }
  }, [fetchFn, enabled, onError]);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial fetch
    fetchData();

    // Set up interval
    if (enabled && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
    }

    // Cleanup
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, refreshInterval, enabled]);

  const refetch = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch,
    isLive: enabled && refreshInterval > 0
  };
}

// Specialized hooks for common data types
export function useRealTimeTrades(agentId?: string, status?: string) {
  return useRealTimeData(
    async () => {
      const params = new URLSearchParams();
      if (agentId && agentId !== 'all') params.append('agentId', agentId);
      if (status && status !== 'all') params.append('status', status);
      params.append('limit', '100');
      
      const response = await fetch(`/api/trades?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch trades');
      return response.json();
    },
    { refreshInterval: 3000 } // Update every 3 seconds for trades
  );
}

export function useRealTimeAgents() {
  return useRealTimeData(
    async () => {
      const response = await fetch('/api/agents/live');
      if (!response.ok) throw new Error('Failed to fetch agents');
      return response.json();
    },
    { refreshInterval: 5000 } // Update every 5 seconds for agent status
  );
}

export function useRealTimePerformance(agentId?: string) {
  return useRealTimeData(
    async () => {
      // Try new realtime endpoint first, then fall back to live endpoint
      let url = agentId 
        ? `/api/performance/realtime?agentId=${agentId}`
        : '/api/performance/realtime';
      let response = await fetch(url);
      
      if (!response.ok) {
        // Fallback to old endpoint
        url = agentId 
          ? `/api/performance/live?agentId=${agentId}`
          : '/api/performance/live';
        response = await fetch(url);
      }
      
      if (!response.ok) throw new Error('Failed to fetch performance');
      return response.json();
    },
    { refreshInterval: 5000 } // Update every 5 seconds
  );
}

export function useRealTimeMarketData() {
  return useRealTimeData(
    async () => {
      const response = await fetch('/api/market/live');
      if (!response.ok) throw new Error('Failed to fetch market data');
      return response.json();
    },
    { refreshInterval: 10000 } // Update every 10 seconds for market data
  );
}

export function useRealTimeActiveTrades() {
  return useRealTimeData(
    async () => {
      const response = await fetch('/api/trades/active');
      if (!response.ok) throw new Error('Failed to fetch active trades');
      return response.json();
    },
    { refreshInterval: 2000 } // Update every 2 seconds for active trades
  );
}

// NEW: Hook for profitable trading opportunities
export function useRealTimeProfitableOpportunities() {
  return useRealTimeData(
    async () => {
      const response = await fetch('/api/trading/opportunities');
      if (!response.ok) throw new Error('Failed to fetch profitable opportunities');
      return response.json();
    },
    { refreshInterval: 3000 } // Update every 3 seconds for opportunities
  );
}

// NEW: Hook for real-time trading performance metrics
export function useRealTimeTradingPerformance() {
  return useRealTimeData(
    async () => {
      const response = await fetch('/api/trading/performance');
      if (!response.ok) throw new Error('Failed to fetch trading performance');
      return response.json();
    },
    { refreshInterval: 5000 } // Update every 5 seconds for performance
  );
}
