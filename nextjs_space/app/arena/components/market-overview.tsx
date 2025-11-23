
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Icons } from '../../../components/ui/icons';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react';

interface TokenPrice {
  symbol: string;
  name: string;
  address: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  source: string;
}

// Popular token addresses for Nansen API - Expanded for better market coverage
const POPULAR_TOKENS = [
  { symbol: 'WETH', name: 'Ethereum', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', chain: 'ethereum' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', chain: 'ethereum' },
  { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', chain: 'ethereum' },
  { symbol: 'USDT', name: 'Tether', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', chain: 'ethereum' },
  { symbol: 'LINK', name: 'Chainlink', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', chain: 'ethereum' },
  { symbol: 'UNI', name: 'Uniswap', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', chain: 'ethereum' },
  { symbol: 'AAVE', name: 'Aave', address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', chain: 'ethereum' },
  { symbol: 'MKR', name: 'Maker', address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', chain: 'ethereum' },
];

export function MarketOverview() {
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchTokenPrices();
    
    // Update prices every 30 seconds for more real-time data
    const interval = setInterval(() => {
      fetchTokenPrices();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchTokenPrices = async (isManual = false) => {
    try {
      if (isManual) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Fetch real trending tokens from Nansen API
      const response = await fetch('/api/nansen/trending-tokens?chain=ethereum&limit=8');
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && Array.isArray(result.data)) {
          const prices: TokenPrice[] = result.data.map((token: any) => ({
            symbol: token.symbol,
            name: token.name,
            address: token.address,
            price: token.price || 0,
            priceChange24h: token.priceChange24h || 0,
            volume24h: token.volume24h || 0,
            marketCap: token.marketCap || 0,
            source: 'Nansen API',
          }));
          
          setTokenPrices(prices);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      } else {
        console.error('Failed to fetch trending tokens from Nansen');
        // Show empty state instead of fallback data
        setTokenPrices([]);
      }
    } catch (error) {
      console.error('Failed to fetch token prices:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchTokenPrices(true);
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'N/A';
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    return `$${price.toFixed(6)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume === 0) return 'N/A';
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(0)}`;
  };

  return (
    <Card className="terminal-crt-screen bg-gradient-to-br from-blue-900/20 via-blue-950/10 to-black backdrop-blur border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            Market Overview
          </div>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
            LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && tokenPrices.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Activity className="h-8 w-8 mx-auto mb-2 animate-spin" />
            <p>Loading real-time prices...</p>
          </div>
        ) : (
          <>
            {tokenPrices.map((token, index) => (
              <motion.div
                key={token.address}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-2xl bg-gradient-to-br from-gray-900/60 to-gray-800/40 border border-gray-700/50 hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <span className="text-white font-bold text-sm">
                        {token.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">{token.symbol}</div>
                      <div className="text-gray-400 text-xs">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-mono font-semibold">
                      {formatPrice(token.price)}
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {token.priceChange24h >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {token.priceChange24h >= 0 ? '+' : ''}
                      {token.priceChange24h.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {token.volume24h > 0 && (
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-2 pt-2 border-t border-gray-700/30">
                    <span>24h Volume: {formatVolume(token.volume24h)}</span>
                    <Badge variant="outline" className="text-xs text-blue-400 border-blue-500/30">
                      {token.source}
                    </Badge>
                  </div>
                )}
              </motion.div>
            ))}
            
            {lastUpdated && (
              <div className="pt-3 border-t border-gray-700/50">
                <div className="text-gray-400 text-xs text-center flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Last updated: {lastUpdated}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
