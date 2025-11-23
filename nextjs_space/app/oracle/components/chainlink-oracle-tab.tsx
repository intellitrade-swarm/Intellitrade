
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, Server, Activity, CheckCircle, XCircle, Clock, Database, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function ChainlinkOracleTab() {
  const [activeSection, setActiveSection] = useState<'overview' | 'price' | 'ai' | 'liquidity' | 'requests'>('overview');
  
  // Price feed state
  const [priceSymbol, setPriceSymbol] = useState('');
  const [priceData, setPriceData] = useState<any>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  
  // AI analysis state
  const [aiSymbol, setAiSymbol] = useState('');
  const [aiData, setAiData] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  
  // Liquidity state
  const [liquidityProtocol, setLiquidityProtocol] = useState('');
  const [liquidityData, setLiquidityData] = useState<any>(null);
  const [liquidityLoading, setLiquidityLoading] = useState(false);
  
  // Active requests
  const [requests, setRequests] = useState<any[]>([]);
  const [adapters, setAdapters] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  // Fetch price feed
  const fetchPriceFeed = async () => {
    if (!priceSymbol.trim()) return;
    
    setPriceLoading(true);
    try {
      const response = await fetch('/api/oracle/chainlink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_price_feed',
          symbol: priceSymbol.toUpperCase(),
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        setPriceData(result.data);
      }
    } catch (error) {
      console.error('Price feed error:', error);
    } finally {
      setPriceLoading(false);
    }
  };
  
  // Fetch AI analysis
  const fetchAIAnalysis = async () => {
    if (!aiSymbol.trim()) return;
    
    setAiLoading(true);
    try {
      // First get price data
      const priceResponse = await fetch('/api/oracle/chainlink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_price_feed',
          symbol: aiSymbol.toUpperCase(),
        }),
      });
      
      const priceResult = await priceResponse.json();
      
      if (priceResult.success) {
        // Then get AI analysis
        const aiResponse = await fetch('/api/oracle/chainlink', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'request_ai_analysis',
            symbol: aiSymbol.toUpperCase(),
            marketData: priceResult.data,
          }),
        });
        
        const aiResult = await aiResponse.json();
        if (aiResult.success) {
          setAiData(aiResult.data);
        }
      }
    } catch (error) {
      console.error('AI analysis error:', error);
    } finally {
      setAiLoading(false);
    }
  };
  
  // Fetch liquidity data
  const fetchLiquidityData = async () => {
    if (!liquidityProtocol.trim()) return;
    
    setLiquidityLoading(true);
    try {
      const response = await fetch('/api/oracle/chainlink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_liquidity',
          protocol: liquidityProtocol.toLowerCase(),
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        setLiquidityData(result.data);
      }
    } catch (error) {
      console.error('Liquidity data error:', error);
    } finally {
      setLiquidityLoading(false);
    }
  };
  
  // Load adapters and jobs
  const loadSystemInfo = async () => {
    try {
      const [adaptersRes, jobsRes, requestsRes] = await Promise.all([
        fetch('/api/oracle/chainlink?action=list_adapters'),
        fetch('/api/oracle/chainlink?action=list_jobs'),
        fetch('/api/oracle/chainlink?action=list_requests'),
      ]);
      
      const adaptersData = await adaptersRes.json();
      const jobsData = await jobsRes.json();
      const requestsData = await requestsRes.json();
      
      if (adaptersData.success) setAdapters(adaptersData.adapters);
      if (jobsData.success) setJobs(jobsData.jobs);
      if (requestsData.success) setRequests(requestsData.requests);
    } catch (error) {
      console.error('Failed to load system info:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Link className="h-8 w-8 text-blue-400" />
            Professional Oracle
          </h2>
          <p className="text-muted-foreground mt-2">
            Multi-source data aggregation with consensus verification
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
          <Activity className="h-3 w-3 mr-1" />
          ACTIVE
        </Badge>
      </motion.div>

      {/* Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: Database },
          { id: 'price', label: 'Price Feed', icon: TrendingUp },
          { id: 'ai', label: 'AI Analysis', icon: Zap },
          { id: 'liquidity', label: 'Liquidity', icon: Activity },
          { id: 'requests', label: 'Requests', icon: Clock },
        ].map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setActiveSection(section.id as any);
              if (section.id === 'requests') loadSystemInfo();
            }}
            className="flex items-center gap-2"
          >
            <section.icon className="h-4 w-4" />
            {section.label}
          </Button>
        ))}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-400" />
                  External Adapters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">5</div>
                <p className="text-xs text-muted-foreground mt-1">Active data sources</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-400" />
                  Job Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">3</div>
                <p className="text-xs text-muted-foreground mt-1">Automated jobs</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                  Consensus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">Multi-Source</div>
                <p className="text-xs text-muted-foreground mt-1">Data verification</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Oracle Features
              </CardTitle>
              <CardDescription>Professional-grade blockchain oracle capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/50">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <div className="font-medium">Multi-Source Price Feeds</div>
                    <div className="text-sm text-muted-foreground">
                      Aggregates prices from DexScreener, CoinGecko with median consensus
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/50">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <div className="font-medium">AI Provider Consensus</div>
                    <div className="text-sm text-muted-foreground">
                      Combines NVIDIA, Grok AI for reliable trading signals
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/50">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <div className="font-medium">Cross-Chain Liquidity</div>
                    <div className="text-sm text-muted-foreground">
                      Monitors TVL and liquidity across multiple protocols
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/50">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <div className="font-medium">Request/Response Cycle</div>
                    <div className="text-sm text-muted-foreground">
                      Async processing with timeout and retry logic
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Price Feed Section */}
      {activeSection === 'price' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Multi-Source Price Feed
              </CardTitle>
              <CardDescription>Get consensus price from multiple DEXs and oracles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="price-symbol">Token Symbol</Label>
                  <Input
                    id="price-symbol"
                    placeholder="Enter symbol (e.g., ETH, BTC, SOL)"
                    value={priceSymbol}
                    onChange={(e) => setPriceSymbol(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchPriceFeed()}
                  />
                </div>
                <Button
                  onClick={fetchPriceFeed}
                  disabled={priceLoading || !priceSymbol.trim()}
                  className="mt-auto"
                >
                  {priceLoading ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 terminal-pulse" />
                      Fetching...
                    </>
                  ) : (
                    'Get Price'
                  )}
                </Button>
              </div>

              {priceData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/10 border border-blue-500/20"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Consensus Price</div>
                      <div className="text-2xl font-bold text-blue-400">
                        ${priceData.price?.toFixed(2) || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">24h Volume</div>
                      <div className="text-xl font-semibold">
                        ${((priceData.volume24h || 0) / 1000000).toFixed(2)}M
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">24h Change</div>
                      <div className={`text-xl font-semibold ${(priceData.priceChange24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(priceData.priceChange24h || 0) >= 0 ? '+' : ''}{priceData.priceChange24h?.toFixed(2) || '0'}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Data Sources</div>
                      <div className="text-xl font-semibold text-blue-400">
                        {priceData.sources || 0}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400">
                      {priceData.consensus || 'median'} consensus
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(priceData.timestamp).toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI Analysis Section */}
      {activeSection === 'ai' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Multi-AI Consensus Analysis
              </CardTitle>
              <CardDescription>Get trading signals from multiple AI providers with consensus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="ai-symbol">Token Symbol</Label>
                  <Input
                    id="ai-symbol"
                    placeholder="Enter symbol (e.g., ETH, BTC, SOL)"
                    value={aiSymbol}
                    onChange={(e) => setAiSymbol(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchAIAnalysis()}
                  />
                </div>
                <Button
                  onClick={fetchAIAnalysis}
                  disabled={aiLoading || !aiSymbol.trim()}
                  className="mt-auto"
                >
                  {aiLoading ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 terminal-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze'
                  )}
                </Button>
              </div>

              {aiData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/10 border border-blue-500/20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Consensus Sentiment</div>
                        <Badge
                          className={`text-lg mt-1 ${
                            aiData.sentiment === 'BULLISH'
                              ? 'bg-green-500/20 text-green-400'
                              : aiData.sentiment === 'BEARISH'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-blue-400/20 text-blue-300'
                          }`}
                        >
                          {aiData.sentiment}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Confidence</div>
                        <div className="text-2xl font-bold text-blue-400">
                          {aiData.confidence?.toFixed(0) || '0'}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Recommendation</div>
                        <Badge
                          variant="outline"
                          className={`text-lg mt-1 ${
                            aiData.recommendation === 'BUY'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : aiData.recommendation === 'SELL'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-blue-400/10 text-blue-300 border-blue-400/20'
                          }`}
                        >
                          {aiData.recommendation}
                        </Badge>
                      </div>
                    </div>

                    {aiData.breakdown && (
                      <div className="pt-3 border-t border-border/50">
                        <div className="text-sm text-muted-foreground mb-2">AI Provider Breakdown</div>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-sm">Bullish: {aiData.breakdown.bullish}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-400" />
                            <span className="text-sm">Bearish: {aiData.breakdown.bearish}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-blue-300" />
                            <span className="text-sm">Neutral: {aiData.breakdown.neutral}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground flex justify-between items-center">
                    <span>{aiData.aiProviders || 0} AI providers analyzed</span>
                    <span>{new Date(aiData.timestamp).toLocaleString()}</span>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Liquidity Section */}
      {activeSection === 'liquidity' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Cross-Chain Liquidity Monitor
              </CardTitle>
              <CardDescription>Monitor protocol TVL and liquidity across chains</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="liquidity-protocol">Protocol Name</Label>
                  <Input
                    id="liquidity-protocol"
                    placeholder="Enter protocol (e.g., uniswap, aave, curve)"
                    value={liquidityProtocol}
                    onChange={(e) => setLiquidityProtocol(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchLiquidityData()}
                  />
                </div>
                <Button
                  onClick={fetchLiquidityData}
                  disabled={liquidityLoading || !liquidityProtocol.trim()}
                  className="mt-auto"
                >
                  {liquidityLoading ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 terminal-pulse" />
                      Fetching...
                    </>
                  ) : (
                    'Get Data'
                  )}
                </Button>
              </div>

              {liquidityData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Total TVL</div>
                      <div className="text-2xl font-bold text-green-400">
                        ${((liquidityData.totalTvl || 0) / 1000000000).toFixed(2)}B
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">24h Change</div>
                      <div className={`text-xl font-semibold ${(liquidityData.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(liquidityData.change24h || 0) >= 0 ? '+' : ''}{liquidityData.change24h?.toFixed(2) || '0'}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Data Sources</div>
                      <div className="text-xl font-semibold text-blue-400">
                        {liquidityData.sources || 0}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                    {new Date(liquidityData.timestamp).toLocaleString()}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Requests Section */}
      {activeSection === 'requests' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Server className="h-4 w-4" />
                  External Adapters ({adapters.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {adapters.map((adapter) => (
                    <div
                      key={adapter.id}
                      className="p-2 rounded-2xl bg-muted/50 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-sm">{adapter.name}</div>
                        <div className="text-xs text-muted-foreground">{adapter.type}</div>
                      </div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4" />
                  Job Specifications ({jobs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-2 rounded-2xl bg-muted/50"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-sm">{job.name}</div>
                        {job.enabled ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-400">
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-500/10 text-gray-400">
                            Disabled
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{job.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Active Requests ({requests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active requests
                </div>
              ) : (
                <div className="space-y-2">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="p-3 rounded-2xl bg-muted/50 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-sm">{request.id}</div>
                        <div className="text-xs text-muted-foreground">
                          {request.jobId} • {new Date(request.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          request.status === 'fulfilled'
                            ? 'bg-green-500/10 text-green-400'
                            : request.status === 'failed'
                            ? 'bg-red-500/10 text-red-400'
                            : request.status === 'processing'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-blue-400/10 text-blue-300'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
