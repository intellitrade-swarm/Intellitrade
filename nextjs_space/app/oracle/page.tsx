
import { Metadata } from 'next';
import EnhancedOracleDashboard from './components/enhanced-oracle-dashboard';
import { prisma } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Premiere Oracle Service - Intellitrade',
  description: 'Advanced blockchain oracle with multi-source aggregation, AI insights, and on-chain data feeds',
};

// Force rebuild - Fixed hydration serialization issues

export default async function OraclePage() {
  // No authentication required - open platform access

  // Fetch comprehensive trading data
  const [
    agents,
    recentTrades,
    asterDexTrades,
    treasuryStats
  ] = await Promise.all([
    // Get all active agents with their latest performance
    prisma.aIAgent.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        strategyType: true,
        aiProvider: true,
        currentBalance: true,
        realBalance: true,
        totalTrades: true,
        winRate: true,
        totalProfitLoss: true,
        primaryChain: true,
        walletAddress: true,
        solanaWalletAddress: true,
        bscWalletAddress: true
      }
    }),
    
    // Get recent trades (last 24 hours)
    prisma.trade.findMany({
      where: {
        entryTime: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      include: {
        agent: {
          select: {
            name: true,
            strategyType: true
          }
        }
      },
      orderBy: {
        entryTime: 'desc'
      },
      take: 50
    }),
    
    // Get AsterDEX specific trades (last 7 days)
    prisma.trade.findMany({
      where: {
        chain: 'astar-zkevm',
        entryTime: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        agent: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        entryTime: 'desc'
      }
    }),
    
    // Get treasury data (public stats)
    fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/treasury/stats`)
      .then(res => res.ok ? res.json() : null)
      .catch(() => null)
  ]);

  // Calculate comprehensive stats
  const totalAgentFunds = agents.reduce((sum, a) => sum + (a.realBalance || 0), 0);
  const totalTrades24h = recentTrades.length;
  const profitableTrades24h = recentTrades.filter(t => (t.profitLoss || 0) > 0).length;
  const totalPnL24h = recentTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
  
  // AsterDEX stats
  const asterDexStats = {
    totalTrades: asterDexTrades.length,
    totalPnL: asterDexTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0),
    activeAgents: new Set(asterDexTrades.map(t => t.agentId)).size
  };

  // Serialize data to ensure JSON compatibility (no Date objects, etc.)
  const enhancedData = {
    agents: agents.map(agent => ({
      ...agent,
      // Ensure all values are JSON-serializable
      currentBalance: agent.currentBalance || 0,
      realBalance: agent.realBalance || 0,
      totalTrades: agent.totalTrades || 0,
      winRate: agent.winRate || 0,
      totalProfitLoss: agent.totalProfitLoss || 0
    })),
    tradingStats: {
      total24h: totalTrades24h,
      profitable24h: profitableTrades24h,
      winRate24h: totalTrades24h > 0 ? (profitableTrades24h / totalTrades24h) * 100 : 0,
      totalPnL24h,
      totalAgentFunds
    },
    asterDexStats,
    treasuryBalance: treasuryStats?.balance?.total || 0,
    recentTrades: recentTrades.slice(0, 10).map(trade => ({
      id: trade.id,
      agentId: trade.agentId,
      symbol: trade.symbol,
      type: trade.type,
      side: trade.side,
      quantity: trade.quantity || 0,
      entryPrice: trade.entryPrice || 0,
      exitPrice: trade.exitPrice || 0,
      profitLoss: trade.profitLoss || 0,
      status: trade.status,
      chain: trade.chain,
      entryTime: trade.entryTime?.toISOString() || null,
      exitTime: trade.exitTime?.toISOString() || null,
      agent: trade.agent
    }))
  };

  return (
    <div className="min-h-screen bg-terminal-black relative font-terminal overflow-hidden">
      {/* Terminal Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-terminal" />
        <div className="absolute inset-0 bg-scanline opacity-20" />
        <div className="absolute inset-0 animate-flicker" 
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.03) 2px, rgba(0, 255, 65, 0.03) 4px)'
          }} 
        />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0, 255, 65, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto p-6 relative z-10">
        <EnhancedOracleDashboard enhancedData={enhancedData} />
      </div>
    </div>
  );
}
