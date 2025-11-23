
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Copy, TrendingUp, Users, Wallet, Activity, Play, Pause, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface Agent {
  id: string;
  name: string;
  avatar: string;
  totalProfitLoss: number;
  winRate: number;
  recentWinRate: number;
  activeCopiers: number;
  last24hPnL: number;
  totalTrades: number;
}

interface CopyTradeSettings {
  agentId: string;
  allocationAmount: number;
  copyPercentage: number;
  maxPositionSize?: number;
  stopLoss?: number;
  takeProfit?: number;
}

export function CopyTradingDashboard() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  
  const [topAgents, setTopAgents] = useState<Agent[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Fetch top agents by PNL
  useEffect(() => {
    fetchTopAgents();
  }, []);

  // Fetch user copy trading stats when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      fetchUserStats();
    }
  }, [isConnected, address]);

  const fetchTopAgents = async () => {
    try {
      const response = await fetch('/api/copy-trading/top-agents?limit=20');
      const data = await response.json();
      setTopAgents(data);
    } catch (error) {
      console.error('Error fetching top agents:', error);
    }
  };

  const fetchUserStats = async () => {
    if (!address) return;
    
    try {
      const response = await fetch(`/api/copy-trading/stats?walletAddress=${address}`);
      const data = await response.json();
      setUserStats(data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleStartCopyTrading = async (settings: CopyTradeSettings) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/copy-trading/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          ...settings
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Copy trading started successfully!');
        setShowSettings(false);
        fetchUserStats();
      } else {
        toast.error(data.error || 'Failed to start copy trading');
      }
    } catch (error) {
      console.error('Error starting copy trading:', error);
      toast.error('Failed to start copy trading');
    } finally {
      setLoading(false);
    }
  };

  const handleStopCopyTrading = async (copyTradeId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/copy-trading/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ copyTradeId })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Copy trading stopped');
        fetchUserStats();
      } else {
        toast.error(data.error || 'Failed to stop copy trading');
      }
    } catch (error) {
      console.error('Error stopping copy trading:', error);
      toast.error('Failed to stop copy trading');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Wallet Connection */}
      <Card className="terminal-crt-screen border-green-500/20 bg-gradient-to-br from-black via-gray-900 to-green-900/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Copy className="h-6 w-6 text-green-400" />
                Copy Trading
              </CardTitle>
              <CardDescription className="text-gray-400">
                Copy trades from top-performing AI agents
              </CardDescription>
            </div>
            <div>
              {isConnected ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Connected Wallet</p>
                    <p className="text-sm font-mono text-green-400 break-all">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => disconnect()}
                    className="border-red-500/50 hover:bg-red-500/10"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => open()}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {isConnected && userStats && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Active Copies</p>
                <p className="text-2xl font-bold text-green-400">{userStats.activeCopyTrades}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Total Trades</p>
                <p className="text-2xl font-bold">{userStats.totalCopiedTrades}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Total Profit</p>
                <p className="text-2xl font-bold text-green-400">
                  ${userStats.totalProfit.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Net P&L</p>
                <p className={`text-2xl font-bold ${userStats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${userStats.netProfit.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Top Agents by PnL Feed - Prominent Display */}
      <Card className="terminal-crt-screen border-green-500/30 bg-gradient-to-br from-gray-900 via-black to-green-900/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Top Performers by PnL
              </CardTitle>
              <CardDescription className="text-gray-400">
                Live feed of highest-earning AI agents
              </CardDescription>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Horizontal scrolling feed */}
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {topAgents.slice(0, 10).map((agent, index) => (
                <div 
                  key={agent.id}
                  className="min-w-[280px] sm:min-w-[320px] snap-start"
                >
                  <Card 
                    className="border-gray-700 hover:border-green-500/50 transition-all cursor-pointer h-full bg-gradient-to-br from-gray-900 to-black"
                    onClick={() => {
                      setSelectedAgent(agent);
                      if (isConnected) {
                        setShowSettings(true);
                      }
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <TrendingUp className={`h-4 w-4 ${agent.totalProfitLoss > 0 ? 'text-green-400' : 'text-red-400'}`} />
                      </div>
                      <div className="flex items-center gap-3">
                        <img 
                          src={agent.avatar} 
                          alt={agent.name}
                          className="w-10 h-10 rounded-full border-2 border-green-500/30"
                        />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">{agent.name}</CardTitle>
                          <div className="flex items-center gap-1 mt-1">
                            <Users className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-400 truncate">
                              {agent.activeCopiers} copiers
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-gray-800/50 p-2 rounded">
                          <p className="text-xs text-gray-400">Total P&L</p>
                          <p className={`font-bold truncate ${agent.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${agent.totalProfitLoss.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-gray-800/50 p-2 rounded">
                          <p className="text-xs text-gray-400">Win Rate</p>
                          <p className="font-bold">{agent.winRate.toFixed(1)}%</p>
                        </div>
                        <div className="bg-gray-800/50 p-2 rounded">
                          <p className="text-xs text-gray-400">24h P&L</p>
                          <p className={`font-bold truncate ${agent.last24hPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${agent.last24hPnL.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-gray-800/50 p-2 rounded">
                          <p className="text-xs text-gray-400">Trades</p>
                          <p className="font-bold">{agent.totalTrades}</p>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isConnected) {
                            open();
                          } else {
                            setSelectedAgent(agent);
                            setShowSettings(true);
                          }
                        }}
                      >
                        <Play className="h-3 w-3 mr-2" />
                        Copy This Agent
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            
            {/* Scroll indicator */}
            {topAgents.length > 3 && (
              <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 text-green-400 opacity-50 animate-pulse pointer-events-none">
                <div className="text-2xl">→</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="top-agents" className="space-y-4">
        <TabsList className="bg-gray-800/50">
          <TabsTrigger value="top-agents">Top Agents by PNL</TabsTrigger>
          <TabsTrigger value="my-copies" disabled={!isConnected}>
            My Copy Trades
          </TabsTrigger>
        </TabsList>

        {/* Top Agents Tab */}
        <TabsContent value="top-agents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topAgents.map((agent) => (
              <Card 
                key={agent.id} 
                className="border-gray-700 hover:border-green-500/50 transition-all cursor-pointer"
                onClick={() => setSelectedAgent(agent)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={agent.avatar} 
                        alt={agent.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {agent.activeCopiers} copiers
                          </span>
                        </div>
                      </div>
                    </div>
                    <TrendingUp className={`h-5 w-5 ${agent.totalProfitLoss > 0 ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400">Total P&L</p>
                      <p className={`font-bold ${agent.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${agent.totalProfitLoss.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Win Rate</p>
                      <p className="font-bold">{agent.winRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">24h P&L</p>
                      <p className={`font-bold ${agent.last24hPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${agent.last24hPnL.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Total Trades</p>
                      <p className="font-bold">{agent.totalTrades}</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isConnected) {
                        open();
                      } else {
                        setSelectedAgent(agent);
                        setShowSettings(true);
                      }
                    }}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Copying
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Copy Trades Tab */}
        <TabsContent value="my-copies" className="space-y-4">
          {userStats?.copyTrades?.length === 0 ? (
            <Card className="terminal-crt-screen border-gray-700">
              <CardContent className="py-12 text-center">
                <p className="text-gray-400">You are not copying any agents yet.</p>
                <Button 
                  className="mt-4 bg-gradient-to-r from-green-600 to-blue-600"
                  onClick={() => {
                    const tabsList = document.querySelector('[value="top-agents"]') as HTMLElement;
                    tabsList?.click();
                  }}
                >
                  Browse Top Agents
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {userStats?.copyTrades?.map((copyTrade: any) => (
                <Card key={copyTrade.id} className="border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={copyTrade.agent.avatar} 
                          alt={copyTrade.agent.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <CardTitle className="text-lg">{copyTrade.agent.name}</CardTitle>
                          <Badge variant={copyTrade.isActive ? 'default' : 'secondary'}>
                            {copyTrade.status}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant={copyTrade.isActive ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => {
                          if (copyTrade.isActive) {
                            handleStopCopyTrading(copyTrade.id);
                          }
                        }}
                      >
                        {copyTrade.isActive ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Allocation</p>
                        <p className="font-bold">${copyTrade.allocationAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Copy %</p>
                        <p className="font-bold">{copyTrade.copyPercentage}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Trades Copied</p>
                        <p className="font-bold">{copyTrade.totalCopiedTrades}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Net P&L</p>
                        <p className={`font-bold ${(copyTrade.totalProfit - copyTrade.totalLoss) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${(copyTrade.totalProfit - copyTrade.totalLoss).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Copy Trading Settings Dialog */}
      <CopyTradingSettingsDialog
        agent={selectedAgent}
        open={showSettings}
        onOpenChange={setShowSettings}
        onSubmit={handleStartCopyTrading}
        loading={loading}
      />
    </div>
  );
}

// Copy Trading Settings Dialog Component
function CopyTradingSettingsDialog({
  agent,
  open,
  onOpenChange,
  onSubmit,
  loading
}: {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (settings: CopyTradeSettings) => void;
  loading: boolean;
}) {
  const [settings, setSettings] = useState<CopyTradeSettings>({
    agentId: '',
    allocationAmount: 1000,
    copyPercentage: 100,
  });

  useEffect(() => {
    if (agent) {
      setSettings(prev => ({ ...prev, agentId: agent.id }));
    }
  }, [agent]);

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img src={agent.avatar} alt={agent.name} className="w-8 h-8 rounded-full" />
            Copy {agent.name}
          </DialogTitle>
          <DialogDescription>
            Configure your copy trading settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="allocation">Allocation Amount (USD)</Label>
            <Input
              id="allocation"
              type="number"
              min="100"
              step="100"
              value={settings.allocationAmount}
              onChange={(e) => setSettings({ ...settings, allocationAmount: parseFloat(e.target.value) })}
              className="bg-gray-800 border-gray-700"
            />
            <p className="text-xs text-gray-400 mt-1">
              Total amount to allocate for copying this agent
            </p>
          </div>

          <div>
            <Label htmlFor="copyPercentage">Copy Percentage (%)</Label>
            <Input
              id="copyPercentage"
              type="number"
              min="1"
              max="100"
              value={settings.copyPercentage}
              onChange={(e) => setSettings({ ...settings, copyPercentage: parseFloat(e.target.value) })}
              className="bg-gray-800 border-gray-700"
            />
            <p className="text-xs text-gray-400 mt-1">
              Percentage of agent's position size to copy (1-100%)
            </p>
          </div>

          <div>
            <Label htmlFor="maxPosition">Max Position Size (Optional)</Label>
            <Input
              id="maxPosition"
              type="number"
              min="0"
              step="100"
              placeholder="No limit"
              value={settings.maxPositionSize || ''}
              onChange={(e) => setSettings({ 
                ...settings, 
                maxPositionSize: e.target.value ? parseFloat(e.target.value) : undefined 
              })}
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stopLoss">Stop Loss (%)</Label>
              <Input
                id="stopLoss"
                type="number"
                min="0"
                max="100"
                step="1"
                placeholder="Optional"
                value={settings.stopLoss || ''}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  stopLoss: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="takeProfit">Take Profit (%)</Label>
              <Input
                id="takeProfit"
                type="number"
                min="0"
                step="1"
                placeholder="Optional"
                value={settings.takeProfit || ''}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  takeProfit: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-green-600 to-blue-600"
            onClick={() => onSubmit(settings)}
            disabled={loading}
          >
            {loading ? 'Starting...' : 'Start Copy Trading'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
