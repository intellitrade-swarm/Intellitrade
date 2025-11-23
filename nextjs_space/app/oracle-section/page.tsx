
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Target, Trophy, TrendingUp, Shield, Cpu, Code, ArrowRight } from 'lucide-react';

const oracleFeatures = [
  {
    id: 'oracle',
    title: 'Oracle Intelligence',
    description: 'Real-time market data feeds and AI-powered cross-chain analytics',
    icon: Zap,
    path: '/oracle',
    badge: 'AI',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'trading-signals',
    title: 'Trading Signals',
    description: 'AI-generated BUY/SELL/HOLD signals with confidence scores',
    icon: Target,
    path: '/trading-signals',
    badge: 'LIVE',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: 'sports',
    title: 'Sports Prediction',
    description: 'AI predictions for NBA, NFL, MMA with odds analysis',
    icon: Trophy,
    path: '/sports-predictions',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'whale-monitor',
    title: 'Whale Monitor',
    description: 'Track smart money movements and social sentiment',
    icon: TrendingUp,
    path: '/whale-monitor',
    badge: 'INTEL',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'governance',
    title: 'Governance',
    description: 'Manage agent spending, proposals, and staking',
    icon: Shield,
    path: '/governance',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'perps',
    title: 'Perp Intelligence',
    description: 'Perpetuals market analytics and smart money trades',
    icon: Cpu,
    path: '/perps',
    badge: 'INTEL',
    gradient: 'from-red-500 to-pink-500',
  },
  {
    id: 'integration',
    title: 'Integration Guide',
    description: 'Smart contract integration and API documentation',
    icon: Code,
    path: '/integration-guide',
    gradient: 'from-gray-500 to-gray-700',
  },
];

export default function OracleSectionPage() {
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
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
          Oracle Market Intelligence
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl">
          Comprehensive market analytics powered by AI, advanced on-chain intelligence, and real-time data for superior trading insights
        </p>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {oracleFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card 
                className="bg-gray-900/50 border-green-500/20 hover:border-green-500/40 transition-all duration-300 cursor-pointer group h-full"
                onClick={() => router.push(feature.path)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} bg-opacity-10`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {feature.badge && (
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-white text-xl group-hover:text-green-400 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-green-400 hover:text-green-300 hover:bg-green-500/10"
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
        transition={{ duration: 0.6, delay: 0.7 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">7</div>
              <div className="text-green-400 font-medium">Intelligence Tools</div>
              <div className="text-gray-400 text-sm mt-1">Available</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">ON-CHAIN</div>
              <div className="text-purple-400 font-medium">Intelligence</div>
              <div className="text-gray-400 text-sm mt-1">Real-time Data</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">AI</div>
              <div className="text-blue-400 font-medium">Powered Analysis</div>
              <div className="text-gray-400 text-sm mt-1">OpenAI • Gemini • NVIDIA</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-orange-400 font-medium">Market Monitoring</div>
              <div className="text-gray-400 text-sm mt-1">Always Active</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
// Updated: Fri Nov 21 02:58:51 UTC 2025
