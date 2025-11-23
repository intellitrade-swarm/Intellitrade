
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Zap, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

export function TradingPreferences() {
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/whale-monitor/preferences?userId=demo-user');
      const data = await response.json();
      if (data.success) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/whale-monitor/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'demo-user', preferences }),
      });
      
      const data = await response.json();
      if (data.success) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: string, value: any) => {
    setPreferences((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateEnabledSignal = (key: string, value: boolean) => {
    setPreferences((prev: any) => ({
      ...prev,
      enabledSignals: {
        ...prev.enabledSignals,
        [key]: value,
      },
    }));
  };

  if (loading || !preferences) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center text-gray-400 py-8">Loading preferences...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Signal Sources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-300" />
              Signal Sources
            </CardTitle>
            <CardDescription>Choose which signal types to monitor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="whale-moves" className="text-white">Whale Movements</Label>
                <p className="text-sm text-gray-400">Monitor large on-chain transactions</p>
              </div>
              <Switch
                id="whale-moves"
                checked={preferences.enabledSignals?.whaleMoves}
                onCheckedChange={(checked) => updateEnabledSignal('whaleMoves', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="social-buzz" className="text-white">Social Sentiment</Label>
                <p className="text-sm text-gray-400">Track X (Twitter) sentiment analysis</p>
              </div>
              <Switch
                id="social-buzz"
                checked={preferences.enabledSignals?.socialBuzz}
                onCheckedChange={(checked) => updateEnabledSignal('socialBuzz', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="news-events" className="text-white">News & Events</Label>
                <p className="text-sm text-gray-400">Monitor crypto news and market events</p>
              </div>
              <Switch
                id="news-events"
                checked={preferences.enabledSignals?.newsEvents}
                onCheckedChange={(checked) => updateEnabledSignal('newsEvents', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Risk Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Risk Management
            </CardTitle>
            <CardDescription>Configure your trading risk parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white">Minimum Confidence</Label>
                <Badge variant="outline" className="bg-[#3385ff]/20 text-[#3385ff] border-[#3385ff]/30">
                  {preferences.minConfidence}%
                </Badge>
              </div>
              <Slider
                value={[preferences.minConfidence]}
                onValueChange={([value]) => updatePreference('minConfidence', value)}
                min={50}
                max={95}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-gray-400">
                Only act on signals with at least this confidence level
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white">Max Position Size</Label>
                <Badge variant="outline" className="bg-[#3385ff]/20 text-[#3385ff] border-[#3385ff]/30">
                  {preferences.maxPositionSize}%
                </Badge>
              </div>
              <Slider
                value={[preferences.maxPositionSize]}
                onValueChange={([value]) => updatePreference('maxPositionSize', value)}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-gray-400">
                Maximum percentage of portfolio per trade
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white">Whale Reputation Threshold</Label>
                <Badge variant="outline" className="bg-[#3385ff]/20 text-[#3385ff] border-[#3385ff]/30">
                  {preferences.whaleReputationThreshold}
                </Badge>
              </div>
              <Slider
                value={[preferences.whaleReputationThreshold]}
                onValueChange={([value]) => updatePreference('whaleReputationThreshold', value)}
                min={50}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-gray-400">
                Only follow whales with reputation above this threshold
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Automation & Strategy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Automation & Strategy
            </CardTitle>
            <CardDescription>Configure automated trading behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="whale-shadow" className="text-white">Whale Shadow Mode</Label>
                <p className="text-sm text-gray-400">Automatically copy whale trades</p>
              </div>
              <Switch
                id="whale-shadow"
                checked={preferences.whaleShadowMode}
                onCheckedChange={(checked) => updatePreference('whaleShadowMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-adjust" className="text-white">Auto-Adjust Positions</Label>
                <p className="text-sm text-gray-400">Automatically adjust based on market conditions</p>
              </div>
              <Switch
                id="auto-adjust"
                checked={preferences.autoAdjustPositions}
                onCheckedChange={(checked) => updatePreference('autoAdjustPositions', checked)}
              />
            </div>

            {preferences.whaleShadowMode && (
              <div className="bg-blue-400/10 border border-blue-400/30 rounded-2xl p-4">
                <p className="text-sm text-yellow-300">
                  ⚠️ <strong>Whale Shadow Mode Active:</strong> Your agents will automatically mirror trades from high-reputation whales. Make sure to monitor your positions regularly.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Button
          onClick={savePreferences}
          disabled={saving}
          className="w-full bg-gradient-to-r from-[#3385ff] to-[#0047b3] hover:from-[#3385ff]/90 hover:to-[#0047b3]/90 text-black font-semibold text-lg py-6"
        >
          {saving ? (
            <>
              <div className="mr-2 h-4 w-4 terminal-pulse rounded-full border-2 border-black border-t-transparent" />
              Saving Preferences...
            </>
          ) : (
            <>
              <TrendingUp className="mr-2 h-5 w-5" />
              Save Trading Preferences
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
