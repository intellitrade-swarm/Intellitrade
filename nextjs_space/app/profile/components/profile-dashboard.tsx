
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Bell, Settings as SettingsIcon, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ProfileSettings } from './profile-settings';
import { NotificationSettings } from './notification-settings';
import { TradingPreferences } from './trading-preferences';

export function ProfileDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/arena')}
            className="text-white hover:text-[#0066ff] hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Arena
          </Button>
        </motion.div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#3385ff] to-[#0047b3] flex items-center justify-center">
              <User className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#3385ff] to-[#0047b3]">
                Profile & Settings
              </h1>
              <p className="text-gray-400 mt-1">
                Manage your account preferences and notification settings
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 border border-gray-800">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-[#3385ff]/20 data-[state=active]:text-[#3385ff]"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-[#3385ff]/20 data-[state=active]:text-[#3385ff]"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="trading"
                className="data-[state=active]:bg-[#3385ff]/20 data-[state=active]:text-[#3385ff]"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Trading
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              <ProfileSettings />
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-6">
              <NotificationSettings />
            </TabsContent>

            {/* Trading Preferences Tab */}
            <TabsContent value="trading" className="mt-6">
              <TradingPreferences />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
