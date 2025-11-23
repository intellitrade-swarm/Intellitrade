
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertCircle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export function SignalMonitor() {
  const [symbol, setSymbol] = useState('');
  const [signal, setSignal] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeToken = async () => {
    if (!symbol) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/whale-monitor/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: symbol.toUpperCase(), userId: 'demo-user' }),
      });
      
      const data = await response.json();
      if (data.success && data.signal) {
        setSignal(data.signal);
      }
    } catch (error) {
      console.error('Error analyzing token:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-600 border-red-500';
      case 'HIGH': return 'bg-blue-600 border-blue-500';
      case 'MEDIUM': return 'bg-blue-500 border-blue-400';
      default: return 'bg-blue-600 border-blue-500';
    }
  };

  const getActionIcon = (action: string) => {
    if (action === 'BUY') return <TrendingUp className="h-5 w-5 text-green-400" />;
    if (action === 'SELL') return <TrendingDown className="h-5 w-5 text-red-400" />;
    return <Activity className="h-5 w-5 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="terminal-crt-screen bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Analyze Token</CardTitle>
          <CardDescription>Get AI-powered signals for any token</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter token symbol (e.g., ETH, BTC)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeToken()}
              className="bg-gray-800 border-gray-700 text-white"
            />
            <Button 
              onClick={analyzeToken} 
              disabled={loading || !symbol}
              className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Signal Results */}
      {signal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={`border-2 ${getUrgencyColor(signal.urgency)}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getActionIcon(signal.action)}
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      {signal.symbol} Signal
                      <Badge variant={signal.action === 'BUY' ? 'default' : 'destructive'}>
                        {signal.action}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {signal.type.replace('_', ' ')} • {new Date(signal.timestamp).toLocaleString()}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getUrgencyColor(signal.urgency)}>
                  {signal.urgency}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Confidence & Position */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Confidence Score</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${signal.confidence}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold text-white">
                      {signal.confidence.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Recommended Position</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {signal.recommendation.positionSize}%
                  </p>
                </div>
              </div>

              {/* Timeframe */}
              <div>
                <p className="text-sm text-gray-400">Execution Timeframe</p>
                <p className="text-white mt-1">{signal.recommendation.timeframe}</p>
              </div>

              {/* Reasoning */}
              <div>
                <p className="text-sm text-gray-400 mb-2">AI Analysis</p>
                <div className="bg-gray-800/50 p-4 rounded-2xl">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                    {signal.reasoning}
                  </pre>
                </div>
              </div>

              {/* Sources */}
              {signal.sources && (
                <div className="space-y-2">
                  {signal.sources.whaleMoves && signal.sources.whaleMoves.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">🐋 Whale Activity Detected</p>
                      <div className="space-y-2">
                        {signal.sources.whaleMoves.map((move: any, i: number) => (
                          <div key={i} className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
                            <p className="text-white text-sm">
                              {move.whaleLabel} • {move.action} ${move.amountUSD.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Confidence: {move.confidence}/100
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {signal.sources.socialData && signal.sources.socialData.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">🐦 Social Sentiment</p>
                      {signal.sources.socialData.map((data: any, i: number) => (
                        <div key={i} className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
                          <div className="flex justify-between items-center">
                            <span className="text-white text-sm">
                              {data.volume} mentions • Sentiment: {data.sentiment > 0 ? '+' : ''}{data.sentiment}
                            </span>
                            {data.trending && (
                              <Badge variant="outline" className="border-blue-500 text-blue-500">
                                🔥 Trending
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Info Card */}
      {!signal && !loading && (
        <Card className="terminal-crt-screen bg-gradient-to-br from-blue-900/20 to-blue-950/10 border-blue-500/30">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white font-semibold text-lg mb-2">How AI Trading Signals Work</p>
                  <p className="text-gray-300 text-sm mb-3">
                    Enter any token symbol above (e.g., ETH, BTC, USDC) and click <strong>Analyze</strong> to get AI-powered trading signals based on:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                      <span>🐋 Whale wallet transactions ($100k+ moves)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                      <span>🐦 X (Twitter) sentiment analysis in real-time</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                      <span>🤖 AI confidence scoring (0-100%)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                      <span>📊 Actionable recommendations with timeframes</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-4">
                <p className="text-blue-400 font-medium mb-2">💡 Try these examples:</p>
                <div className="flex flex-wrap gap-2">
                  {['ETH', 'BTC', 'USDC', 'SOL', 'MATIC'].map((sym) => (
                    <Button
                      key={sym}
                      size="sm"
                      variant="outline"
                      onClick={() => { 
                        setSymbol(sym); 
                        setTimeout(() => analyzeToken(), 100);
                      }}
                      className="bg-blue-600/20 border-blue-500/50 text-blue-300 hover:bg-blue-600/30 hover:text-white"
                    >
                      {sym}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
