
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, DollarSign, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function PerpMarketScreener() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarkets();
    const interval = setInterval(loadMarkets, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadMarkets = async () => {
    try {
      const response = await fetch('/api/nansen/perp-screener?limit=20');
      const data = await response.json();
      
      if (data.success) {
        setMarkets(data.data || []);
      }
    } catch (error) {
      console.error('Error loading markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(decimals)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(decimals)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  const getFundingColor = (rate: number) => {
    if (rate > 0.0001) return 'text-green-400';
    if (rate < -0.0001) return 'text-red-400';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <Activity className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-3 text-gray-400">Loading market data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Live Perp Markets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {markets.map((market, index) => (
                <motion.div
                  key={market.market}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          {market.market}
                          {Math.abs(market.priceChange24h) > 5 && (
                            <Zap className="h-4 w-4 text-yellow-500" />
                          )}
                        </h3>
                        <p className="text-sm text-gray-400">{market.platform}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {market.priceChange24h >= 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-400" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-400" />
                      )}
                      <span className={market.priceChange24h >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                        {market.priceChange24h >= 0 ? '+' : ''}{market.priceChange24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-gray-400">Volume 24h</p>
                      <p className="text-sm font-bold text-white">
                        ${formatNumber(market.volume24h)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400">Open Interest</p>
                      <p className="text-sm font-bold text-white">
                        ${formatNumber(market.openInterest)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400">Long/Short</p>
                      <p className="text-sm font-bold text-white">
                        {market.longShortRatio.toFixed(2)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400">Funding Rate</p>
                      <p className={`text-sm font-bold ${getFundingColor(market.fundingRate)}`}>
                        {(market.fundingRate * 100).toFixed(4)}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    {market.smartMoneyActivity.netFlow !== 0 && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          market.smartMoneyActivity.netFlow > 0 
                            ? 'border-green-500 text-green-500' 
                            : 'border-red-500 text-red-500'
                        }`}
                      >
                        Smart Money: {market.smartMoneyActivity.netFlow > 0 ? 'Buying' : 'Selling'}
                      </Badge>
                    )}
                    
                    {market.liquidations24h.totalUSD > 1000000 && (
                      <Badge variant="destructive" className="text-xs">
                        High Liq: ${formatNumber(market.liquidations24h.totalUSD)}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
