
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Clock,
  Target,
  Zap,
  AlertCircle
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'trade' | 'signal' | 'alert' | 'analysis';
  agentName: string;
  action: string;
  symbol?: string;
  value?: number;
  timestamp: Date;
  status: 'success' | 'pending' | 'failed';
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      // Fetch recent trades
      const tradesRes = await fetch('/api/trades/recent?limit=10');
      if (tradesRes.ok) {
        const trades = await tradesRes.json();
        
        const tradeActivities: ActivityItem[] = trades.map((trade: any) => ({
          id: `trade-${trade.id}`,
          type: 'trade' as const,
          agentName: trade.agent?.name || 'Unknown Agent',
          action: trade.type === 'BUY' ? 'Bought' : 'Sold',
          symbol: trade.symbol,
          value: Math.abs(trade.profitLoss || 0),
          timestamp: new Date(trade.entryTime || Date.now()),
          status: trade.status === 'CLOSED' ? 'success' : 'pending'
        }));

        setActivities(tradeActivities);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'trade': return <DollarSign className="h-4 w-4" />;
      case 'signal': return <Target className="h-4 w-4" />;
      case 'alert': return <AlertCircle className="h-4 w-4" />;
      case 'analysis': return <Zap className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  };

  const getValueIcon = (action: string) => {
    if (action.includes('Bought') || action.includes('Long')) {
      return <TrendingUp className="h-3 w-3 text-green-400" />;
    }
    if (action.includes('Sold') || action.includes('Short')) {
      return <TrendingDown className="h-3 w-3 text-red-400" />;
    }
    return null;
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Card className="bg-black/60 backdrop-blur border-blue-500/20 h-full">
      <CardHeader className="pb-3 border-b border-blue-500/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-blue-100 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400 animate-pulse" />
            Live Activity
          </CardTitle>
          <Badge variant="outline" className="border-green-500/50 text-green-400 text-xs">
            <span className="inline-block h-2 w-2 rounded-full bg-green-400 mr-1 animate-pulse" />
            LIVE
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-blue-400 animate-pulse mx-auto mb-2" />
                  <p className="text-sm text-blue-300/60">Loading activities...</p>
                </div>
              </div>
            ) : activities.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-blue-400/40 mx-auto mb-2" />
                  <p className="text-sm text-blue-300/60">No recent activity</p>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-xl border ${getStatusColor(activity.status)} hover:bg-blue-500/5 transition-all`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-blue-100 truncate">
                              {activity.agentName}
                            </p>
                            {getValueIcon(activity.action)}
                          </div>
                          
                          <p className="text-xs text-blue-300/80 mb-1">
                            {activity.action}
                            {activity.symbol && (
                              <span className="font-bold text-blue-200 ml-1">
                                {activity.symbol}
                              </span>
                            )}
                          </p>
                          
                          {activity.value !== undefined && activity.value !== 0 && (
                            <p className={`text-xs font-bold ${
                              activity.value >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {activity.value >= 0 ? '+' : ''}${activity.value.toFixed(2)}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-1 mt-1 text-xs text-blue-300/40">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(activity.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
