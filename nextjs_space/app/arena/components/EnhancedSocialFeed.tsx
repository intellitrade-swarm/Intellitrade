

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  TrendingDown, 
  Twitter, 
  Heart, 
  Repeat2, 
  MessageCircle, 
  Activity,
  Zap,
  BarChart3,
  Target,
  RefreshCw,
  ExternalLink,
  Sparkles
} from 'lucide-react';

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

export function EnhancedSocialFeed() {
  const [signals, setSignals] = useState<SocialSignal[]>([]);
  const [aggregated, setAggregated] = useState<Record<string, AggregatedSignal>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchSignals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/social-signals?tokens=ETH,BTC,USDC,SOL,MATIC');
      const data = await response.json();
      
      if (data.signals) {
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
    
    if (autoRefresh) {
      const interval = setInterval(fetchSignals, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'from-green-500/20 to-blue-500/20 border-green-500/50';
      case 'bearish':
        return 'from-red-500/20 to-rose-500/20 border-red-500/50';
      default:
        return 'from-gray-500/20 to-slate-500/20 border-gray-500/50';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  if (loading && signals.length === 0) {
    return (
      <Card className="terminal-crt-screen p-6 bg-gradient-to-br from-black/90 via-gray-900/90 to-black/90 border-2 border-[#0066ff]/30">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-[#0066ff] mx-auto mb-3 animate-spin" />
            <p className="text-sm text-gray-400">Loading social signals...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 p-6 shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Twitter className="h-8 w-8 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  Social Market Sentiment
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </h2>
                <p className="text-sm text-white/80">
                  Real-time insights from crypto Twitter • {signals.length} signals
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={fetchSignals}
                disabled={loading}
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? 'secondary' : 'outline'}
                size="sm"
                className={autoRefresh ? 'bg-white/20 hover:bg-white/30 text-white border-0' : ''}
              >
                <Zap className={`h-4 w-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Animated background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Market Sentiment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(aggregated).map(([token, data]) => (
          <Card 
            key={token} 
            className={`p-4 bg-gradient-to-br ${getSentimentColor(data.overallSentiment)} border-2 hover:scale-105 transition-transform cursor-pointer`}
          >
            <div className="space-y-3">
              {/* Token Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{token}</span>
                  </div>
                  {getSentimentIcon(data.overallSentiment)}
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    data.overallSentiment === 'bullish' ? 'text-green-400 border-green-400' :
                    data.overallSentiment === 'bearish' ? 'text-red-400 border-red-400' :
                    'text-gray-400 border-gray-400'
                  }`}
                >
                  {data.overallSentiment.toUpperCase()}
                </Badge>
              </div>
              
              {/* Stats */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-white/80">
                  <span>🟢 Bullish:</span>
                  <span className="font-bold">{data.bullishCount}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>🔴 Bearish:</span>
                  <span className="font-bold">{data.bearishCount}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>💪 Strength:</span>
                  <span className="font-bold">{data.averageStrength.toFixed(0)}%</span>
                </div>
              </div>

              {/* Strength Bar */}
              <div className="w-full bg-black/40 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    data.overallSentiment === 'bullish' 
                      ? 'bg-gradient-to-r from-green-500 to-blue-400' 
                      : data.overallSentiment === 'bearish'
                      ? 'bg-gradient-to-r from-red-500 to-rose-400'
                      : 'bg-gradient-to-r from-gray-500 to-slate-400'
                  }`}
                  style={{ width: `${data.averageStrength}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Signal Feed */}
      <Card className="terminal-crt-screen overflow-hidden bg-gradient-to-br from-black/90 via-gray-900/90 to-black/90 border-2 border-[#0066ff]/30 shadow-2xl">
        <div className="p-4 bg-gradient-to-r from-[#0066ff]/20 to-green-500/20 border-b-2 border-[#0066ff]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#0066ff] animate-pulse" />
              <h3 className="font-bold text-white text-lg">Live Feed from Crypto Twitter</h3>
            </div>
            {lastUpdate && (
              <div className="text-xs text-gray-400">
                Updated {formatTime(lastUpdate)} ago
              </div>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[600px]">
          <div className="p-4 space-y-3">
            {signals.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Twitter className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No signals available</p>
                <p className="text-sm mt-1">Check back soon for market insights</p>
              </div>
            ) : (
              signals.map((signal, index) => (
                <SocialSignalCard 
                  key={signal.id} 
                  signal={signal} 
                  index={index}
                  getSentimentIcon={getSentimentIcon}
                  getSentimentColor={getSentimentColor}
                  formatTime={formatTime}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}

// Social Signal Card Component
function SocialSignalCard({ 
  signal, 
  index, 
  getSentimentIcon, 
  getSentimentColor, 
  formatTime 
}: { 
  signal: SocialSignal; 
  index: number;
  getSentimentIcon: (sentiment: string) => JSX.Element;
  getSentimentColor: (sentiment: string) => string;
  formatTime: (date: Date) => string;
}) {
  return (
    <div
      className={`group p-4 rounded-xl bg-gradient-to-br ${getSentimentColor(signal.sentiment)} border-2 hover:scale-[1.02] transition-all cursor-pointer`}
      style={{ 
        animationDelay: `${index * 50}ms`,
        animation: 'fadeIn 0.3s ease-out forwards'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-500 flex items-center justify-center">
            <Twitter className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">@{signal.author}</span>
              <Badge variant="outline" className="text-[10px] px-1 py-0 text-gray-400 border-gray-400">
                {formatTime(signal.timestamp)}
              </Badge>
            </div>
            <div className="text-xs text-gray-400">Crypto Influencer</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className="bg-[#0066ff]/20 text-[#0066ff] border-[#0066ff]/30 text-xs">
            {signal.token}
          </Badge>
          <div className="flex items-center gap-1">
            {getSentimentIcon(signal.sentiment)}
          </div>
        </div>
      </div>
      
      {/* Tweet Text */}
      <p className="text-sm text-white mb-4 leading-relaxed">
        {signal.text}
      </p>
      
      {/* Engagement Metrics */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1 hover:text-red-400 transition-colors">
            <Heart className="h-4 w-4" />
            <span>{(signal.engagement.likes).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-green-400 transition-colors">
            <Repeat2 className="h-4 w-4" />
            <span>{(signal.engagement.retweets).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-blue-400 transition-colors">
            <MessageCircle className="h-4 w-4" />
            <span>{(signal.engagement.replies).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-400">
            Influence: <span className="text-[#0066ff] font-bold">{signal.influenceScore}</span>
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs ${
              signal.sentiment === 'bullish' ? 'text-green-400 border-green-400' :
              signal.sentiment === 'bearish' ? 'text-red-400 border-red-400' :
              'text-gray-400 border-gray-400'
            }`}
          >
            {signal.sentiment.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Signal Strength Bar */}
      {signal.strength > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-400">Signal Strength</span>
            <span className="text-[#0066ff] font-bold">{signal.strength}%</span>
          </div>
          <div className="w-full bg-black/60 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${
                signal.sentiment === 'bullish' 
                  ? 'bg-gradient-to-r from-green-500 to-blue-400' 
                  : signal.sentiment === 'bearish'
                  ? 'bg-gradient-to-r from-red-500 to-rose-400'
                  : 'bg-gradient-to-r from-gray-500 to-slate-400'
              }`}
              style={{ width: `${signal.strength}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

<style jsx>{`
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>

