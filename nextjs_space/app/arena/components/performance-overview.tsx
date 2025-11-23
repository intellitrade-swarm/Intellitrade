
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Icons } from '../../../components/ui/icons';
import { LiveIndicator } from '../../../components/ui/live-indicator';
import { motion } from 'framer-motion';
import { useRealTimePerformance } from '../../../hooks/use-real-time-data';

interface PerformanceOverviewProps {
  agents: any[];
}

export function PerformanceOverview({ agents: initialAgents }: PerformanceOverviewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { 
    data: livePerformance, 
    loading, 
    lastUpdated, 
    isLive,
    refetch 
  } = useRealTimePerformance();

  // Use live performance data if available
  const performanceAgents = livePerformance?.agents || initialAgents;
  
  // Use summary data from API if available, otherwise calculate
  const totalAgents = livePerformance?.summary?.totalAgents || initialAgents.length;
  const totalTrades = livePerformance?.summary?.totalTrades || performanceAgents.reduce((sum: number, a: any) => sum + (a.totalTrades || 0), 0);
  const totalOpenTrades = livePerformance?.summary?.totalOpenTrades || performanceAgents.reduce((sum: number, a: any) => sum + (a.openTrades || 0), 0);
  const totalRealizedPnL = livePerformance?.summary?.totalRealizedPnL || performanceAgents.reduce((sum: number, a: any) => sum + (a.realizedPnL || 0), 0);
  const totalUnrealizedPnL = livePerformance?.summary?.totalUnrealizedPnL || performanceAgents.reduce((sum: number, a: any) => sum + (a.unrealizedPnL || 0), 0);
  const totalPnL = livePerformance?.summary?.totalPnL || (totalRealizedPnL + totalUnrealizedPnL);
  const avgWinRate = livePerformance?.summary?.avgWinRate || (performanceAgents.length > 0 
    ? performanceAgents.reduce((sum: number, a: any) => sum + (a.winRate || 0), 0) / performanceAgents.length 
    : 0);
  const totalWins = livePerformance?.summary?.totalWins || performanceAgents.reduce((sum: number, a: any) => sum + (a.totalWins || 0), 0);
  const totalLosses = livePerformance?.summary?.totalLosses || performanceAgents.reduce((sum: number, a: any) => sum + (a.totalLosses || 0), 0);
  const avgSharpe = performanceAgents.length > 0
    ? performanceAgents.reduce((sum: number, a: any) => sum + (a.sharpeRatio || 0), 0) / performanceAgents.length
    : 0;

  const topPerformer = performanceAgents.length > 0
    ? performanceAgents.reduce((best: any, agent: any) => 
        (agent.totalPnL || agent.totalProfitLoss || 0) > (best.totalPnL || best.totalProfitLoss || 0) ? agent : best
      , performanceAgents[0])
    : null;

  const handleRefreshPerformance = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/performance/update', { method: 'POST' });
      refetch();
    } catch (error) {
      console.error('Failed to refresh performance:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Live Indicator and Refresh Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Performance Overview</h2>
          <LiveIndicator 
            isLive={isLive} 
            lastUpdated={lastUpdated}
            showTimestamp={true}
          />
        </div>
        <button
          onClick={handleRefreshPerformance}
          disabled={isRefreshing || loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-colors disabled:opacity-50"
        >
          <Icons.refresh className={`h-4 w-4 ${(isRefreshing || loading) ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Updating...' : 'Refresh Now'}
        </button>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="terminal-crt-screen bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur border-blue-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Trades</p>
                <p className="text-3xl font-bold text-white mt-1">{totalTrades}</p>
                {totalOpenTrades > 0 && (
                  <p className="text-xs text-blue-400 mt-1">{totalOpenTrades} open</p>
                )}
              </div>
              <Icons.activity className="h-10 w-10 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br backdrop-blur border ${
          totalPnL >= 0 
            ? 'from-green-900/40 to-green-800/40 border-green-700/50' 
            : 'from-red-900/40 to-red-800/40 border-red-700/50'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total P&L</p>
                <p className={`text-3xl font-bold mt-1 ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                </p>
                {totalUnrealizedPnL !== 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Unrealized: {totalUnrealizedPnL >= 0 ? '+' : ''}${totalUnrealizedPnL.toFixed(2)}
                  </p>
                )}
              </div>
              <Icons.dollarSign className={`h-10 w-10 opacity-50 ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="terminal-crt-screen bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur border-blue-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Win Rate</p>
                <p className="text-3xl font-bold text-white mt-1">{(avgWinRate * 100).toFixed(1)}%</p>
              </div>
              <Icons.target className="h-10 w-10 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="terminal-crt-screen bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur border-blue-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Sharpe</p>
                <p className="text-3xl font-bold text-white mt-1">{avgSharpe.toFixed(2)}</p>
              </div>
              <Icons.barChart className="h-10 w-10 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performer & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topPerformer && (
          <Card className="terminal-crt-screen bg-black/40 backdrop-blur border-blue-600/50">
            <CardHeader>
              <CardTitle className="text-blue-300 flex items-center">
                <Icons.trophy className="h-5 w-5 mr-2" />
                Top Performer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{topPerformer.name}</h3>
                  <p className="text-gray-400 text-sm">
                    {(topPerformer.strategyType || '').replace('_', ' ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${(topPerformer.totalPnL || topPerformer.totalProfitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(topPerformer.totalPnL || topPerformer.totalProfitLoss || 0) >= 0 ? '+' : ''}${(topPerformer.totalPnL || topPerformer.totalProfitLoss || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {topPerformer.totalTrades || 0} trades
                    {(topPerformer.openTrades || 0) > 0 && ` • ${topPerformer.openTrades} open`}
                  </p>
                  {topPerformer.unrealizedPnL && Math.abs(topPerformer.unrealizedPnL) > 0.01 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Unrealized: {topPerformer.unrealizedPnL >= 0 ? '+' : ''}${topPerformer.unrealizedPnL.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="terminal-crt-screen bg-black/40 backdrop-blur border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Icons.pieChart className="h-5 w-5 mr-2" />
              Win/Loss Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Wins</span>
                <span className="text-green-400 font-bold">{totalWins}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${totalWins + totalLosses > 0 ? (totalWins / (totalWins + totalLosses)) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Losses</span>
                <span className="text-red-400 font-bold">{totalLosses}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Agent Performance */}
      <Card className="terminal-crt-screen bg-black/40 backdrop-blur border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Agent Performance Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {performanceAgents
              .sort((a: any, b: any) => (b.totalPnL || b.totalProfitLoss || 0) - (a.totalPnL || a.totalProfitLoss || 0))
              .map((agent: any, index: number) => {
                // Use new API format with fallback to old format
                const realizedPnL = agent.realizedPnL || 0;
                const unrealizedPnL = agent.unrealizedPnL || 0;
                const pnl = agent.totalPnL || (realizedPnL + unrealizedPnL) || agent.totalProfitLoss || 0;
                
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gray-900/40 rounded-2xl hover:bg-gray-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-blue-400 text-blue-800' :
                        index === 1 ? 'bg-gray-400 text-gray-900' :
                        index === 2 ? 'bg-blue-600 text-orange-100' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{agent.name}</h4>
                        <p className="text-gray-400 text-sm">
                          {(agent.strategyType || '').replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-400">
                        {agent.totalTrades || 0} trades
                        {(agent.openTrades || 0) > 0 && ` • ${agent.openTrades} open`}
                      </p>
                      {unrealizedPnL !== 0 && Math.abs(unrealizedPnL) > 0.01 && (
                        <p className={`text-xs mt-1 ${unrealizedPnL >= 0 ? 'text-green-500/70' : 'text-red-500/70'}`}>
                          Unrealized: {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
