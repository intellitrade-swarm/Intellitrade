
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Bot,
  DollarSign,
  Zap,
  Play,
  Pause
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface TradingPanelProps {
  agents: any[];
}

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
}

export function TradingPanel({ agents }: TradingPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [tradeType, setTradeType] = useState<'manual' | 'auto'>('manual');
  
  // Manual Trading State
  const [symbol, setSymbol] = useState('BTC');
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState('10');
  const [trading, setTrading] = useState(false);
  
  // Auto Trading State
  const [autoTrading, setAutoTrading] = useState(false);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  
  // Recent Trades
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(false);

  const tradableAgents = agents.filter(a => a.walletAddress && a.realBalance > 0);
  const symbols = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'MATIC', 'DOT', 'AVAX'];

  useEffect(() => {
    fetchRecentTrades();
    const interval = setInterval(fetchRecentTrades, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchRecentTrades = async () => {
    setLoadingTrades(true);
    try {
      const response = await fetch('/api/trades');
      const data = await response.json();
      if (data.success) {
        setRecentTrades(data.trades.slice(0, 10));
        toast.success('Trades refreshed');
      } else {
        toast.error('Failed to fetch trades');
      }
    } catch (error) {
      console.error('Error fetching recent trades:', error);
      toast.error('Failed to fetch trades');
    } finally {
      setLoadingTrades(false);
    }
  };

  const executeManualTrade = async () => {
    if (!selectedAgent) {
      toast.error('Please select an agent');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setTrading(true);
    try {
      const response = await fetch('/api/wallet/manual-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          symbol,
          action,
          usdAmount: parseFloat(amount),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Trade executed successfully! TX: ${data.txHash?.slice(0, 10)}...`);
        fetchRecentTrades();
        // Refresh agent balance
        window.location.reload();
      } else {
        toast.error(data.error || 'Trade failed');
      }
    } catch (error) {
      console.error('Error executing trade:', error);
      toast.error('Failed to execute trade');
    } finally {
      setTrading(false);
    }
  };

  const executeAutoTrade = async (agentId?: string) => {
    setAutoTrading(true);
    try {
      const response = await fetch('/api/ai/auto-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentId ? { agentId } : { runAll: true }),
      });

      const data = await response.json();

      if (data.success) {
        const successCount = Array.isArray(data.results) 
          ? data.results.filter((r: any) => r.success).length 
          : 1;
        toast.success(`Auto-trading completed! ${successCount} successful trades`);
        fetchRecentTrades();
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast.error(data.error || 'Auto-trading failed');
      }
    } catch (error) {
      console.error('Error in auto-trading:', error);
      toast.error('Failed to execute auto-trading');
    } finally {
      setAutoTrading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Trading Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Execute manual trades or enable automated AI trading
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="terminal-crt-screen p-4">
          <div className="text-sm text-muted-foreground">Tradable Agents</div>
          <div className="text-2xl font-bold text-green-600">
            {tradableAgents.length}
          </div>
        </Card>
        <Card className="terminal-crt-screen p-4">
          <div className="text-sm text-muted-foreground">Total Balance</div>
          <div className="text-2xl font-bold">
            ${agents.reduce((sum, a) => sum + (a.realBalance || 0), 0).toFixed(2)}
          </div>
        </Card>
        <Card className="terminal-crt-screen p-4">
          <div className="text-sm text-muted-foreground">24h Trades</div>
          <div className="text-2xl font-bold">
            {recentTrades.length}
          </div>
        </Card>
        <Card className="terminal-crt-screen p-4">
          <div className="text-sm text-muted-foreground">Multi-Chain Wallets</div>
          <div className="text-2xl font-bold flex items-center gap-2">
            <span title="EVM Wallets">{agents.filter(a => a.walletAddress).length}💎</span>
            <span title="Solana Wallets">{agents.filter(a => a.solanaWalletAddress).length}✨</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {agents.filter(a => a.walletAddress || a.solanaWalletAddress).length}/{agents.length} agents
          </div>
        </Card>
      </div>

      {/* Trading Type Selector */}
      <div className="flex gap-2">
        <Button
          variant={tradeType === 'manual' ? 'default' : 'outline'}
          onClick={() => setTradeType('manual')}
          className="flex-1"
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Manual Trading
        </Button>
        <Button
          variant={tradeType === 'auto' ? 'default' : 'outline'}
          onClick={() => setTradeType('auto')}
          className="flex-1"
        >
          <Bot className="h-4 w-4 mr-2" />
          AI Auto-Trading
        </Button>
      </div>

      {/* Manual Trading Interface */}
      {tradeType === 'manual' && (
        <Card className="terminal-crt-screen p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Execute Manual Trade
          </h3>

          <div className="space-y-4">
            {/* Agent Selection */}
            <div>
              <Label>Select Agent</Label>
              <Select
                value={selectedAgent?.id || ''}
                onValueChange={(id) => setSelectedAgent(agents.find(a => a.id === id))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent to trade" />
                </SelectTrigger>
                <SelectContent>
                  {tradableAgents.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No agents with funded wallets
                    </SelectItem>
                  ) : (
                    tradableAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} (${agent.realBalance?.toFixed(2) || '0.00'})
                        {agent.walletAddress && ' 💎'}
                        {agent.solanaWalletAddress && ' ✨'}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Trading Pair */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Symbol</Label>
                <Select value={symbol} onValueChange={setSymbol}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {symbols.map((sym) => (
                      <SelectItem key={sym} value={sym}>
                        {sym}/USDT
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Action</Label>
                <Select value={action} onValueChange={(v: 'BUY' | 'SELL') => setAction(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUY">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Buy
                      </span>
                    </SelectItem>
                    <SelectItem value="SELL">
                      <span className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        Sell
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amount */}
            <div>
              <Label>Amount (USD)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter USD amount"
                min="1"
                step="1"
              />
              {selectedAgent && (
                <p className="text-xs text-muted-foreground mt-1">
                  Available: ${selectedAgent.realBalance?.toFixed(2) || '0.00'}
                </p>
              )}
            </div>

            {/* Execute Button */}
            <Button
              onClick={executeManualTrade}
              disabled={trading || !selectedAgent || tradableAgents.length === 0}
              className="w-full"
              size="lg"
            >
              {trading ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Executing Trade...
                </>
              ) : (
                <>
                  {action === 'BUY' ? (
                    <TrendingUp className="h-5 w-5 mr-2" />
                  ) : (
                    <TrendingDown className="h-5 w-5 mr-2" />
                  )}
                  Execute {action} Order
                </>
              )}
            </Button>

            {tradableAgents.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No agents have funded wallets. Please fund an agent wallet first.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      )}

      {/* Auto Trading Interface */}
      {tradeType === 'auto' && (
        <div className="space-y-4">
          {/* Auto Trade All */}
          <Card className="terminal-crt-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Bot className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold">AI-Powered Auto-Trading</h3>
                  <p className="text-sm text-muted-foreground">
                    Let AI agents analyze markets and execute trades automatically
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => executeAutoTrade()}
                  disabled={autoTrading || tradableAgents.length === 0}
                  size="lg"
                  className="w-full"
                >
                  {autoTrading ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Running Auto-Trade...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Run Auto-Trade for All Agents
                    </>
                  )}
                </Button>

                {selectedAgent && (
                  <Button
                    onClick={() => executeAutoTrade(selectedAgent.id)}
                    disabled={autoTrading}
                    size="lg"
                    variant="outline"
                    className="w-full"
                  >
                    {autoTrading ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        Run for {selectedAgent.name}
                      </>
                    )}
                  </Button>
                )}
              </div>

              <Alert className="bg-blue-100 dark:bg-blue-900 border-blue-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>How it works:</strong> Each AI agent will analyze market conditions,
                  evaluate opportunities, and execute trades based on their unique strategy and
                  personality. Trades are executed on Coinbase Exchange for real cryptocurrency trading.
                </AlertDescription>
              </Alert>
            </div>
          </Card>

          {/* Agent Grid for Individual Auto-Trading */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tradableAgents.map((agent) => (
              <Card
                key={agent.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedAgent?.id === agent.id
                    ? 'ring-2 ring-primary'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedAgent(agent)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
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
                    <h4 className="font-semibold truncate">{agent.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {agent.strategyType}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {agent.aiProvider}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Balance:</span>
                        <span className="font-semibold">
                          ${agent.realBalance?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Wallets:</span>
                        <span className="flex items-center gap-1">
                          {agent.walletAddress && <span title="EVM Wallet">💎</span>}
                          {agent.solanaWalletAddress && <span title="Solana Wallet">✨</span>}
                          {!agent.walletAddress && !agent.solanaWalletAddress && <span className="text-gray-400">None</span>}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trades:</span>
                        <span>{agent.totalTrades || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Win Rate:</span>
                        <span className={agent.winRate > 50 ? 'text-green-600' : ''}>
                          {(agent.winRate || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Trades */}
      <Card className="terminal-crt-screen p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Recent Real Trades
          </h3>
          <Button
            onClick={fetchRecentTrades}
            disabled={loadingTrades}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 ${loadingTrades ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {recentTrades.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No real trades executed yet
          </div>
        ) : (
          <div className="space-y-2">
            {recentTrades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-3 bg-muted rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={trade.side === 'BUY' ? 'default' : 'destructive'}
                    className="min-w-[50px] justify-center"
                  >
                    {trade.side}
                  </Badge>
                  <div>
                    <div className="font-medium">{trade.symbol}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(trade.entryTime).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    ${(trade.quantity * trade.entryPrice).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {trade.quantity.toFixed(4)} @ ${trade.entryPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
