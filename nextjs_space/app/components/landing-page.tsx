
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Icons } from '../../components/ui/icons';

// Move agents array outside component to prevent redefinition on every render
const agents = [
  { name: "Momentum Master", strategy: "Trend Following", color: "from-blue-500 to-blue-500", generation: 5, winRate: 68.4, sharpe: 2.31 },
  { name: "Reversion Hunter", strategy: "Mean Reversion", color: "from-blue-500 to-blue-400", generation: 4, winRate: 65.2, sharpe: 1.87 },
  { name: "Arbitrage Ace", strategy: "Price Discrepancy", color: "from-blue-500 to-amber-500", generation: 3, winRate: 71.8, sharpe: 2.54 },
  { name: "Sentiment Sage", strategy: "Market Psychology", color: "from-blue-500 to-blue-400", generation: 6, winRate: 62.9, sharpe: 1.92 },
  { name: "Technical Titan", strategy: "Chart Patterns", color: "from-red-500 to-rose-500", generation: 4, winRate: 69.5, sharpe: 2.18 },
  { name: "Neural Nova", strategy: "Deep Learning", color: "from-blue-600 to-fuchsia-500", generation: 5, winRate: 73.1, sharpe: 2.67 }
];

export function LandingPage() {
  const [currentAgent, setCurrentAgent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAgent((prev) => (prev + 1) % agents.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array since agents is now a constant

  return (
    <div className="min-h-screen bg-black text-terminal-green relative overflow-hidden font-terminal hive-gradient grid-pattern">
      {/* Terminal Header with Neon Effects */}
      <header className="border-b border-neon-cyan/40 sticky top-0 z-50 bg-black/80 backdrop-blur-xl neon-border-cyan">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <div className="relative flex-shrink-0 animate-hexagon-pulse">
                <div className="h-10 w-10 sm:h-12 sm:w-12 hexagon-sm bg-neon-cyan/10 border border-neon-cyan flex items-center justify-center pulse-ring">
                  <span className="text-2xl sm:text-3xl font-bold text-neon-cyan neon-text-cyan animate-neural-glow">&gt;_</span>
                </div>
              </div>
              <div className="min-w-0">
                <span className="text-xl sm:text-3xl font-bold tracking-tight block truncate font-terminal">
                  <span className="holographic animate-swarm-float">
                    [INTELLITRADE]
                  </span>
                </span>
                <div className="text-[8px] sm:text-[10px] uppercase tracking-[0.3em] text-neon-cyan/70 font-terminal truncate">
                  &gt;&gt; SWARM INTELLIGENCE PROTOCOL v4.0
                </div>
              </div>
            </div>
            <div className="flex space-x-2 sm:space-x-4 flex-shrink-0">
              <Link href="/auth/signin">
                <button className="neon-button-cyan text-xs sm:text-sm px-3 sm:px-6 py-2 font-mono">
                  [CONNECT]
                </button>
              </Link>
              <Link href="/auth/signup">
                <button className="neon-button-magenta text-xs sm:text-sm px-3 sm:px-6 py-2 font-mono">
                  [INITIATE]
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Swarm Intelligence Design */}
      <section className="relative py-32 overflow-hidden">
        {/* Neon Swarm Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-neon-cyan/[0.08] rounded-full blur-[100px] animate-neon-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-neon-magenta/[0.06] rounded-full blur-[120px] animate-neon-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-neon-purple/[0.04] rounded-full blur-[150px] animate-neon-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <div className="inline-block px-6 py-2 mb-8 rounded-full neon-border-cyan bg-black/50 backdrop-blur-sm pulse-ring">
                <span className="holographic font-medium text-sm uppercase tracking-wider font-mono">
                  ◆ NEURAL SWARM TRADING PROTOCOL ◆
                </span>
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-6xl font-bold mb-8 leading-tight px-4 break-words max-w-full"
            >
              <span className="text-white">Elite </span>
              <span className="bg-gradient-to-r from-[#3385ff] via-[#0047b3] to-[#3385ff] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(51,133,255,0.5)]">
                AI Agents
              </span>
              <br />
              <span className="text-white/90">Trading at Scale</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base sm:text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed max-w-3xl mx-auto font-light px-4 break-words"
            >
              Experience institutional-grade autonomous trading powered by cutting-edge AI.
              <span className="text-[#3385ff] font-medium"> Six sophisticated agents</span> execute
              <span className="text-[#0047b3] font-medium"> real-time strategies</span> across global crypto markets.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4"
            >
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-[#3385ff] to-[#0047b3] hover:from-[#3385ff]/90 hover:to-[#0047b3]/90 text-black font-bold text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-7 shadow-[0_0_40px_rgba(51,133,255,0.4)] hover:shadow-[0_0_60px_rgba(51,133,255,0.6)] transition-all duration-300 group">
                  <Icons.play className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <span className="truncate">Access Platform</span>
                </Button>
              </Link>
              <Link href="/arena?demo=true" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-[#3385ff]/50 text-white hover:bg-[#3385ff]/10 hover:border-[#3385ff] text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-7 hover:shadow-[0_0_30px_rgba(51,133,255,0.3)] transition-all duration-300 group">
                  <Icons.eye className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <span className="truncate">Live Demo</span>
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Premium Agent Showcase */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-32"
        >
          <div className="text-center mb-16 px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 break-words">
              <span className="bg-gradient-to-r from-[#3385ff] to-[#0047b3] bg-clip-text text-transparent">
                Elite Trader Lineup
              </span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg font-light break-words">Six proprietary AI agents, each with institutional-grade strategies</p>
          </div>
          
          <Card className="premium-card terminal-crt-screen terminal-glow-border p-4 sm:p-8 md:p-12 mx-4">
            <CardContent className="text-center">
              <motion.div
                key={currentAgent}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 sm:space-y-8"
              >
                <div className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32 mb-6 sm:mb-8">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${agents[currentAgent].color} terminal-pulse-glow`}></div>
                  <div className={`relative w-full h-full rounded-full bg-gradient-to-r ${agents[currentAgent].color} flex items-center justify-center border-2 border-white/20`}>
                    <Icons.brain className="h-12 w-12 sm:h-16 sm:w-16 text-white drop-shadow-lg" />
                  </div>
                </div>
                <div className="px-4">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 break-words">{agents[currentAgent].name}</h3>
                  <p className="text-[#3385ff] text-lg sm:text-xl font-light mb-6 sm:mb-8 break-words">{agents[currentAgent].strategy} Specialist</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-8 text-base">
                  <div className="px-4 sm:px-6 py-3 rounded-2xl bg-black/50 border border-[#3385ff]/30 backdrop-blur-sm min-w-[100px]">
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1 truncate">Generation</div>
                    <div className="text-[#3385ff] font-bold text-lg sm:text-xl">{agents[currentAgent].generation}</div>
                  </div>
                  <div className="px-4 sm:px-6 py-3 rounded-2xl bg-black/50 border border-[#3385ff]/30 backdrop-blur-sm min-w-[100px]">
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1 truncate">Win Rate</div>
                    <div className="text-[#3385ff] font-bold text-lg sm:text-xl">{agents[currentAgent].winRate}%</div>
                  </div>
                  <div className="px-4 sm:px-6 py-3 rounded-2xl bg-black/50 border border-[#3385ff]/30 backdrop-blur-sm min-w-[100px]">
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1 truncate">Sharpe Ratio</div>
                    <div className="text-[#3385ff] font-bold text-lg sm:text-xl">{agents[currentAgent].sharpe.toFixed(2)}</div>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Premium Features Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Premium background gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0f0d]/50 to-black" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(0, 255, 136, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 136, 0.02) 1px, transparent 1px)',
            backgroundSize: '100px 100px'
          }} />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-20 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 break-words">
                <span className="bg-gradient-to-r from-[#3385ff] to-[#0047b3] bg-clip-text text-transparent">
                  Platform Capabilities
                </span>
              </h2>
              <p className="text-base sm:text-xl text-gray-400 font-light break-words">Institutional-grade infrastructure for <span className="text-[#3385ff]">autonomous trading</span></p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Icons.zap,
                title: "Real-Time Execution",
                description: "Sub-millisecond decision-making with live market data streaming and instant trade execution"
              },
              {
                icon: Icons.shuffle,
                title: "Adaptive Learning",
                description: "Continuous strategy optimization through reinforcement learning and performance-based evolution"
              },
              {
                icon: Icons.trophy,
                title: "Tournament Selection",
                description: "Competitive elimination rounds ensure only the highest-performing algorithms persist"
              },
              {
                icon: Icons.barChart,
                title: "Advanced Analytics",
                description: "Comprehensive metrics including Sharpe ratios, drawdowns, and risk-adjusted returns"
              },
              {
                icon: Icons.globe,
                title: "Blockchain Verified",
                description: "All trades and performance data immutably recorded on-chain for complete transparency"
              },
              {
                icon: Icons.users,
                title: "Institutional Access",
                description: "Monitor portfolio performance, access historical data, and track agent evolution in real-time"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="premium-card terminal-crt-screen terminal-glow-border h-full hover:border-[#3385ff]/50 transition-all duration-500 group">
                  <CardContent className="p-8 text-center">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-[#3385ff] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                      <feature.icon className="h-14 w-14 text-[#3385ff] relative group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed font-light">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Premium glow effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#3385ff]/[0.06] rounded-full blur-[150px] terminal-pulse-glow" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <Card className="premium-card terminal-crt-screen terminal-glow-border p-16 text-center">
              <CardContent>
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  <span className="text-white">Join the </span>
                  <span className="bg-gradient-to-r from-[#3385ff] to-[#0047b3] bg-clip-text text-transparent">
                    Elite
                  </span>
                </h2>
                <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
                  Access institutional-grade AI trading infrastructure. 
                  <span className="text-[#3385ff] font-medium"> Thousands of traders</span> are already leveraging autonomous intelligence.
                </p>
                <Link href="/auth/signup">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-[#3385ff] to-[#0047b3] hover:from-[#3385ff]/90 hover:to-[#0047b3]/90 text-black font-bold text-xl px-16 py-8 shadow-[0_0_50px_rgba(51,133,255,0.5)] hover:shadow-[0_0_70px_rgba(51,133,255,0.7)] transition-all duration-300"
                  >
                    Start Trading Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="relative border-t border-[#3385ff]/20 backdrop-blur-xl py-12">
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#3385ff] to-[#0047b3] flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-[#3385ff] blur-lg opacity-20" />
              </div>
              <div>
                <div className="text-xl font-bold">
                  <span className="text-[#3385ff]">Defidash</span>
                  <span className="text-white"> Intellitrade</span>
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500">
                  Intelligent Trading Platform
                </div>
              </div>
            </div>
            <div className="text-gray-400 text-sm text-center md:text-right">
              <div className="mb-1">© 2025 Intellitrade. All rights reserved.</div>
              <div className="text-xs">
                The future of <span className="text-[#3385ff]">AI-powered trading</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
