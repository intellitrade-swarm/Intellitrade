
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Medal, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function PerpLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState('GMX');
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    loadLeaderboard();
  }, [platform, timeframe]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/nansen/tgm/perp-pnl-leaderboard?platform=${platform}&timeframe=${timeframe}&limit=50`
      );
      const data = await response.json();
      
      if (data.success) {
        setLeaderboard(data.data);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(decimals)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-600" />;
    return <Award className="h-5 w-5 text-gray-600" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-900/30 to-yellow-950/10 border-yellow-500/50';
    if (rank === 2) return 'from-gray-800/30 to-gray-900/10 border-gray-500/50';
    if (rank === 3) return 'from-orange-900/30 to-orange-950/10 border-orange-600/50';
    return 'from-blue-900/20 to-transparent border-gray-700';
  };

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <Activity className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-3 text-gray-400">Loading leaderboard...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Perp Traders
            </CardTitle>
            
            <div className="flex gap-2">
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="GMX">GMX</SelectItem>
                  <SelectItem value="dYdX">dYdX</SelectItem>
                  <SelectItem value="Perpetual Protocol">Perpetual Protocol</SelectItem>
                </SelectContent>
              </Select>

              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-24 bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {leaderboard && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-800/50 rounded-2xl">
                <div>
                  <p className="text-xs text-gray-400">Total Traders</p>
                  <p className="text-lg font-bold text-white">
                    {leaderboard.summary.totalTraders}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Volume</p>
                  <p className="text-lg font-bold text-white">
                    ${formatNumber(leaderboard.summary.totalVolume)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Avg PnL</p>
                  <p className={`text-lg font-bold ${leaderboard.summary.avgPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${formatNumber(leaderboard.summary.avgPnL)}
                  </p>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="space-y-2">
                {leaderboard.entries.map((entry: any) => (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: entry.rank * 0.02 }}
                    className={`bg-gradient-to-r ${getRankColor(entry.rank)} p-4 rounded-2xl border`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-16">
                        {getRankIcon(entry.rank)}
                        <span className="text-2xl font-bold text-white">#{entry.rank}</span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-bold">
                            {entry.label || formatAddress(entry.address)}
                          </span>
                          {entry.label && (
                            <Badge variant="outline" className="border-blue-500 text-blue-500">
                              Smart Money
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{formatAddress(entry.address)}</div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-right">
                        <div>
                          <p className="text-xs text-gray-400">Total PnL</p>
                          <p className={`text-sm font-bold ${entry.totalPnLUSD >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {entry.totalPnLUSD >= 0 ? '+' : ''}${formatNumber(entry.totalPnLUSD)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">ROI</p>
                          <p className={`text-sm font-bold ${entry.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {entry.roi >= 0 ? '+' : ''}{entry.roi.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Win Rate</p>
                          <p className="text-sm font-bold text-white">{entry.winRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Trades</p>
                          <p className="text-sm font-bold text-white">{entry.trades}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className="text-gray-400">
                        Avg Leverage: <span className="text-blue-400 font-bold">{entry.avgLeverage.toFixed(1)}x</span>
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400">
                        Favorite: <span className="text-white font-bold">{entry.favoriteMarket}</span>
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
