
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Icons } from '../../../components/ui/icons';
import { Wallet, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { AISignalsChat } from './AISignalsChat';
import { CompactWalletQR } from './wallet-qr-code';

interface AgentProfilesProps {
  agents: any[];
  selectedAgent: string | null;
  onSelectAgent: (agentId: string | null) => void;
}

interface WalletBalance {
  agentId: string;
  ethBalance: string;
  usdcBalance: string;
  solBalance: string;
  bnbBalance: string;
  walletAddress: string | null;
  solanaWalletAddress: string | null;
  bscWalletAddress: string | null;
}

export function AgentProfiles({ agents, selectedAgent, onSelectAgent }: AgentProfilesProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'eliminated'>('all');
  const [walletBalances, setWalletBalances] = useState<Record<string, WalletBalance>>({});
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  // Fetch wallet balances
  useEffect(() => {
    const fetchBalances = async () => {
      try {
        setIsLoadingBalances(true);
        const response = await fetch('/api/wallet/balances');
        if (response.ok) {
          const data = await response.json();
          const balancesMap: Record<string, WalletBalance> = {};
          data.balances.forEach((balance: any) => {
            balancesMap[balance.agentId] = balance;
          });
          setWalletBalances(balancesMap);
        }
      } catch (error) {
        console.error('Failed to fetch wallet balances:', error);
      } finally {
        setIsLoadingBalances(false);
      }
    };

    fetchBalances();
    
    // Refresh balances every 15 seconds
    const interval = setInterval(fetchBalances, 60000); // Optimized to 60 seconds
    return () => clearInterval(interval);
  }, []);

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

  const filteredAgents = agents.filter(agent => {
    if (filter === 'active') return agent.isActive;
    if (filter === 'eliminated') return !agent.isActive;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* AI Signals Chat - Live Trading Intelligence */}
      <AISignalsChat />
      
      {/* Filter Controls */}
      <Card className="terminal-crt-screen bg-black/40 backdrop-blur border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Filter:</span>
              {[
                { key: 'all', label: 'All Agents' },
                { key: 'active', label: 'Active' },
                { key: 'eliminated', label: 'Eliminated' }
              ].map((f) => (
                <Button
                  key={f.key}
                  variant={filter === f.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f.key as any)}
                  className="text-xs"
                >
                  {f.label}
                </Button>
              ))}
            </div>
            <Badge variant="outline" className="text-blue-400 border-green-400">
              {filteredAgents.length} agents
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAgents.map((agent) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card 
              className={`bg-black/40 backdrop-blur border-gray-800 cursor-pointer transition-all duration-300 ${
                selectedAgent === agent.id ? 'border-green-600 bg-green-900/20' : 'hover:border-gray-600'
              }`}
              onClick={() => onSelectAgent(selectedAgent === agent.id ? null : agent.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  {/* Agent Avatar */}
                  <div className={`relative w-16 h-16 rounded-full bg-gradient-to-r ${getStrategyColor(agent.strategyType)} flex-shrink-0`}>
                    <div className="relative w-full h-full rounded-full overflow-hidden p-1 flex items-center justify-center">
                      {agent.avatar && typeof agent.avatar === 'string' && agent.avatar.length > 0 ? (
                        <Image
                          src={agent.avatar}
                          alt={agent.name || 'Agent'}
                          fill
                          className="object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                          {agent.name ? agent.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center ${
                      agent.isActive ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {agent.isActive ? (
                        <Icons.play className="h-3 w-3 text-white" />
                      ) : (
                        <Icons.x className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Agent Info */}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-white text-xl mb-1">{agent.name}</CardTitle>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs border-gray-600 text-gray-400"
                      >
                        {agent.strategyType.replace('_', ' ')}
                      </Badge>
                      <Badge 
                        variant={agent.generation === 1 ? "secondary" : "default"}
                        className="text-xs"
                      >
                        Gen {agent.generation}
                      </Badge>
                    </div>
                    <div className="text-gray-400 text-sm truncate">
                      {agent.personality}
                    </div>
                  </div>

                  {/* Performance Indicator */}
                  <div className="flex flex-col items-end space-y-1">
                    <div className={`text-lg font-bold ${agent.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {agent.totalProfitLoss >= 0 ? '+' : ''}${agent.totalProfitLoss.toFixed(0)}
                    </div>
                    <div className="text-gray-400 text-xs">P&L</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Wallet Balances Section */}
                {(agent.walletAddress || agent.solanaWalletAddress) && (
                  <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-2xl p-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-green-400" />
                        <span className="text-xs font-medium text-green-400">Multi-Chain Wallets</span>
                      </div>
                      {isLoadingBalances && (
                        <Loader2 className="h-3 w-3 text-gray-400 animate-spin" />
                      )}
                    </div>
                    
                    {/* EVM Wallet (Base Network) */}
                    {agent.walletAddress && (
                      <div className="mb-3 pb-3 border-b border-gray-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-500 text-blue-400">
                            💎 EVM (Base)
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {/* ETH Balance */}
                          <div className="bg-black/40 rounded-2xl p-2.5 border border-gray-700/50">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-xs text-gray-400">ETH</div>
                              {parseFloat(walletBalances[agent.id]?.ethBalance || '0') > 0 ? (
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-gray-600"></span>
                              )}
                            </div>
                            <div className="text-sm font-bold text-white">
                              {walletBalances[agent.id]?.ethBalance || '0.0000'}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              Gas & Collateral
                            </div>
                          </div>
                          
                          {/* USDC Balance */}
                          <div className="bg-black/40 rounded-2xl p-2.5 border border-gray-700/50">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-xs text-gray-400">USDC</div>
                              {parseFloat(walletBalances[agent.id]?.usdcBalance || '0') > 0 ? (
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                              )}
                            </div>
                            <div className="text-sm font-bold text-green-400">
                              ${walletBalances[agent.id]?.usdcBalance || '0.00'}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              Stable Collateral
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="text-gray-400 truncate">
                              {agent.walletAddress.slice(0, 8)}...{agent.walletAddress.slice(-6)}
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                              <CompactWalletQR 
                                address={agent.walletAddress} 
                                network="EVM" 
                              />
                            </div>
                          </div>
                          <a
                            href={`https://basescan.org/address/${agent.walletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-400 hover:text-blue-300 underline ml-2 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            BaseScan ↗
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {/* Solana Wallet */}
                    {agent.solanaWalletAddress && (
                      <div className="mb-3 pb-3 border-b border-gray-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-500 text-blue-400">
                            ✨ Solana
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-2 mb-2">
                          {/* SOL Balance */}
                          <div className="bg-black/40 rounded-2xl p-2.5 border border-gray-700/50">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-xs text-gray-400">SOL</div>
                              {parseFloat(walletBalances[agent.id]?.solBalance || '0') > 0 ? (
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-gray-600"></span>
                              )}
                            </div>
                            <div className="text-sm font-bold text-blue-400">
                              {walletBalances[agent.id]?.solBalance || '0.0000'} SOL
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              Native Token
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="text-gray-400 truncate">
                              {agent.solanaWalletAddress.slice(0, 8)}...{agent.solanaWalletAddress.slice(-6)}
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                              <CompactWalletQR 
                                address={agent.solanaWalletAddress} 
                                network="SOL" 
                              />
                            </div>
                          </div>
                          <a
                            href={`https://solscan.io/account/${agent.solanaWalletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-400 hover:text-purple-300 underline ml-2 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Solscan ↗
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {/* BNB Wallet */}
                    {agent.bscWalletAddress && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-400 text-blue-300">
                            🟡 BSC
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-2 mb-2">
                          {/* BNB Balance */}
                          <div className="bg-black/40 rounded-2xl p-2.5 border border-gray-700/50">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-xs text-gray-400">BNB</div>
                              {parseFloat(walletBalances[agent.id]?.bnbBalance || '0') > 0 ? (
                                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-gray-600"></span>
                              )}
                            </div>
                            <div className="text-sm font-bold text-blue-300">
                              {walletBalances[agent.id]?.bnbBalance || '0.0000'} BNB
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              Native Token
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="text-gray-400 truncate">
                              {agent.bscWalletAddress.slice(0, 8)}...{agent.bscWalletAddress.slice(-6)}
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                              <CompactWalletQR 
                                address={agent.bscWalletAddress} 
                                network="BNB" 
                              />
                            </div>
                          </div>
                          <a
                            href={`https://bscscan.com/address/${agent.bscWalletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-300 hover:text-yellow-300 underline ml-2 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            BscScan ↗
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Key Stats Grid */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center p-2 bg-gray-900/40 rounded">
                    <div className="text-white text-sm font-medium">{agent.sharpeRatio.toFixed(2)}</div>
                    <div className="text-gray-400 text-xs">Sharpe</div>
                  </div>
                  <div className="text-center p-2 bg-gray-900/40 rounded">
                    <div className="text-white text-sm font-medium">{(agent.winRate * 100).toFixed(0)}%</div>
                    <div className="text-gray-400 text-xs">Win Rate</div>
                  </div>
                  <div className="text-center p-2 bg-gray-900/40 rounded">
                    <div className="text-white text-sm font-medium">{agent.totalTrades}</div>
                    <div className="text-gray-400 text-xs">Trades</div>
                  </div>
                  <div className="text-center p-2 bg-gray-900/40 rounded">
                    <div className={`text-sm font-medium ${agent.maxDrawdown <= 0.1 ? 'text-green-400' : 'text-blue-300'}`}>
                      {(agent.maxDrawdown * 100).toFixed(0)}%
                    </div>
                    <div className="text-gray-400 text-xs">Drawdown</div>
                  </div>
                </div>

                {/* Strategy Parameters Preview */}
                <div className="space-y-2">
                  <div className="text-white text-sm font-medium">Strategy Configuration</div>
                  <div className="bg-gray-900/40 rounded p-3 max-h-20 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      {Object.entries(agent.parameters).slice(0, 6).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-400 truncate">{key}:</span>
                          <span className="text-white">
                            {typeof value === 'number' ? value.toFixed(2) : value.toString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                {agent.trades && agent.trades.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-white text-sm font-medium">Recent Trades</div>
                    <div className="space-y-1 max-h-16 overflow-y-auto">
                      {agent.trades.slice(0, 3).map((trade: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={trade.side === 'BUY' ? 'default' : 'destructive'}
                              className="text-xs px-1 py-0"
                            >
                              {trade.side}
                            </Badge>
                            <span className="text-gray-400">{trade.symbol}</span>
                          </div>
                          <div className={`${trade.profitLoss && trade.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.profitLoss ? `${trade.profitLoss >= 0 ? '+' : ''}$${trade.profitLoss.toFixed(0)}` : 'Open'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evolution History */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div>Mutations: {agent.mutationCount}</div>
                  <div>Wins/Losses: {agent.totalWins}/{agent.totalLosses}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
