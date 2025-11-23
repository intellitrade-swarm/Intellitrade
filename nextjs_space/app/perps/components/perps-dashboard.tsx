
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  DollarSign,
  Zap,
  Award,
  Target,
  BarChart3,
  Users,
  Flame
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PerpMarketScreener } from './perp-market-screener';
import { SmartMoneyPerpFeed } from './smart-money-perp-feed';
import { PerpLeaderboard } from './perp-leaderboard';
import { TGMPerpPositions } from './tgm-perp-positions';

export function PerpsDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('screener');

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      // Fetch multiple data sources in parallel
      const [screenerRes, tradesRes, leaderboardRes] = await Promise.all([
        fetch('/api/nansen/perp-screener?limit=10'),
        fetch('/api/nansen/smart-money/perp-trades?limit=10'),
        fetch('/api/nansen/tgm/perp-pnl-leaderboard?limit=10'),
      ]);

      const [screenerData, tradesData, leaderboardData] = await Promise.all([
        screenerRes.json(),
        tradesRes.json(),
        leaderboardRes.json(),
      ]);

      if (screenerData.success && tradesData.success && leaderboardData.success) {
        // Calculate aggregate stats
        const markets = screenerData.data || [];
        const trades = tradesData.data || [];
        const leaderboard = leaderboardData.data || {};

        const totalVolume = markets.reduce((sum: number, m: any) => sum + (m.volume24h || 0), 0);
        const totalOI = markets.reduce((sum: number, m: any) => sum + (m.openInterest || 0), 0);
        const totalLiquidations = markets.reduce((sum: number, m: any) => sum + (m.liquidations24h?.totalUSD || 0), 0);
        
        const longTrades = trades.filter((t: any) => t.side === 'LONG').length;
        const shortTrades = trades.filter((t: any) => t.side === 'SHORT').length;
        const avgLeverage = trades.reduce((sum: number, t: any) => sum + (t.leverage || 0), 0) / trades.length || 1;

        setStats({
          totalVolume24h: totalVolume,
          totalOpenInterest: totalOI,
          totalLiquidations24h: totalLiquidations,
          smartMoneyTrades: trades.length,
          longShortRatio: shortTrades > 0 ? longTrades / shortTrades : longTrades,
          avgLeverage: avgLeverage,
          topTraders: leaderboard.entries?.length || 0,
          avgPnL: leaderboard.summary?.avgPnL || 0,
        });
      }
    } catch (error) {
      console.error('Error loading perps stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950/20 to-black p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="text-white hover:text-[#0066ff] hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-blue-600 to-blue-500 bg-clip-text text-transparent">
              Perpetuals Trading Intelligence
            </h1>
            <p className="text-gray-400 mt-2">
              Real-time perps data, smart money tracking, and AI-powered alpha generation
            </p>
          </div>
          <Badge variant="outline" className="border-green-500 text-green-500">
            <Activity className="h-4 w-4 mr-2 animate-pulse" />
            Live Data
          </Badge>
        </div>

        {/* Stats Overview - Accordion Format */}
        {!loading && stats && (
          <Accordion type="multiple" className="space-y-2">
            {/* Volume & Open Interest */}
            <AccordionItem value="volume" className="bg-gradient-to-br from-blue-900/20 to-transparent border-2 border-blue-500/30 rounded-2xl px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-6 w-6 text-blue-400 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-400">Volume (24h)</p>
                      <p className="text-2xl font-bold text-white">
                        ${(stats.totalVolume24h / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Open Interest</span>
                    <span className="text-white font-semibold">${(stats.totalOpenInterest / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Total trading volume across all perpetual markets in the last 24 hours
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Smart Money Trades */}
            <AccordionItem value="smart-money" className="bg-gradient-to-br from-blue-950/20 to-transparent border-2 border-blue-600/30 rounded-2xl px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-6 w-6 text-blue-500 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-400">Smart Money Trades</p>
                      <p className="text-2xl font-bold text-white">{stats.smartMoneyTrades}</p>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2">
                <div className="space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="border-green-500 text-green-500">
                      L/S: {stats.longShortRatio.toFixed(2)}
                    </Badge>
                    <Badge variant="outline" className="border-blue-500 text-blue-500">
                      {stats.avgLeverage.toFixed(1)}x Avg Leverage
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Recent perpetual trades from verified smart money wallets
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Liquidations */}
            <AccordionItem value="liquidations" className="bg-gradient-to-br from-red-900/20 to-transparent border-2 border-red-500/30 rounded-2xl px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <Flame className="h-6 w-6 text-red-400 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-400">Liquidations (24h)</p>
                      <p className="text-2xl font-bold text-white">
                        ${(stats.totalLiquidations24h / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2">
                <div className="space-y-2">
                  <Badge variant="outline" className="border-red-500 text-red-500">
                    ⚠️ High Volatility Detected
                  </Badge>
                  <div className="text-xs text-gray-500 mt-2">
                    Total value of liquidated positions across all perpetual markets. High liquidation volume indicates increased market volatility and risk.
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Top Traders */}
            <AccordionItem value="traders" className="bg-gradient-to-br from-green-900/20 to-transparent border-2 border-green-500/30 rounded-2xl px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <Award className="h-6 w-6 text-green-400 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-400">Top Traders</p>
                      <p className="text-2xl font-bold text-white">{stats.topTraders}</p>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Average PnL</span>
                    <span className="text-green-500 font-semibold">${(stats.avgPnL / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Number of profitable traders tracked in the PnL leaderboard with significant perpetual trading activity
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Main Content Selector */}
        <div className="space-y-6">
          {/* Dropdown Selector */}
          <Card className="bg-gradient-to-br from-gray-900/50 to-transparent border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-400 whitespace-nowrap">
                  Select View:
                </label>
                <Select value={activeSection} onValueChange={setActiveSection}>
                  <SelectTrigger className="flex-1 bg-gray-800/50 border-gray-700 text-white hover:border-blue-500 transition-colors">
                    <SelectValue placeholder="Select a view" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="screener" className="text-white hover:bg-blue-600/20 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-400" />
                        <span>Market Screener</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="feed" className="text-white hover:bg-blue-600/20 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-400" />
                        <span>Smart Money Feed</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="positions" className="text-white hover:bg-blue-600/20 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-400" />
                        <span>TGM Positions</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="leaderboard" className="text-white hover:bg-green-600/20 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-green-400" />
                        <span>Leaderboard</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Conditional Content Rendering */}
          <div className="space-y-4">
            {activeSection === 'screener' && <PerpMarketScreener />}
            {activeSection === 'feed' && <SmartMoneyPerpFeed />}
            {activeSection === 'positions' && <TGMPerpPositions />}
            {activeSection === 'leaderboard' && <PerpLeaderboard />}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
