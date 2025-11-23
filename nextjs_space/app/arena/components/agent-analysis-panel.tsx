
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { LiveIndicator } from '../../../components/ui/live-indicator';
import { Icons } from '../../../components/ui/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { useRealTimeData } from '../../../hooks/use-real-time-data';

interface AgentAnalysisPanelProps {
  agentId?: string;
}

export function AgentAnalysisPanel({ agentId }: AgentAnalysisPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  
  const { 
    data: analysisData, 
    loading, 
    lastUpdated, 
    isLive 
  } = useRealTimeData(
    async () => {
      const url = agentId 
        ? `/api/agents/analysis?agentId=${agentId}`
        : '/api/agents/analysis';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch analysis');
      return response.json();
    },
    { refreshInterval: 30000 } // Update every 30 seconds
  );

  const agentAnalysis = analysisData?.agents || [];

  useEffect(() => {
    if (agentAnalysis.length > 0 && !selectedAgent) {
      setSelectedAgent(agentAnalysis[0].id);
    }
  }, [agentAnalysis, selectedAgent]);

  const currentAgent = agentAnalysis.find((a: any) => a.id === selectedAgent);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Loading agent analysis...</div>
      </div>
    );
  }

  if (agentAnalysis.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-gray-400 mb-2">No active agents</div>
          <div className="text-gray-500 text-sm">Activate agents to see real-time analysis</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Selector */}
      <Card className="terminal-crt-screen bg-black/40 backdrop-blur border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {agentAnalysis.map((agent: any) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`px-4 py-2 rounded-2xl transition-all ${
                  selectedAgent === agent.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-500 text-white'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${agent.isTrading ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                  {agent.name}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {currentAgent && (
        <>
          {/* Agent Status Card */}
          <Card className="terminal-crt-screen bg-black/40 backdrop-blur border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icons.brain className="h-5 w-5 text-blue-400" />
                  <span>{currentAgent.name} - Real-Time Analysis</span>
                  <LiveIndicator 
                    isLive={isLive} 
                    lastUpdated={lastUpdated}
                    showTimestamp={false}
                  />
                </div>
                <Badge variant={currentAgent.isTrading ? "default" : "secondary"}>
                  {currentAgent.isTrading ? 'TRADING' : 'MONITORING'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-900/40 rounded-2xl">
                  <div className="text-white text-lg font-bold">${currentAgent.currentBalance.toFixed(2)}</div>
                  <div className="text-gray-400 text-xs">Balance</div>
                </div>
                <div className="text-center p-3 bg-gray-900/40 rounded-2xl">
                  <div className={`text-lg font-bold ${currentAgent.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {currentAgent.totalProfitLoss >= 0 ? '+' : ''}${currentAgent.totalProfitLoss.toFixed(2)}
                  </div>
                  <div className="text-gray-400 text-xs">Total P&L</div>
                </div>
                <div className="text-center p-3 bg-gray-900/40 rounded-2xl">
                  <div className="text-white text-lg font-bold">{currentAgent.openTrades}</div>
                  <div className="text-gray-400 text-xs">Open Trades</div>
                </div>
                <div className="text-center p-3 bg-gray-900/40 rounded-2xl">
                  <div className="text-white text-lg font-bold">{(currentAgent.winRate * 100).toFixed(1)}%</div>
                  <div className="text-gray-400 text-xs">Win Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="signals" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-black/40">
              <TabsTrigger value="signals">AI Signals</TabsTrigger>
              <TabsTrigger value="positions">Open Positions</TabsTrigger>
              <TabsTrigger value="recent">Recent Trades</TabsTrigger>
            </TabsList>

            {/* AI Signals Tab */}
            <TabsContent value="signals" className="space-y-4">
              <Card className="terminal-crt-screen bg-black/40 backdrop-blur border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center">
                    <Icons.zap className="h-4 w-4 mr-2 text-blue-300" />
                    Trading Signals & AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentAgent.recentSignals && currentAgent.recentSignals.length > 0 ? (
                    <div className="space-y-3">
                      {currentAgent.recentSignals.map((signal: any, index: number) => (
                        <motion.div
                          key={signal.tradeId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-gray-900/40 rounded-2xl border border-gray-700/50"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant={signal.side === 'BUY' ? 'default' : 'destructive'}>
                                {signal.side}
                              </Badge>
                              <span className="text-white font-medium">{signal.symbol}</span>
                              <Badge variant="outline" className="text-xs">
                                Strength: {(signal.signalStrength * 100).toFixed(0)}%
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(signal.entryTime).toLocaleString()}
                            </div>
                          </div>
                          
                          {signal.analysis && (
                            <div className="space-y-2 text-sm">
                              {signal.analysis.reasoning && (
                                <div>
                                  <div className="text-gray-400 text-xs mb-1">AI Reasoning:</div>
                                  <div className="text-gray-300">{signal.analysis.reasoning}</div>
                                </div>
                              )}
                              {signal.analysis.sentiment && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 text-xs">Sentiment:</span>
                                  <Badge variant="outline" className={`text-xs ${
                                    signal.analysis.sentiment === 'BULLISH' ? 'text-green-400' :
                                    signal.analysis.sentiment === 'BEARISH' ? 'text-red-400' :
                                    'text-blue-300'
                                  }`}>
                                    {signal.analysis.sentiment}
                                  </Badge>
                                </div>
                              )}
                              {signal.analysis.targetPrice && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 text-xs">Target Price:</span>
                                  <span className="text-white">${signal.analysis.targetPrice.toFixed(2)}</span>
                                </div>
                              )}
                              {signal.riskScore !== undefined && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 text-xs">Risk Score:</span>
                                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden max-w-xs">
                                    <div 
                                      className={`h-full ${
                                        signal.riskScore < 0.3 ? 'bg-green-500' :
                                        signal.riskScore < 0.7 ? 'bg-blue-400' :
                                        'bg-red-500'
                                      }`}
                                      style={{ width: `${signal.riskScore * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-white text-xs">{(signal.riskScore * 100).toFixed(0)}%</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {signal.status === 'CLOSED' && signal.profitLoss !== null && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-xs">Result:</span>
                                <span className={`text-sm font-medium ${signal.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {signal.profitLoss >= 0 ? '+' : ''}${signal.profitLoss.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No recent signals available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Open Positions Tab */}
            <TabsContent value="positions" className="space-y-4">
              <Card className="terminal-crt-screen bg-black/40 backdrop-blur border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center">
                    <Icons.trendingUp className="h-4 w-4 mr-2 text-green-400" />
                    Open Positions ({currentAgent.openTrades})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentAgent.openPositions && currentAgent.openPositions.length > 0 ? (
                    <div className="space-y-3">
                      {currentAgent.openPositions.map((position: any) => (
                        <div key={position.id} className="p-4 bg-gray-900/40 rounded-2xl border border-gray-700/50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={position.side === 'BUY' ? 'default' : 'destructive'}>
                                {position.side}
                              </Badge>
                              <span className="text-white font-medium">{position.symbol}</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(position.entryTime).toLocaleString()}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-gray-400 text-xs">Entry Price</div>
                              <div className="text-white">${position.entryPrice.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-gray-400 text-xs">Quantity</div>
                              <div className="text-white">{position.quantity.toFixed(4)}</div>
                            </div>
                            <div>
                              <div className="text-gray-400 text-xs">Value</div>
                              <div className="text-white">${(position.entryPrice * position.quantity).toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No open positions
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recent Trades Tab */}
            <TabsContent value="recent" className="space-y-4">
              <Card className="terminal-crt-screen bg-black/40 backdrop-blur border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center">
                    <Icons.clock className="h-4 w-4 mr-2 text-blue-400" />
                    Recent Closed Trades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentAgent.recentTrades && currentAgent.recentTrades.length > 0 ? (
                    <div className="space-y-3">
                      {currentAgent.recentTrades.map((trade: any) => (
                        <div key={trade.id} className="p-4 bg-gray-900/40 rounded-2xl border border-gray-700/50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={trade.side === 'BUY' ? 'default' : 'destructive'}>
                                {trade.side}
                              </Badge>
                              <span className="text-white font-medium">{trade.symbol}</span>
                            </div>
                            <div className={`text-sm font-medium ${trade.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {trade.profitLoss >= 0 ? '+' : ''}${trade.profitLoss?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-400 text-xs">Entry</div>
                              <div className="text-white">${trade.entryPrice.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-gray-400 text-xs">Exit</div>
                              <div className="text-white">${trade.exitPrice?.toFixed(2) || 'N/A'}</div>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-400">
                            {new Date(trade.entryTime).toLocaleString()} → {trade.exitTime ? new Date(trade.exitTime).toLocaleString() : 'Open'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No recent trades
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
