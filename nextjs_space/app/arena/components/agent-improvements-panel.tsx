

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Icons } from '../../../components/ui/icons';
import { Badge } from '../../../components/ui/badge';

interface AgentImprovement {
  agentId: string;
  agentName: string;
  currentPerformance: {
    winRate: number;
    totalProfitLoss: number;
    sharpeRatio: number;
    avgWinSize: number;
    avgLossSize: number;
  };
  recommendations: string[];
  riskAdjustments: {
    increaseLeverage: boolean;
    decreaseLeverage: boolean;
    tightenStopLoss: boolean;
    expandTakeProfit: boolean;
  };
  shouldPause: boolean;
}

interface ProfitSummary {
  totalRealized: number;
  totalUnrealized: number;
  totalProfit: number;
  totalWins: number;
  totalLosses: number;
  overallWinRate: number;
  bestAgent: { name: string; profit: number };
  worstAgent: { name: string; profit: number };
  agentPerformances: Array<{
    name: string;
    strategy: string;
    realized: number;
    unrealized: number;
    total: number;
    wins: number;
    losses: number;
    winRate: number;
  }>;
}

export function AgentImprovementsPanel() {
  const [insights, setInsights] = useState<AgentImprovement[]>([]);
  const [profitSummary, setProfitSummary] = useState<ProfitSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchImprovements();
    const interval = setInterval(fetchImprovements, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchImprovements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agents/improvements');
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
        setProfitSummary(data.profitSummary || null);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching improvements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profitSummary) {
    return (
      <Card className="terminal-crt-screen bg-black/40 backdrop-blur border-gray-800">
        <CardContent className="p-8 flex items-center justify-center">
          <Icons.spinner className="h-8 w-8 animate-spin text-green-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profit Summary */}
      {profitSummary && (
        <Card className="terminal-crt-screen bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center">
                <Icons.dollarSign className="h-5 w-5 mr-2 text-green-400" />
                Aggregated Profit Summary
              </span>
              <div className="text-xs text-gray-400">
                Updated {lastUpdate.toLocaleTimeString()}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-black/40 rounded-2xl border border-gray-800">
                <div className={`text-3xl font-bold ${profitSummary.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${profitSummary.totalProfit.toFixed(2)}
                </div>
                <div className="text-gray-400 text-xs mt-1">Total Profit</div>
                <div className="text-gray-500 text-xs mt-1">
                  R: ${profitSummary.totalRealized.toFixed(2)} | U: ${profitSummary.totalUnrealized.toFixed(2)}
                </div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-2xl border border-gray-800">
                <div className="text-3xl font-bold text-green-400">
                  {profitSummary.overallWinRate.toFixed(1)}%
                </div>
                <div className="text-gray-400 text-xs mt-1">Overall Win Rate</div>
                <div className="text-gray-500 text-xs mt-1">
                  {profitSummary.totalWins}W / {profitSummary.totalLosses}L
                </div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-2xl border border-gray-800">
                <div className="text-white text-lg font-bold">{profitSummary.bestAgent.name}</div>
                <div className="text-green-400 text-xl">${profitSummary.bestAgent.profit.toFixed(2)}</div>
                <div className="text-gray-400 text-xs mt-1">Top Performer</div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-2xl border border-gray-800">
                <div className="text-white text-lg font-bold">{profitSummary.worstAgent.name}</div>
                <div className="text-red-400 text-xl">${profitSummary.worstAgent.profit.toFixed(2)}</div>
                <div className="text-gray-400 text-xs mt-1">Needs Improvement</div>
              </div>
            </div>

            {/* Top 5 Agents */}
            <div className="space-y-2">
              <h4 className="text-white text-sm font-semibold mb-2">Top Agent Rankings</h4>
              {profitSummary.agentPerformances.slice(0, 5).map((agent, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-black/40 rounded border border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                    <div>
                      <div className="text-white font-medium">{agent.name}</div>
                      <div className="text-gray-400 text-xs">{agent.strategy}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${agent.total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${agent.total.toFixed(2)}
                    </div>
                    <div className="text-gray-400 text-xs">{agent.winRate.toFixed(1)}% WR</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent Insights */}
      {insights.length > 0 && (
        <Card className="terminal-crt-screen bg-black/40 backdrop-blur border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Icons.brain className="h-5 w-5 mr-2 text-blue-400" />
              Agent Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight) => (
                <motion.div
                  key={insight.agentId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-black/60 rounded-2xl border border-gray-800"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-semibold">{insight.agentName}</h4>
                      {insight.shouldPause && (
                        <Badge variant="destructive" className="mt-1">
                          Paused for Review
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${insight.currentPerformance.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${insight.currentPerformance.totalProfitLoss.toFixed(2)}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {(insight.currentPerformance.winRate * 100).toFixed(1)}% Win Rate
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                    <div className="p-2 bg-black/40 rounded text-center">
                      <div className="text-gray-400">Sharpe Ratio</div>
                      <div className="text-white font-semibold">
                        {insight.currentPerformance.sharpeRatio.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-2 bg-black/40 rounded text-center">
                      <div className="text-gray-400">Avg Win</div>
                      <div className="text-green-400 font-semibold">
                        ${insight.currentPerformance.avgWinSize.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-2 bg-black/40 rounded text-center">
                      <div className="text-gray-400">Avg Loss</div>
                      <div className="text-red-400 font-semibold">
                        ${insight.currentPerformance.avgLossSize.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-gray-400 text-xs font-semibold mb-2">Recommendations:</div>
                    {insight.recommendations.map((rec, idx) => (
                      <div key={idx} className="text-xs text-gray-300 pl-4">
                        {rec}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-3">
                    {insight.riskAdjustments.increaseLeverage && (
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        ↑ Increase Position Size
                      </Badge>
                    )}
                    {insight.riskAdjustments.decreaseLeverage && (
                      <Badge variant="outline" className="text-blue-300 border-blue-300">
                        ↓ Reduce Position Size
                      </Badge>
                    )}
                    {insight.riskAdjustments.tightenStopLoss && (
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        ⚠ Tighten Stops
                      </Badge>
                    )}
                    {insight.riskAdjustments.expandTakeProfit && (
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        🎯 Expand TP
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button 
          onClick={fetchImprovements} 
          variant="outline"
          className="border-green-500/30 hover:bg-green-500/10"
          disabled={loading}
        >
          {loading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Icons.refresh className="mr-2 h-4 w-4" />
              Refresh Insights
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

