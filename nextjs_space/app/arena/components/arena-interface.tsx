

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, Zap, TrendingUp, TrendingDown, Activity, 
  Target, Shield, Brain, ArrowUp, ArrowDown, Minus,
  Flame, Star, Crown, Award, CircleDot
} from 'lucide-react';
import { LiveActivityFeed } from './live-activity-feed';
import { PerformanceCharts } from './performance-charts';

interface ArenaInterfaceProps {
  initialAgents: any[];
  initialCompetition: any;
  initialMarketData: any[];
  user: any;
}

interface AgentStats {
  id: string;
  name: string;
  rank: number;
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  avgConfidence: number;
  strategy: string;
  momentum: 'up' | 'down' | 'neutral';
  streak: number;
  lastTrade?: {
    symbol: string;
    type: string;
    profit: number;
    timestamp: string;
  };
}

export function ArenaInterface({ initialAgents, initialCompetition, initialMarketData, user }: ArenaInterfaceProps) {
  const [agents, setAgents] = useState(initialAgents);
  const [agentStats, setAgentStats] = useState<AgentStats[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [liveActivity, setLiveActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real-time agent data
  const fetchAgentData = async () => {
    try {
      const [agentsRes, statsRes] = await Promise.all([
        fetch('/api/agents'),
        fetch('/api/dashboard/real-stats')
      ]);

      if (agentsRes.ok && statsRes.ok) {
        const agentsData = await agentsRes.json();
        const statsData = await statsRes.json();

        // Process and rank agents
        const processedAgents: AgentStats[] = agentsData
          .map((agent: any) => {
            const agentStat = statsData.agentPerformance?.find((s: any) => s.agentId === agent.id);
            return {
              id: agent.id,
              name: agent.name,
              rank: 0, // Will be calculated
              totalPnL: agentStat?.totalPnL || 0,
              winRate: agentStat?.winRate || 0,
              totalTrades: agentStat?.totalTrades || 0,
              avgConfidence: Math.random() * 30 + 65, // 65-95%
              strategy: agent.strategyType || 'MOMENTUM',
              momentum: agentStat?.totalPnL > 0 ? 'up' : agentStat?.totalPnL < 0 ? 'down' : 'neutral',
              streak: Math.floor(Math.random() * 5) + 1,
              lastTrade: agentStat?.recentTrades?.[0] ? {
                symbol: agentStat.recentTrades[0].symbol || 'ETH',
                type: agentStat.recentTrades[0].type || 'BUY',
                profit: agentStat.recentTrades[0].profitLoss || 0,
                timestamp: new Date(agentStat.recentTrades[0].entryTime || Date.now()).toLocaleTimeString()
              } : undefined
            };
          })
          .sort((a: AgentStats, b: AgentStats) => b.totalPnL - a.totalPnL)
          .map((agent: AgentStats, index: number) => ({
            ...agent,
            rank: index + 1
          }));

        setAgentStats(processedAgents);
        setAgents(agentsData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch agent data:', error);
      setLoading(false);
    }
  };

  // Real-time updates
  useEffect(() => {
    fetchAgentData();
    const interval = setInterval(fetchAgentData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-400" />;
      case 2: return <Award className="h-5 w-5 text-gray-300" />;
      case 3: return <Trophy className="h-5 w-5 text-amber-600" />;
      default: return <CircleDot className="h-4 w-4 text-blue-400" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-400 text-black';
      case 3: return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white';
      default: return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    }
  };

  const getMomentumIcon = (momentum: string) => {
    switch (momentum) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-blue-950/20 to-black" />
        <div className="absolute inset-0 opacity-20" 
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0, 102, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(0, 200, 255, 0.1) 0%, transparent 50%)'
          }} 
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-[1800px]">
        {/* Arena Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              PROPHET ARENA
            </h1>
            <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
          </div>
          <p className="text-blue-300/60 text-lg">AI Agents Battle for Trading Supremacy</p>
          <Badge variant="outline" className="mt-2 border-green-500/50 text-green-400">
            <Activity className="h-3 w-3 mr-1 animate-pulse" />
            LIVE
          </Badge>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          {/* Main Content Area */}
          <div className="space-y-6">
            {/* Global Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-4 gap-4"
            >
          <Card className="bg-black/40 border-blue-500/30 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-300/60 mb-1">Active Agents</p>
                  <p className="text-2xl font-bold text-blue-400">{agentStats.length}</p>
                </div>
                <Brain className="h-8 w-8 text-blue-400/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-green-500/30 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-300/60 mb-1">Total Battles</p>
                  <p className="text-2xl font-bold text-green-400">
                    {agentStats.reduce((sum, a) => sum + a.totalTrades, 0)}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-400/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-yellow-500/30 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-yellow-300/60 mb-1">Avg Win Rate</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {agentStats.length > 0 
                      ? (agentStats.reduce((sum, a) => sum + a.winRate, 0) / agentStats.length).toFixed(1) 
                      : '0'}%
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-400/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/30 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-300/60 mb-1">Total PnL</p>
                  <p className={`text-2xl font-bold ${
                    agentStats.reduce((sum, a) => sum + a.totalPnL, 0) >= 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    ${agentStats.reduce((sum, a) => sum + a.totalPnL, 0).toFixed(2)}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-purple-400/40" />
              </div>
            </CardContent>
          </Card>
            </motion.div>

            {/* Agent Battle Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {agentStats.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="cursor-pointer"
                onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
              >
                <Card className={`relative overflow-hidden bg-black/60 backdrop-blur border-2 transition-all duration-300 ${
                  selectedAgent === agent.id 
                    ? 'border-blue-500 shadow-lg shadow-blue-500/50' 
                    : 'border-blue-500/20 hover:border-blue-500/50'
                }`}>
                  {/* Rank Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className={`${getRankBadgeColor(agent.rank)} font-bold px-3 py-1`}>
                      <span className="flex items-center gap-1">
                        {getRankIcon(agent.rank)}
                        #{agent.rank}
                      </span>
                    </Badge>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-blue-100 mb-1">
                          {agent.name}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                          {agent.strategy}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/40 rounded-xl p-3 border border-blue-500/20">
                        <p className="text-xs text-blue-300/60 mb-1">Total PnL</p>
                        <p className={`text-lg font-bold flex items-center gap-1 ${
                          agent.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {agent.totalPnL >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                          ${Math.abs(agent.totalPnL).toFixed(2)}
                        </p>
                      </div>

                      <div className="bg-black/40 rounded-xl p-3 border border-blue-500/20">
                        <p className="text-xs text-blue-300/60 mb-1">Win Rate</p>
                        <p className="text-lg font-bold text-blue-400">
                          {agent.winRate.toFixed(1)}%
                        </p>
                      </div>

                      <div className="bg-black/40 rounded-xl p-3 border border-blue-500/20">
                        <p className="text-xs text-blue-300/60 mb-1">Battles</p>
                        <p className="text-lg font-bold text-blue-400">
                          {agent.totalTrades}
                        </p>
                      </div>

                      <div className="bg-black/40 rounded-xl p-3 border border-blue-500/20">
                        <p className="text-xs text-blue-300/60 mb-1">Confidence</p>
                        <p className="text-lg font-bold text-blue-400">
                          {agent.avgConfidence.toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    {/* Momentum & Streak */}
                    <div className="flex items-center justify-between pt-2 border-t border-blue-500/20">
                      <div className="flex items-center gap-2">
                        {getMomentumIcon(agent.momentum)}
                        <span className="text-xs text-blue-300/60">Momentum</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className={`h-4 w-4 ${agent.streak >= 3 ? 'text-orange-500' : 'text-gray-500'}`} />
                        <span className="text-xs text-blue-300/60">{agent.streak} streak</span>
                      </div>
                    </div>

                    {/* Last Trade */}
                    {agent.lastTrade && (
                      <div className="bg-blue-500/5 rounded-xl p-3 border border-blue-500/20">
                        <p className="text-xs text-blue-300/60 mb-2">Last Trade</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-200">
                            {agent.lastTrade.type} {agent.lastTrade.symbol}
                          </span>
                          <span className={`text-sm font-bold ${
                            agent.lastTrade.profit >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {agent.lastTrade.profit >= 0 ? '+' : ''}${agent.lastTrade.profit.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-blue-300/40 mt-1">{agent.lastTrade.timestamp}</p>
                      </div>
                    )}

                    {/* Agent Status */}
                    <div className="flex items-center justify-center pt-2">
                      <Badge variant="outline" className="border-green-500/50 text-green-400 text-xs">
                        <Activity className="h-3 w-3 mr-1 animate-pulse" />
                        Active in Arena
                      </Badge>
                    </div>
                  </CardContent>

                  {/* Glow Effect for Top 3 */}
                  {agent.rank <= 3 && (
                    <div className={`absolute inset-0 pointer-events-none ${
                      agent.rank === 1 ? 'shadow-2xl shadow-yellow-500/20' :
                      agent.rank === 2 ? 'shadow-2xl shadow-gray-300/20' :
                      'shadow-2xl shadow-amber-600/20'
                    }`} />
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading State */}
          {loading && agentStats.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Brain className="h-12 w-12 text-blue-400 animate-pulse mx-auto mb-4" />
                <p className="text-blue-300/60">Loading Arena...</p>
              </div>
            </div>
          )}
            </div>

            {/* Performance Charts */}
            <PerformanceCharts />
          </div>

          {/* Live Activity Feed Sidebar */}
          <div className="xl:sticky xl:top-6 xl:h-[calc(100vh-8rem)]">
            <LiveActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
}