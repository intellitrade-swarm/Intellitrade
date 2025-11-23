
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Activity, Clock, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface SchedulerStatus {
  isRunning: boolean;
  lastCycleTime: Date | null;
  nextCycleTime: Date | null;
  cyclesCompleted: number;
  successfulTrades: number;
  failedTrades: number;
  totalTradesAttempted: number;
}

// Helper hook to format time on client-side only to prevent hydration mismatch
function useClientTime(date: Date | string | null) {
  const [formattedTime, setFormattedTime] = useState<string>('');
  
  useEffect(() => {
    if (date) {
      setFormattedTime(new Date(date).toLocaleTimeString());
    }
  }, [date]);
  
  return formattedTime;
}

export function AutonomousTradingPanel() {
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(15);
  
  // Format times on client-side only
  const lastCycleTime = useClientTime(status?.lastCycleTime || null);
  const nextCycleTime = useClientTime(status?.nextCycleTime || null);

  // Fetch scheduler status
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/ai/scheduler');
      const data = await response.json();
      if (data.success) {
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching scheduler status:', error);
    }
  };

  // Start scheduler
  const startScheduler = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', intervalMinutes }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('24/7 Trading Activated', {
          description: `Agents will trade automatically every ${intervalMinutes} minutes`,
        });
        setStatus(data.status);
      } else {
        toast.error('Failed to start trading', {
          description: data.error || 'Unknown error',
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to start scheduler',
      });
    } finally {
      setLoading(false);
    }
  };

  // Stop scheduler
  const stopScheduler = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('24/7 Trading Stopped', {
          description: 'Autonomous trading has been paused',
        });
        setStatus(data.status);
      } else {
        toast.error('Failed to stop trading', {
          description: data.error || 'Unknown error',
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to stop scheduler',
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle scheduler
  const toggleScheduler = async () => {
    if (status?.isRunning) {
      await stopScheduler();
    } else {
      await startScheduler();
    }
  };

  // Run single cycle manually
  const runSingleCycle = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/autonomous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runAll: true }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Trading Cycle Complete', {
          description: `${data.summary.successful} trades executed, ${data.summary.held} held`,
        });
        await fetchStatus();
      } else {
        toast.error('Trading cycle failed', {
          description: data.error || 'Unknown error',
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to run cycle',
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh status
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const successRate = status && status.totalTradesAttempted > 0
    ? ((status.successfulTrades / status.totalTradesAttempted) * 100).toFixed(1)
    : '0.0';

  return (
    <Card className="terminal-crt-screen border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Activity className="h-5 w-5" />
              24/7 Autonomous Trading
            </CardTitle>
            <CardDescription>
              Agents automatically scan and trade every {intervalMinutes} minutes
            </CardDescription>
          </div>
          <Badge
            variant={status?.isRunning ? 'default' : 'secondary'}
            className={status?.isRunning ? 'bg-blue-500 hover:bg-blue-600' : ''}
          >
            {status?.isRunning ? (
              <>
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                ACTIVE
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 mr-1" />
                PAUSED
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Master Switch */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-emerald-200">
            <div className="space-y-1">
              <Label htmlFor="auto-trading" className="text-sm font-medium">
                Continuous Trading
              </Label>
              <p className="text-xs text-muted-foreground">
                Enable 24/7 automatic trading
              </p>
            </div>
            <Switch
              id="auto-trading"
              checked={status?.isRunning || false}
              onCheckedChange={toggleScheduler}
              disabled={loading}
            />
          </div>

          {/* Interval Selector */}
          <div className="p-4 bg-white rounded-2xl border border-emerald-200">
            <Label className="text-sm font-medium mb-2 block">
              Trading Interval
            </Label>
            <Select
              value={intervalMinutes.toString()}
              onValueChange={(value) => setIntervalMinutes(Number(value))}
              disabled={status?.isRunning || loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Every 5 minutes</SelectItem>
                <SelectItem value="10">Every 10 minutes</SelectItem>
                <SelectItem value="15">Every 15 minutes</SelectItem>
                <SelectItem value="30">Every 30 minutes</SelectItem>
                <SelectItem value="60">Every 1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Statistics */}
        {status && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-2xl border border-emerald-200">
              <div className="text-2xl font-bold text-blue-600">{status.cyclesCompleted}</div>
              <div className="text-xs text-muted-foreground">Total Cycles</div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-emerald-200">
              <div className="text-2xl font-bold text-green-600">{status.successfulTrades}</div>
              <div className="text-xs text-muted-foreground">Successful Trades</div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-emerald-200">
              <div className="text-2xl font-bold text-red-600">{status.failedTrades}</div>
              <div className="text-xs text-muted-foreground">Failed Trades</div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-emerald-200">
              <div className="text-2xl font-bold text-blue-600">{successRate}%</div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
          </div>
        )}

        {/* Cycle Information */}
        {status && status.isRunning && (
          <div className="space-y-2">
            {status.lastCycleTime && lastCycleTime && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>
                  Last cycle: {lastCycleTime}
                </span>
              </div>
            )}
            {status.nextCycleTime && nextCycleTime && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>
                  Next cycle: {nextCycleTime}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Manual Actions */}
        <div className="flex gap-3">
          <Button
            onClick={runSingleCycle}
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-2" />
            Run Single Cycle Now
          </Button>

          <Button
            onClick={fetchStatus}
            disabled={loading}
            variant="outline"
          >
            <Activity className="h-4 w-4" />
          </Button>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-2xl">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">How It Works:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Agents scan market data from multiple sources</li>
              <li>AI analyzes opportunities and generates signals</li>
              <li>Trades execute automatically when confidence &gt; 65%</li>
              <li>Risk management prevents excessive losses</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
