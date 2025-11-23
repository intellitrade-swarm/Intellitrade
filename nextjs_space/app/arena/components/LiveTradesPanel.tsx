

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Zap,
  ExternalLink,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Flame,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';

interface Trade {
  id: string;
  agentId?: string | null;
  agentName?: string;
  agentProvider?: string | null;
  strategyType?: string;
  platform?: string;
  symbol: string;
  type?: string;
  side: string;
  quantity: number;
  entryPrice: number;
  currentPrice?: number;
  exitPrice?: number;
  entryTime: string | Date;
  exitTime?: string;
  profitLoss?: number;
  unrealizedPnL?: number;
  leverage?: number;
  liquidationPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  status: string;
  isRealTrade?: boolean;
  isLive?: boolean;
  hasDbRecord?: boolean;
  txHash?: string;
  chain?: string;
  agent?: {
    name: string;
    strategyType: string;
  };
}

interface LiveTradesPanelProps {
  agents: any[];
}

export function LiveTradesPanel({ agents }: LiveTradesPanelProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchTrades();
    
    if (autoRefresh) {
      const interval = setInterval(fetchTrades, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchTrades = async () => {
    try {
      // Fetch live trades (includes both DB and AsterDEX positions)
      const response = await fetch('/api/trades/live');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.trades)) {
        // All trades are already OPEN status
        setTrades(data.trades);
      } else if (Array.isArray(data)) {
        // Fallback to old format
        setTrades(data.filter((t: Trade) => t.status === 'OPEN'));
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
      // Fallback to old API
      try {
        const fallbackResponse = await fetch('/api/trades?limit=20');
        const fallbackData = await fallbackResponse.json();
        if (Array.isArray(fallbackData)) {
          setTrades(fallbackData.filter((t: Trade) => t.status === 'OPEN'));
        }
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    const openTrades = trades.length;
    const realTrades = trades.filter(t => t.isRealTrade).length;
    
    const longTrades = trades.filter(t => t.side === 'BUY').length;
    const shortTrades = trades.filter(t => t.side === 'SELL').length;

    return {
      openTrades,
      realTrades,
      longTrades,
      shortTrades,
    };
  }, [trades]);

  const getAgentColor = (strategyType: string) => {
    const colors: Record<string, string> = {
      'MOMENTUM': 'from-blue-500 to-blue-500',
      'ARBITRAGE': 'from-blue-500 to-blue-600',
      'SENTIMENT': 'from-green-500 to-blue-500',
      'PATTERN': 'from-blue-500 to-red-500',
      'SCALPING': 'from-blue-400 to-blue-500',
      'default': 'from-gray-500 to-gray-600',
    };
    return colors[strategyType] || colors['default'];
  };

  return (
    <Card className="terminal-crt-screen overflow-hidden border-2 border-[#0066ff]/30 bg-gradient-to-br from-black/90 via-gray-900/90 to-black/90 shadow-2xl">
      {/* Eye-catching Animated Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0066ff] via-green-500 to-blue-500 p-4">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Flame className="h-8 w-8 text-white animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Live Positions
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {stats.openTrades}
                </Badge>
              </h3>
              <p className="text-xs text-white/80">Real-time agent activity</p>
            </div>
          </div>
          <Button
            onClick={fetchTrades}
            disabled={loading}
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Animated background waves */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/0 via-white/50 to-white/0 animate-pulse"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-black/60 border-b border-[#0066ff]/20">
        <div className="text-center p-2 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ArrowUpRight className="h-3 w-3 text-blue-400" />
            <span className="text-xs text-blue-400 font-semibold">LONG</span>
          </div>
          <div className="text-xl font-bold text-white">{stats.longTrades}</div>
        </div>
        <div className="text-center p-2 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ArrowDownRight className="h-3 w-3 text-red-400" />
            <span className="text-xs text-red-400 font-semibold">SHORT</span>
          </div>
          <div className="text-xl font-bold text-white">{stats.shortTrades}</div>
        </div>
      </div>

      {/* Real Trades Badge */}
      {stats.realTrades > 0 && (
        <div className="px-3 py-2 bg-gradient-to-r from-blue-600/30 to-red-600/30 border-b border-blue-500/30">
          <div className="flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 text-blue-400 animate-pulse" />
            <span className="text-sm font-bold text-blue-400">
              {stats.realTrades} REAL TRADE{stats.realTrades !== 1 ? 'S' : ''} ACTIVE
            </span>
          </div>
        </div>
      )}

      {/* Trades List */}
      <ScrollArea className="h-[500px]">
        <div className="p-3 space-y-2">
          {trades.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-[#0066ff]/30 mx-auto mb-3 animate-pulse" />
              <p className="text-sm text-gray-400">No active positions</p>
              <p className="text-xs text-gray-500 mt-1">Waiting for agents to trade...</p>
            </div>
          ) : (
            trades.map((trade, index) => (
              <LiveTradeCard 
                key={trade.id} 
                trade={trade} 
                index={index}
                getAgentColor={getAgentColor}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Auto-refresh indicator */}
      <div className="px-3 py-2 bg-black/60 border-t border-[#0066ff]/20">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-400">
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <span>{autoRefresh ? 'Auto-refreshing' : 'Paused'}</span>
          </div>
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-[#0066ff] hover:text-[#0066ff] hover:bg-[#0066ff]/10"
          >
            {autoRefresh ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Live Trade Card Component
function LiveTradeCard({ trade, index, getAgentColor }: { 
  trade: Trade; 
  index: number;
  getAgentColor: (strategyType: string) => string;
}) {
  const isLong = trade.side === 'BUY';
  const [timeElapsed, setTimeElapsed] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const entry = new Date(trade.entryTime);
      const diffMs = now.getTime() - entry.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) {
        setTimeElapsed('just now');
      } else if (diffMins < 60) {
        setTimeElapsed(`${diffMins}m ago`);
      } else {
        const diffHours = Math.floor(diffMins / 60);
        setTimeElapsed(`${diffHours}h ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [trade.entryTime]);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border-2 transition-all hover:scale-[1.02] hover:shadow-xl ${
        isLong 
          ? 'border-blue-500/50 bg-gradient-to-br from-blue-950/50 to-blue-900/30 hover:border-blue-400' 
          : 'border-red-500/50 bg-gradient-to-br from-red-950/50 to-red-900/30 hover:border-red-400'
      }`}
      style={{ 
        animationDelay: `${index * 100}ms`,
        animation: 'slideIn 0.3s ease-out forwards'
      }}
    >
      {/* Agent Indicator Bar */}
      <div className={`h-1 bg-gradient-to-r ${getAgentColor(trade.agent?.strategyType || trade.strategyType || 'MOMENTUM')}`}></div>
      
      <div className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-white truncate">
                {trade.agent?.name || trade.agentName || 'Unknown Agent'}
              </span>
              {(trade.isRealTrade || trade.isLive) && (
                <Badge variant="default" className="bg-blue-600 text-[10px] px-1 py-0">
                  {trade.isLive ? 'LIVE' : 'REAL'}
                </Badge>
              )}
              {trade.platform && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 border-[#0066ff]/30 text-[#0066ff]">
                  {trade.platform}
                </Badge>
              )}
            </div>
            <div className="text-[10px] text-gray-400">{trade.agent?.strategyType || trade.strategyType || 'Trading'}</div>
          </div>
          
          <Badge 
            variant={isLong ? 'default' : 'secondary'} 
            className={`${
              isLong 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-red-600 hover:bg-red-700'
            } text-white text-[10px] px-2`}
          >
            {isLong ? (
              <><ArrowUpRight className="h-3 w-3 mr-0.5" />LONG</>
            ) : (
              <><ArrowDownRight className="h-3 w-3 mr-0.5" />SHORT</>
            )}
          </Badge>
        </div>

        {/* Trade Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Symbol</span>
            <span className="text-sm font-bold text-white">{trade.symbol}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Entry</span>
            <span className="text-sm font-mono text-[#0066ff]">${(trade.entryPrice || 0).toFixed(2)}</span>
          </div>
          
          {trade.currentPrice && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Current</span>
              <span className="text-sm font-mono text-blue-400">${(trade.currentPrice || 0).toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Size</span>
            <span className="text-sm font-mono text-white">
              {(trade.quantity || 0).toFixed(4)}
              {trade.leverage && trade.leverage > 1 && (
                <span className="ml-1 text-[10px] text-blue-400">({trade.leverage}x)</span>
              )}
            </span>
          </div>

          {trade.unrealizedPnL !== undefined && trade.unrealizedPnL !== null && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">PNL</span>
              <span className={`text-sm font-mono font-bold ${
                trade.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {trade.unrealizedPnL >= 0 ? '+' : ''}${trade.unrealizedPnL.toFixed(2)}
              </span>
            </div>
          )}

          {trade.liquidationPrice && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Liq. Price</span>
              <span className="text-xs font-mono text-red-400">${trade.liquidationPrice.toFixed(2)}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <Clock className="h-3 w-3" />
              {timeElapsed}
            </div>
            
            {trade.isRealTrade && trade.txHash && (
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0 hover:bg-white/10"
                onClick={() => window.open(`https://basescan.org/tx/${trade.txHash}`, '_blank')}
              >
                <ExternalLink className="h-3 w-3 text-[#0066ff]" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Animated border glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
        isLong 
          ? 'bg-gradient-to-r from-blue-500/20 via-transparent to-blue-500/20' 
          : 'bg-gradient-to-r from-red-500/20 via-transparent to-red-500/20'
      }`}></div>
    </div>
  );
}

<style jsx>{`
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`}</style>

