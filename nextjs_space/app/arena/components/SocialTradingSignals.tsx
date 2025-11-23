
'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { TrendingUp, TrendingDown, Minus, Twitter, Heart, Repeat2, MessageCircle, Activity } from 'lucide-react';

interface SocialSignal {
  id: string;
  token: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  source: string;
  text: string;
  author: string;
  timestamp: Date;
  engagement: {
    likes: number;
    retweets: number;
    replies: number;
  };
  influenceScore: number;
}

interface AggregatedSignal {
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  averageStrength: number;
  totalInfluence: number;
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
}

export function SocialTradingSignals() {
  const [signals, setSignals] = useState<SocialSignal[]>([]);
  const [aggregated, setAggregated] = useState<Record<string, AggregatedSignal>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchSignals = async () => {
    try {
      const response = await fetch('/api/social-signals?tokens=ETH,BTC,USDC');
      const data = await response.json();
      
      if (data.signals) {
        // Convert timestamp strings to Date objects
        const processedSignals = data.signals.map((signal: any) => ({
          ...signal,
          timestamp: new Date(signal.timestamp),
        }));
        
        setSignals(processedSignals);
        setAggregated(data.aggregated);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching social signals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
    
    // Refresh every 2 minutes
    const interval = setInterval(() => {
      fetchSignals();
    }, 120000);
    
    return () => clearInterval(interval);
  }, []);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'bearish':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <Card className="terminal-crt-screen p-6 bg-black/40 backdrop-blur-sm border-[#0066ff]/20">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066ff]"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Twitter className="h-5 w-5 text-[#0066ff]" />
          <h2 className="text-xl font-bold text-white">Social Trading Signals</h2>
        </div>
        {lastUpdate && (
          <div className="text-xs text-gray-400">
            Last updated: {formatTime(lastUpdate)}
          </div>
        )}
      </div>

      {/* Aggregated Sentiment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(aggregated).map(([token, data]) => (
          <Card key={token} className="p-4 bg-black/40 backdrop-blur-sm border-[#0066ff]/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">{token}</span>
                {getSentimentIcon(data.overallSentiment)}
              </div>
              <Badge className={getSentimentColor(data.overallSentiment)}>
                {data.overallSentiment.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Bullish Signals:</span>
                <span className="text-green-500 font-semibold">{data.bullishCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bearish Signals:</span>
                <span className="text-red-500 font-semibold">{data.bearishCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Strength:</span>
                <span className="text-[#0066ff] font-semibold">{data.averageStrength.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Influence:</span>
                <span className="text-[#0066ff] font-semibold">{data.totalInfluence}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Signal Feed */}
      <Card className="terminal-crt-screen bg-black/40 backdrop-blur-sm border-[#0066ff]/20">
        <div className="p-4 border-b border-[#0066ff]/20">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#0066ff]" />
            <h3 className="font-semibold text-white">Live Signal Feed</h3>
          </div>
        </div>
        
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-4">
            {signals.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No social signals available
              </div>
            ) : (
              signals.map((signal) => (
                <div
                  key={signal.id}
                  className="p-4 rounded-2xl bg-black/60 border border-[#0066ff]/10 hover:border-[#0066ff]/30 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#0066ff]/20 flex items-center justify-center">
                        <Twitter className="h-4 w-4 text-[#0066ff]" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">@{signal.author}</div>
                        <div className="text-xs text-gray-400">{formatTime(signal.timestamp)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#0066ff]/10 text-[#0066ff] border-[#0066ff]/20">
                        {signal.token}
                      </Badge>
                      <Badge className={getSentimentColor(signal.sentiment)}>
                        {signal.sentiment}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Tweet Text */}
                  <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                    {signal.text}
                  </p>
                  
                  {/* Metrics */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4 text-gray-400">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{signal.engagement.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Repeat2 className="h-3 w-3" />
                        <span>{signal.engagement.retweets.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{signal.engagement.replies.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Influence:</span>
                      <span className="text-[#0066ff] font-semibold">{signal.influenceScore}/100</span>
                    </div>
                  </div>
                  
                  {/* Strength Indicator */}
                  {signal.strength > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#0066ff]/10">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Signal Strength</span>
                        <span className="text-[#0066ff] font-semibold">{signal.strength}%</span>
                      </div>
                      <div className="w-full bg-black/60 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-[#0066ff] to-green-400"
                          style={{ width: `${signal.strength}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
