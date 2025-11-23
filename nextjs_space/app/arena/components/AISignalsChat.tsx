
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Loader2, TrendingUp, TrendingDown, Activity, Radio, Terminal, Zap } from 'lucide-react';
import Image from 'next/image';

interface AISignal {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  strategyType: string;
  timestamp: Date;
  symbol: string;
  action: 'BUY' | 'SELL' | 'SCAN';
  confidence: string;
  reasoning: string;
  price?: number;
  quantity?: number;
  status?: string;
  result?: number;
}

interface ActiveAgent {
  id: string;
  name: string;
  avatar: string;
  strategyType: string;
  aiProvider: string;
}

export function AISignalsChat() {
  const [signals, setSignals] = useState<AISignal[]>([]);
  const [activeAgents, setActiveAgents] = useState<ActiveAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch signals
  const fetchSignals = async () => {
    try {
      const response = await fetch('/api/agents/signals');
      if (response.ok) {
        const data = await response.json();
        setSignals(data.signals || []);
        setActiveAgents(data.activeAgents || []);
      }
    } catch (error) {
      console.error('Failed to fetch AI signals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
    
    if (isLive) {
      const interval = setInterval(fetchSignals, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isLive]);

  // Auto scroll to bottom when new signals arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [signals, autoScroll]);

  // Generate periodic scanning messages from active agents
  const [scanningMessages, setScanningMessages] = useState<AISignal[]>([]);
  
  useEffect(() => {
    if (activeAgents.length === 0) return;

    const scanningTemplates = [
      "🔍 Scanning market for opportunities...",
      "📊 Analyzing technical indicators across 100+ tokens...",
      "🌐 Monitoring DEX liquidity pools for arbitrage...",
      "📈 Running sentiment analysis on social signals...",
      "🔬 Evaluating on-chain metrics and whale movements...",
      "⚡ Processing real-time market data streams...",
      "🎯 Identifying high-probability entry points...",
      "🧠 Neural network analyzing price patterns..."
    ];

    const generateScanMessage = () => {
      const randomAgent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
      const randomTemplate = scanningTemplates[Math.floor(Math.random() * scanningTemplates.length)];
      
      return {
        id: `scan-${Date.now()}-${Math.random()}`,
        agentId: randomAgent.id,
        agentName: randomAgent.name,
        agentAvatar: randomAgent.avatar,
        strategyType: randomAgent.strategyType,
        timestamp: new Date(),
        symbol: 'MARKET',
        action: 'SCAN' as const,
        confidence: '0',
        reasoning: randomTemplate,
      };
    };

    // Add initial scanning message
    setScanningMessages([generateScanMessage()]);

    // Generate new scanning messages periodically
    const interval = setInterval(() => {
      setScanningMessages(prev => {
        const newMessage = generateScanMessage();
        // Keep only last 5 scanning messages
        return [...prev.slice(-4), newMessage];
      });
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, [activeAgents]);

  // Combine signals and scanning messages, sorted by timestamp
  const allMessages = [...signals, ...scanningMessages].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-400';
      case 'SELL': return 'text-red-400';
      case 'SCAN': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BUY': return <TrendingUp className="h-4 w-4" />;
      case 'SELL': return <TrendingDown className="h-4 w-4" />;
      case 'SCAN': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActionBadge = (action: string, confidence: string) => {
    const conf = parseInt(confidence);
    if (action === 'SCAN') {
      return <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">SCANNING</Badge>;
    }
    return (
      <Badge 
        variant={action === 'BUY' ? 'default' : 'destructive'} 
        className="text-xs"
      >
        {action} {conf > 0 ? `${conf}%` : ''}
      </Badge>
    );
  };

  return (
    <Card className="terminal-crt-screen bg-black/60 backdrop-blur border-green-500/30 h-[700px] flex flex-col">
      <CardHeader className="pb-3 border-b border-green-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 text-green-400" />
            <CardTitle className="text-green-400 font-mono text-lg">AI Signal Stream</CardTitle>
            {isLive && (
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-green-400 animate-pulse" />
                <span className="text-xs text-green-400 font-mono">LIVE</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoScroll(!autoScroll)}
              className={`text-xs ${autoScroll ? 'border-green-500 text-green-400' : 'border-gray-600'}`}
            >
              {autoScroll ? '🔒 Auto-Scroll' : '🔓 Manual'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className={`text-xs ${isLive ? 'border-green-500 text-green-400' : 'border-gray-600'}`}
            >
              {isLive ? 'Live' : 'Paused'}
            </Button>
          </div>
        </div>
        
        {/* Active Agents Status */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800">
          <Zap className="h-4 w-4 text-blue-300" />
          <span className="text-xs text-gray-400 font-mono">
            {activeAgents.length} AI Agents Active
          </span>
          <div className="flex -space-x-2 ml-2">
            {activeAgents.slice(0, 5).map(agent => (
              <div key={agent.id} className="relative w-6 h-6 rounded-full border-2 border-gray-900 overflow-hidden">
                <Image
                  src={agent.avatar}
                  alt={agent.name}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-green-400 animate-spin" />
          </div>
        ) : (
          <div 
            ref={scrollRef}
            className="h-full overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-green-500/20 scrollbar-track-transparent"
          >
            <AnimatePresence>
              {allMessages.map((signal, index) => (
                <motion.div
                  key={signal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${signal.action === 'SCAN' ? 'opacity-60' : ''}`}
                >
                  {/* Agent Avatar */}
                  <div className="relative w-10 h-10 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-green-500/30">
                    <Image
                      src={signal.agentAvatar}
                      alt={signal.agentName}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-0.5">
                      {getActionIcon(signal.action)}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm font-mono">
                          {signal.agentName}
                        </span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-600 text-gray-400">
                          {signal.strategyType.replace('_', ' ')}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">
                        {new Date(signal.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Signal Content */}
                    <div className="bg-gray-900/60 rounded-2xl p-3 border border-gray-700/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {signal.action !== 'SCAN' && (
                            <span className={`font-bold text-lg font-mono ${getActionColor(signal.action)}`}>
                              {signal.symbol}
                            </span>
                          )}
                          {getActionBadge(signal.action, signal.confidence)}
                        </div>
                        {signal.price && (
                          <span className="text-white font-mono text-sm">
                            ${signal.price.toFixed(4)}
                          </span>
                        )}
                      </div>

                      {/* Reasoning */}
                      <p className="text-gray-300 text-sm leading-relaxed font-mono">
                        {signal.reasoning}
                      </p>

                      {/* Trade Details */}
                      {signal.action !== 'SCAN' && signal.quantity && (
                        <div className="mt-2 pt-2 border-t border-gray-700/50 flex items-center justify-between text-xs">
                          <span className="text-gray-400 font-mono">
                            Qty: {signal.quantity.toFixed(4)}
                          </span>
                          {signal.result !== undefined && signal.result !== null && (
                            <span className={`font-bold font-mono ${signal.result >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {signal.result >= 0 ? '+' : ''}${signal.result.toFixed(2)}
                            </span>
                          )}
                          {signal.status && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-600">
                              {signal.status}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {allMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
                <Terminal className="h-12 w-12 opacity-30" />
                <p className="text-sm font-mono">No signals yet. Agents are analyzing the market...</p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Terminal Footer */}
      <div className="border-t border-green-500/20 p-2 bg-black/40">
        <div className="flex items-center gap-2 text-xs font-mono text-green-400">
          <span className="animate-pulse">▸</span>
          <span>System monitoring active market signals and AI predictions</span>
        </div>
      </div>
    </Card>
  );
}
