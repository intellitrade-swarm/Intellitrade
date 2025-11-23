
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Icons } from '../../../components/ui/icons';
import { PerformanceChart } from './performance-chart';

interface PerformanceDashboardProps {
  agents: any[];
  selectedAgent: string | null;
}

export function PerformanceDashboard({ agents: initialAgents, selectedAgent }: PerformanceDashboardProps) {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [metric, setMetric] = useState<'profitLoss' | 'sharpeRatio' | 'winRate'>('profitLoss');
  const [agents, setAgents] = useState(initialAgents);
  const [loading, setLoading] = useState(false);

  // Fetch live data on mount and every 30 seconds
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/agents/live');
        if (response.ok) {
          const liveAgents = await response.json();
          setAgents(liveAgents);
        }
      } catch (error) {
        console.error('Error fetching live agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const selectedAgentData = selectedAgent ? agents.find(a => a.id === selectedAgent) : null;

  // Calculate overall portfolio statistics
  const portfolioStats = agents.reduce((acc, agent) => {
    return {
      totalPL: acc.totalPL + (agent.totalProfitLoss || 0),
      totalTrades: acc.totalTrades + (agent.totalTrades || 0),
      totalWins: acc.totalWins + (agent.wins || 0),
      totalLosses: acc.totalLosses + (agent.losses || 0),
      totalBalance: acc.totalBalance + (agent.balance || agent.realBalance || 0),
      totalOpen: acc.totalOpen + (agent.openTrades || 0),
      activeAgents: agent.totalTrades > 0 ? acc.activeAgents + 1 : acc.activeAgents,
    };
  }, {
    totalPL: 0,
    totalTrades: 0,
    totalWins: 0,
    totalLosses: 0,
    totalBalance: 0,
    totalOpen: 0,
    activeAgents: 0,
  });

  const overallWinRate = portfolioStats.totalTrades > 0 
    ? (portfolioStats.totalWins / (portfolioStats.totalWins + portfolioStats.totalLosses) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Overall Portfolio Stats */}
      {!selectedAgent && (
        <Card className="terminal-crt-screen bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center">
                <Icons.trendingUp className="h-5 w-5 mr-2 text-green-400" />
                Overall Trading Performance
              </span>
              {loading && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Updating...
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="text-center p-4 bg-black/40 rounded-2xl border border-gray-800">
                <div className={`text-2xl font-bold ${portfolioStats.totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {portfolioStats.totalPL >= 0 ? '+' : ''}${portfolioStats.totalPL.toFixed(2)}
                </div>
                <div className="text-gray-400 text-xs mt-1">Total P&L</div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-2xl border border-gray-800">
                <div className="text-white text-2xl font-bold">{portfolioStats.totalTrades}</div>
                <div className="text-gray-400 text-xs mt-1">Total Trades</div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-2xl border border-gray-800">
                <div className={`text-2xl font-bold ${overallWinRate >= 60 ? 'text-green-400' : overallWinRate >= 40 ? 'text-blue-300' : 'text-red-400'}`}>
                  {overallWinRate.toFixed(1)}%
                </div>
                <div className="text-gray-400 text-xs mt-1">Win Rate</div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-2xl border border-gray-800">
                <div className="text-white text-2xl font-bold">
                  <span className="text-green-400">{portfolioStats.totalWins}</span>
                  <span className="text-gray-500 text-sm mx-1">/</span>
                  <span className="text-red-400">{portfolioStats.totalLosses}</span>
                </div>
                <div className="text-gray-400 text-xs mt-1">Wins/Losses</div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-2xl border border-gray-800">
                <div className="text-white text-2xl font-bold">{portfolioStats.totalOpen}</div>
                <div className="text-gray-400 text-xs mt-1">Open Trades</div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-2xl border border-gray-800">
                <div className="text-white text-2xl font-bold">${portfolioStats.totalBalance.toFixed(2)}</div>
                <div className="text-gray-400 text-xs mt-1">Total Balance</div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-2xl border border-gray-800">
                <div className="text-white text-2xl font-bold">{portfolioStats.activeAgents}/{agents.length}</div>
                <div className="text-gray-400 text-xs mt-1">Active Agents</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card className="terminal-crt-screen bg-black/40 backdrop-blur border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Timeframe:</span>
              {(['24h', '7d', '30d', 'all'] as const).map((tf) => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe(tf)}
                  className="text-xs"
                >
                  {tf}
                </Button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Metric:</span>
              {[
                { key: 'profitLoss', label: 'P&L', icon: Icons.dollarSign },
                { key: 'sharpeRatio', label: 'Sharpe', icon: Icons.barChart },
                { key: 'winRate', label: 'Win Rate', icon: Icons.target }
              ].map((m) => (
                <Button
                  key={m.key}
                  variant={metric === m.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMetric(m.key as any)}
                  className="text-xs"
                >
                  <m.icon className="h-3 w-3 mr-1" />
                  {m.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart */}
      <Card className="terminal-crt-screen bg-black/40 backdrop-blur border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Icons.lineChart className="h-5 w-5 mr-2 text-green-400" />
            Performance Analysis
            {selectedAgentData && (
              <span className="ml-2 text-sm text-gray-400">- {selectedAgentData.name}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceChart 
            agents={selectedAgent ? [selectedAgentData] : agents}
            timeframe={timeframe}
            metric={metric}
          />
        </CardContent>
      </Card>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(selectedAgent ? [selectedAgentData] : agents).filter(Boolean).map((agent: any) => {
          const totalPL = agent.totalProfitLoss || 0;
          const winRate = agent.winRate || 0;
          const totalTrades = agent.totalTrades || 0;
          const wins = agent.wins || 0;
          const losses = agent.losses || 0;
          const openTrades = agent.openTrades || 0;
          const sharpeRatio = agent.sharpeRatio || 0;
          const maxDrawdown = agent.maxDrawdown || 0;
          const balance = agent.balance || agent.realBalance || 0;
          
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="terminal-crt-screen bg-black/40 backdrop-blur border-gray-800 h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-500 mr-3" />
                      <div>
                        <div>{agent.name}</div>
                        <div className="text-gray-400 text-xs font-normal">{(agent.strategyType || '').replace('_', ' ')}</div>
                      </div>
                    </div>
                    {loading && <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-900/40 rounded-2xl border border-gray-800">
                      <div className={`text-lg font-bold ${totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
                      </div>
                      <div className="text-gray-400 text-xs">Total P&L</div>
                    </div>
                    <div className="text-center p-3 bg-gray-900/40 rounded-2xl border border-gray-800">
                      <div className="text-white text-lg font-bold">{sharpeRatio.toFixed(2)}</div>
                      <div className="text-gray-400 text-xs">Sharpe Ratio</div>
                    </div>
                    <div className="text-center p-3 bg-gray-900/40 rounded-2xl border border-gray-800">
                      <div className={`text-lg font-bold ${winRate >= 60 ? 'text-green-400' : winRate >= 40 ? 'text-blue-300' : 'text-red-400'}`}>
                        {winRate.toFixed(1)}%
                      </div>
                      <div className="text-gray-400 text-xs">Win Rate</div>
                    </div>
                    <div className="text-center p-3 bg-gray-900/40 rounded-2xl border border-gray-800">
                      <div className="text-white text-lg font-bold">{totalTrades}</div>
                      <div className="text-gray-400 text-xs">Total Trades</div>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="space-y-2 text-sm border-t border-gray-800 pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Balance:</span>
                      <span className="text-white font-medium">${balance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Open Positions:</span>
                      <span className="text-white font-medium">{openTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Win/Loss:</span>
                      <span className="text-white font-medium">
                        <span className="text-green-400">{wins}</span>
                        {' / '}
                        <span className="text-red-400">{losses}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Drawdown:</span>
                      <span className={`font-medium ${maxDrawdown <= 0.1 ? 'text-green-400' : maxDrawdown <= 0.2 ? 'text-blue-300' : 'text-red-400'}`}>
                        {(maxDrawdown * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">AI Provider:</span>
                      <span className="text-white font-medium text-xs">{agent.aiProvider || 'N/A'}</span>
                    </div>
                    {agent.lastTradeAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Trade:</span>
                        <span className="text-white font-medium text-xs">
                          {new Date(agent.lastTradeAt).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
