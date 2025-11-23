
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Shield, Bell, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export function PreferencesPanel() {
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
        body: JSON.stringify({ userId: 'demo-user', ...preferences }),
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
    return <div className="text-center text-gray-400 py-8">Loading preferences...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Signal Sources */}
      <Card className="terminal-crt-screen bg-gray-900/50 border-gray-800">
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
              <Label htmlFor="social-buzz" className="text-white">Social Buzz</Label>
              <p className="text-sm text-gray-400">Track X (Twitter) sentiment</p>
            </div>
            <Switch
              id="social-buzz"
              checked={preferences.enabledSignals?.socialBuzz}
              onCheckedChange={(checked) => updateEnabledSignal('socialBuzz', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="news" className="text-white">News & Events</Label>
              <p className="text-sm text-gray-400">Monitor crypto news feeds</p>
            </div>
            <Switch
              id="news"
              checked={preferences.enabledSignals?.news}
              onCheckedChange={(checked) => updateEnabledSignal('news', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Risk Management */}
      <Card className="terminal-crt-screen bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            Risk Management
          </CardTitle>
          <CardDescription>Configure signal filtering and risk controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-white">Minimum Confidence</Label>
              <span className="text-white font-bold">{preferences.minimumConfidence}%</span>
            </div>
            <Slider
              value={[preferences.minimumConfidence]}
              onValueChange={([value]) => updatePreference('minimumConfidence', value)}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-gray-400">
              Only show signals with confidence above this threshold
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-white">Max Position Size</Label>
              <span className="text-white font-bold">{preferences.maxPositionSize}%</span>
            </div>
            <Slider
              value={[preferences.maxPositionSize]}
              onValueChange={([value]) => updatePreference('maxPositionSize', value)}
              max={25}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-gray-400">
              Maximum percentage of capital per signal
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-white">Whale Reputation Threshold</Label>
              <span className="text-white font-bold">{preferences.whaleReputationThreshold}</span>
            </div>
            <Slider
              value={[preferences.whaleReputationThreshold]}
              onValueChange={([value]) => updatePreference('whaleReputationThreshold', value)}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-gray-400">
              Only follow whales with reputation above this score
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Automation */}
      <Card className="terminal-crt-screen bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-400" />
            Automation & Alerts
          </CardTitle>
          <CardDescription>Configure automated actions and notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="whale-shadow" className="text-white">Whale Shadow Mode</Label>
              <p className="text-sm text-gray-400">Auto-mimic high-conviction whale moves</p>
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
              <p className="text-sm text-gray-400">Let AI adjust agent positions automatically</p>
            </div>
            <Switch
              id="auto-adjust"
              checked={preferences.autoAdjustPositions}
              onCheckedChange={(checked) => updatePreference('autoAdjustPositions', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="telegram" className="text-white">Telegram Alerts</Label>
              <p className="text-sm text-gray-400">Receive instant notifications for high-urgency signals</p>
            </div>
            <Switch
              id="telegram"
              checked={preferences.telegramAlerts}
              onCheckedChange={(checked) => updatePreference('telegramAlerts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button 
        onClick={savePreferences}
        disabled={saving}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700"
      >
        <Save className="h-4 w-4 mr-2" />
        {saving ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
}
