
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Database, Shield, Wallet, DollarSign, Target, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { TreasuryDisplay } from './treasury-display';

interface PriceSource {
  name: string;
  price: number;
  timestamp: string;
  success: boolean;
  error?: string;
  latency?: number;
}

interface AggregatedPrice {
  symbol: string;
  price: number;
  median: number;
  mean: number;
  variance: number;
  sources: PriceSource[];
  timestamp: string;
  signature: string;
  confidence: number;
}

interface OracleStatus {
  isHealthy: boolean;
  totalSources: number;
  activeSources: number;
  lastUpdate: string;
  uptime: number;
  alerts: string[];
}

interface HistoricalDataPoint {
  symbol: string;
  price: number;
  timestamp: string;
  sources: number;
  variance: number;
}

interface EnhancedData {
  agents: any[];
  tradingStats: {
    total24h: number;
    profitable24h: number;
    winRate24h: number;
    totalPnL24h: number;
    totalAgentFunds: number;
  };
  asterDexStats: {
    totalTrades: number;
    totalPnL: number;
    activeAgents: number;
  };
  treasuryBalance: number;
  recentTrades: any[];
}

const WATCHED_SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'];

export default function OracleDashboard({ enhancedData }: { enhancedData?: EnhancedData }) {
  const [prices, setPrices] = useState<Record<string, AggregatedPrice>>({});
  const [status, setStatus] = useState<OracleStatus | null>(null);
  const [historical, setHistorical] = useState<Record<string, HistoricalDataPoint[]>>({});
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch prices
  const fetchPrices = async () => {
    try {
      const response = await fetch('/api/oracle/batch-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: WATCHED_SYMBOLS }),
      });

      if (response.ok) {
        const result = await response.json();
        const priceMap: Record<string, AggregatedPrice> = {};
        result.data.forEach((price: AggregatedPrice) => {
          priceMap[price.symbol] = price;
        });
        setPrices(priceMap);
      }
    } catch (error) {
      console.error('Failed to fetch prices:', error);
    }
  };

  // Fetch status
  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/oracle/status?symbols=${WATCHED_SYMBOLS.join(',')}`);

      if (response.ok) {
        const result = await response.json();
        setStatus(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  // Fetch historical data
  const fetchHistorical = async (symbol: string) => {
    try {
      const response = await fetch(`/api/oracle/historical/${symbol}?limit=50`);

      if (response.ok) {
        const result = await response.json();
        setHistorical(prev => ({ ...prev, [symbol]: result.data }));
      }
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPrices(),
        fetchStatus(),
        ...WATCHED_SYMBOLS.map(symbol => fetchHistorical(symbol)),
      ]);
      setLoading(false);
    };

    loadData();

    if (autoRefresh) {
      const interval = setInterval(loadData, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (loading) {
    return (
      <Card className="terminal-crt-screen">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading oracle data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedPrice = prices[selectedSymbol];
  const selectedHistory = historical[selectedSymbol] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Overview & Oracle Service</h2>
          <p className="text-muted-foreground">
            Live trading data, treasury status, and multi-source price aggregation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
          </Button>
          <Button size="sm" onClick={() => {
            fetchPrices();
            fetchStatus();
            WATCHED_SYMBOLS.forEach(fetchHistorical);
          }}>
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Comprehensive Trading Overview */}
      {enhancedData && (
        <>
          {/* Trading Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="terminal-crt-screen bg-gradient-to-br from-[#3385ff]/10 to-transparent border-[#3385ff]/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    24h Trades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#3385ff]">
                    {enhancedData.tradingStats.total24h}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {enhancedData.tradingStats.profitable24h} profitable
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="terminal-crt-screen bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Win Rate 24h
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-400">
                    {enhancedData.tradingStats.winRate24h.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Across all agents
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className={`bg-gradient-to-br border ${
                enhancedData.tradingStats.totalPnL24h >= 0
                  ? 'from-green-500/10 to-transparent border-green-500/20'
                  : 'from-red-500/10 to-transparent border-red-500/20'
              }`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    P&L 24h
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${
                    enhancedData.tradingStats.totalPnL24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    ${Math.abs(enhancedData.tradingStats.totalPnL24h).toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {enhancedData.tradingStats.totalPnL24h >= 0 ? 'Profit' : 'Loss'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="terminal-crt-screen bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Agent Funds
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-400">
                    ${enhancedData.tradingStats.totalAgentFunds.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {enhancedData.agents.length} active agents
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* AsterDEX Account & Treasury */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="terminal-crt-screen bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-400">
                  <Database className="h-5 w-5" />
                  AsterDEX Shared Account
                </CardTitle>
                <CardDescription>
                  Centralized perpetual futures trading ($204 shared balance)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">7-Day Trades:</span>
                  <span className="text-xl font-bold text-amber-400">
                    {enhancedData.asterDexStats.totalTrades}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Active Agents:</span>
                  <span className="text-xl font-bold text-amber-400">
                    {enhancedData.asterDexStats.activeAgents}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">7-Day P&L:</span>
                  <span className={`text-xl font-bold ${
                    enhancedData.asterDexStats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    ${enhancedData.asterDexStats.totalPnL.toFixed(2)}
                  </span>
                </div>
                <Badge variant="outline" className="w-full justify-center border-amber-500/40 text-amber-300">
                  All agents share this account via API
                </Badge>
              </CardContent>
            </Card>

            <div>
              <TreasuryDisplay />
            </div>
          </div>

          {/* Agent Wallet Overview */}
          <Card className="terminal-crt-screen">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Active Agents & Wallet Status
              </CardTitle>
              <CardDescription>
                Individual agent wallets for on-chain trading (Avantis, UniSwap, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {enhancedData.agents.slice(0, 8).map((agent, idx) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 rounded-2xl border border-[#3385ff]/20 bg-gradient-to-br from-[#3385ff]/5 to-transparent"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#3385ff] truncate">
                        {agent.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {agent.aiProvider}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Balance:</span>
                        <span className="text-white font-bold">
                          ${(agent.realBalance || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Win Rate:</span>
                        <span className="text-blue-400">
                          {(agent.winRate || 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Total P&L:</span>
                        <span className={agent.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}>
                          ${Math.abs(agent.totalProfitLoss || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {enhancedData.agents.length > 8 && (
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Showing 8 of {enhancedData.agents.length} active agents
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Trades */}
          {enhancedData.recentTrades && enhancedData.recentTrades.length > 0 && (
            <Card className="terminal-crt-screen">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Trades (Last 24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {enhancedData.recentTrades.map((trade, idx) => (
                    <motion.div
                      key={trade.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-gray-800/50 to-transparent border border-gray-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={trade.side === 'BUY' ? 'default' : 'secondary'}>
                          {trade.side}
                        </Badge>
                        <div>
                          <div className="font-semibold text-sm">{trade.symbol}</div>
                          <div className="text-xs text-gray-400">{trade.agent.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${
                          trade.profitLoss && trade.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {trade.profitLoss ? `$${trade.profitLoss.toFixed(2)}` : 'Open'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {trade.chain === 'astar-zkevm' ? 'AsterDEX' : (trade.chain || 'On-chain')}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Divider */}
      <div className="border-t border-gray-700 my-8"></div>

      <div className="mb-4">
        <h3 className="text-2xl font-bold">Oracle Price Feeds</h3>
        <p className="text-muted-foreground text-sm">
          Multi-source price aggregation with cryptographic signing
        </p>
      </div>

      {/* Status Card */}
      {status && (
        <Card className="terminal-crt-screen">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {status.isHealthy ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Oracle Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Health</p>
                <Badge variant={status.isHealthy ? 'default' : 'destructive'}>
                  {status.isHealthy ? 'Healthy' : 'Degraded'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Sources</p>
                <p className="text-2xl font-bold">
                  {status.activeSources}/{status.totalSources}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">
                  {Math.floor(status.uptime / 3600)}h
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alerts</p>
                <p className="text-2xl font-bold text-red-500">
                  {status.alerts.length}
                </p>
              </div>
            </div>
            {status.alerts.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Active Alerts:</p>
                {status.alerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mt-0.5 text-red-500" />
                    {alert}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Price Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {WATCHED_SYMBOLS.map(symbol => {
          const price = prices[symbol];
          if (!price) return null;

          return (
            <Card
              key={symbol}
              className={`cursor-pointer transition-colors ${
                selectedSymbol === symbol ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedSymbol(symbol)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{symbol}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">{formatPrice(price.price)}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={price.confidence > 0.8 ? 'default' : 'secondary'}>
                      {(price.confidence * 100).toFixed(0)}% Confidence
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Variance: {price.variance.toFixed(2)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Sources: {price.sources.filter(s => s.success).length}/{price.sources.length}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed View */}
      {selectedPrice && (
        <Card className="terminal-crt-screen">
          <CardHeader>
            <CardTitle>{selectedSymbol} Detailed Analysis</CardTitle>
            <CardDescription>
              Multi-source aggregation with cryptographic verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sources">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sources">
                  <Database className="h-4 w-4 mr-2" />
                  Data Sources
                </TabsTrigger>
                <TabsTrigger value="chart">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Historical Chart
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sources" className="space-y-4">
                {/* Aggregation Stats */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-2xl">
                  <div>
                    <p className="text-sm text-muted-foreground">Median Price</p>
                    <p className="text-xl font-bold">{formatPrice(selectedPrice.median)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mean Price</p>
                    <p className="text-xl font-bold">{formatPrice(selectedPrice.mean)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Variance</p>
                    <p className="text-xl font-bold">{selectedPrice.variance.toFixed(2)}%</p>
                  </div>
                </div>

                {/* Source Details */}
                <div className="space-y-2">
                  {selectedPrice.sources.map((source, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-4 rounded-2xl border ${
                        source.success ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {source.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">{source.name}</p>
                          {source.success ? (
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(source.price)} • {source.latency}ms
                            </p>
                          ) : (
                            <p className="text-sm text-red-500">{source.error}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant={source.success ? 'default' : 'destructive'}>
                        {source.success ? 'Active' : 'Failed'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="chart">
                {selectedHistory.length > 0 ? (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="timestamp"
                          tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                        />
                        <YAxis tickFormatter={(value) => `$${value.toFixed(2)}`} />
                        <Tooltip
                          formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
                          labelFormatter={(label) => new Date(label).toLocaleString()}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="#0047b3"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[400px]">
                    <p className="text-muted-foreground">No historical data available</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <div className="p-4 bg-muted rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    <p className="font-medium">Cryptographic Signature</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Signature (HMAC-SHA256)</p>
                    <code className="block p-2 bg-background rounded text-xs break-all">
                      {selectedPrice.signature}
                    </code>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Timestamp</p>
                    <p className="text-sm font-mono">
                      {new Date(selectedPrice.timestamp).toISOString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Data String</p>
                    <code className="block p-2 bg-background rounded text-xs">
                      {selectedSymbol}:{selectedPrice.median}:{selectedPrice.timestamp}
                    </code>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      This data is cryptographically signed using HMAC-SHA256. Any tampering with the price,
                      timestamp, or symbol will invalidate the signature.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
