
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, AlertTriangle, Zap, Twitter, Eye, Settings, ArrowLeft, User } from 'lucide-react';
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
import { SignalMonitor } from './signal-monitor';
import { PreferencesPanel } from './preferences-panel';
import { WhaleStats } from './whale-stats';
import { FlowIntelligencePanel } from './flow-intelligence-panel';
import { AddressProfilerPanel } from './address-profiler-panel';
import { TopTokensScanner } from './top-tokens-scanner';

export function WhaleMonitorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('signals');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/whale-monitor/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/arena')}
          className="text-white hover:text-[#0066ff] hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Arena
        </Button>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-blue-600 to-blue-500 bg-clip-text text-transparent">
              Whale Monitor & Social Sentiment
            </h1>
            <p className="text-gray-400 mt-2">
              AI-powered alpha generation through on-chain whale tracking and social sentiment analysis
            </p>
          </div>
          <Badge variant="outline" className="border-green-500 text-green-500">
            <Activity className="h-4 w-4 mr-2 terminal-pulse" />
            Live Monitoring
          </Badge>
        </div>

        {/* Stats Overview */}
        {!loading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="terminal-crt-screen bg-gradient-to-br from-blue-900/20 to-transparent border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Whale Signals (24h)</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {stats.whaleActivity?.signals || 0}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-400" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  ${(stats.whaleActivity?.totalVolume || 0).toLocaleString()} volume
                </div>
              </CardContent>
            </Card>

            <Card className="terminal-crt-screen bg-gradient-to-br from-blue-950/20 to-transparent border-blue-600/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">AI Signals</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {stats.aiSignals?.total || 0}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-2 flex gap-2">
                  <Badge variant="destructive" className="text-xs">
                    {stats.aiSignals?.critical || 0} Critical
                  </Badge>
                  <Badge variant="outline" className="text-xs border-blue-500 text-blue-500">
                    {stats.aiSignals?.high || 0} High
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="terminal-crt-screen bg-gradient-to-br from-blue-900/20 to-transparent border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Social Sentiment</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {stats.socialSentiment?.total || 0}
                    </p>
                  </div>
                  <Twitter className="h-8 w-8 text-blue-400" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {stats.socialSentiment?.trending?.length || 0} trending tokens
                </div>
              </CardContent>
            </Card>

            <Card className="terminal-crt-screen bg-gradient-to-br from-green-900/20 to-transparent border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Avg Confidence</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {(stats.aiSignals?.avgConfidence || 0).toFixed(0)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
                <div className="mt-2 text-xs text-green-500">
                  Multi-source validation
                </div>
              </CardContent>
            </Card>
          </div>
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
                    <SelectItem value="toptokens" className="text-white hover:bg-blue-600/20 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <span>Top Tokens Scanner</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="signals" className="text-white hover:bg-blue-600/20 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-400" />
                        <span>Signals</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="flow" className="text-white hover:bg-blue-600/20 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                        <span>Flow Intelligence</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="profiler" className="text-white hover:bg-blue-600/20 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-400" />
                        <span>Profiler</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="preferences" className="text-white hover:bg-blue-600/20 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-blue-400" />
                        <span>Preferences</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="stats" className="text-white hover:bg-green-600/20 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <span>Analytics</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Conditional Content Rendering */}
          <div className="space-y-4">
            {activeSection === 'toptokens' && <TopTokensScanner />}
            {activeSection === 'signals' && <SignalMonitor />}
            {activeSection === 'flow' && <FlowIntelligencePanel />}
            {activeSection === 'profiler' && <AddressProfilerPanel />}
            {activeSection === 'preferences' && <PreferencesPanel />}
            {activeSection === 'stats' && <WhaleStats stats={stats} />}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
