
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface LiveTradesTableProps {
  refreshInterval?: number;
}

export function LiveTradesTable({ refreshInterval = 60000 }: LiveTradesTableProps) {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrades = async () => {
    try {
      const response = await fetch('/api/stats/comprehensive');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTrades(data.recentTrades || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch trades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
    const interval = setInterval(fetchTrades, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) {
    return (
      <Card className="terminal-crt-screen premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#3385ff]" />
            Recent Trades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#3385ff]/10 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="terminal-crt-screen premium-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#3385ff]" />
          Recent Trades ({trades.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
          {trades.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No trades yet
            </div>
          ) : (
            trades.map((trade) => (
              <div 
                key={trade.id}
                className="p-4 rounded-2xl bg-black/30 border border-[#3385ff]/10 hover:border-[#3385ff]/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{trade.agentName}</span>
                    <Badge variant="outline" className="text-xs">
                      {trade.strategyType}
                    </Badge>
                  </div>
                  <Badge 
                    variant={trade.status === 'OPEN' ? 'default' : 'secondary'}
                    className={trade.status === 'OPEN' ? 'bg-blue-400/20 text-blue-400 border-blue-400/50' : ''}
                  >
                    {trade.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">Pair:</span>
                    <span className="ml-2 text-white font-medium">{trade.symbol}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Side:</span>
                    <span className={`ml-2 font-medium ${trade.side === 'LONG' ? 'text-[#3385ff]' : 'text-red-500'}`}>
                      {trade.side}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Entry:</span>
                    <span className="ml-2 text-white font-medium">${trade.entryPrice.toFixed(2)}</span>
                  </div>
                  {trade.exitPrice && (
                    <div>
                      <span className="text-gray-400">Exit:</span>
                      <span className="ml-2 text-white font-medium">${trade.exitPrice.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#3385ff]/10">
                  <div className="flex items-center gap-2">
                    {trade.profitLoss >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-[#3385ff]" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`font-bold ${trade.profitLoss >= 0 ? 'text-[#3385ff]' : 'text-red-500'}`}>
                      {trade.profitLoss >= 0 ? '+' : ''}${trade.profitLoss.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(trade.entryTime).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
