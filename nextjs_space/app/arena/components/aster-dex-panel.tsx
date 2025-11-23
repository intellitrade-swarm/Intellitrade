
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface AsterDexStatus {
  enabled: boolean;
  description: string;
  markets: string[];
  features: string[];
}

interface Position {
  market: string;
  side: 'LONG' | 'SHORT';
  size: string;
  collateral: string;
  entryPrice: string;
  leverage: number;
  unrealizedPnL?: number;
}

export function AsterDexPanel() {
  const [status, setStatus] = useState<AsterDexStatus | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);

  // Fetch AsterDEX status
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/aster-dex/autonomous');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Error fetching AsterDEX status:', error);
    }
  };

  // Fetch positions
  const fetchPositions = async () => {
    try {
      // This would fetch all open positions for all agents
      // For now, we'll show a placeholder
      setPositions([]);
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchPositions();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStatus();
      fetchPositions();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Execute trading cycle
  const executeTradingCycle = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/aster-dex/autonomous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Trading cycle completed', {
          description: `${data.summary.successful} trades executed successfully`,
        });
        fetchPositions();
      } else {
        const error = await response.json();
        toast.error('Trading cycle failed', {
          description: error.error,
        });
      }
    } catch (error) {
      console.error('Error executing trading cycle:', error);
      toast.error('Failed to execute trading cycle');
    } finally {
      setLoading(false);
    }
  };

  // Toggle AsterDEX mode
  const toggleMode = async (enabled: boolean) => {
    try {
      const response = await fetch('/api/ai/scheduler', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useAsterDex: enabled }),
      });

      if (response.ok) {
        setIsEnabled(enabled);
        toast.success(`AsterDEX ${enabled ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error toggling AsterDEX:', error);
      toast.error('Failed to toggle AsterDEX mode');
    }
  };

  if (!status) {
    return (
      <Card className="terminal-crt-screen border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="terminal-crt-screen border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">AsterDEX Perpetuals</CardTitle>
                <CardDescription className="mt-1">{status.description}</CardDescription>
              </div>
            </div>
            <Badge variant={isEnabled ? "default" : "secondary"} className="px-3 py-1">
              {isEnabled ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  Inactive
                </>
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Trading Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-500" />
              <div>
                <Label className="font-semibold">Perpetuals Trading</Label>
                <p className="text-sm text-muted-foreground">
                  Use leveraged positions for AI agents
                </p>
              </div>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={toggleMode}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              onClick={executeTradingCycle}
              disabled={loading || !isEnabled}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Execute Cycle Now
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                fetchStatus();
                fetchPositions();
              }}
              className="border-blue-500/20"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Markets */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-500" />
              Available Markets
            </h4>
            <div className="flex flex-wrap gap-2">
              {status.markets.map((market) => (
                <Badge
                  key={market}
                  variant="secondary"
                  className="bg-blue-500/10 text-blue-500 border-blue-500/20"
                >
                  {market}
                </Badge>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-3">Key Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {status.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm p-2 rounded-2xl bg-muted/50"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Open Positions */}
      {positions.length > 0 && (
        <Card className="terminal-crt-screen border-2 border-blue-500/20">
          <CardHeader>
            <CardTitle>Open Positions</CardTitle>
            <CardDescription>Active perpetual positions across all agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {positions.map((position, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-2xl border border-muted-foreground/20 bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-2xl ${
                      position.side === 'LONG' 
                        ? 'bg-green-500/10 border border-green-500/20' 
                        : 'bg-red-500/10 border border-red-500/20'
                    }`}>
                      {position.side === 'LONG' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{position.market}</p>
                      <p className="text-sm text-muted-foreground">
                        {position.side} {position.leverage}x
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${position.collateral}</p>
                    <p className="text-sm text-muted-foreground">
                      Entry: ${position.entryPrice}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Banner */}
      <Card className="terminal-crt-screen border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-sm">Astar zkEVM Network</p>
              <p className="text-sm text-muted-foreground">
                Agents trade perpetual futures on Astar zkEVM with 2-5x leverage. 
                Positions are automatically managed based on AI signals and PnL thresholds.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
