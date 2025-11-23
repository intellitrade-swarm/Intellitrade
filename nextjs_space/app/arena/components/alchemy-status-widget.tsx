
/**
 * Alchemy Integration Status Widget
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Zap, TrendingUp, Shield, Activity } from 'lucide-react';

interface AlchemyStatus {
  configured: boolean;
  status: string;
  chains: string[];
  features: string[];
  currentBlockNumber: number | null;
}

export function AlchemyStatusWidget() {
  const [status, setStatus] = useState<AlchemyStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/alchemy/status');
      const data = await response.json();
      
      if (data.success) {
        setStatus({
          configured: data.configured,
          status: data.status,
          chains: data.chains || [],
          features: data.features || [],
          currentBlockNumber: data.currentBlockNumber,
        });
      }
    } catch (error) {
      console.error('Error fetching Alchemy status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="terminal-crt-screen border-muted bg-card/50 backdrop-blur">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!status?.configured) {
    return (
      <Card className="terminal-crt-screen border-red-500/20 bg-red-500/5">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg">Alchemy Not Configured</CardTitle>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="terminal-crt-screen border-green-500/20 bg-gradient-to-br from-green-500/5 to-blue-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">Alchemy Enhanced Trading</CardTitle>
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
            <Activity className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
        <CardDescription className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-blue-400" />
          <span>99.99% uptime • Real-time data streaming</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Supported Chains */}
        <div>
          <div className="text-sm font-medium mb-2 flex items-center space-x-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>Supported Chains</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {status.chains.map((chain) => (
              <Badge key={chain} variant="secondary" className="capitalize">
                {chain}
              </Badge>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <div className="text-sm font-medium mb-2 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>Enhanced Features</span>
          </div>
          <div className="space-y-1">
            {status.features.slice(0, 4).map((feature, index) => (
              <div key={index} className="text-xs text-muted-foreground flex items-center space-x-2">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Block */}
        {status.currentBlockNumber && (
          <div className="pt-3 border-t border-border/50">
            <div className="text-xs text-muted-foreground">
              Current Block: <span className="font-mono text-foreground">{status.currentBlockNumber.toLocaleString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
