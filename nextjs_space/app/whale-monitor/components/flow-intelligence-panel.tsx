'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  DollarSign,
  Users,
  ArrowUpCircle,
  ArrowDownCircle,
  Minus,
  Award,
  Target
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FlowIntelligenceData {
  smartMoneyFlow: {
    netflow24h: number;
    netflow7d: number;
    trend: 'ACCUMULATING' | 'DISTRIBUTING' | 'NEUTRAL';
  };
  exchangeFlow: {
    netflow24h: number;
    netflow7d: number;
    trend: 'ACCUMULATING' | 'DISTRIBUTING' | 'NEUTRAL';
  };
  whaleFlow: {
    netflow24h: number;
    netflow7d: number;
    trend: 'ACCUMULATING' | 'DISTRIBUTING' | 'NEUTRAL';
  };
  freshWalletActivity: {
    count24h: number;
    volume24h: number;
  };
}

interface SmartMoneyNetflow {
  netflow: number;
  inflow: number;
  outflow: number;
  netflowUSD: number;
  percentChange24h: number;
  trend: 'ACCUMULATING' | 'DISTRIBUTING' | 'NEUTRAL';
  topWallets: {
    address: string;
    label?: string;
    netflow: number;
    action: 'BUYING' | 'SELLING';
  }[];
}

interface PnLLeaderboardEntry {
  address: string;
  label?: string;
  totalPnL: number;
  totalROI: number;
  realizedPnL: number;
  unrealizedPnL: number;
  percentHolding: number;
  trades: number;
  winRate: number;
}

export function FlowIntelligencePanel() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [flowIntel, setFlowIntel] = useState<FlowIntelligenceData | null>(null);
  const [netflows, setNetflows] = useState<SmartMoneyNetflow | null>(null);
  const [leaderboard, setLeaderboard] = useState<PnLLeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  const analyzeToken = async () => {
    if (!tokenAddress) return;
    
    setLoading(true);
    try {
      // Fetch Flow Intelligence, Netflows, and Leaderboard in parallel
      const [flowRes, netflowRes, leaderboardRes] = await Promise.all([
        fetch(`/api/nansen/flow-intelligence?address=${tokenAddress}&chain=ethereum`),
        fetch(`/api/nansen/netflows?address=${tokenAddress}&chain=ethereum`),
        fetch(`/api/nansen/pnl-leaderboard?address=${tokenAddress}&chain=ethereum&limit=20`)
      ]);

      const flowData = await flowRes.json();
      const netflowData = await netflowRes.json();
      const leaderboardData = await leaderboardRes.json();

      if (flowData.success) setFlowIntel(flowData.flowIntelligence);
      if (netflowData.success) setNetflows(netflowData.netflows);
      if (leaderboardData.success) setLeaderboard(leaderboardData.leaderboard);
    } catch (error) {
      console.error('Error analyzing token:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'ACCUMULATING':
        return <ArrowUpCircle className="h-5 w-5 text-green-500" />;
      case 'DISTRIBUTING':
        return <ArrowDownCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'ACCUMULATING':
        return 'text-green-500';
      case 'DISTRIBUTING':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="terminal-crt-screen p-6 bg-black/50 border-[#3385ff]/30">
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Enter token contract address (e.g., 0x...)"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            className="flex-1 bg-black/30 border-[#3385ff]/30 text-white"
          />
          <Button
            onClick={analyzeToken}
            disabled={loading || !tokenAddress}
            className="bg-[#3385ff] text-black hover:bg-[#3385ff]/80"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      </Card>

      {/* Results */}
      {flowIntel && (
        <div className="w-full space-y-6">
          {/* Dropdown Selector */}
          <Card className="bg-gradient-to-br from-gray-900/50 to-transparent border-blue-500/30">
            <div className="p-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-400 whitespace-nowrap">
                  Select View:
                </label>
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className="flex-1 bg-gray-800/50 border-gray-700 text-white hover:border-blue-500 transition-colors">
                    <SelectValue placeholder="Select a view" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="overview" className="text-white hover:bg-blue-600/20 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-400" />
                        <span>Overview</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="netflows" className="text-white hover:bg-blue-600/20 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-400" />
                        <span>Smart Money</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="leaderboard" className="text-white hover:bg-blue-600/20 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-green-400" />
                        <span>Top Traders</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Conditional Content Rendering */}
          <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
            {/* Flow Intelligence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Smart Money Flow */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="terminal-crt-screen p-6 bg-gradient-to-br from-blue-900/20 to-blue-950/20 border-blue-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Smart Money</h3>
                    </div>
                    {getTrendIcon(flowIntel.smartMoneyFlow.trend)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">24h Flow:</span>
                      <span className={`text-lg font-bold ${getTrendColor(flowIntel.smartMoneyFlow.trend)}`}>
                        {flowIntel.smartMoneyFlow.netflow24h > 0 ? '+' : ''}
                        {flowIntel.smartMoneyFlow.netflow24h.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">7d Flow:</span>
                      <span className={`text-lg font-bold ${getTrendColor(flowIntel.smartMoneyFlow.trend)}`}>
                        {flowIntel.smartMoneyFlow.netflow7d > 0 ? '+' : ''}
                        {flowIntel.smartMoneyFlow.netflow7d.toFixed(2)}
                      </span>
                    </div>
                    <Badge className={`mt-2 ${
                      flowIntel.smartMoneyFlow.trend === 'ACCUMULATING' ? 'bg-green-500/20 text-green-400' :
                      flowIntel.smartMoneyFlow.trend === 'DISTRIBUTING' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {flowIntel.smartMoneyFlow.trend}
                    </Badge>
                  </div>
                </Card>
              </motion.div>

              {/* Exchange Flow */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="terminal-crt-screen p-6 bg-gradient-to-br from-blue-900/20 to-blue-900/20 border-blue-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Exchange Flow</h3>
                    </div>
                    {getTrendIcon(flowIntel.exchangeFlow.trend)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">24h Flow:</span>
                      <span className={`text-lg font-bold ${getTrendColor(flowIntel.exchangeFlow.trend)}`}>
                        {flowIntel.exchangeFlow.netflow24h > 0 ? '+' : ''}
                        {flowIntel.exchangeFlow.netflow24h.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">7d Flow:</span>
                      <span className={`text-lg font-bold ${getTrendColor(flowIntel.exchangeFlow.trend)}`}>
                        {flowIntel.exchangeFlow.netflow7d > 0 ? '+' : ''}
                        {flowIntel.exchangeFlow.netflow7d.toFixed(2)}
                      </span>
                    </div>
                    <Badge className={`mt-2 ${
                      flowIntel.exchangeFlow.trend === 'DISTRIBUTING' ? 'bg-green-500/20 text-green-400' : // Outflow from CEX is bullish
                      flowIntel.exchangeFlow.trend === 'ACCUMULATING' ? 'bg-red-500/20 text-red-400' : // Inflow to CEX is bearish
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {flowIntel.exchangeFlow.trend === 'DISTRIBUTING' ? 'Withdrawing (Bullish)' :
                       flowIntel.exchangeFlow.trend === 'ACCUMULATING' ? 'Depositing (Bearish)' : 'NEUTRAL'}
                    </Badge>
                  </div>
                </Card>
              </motion.div>

              {/* Whale Flow */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="terminal-crt-screen p-6 bg-gradient-to-br from-blue-800/20 to-blue-900/20 border-blue-400/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-blue-300" />
                      <h3 className="text-lg font-semibold text-white">Whale Flow</h3>
                    </div>
                    {getTrendIcon(flowIntel.whaleFlow.trend)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">24h Flow:</span>
                      <span className={`text-lg font-bold ${getTrendColor(flowIntel.whaleFlow.trend)}`}>
                        {flowIntel.whaleFlow.netflow24h > 0 ? '+' : ''}
                        {flowIntel.whaleFlow.netflow24h.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">7d Flow:</span>
                      <span className={`text-lg font-bold ${getTrendColor(flowIntel.whaleFlow.trend)}`}>
                        {flowIntel.whaleFlow.netflow7d > 0 ? '+' : ''}
                        {flowIntel.whaleFlow.netflow7d.toFixed(2)}
                      </span>
                    </div>
                    <Badge className={`mt-2 ${
                      flowIntel.whaleFlow.trend === 'ACCUMULATING' ? 'bg-green-500/20 text-green-400' :
                      flowIntel.whaleFlow.trend === 'DISTRIBUTING' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {flowIntel.whaleFlow.trend}
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Fresh Wallet Activity */}
            <Card className="terminal-crt-screen p-6 bg-black/50 border-[#3385ff]/30">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-[#3385ff]" />
                <h3 className="text-lg font-semibold text-white">Fresh Wallet Activity</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">New Wallets (24h)</div>
                  <div className="text-2xl font-bold text-white">{flowIntel.freshWalletActivity.count24h}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">Volume (24h)</div>
                  <div className="text-2xl font-bold text-white">
                    ${(flowIntel.freshWalletActivity.volume24h / 1000).toFixed(1)}K
                  </div>
                </div>
              </div>
            </Card>
            </div>
          )}

          {activeTab === 'netflows' && (
            <div className="space-y-6">
            {netflows && (
              <>
                <Card className="terminal-crt-screen p-6 bg-black/50 border-[#3385ff]/30">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-[#3385ff]" />
                    <h3 className="text-lg font-semibold text-white">Smart Money Netflows</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-400">Net Flow</div>
                      <div className={`text-2xl font-bold ${getTrendColor(netflows.trend)}`}>
                        {netflows.netflow > 0 ? '+' : ''}{netflows.netflow.toFixed(2)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-400">Inflow</div>
                      <div className="text-2xl font-bold text-green-500">
                        +{netflows.inflow.toFixed(2)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-400">Outflow</div>
                      <div className="text-2xl font-bold text-red-500">
                        -{netflows.outflow.toFixed(2)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-400">USD Value</div>
                      <div className="text-2xl font-bold text-white">
                        ${(netflows.netflowUSD / 1000).toFixed(0)}K
                      </div>
                    </div>
                  </div>

                  <Badge className={`${
                    netflows.trend === 'ACCUMULATING' ? 'bg-green-500/20 text-green-400' :
                    netflows.trend === 'DISTRIBUTING' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {netflows.trend} {netflows.percentChange24h > 0 ? '+' : ''}
                    {netflows.percentChange24h.toFixed(1)}% (24h)
                  </Badge>
                </Card>

                {/* Top Wallets */}
                <Card className="terminal-crt-screen p-6 bg-black/50 border-[#3385ff]/30">
                  <h3 className="text-lg font-semibold text-white mb-4">Top Smart Money Wallets</h3>
                  <div className="space-y-3">
                    {netflows.topWallets.slice(0, 10).map((wallet, index) => (
                      <div 
                        key={wallet.address}
                        className="flex items-center justify-between p-3 bg-black/30 rounded-2xl border border-[#3385ff]/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-gray-400">#{index + 1}</div>
                          <div>
                            <div className="text-sm font-mono text-white">
                              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                            </div>
                            {wallet.label && (
                              <div className="text-xs text-[#3385ff]">{wallet.label}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`text-sm font-bold ${
                            wallet.action === 'BUYING' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {wallet.action === 'BUYING' ? '+' : '-'}{Math.abs(wallet.netflow).toFixed(2)}
                          </div>
                          <Badge className={`${
                            wallet.action === 'BUYING' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {wallet.action}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
            <Card className="terminal-crt-screen p-6 bg-black/50 border-[#3385ff]/30">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-[#3385ff]" />
                <h3 className="text-lg font-semibold text-white">Top Traders by P&L</h3>
              </div>
              <div className="space-y-3">
                {leaderboard.slice(0, 15).map((trader, index) => (
                  <div 
                    key={trader.address}
                    className="flex items-center justify-between p-4 bg-black/30 rounded-2xl border border-[#3385ff]/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-lg font-bold ${
                        index < 3 ? 'text-[#3385ff]' : 'text-gray-400'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-mono text-white">
                          {trader.address.slice(0, 8)}...{trader.address.slice(-6)}
                        </div>
                        {trader.label && (
                          <div className="text-xs text-[#3385ff]">{trader.label}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {trader.trades} trades · {trader.winRate.toFixed(1)}% win rate
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        trader.totalPnL > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {trader.totalPnL > 0 ? '+' : ''}${(trader.totalPnL / 1000).toFixed(1)}K
                      </div>
                      <div className={`text-sm ${
                        trader.totalROI > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {trader.totalROI > 0 ? '+' : ''}{trader.totalROI.toFixed(1)}% ROI
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {trader.percentHolding.toFixed(0)}% holding
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!flowIntel && !loading && (
        <Card className="terminal-crt-screen bg-gradient-to-br from-blue-900/20 to-blue-950/10 border-blue-500/30">
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  Flow Intelligence Analysis
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  Enter a token contract address above and click <strong>Analyze</strong> to get comprehensive on-chain flow intelligence:
                </p>
              </div>
              
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  <span>💎 Smart Money accumulation/distribution trends</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  <span>🏦 Exchange flow patterns (CEX inflows/outflows)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  <span>🐋 Whale activity and positioning</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  <span>🆕 Fresh wallet participation</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  <span>🏆 Top performing traders (PnL Leaderboard)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  <span>📊 Real-time netflow tracking</span>
                </li>
              </ul>
              
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-4">
                <p className="text-blue-400 font-medium mb-3">💡 Try these popular tokens:</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    {[
                      { name: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', label: 'Wrapped Ethereum' },
                      { name: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', label: 'Tether USD' },
                      { name: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', label: 'USD Coin' },
                      { name: 'UNI', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', label: 'Uniswap' },
                    ].map((token) => (
                      <Button
                        key={token.address}
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTokenAddress(token.address);
                          setTimeout(() => analyzeToken(), 100);
                        }}
                        className="w-full justify-between bg-blue-600/20 border-blue-500/50 text-left hover:bg-blue-600/30"
                      >
                        <span className="text-blue-300 font-medium">{token.name}</span>
                        <span className="text-xs text-gray-400 truncate ml-2">{token.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-center text-blue-400/70 mt-2">
                Powered by Advanced Flow Intelligence
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
