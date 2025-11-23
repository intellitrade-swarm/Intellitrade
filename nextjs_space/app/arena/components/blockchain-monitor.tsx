
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { Activity, Zap, TrendingUp, AlertCircle } from 'lucide-react';

interface ChainHealth {
  chain: string;
  chainId: number;
  blockNumber: number;
  gasPrice: string;
  status: 'healthy' | 'error';
  error?: string;
  rpcUrl: string;
}

interface BlockchainHealthData {
  chains: ChainHealth[];
  timestamp: string;
  overallStatus: 'healthy' | 'degraded';
}

export function BlockchainMonitor() {
  const [healthData, setHealthData] = useState<BlockchainHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealthData();
    
    // Refresh every 15 seconds
    const interval = setInterval(fetchHealthData, 60000); // Optimized to 60 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/blockchain/health');
      if (!response.ok) {
        throw new Error('Failed to fetch blockchain health');
      }
      const data = await response.json();
      setHealthData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="terminal-crt-screen bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Blockchain Network Status
          </CardTitle>
          <CardDescription className="text-slate-400">
            Monitoring Base, BSC, and Ethereum
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="terminal-crt-screen bg-gradient-to-br from-red-900/20 to-slate-800 border-red-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Blockchain Status Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="terminal-crt-screen bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Blockchain Network Status
            </CardTitle>
            <CardDescription className="text-slate-400">
              Real-time price feeds from on-chain oracles
            </CardDescription>
          </div>
          <Badge 
            variant={healthData?.overallStatus === 'healthy' ? 'default' : 'destructive'}
            className={healthData?.overallStatus === 'healthy' 
              ? 'bg-green-500/20 text-green-400 border-green-500/50' 
              : 'bg-red-500/20 text-red-400 border-red-500/50'
            }
          >
            {healthData?.overallStatus === 'healthy' ? '● Online' : '● Degraded'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {healthData?.chains.map((chain) => (
          <div
            key={chain.chain}
            className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  chain.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                } animate-pulse`} />
                <h3 className="font-semibold text-white">{chain.chain}</h3>
                <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
                  Chain ID: {chain.chainId}
                </Badge>
              </div>
              <span className="text-xs text-slate-500">{chain.rpcUrl}</span>
            </div>
            
            {chain.status === 'healthy' ? (
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span className="text-slate-400">Block:</span>
                  <span className="text-white font-mono">
                    {chain.blockNumber.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-blue-300" />
                  <span className="text-slate-400">Gas:</span>
                  <span className="text-white font-mono">
                    {parseFloat(chain.gasPrice).toFixed(2)} Gwei
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-red-400 mt-2">
                {chain.error || 'Connection error'}
              </div>
            )}
          </div>
        ))}
        
        <div className="text-xs text-slate-500 text-center mt-4">
          Last updated: {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : 'N/A'}
        </div>
      </CardContent>
    </Card>
  );
}
