
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown, Zap, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function SmartMoneyPerpFeed() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrades();
    const interval = setInterval(loadTrades, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadTrades = async () => {
    try {
      const response = await fetch('/api/nansen/smart-money/perp-trades?limit=30');
      const data = await response.json();
      
      if (data.success) {
        setTrades(data.data || []);
      }
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(decimals)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'OPEN': return 'bg-blue-500/20 border-blue-500 text-blue-400';
      case 'INCREASE': return 'bg-green-500/20 border-green-500 text-green-400';
      case 'DECREASE': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      case 'CLOSE': return 'bg-red-500/20 border-red-500 text-red-400';
      default: return 'bg-gray-500/20 border-gray-500 text-gray-400';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <Activity className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-3 text-gray-400">Loading smart money trades...</span>
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
            <Zap className="h-5 w-5 text-blue-500 animate-pulse" />
            Live Smart Money Perp Trades
            <Badge variant="outline" className="ml-2 border-green-500 text-green-500">
              {trades.length} trades
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {trades.map((trade, index) => (
                <motion.div
                  key={trade.hash}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-gray-800/50 p-3 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {trade.side === 'LONG' ? (
                        <TrendingUp className="h-5 w-5 text-green-400 flex-shrink-0" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-400 flex-shrink-0" />
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold ${trade.side === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.side}
                          </span>
                          <span className="text-white font-bold">{trade.market}</span>
                          <Badge variant="outline" className={getActionColor(trade.action)}>
                            {trade.action}
                          </Badge>
                          {trade.leverage > 1 && (
                            <Badge variant="outline" className="border-blue-500 text-blue-500">
                              {trade.leverage}x
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-gray-400">
                            {trade.traderLabel || formatAddress(trade.trader)}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400">{trade.platform}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400">
                            {new Date(trade.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="flex items-center gap-1 text-white font-bold">
                        <DollarSign className="h-4 w-4" />
                        {formatNumber(trade.sizeUSD)}
                      </div>
                      {trade.pnlUSD !== undefined && trade.pnlUSD !== null && (
                        <div className={`text-xs ${trade.pnlUSD >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          PnL: {trade.pnlUSD >= 0 ? '+' : ''}${formatNumber(Math.abs(trade.pnlUSD))}
                        </div>
                      )}
                    </div>
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
