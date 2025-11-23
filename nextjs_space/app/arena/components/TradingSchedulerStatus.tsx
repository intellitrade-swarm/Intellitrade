
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Play, Square, RefreshCw, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface SchedulerStatus {
  isRunning: boolean;
  useAsterDex: boolean;
  lastCycleTime: string | null;
  nextCycleTime: string | null;
  cyclesCompleted: number;
  successfulTrades: number;
  failedTrades: number;
  totalTradesAttempted: number;
}

export function TradingSchedulerStatus() {
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/trading/scheduler');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.scheduler);
      }
    } catch (error) {
      console.error('Error fetching scheduler status:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    setActionLoading(action);
    try {
      const response = await fetch('/api/trading/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, intervalMinutes: 15 }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        await fetchStatus();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to ' + action + ' scheduler');
    } finally {
      setActionLoading(null);
    }
  };

  if (!status) {
    return (
      <Card className="terminal-crt-screen p-4 bg-muted/30">
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading scheduler status...</span>
        </div>
      </Card>
    );
  }

  const successRate = status.totalTradesAttempted > 0
    ? ((status.successfulTrades / status.totalTradesAttempted) * 100).toFixed(1)
    : '0';

  return (
    <Card className="terminal-crt-screen p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-2xl ${status.isRunning ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
              <TrendingUp className={`h-5 w-5 ${status.isRunning ? 'text-green-500' : 'text-gray-500'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">24/7 Trading Scheduler</h3>
              <p className="text-sm text-muted-foreground">
                {status.useAsterDex ? 'AsterDEX Perpetuals (Leveraged)' : 'Regular DEX (Spot)'}
              </p>
            </div>
          </div>
          <Badge variant={status.isRunning ? 'default' : 'secondary'} className={status.isRunning ? 'bg-green-500' : ''}>
            {status.isRunning ? 'ACTIVE' : 'STOPPED'}
          </Badge>
        </div>

        {/* Stats */}
        {status.isRunning && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-background/50 rounded-2xl p-3">
              <div className="text-xs text-muted-foreground mb-1">Cycles</div>
              <div className="text-2xl font-bold">{status.cyclesCompleted}</div>
            </div>
            <div className="bg-background/50 rounded-2xl p-3">
              <div className="text-xs text-muted-foreground mb-1">Success</div>
              <div className="text-2xl font-bold text-green-500">{status.successfulTrades}</div>
            </div>
            <div className="bg-background/50 rounded-2xl p-3">
              <div className="text-xs text-muted-foreground mb-1">Failed</div>
              <div className="text-2xl font-bold text-red-500">{status.failedTrades}</div>
            </div>
            <div className="bg-background/50 rounded-2xl p-3">
              <div className="text-xs text-muted-foreground mb-1">Success Rate</div>
              <div className="text-2xl font-bold">{successRate}%</div>
            </div>
          </div>
        )}

        {/* Timing */}
        {status.isRunning && status.nextCycleTime && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-background/50 rounded-2xl p-3">
            <Clock className="h-4 w-4" />
            <span>Next cycle: {new Date(status.nextCycleTime).toLocaleTimeString()}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {!status.isRunning ? (
            <Button
              onClick={() => handleAction('start')}
              disabled={actionLoading === 'start'}
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              {actionLoading === 'start' ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Trading
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={() => handleAction('restart')}
                disabled={!!actionLoading}
                variant="outline"
                className="flex-1"
              >
                {actionLoading === 'restart' ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Restarting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Restart
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleAction('stop')}
                disabled={!!actionLoading}
                variant="destructive"
                className="flex-1"
              >
                {actionLoading === 'stop' ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Stopping...
                  </>
                ) : (
                  <>
                    <Square className="mr-2 h-4 w-4" />
                    Stop Trading
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Warning */}
        {!status.isRunning && (
          <div className="flex items-start space-x-2 text-sm text-blue-400 bg-blue-400/10 rounded-2xl p-3">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              Trading scheduler is stopped. Agents will not trade automatically until you start it.
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
