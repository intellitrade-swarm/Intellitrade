
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Icons } from '../../../components/ui/icons';
import { Brain, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface LiveArenaProps {
  agents: any[];
  marketData: any[];
  selectedAgent: string | null;
  onSelectAgent: (agentId: string | null) => void;
}

export function LiveArena({ agents, marketData, selectedAgent, onSelectAgent }: LiveArenaProps) {
  const [positions, setPositions] = useState<Record<string, { x: number, y: number }>>({});
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [tradingAgent, setTradingAgent] = useState<string | null>(null);

  const triggerAITrade = async (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the agent
    setTradingAgent(agentId);
    
    try {
      const response = await fetch('/api/ai/trade-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId })
      });

      if (!response.ok) {
        throw new Error('Failed to execute AI trade');
      }

      const data = await response.json();
      
      if (data.decision.action === 'HOLD') {
        toast.info('AI Decision: HOLD', {
          description: data.decision.reasoning
        });
      } else {
        const tradeType = data.tradeMode === 'real' ? '🔗 REAL TRADE' : '💭 Simulated';
        toast.success(`${tradeType}: ${data.decision.action} ${data.decision.symbol}`, {
          description: `Confidence: ${((data.decision.confidence || 0) * 100).toFixed(0)}% - ${data.decision.reasoning}${data.trade?.txHash ? `\nTx: ${data.trade.txHash.slice(0, 10)}...` : ''}`
        });
      }
    } catch (error) {
      toast.error('Trade Failed', {
        description: 'Unable to execute AI trading decision'
      });
    } finally {
      setTradingAgent(null);
    }
  };

  // Initialize random positions for agents
  useEffect(() => {
    const newPositions: Record<string, { x: number, y: number }> = {};
    agents.forEach((agent, index) => {
      const angle = (index / agents.length) * 2 * Math.PI;
      const radius = 120;
      newPositions[agent.id] = {
        x: 200 + Math.cos(angle) * radius,
        y: 150 + Math.sin(angle) * radius
      };
    });
    setPositions(newPositions);
  }, [agents]);

  // Simulate trading actions
  useEffect(() => {
    const interval = setInterval(() => {
      if (agents.length > 0) {
        const randomAgent = agents[Math.floor(Math.random() * agents.length)];
        const actions = ['BUY', 'SELL', 'ANALYZING', 'EVOLVING'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        setCurrentAction(`${randomAgent.name} - ${randomAction}`);
        
        setTimeout(() => setCurrentAction(null), 2000);
      }
    }, 10000); // Optimized to 10 seconds

    return () => clearInterval(interval);
  }, [agents]);

  const getStrategyColor = (strategyType: string) => {
    const colors = {
      MOMENTUM: 'from-blue-500 to-blue-500',
      MEAN_REVERSION: 'from-green-500 to-teal-500', 
      ARBITRAGE: 'from-blue-500 to-amber-500',
      SENTIMENT_ANALYSIS: 'from-blue-500 to-violet-500',
      TECHNICAL_INDICATORS: 'from-red-500 to-rose-500',
      NEURAL_NETWORK: 'from-blue-600 to-fuchsia-500'
    };
    return colors[strategyType as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  return (
    <Card className="terminal-crt-screen bg-black/40 backdrop-blur border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Icons.play className="h-5 w-5 mr-2 text-green-400" />
            Live Trading Arena
          </CardTitle>
          <div className="flex items-center space-x-2">
            {currentAction && (
              <Badge className="bg-green-600 text-white animate-pulse">
                {currentAction}
              </Badge>
            )}
            <Badge variant="outline" className="text-green-400 border-green-400">
              {agents.length} Active Agents
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Arena Visualization */}
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 mb-6 h-80 overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-12 grid-rows-8 h-full">
              {Array.from({ length: 96 }).map((_, i) => (
                <div key={i} className="border border-gray-600" />
              ))}
            </div>
          </div>

          {/* Market Data Visualization */}
          <div className="absolute top-4 left-4 space-y-1">
            {marketData.slice(0, 3).map((data, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs">
                <span className="text-gray-400">{data.symbol}:</span>
                <span className={data.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                  ${data.price.toLocaleString()}
                </span>
                <span className={`text-xs ${(data.priceChange || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(data.priceChange || 0) >= 0 ? '+' : ''}{(data.priceChange || 0).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>

          {/* AI Agents */}
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2`}
              style={{
                left: positions[agent.id]?.x || 0,
                top: positions[agent.id]?.y || 0,
              }}
              animate={{
                scale: selectedAgent === agent.id ? 1.2 : 1,
                opacity: selectedAgent === null || selectedAgent === agent.id ? 1 : 0.6,
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                y: {
                  duration: 3 + (index % 3) * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2,
                },
                rotate: {
                  duration: 4 + (index % 4) * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3,
                },
              }}
              whileHover={{ scale: 1.1 }}
              onClick={() => onSelectAgent(selectedAgent === agent.id ? null : agent.id)}
            >
              <div className={`relative w-16 h-16 rounded-full bg-gradient-to-r ${getStrategyColor(agent.strategyType)} flex items-center justify-center border-2 ${selectedAgent === agent.id ? 'border-white animate-pulse' : 'border-transparent'}`}>
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
                  {agent.avatar && typeof agent.avatar === 'string' && agent.avatar.length > 0 ? (
                    <Image
                      src={agent.avatar}
                      alt={agent.name || 'Agent'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                      {agent.name ? agent.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                </div>
                
                {/* Performance Indicator */}
                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-black border-2 border-current flex items-center justify-center">
                  {agent.totalProfitLoss >= 0 ? (
                    <Icons.arrowUp className="h-3 w-3 text-green-400" />
                  ) : (
                    <Icons.arrowDown className="h-3 w-3 text-red-400" />
                  )}
                </div>

                {/* Agent Name */}
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2">
                  <span className="text-xs text-white whitespace-nowrap bg-black/60 px-2 py-1 rounded">
                    {agent.name}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Connection Lines (when agent is selected) */}
          {selectedAgent && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {agents.map((agent) => (
                agent.id !== selectedAgent && (
                  <motion.line
                    key={agent.id}
                    x1={positions[selectedAgent]?.x || 0}
                    y1={positions[selectedAgent]?.y || 0}
                    x2={positions[agent.id]?.x || 0}
                    y2={positions[agent.id]?.y || 0}
                    stroke="rgba(59, 130, 246, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )
              ))}
            </svg>
          )}
        </div>

        {/* Agent Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              className={`p-3 rounded-2xl border cursor-pointer transition-colors ${
                selectedAgent === agent.id 
                  ? 'bg-green-900/40 border-green-600' 
                  : 'bg-gray-900/40 border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => onSelectAgent(selectedAgent === agent.id ? null : agent.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: [0, -5, 0],
              }}
              transition={{
                opacity: { duration: 0.5, delay: index * 0.1 },
                y: {
                  duration: 2 + (index % 3) * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.15,
                },
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
              }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <motion.div 
                  className={`w-8 h-8 rounded-full bg-gradient-to-r ${getStrategyColor(agent.strategyType)}`}
                  animate={{
                    boxShadow: [
                      "0 0 10px rgba(0, 255, 255, 0.3)",
                      "0 0 20px rgba(0, 255, 255, 0.5)",
                      "0 0 10px rgba(0, 255, 255, 0.3)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2,
                  }}
                />
                <div className="flex-1">
                  <div className="text-white text-sm font-medium truncate flex items-center gap-1">
                    {agent.name}
                    {agent.walletAddress && agent.realBalance > 0 && (
                      <span title="EVM Wallet Active" className="text-blue-400">💎</span>
                    )}
                    {agent.solanaWalletAddress && (
                      <span title="Solana Wallet Active" className="text-blue-400">✨</span>
                    )}
                  </div>
                  <div className="text-gray-400 text-xs">{agent.strategyType.replace('_', ' ')}</div>
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">P&L:</span>
                  <span className={(agent.totalProfitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {(agent.totalProfitLoss || 0) >= 0 ? '+' : ''}${(agent.totalProfitLoss || 0).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sharpe:</span>
                  <span className="text-white">{(agent.sharpeRatio || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Trades:</span>
                  <span className="text-white">{agent.totalTrades}</span>
                </div>
              </div>
              <Button 
                size="sm"
                className="w-full mt-2 bg-green-600 hover:bg-green-700 h-7 text-xs"
                onClick={(e) => triggerAITrade(agent.id, e)}
                disabled={tradingAgent === agent.id}
              >
                {tradingAgent === agent.id ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Brain className="h-3 w-3 mr-1" />
                    AI Trade
                  </>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
