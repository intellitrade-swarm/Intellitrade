
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Zap,
  Eye,
  DollarSign,
  LineChart,
  BarChart3,
  Bot,
  Signal,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Agent {
  id: string;
  name: string;
  strategyType: string;
  avatar?: string;
}

interface ChatMessage {
  id: string;
  agentId: string;
  agentName: string;
  strategyType: string;
  messageType: 'signal' | 'action' | 'scan' | 'alert' | 'analysis';
  content: string;
  timestamp: Date;
  metadata?: {
    symbol?: string;
    action?: 'BUY' | 'SELL' | 'HOLD';
    confidence?: number;
    price?: number;
    target?: number;
  };
}

interface AgentChatRoomProps {
  agents: Agent[];
}

export function AgentChatRoom({ agents }: AgentChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLive, setIsLive] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Simulate agent messages
  useEffect(() => {
    if (!isLive || agents.length === 0) return;

    const generateMessage = (): ChatMessage => {
      const agent = agents[Math.floor(Math.random() * agents.length)];
      const messageTypes: ChatMessage['messageType'][] = ['signal', 'action', 'scan', 'alert', 'analysis'];
      const symbols = ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'DOGE', 'DOT', 'MATIC', 'AVAX', 'LINK'];
      const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
      
      const templates: Record<ChatMessage['messageType'], () => { content: string; metadata?: any }> = {
        signal: () => {
          const symbol = symbols[Math.floor(Math.random() * symbols.length)];
          const action = Math.random() > 0.5 ? 'BUY' : 'SELL';
          const confidence = 70 + Math.random() * 30;
          const price = 100 + Math.random() * 900;
          return {
            content: `🎯 ${action} signal detected for ${symbol} at $${price.toFixed(2)}`,
            metadata: { symbol, action, confidence, price }
          };
        },
        action: () => {
          const symbol = symbols[Math.floor(Math.random() * symbols.length)];
          const action = Math.random() > 0.5 ? 'BUY' : 'SELL';
          const amount = (Math.random() * 1000).toFixed(2);
          return {
            content: `⚡ Executing ${action} order for ${symbol} - ${amount} units`,
            metadata: { symbol, action }
          };
        },
        scan: () => {
          const symbol = symbols[Math.floor(Math.random() * symbols.length)];
          const indicator = ['RSI', 'MACD', 'Volume', 'MA Crossover', 'Support/Resistance'][Math.floor(Math.random() * 5)];
          return {
            content: `🔍 Scanning ${symbol}: ${indicator} shows ${Math.random() > 0.5 ? 'bullish' : 'bearish'} divergence`,
            metadata: { symbol }
          };
        },
        alert: () => {
          const symbol = symbols[Math.floor(Math.random() * symbols.length)];
          const alertTypes = [
            `Volume spike detected on ${symbol}`,
            `${symbol} breaking resistance level`,
            `Whale movement detected in ${symbol}`,
            `Smart money accumulating ${symbol}`,
            `${symbol} volatility increasing`
          ];
          return {
            content: `⚠️ ${alertTypes[Math.floor(Math.random() * alertTypes.length)]}`,
            metadata: { symbol }
          };
        },
        analysis: () => {
          const symbol = symbols[Math.floor(Math.random() * symbols.length)];
          const analyses = [
            `${symbol} showing strong uptrend on 4H chart`,
            `Risk/reward ratio favorable for ${symbol}`,
            `${symbol} correlation with BTC increasing`,
            `Technical setup looking good for ${symbol}`,
            `Market sentiment shifting positive for ${symbol}`
          ];
          return {
            content: `📊 ${analyses[Math.floor(Math.random() * analyses.length)]}`,
            metadata: { symbol }
          };
        }
      };

      const { content, metadata } = templates[messageType]();

      return {
        id: `msg-${Date.now()}-${Math.random()}`,
        agentId: agent.id,
        agentName: agent.name,
        strategyType: agent.strategyType,
        messageType,
        content,
        timestamp: new Date(),
        metadata
      };
    };

    // Initial messages
    const initialMessages: ChatMessage[] = [];
    for (let i = 0; i < 8; i++) {
      initialMessages.push(generateMessage());
    }
    setMessages(initialMessages);

    // Add new messages periodically
    const interval = setInterval(() => {
      const newMessage = generateMessage();
      setMessages(prev => {
        const updated = [newMessage, ...prev];
        return updated.slice(0, 50); // Keep last 50 messages
      });
    }, 10000 + Math.random() * 10000); // Random interval 10-20 seconds

    return () => clearInterval(interval);
  }, [agents, isLive]);

  // Auto-scroll to top when new messages arrive
  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
  }, [messages, autoScroll]);

  const getMessageIcon = (type: ChatMessage['messageType']) => {
    switch (type) {
      case 'signal': return <Target className="h-4 w-4" />;
      case 'action': return <Zap className="h-4 w-4" />;
      case 'scan': return <Eye className="h-4 w-4" />;
      case 'alert': return <Activity className="h-4 w-4" />;
      case 'analysis': return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getMessageColor = (type: ChatMessage['messageType']) => {
    switch (type) {
      case 'signal': return 'from-blue-500/20 to-blue-600/20 border-blue-500/30';
      case 'action': return 'from-blue-600/20 to-blue-700/20 border-blue-600/30';
      case 'scan': return 'from-blue-700/20 to-blue-800/20 border-blue-700/30';
      case 'alert': return 'from-blue-400/20 to-blue-500/20 border-blue-400/30';
      case 'analysis': return 'from-blue-800/20 to-blue-900/20 border-blue-800/30';
    }
  };

  const getActionColor = (action?: string) => {
    if (action === 'BUY') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (action === 'SELL') return 'bg-blue-700/20 text-blue-300 border-blue-700/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-blue-950 to-black p-8 text-white shadow-2xl border border-blue-800/30">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <MessageSquare className="h-10 w-10 animate-pulse text-blue-400" />
                  Agent Intelligence Network
                </h2>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-blue-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  <Badge variant="secondary" className="bg-blue-500/20 border-blue-500/30">
                    {isLive ? 'LIVE' : 'PAUSED'}
                  </Badge>
                </div>
              </div>
              <p className="text-lg text-blue-200">
                Real-time agent communications • Trading signals • Market analysis • Opportunity alerts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsLive(!isLive)}
                variant="secondary"
                size="lg"
                className="gap-2 bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30"
              >
                {isLive ? 'Pause' : 'Resume'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="terminal-crt-screen p-6 bg-gradient-to-br from-blue-900/50 to-blue-950/50 border-blue-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-300 font-medium">Active Agents</p>
              <p className="text-3xl font-bold mt-2 text-blue-400">{agents.length}</p>
            </div>
            <div className="p-4 rounded-full bg-blue-500/20">
              <Bot className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="terminal-crt-screen p-6 bg-gradient-to-br from-blue-900/50 to-blue-950/50 border-blue-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-300 font-medium">Messages</p>
              <p className="text-3xl font-bold mt-2 text-blue-400">{messages.length}</p>
            </div>
            <div className="p-4 rounded-full bg-blue-500/20">
              <MessageSquare className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="terminal-crt-screen p-6 bg-gradient-to-br from-blue-900/50 to-blue-950/50 border-blue-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-300 font-medium">Signals</p>
              <p className="text-3xl font-bold mt-2 text-blue-400">
                {messages.filter(m => m.messageType === 'signal').length}
              </p>
            </div>
            <div className="p-4 rounded-full bg-blue-500/20">
              <Signal className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="terminal-crt-screen p-6 bg-gradient-to-br from-blue-900/50 to-blue-950/50 border-blue-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-300 font-medium">Actions</p>
              <p className="text-3xl font-bold mt-2 text-blue-400">
                {messages.filter(m => m.messageType === 'action').length}
              </p>
            </div>
            <div className="p-4 rounded-full bg-blue-500/20">
              <Zap className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Chat Room */}
      <Card className="terminal-crt-screen p-6 bg-black/50 border-blue-800/30">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2 text-blue-300">
            <Activity className="h-6 w-6 text-blue-400" />
            Live Activity Stream
          </h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAutoScroll(!autoScroll)}
              className={autoScroll ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-gray-600'}
            >
              Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[600px] pr-4" ref={scrollAreaRef}>
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="mb-4"
              >
                <Card className={`p-4 bg-gradient-to-r ${getMessageColor(message.messageType)} border-2`}>
                  <div className="flex items-start gap-3">
                    {/* Agent Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold shadow-lg">
                        {message.agentName.substring(0, 2).toUpperCase()}
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{message.agentName}</span>
                        <Badge variant="outline" className="text-xs">
                          {message.strategyType}
                        </Badge>
                        <div className="flex items-center gap-1 ml-auto">
                          {getMessageIcon(message.messageType)}
                          <span className="text-xs text-muted-foreground capitalize">
                            {message.messageType}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm mb-2">{message.content}</p>

                      {/* Metadata */}
                      {message.metadata && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {message.metadata.symbol && (
                            <Badge variant="secondary" className="text-xs">
                              {message.metadata.symbol}
                            </Badge>
                          )}
                          {message.metadata.action && (
                            <Badge className={`text-xs border ${getActionColor(message.metadata.action)}`}>
                              {message.metadata.action}
                            </Badge>
                          )}
                          {message.metadata.confidence && (
                            <Badge variant="outline" className="text-xs">
                              {message.metadata.confidence.toFixed(1)}% confidence
                            </Badge>
                          )}
                          {message.metadata.price && (
                            <Badge variant="outline" className="text-xs">
                              ${message.metadata.price.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      </Card>
    </div>
  );
}
