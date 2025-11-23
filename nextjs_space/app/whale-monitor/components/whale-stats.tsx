
'use client';

import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Eye, Activity, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WhaleStatsProps {
  stats: any;
}

export function WhaleStats({ stats }: WhaleStatsProps) {
  if (!stats) {
    return <div className="text-center text-gray-400 py-8">Loading statistics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Whale Activity */}
      <Card className="terminal-crt-screen bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-400" />
            Whale Activity (Last 24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-400">Total Signals</p>
              <p className="text-2xl font-bold text-white">
                {stats.whaleActivity?.signals || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Volume</p>
              <p className="text-2xl font-bold text-white">
                ${(stats.whaleActivity?.totalVolume || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {stats.whaleActivity?.topMovers && stats.whaleActivity.topMovers.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400 mb-2">Top Whale Moves</p>
              {stats.whaleActivity.topMovers.map((move: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-blue-900/20 p-3 rounded border border-blue-500/30"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{move.whaleLabel}</p>
                      <p className="text-sm text-gray-400">
                        {move.action} {move.token} • ${move.amountUSD.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-blue-500 text-blue-400">
                      {move.confidence}% confidence
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Signals */}
      <Card className="terminal-crt-screen bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            AI Signal Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-400">Total Signals</p>
              <p className="text-2xl font-bold text-white">
                {stats.aiSignals?.total || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Avg Confidence</p>
              <p className="text-2xl font-bold text-white">
                {(stats.aiSignals?.avgConfidence || 0).toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">High Priority</p>
              <p className="text-2xl font-bold text-white">
                {(stats.aiSignals?.critical || 0) + (stats.aiSignals?.high || 0)}
              </p>
            </div>
          </div>

          {stats.aiSignals?.recent && stats.aiSignals.recent.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400 mb-2">Recent Signals</p>
              {stats.aiSignals.recent.map((signal: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-blue-950/20 p-3 rounded border border-blue-600/30"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{signal.symbol}</p>
                      <p className="text-sm text-gray-400">
                        {signal.type} • {signal.action}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={signal.urgency === 'CRITICAL' ? 'destructive' : 'outline'}
                        className={signal.urgency === 'HIGH' ? 'border-blue-500 text-blue-500' : ''}
                      >
                        {signal.urgency}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">
                        {signal.confidence}% confidence
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Sentiment */}
      <Card className="terminal-crt-screen bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Social Sentiment Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-400">Total Mentions</p>
              <p className="text-2xl font-bold text-white">
                {stats.socialSentiment?.total || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Trending Tokens</p>
              <p className="text-2xl font-bold text-white">
                {stats.socialSentiment?.trending?.length || 0}
              </p>
            </div>
          </div>

          {stats.socialSentiment?.recent && stats.socialSentiment.recent.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400 mb-2">Recent Sentiment</p>
              {stats.socialSentiment.recent.map((sentiment: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-blue-900/20 p-3 rounded border border-blue-500/30"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{sentiment.symbol}</p>
                      <p className="text-sm text-gray-400">
                        {sentiment.volume} mentions • {sentiment.influencerMentions} influencers
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${sentiment.sentiment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {sentiment.sentiment > 0 ? '+' : ''}{sentiment.sentiment}
                      </p>
                      {sentiment.trending && (
                        <Badge variant="outline" className="border-blue-500 text-blue-500 mt-1">
                          🔥 Trending
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracked Whales */}
      <Card className="terminal-crt-screen bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-green-400" />
            Tracked Whale Wallets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-white mb-4">
            {stats.trackedWhales?.total || 0} Whales
          </p>
          
          {stats.trackedWhales?.topReputation && stats.trackedWhales.topReputation.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400 mb-2">Top Reputation</p>
              {stats.trackedWhales.topReputation.slice(0, 5).map((whale: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-green-900/20 p-3 rounded border border-green-500/30"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{whale.label}</p>
                      <p className="text-sm text-gray-400 font-mono">
                        {whale.address.slice(0, 6)}...{whale.address.slice(-4)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-400">
                        {whale.reputation}/100
                      </p>
                      <p className="text-xs text-gray-400">{whale.chain}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
