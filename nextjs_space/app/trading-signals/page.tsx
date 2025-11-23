
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Activity, TrendingUp, Target, Search, Zap, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TradingSignal {
  symbol: string;
  signal: string;
  confidence: number;
  sources: {
    coingecko: boolean;
    dextools: boolean;
    nansen: boolean;
  };
  marketData: {
    price: number;
    volume24h: number;
    marketCap: number;
    priceChange24h: number;
    priceChange7d: number;
    liquidity: number;
    holders: number;
  };
  technicalIndicators: {
    rsi: number;
    trend: string;
    momentum: string;
    volatility: number;
  };
  smartMoneyData?: {
    smartMoneyHolding: boolean;
    netFlow: number;
    whaleActivity: string;
  };
  aiReasoning: string;
  timestamp: string;
}

export default function TradingSignalsPage() {
  const router = useRouter();
  const [customSymbol, setCustomSymbol] = useState('');
  const [tradingSignals, setTradingSignals] = useState<TradingSignal[]>([]);
  const [signalsLoading, setSignalsLoading] = useState(false);

  const fetchSignal = async (symbol: string) => {
    if (!symbol || symbol.trim() === '') {
      toast.error('Please enter a token symbol');
      return;
    }
    
    setSignalsLoading(true);
    try {
      const response = await fetch('/api/trading-signals/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: symbol.toUpperCase().trim() }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.signal) {
          setTradingSignals([data.signal]);
          toast.success(`Signal generated for ${symbol.toUpperCase()}`);
        } else {
          toast.error(data.error || 'Failed to generate signal');
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to fetch signal');
      }
    } catch (error) {
      console.error('Trading signals error:', error);
      toast.error('Network error - please try again');
    } finally {
      setSignalsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSignal(customSymbol);
  };

  const quickSymbols = ['BTC', 'ETH', 'SOL', 'BNB', 'AVAX', 'MATIC', 'ARB', 'OP'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/20 via-blue-950/10 to-black">
      {/* Background Grid */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 102, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 102, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="text-white hover:text-blue-400 hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Target className="h-8 w-8 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Trading Signals
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            AI-powered trading signals with real-time market analysis and actionable insights
          </p>
        </div>

        {/* Trading Signals Card */}
        <Card className="terminal-crt-screen bg-gradient-to-br from-blue-900/20 via-blue-950/10 to-black backdrop-blur border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Trading Signal Analyzer
            </CardTitle>
            <CardDescription className="text-gray-400">
              Real-time signal analysis using multiple market data sources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Enter Token Symbol</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="e.g., BTC, ETH, SOL..."
                    value={customSymbol}
                    onChange={(e) => setCustomSymbol(e.target.value)}
                    className="flex-1 bg-gray-900/50 border-blue-500/30 text-white placeholder:text-gray-500"
                    disabled={signalsLoading}
                  />
                  <Button
                    type="submit"
                    disabled={signalsLoading || !customSymbol.trim()}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    {signalsLoading ? (
                      <>
                        <Activity className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Get Signal
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Quick Select</label>
                <div className="flex flex-wrap gap-2">
                  {quickSymbols.map((symbol) => (
                    <Button
                      key={symbol}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fetchSignal(symbol)}
                      disabled={signalsLoading}
                      className="hover:bg-blue-600/20 hover:border-blue-500"
                    >
                      {symbol}
                    </Button>
                  ))}
                </div>
              </div>
            </form>

            {/* Signals Display */}
            {tradingSignals.length > 0 && (
              <div className="space-y-4">
                {tradingSignals.map((signal, index) => (
                  <motion.div
                    key={signal.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-2xl border bg-gradient-to-br from-gray-900/60 to-gray-800/40 border-gray-700/50 hover:border-blue-500/30 transition-all space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-white mb-1">{signal.symbol}</h4>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-400">
                            ${signal.marketData.price.toLocaleString()}
                          </span>
                          <span className={signal.marketData.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {signal.marketData.priceChange24h >= 0 ? '+' : ''}
                            {signal.marketData.priceChange24h.toFixed(2)}% (24h)
                          </span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge
                          className={`text-sm px-3 py-1 ${
                            signal.signal.includes('BUY') ? 'bg-green-600 hover:bg-green-700' :
                            signal.signal.includes('SELL') ? 'bg-red-600 hover:bg-red-700' :
                            'bg-gray-600 hover:bg-gray-700'
                          }`}
                        >
                          {signal.signal.replace('_', ' ')}
                        </Badge>
                        <div className="text-xs text-gray-400">
                          Confidence: <span className="text-white font-semibold">{(signal.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Data Sources */}
                    <div className="flex gap-2">
                      {signal.sources.coingecko && (
                        <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                          <DollarSign className="h-3 w-3 mr-1" />
                          CoinGecko
                        </Badge>
                      )}
                      {signal.sources.dextools && (
                        <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                          <Zap className="h-3 w-3 mr-1" />
                          DexTools
                        </Badge>
                      )}
                      {signal.sources.nansen && (
                        <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                          <Target className="h-3 w-3 mr-1" />
                          Smart Money
                        </Badge>
                      )}
                    </div>
                    
                    {/* Market Data Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-blue-900/20 border border-blue-500/20">
                        <span className="text-xs text-gray-400 block mb-1">Volume 24h</span>
                        <p className="font-semibold text-white text-sm">${(signal.marketData.volume24h / 1e6).toFixed(2)}M</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-900/20 border border-blue-500/20">
                        <span className="text-xs text-gray-400 block mb-1">Market Cap</span>
                        <p className="font-semibold text-white text-sm">${(signal.marketData.marketCap / 1e6).toFixed(2)}M</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-900/20 border border-blue-500/20">
                        <span className="text-xs text-gray-400 block mb-1">Liquidity</span>
                        <p className="font-semibold text-white text-sm">${(signal.marketData.liquidity / 1e6).toFixed(2)}M</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-900/20 border border-blue-500/20">
                        <span className="text-xs text-gray-400 block mb-1">RSI</span>
                        <p className={`font-semibold text-sm ${
                          signal.technicalIndicators.rsi > 70 ? 'text-red-400' :
                          signal.technicalIndicators.rsi < 30 ? 'text-green-400' :
                          'text-yellow-400'
                        }`}>
                          {signal.technicalIndicators.rsi.toFixed(1)}
                        </p>
                      </div>
                    </div>

                    {/* Technical Indicators */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20">
                      <h5 className="text-xs font-semibold text-blue-300 mb-2">Technical Analysis</h5>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-gray-400">Trend:</span>
                          <p className="text-white font-semibold capitalize">{signal.technicalIndicators.trend}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Momentum:</span>
                          <p className="text-white font-semibold capitalize">{signal.technicalIndicators.momentum}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Volatility:</span>
                          <p className="text-white font-semibold">{signal.technicalIndicators.volatility.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Smart Money Data (if available) */}
                    {signal.smartMoneyData && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20">
                        <h5 className="text-xs font-semibold text-purple-300 mb-2 flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Smart Money Activity
                        </h5>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-400">Smart Money:</span>
                            <p className={`font-semibold ${signal.smartMoneyData.smartMoneyHolding ? 'text-green-400' : 'text-gray-400'}`}>
                              {signal.smartMoneyData.smartMoneyHolding ? 'Holding' : 'Not Holding'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-400">Net Flow:</span>
                            <p className={`font-semibold ${signal.smartMoneyData.netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${(signal.smartMoneyData.netFlow / 1e6).toFixed(2)}M
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* AI Reasoning */}
                    <div className="p-4 rounded-xl bg-blue-900/20 border border-blue-500/30">
                      <h5 className="text-xs font-semibold mb-2 text-blue-300 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        AI Analysis
                      </h5>
                      <p className="text-gray-300 text-sm leading-relaxed">{signal.aiReasoning}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Helpful Info */}
            {tradingSignals.length === 0 && !signalsLoading && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-blue-900/20 border border-blue-500/30">
                  <h4 className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Multi-Source Signal Analysis
                  </h4>
                  <ul className="text-xs text-gray-400 space-y-2">
                    <li className="flex items-start gap-2">
                      <DollarSign className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-green-400">CoinGecko:</strong> Real-time price, volume, market cap, and 24h/7d price changes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-blue-400">DexTools:</strong> DEX liquidity, trading pairs, technical indicators (RSI, trend, volatility)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Target className="h-3 w-3 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-purple-400">Smart Money:</strong> Professional wallet holdings, wallet analysis, net flow tracking</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-green-900/20 border border-green-500/30">
                  <h4 className="text-sm font-semibold text-green-300 mb-2">✨ Features</h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Enter any token symbol (BTC, ETH, or custom tokens)</li>
                    <li>• Comprehensive analysis from 3 premium data sources</li>
                    <li>• BUY/SELL/HOLD signals with confidence levels</li>
                    <li>• Technical indicators: RSI, trend, momentum, volatility</li>
                    <li>• Smart money tracking and wallet analysis (when available)</li>
                    <li>• AI-powered reasoning for each recommendation</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
