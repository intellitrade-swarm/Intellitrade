'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap,
  Database,
  BarChart3,
  RefreshCw,
  Search,
  Layers,
  Brain,
  TrendingDown,
  DollarSign,
  Droplets,
} from 'lucide-react';

interface OracleStats {
  totalRequests: number;
  pending: number;
  processing: number;
  fulfilled: number;
  failed: number;
  averageProcessingTime: number;
  requestsByType: Record<string, number>;
}

interface MarketDataResult {
  symbol: string;
  chain: string;
  price?: number;
  volume24h?: number;
  liquidity?: number;
  priceChange?: any;
  error?: string;
}

interface AIAnalysisResult {
  analysis: string;
  provider: string;
  confidence: number;
}

interface TradingSignal {
  symbol: string;
  signal: string;
  confidence: number;
  marketData: any;
  aiReasoning: string;
}

export function Oracle() {
  const [stats, setStats] = useState<OracleStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Market Data Query State
  const [marketSymbol, setMarketSymbol] = useState('SOL');
  const [marketChain, setMarketChain] = useState('solana');
  const [marketDataType, setMarketDataType] = useState('price');
  const [marketResult, setMarketResult] = useState<MarketDataResult | null>(null);
  const [isQueryingMarket, setIsQueryingMarket] = useState(false);

  // AI Analysis State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiModel, setAiModel] = useState('grok');
  const [aiResult, setAIResult] = useState<AIAnalysisResult | null>(null);
  const [isQueryingAI, setIsQueryingAI] = useState(false);

  // Trading Signals State
  const [signalsSymbol, setSignalsSymbol] = useState('SOL,ETH,BTC');
  const [signalsResult, setSignalsResult] = useState<TradingSignal[]>([]);
  const [isQueryingSignals, setIsQueryingSignals] = useState(false);

  const fetchStats = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const response = await fetch('/api/oracle/stats');
      if (!response.ok) throw new Error('Failed to fetch oracle stats');
      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching oracle stats:', err);
      setError(err.message || 'Failed to load oracle stats');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const queryMarketData = async () => {
    if (!marketSymbol) return;
    
    setIsQueryingMarket(true);
    setMarketResult(null);
    
    try {
      const response = await fetch('/api/oracle/market-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: marketSymbol,
          chain: marketChain,
          dataType: marketDataType,
          timeframe: '15m',
        }),
      });

      if (!response.ok) throw new Error('Market data request failed');
      
      const data = await response.json();
      setMarketResult(data.result);
    } catch (err: any) {
      setMarketResult({ 
        symbol: marketSymbol, 
        chain: marketChain, 
        error: err.message 
      });
    } finally {
      setIsQueryingMarket(false);
    }
  };

  const queryAIAnalysis = async () => {
    if (!aiPrompt) return;
    
    setIsQueryingAI(true);
    setAIResult(null);
    
    try {
      const response = await fetch('/api/oracle/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          context: {},
          modelType: aiModel,
          maxTokens: 500,
        }),
      });

      if (!response.ok) throw new Error('AI analysis request failed');
      
      const data = await response.json();
      setAIResult(data.result);
    } catch (err: any) {
      setAIResult({
        analysis: `Error: ${err.message}`,
        provider: aiModel,
        confidence: 0,
      });
    } finally {
      setIsQueryingAI(false);
    }
  };

  const queryTradingSignals = async () => {
    if (!signalsSymbol) return;
    
    setIsQueryingSignals(true);
    setSignalsResult([]);
    
    try {
      const symbols = signalsSymbol.split(',').map(s => s.trim());
      
      // For demo, use a mock agent ID
      const response = await fetch('/api/oracle/trading-signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'oracle-demo',
          symbols,
        }),
      });

      if (!response.ok) throw new Error('Trading signals request failed');
      
      const data = await response.json();
      setSignalsResult(data.signals || []);
    } catch (err: any) {
      console.error('Trading signals error:', err);
    } finally {
      setIsQueryingSignals(false);
    }
  };

  const calculateSuccessRate = () => {
    if (!stats) return 0;
    const total = stats.totalRequests;
    if (total === 0) return 0;
    return Math.round((stats.fulfilled / total) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-gray-400">Loading Full-Scale Oracle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Intellitrade Oracle</h1>
          <p className="text-gray-400">Full-Scale Work Oracle • Real-Time Market Intelligence for AI Agents</p>
        </div>
        <Button
          onClick={fetchStats}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="border-blue-500/30 hover:bg-blue-500/10"
        >
          {isRefreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      {error && (
        <Alert className="bg-red-500/10 border-red-500/30">
          <XCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="terminal-crt-screen bg-gray-900/50 border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalRequests}</div>
              <div className="flex items-center mt-2 text-xs">
                <Database className="h-3 w-3 text-blue-400 mr-1" />
                <span className="text-gray-400">All-time</span>
              </div>
            </CardContent>
          </Card>

          <Card className="terminal-crt-screen bg-gray-900/50 border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{calculateSuccessRate()}%</div>
              <Progress value={calculateSuccessRate()} className="mt-2 h-2 bg-gray-800" />
            </CardContent>
          </Card>

          <Card className="terminal-crt-screen bg-gray-900/50 border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Avg Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.averageProcessingTime}ms</div>
              <div className="flex items-center mt-2 text-xs">
                <Zap className="h-3 w-3 text-blue-300 mr-1" />
                <span className="text-gray-400">Lightning fast</span>
              </div>
            </CardContent>
          </Card>

          <Card className="terminal-crt-screen bg-gray-900/50 border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Active Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {(stats.pending || 0) + (stats.processing || 0)}
              </div>
              <div className="flex items-center mt-2 text-xs">
                <Activity className="h-3 w-3 text-blue-400 mr-1 animate-pulse" />
                <span className="text-gray-400">In progress</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Oracle Tabs */}
      <Tabs defaultValue="market" className="space-y-4">
        <TabsList className="bg-gray-900/50 border border-blue-500/30">
          <TabsTrigger value="market" className="data-[state=active]:bg-blue-500/20">
            <DollarSign className="h-4 w-4 mr-2" />
            Market Data
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-blue-500/20">
            <Brain className="h-4 w-4 mr-2" />
            AI Analysis
          </TabsTrigger>
          <TabsTrigger value="signals" className="data-[state=active]:bg-blue-500/20">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trading Signals
          </TabsTrigger>
          <TabsTrigger value="liquidity" className="data-[state=active]:bg-blue-500/20">
            <Droplets className="h-4 w-4 mr-2" />
            Cross-Chain
          </TabsTrigger>
        </TabsList>

        {/* Market Data Tab */}
        <TabsContent value="market">
          <Card className="terminal-crt-screen bg-gray-900/50 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white">Market Data Query</CardTitle>
              <CardDescription>
                Real-time price, volume, liquidity, and technical data from multiple sources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Token Symbol</label>
                  <Input
                    placeholder="e.g., SOL, ETH, BTC"
                    value={marketSymbol}
                    onChange={(e) => setMarketSymbol(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Chain</label>
                  <Select value={marketChain} onValueChange={setMarketChain}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solana">Solana</SelectItem>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="base">Base</SelectItem>
                      <SelectItem value="polygon">Polygon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Data Type</label>
                  <Select value={marketDataType} onValueChange={setMarketDataType}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="volume">Volume</SelectItem>
                      <SelectItem value="liquidity">Liquidity</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="sentiment">Sentiment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={queryMarketData}
                disabled={isQueryingMarket || !marketSymbol}
                className="w-full bg-blue-600 hover:bg-blue-500"
              >
                {isQueryingMarket ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Querying Oracle...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Query Market Data
                  </>
                )}
              </Button>

              {marketResult && (
                <Card className="terminal-crt-screen bg-gray-800/50 border-gray-700 mt-4">
                  <CardContent className="pt-6">
                    {marketResult.error ? (
                      <Alert className="bg-red-500/10 border-red-500/30">
                        <XCircle className="h-4 w-4 text-red-400" />
                        <AlertDescription className="text-red-400">
                          {marketResult.error}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Symbol</span>
                          <span className="text-white font-bold">{marketResult.symbol}</span>
                        </div>
                        {marketResult.price !== undefined && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Price</span>
                            <span className="text-blue-400 font-bold">
                              ${marketResult.price.toFixed(6)}
                            </span>
                          </div>
                        )}
                        {marketResult.volume24h !== undefined && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">24h Volume</span>
                            <span className="text-white">
                              ${marketResult.volume24h.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {marketResult.liquidity !== undefined && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Liquidity</span>
                            <span className="text-white">
                              ${marketResult.liquidity.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <pre className="text-xs text-gray-400 bg-gray-900 p-3 rounded mt-4 overflow-x-auto">
                          {JSON.stringify(marketResult, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="ai">
          <Card className="terminal-crt-screen bg-gray-900/50 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white">AI-Powered Analysis</CardTitle>
              <CardDescription>
                Get insights from Grok, NVIDIA, OpenAI, or Gemini AI models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Analysis Prompt</label>
                <Input
                  placeholder="e.g., What's the market outlook for SOL today?"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">AI Model</label>
                <Select value={aiModel} onValueChange={setAiModel}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grok">Grok (X AI)</SelectItem>
                    <SelectItem value="nvidia">NVIDIA AI</SelectItem>
                    <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={queryAIAnalysis}
                disabled={isQueryingAI || !aiPrompt}
                className="w-full bg-blue-600 hover:bg-blue-500"
              >
                {isQueryingAI ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Run AI Analysis
                  </>
                )}
              </Button>

              {aiResult && (
                <Card className="terminal-crt-screen bg-gray-800/50 border-gray-700 mt-4">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-500/20 text-blue-400">
                        {aiResult.provider}
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-400">
                        Confidence: {(aiResult.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="text-white whitespace-pre-wrap">
                      {aiResult.analysis}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trading Signals Tab */}
        <TabsContent value="signals">
          <Card className="terminal-crt-screen bg-gray-900/50 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white">Comprehensive Trading Signals</CardTitle>
              <CardDescription>
                AI-powered buy/sell recommendations with market data and reasoning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Token Symbols (comma-separated)
                </label>
                <Input
                  placeholder="e.g., SOL, ETH, BTC"
                  value={signalsSymbol}
                  onChange={(e) => setSignalsSymbol(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <Button 
                onClick={queryTradingSignals}
                disabled={isQueryingSignals || !signalsSymbol}
                className="w-full bg-blue-600 hover:bg-blue-500"
              >
                {isQueryingSignals ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Signals...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Get Trading Signals
                  </>
                )}
              </Button>

              {signalsResult.length > 0 && (
                <div className="space-y-3 mt-4">
                  {signalsResult.map((signal, index) => (
                    <Card key={index} className="bg-gray-800/50 border-gray-700">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-white">
                              {signal.symbol}
                            </span>
                            <Badge
                              className={
                                signal.signal.includes('BUY')
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : signal.signal.includes('SELL')
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }
                            >
                              {signal.signal}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400">Confidence</div>
                            <div className="text-lg font-bold text-white">
                              {(signal.confidence * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>

                        {signal.marketData && (
                          <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                            {signal.marketData.price && (
                              <div>
                                <span className="text-gray-400">Price: </span>
                                <span className="text-white">
                                  ${signal.marketData.price.toFixed(6)}
                                </span>
                              </div>
                            )}
                            {signal.marketData.priceChange24h !== undefined && (
                              <div>
                                <span className="text-gray-400">24h: </span>
                                <span
                                  className={
                                    signal.marketData.priceChange24h > 0
                                      ? 'text-blue-400'
                                      : 'text-red-400'
                                  }
                                >
                                  {signal.marketData.priceChange24h > 0 ? '+' : ''}
                                  {signal.marketData.priceChange24h.toFixed(2)}%
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="text-sm text-gray-300 bg-gray-900 p-3 rounded">
                          {signal.aiReasoning}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cross-Chain Liquidity Tab */}
        <TabsContent value="liquidity">
          <Card className="terminal-crt-screen bg-gray-900/50 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white">Cross-Chain Liquidity</CardTitle>
              <CardDescription>
                Coming soon: Aggregate liquidity data across Solana, Ethereum, Base, and Polygon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="bg-blue-500/10 border-blue-500/30">
                <Layers className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-400">
                  This feature is under development. It will provide comprehensive liquidity
                  analysis across multiple blockchain networks.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
