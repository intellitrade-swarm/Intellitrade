
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Webhook, Activity, TrendingUp, Clock, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';

export default function WebhooksPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [copied, setCopied] = useState<string | null>(null);

  const webhookUrls = {
    tradingview: 'https://intellitrade.xyz/api/webhooks/tradingview',
    nansen: 'https://intellitrade.xyz/api/webhooks/nansen',
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [timeframe]);

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/webhooks/stats?timeframe=${timeframe}`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load webhook stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black p-6">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,102,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,102,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      <div className="relative max-w-7xl mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-6 text-white hover:text-blue-400 hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Webhook className="h-10 w-10 text-blue-400" />
            Webhook Management
          </h1>
          <p className="text-gray-400 text-lg">
            Configure TradingView alerts and Nansen whale triggers for automated swarm analysis
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex gap-2 mb-6">
          {(['24h', '7d', '30d'] as const).map((tf) => (
            <Button
              key={tf}
              onClick={() => setTimeframe(tf)}
              variant={timeframe === tf ? 'default' : 'outline'}
              className={timeframe === tf ? 'bg-blue-500 hover:bg-blue-600' : ''}
            >
              {tf === '24h' ? 'Last 24 Hours' : tf === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
            </Button>
          ))}
        </div>

        {/* Stats Overview */}
        {!loading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Total Webhooks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Processed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-400">{stats.processed}</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Avg Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-400">
                  {stats.avgProcessingTime > 0 ? `${Math.round(stats.avgProcessingTime)}ms` : 'N/A'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Webhook URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-950/10 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Webhook className="h-5 w-5 text-blue-400" />
                TradingView Webhook
              </CardTitle>
              <CardDescription className="text-gray-400">
                Connect your TradingView alerts to trigger swarm analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Webhook URL:</p>
                <div className="flex gap-2">
                  <code className="flex-1 bg-black/40 text-blue-300 px-3 py-2 rounded-xl text-xs break-all">
                    {webhookUrls.tradingview}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(webhookUrls.tradingview, 'tradingview')}
                    className="shrink-0"
                  >
                    {copied === 'tradingview' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Example Alert Message (JSON):</p>
                <pre className="bg-black/40 text-gray-300 px-3 py-2 rounded-xl text-xs overflow-x-auto">
{`{
  "ticker": "{{ticker}}",
  "action": "buy",
  "price": {{close}},
  "alertType": "technical"
}`}
                </pre>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Supported Alert Types:</p>
                <div className="flex flex-wrap gap-2">
                  {['technical', 'price', 'volume', 'custom'].map(type => (
                    <Badge key={type} variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-950/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Nansen Whale Alerts
              </CardTitle>
              <CardDescription className="text-gray-400">
                Receive whale movement alerts for automatic analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Webhook URL:</p>
                <div className="flex gap-2">
                  <code className="flex-1 bg-black/40 text-purple-300 px-3 py-2 rounded-xl text-xs break-all">
                    {webhookUrls.nansen}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(webhookUrls.nansen, 'nansen')}
                    className="shrink-0"
                  >
                    {copied === 'nansen' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Example Payload (JSON):</p>
                <pre className="bg-black/40 text-gray-300 px-3 py-2 rounded-xl text-xs overflow-x-auto">
{`{
  "whaleAddress": "0x...",
  "tokenAddress": "0x...",
  "chain": "ethereum",
  "amount": 1000000,
  "alertType": "whale"
}`}
                </pre>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Supported Chains:</p>
                <div className="flex flex-wrap gap-2">
                  {['ethereum', 'bsc', 'polygon', 'base'].map(chain => (
                    <Badge key={chain} variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30">
                      {chain}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics by Type */}
        {!loading && stats && Object.keys(stats.byAlertType).length > 0 && (
          <Card className="bg-gray-900/50 border-gray-800 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-400" />
                Webhooks by Alert Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(stats.byAlertType).map(([type, count]) => (
                  <div key={type} className="bg-black/20 rounded-xl p-4">
                    <p className="text-gray-400 text-sm capitalize">{type}</p>
                    <p className="text-2xl font-bold text-white">{count as number}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Events */}
        {!loading && stats && stats.recentEvents.length > 0 && (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-400" />
                Recent Webhook Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentEvents.map((event: any) => (
                  <div
                    key={event.id}
                    className="bg-black/20 rounded-xl p-4 flex items-center justify-between hover:bg-black/30 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={
                            event.source === 'tradingview'
                              ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                              : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                          }
                        >
                          {event.source}
                        </Badge>
                        <Badge variant="outline" className="bg-gray-700/50 text-gray-300">
                          {event.alertType}
                        </Badge>
                        {event.symbol && (
                          <span className="text-white font-semibold">{event.symbol}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {formatTime(event.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {event.processingTime && (
                        <span className="text-xs text-gray-500">{event.processingTime}ms</span>
                      )}
                      {event.processed ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading state */}
        {loading && (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="py-12 text-center">
              <Activity className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading webhook statistics...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
