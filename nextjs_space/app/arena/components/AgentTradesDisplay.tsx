
'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LiveIndicator } from '@/components/ui/live-indicator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Target,
  Zap,
  ExternalLink,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { toast } from 'sonner';
import { useRealTimeTrades } from '@/hooks/use-real-time-data';

interface Trade {
  id: string;
  agentId: string;
  symbol: string;
  type: string;
  side: string;
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  entryTime: string;
  exitTime?: string;
  profitLoss?: number;
  status: string;
  isRealTrade: boolean;
  txHash?: string;
  chain?: string;
  agent: {
    name: string;
    strategyType: string;
  };
}

interface AgentTradesDisplayProps {
  agents: any[];
}

export function AgentTradesDisplay({ agents }: AgentTradesDisplayProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('open'); // Default to showing OPEN trades only

  const { 
    data: trades, 
    loading, 
    lastUpdated, 
    isLive,
    refetch 
  } = useRealTimeTrades(selectedAgent, selectedStatus);

  const getExplorerUrl = (txHash: string, chain: string = 'base') => {
    const explorers: Record<string, string> = {
      base: 'https://basescan.org/tx/',
      ethereum: 'https://etherscan.io/tx/',
      bsc: 'https://bscscan.com/tx/',
    };
    return `${explorers[chain] || explorers.base}${txHash}`;
  };

  // Calculate statistics
  const tradesArray = Array.isArray(trades) ? trades : [];
  
  const stats = React.useMemo(() => {
    const filteredTrades = tradesArray.filter(t => 
      (selectedAgent === 'all' || t.agentId === selectedAgent) &&
      (selectedStatus === 'all' || t.status.toLowerCase() === selectedStatus.toLowerCase())
    );

    const totalTrades = filteredTrades.length;
    const openTrades = filteredTrades.filter(t => t.status === 'OPEN').length;
    const closedTrades = filteredTrades.filter(t => t.status === 'CLOSED').length;
    const realTrades = filteredTrades.filter(t => t.isRealTrade).length;
    
    const profitableTrades = filteredTrades.filter(t => t.profitLoss && t.profitLoss > 0).length;
    const losingTrades = filteredTrades.filter(t => t.profitLoss && t.profitLoss < 0).length;
    const winRate = closedTrades > 0 ? (profitableTrades / closedTrades) * 100 : 0;
    
    const totalPnL = filteredTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
    const avgPnL = closedTrades > 0 ? totalPnL / closedTrades : 0;

    return {
      totalTrades,
      openTrades,
      closedTrades,
      realTrades,
      profitableTrades,
      losingTrades,
      winRate,
      totalPnL,
      avgPnL,
    };
  }, [tradesArray, selectedAgent, selectedStatus]);

  const filteredTrades = tradesArray.filter(t => 
    (selectedAgent === 'all' || t.agentId === selectedAgent) &&
    (selectedStatus === 'all' || t.status.toLowerCase() === selectedStatus.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Eye-catching Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-600 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Activity className="h-10 w-10 animate-pulse" />
                  Live Open Positions
                </h2>
                <LiveIndicator 
                  isLive={isLive} 
                  lastUpdated={lastUpdated}
                  showTimestamp={true}
                  className="scale-125"
                />
              </div>
              <p className="text-lg text-white/90">
                Real-time open trades from AI agents • Refreshes every 3 seconds
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={refetch}
                disabled={loading}
                variant="secondary"
                size="lg"
                className="gap-2"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh Now
              </Button>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="terminal-crt-screen p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-blue-950 border-green-200 dark:border-green-800 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total P&L</p>
              <p className={`text-3xl font-bold mt-2 ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.totalPnL >= 0 ? '+' : ''}{stats.totalPnL.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Avg: ${stats.avgPnL.toFixed(2)}
              </p>
            </div>
            <div className={`p-4 rounded-full ${stats.totalPnL >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <DollarSign className={`h-8 w-8 ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </Card>

        <Card className="terminal-crt-screen p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-blue-950 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Win Rate</p>
              <p className="text-3xl font-bold mt-2 text-blue-600">
                {stats.winRate.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.profitableTrades}W / {stats.losingTrades}L
              </p>
            </div>
            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="terminal-crt-screen p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-blue-950 dark:to-pink-950 border-purple-200 dark:border-blue-800 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Trades</p>
              <p className="text-3xl font-bold mt-2 text-blue-600">
                {stats.totalTrades}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.openTrades} open · {stats.closedTrades} closed
              </p>
            </div>
            <div className="p-4 rounded-full bg-purple-100 dark:bg-blue-900">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="terminal-crt-screen p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-200 dark:border-blue-800 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Real Trades</p>
              <p className="text-3xl font-bold mt-2 text-blue-600">
                {stats.realTrades}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                On-chain executions
              </p>
            </div>
            <div className="p-4 rounded-full bg-orange-100 dark:bg-blue-900">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="terminal-crt-screen p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Filter by Agent</label>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger>
                <SelectValue placeholder="All Agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Filter by Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Trades Display */}
      <Card className="terminal-crt-screen p-6">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="list" className="gap-2">
              <Activity className="h-4 w-4" />
              Trade List
            </TabsTrigger>
            <TabsTrigger value="live" className="gap-2">
              <Zap className="h-4 w-4" />
              Live Feed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {filteredTrades.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg text-muted-foreground">No open positions</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedStatus === 'open' 
                    ? 'Agents will appear here when they open new positions' 
                    : 'No trades found with the selected filters'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTrades.map((trade) => (
                  <TradeCard key={trade.id} trade={trade} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="live" className="space-y-4">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-blue-950 dark:to-pink-950 rounded-2xl p-6 border-2 border-purple-300 dark:border-blue-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <Zap className="h-8 w-8 text-blue-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Live Trading Activity</h3>
                  <p className="text-sm text-muted-foreground">Real-time updates • {filteredTrades.length} trades</p>
                </div>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredTrades.slice(0, 20).map((trade, index) => (
                  <LiveTradeItem key={trade.id} trade={trade} index={index} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

// Trade Card Component
function TradeCard({ trade }: { trade: Trade }) {
  const isProfitable = trade.profitLoss && trade.profitLoss > 0;
  const isClosed = trade.status === 'CLOSED';

  const getStatusIcon = () => {
    switch (trade.status) {
      case 'OPEN':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'CLOSED':
        return isProfitable ? 
          <CheckCircle className="h-4 w-4 text-green-600" /> : 
          <XCircle className="h-4 w-4 text-red-600" />;
      case 'CANCELLED':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className={`p-4 hover:shadow-lg transition-all border-l-4 ${
      trade.status === 'OPEN' ? 'border-l-blue-500' :
      isProfitable ? 'border-l-green-500' : 'border-l-red-500'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Agent Info */}
          <div className="flex items-center gap-3">
            <div className="text-sm">
              <div className="font-semibold flex items-center gap-2">
                {trade.agent.name}
                {trade.isRealTrade && (
                  <Badge variant="default" className="bg-blue-600 text-xs">
                    REAL
                  </Badge>
                )}
              </div>
              <div className="text-muted-foreground text-xs">
                {trade.agent.strategyType}
              </div>
            </div>
          </div>

          {/* Trade Details */}
          <div className="flex items-center gap-6 flex-1">
            <div>
              <div className="text-xs text-muted-foreground">Symbol</div>
              <div className="font-semibold">{trade.symbol}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Side</div>
              <Badge variant={trade.side === 'BUY' ? 'default' : 'secondary'} className="text-xs">
                {trade.side === 'BUY' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {trade.side}
              </Badge>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Entry Price</div>
              <div className="font-mono text-sm">${(trade.entryPrice || 0).toFixed(2)}</div>
            </div>
            {isClosed && trade.exitPrice && (
              <div>
                <div className="text-xs text-muted-foreground">Exit Price</div>
                <div className="font-mono text-sm">${(trade.exitPrice || 0).toFixed(2)}</div>
              </div>
            )}
            <div>
              <div className="text-xs text-muted-foreground">Quantity</div>
              <div className="font-mono text-sm">{(trade.quantity || 0).toFixed(4)}</div>
            </div>
          </div>

          {/* P&L */}
          {trade.profitLoss !== null && trade.profitLoss !== undefined && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">P&L</div>
              <div className={`text-lg font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                {isProfitable ? '+' : ''}{trade.profitLoss.toFixed(2)}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant="outline">
              {trade.status}
            </Badge>
          </div>

          {/* Blockchain Link */}
          {trade.isRealTrade && trade.txHash && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open(`https://basescan.org/tx/${trade.txHash}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Time Info */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Entry: {new Date(trade.entryTime).toLocaleString()}
        </div>
        {trade.exitTime && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Exit: {new Date(trade.exitTime).toLocaleString()}
          </div>
        )}
      </div>
    </Card>
  );
}

// Live Trade Item Component
function LiveTradeItem({ trade, index }: { trade: Trade; index: number }) {
  const isProfitable = trade.profitLoss && trade.profitLoss > 0;

  return (
    <div
      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-2xl border hover:shadow-md transition-all animate-in fade-in slide-in-from-right"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className={`w-2 h-2 rounded-full ${
          trade.status === 'OPEN' ? 'bg-blue-500 animate-pulse' :
          isProfitable ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{trade.agent.name}</span>
          {trade.isRealTrade && (
            <Badge variant="default" className="bg-blue-600 text-xs py-0 px-1">
              REAL
            </Badge>
          )}
        </div>

        <Badge variant={trade.side === 'BUY' ? 'default' : 'secondary'} className="text-xs">
          {trade.side}
        </Badge>

        <span className="text-sm font-mono">{trade.symbol}</span>
        
        <span className="text-sm text-muted-foreground">
          @${(trade.entryPrice || 0).toFixed(2)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {trade.profitLoss !== null && trade.profitLoss !== undefined && trade.status === 'CLOSED' && (
          <span className={`font-bold text-sm ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
            {isProfitable ? '+' : ''}{trade.profitLoss.toFixed(2)}
          </span>
        )}
        
        <Badge variant="outline" className="text-xs">
          {trade.status}
        </Badge>

        {trade.isRealTrade && trade.txHash && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => window.open(`https://basescan.org/tx/${trade.txHash}`, '_blank')}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
