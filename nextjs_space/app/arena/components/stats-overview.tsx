
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Activity, Target, Zap } from 'lucide-react';

interface StatsOverviewProps {
  refreshInterval?: number;
}

export function StatsOverview({ refreshInterval = 60000 }: StatsOverviewProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats/comprehensive');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="premium-card animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-[#3385ff]/10 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats || !stats.success) {
    return null;
  }

  const { overview, treasury } = stats;

  const statCards = [
    {
      title: 'Total P&L',
      value: `$${overview.totalPnL?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: overview.totalPnL >= 0 ? 'text-[#3385ff]' : 'text-red-500',
      bgColor: overview.totalPnL >= 0 ? 'bg-[#3385ff]/10' : 'bg-red-500/10'
    },
    {
      title: 'Realized P&L',
      value: `$${overview.realizedPnL?.toFixed(2) || '0.00'}`,
      icon: TrendingUp,
      color: overview.realizedPnL >= 0 ? 'text-[#3385ff]' : 'text-red-500',
      bgColor: overview.realizedPnL >= 0 ? 'bg-[#3385ff]/10' : 'bg-red-500/10'
    },
    {
      title: 'Open P&L',
      value: `$${overview.unrealizedPnL?.toFixed(2) || '0.00'}`,
      icon: Activity,
      color: overview.unrealizedPnL >= 0 ? 'text-[#3385ff]' : 'text-red-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Win Rate',
      value: `${overview.winRate?.toFixed(1) || '0.0'}%`,
      icon: Target,
      color: 'text-[#3385ff]',
      bgColor: 'bg-[#3385ff]/10'
    },
    {
      title: 'Active Trades',
      value: overview.openTrades || 0,
      icon: Zap,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      title: 'Treasury',
      value: `$${treasury.balance.total?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="premium-card border-[#3385ff]/20 hover:border-[#3385ff]/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-2xl ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400 font-medium">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
