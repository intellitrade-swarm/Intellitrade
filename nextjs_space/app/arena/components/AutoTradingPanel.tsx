
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { PlayIcon, PauseIcon, RefreshCcw, TrendingUp, Activity, DollarSign, Zap, Clock } from 'lucide-react';

interface AutoTradingPanelProps {
  agents: any[];
  onRefresh?: () => void;
}

export default function AutoTradingPanel({ agents, onRefresh }: AutoTradingPanelProps) {
  const [isTrading, setIsTrading] = useState(false);
  const [tradingStatus, setTradingStatus] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [continuousTrading, setContinuousTrading] = useState(false);
  const [nextScanCountdown, setNextScanCountdown] = useState(0);
  const [totalScans, setTotalScans] = useState(0);
  const [successfulTrades, setSuccessfulTrades] = useState(0);
  
  const tradingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter agents with real balance
  const tradingAgents = agents.filter(a => a.realBalance > 0);
  
  // Trading interval in seconds (5 minutes between scans for real trading)
  const TRADING_INTERVAL = 300;

  // Continuous trading effect
  useEffect(() => {
    if (continuousTrading && tradingAgents.length > 0) {
      // Start countdown
      setNextScanCountdown(TRADING_INTERVAL);
      
      // Run immediately on enable
      runTradingCycle(true);
      
      // Set up trading interval
      tradingIntervalRef.current = setInterval(() => {
        runTradingCycle(true);
      }, TRADING_INTERVAL * 1000);
      
      // Set up countdown interval
      countdownIntervalRef.current = setInterval(() => {
        setNextScanCountdown(prev => {
          if (prev <= 1) {
            return TRADING_INTERVAL;
          }
          return prev - 1;
        });
      }, 1000);
      
      toast.success('🚀 Continuous trading enabled!', {
        description: `Agents will scan markets every ${Math.floor(TRADING_INTERVAL / 60)} minutes`
      });
    } else {
      // Clean up intervals
      if (tradingIntervalRef.current) {
        clearInterval(tradingIntervalRef.current);
        tradingIntervalRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setNextScanCountdown(0);
    }
    
    // Cleanup on unmount
    return () => {
      if (tradingIntervalRef.current) {
        clearInterval(tradingIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [continuousTrading, tradingAgents.length]);

  async function executeSingleTrade(agentId: string) {
    try {
      setIsTrading(true);
      setSelectedAgent(agentId);

      const agent = agents.find(a => a.id === agentId);
      toast.info(`🤖 ${agent?.name} is analyzing markets...`);

      const response = await fetch('/api/ai/auto-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`✅ Trade executed for ${agent?.name}!`, {
          description: `${result.signal.action} ${result.signal.symbol} with ${(result.signal.confidence * 100).toFixed(0)}% confidence`
        });
        
        if (onRefresh) onRefresh();
      } else {
        toast.info(`ℹ️ ${agent?.name}: ${result.reason}`);
      }

      setTradingStatus(result);

    } catch (error) {
      console.error('Error executing trade:', error);
      toast.error('Failed to execute trade');
    } finally {
      setIsTrading(false);
      setSelectedAgent(null);
    }
  }

  async function runTradingCycle(isContinuous: boolean = false) {
    try {
      setIsTrading(true);
      if (!isContinuous) {
        toast.info('🚀 Starting market scan and trading cycle...');
      }

      const response = await fetch('/api/ai/auto-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runAll: true })
      });

      const result = await response.json();

      if (result.success) {
        const successCount = result.results.filter((r: any) => r.success).length;
        const totalCount = result.results.length;

        // Update stats
        setTotalScans(prev => prev + 1);
        setSuccessfulTrades(prev => prev + successCount);

        if (!isContinuous || successCount > 0) {
          toast.success(`✅ Market scan completed!`, {
            description: `${successCount}/${totalCount} profitable trades executed`
          });
        }

        setTradingStatus(result);
        if (onRefresh) onRefresh();
      } else {
        if (!isContinuous) {
          toast.error('Failed to run trading cycle');
        }
      }

    } catch (error) {
      console.error('Error running trading cycle:', error);
      if (!isContinuous) {
        toast.error('Failed to run trading cycle');
      }
    } finally {
      setIsTrading(false);
    }
  }
  
  function toggleContinuousTrading() {
    if (continuousTrading) {
      // Stopping
      toast.info('⏸️ Continuous trading paused');
    }
    setContinuousTrading(!continuousTrading);
  }



  return (
    <Card className="terminal-crt-screen">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Automated Trading
          </span>
          <div className="flex items-center gap-2">
            {continuousTrading && (
              <Badge variant="default" className="bg-green-600 animate-pulse">
                <Zap className="h-3 w-3 mr-1" />
                LIVE
              </Badge>
            )}
            <Badge variant="outline">
              {tradingAgents.length} Active
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          AI-powered automated trading using real-time market analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Real Trading Mode Banner */}
        <div className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-500/50 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💰</div>
            <div className="flex-1">
              <div className="font-bold text-green-600 dark:text-green-400 mb-1">
                Real Trading Mode Active
              </div>
              <p className="text-sm text-muted-foreground">
                Trading with <strong>real crypto</strong> on Base network via 1inch DEX aggregator. 
                All trades are executed on-chain with actual blockchain transactions. 
                AI agents manage your real assets autonomously!
              </p>
            </div>
          </div>
        </div>
        
        {/* Continuous Trading Control */}
        <div className={`p-4 border-2 rounded-2xl transition-all ${
          continuousTrading 
            ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500' 
            : 'bg-gradient-to-r from-blue-500/10 to-blue-500/10 border-border'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <div className="font-semibold flex items-center gap-2">
                <Zap className={`h-4 w-4 ${continuousTrading ? 'text-green-600 animate-pulse' : 'text-blue-500'}`} />
                Continuous Trading
              </div>
              <p className="text-sm text-muted-foreground">
                {continuousTrading 
                  ? `Auto-scanning markets every ${Math.floor(TRADING_INTERVAL / 60)} minutes for profitable opportunities` 
                  : 'Enable to automatically scan and trade 24/7'}
              </p>
            </div>
            <Switch
              checked={continuousTrading}
              onCheckedChange={toggleContinuousTrading}
              disabled={isTrading}
            />
          </div>
          
          {continuousTrading && (
            <div className="grid grid-cols-3 gap-3 pt-3 border-t">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Next Scan</div>
                <div className="text-lg font-bold flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.floor(nextScanCountdown / 60)}:{(nextScanCountdown % 60).toString().padStart(2, '0')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Total Scans</div>
                <div className="text-lg font-bold text-blue-600">{totalScans}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Trades</div>
                <div className="text-lg font-bold text-green-600">{successfulTrades}</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Manual Trading Cycle */}
        <div className="flex items-center justify-between p-4 border rounded-2xl bg-gradient-to-r from-blue-500/10 to-blue-500/10">
          <div className="flex-1">
            <div className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Manual Trading Scan
            </div>
            <p className="text-sm text-muted-foreground">
              Execute one-time AI analysis and trading for all {tradingAgents.length} agents
            </p>
          </div>
          <Button
            onClick={() => runTradingCycle(false)}
            disabled={isTrading || continuousTrading}
            size="sm"
            className="ml-4"
          >
            {isTrading ? (
              <>
                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-2" />
                Scan Now
              </>
            )}
          </Button>
        </div>

        {/* Last Trading Status */}
        {tradingStatus && (
          <div className="p-3 border rounded-2xl bg-muted/50 space-y-2">
            <h4 className="text-sm font-semibold">Last Trading Result</h4>
            {tradingStatus.results ? (
              <div className="space-y-1">
                {tradingStatus.results.map((result: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-xs flex items-center justify-between">
                      <span>{result.agentName}</span>
                      <Badge variant={result.success ? "default" : "secondary"} className="text-xs">
                        {result.success ? '✅ Traded' : '❌ Skipped'}
                      </Badge>
                    </div>
                    {result.needsFunding && (
                      <div className="text-xs bg-blue-400/10 border border-blue-400/20 rounded p-2">
                        <div className="font-semibold text-blue-500 dark:text-blue-300">⚠️ Wallet Needs Funding</div>
                        <div className="text-muted-foreground mt-1">
                          <div>On-Chain: ${result.onChainBalance?.toFixed(2) || '0.00'} USDC</div>
                          <div className="text-xs font-mono mt-1 break-all">{result.walletAddress}</div>
                        </div>
                      </div>
                    )}
                    {!result.needsFunding && !result.success && (
                      <div className="text-xs text-muted-foreground ml-2">
                        {result.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={tradingStatus.success ? "default" : "secondary"}>
                    {tradingStatus.success ? 'Success' : 'Skipped'}
                  </Badge>
                </div>
                {tradingStatus.needsFunding && (
                  <div className="mt-2 bg-blue-400/10 border border-blue-400/20 rounded p-2">
                    <div className="font-semibold text-blue-500 dark:text-blue-300">⚠️ Wallet Needs Funding</div>
                    <div className="text-muted-foreground mt-1">
                      <div>On-Chain: ${tradingStatus.onChainBalance?.toFixed(2) || '0.00'} USDC</div>
                      <div className="text-xs font-mono mt-1 break-all">{tradingStatus.walletAddress}</div>
                    </div>
                  </div>
                )}
                {tradingStatus.reason && !tradingStatus.needsFunding && (
                  <div className="mt-2 text-muted-foreground">
                    Reason: {tradingStatus.reason}
                  </div>
                )}
                {tradingStatus.signal && (
                  <>
                    <div className="flex justify-between">
                      <span>Action:</span>
                      <span className="font-medium">{tradingStatus.signal.action}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Symbol:</span>
                      <span className="font-medium">{tradingStatus.signal.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence:</span>
                      <span className="font-medium">
                        {(tradingStatus.signal.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-muted-foreground">{tradingStatus.signal.reasoning}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="space-y-2">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              💡 <strong>How it works:</strong> The AI analyzes real-time market data via 1inch, 
              identifies high-probability opportunities, and executes REAL on-chain trades automatically 
              based on each agent's strategy and risk parameters. All transactions are verified on Base network.
            </p>
          </div>
          
          {continuousTrading && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-2xl">
              <p className="text-xs text-green-600 dark:text-green-400">
                🚀 <strong>Live Trading Active:</strong> Your AI agents are now actively managing REAL crypto 24/7. 
                They execute profitable on-chain trades automatically when high-confidence opportunities are detected. 
                Toggle off anytime to pause. All trades are recorded on Base blockchain.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

