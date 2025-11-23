
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Database, Shield, Wallet, DollarSign, Target, Building2, Zap, Link, Server, Globe, PlayCircle, StopCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ChainlinkOracleTab } from './chainlink-oracle-tab';
import NeuralNetworkGraph from './neural-network-graph';
import { OracleLoadingSwarm } from './oracle-loading-swarm';

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
  lastUpdate?: string;
}

interface BlockchainOracleStatus {
  isRunning: boolean;
  network: string;
  latestBlock: number;
  requestsListened: number;
  requestsFulfilled: number;
  averageLatency: number;
  uptime: number;
  errors: string[];
  balance: string;
  balanceETH: string;
  lastUpdate: string;
}

const WATCHED_SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'];

interface CrossChainLiquidity {
  chain: string;
  token: string;
  totalLiquidity: number;
  pairs: number;
  topPairs?: Array<{
    dex: string;
    pairAddress: string;
    liquidity: number;
    volume24h: number;
  }>;
}

export default function EnhancedOracleDashboard({ enhancedData: initialData }: { enhancedData?: EnhancedData }) {
  const [blockchainStatus, setBlockchainStatus] = useState<BlockchainOracleStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [startingNode, setStartingNode] = useState(false);
  
  // Enhanced data state (for auto-refresh)
  const [enhancedData, setEnhancedData] = useState<EnhancedData | undefined>(initialData);
  const [dataLoading, setDataLoading] = useState(false);
  
  // Cross-Chain Liquidity state
  const [liquidityToken, setLiquidityToken] = useState('');
  const [liquidityChains, setLiquidityChains] = useState<string[]>(['solana', 'ethereum', 'base']);
  const [liquidityData, setLiquidityData] = useState<CrossChainLiquidity[]>([]);
  const [liquidityLoading, setLiquidityLoading] = useState(false);

  // Oracle Features tab state
  const [activeOracleFeature, setActiveOracleFeature] = useState<string>('chainlink');

  // Fetch enhanced data (trading stats, agents, etc.)
  const fetchEnhancedData = async () => {
    try {
      setDataLoading(true);
      const response = await fetch('/api/oracle/data');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setEnhancedData(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch enhanced data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // Fetch blockchain oracle status
  const fetchBlockchainStatus = async () => {
    try {
      const response = await fetch('/api/oracle/blockchain/status');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setBlockchainStatus(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch blockchain oracle status:', error);
    }
  };

  // Start blockchain oracle node
  const startOracleNode = async (network: string = 'astar-zkevm') => {
    setStartingNode(true);
    try {
      const response = await fetch('/api/oracle/blockchain/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ network }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setBlockchainStatus(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to start oracle node:', error);
    } finally {
      setStartingNode(false);
    }
  };

  // Fetch Cross-Chain Liquidity
  const fetchCrossChainLiquidity = async () => {
    if (!liquidityToken.trim() || liquidityChains.length === 0) return;
    
    setLiquidityLoading(true);
    try {
      const response = await fetch('/api/oracle/cross-chain-liquidity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: liquidityToken,
          chains: liquidityChains,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setLiquidityData(result.liquidity?.byChain || []);
      }
    } catch (error) {
      console.error('Failed to fetch cross-chain liquidity:', error);
    } finally {
      setLiquidityLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchBlockchainStatus(),
        fetchEnhancedData()
      ]);
      setLoading(false);
    };

    loadData();

    if (autoRefresh) {
      const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Loading Swarm Animation */}
      <OracleLoadingSwarm 
        isLoading={loading || dataLoading} 
        message={loading ? 'INITIALIZING ORACLE NETWORK...' : 'SYNCHRONIZING DATA FEEDS...'}
      />
      
      {/* Terminal Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-2 border-terminal-green-dark bg-terminal-darker/50 p-3 sm:p-4 shadow-[0_0_20px_rgba(0,102,255,0.2)]">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-terminal-green animate-terminal-glow font-terminal tracking-wider break-words">
            &gt; PREMIERE_ORACLE
          </h1>
          <p className="text-terminal-green-dim mt-2 font-terminal text-xs sm:text-sm break-words">
            BLOCKCHAIN_ORACLE // AI_INSIGHTS // DATA_FEEDS
          </p>
          {enhancedData?.lastUpdate && (
            <p className="text-xs text-terminal-green-dim mt-1 font-terminal truncate">
              UPDATE: {new Date(enhancedData.lastUpdate).toLocaleTimeString()}
              {dataLoading && <span className="ml-2 text-terminal-green animate-blink">█</span>}
            </p>
          )}
        </div>
        <div className="flex gap-2 self-end sm:self-start">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`font-terminal text-xs whitespace-nowrap ${autoRefresh ? 'bg-terminal-green text-terminal-black border-2 border-terminal-green' : 'bg-terminal-black text-terminal-green border-2 border-terminal-green-darker'} hover:shadow-[0_0_15px_rgba(0,102,255,0.5)] transition-all`}
          >
            <Activity className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${dataLoading ? 'terminal-pulse' : ''}`} />
            <span className="hidden sm:inline">{autoRefresh ? 'AUTO ON' : 'AUTO OFF'}</span>
            <span className="sm:hidden">{autoRefresh ? 'ON' : 'OFF'}</span>
          </Button>
        </div>
      </div>

      {/* Neural Network Graph */}
      <NeuralNetworkGraph />

      {/* Blockchain Oracle Status */}
      <Card className="border-2 border-terminal-green-dark bg-terminal-darker/80 shadow-[0_0_25px_rgba(0,102,255,0.2)]">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-terminal-green font-terminal tracking-wide">
                <Link className="h-5 w-5 text-terminal-green" />
                &gt; BLOCKCHAIN_ORACLE_NODE
              </CardTitle>
              <CardDescription className="text-terminal-green-dim font-terminal text-xs">
                PROFESSIONAL-GRADE_ORACLE // BRIDGING_OFF-CHAIN_DATA // SMART_CONTRACTS
              </CardDescription>
            </div>
            {blockchainStatus ? (
              <Badge variant={blockchainStatus.isRunning ? 'default' : 'secondary'} className="gap-2">
                {blockchainStatus.isRunning ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    Running
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    Stopped
                  </>
                )}
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-2">
                <AlertCircle className="h-3 w-3" />
                Not Initialized
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {blockchainStatus ? (
            <div className="space-y-6">
              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 sm:p-4 rounded-2xl bg-background/50 border border-green-500/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-green-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground">Network</span>
                  </div>
                  <p className="text-base sm:text-lg font-semibold truncate">{blockchainStatus.network}</p>
                  <p className="text-xs text-muted-foreground truncate">Block #{blockchainStatus.latestBlock.toLocaleString()}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-3 sm:p-4 rounded-2xl bg-background/50 border border-blue-500/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground">Requests</span>
                  </div>
                  <p className="text-base sm:text-lg font-semibold">{blockchainStatus.requestsListened}</p>
                  <p className="text-xs text-muted-foreground">Listened</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-3 sm:p-4 rounded-2xl bg-background/50 border border-blue-500/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground">Fulfilled</span>
                  </div>
                  <p className="text-base sm:text-lg font-semibold">{blockchainStatus.requestsFulfilled}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {blockchainStatus.requestsListened > 0
                      ? `${((blockchainStatus.requestsFulfilled / blockchainStatus.requestsListened) * 100).toFixed(1)}% success`
                      : 'N/A'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-3 sm:p-4 rounded-2xl bg-background/50 border border-blue-400/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="h-4 w-4 text-blue-300 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground">Balance</span>
                  </div>
                  <p className="text-base sm:text-lg font-semibold truncate">{parseFloat(blockchainStatus.balanceETH).toFixed(4)} ETH</p>
                  <p className="text-xs text-muted-foreground">Gas fulfillment</p>
                </motion.div>
              </div>

              {/* Uptime and Errors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-background/50 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Uptime</span>
                    <Badge variant="outline">{formatUptime(blockchainStatus.uptime)}</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-background/50 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Recent Errors</span>
                    <Badge variant={blockchainStatus.errors.length > 0 ? 'destructive' : 'secondary'}>
                      {blockchainStatus.errors.length}
                    </Badge>
                  </div>
                  <div className="space-y-1 max-h-16 overflow-y-auto">
                    {blockchainStatus.errors.length > 0 ? (
                      blockchainStatus.errors.slice(-3).map((error, i) => (
                        <p key={i} className="text-xs text-red-400 truncate">{error}</p>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">No errors</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Oracle Features */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold mb-3">Oracle Capabilities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <div className="flex items-center gap-2 p-2 rounded border border-green-500/20 bg-green-950/10">
                    <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Real-time Price Feeds</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded border border-blue-500/20 bg-blue-950/10">
                    <CheckCircle className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">AI Sentiment Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded border border-blue-500/20 bg-blue-950/10">
                    <CheckCircle className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Custom Data Requests</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4">
              <Server className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Oracle Node Not Running</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Start the blockchain oracle node to bridge off-chain data to smart contracts
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto">
                <Button
                  onClick={() => startOracleNode('astar-zkevm')}
                  disabled={startingNode}
                  className="gap-2 w-full sm:w-auto text-xs sm:text-sm"
                >
                  <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  {startingNode ? 'Starting...' : 'Start Astar zkEVM'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => startOracleNode('sepolia')}
                  disabled={startingNode}
                  className="gap-2 w-full sm:w-auto text-xs sm:text-sm"
                >
                  <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  {startingNode ? 'Starting...' : 'Start Sepolia'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Oracle Features Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-300" />
            Oracle Features
          </CardTitle>
          <CardDescription>
            AI Analysis, Trading Signals, and Cross-Chain Data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Dropdown Selector */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-transparent border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-400 whitespace-nowrap">
                    Select Feature:
                  </label>
                  <Select value={activeOracleFeature} onValueChange={setActiveOracleFeature}>
                    <SelectTrigger className="flex-1 bg-gray-800/50 border-gray-700 text-white hover:border-blue-500 transition-colors">
                      <SelectValue placeholder="Select a feature" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="cross-chain" className="text-white hover:bg-blue-600/20 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Link className="h-4 w-4 text-blue-400" />
                          <span>Cross-Chain</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="chainlink" className="text-white hover:bg-green-600/20 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-green-400" />
                          <span>Oracle</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Conditional Content Rendering */}
            <div className="space-y-4">
            {activeOracleFeature === 'cross-chain' && (
              <div className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Token Symbol or Address</label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-2xl border bg-background"
                    placeholder="Example: USDC, WETH, or token address..."
                    value={liquidityToken}
                    onChange={(e) => setLiquidityToken(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Chains</label>
                  <div className="flex flex-wrap gap-2">
                    {['solana', 'ethereum', 'base', 'polygon', 'arbitrum', 'optimism'].map((chain) => (
                      <Button
                        key={chain}
                        variant={liquidityChains.includes(chain) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          if (liquidityChains.includes(chain)) {
                            setLiquidityChains(liquidityChains.filter(c => c !== chain));
                          } else {
                            setLiquidityChains([...liquidityChains, chain]);
                          }
                        }}
                      >
                        {chain.charAt(0).toUpperCase() + chain.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Button
                  onClick={fetchCrossChainLiquidity}
                  disabled={liquidityLoading || !liquidityToken.trim() || liquidityChains.length === 0}
                  className="w-full gap-2"
                >
                  {liquidityLoading ? (
                    <>
                      <Activity className="h-4 w-4 terminal-pulse" />
                      Fetching Liquidity...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4" />
                      Get Cross-Chain Liquidity ({liquidityChains.length} chains)
                    </>
                  )}
                </Button>
                
                {liquidityData.length > 0 && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl border bg-gradient-to-br from-green-950/20 to-blue-950/20">
                      <h4 className="text-sm font-semibold mb-2">Total Liquidity</h4>
                      <p className="text-3xl font-bold">
                        ${liquidityData.reduce((sum, d) => sum + d.totalLiquidity, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Across {liquidityData.length} chains
                      </p>
                    </div>
                    
                    {liquidityData.map((data, index) => (
                      <motion.div
                        key={data.chain}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-2xl border bg-background/50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-semibold capitalize">{data.chain}</h4>
                            <p className="text-xs text-muted-foreground">{data.pairs} trading pairs</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-400">
                              ${data.totalLiquidity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-xs text-muted-foreground">Total Liquidity</p>
                          </div>
                        </div>
                        
                        {data.topPairs && data.topPairs.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground">Top Pairs:</p>
                            {data.topPairs.map((pair, i) => (
                              <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs">
                                <span className="font-mono">{pair.dex}</span>
                                <span className="text-green-400">${(pair.liquidity / 1e3).toFixed(1)}K</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              </div>
            )}

            {activeOracleFeature === 'chainlink' && (
              <div className="space-y-4">
                <ChainlinkOracleTab />
              </div>
            )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Stats */}
      {enhancedData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-400" />
                  24h Trades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{enhancedData.tradingStats.total24h}</p>
                <p className="text-xs text-muted-foreground">
                  {enhancedData.tradingStats.profitable24h} profitable ({enhancedData.tradingStats.winRate24h.toFixed(1)}%)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  24h P&L
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${enhancedData.tradingStats.totalPnL24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${Math.abs(enhancedData.tradingStats.totalPnL24h).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {enhancedData.tradingStats.totalPnL24h >= 0 ? 'Profit' : 'Loss'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-blue-400" />
                  Agent Funds
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${enhancedData.tradingStats.totalAgentFunds.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{enhancedData.agents.length} active agents</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-300" />
                  Treasury
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${enhancedData.treasuryBalance.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Platform funds</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
