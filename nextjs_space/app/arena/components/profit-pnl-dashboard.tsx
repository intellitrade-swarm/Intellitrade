
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target, Award, Activity, Zap } from 'lucide-react';
import { TreasuryDisplay } from './treasury-display';

interface ProfitPnLStats {
  overview: {
    totalPnL: number;
    realizedPnL: number;
    openPnL: number;
    totalProfit: number;
    totalLoss: number;
    winningTrades: number;
    losingTrades: number;
    totalTrades: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
    profitFactor: number;
  };
  topAgents: Array<{
    name: string;
    strategy: string;
    totalPnL: number;
    winRate: number;
    totalTrades: number;
    wins: number;
    losses: number;
  }>;
  recentTrades: Array<{
    id: string;
    agentName: string;
    pair: string;
    type: string;
    status: string;
    pnl: number;
    entryTime: string;
    exitTime: string | null;
    platform: string;
  }>;
  timestamp: string;
}

export function ProfitPnLDashboard() {
  const [stats, setStats] = useState<ProfitPnLStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats/profit-pnl');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="terminal-crt-screen bg-gradient-to-br from-gray-900/90 to-black/90 border-[#3385ff]/20 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#3385ff] to-[#0047b3] bg-clip-text text-transparent">
            Loading Profit & PNL...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3385ff]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="terminal-crt-screen bg-gradient-to-br from-gray-900/90 to-black/90 border-red-500/20 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-400">Error Loading Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  const { overview, topAgents, recentTrades } = stats;
  const isProfitable = overview.totalPnL > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="terminal-crt-screen bg-gradient-to-br from-gray-900/90 to-black/90 border-[#3385ff]/20 backdrop-blur-lg overflow-hidden">
        <CardHeader className="border-b border-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#3385ff] to-[#0047b3] bg-clip-text text-transparent flex items-center gap-2">
                <DollarSign className="h-8 w-8 text-[#3385ff]" />
                Real Trading Profit & PNL
              </CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                Live performance from real money trades only
              </CardDescription>
            </div>
            <Badge variant={isProfitable ? "default" : "destructive"} className="text-lg px-4 py-2">
              {isProfitable ? (
                <TrendingUp className="h-5 w-5 mr-2" />
              ) : (
                <TrendingDown className="h-5 w-5 mr-2" />
              )}
              {isProfitable ? "Profitable" : "In Loss"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total PnL */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-2xl border-2 ${
                overview.totalPnL > 0 
                  ? 'bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/30' 
                  : 'bg-gradient-to-br from-red-900/30 to-red-800/20 border-red-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm font-medium">Total PNL</span>
                {overview.totalPnL > 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className={`text-3xl font-bold ${overview.totalPnL > 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${Math.abs(overview.totalPnL).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Realized: ${overview.realizedPnL.toFixed(2)} | Open: ${overview.openPnL.toFixed(2)}
              </div>
            </motion.div>

            {/* Treasury */}
            <TreasuryDisplay />

            {/* Win Rate */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl border-2 bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm font-medium">Win Rate</span>
                <Target className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-400">
                {overview.winRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {overview.winningTrades}W / {overview.losingTrades}L ({overview.totalTrades} total)
              </div>
            </motion.div>

            {/* Profit Factor */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl border-2 bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm font-medium">Profit Factor</span>
                <Award className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-400">
                {overview.profitFactor.toFixed(2)}x
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Avg Win: ${overview.avgWin.toFixed(2)} | Avg Loss: ${overview.avgLoss.toFixed(2)}
              </div>
            </motion.div>
          </div>

          {/* Top Performing Agents */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#3385ff] mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Top Performing Agents
            </h3>
            <div className="space-y-2">
              {topAgents.length > 0 ? (
                topAgents.map((agent, index) => (
                  <motion.div
                    key={agent.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-900/50 border border-gray-800/50 hover:border-[#3385ff]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-blue-400/20 text-blue-300 border-2 border-blue-400' :
                        index === 1 ? 'bg-gray-400/20 text-gray-300 border-2 border-gray-400' :
                        index === 2 ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500' :
                        'bg-gray-700/20 text-gray-500'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-white">{agent.name}</div>
                        <div className="text-xs text-gray-500">{agent.strategy}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${agent.totalPnL > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${agent.totalPnL.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {agent.winRate.toFixed(1)}% WR ({agent.wins}/{agent.losses})
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No agent performance data yet
                </div>
              )}
            </div>
          </div>

          {/* Recent Trades Activity */}
          <div>
            <h3 className="text-xl font-bold text-[#3385ff] mb-3 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Real Trades
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentTrades.length > 0 ? (
                recentTrades.map((trade, index) => (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-gray-900/30 border border-gray-800/30 hover:border-[#3385ff]/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant={trade.status === 'OPEN' ? 'default' : 'secondary'} className="min-w-[60px]">
                        {trade.status}
                      </Badge>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{trade.agentName}</div>
                        <div className="text-xs text-gray-500">
                          {trade.pair} • {trade.type} • {trade.platform}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${trade.pnl > 0 ? 'text-green-400' : trade.pnl < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(trade.entryTime).toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent trades to display
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
