
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, BarChart3, Bot, Copy, ArrowRight } from 'lucide-react';

const swarmFeatures = [
  {
    id: 'trading-hub',
    title: 'Trading Hub',
    description: 'Monitor live autonomous trading operations and agent performance',
    icon: Activity,
    path: '/arena',
    badge: 'LIVE',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'performance',
    title: 'Performance Analytics',
    description: 'Deep dive into trading metrics, PnL, and win rates',
    icon: BarChart3,
    path: '/performance',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'agents',
    title: 'AI Agents',
    description: 'Manage and configure your autonomous AI trading agents',
    icon: Bot,
    path: '/agents',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: 'copy-trading',
    title: 'Copy Trading',
    description: 'Mirror successful agent strategies and share in their profits',
    icon: Copy,
    path: '/copytrading',
    gradient: 'from-orange-500 to-red-500',
  },
];

export default function SwarmPage() {
  const router = useRouter();

  return (
    <div className="p-6 w-full">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          AI-Powered Trading Swarm
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl">
          Autonomous agents working 24/7 to identify opportunities, execute trades, and maximize profits across multiple chains and DEXs
        </p>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {swarmFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card 
                className="bg-gray-900/50 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 cursor-pointer group"
                onClick={() => router.push(feature.path)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} bg-opacity-10`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    {feature.badge && (
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-white text-2xl group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(feature.path);
                    }}
                  >
                    <span>Explore</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">3</div>
              <div className="text-blue-400 font-medium">Active Agents</div>
              <div className="text-gray-400 text-sm mt-1">Trading 24/7</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">$310</div>
              <div className="text-purple-400 font-medium">Total Capital</div>
              <div className="text-gray-400 text-sm mt-1">Deployed</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">15min</div>
              <div className="text-green-400 font-medium">Auto-Trading</div>
              <div className="text-gray-400 text-sm mt-1">Cycle Interval</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
