
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Activity, Wallet } from 'lucide-react';

interface TreasuryOverviewProps {
  refreshInterval?: number;
}

export function TreasuryOverview({ refreshInterval = 60000 }: TreasuryOverviewProps) {
  const [treasury, setTreasury] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTreasury = async () => {
    try {
      const response = await fetch('/api/stats/comprehensive');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTreasury(data.treasury);
        }
      }
    } catch (error) {
      console.error('Failed to fetch treasury:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreasury();
    const interval = setInterval(fetchTreasury, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) {
    return (
      <Card className="terminal-crt-screen premium-card">
        <CardHeader>
          <CardTitle>Treasury Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-[#3385ff]/10 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  if (!treasury) {
    return null;
  }

  const networks = [
    { name: 'Base', balance: treasury.balance.base, color: 'text-blue-500' },
    { name: 'BSC', balance: treasury.balance.bsc, color: 'text-blue-400' },
    { name: 'Ethereum', balance: treasury.balance.ethereum, color: 'text-blue-500' },
    { name: 'Solana', balance: treasury.balance.solana, color: 'text-[#3385ff]' }
  ];

  return (
    <Card className="terminal-crt-screen premium-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#3385ff]" />
          Treasury Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Balance */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#3385ff]/10 to-[#0047b3]/10 border border-[#3385ff]/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-[#3385ff]" />
              <span className="text-sm text-gray-400 font-medium">Total Treasury Balance</span>
            </div>
            <p className="text-3xl font-bold text-[#3385ff]">
              ${treasury.balance.total.toFixed(2)}
            </p>
          </div>

          {/* Network Balances */}
          <div className="grid grid-cols-2 gap-3">
            {networks.map((network) => (
              <div key={network.name} className="p-4 rounded-2xl bg-black/30 border border-[#3385ff]/10">
                <div className="text-xs text-gray-400 mb-1">{network.name}</div>
                <div className={`text-lg font-bold ${network.color}`}>
                  ${network.balance.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#3385ff]/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-[#3385ff]" />
                <span className="text-xs text-gray-400">Total Received</span>
              </div>
              <p className="text-lg font-bold text-white">
                ${treasury.totalReceived?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-400">Transactions</span>
              </div>
              <p className="text-lg font-bold text-white">
                {treasury.totalTransactions || 0}
              </p>
            </div>
          </div>

          {/* Profit Share */}
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <div className="text-xs text-blue-400 mb-1">Profit Share Percentage</div>
            <div className="text-2xl font-bold text-blue-500">
              {treasury.profitSharePercentage}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
