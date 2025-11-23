'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  BarChart3,
  Bot,
  Copy,
  Zap,
  TrendingUp,
  Shield,
  ArrowRight,
  Sparkles,
  Target,
  Trophy,
  CheckCircle2,
  Cpu,
  Code,
  Users,
  Webhook,
} from 'lucide-react';

export function ExplorationLanding() {
  const router = useRouter();

  const features = [
    {
      icon: Activity,
      title: 'Trading Hub',
      description: 'Live AI trading arena with real-time autonomous agents executing on-chain trades',
      path: '/arena',
      badge: 'LIVE',
      accent: 'blue',
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Comprehensive metrics tracking agent profitability and win rates',
      path: '/performance',
      accent: 'blue',
    },
    {
      icon: Bot,
      title: 'AI Agents',
      description: 'Manage AI trading agents, view strategies, and monitor wallet balances',
      path: '/agents',
      accent: 'blue',
    },
    {
      icon: Copy,
      title: 'Copy Trading',
      description: 'Mirror successful AI agent strategies and share in their trading profits',
      path: '/copytrading',
      accent: 'blue',
    },
    {
      icon: Users,
      title: 'Swarm Intelligence',
      description: 'Multi-agent collaborative AI system with specialized trading roles',
      path: '/swarm-intelligence',
      badge: 'NEW',
      accent: 'blue',
    },
    {
      icon: Zap,
      title: 'Oracle Intelligence',
      description: 'AI-powered market intelligence with blockchain data feeds',
      path: '/oracle',
      badge: 'AI',
      accent: 'cyan',
    },
    {
      icon: Sparkles,
      title: 'AI Analysis',
      description: 'Get AI-powered market analysis from multiple AI providers',
      path: '/ai-analysis',
      badge: 'AI',
      accent: 'cyan',
    },
    {
      icon: Target,
      title: 'Trading Signals',
      description: 'AI-generated trading signals for selected cryptocurrencies',
      path: '/trading-signals',
      badge: 'LIVE',
      accent: 'cyan',
    },
    {
      icon: Trophy,
      title: 'Sports Predictions',
      description: 'AI-powered predictions for NBA, NFL, and MMA',
      path: '/sports-predictions',
      accent: 'cyan',
    },
    {
      icon: TrendingUp,
      title: 'Whale Monitor',
      description: 'Track whale wallets and social sentiment with on-chain intelligence',
      path: '/whale-monitor',
      badge: 'INTEL',
      accent: 'purple',
    },
    {
      icon: Shield,
      title: 'Governance',
      description: 'Community governance and performance-based staking',
      path: '/governance',
      accent: 'purple',
    },
    {
      icon: Cpu,
      title: 'Perps Intelligence',
      description: 'Real-time perpetual futures market analysis',
      path: '/perps',
      badge: 'INTEL',
      accent: 'purple',
    },
    {
      icon: Code,
      title: 'Integration Guide',
      description: 'Documentation for integrating the Oracle service',
      path: '/integration-guide',
      accent: 'purple',
    },
    {
      icon: Webhook,
      title: 'Webhook Integration',
      description: 'TradingView alerts & Nansen whale triggers for automated swarm analysis',
      path: '/webhooks',
      accent: 'yellow',
      badge: 'NEW',
    },
  ];

  const benefits = [
    { icon: CheckCircle2, text: 'Autonomous AI trading agents' },
    { icon: CheckCircle2, text: 'Real-time on-chain execution' },
    { icon: CheckCircle2, text: 'Multi-DEX routing & optimization' },
    { icon: CheckCircle2, text: 'Whale tracking with on-chain intelligence' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-6">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="absolute top-40 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/30 px-6 py-2 text-sm font-medium">
              PUBLIC ACCESS • NO SIGNUP REQUIRED
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-center mb-6 leading-tight"
          >
            <span className="text-white">AI-Powered</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Autonomous Trading
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-400 text-center mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Advanced AI agents execute real-time on-chain trades with whale tracking, 
            advanced on-chain analytics, and community governance
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button
              size="lg"
              onClick={() => router.push('/swarm')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
            >
              Explore Swarm
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/oracle-section')}
              className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 hover:border-blue-500/50 px-8 py-6 text-lg font-semibold transition-all duration-300"
            >
              Explore Oracle
            </Button>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-300">
                <benefit.icon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm">{benefit.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Explore Platform Features
            </h2>
            <p className="text-gray-400 text-lg">
              Choose from our comprehensive suite of AI-powered trading tools
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Card
                  onClick={() => router.push(feature.path)}
                  className="group relative overflow-hidden border-blue-500/20 bg-gradient-to-br from-gray-900/50 to-black/50 hover:from-gray-900/70 hover:to-black/70 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/10 p-6"
                >
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/10 transition-all duration-300" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/15 group-hover:border-blue-400/30 transition-all duration-300">
                        <feature.icon className="h-6 w-6 text-blue-400" />
                      </div>
                      {feature.badge && (
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs font-medium">
                          {feature.badge}
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    
                    <div className="flex items-center text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                      <span>Explore</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2025 Intellitrade. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
