
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, TrendingDown, Activity, Search, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export function TGMPerpPositions() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [positions, setPositions] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeToken = async () => {
    if (!tokenAddress) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `/api/nansen/tgm/perp-positions?address=${tokenAddress}&chain=ethereum`
      );
      const data = await response.json();
      
      if (data.success) {
        setPositions(data.data);
      }
    } catch (error) {
      console.error('Error analyzing token:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(decimals)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(decimals)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'BULLISH') return 'bg-green-500/20 border-green-500 text-green-400';
    if (sentiment === 'BEARISH') return 'bg-red-500/20 border-red-500 text-red-400';
    return 'bg-gray-500/20 border-gray-500 text-gray-400';
  };

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment === 'BULLISH') return <TrendingUp className="h-5 w-5" />;
    if (sentiment === 'BEARISH') return <TrendingDown className="h-5 w-5" />;
    return <Activity className="h-5 w-5" />;
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Analyze Token Perp Positions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter token address (e.g., 0x...)"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeToken()}
              className="bg-gray-800 border-gray-700 text-white"
            />
            <Button 
              onClick={analyzeToken} 
              disabled={loading || !tokenAddress}
              className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Positions Data */}
      {positions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  {positions.symbol} Perp Positioning
                </CardTitle>
                <Badge variant="outline" className={getSentimentColor(positions.sentiment)}>
                  {getSentimentIcon(positions.sentiment)}
                  <span className="ml-1">{positions.sentiment}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-400 mb-1">Total Longs</p>
                  <p className="text-xl font-bold text-green-400">{positions.totalLongPositions}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    ${formatNumber(positions.longValueUSD)}
                  </p>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-400 mb-1">Total Shorts</p>
                  <p className="text-xl font-bold text-red-400">{positions.totalShortPositions}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    ${formatNumber(positions.shortValueUSD)}
                  </p>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-400 mb-1">Net Position</p>
                  <p className={`text-xl font-bold ${positions.netPositionUSD >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${formatNumber(Math.abs(positions.netPositionUSD))}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {positions.netPositionUSD >= 0 ? 'Long biased' : 'Short biased'}
                  </p>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-400 mb-1">Platform</p>
                  <p className="text-xl font-bold text-white">{positions.platform}</p>
                  <p className="text-xs text-gray-400 mt-1">{positions.chain}</p>
                </div>
              </div>

              {/* Position Distribution */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Position Distribution
                </h3>
                <div className="relative h-8 flex rounded-2xl overflow-hidden">
                  <div 
                    className="bg-green-500 flex items-center justify-center text-white text-sm font-bold"
                    style={{ 
                      width: `${(positions.longValueUSD / (positions.longValueUSD + positions.shortValueUSD)) * 100}%` 
                    }}
                  >
                    {((positions.longValueUSD / (positions.longValueUSD + positions.shortValueUSD)) * 100).toFixed(1)}% LONG
                  </div>
                  <div 
                    className="bg-red-500 flex items-center justify-center text-white text-sm font-bold"
                    style={{ 
                      width: `${(positions.shortValueUSD / (positions.longValueUSD + positions.shortValueUSD)) * 100}%` 
                    }}
                  >
                    {((positions.shortValueUSD / (positions.longValueUSD + positions.shortValueUSD)) * 100).toFixed(1)}% SHORT
                  </div>
                </div>
              </div>

              {/* Top Traders */}
              {positions.topTraders && positions.topTraders.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Top Traders
                  </h3>
                  <div className="space-y-2">
                    {positions.topTraders.map((trader: any, index: number) => (
                      <div
                        key={index}
                        className="bg-gray-800/50 p-3 rounded-2xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {trader.side === 'LONG' ? (
                            <TrendingUp className="h-5 w-5 text-green-400" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-400" />
                          )}
                          <div>
                            <p className="text-white font-bold">
                              {trader.label || formatAddress(trader.address)}
                            </p>
                            <p className="text-xs text-gray-400">{formatAddress(trader.address)}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-white font-bold">${formatNumber(trader.sizeUSD)}</p>
                          {trader.pnl !== 0 && (
                            <p className={`text-xs ${trader.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              PnL: {trader.pnl >= 0 ? '+' : ''}${formatNumber(Math.abs(trader.pnl))}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Info Card */}
      {!positions && (
        <Card className="bg-gray-900/30 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Activity className="h-5 w-5 text-blue-400 mt-1" />
              <div>
                <p className="text-white font-medium">TGM Perp Positions Analysis</p>
                <ul className="mt-2 space-y-1 text-sm text-gray-400">
                  <li>• View aggregate long/short positioning for any token</li>
                  <li>• Track smart money perp traders and their positions</li>
                  <li>• Identify market sentiment and positioning biases</li>
                  <li>• Monitor top traders' PnL and strategies</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
