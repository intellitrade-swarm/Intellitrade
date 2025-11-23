
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export function ProfileSettings() {
  const [displayName, setDisplayName] = useState('Guest User');
  const [email, setEmail] = useState('guest@intellitrade.xyz');

  return (
    <div className="space-y-6">
      {/* User Information Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5 text-[#3385ff]" />
              User Information
            </CardTitle>
            <CardDescription>Your basic profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name" className="text-white">Display Name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-black/50 border-[#3385ff]/30 focus:border-[#3385ff] text-white"
                placeholder="Enter your display name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-[#3385ff]/30 focus:border-[#3385ff] text-white"
                placeholder="your@email.com"
              />
              <p className="text-xs text-gray-400">
                Used for important account notifications and updates
              </p>
            </div>

            <Button className="w-full bg-gradient-to-r from-[#3385ff] to-[#0047b3] hover:from-[#3385ff]/90 hover:to-[#0047b3]/90 text-black font-semibold">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#3385ff]" />
              Account Status
            </CardTitle>
            <CardDescription>Your account tier and access level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Access Level</p>
                <p className="text-sm text-gray-400">Public Access</p>
              </div>
              <Badge className="bg-[#3385ff]/20 text-[#3385ff] border-[#3385ff]/30">
                Public User
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Member Since</p>
                <p className="text-sm text-gray-400">November 2025</p>
              </div>
              <Calendar className="h-5 w-5 text-[#3385ff]" />
            </div>

            <div className="bg-[#3385ff]/5 border border-[#3385ff]/20 rounded-2xl p-4">
              <p className="text-sm text-gray-300">
                🎉 <strong className="text-[#3385ff]">Full Access:</strong> You have complete access to all AI trading agents, live monitoring, and analytics features.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
