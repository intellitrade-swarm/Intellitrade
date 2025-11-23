
'use client';

/**
 * Swarm Intelligence Dashboard
 * Visualizes multi-agent collaborative trading decisions
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Users,
  Brain,
  Shield,
  BarChart3,
  TrendingUp,
  Activity,
  Target,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface SwarmStatus {
  isActive: boolean;
  agentCount: number;
  totalDecisions: number;
  statistics: {
    buyDecisions: number;
    sellDecisions: number;
    holdDecisions: number;
    averageConfidence: string;
  };
  recentActivity: Array<{
    symbol: string;
    recommendation: string;
    confidence: number;
    timestamp: Date;
  }>;
  learnings: string[];
}

interface AgentAnalysis {
  agentRole: string;
  symbol: string;
  recommendation: string;
  confidence: number;
  reasoning: string;
  timestamp: Date;
}

interface SwarmDecision {
  symbol: string;
  finalRecommendation: string;
  consensusConfidence: number;
  individualAnalyses: AgentAnalysis[];
  synthesizedReasoning: string;
  timestamp: Date;
}

export default function SwarmIntelligencePage() {
  const router = useRouter();
  const [status, setStatus] = useState<SwarmStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [symbol, setSymbol] = useState('ETH');
  const [currentDecision, setCurrentDecision] = useState<SwarmDecision | null>(null);

  // Load swarm status
  const loadStatus = async () => {
    try {
      const response = await fetch('/api/swarm/status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Failed to load swarm status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger swarm analysis
  const analyzeSymbol = async () => {
    if (!symbol.trim()) return;

    setAnalyzing(true);
    try {
      const response = await fetch('/api/swarm/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          agentId: 'demo-agent',
          balance: 100,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentDecision(data.decision);
        await loadStatus(); // Refresh status
      }
    } catch (error) {
      console.error('Failed to analyze symbol:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const getRecommendationColor = (rec: string) => {
    if (rec.includes('BUY')) return 'text-green-400 border-green-500/30';
    if (rec.includes('SELL')) return 'text-red-400 border-red-500/30';
    return 'text-yellow-400 border-yellow-500/30';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'bg-green-500/20 text-green-400';
    if (confidence >= 50) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black p-6">
      {/* Background Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 102, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 102, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/')}
        className="mb-6 text-white hover:text-blue-400 hover:bg-gray-800"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-8 w-8 text-blue-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Swarm Intelligence
          </h1>
        </div>
        <p className="text-gray-400">
          Multi-agent collaborative AI system for advanced trading decisions
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading swarm status...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Overview */}
          <Card className="lg:col-span-3 bg-black/40 backdrop-blur border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-400" />
                Swarm Status
              </CardTitle>
              <CardDescription>Real-time multi-agent system overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                  <div className="text-3xl font-bold text-blue-400">
                    {status?.agentCount || 0}
                  </div>
                  <div className="text-sm text-gray-400">Active Agents</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                  <div className="text-3xl font-bold text-cyan-400">
                    {status?.totalDecisions || 0}
                  </div>
                  <div className="text-sm text-gray-400">Total Decisions</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                  <div className="text-3xl font-bold text-green-400">
                    {status?.statistics.buyDecisions || 0}
                  </div>
                  <div className="text-sm text-gray-400">Buy Signals</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                  <div className="text-3xl font-bold text-red-400">
                    {status?.statistics.sellDecisions || 0}
                  </div>
                  <div className="text-sm text-gray-400">Sell Signals</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                  <div className="text-3xl font-bold text-yellow-400">
                    {status?.statistics.averageConfidence || '0'}%
                  </div>
                  <div className="text-sm text-gray-400">Avg Confidence</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analyze Symbol */}
          <Card className="lg:col-span-2 bg-black/40 backdrop-blur border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-cyan-400" />
                Swarm Analysis
              </CardTitle>
              <CardDescription>
                Trigger multi-agent collaborative analysis for any token
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder="Enter symbol (e.g., ETH, BTC)"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="bg-gray-900/50 border-gray-700"
                />
                <Button
                  onClick={analyzeSymbol}
                  disabled={analyzing}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  {analyzing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span className="ml-2">Analyze</span>
                </Button>
              </div>

              {currentDecision && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Final Decision */}
                  <div
                    className={`p-4 rounded-xl border-2 ${getRecommendationColor(
                      currentDecision.finalRecommendation
                    )} bg-gray-900/50`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-lg">
                        Final Recommendation: {currentDecision.finalRecommendation}
                      </div>
                      <Badge className={getConfidenceColor(currentDecision.consensusConfidence)}>
                        {currentDecision.consensusConfidence}% Confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 break-words">
                      {currentDecision.synthesizedReasoning}
                    </p>
                  </div>

                  {/* Individual Agent Analyses */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Individual Agent Analyses
                    </h3>
                    {currentDecision.individualAnalyses.map((analysis, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-gray-900/50 rounded-xl border border-gray-800"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm">
                            {analysis.agentRole === 'Data Analyst' && (
                              <Brain className="h-4 w-4 inline mr-1 text-purple-400" />
                            )}
                            {analysis.agentRole === 'Technical Analyst' && (
                              <BarChart3 className="h-4 w-4 inline mr-1 text-cyan-400" />
                            )}
                            {analysis.agentRole === 'Risk Manager' && (
                              <Shield className="h-4 w-4 inline mr-1 text-green-400" />
                            )}
                            {analysis.agentRole}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={getRecommendationColor(analysis.recommendation)}
                            >
                              {analysis.recommendation}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {analysis.confidence}%
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 break-words">{analysis.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-black/40 backdrop-blur border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest swarm decisions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {status?.recentActivity && status.recentActivity.length > 0 ? (
                  status.recentActivity.map((activity, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-900/50 rounded-xl border border-gray-800"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{activity.symbol}</span>
                        <Badge
                          variant="outline"
                          className={getRecommendationColor(activity.recommendation)}
                        >
                          {activity.recommendation}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{activity.confidence}% confidence</span>
                        <span>
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Agent Roles */}
          <Card className="lg:col-span-3 bg-black/40 backdrop-blur border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Specialized Agent Roles
              </CardTitle>
              <CardDescription>
                Multi-agent system with role-based expertise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  {
                    name: 'Data Analyst',
                    icon: Brain,
                    color: 'purple',
                    expertise: 'On-chain intelligence, smart money flows, whale tracking',
                  },
                  {
                    name: 'Technical Analyst',
                    icon: BarChart3,
                    color: 'cyan',
                    expertise: 'RSI, MACD, volume analysis, price action',
                  },
                  {
                    name: 'Risk Manager',
                    icon: Shield,
                    color: 'green',
                    expertise: 'Position sizing, stop-loss, portfolio risk',
                  },
                  {
                    name: 'Strategy Coordinator',
                    icon: Target,
                    color: 'blue',
                    expertise: 'Decision synthesis, consensus building',
                  },
                  {
                    name: 'Performance Evaluator',
                    icon: TrendingUp,
                    color: 'yellow',
                    expertise: 'Trade review, pattern recognition, learning',
                  },
                ].map((agent, idx) => {
                  const Icon = agent.icon;
                  return (
                    <div
                      key={idx}
                      className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-gray-700 transition-all"
                    >
                      <Icon className={`h-8 w-8 text-${agent.color}-400 mb-2`} />
                      <h3 className="font-semibold mb-1">{agent.name}</h3>
                      <p className="text-xs text-gray-400">{agent.expertise}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
