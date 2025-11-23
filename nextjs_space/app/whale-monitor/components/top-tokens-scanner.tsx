
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Users, 
  Droplet,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Minus
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TokenData {
  rank: number;
  symbol: string;
  name: string;
  address: string;
  buyVolume24h: number;
  sellVolume24h: number;
  totalVolume24h: number;
  buyPercentage: number;
  priceUsd: number;
  priceChange24h: number;
  marketCap: number;
  holders: number;
  liquidity: number;
  transactions24h: number;
  buys24h: number;
  sells24h: number;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  sentimentScore: number;
  sentimentReasons: string[];
  lastUpdated: string;
}

interface ChainData {
  chain: string;
  chainName: string;
  scanTime: string;
  totalScanned: number;
  topTokens: TokenData[];
}

interface ScanResponse {
  success: boolean;
  timestamp: string;
  chains: ChainData[];
  summary: {
    totalChains: number;
    totalTopTokens: number;
    bullishTokens: number;
    bearishTokens: number;
    neutralTokens: number;
  };
}

export function TopTokensScanner() {
  const [data, setData] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    loadTopTokens();
    const interval = setInterval(loadTopTokens, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const loadTopTokens = async () => {
    if (!loading) setRefreshing(true);
    
    try {
      const response = await fetch('/api/whale-monitor/top-tokens');
      if (response.ok) {
        const result = await response.json();
        setData(result);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to load top tokens:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const forceRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch('/api/whale-monitor/top-tokens', { method: 'POST' });
      await loadTopTokens();
    } catch (error) {
      console.error('Failed to refresh:', error);
      setRefreshing(false);
    }
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`;
    return `$${num.toFixed(decimals)}`;
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment) {
      case 'BULLISH': return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'BEARISH': return 'text-red-400 bg-red-500/20 border-red-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH': return <TrendingUp className="h-3 w-3" />;
      case 'BEARISH': return <TrendingDown className="h-3 w-3" />;
      default: return <Minus className="h-3 w-3" />;
    }
  };

  const getChainColor = (chain: string): string => {
    switch (chain) {
      case 'ethereum': return 'from-blue-500/20 to-purple-500/20 border-blue-500/50';
      case 'bsc': return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/50';
      case 'polygon': return 'from-purple-500/20 to-pink-500/20 border-purple-500/50';
      case 'base': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/50';
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-500/50';
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-black/40 backdrop-blur border border-gray-800">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
          <span className="ml-3 text-gray-400">Scanning EVM chains for top tokens...</span>
        </div>
      </Card>
    );
  }

  if (!data || !data.success) {
    return (
      <Card className="p-6 bg-black/40 backdrop-blur border border-gray-800">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-400">Failed to load top tokens data</p>
          <Button onClick={loadTopTokens} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card className="p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur border border-blue-500/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Top Tokens by Buy Volume</h3>
            <p className="text-gray-400 text-sm">
              Real-time scanning across {data.summary.totalChains} EVM chains
            </p>
          </div>
          <Button
            onClick={forceRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-black/30 border border-blue-500/20">
            <div className="text-gray-400 text-sm mb-1">Total Tokens</div>
            <div className="text-2xl font-bold text-white">{data.summary.totalTopTokens}</div>
          </div>
          <div className="p-4 rounded-xl bg-black/30 border border-green-500/20">
            <div className="text-gray-400 text-sm mb-1">Bullish</div>
            <div className="text-2xl font-bold text-green-400">{data.summary.bullishTokens}</div>
          </div>
          <div className="p-4 rounded-xl bg-black/30 border border-red-500/20">
            <div className="text-gray-400 text-sm mb-1">Bearish</div>
            <div className="text-2xl font-bold text-red-400">{data.summary.bearishTokens}</div>
          </div>
          <div className="p-4 rounded-xl bg-black/30 border border-gray-500/20">
            <div className="text-gray-400 text-sm mb-1">Neutral</div>
            <div className="text-2xl font-bold text-gray-400">{data.summary.neutralTokens}</div>
          </div>
        </div>

        {lastUpdate && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            Last updated: {lastUpdate.toLocaleTimeString()} • Auto-refresh every 5 minutes
          </div>
        )}
      </Card>

      {/* Chains Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.chains.map((chainData, index) => (
          <motion.div
            key={chainData.chain}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-6 bg-gradient-to-br ${getChainColor(chainData.chain)} backdrop-blur border`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-white">{chainData.chainName}</h4>
                  <p className="text-gray-400 text-sm">
                    Scanned {chainData.totalScanned} tokens
                  </p>
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                  Top {chainData.topTokens.length}
                </Badge>
              </div>

              {/* Tokens List */}
              <div className="space-y-4">
                {chainData.topTokens.map((token, tokenIndex) => (
                  <motion.div
                    key={token.address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index * 0.1) + (tokenIndex * 0.05) }}
                    className="p-4 rounded-xl bg-black/40 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                  >
                    {/* Token Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-gray-700 text-white text-xs">#{token.rank}</Badge>
                          <span className="text-lg font-bold text-white">{token.symbol}</span>
                          <Badge className={`text-xs ${getSentimentColor(token.sentiment)}`}>
                            {getSentimentIcon(token.sentiment)}
                            <span className="ml-1">{token.sentiment}</span>
                          </Badge>
                        </div>
                        <div className="text-gray-400 text-sm">{token.name}</div>
                        <div className="text-gray-500 text-xs mt-1">{formatAddress(token.address)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          {token.priceUsd > 0.01 ? `$${token.priceUsd.toFixed(4)}` : `$${token.priceUsd.toFixed(8)}`}
                        </div>
                        <div className={`text-sm ${token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    {/* Buy/Sell Metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="text-xs text-gray-400 mb-1">Buy Volume</div>
                        <div className="text-sm font-semibold text-green-400">
                          {formatNumber(token.buyVolume24h)}
                        </div>
                        <div className="text-xs text-gray-500">{token.buys24h} buys</div>
                      </div>
                      <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="text-xs text-gray-400 mb-1">Sell Volume</div>
                        <div className="text-sm font-semibold text-red-400">
                          {formatNumber(token.sellVolume24h)}
                        </div>
                        <div className="text-xs text-gray-500">{token.sells24h} sells</div>
                      </div>
                    </div>

                    {/* Buy Percentage Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Buy Pressure</span>
                        <span className="text-white font-semibold">{token.buyPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
                          style={{ width: `${token.buyPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Additional Metrics */}
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center p-2 rounded-lg bg-black/30">
                        <DollarSign className="h-3 w-3 text-gray-400 mx-auto mb-1" />
                        <div className="text-gray-400">MCap</div>
                        <div className="text-white font-semibold">{formatNumber(token.marketCap, 0)}</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-black/30">
                        <Users className="h-3 w-3 text-gray-400 mx-auto mb-1" />
                        <div className="text-gray-400">Holders</div>
                        <div className="text-white font-semibold">{token.holders}</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-black/30">
                        <Activity className="h-3 w-3 text-gray-400 mx-auto mb-1" />
                        <div className="text-gray-400">Txns</div>
                        <div className="text-white font-semibold">{token.transactions24h}</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-black/30">
                        <Droplet className="h-3 w-3 text-gray-400 mx-auto mb-1" />
                        <div className="text-gray-400">Liq</div>
                        <div className="text-white font-semibold">{formatNumber(token.liquidity, 0)}</div>
                      </div>
                    </div>

                    {/* Sentiment Reasons */}
                    {token.sentimentReasons.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-700/50">
                        <div className="text-xs text-gray-400 mb-2">Analysis:</div>
                        <ul className="space-y-1">
                          {token.sentimentReasons.map((reason, i) => (
                            <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-blue-400 flex-shrink-0 mt-0.5" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
