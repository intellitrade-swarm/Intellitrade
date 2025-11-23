
'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Wallet, 
  TrendingUp, 
  Activity, 
  DollarSign,
  Zap,
  Brain,
  Target,
  ChevronRight
} from 'lucide-react';
import { WalletManagementPanel } from './WalletManagementPanel';
import { SolanaWalletPanel } from './SolanaWalletPanel';
import { BNBWalletPanel } from './BNBWalletPanel';
import { AgentChatRoom } from './AgentChatRoom';
import { CompactWalletQR } from './wallet-qr-code';

interface UnifiedAgentWalletProps {
  agents: any[];
  selectedAgent?: string | null;
  onSelectAgent?: (agentId: string) => void;
}

export function UnifiedAgentWallet({ agents, selectedAgent, onSelectAgent }: UnifiedAgentWalletProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'wallets' | 'trades'>('overview');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(selectedAgent || null);

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    if (onSelectAgent) {
      onSelectAgent(agentId);
    }
  };

  const currentAgent = selectedAgentId ? agents.find(a => a.id === selectedAgentId) : null;

  const getTotalBalance = (agent: any) => {
    const ethBalance = agent.realBalance || 0;
    const solBalance = agent.solanaBalance || 0; 
    const bnbBalance = agent.bscBalance || 0;
    return ethBalance + solBalance + bnbBalance;
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 10) return 'text-green-500';
    if (value >= 0) return 'text-blue-400';
    if (value >= -5) return 'text-blue-400';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI Agents & Wallets</h2>
          <p className="text-sm text-muted-foreground">
            Manage your AI trading agents and their multi-chain wallets
          </p>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map((agent) => {
          const totalBalance = getTotalBalance(agent);
          const performanceValue = agent.performance24h || 0;
          
          return (
            <Card
              key={agent.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                selectedAgentId === agent.id
                  ? 'ring-2 ring-green-500 bg-gradient-to-br from-green-500/10 to-blue-500/10'
                  : 'hover:border-green-500/50'
              }`}
              onClick={() => handleSelectAgent(agent.id)}
            >
              <div className="space-y-3">
                {/* Agent Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0 ring-2 ring-green-500/30 flex items-center justify-center">
                      {agent.avatar && typeof agent.avatar === 'string' && agent.avatar.trim().length > 0 ? (
                        <Image
                          src={agent.avatar}
                          alt={agent.name || 'Agent'}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold bg-gradient-to-br from-blue-500 to-blue-500">
                          {agent.name ? agent.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate text-base">{agent.name}</h3>
                      <Badge variant="outline" className="text-xs mt-1">
                        {agent.aiProvider}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className={`h-5 w-5 transition-transform ${
                    selectedAgentId === agent.id ? 'rotate-90 text-green-500' : 'text-muted-foreground'
                  }`} />
                </div>

                {/* Strategy Type */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span>{agent.strategyType}</span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Total Balance */}
                  <div className="p-2 bg-gradient-to-br from-blue-500/10 to-blue-500/10 rounded border border-blue-500/20">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <DollarSign className="h-3 w-3" />
                      <span>Balance</span>
                    </div>
                    <div className="font-bold text-sm text-blue-400">
                      ${totalBalance.toFixed(2)}
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="p-2 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded border border-blue-500/20">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>24h</span>
                    </div>
                    <div className={`font-bold text-sm ${getPerformanceColor(performanceValue)}`}>
                      {performanceValue >= 0 ? '+' : ''}{performanceValue.toFixed(2)}%
                    </div>
                  </div>

                  {/* Total Trades */}
                  <div className="p-2 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded border border-green-500/20">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Activity className="h-3 w-3" />
                      <span>Trades</span>
                    </div>
                    <div className="font-bold text-sm text-green-400">
                      {agent.totalTrades || 0}
                    </div>
                  </div>

                  {/* Win Rate */}
                  <div className="p-2 bg-gradient-to-br from-blue-500/10 to-red-500/10 rounded border border-blue-500/20">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Zap className="h-3 w-3" />
                      <span>Win Rate</span>
                    </div>
                    <div className="font-bold text-sm text-blue-400">
                      {agent.winRate || 0}%
                    </div>
                  </div>
                </div>

                {/* Wallet Status Indicators */}
                <div className="flex items-center gap-1 pt-2 border-t border-gray-800">
                  {agent.walletAddress && (
                    <Badge variant="secondary" className="text-xs">
                      💎 ETH
                    </Badge>
                  )}
                  {agent.solanaWalletAddress && (
                    <Badge variant="secondary" className="text-xs">
                      ✨ SOL
                    </Badge>
                  )}
                  {agent.bscWalletAddress && (
                    <Badge variant="secondary" className="text-xs">
                      🟡 BNB
                    </Badge>
                  )}
                  {!agent.walletAddress && !agent.solanaWalletAddress && !agent.bscWalletAddress && (
                    <Badge variant="outline" className="text-xs">
                      <Wallet className="h-3 w-3 mr-1" />
                      No wallets
                    </Badge>
                  )}
                </div>

                {/* AI Status */}
                {agent.isActive && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-green-400">AI Trading Active</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selected Agent Details */}
      {currentAgent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          {/* Agent Profile Card */}
          <Card className="terminal-crt-screen p-6 bg-gradient-to-br from-card to-card/80 border-green-500/30">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted ring-4 ring-green-500/30 flex items-center justify-center">
                {currentAgent.avatar && typeof currentAgent.avatar === 'string' && currentAgent.avatar.trim().length > 0 ? (
                  <Image
                    src={currentAgent.avatar}
                    alt={currentAgent.name || 'Agent'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold bg-gradient-to-br from-blue-500 to-blue-500">
                    {currentAgent.name ? currentAgent.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    {currentAgent.name}
                    {currentAgent.isActive && (
                      <Badge className="bg-green-600">
                        <div className="w-2 h-2 rounded-full bg-white mr-1 animate-pulse" />
                        Active
                      </Badge>
                    )}
                  </h3>
                  <p className="text-muted-foreground mt-1">{currentAgent.description || 'AI Trading Agent'}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    <Brain className="h-3 w-3 mr-1" />
                    {currentAgent.aiProvider}
                  </Badge>
                  <Badge variant="outline">
                    <Target className="h-3 w-3 mr-1" />
                    {currentAgent.strategyType}
                  </Badge>
                  <Badge variant="outline">
                    Risk: {currentAgent.riskTolerance}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-3 min-w-[200px]">
                <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-blue-500/20 rounded-2xl border border-blue-500/30">
                  <div className="text-sm text-muted-foreground mb-1">Total Portfolio</div>
                  <div className="text-3xl font-bold text-blue-400">
                    ${getTotalBalance(currentAgent).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs for Wallets and Trades */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">
                <Activity className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="wallets">
                <Wallet className="h-4 w-4 mr-2" />
                Wallets
              </TabsTrigger>
              <TabsTrigger value="trades">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trades
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* ETH Wallet */}
                <Card className="terminal-crt-screen p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/10 border-blue-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">ETH (Base)</h4>
                    <Badge variant="secondary">💎</Badge>
                  </div>
                  {currentAgent.walletAddress ? (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-blue-400">
                        ${currentAgent.realBalance?.toFixed(2) || '0.00'}
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-black/30 px-2 py-1 rounded flex-1 truncate">
                          {currentAgent.walletAddress}
                        </code>
                        <CompactWalletQR 
                          address={currentAgent.walletAddress} 
                          network="EVM" 
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No ETH wallet</p>
                  )}
                </Card>

                {/* SOL Wallet */}
                <Card className="terminal-crt-screen p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">SOL (Solana)</h4>
                    <Badge variant="secondary">✨</Badge>
                  </div>
                  {currentAgent.solanaWalletAddress ? (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-blue-400">
                        ${currentAgent.solanaBalance?.toFixed(2) || '0.00'}
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-black/30 px-2 py-1 rounded flex-1 truncate">
                          {currentAgent.solanaWalletAddress}
                        </code>
                        <CompactWalletQR 
                          address={currentAgent.solanaWalletAddress} 
                          network="SOL" 
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No SOL wallet</p>
                  )}
                </Card>

                {/* BNB Wallet */}
                <Card className="terminal-crt-screen p-4 bg-gradient-to-br from-blue-400/10 to-blue-500/10 border-blue-400/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">BNB (BSC)</h4>
                    <Badge variant="secondary">🟡</Badge>
                  </div>
                  {currentAgent.bscWalletAddress ? (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-blue-300">
                        ${currentAgent.bscBalance?.toFixed(2) || '0.00'}
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-black/30 px-2 py-1 rounded flex-1 truncate">
                          {currentAgent.bscWalletAddress}
                        </code>
                        <CompactWalletQR 
                          address={currentAgent.bscWalletAddress} 
                          network="BNB" 
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No BNB wallet</p>
                  )}
                </Card>
              </div>

              {/* Performance Stats */}
              <Card className="terminal-crt-screen p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Trades</div>
                    <div className="text-2xl font-bold">{currentAgent.totalTrades || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
                    <div className="text-2xl font-bold text-green-400">{currentAgent.winRate || 0}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">24h Performance</div>
                    <div className={`text-2xl font-bold ${getPerformanceColor(currentAgent.performance24h || 0)}`}>
                      {currentAgent.performance24h >= 0 ? '+' : ''}{currentAgent.performance24h?.toFixed(2) || '0.00'}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Profit/Loss</div>
                    <div className={`text-2xl font-bold ${(currentAgent.profitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${currentAgent.profitLoss?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="wallets" className="space-y-6">
              <Tabs defaultValue="evm" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="evm">
                    <span className="flex items-center gap-2">
                      💎 ETH (Base)
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="solana">
                    <span className="flex items-center gap-2">
                      ✨ SOL (Solana)
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="bsc">
                    <span className="flex items-center gap-2">
                      🟡 BNB (BSC)
                    </span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="evm">
                  <WalletManagementPanel agents={[currentAgent]} />
                </TabsContent>
                <TabsContent value="solana">
                  <SolanaWalletPanel agents={[currentAgent]} />
                </TabsContent>
                <TabsContent value="bsc">
                  <BNBWalletPanel agents={[currentAgent]} />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="trades">
              <AgentChatRoom agents={[currentAgent]} />
            </TabsContent>
          </Tabs>
        </motion.div>
      )}

      {/* Show all wallets if no agent selected */}
      {!currentAgent && (
        <div className="space-y-6">
          <Tabs defaultValue="evm" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="evm">
                <span className="flex items-center gap-2">
                  💎 ETH (Base)
                </span>
              </TabsTrigger>
              <TabsTrigger value="solana">
                <span className="flex items-center gap-2">
                  ✨ SOL (Solana)
                </span>
              </TabsTrigger>
              <TabsTrigger value="bsc">
                <span className="flex items-center gap-2">
                  🟡 BNB (BSC)
                </span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="evm">
              <WalletManagementPanel agents={agents} />
            </TabsContent>
            <TabsContent value="solana">
              <SolanaWalletPanel agents={agents} />
            </TabsContent>
            <TabsContent value="bsc">
              <BNBWalletPanel agents={agents} />
            </TabsContent>
          </Tabs>
          <AgentChatRoom agents={agents} />
        </div>
      )}
    </div>
  );
}
