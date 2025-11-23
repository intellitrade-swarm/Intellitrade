
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRealTimeData } from '@/hooks/use-real-time-data';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Target,
  BarChart3,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TradeData {
  id: string;
  agentName: string;
  strategyType: string;
  symbol: string;
  type: string;
  side: string;
  quantity: number;
  entryPrice: number;
  exitPrice: number | null;
  entryTime: string;
  exitTime: string | null;
  profitLoss: number | null;
  profitLossPercent: number | null;
  status: string;
  strategy: string;
  confidence: number | null;
  stopLoss: number | null;
  takeProfit: number | null;
}

interface StatisticsData {
  statistics: {
    totalTrades: number;
    openTrades: number;
    closedTrades: number;
    profitableTrades: number;
    losingTrades: number;
    winRate: number;
    totalProfitLoss: number;
    avgProfitPerTrade: number;
    avgWin: number;
    avgLoss: number;
    profitFactor: number;
  };
  symbolStats: any[];
  agentStats: any[];
  timeframe: string;
}

export function ComprehensiveTradesDisplay() {
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('24h');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [tradesPerPage, setTradesPerPage] = useState<number>(15);

  // Fetch trades history
  const { data: tradesData, loading: tradesLoading } = useRealTimeData<any>(
    async () => {
      const params = new URLSearchParams();
      if (selectedAgent !== 'all') params.append('agentId', selectedAgent);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      params.append('limit', tradesPerPage.toString());
      params.append('offset', ((currentPage - 1) * tradesPerPage).toString());
      
      const response = await fetch(`/api/trades/history?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch trades');
      return response.json();
    },
    { refreshInterval: 30000 }
  );

  // Fetch statistics
  const { data: statsData, loading: statsLoading } = useRealTimeData<StatisticsData>(
    async () => {
      const params = new URLSearchParams();
      if (selectedAgent !== 'all') params.append('agentId', selectedAgent);
      params.append('timeframe', selectedTimeframe);
      
      const response = await fetch(`/api/trades/statistics?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return response.json();
    },
    { refreshInterval: 30000 }
  );

  // Fetch active trades
  const { data: activeTradesData } = useRealTimeData<any>(
    async () => {
      const response = await fetch('/api/trades/active');
      if (!response.ok) throw new Error('Failed to fetch active trades');
      return response.json();
    },
    { refreshInterval: 60000 }
  );

  const trades: TradeData[] = tradesData?.trades || [];
  const statistics = statsData?.statistics;
  const activeTrades = activeTradesData?.trades || [];

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="terminal-crt-screen bg-gradient-to-br from-[#3385ff]/10 to-transparent border-[#3385ff]/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Trades</p>
                <p className="text-2xl font-bold text-[#3385ff]">{statistics.totalTrades}</p>
              </div>
              <Activity className="w-8 h-8 text-[#3385ff]" />
            </div>
          </Card>

          <Card className="terminal-crt-screen bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-2xl font-bold text-blue-400">{statistics.winRate.toFixed(1)}%</p>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card className={cn(
            "p-4 bg-gradient-to-br border",
            statistics.totalProfitLoss >= 0
              ? "from-green-500/10 to-transparent border-green-500/20"
              : "from-red-500/10 to-transparent border-red-500/20"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total P&L</p>
                <p className={cn(
                  "text-2xl font-bold",
                  statistics.totalProfitLoss >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  ${statistics.totalProfitLoss.toFixed(2)}
                </p>
              </div>
              {statistics.totalProfitLoss >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-400" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-400" />
              )}
            </div>
          </Card>

          <Card className="terminal-crt-screen bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Trades</p>
                <p className="text-2xl font-bold text-blue-400">{statistics.openTrades}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="terminal-crt-screen bg-black/40 border-[#3385ff]/20 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filters:</span>
          </div>
          
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-1.5 bg-black/60 border border-[#3385ff]/30 rounded text-sm text-white"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-black/60 border border-[#3385ff]/30 rounded text-sm text-white"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </Card>

      {/* Trades Table */}
      <Card className="terminal-crt-screen bg-black/40 border-[#3385ff]/20 p-6">
        <h3 className="text-xl font-bold text-[#3385ff] mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Trade History
        </h3>

        {tradesLoading ? (
          <div className="text-center py-8 text-gray-400">Loading trades...</div>
        ) : trades.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No trades found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#3385ff]/20">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Agent</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Symbol</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Side</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Entry</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Exit</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">P&L</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade, index) => (
                  <motion.tr
                    key={trade.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-[#3385ff]/10 hover:bg-[#3385ff]/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {new Date(trade.entryTime).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-white font-medium">
                      {trade.agentName}
                    </td>
                    <td className="px-4 py-3 text-sm text-white font-mono">
                      {trade.symbol}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn(
                        "text-xs",
                        trade.side === 'BUY' 
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      )}>
                        {trade.side}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-300 font-mono">
                      ${trade.entryPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-300 font-mono">
                      {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {trade.profitLoss !== null ? (
                        <span className={cn(
                          "font-bold",
                          trade.profitLoss >= 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {trade.profitLoss >= 0 ? '+' : ''}${trade.profitLoss.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={cn(
                        "text-xs",
                        trade.status === 'OPEN'
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                      )}>
                        {trade.status}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Agent Performance Breakdown */}
      {statsData?.agentStats && statsData.agentStats.length > 0 && (
        <Card className="terminal-crt-screen bg-black/40 border-[#3385ff]/20 p-6">
          <h3 className="text-xl font-bold text-[#3385ff] mb-4">Agent Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statsData.agentStats.map((agent: any) => (
              <div
                key={agent.agentId}
                className="bg-black/60 border border-[#3385ff]/20 rounded-2xl p-4"
              >
                <h4 className="font-bold text-white mb-2">{agent.agentName}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Trades:</span>
                    <span className="text-white">{agent.totalTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Open:</span>
                    <span className="text-blue-400">{agent.openTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Profitable:</span>
                    <span className="text-green-400">{agent.profitableTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total P&L:</span>
                    <span className={cn(
                      "font-bold",
                      agent.totalPnL >= 0 ? "text-green-400" : "text-red-400"
                    )}>
                      ${agent.totalPnL.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
