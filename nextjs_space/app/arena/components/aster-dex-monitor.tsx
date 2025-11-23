
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  DollarSign,
  BarChart3,
  RefreshCw,
  PlayCircle,
  PauseCircle,
} from 'lucide-react';

interface AsterDexStatus {
  scheduler: {
    isRunning: boolean;
    useAsterDex: boolean;
    lastCycleTime: string | null;
    nextCycleTime: string | null;
    cyclesCompleted: number;
    successfulTrades: number;
    failedTrades: number;
  };
  account: {
    totalBalance: number;
    availableBalance: number;
    unrealizedPnL: number;
    positions: number;
  } | null;
  trades: {
    total: number;
    open: number;
    closed: number;
    totalPnL: number;
    recentTrades: Array<{
      id: string;
      agent: string;
      symbol: string;
      side: string;
      quantity: number;
      entryPrice: number;
      exitPrice: number | null;
      status: string;
      entryTime: string;
      exitTime: string | null;
      pnl: number | null;
    }>;
  };
}

export function AsterDexMonitor() {
  const [status, setStatus] = useState<AsterDexStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/aster-dex/status');
      if (!response.ok) throw new Error('Failed to fetch status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching AsterDEX status:', error);
      toast.error('Failed to fetch AsterDEX status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleScheduler = async () => {
    if (!status) return;

    try {
      setActionLoading(true);
      const action = status.scheduler.isRunning ? 'stop' : 'start';
      
      const response = await fetch('/api/ai/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, intervalMinutes: 15 }),
      });

      if (!response.ok) throw new Error('Failed to toggle scheduler');

      toast.success(
        status.scheduler.isRunning
          ? '⏸️ Trading paused'
          : '▶️ Trading activated!'
      );
      
      await fetchStatus();
    } catch (error) {
      console.error('Error toggling scheduler:', error);
      toast.error('Failed to toggle trading');
    } finally {
      setActionLoading(false);
    }
  };

  const runNow = async () => {
    try {
      setActionLoading(true);
      toast.loading('Executing trading cycle...', { id: 'trade-cycle' });
      
      const response = await fetch('/api/aster-dex/autonomous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error('Failed to execute trade cycle');
      
      const result = await response.json();
      toast.success(
        `✅ Cycle complete: ${result.summary.successful} trades, ${result.summary.holds} holds`,
        { id: 'trade-cycle' }
      );
      
      await fetchStatus();
    } catch (error) {
      console.error('Error running trade cycle:', error);
      toast.error('Failed to execute trade cycle', { id: 'trade-cycle' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="terminal-crt-screen border-blue-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2 text-muted-foreground">Loading AsterDEX status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card className="terminal-crt-screen border-red-500/20">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Failed to load AsterDEX status
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="terminal-crt-screen border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                AsterDEX 24/7 Trading
              </CardTitle>
              <CardDescription>
                Autonomous perpetuals trading on Astar zkEVM
              </CardDescription>
            </div>
            <Badge
              variant={status.scheduler.isRunning ? 'default' : 'outline'}
              className={
                status.scheduler.isRunning
                  ? 'bg-blue-500 text-white'
                  : 'text-muted-foreground'
              }
            >
              <Activity
                className={`mr-1 h-3 w-3 ${status.scheduler.isRunning ? 'animate-pulse' : ''}`}
              />
              {status.scheduler.isRunning ? 'ACTIVE' : 'PAUSED'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex gap-2">
            <Button
              onClick={toggleScheduler}
              disabled={actionLoading}
              variant={status.scheduler.isRunning ? 'outline' : 'default'}
              className="flex-1"
            >
              {status.scheduler.isRunning ? (
                <>
                  <PauseCircle className="mr-2 h-4 w-4" />
                  Pause Trading
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start Trading
                </>
              )}
            </Button>
            <Button onClick={runNow} disabled={actionLoading} variant="outline">
              <Zap className="mr-2 h-4 w-4" />
              Run Now
            </Button>
            <Button onClick={fetchStatus} disabled={refreshing} variant="ghost" size="icon">
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Scheduler Info */}
          {status.scheduler.isRunning && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Last Cycle</div>
                <div className="font-medium">
                  {status.scheduler.lastCycleTime
                    ? new Date(status.scheduler.lastCycleTime).toLocaleTimeString()
                    : 'Never'}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Next Cycle</div>
                <div className="font-medium">
                  {status.scheduler.nextCycleTime
                    ? new Date(status.scheduler.nextCycleTime).toLocaleTimeString()
                    : 'Not scheduled'}
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 rounded-2xl bg-muted/50 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{status.scheduler.cyclesCompleted}</div>
              <div className="text-xs text-muted-foreground">Cycles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {status.scheduler.successfulTrades}
              </div>
              <div className="text-xs text-muted-foreground">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {status.scheduler.failedTrades}
              </div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      {status.account && (
        <Card className="terminal-crt-screen">
          <CardHeader>
            <CardTitle className="text-sm">Account Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-muted-foreground text-sm">Total Balance</div>
                <div className="text-xl font-bold">
                  ${status.account.totalBalance.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm">Available</div>
                <div className="text-xl font-bold">
                  ${status.account.availableBalance.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm">Unrealized PnL</div>
                <div
                  className={`text-xl font-bold ${
                    status.account.unrealizedPnL >= 0 ? 'text-blue-500' : 'text-red-500'
                  }`}
                >
                  {status.account.unrealizedPnL >= 0 ? '+' : ''}
                  ${status.account.unrealizedPnL.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm">Open Positions</div>
                <div className="text-xl font-bold">{status.account.positions}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Trades */}
      <Card className="terminal-crt-screen">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Recent Trades</CardTitle>
            <Badge variant="outline">
              {status.trades.total} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {status.trades.recentTrades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No trades yet. Agents will start trading once funded.
              </div>
            ) : (
              status.trades.recentTrades.slice(0, 10).map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between rounded-2xl border p-3 text-sm"
                >
                  <div className="flex-1">
                    <div className="font-medium">{trade.agent}</div>
                    <div className="text-xs text-muted-foreground">
                      {trade.symbol} • {new Date(trade.entryTime).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={trade.side === 'BUY' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {trade.side === 'BUY' ? (
                        <TrendingUp className="mr-1 h-3 w-3" />
                      ) : (
                        <TrendingDown className="mr-1 h-3 w-3" />
                      )}
                      {trade.side}
                    </Badge>
                    <div className="text-right">
                      <div className="font-medium">
                        ${trade.entryPrice.toFixed(2)}
                      </div>
                      {trade.pnl !== null && (
                        <div
                          className={`text-xs ${
                            trade.pnl >= 0 ? 'text-blue-500' : 'text-red-500'
                          }`}
                        >
                          {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {trade.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
