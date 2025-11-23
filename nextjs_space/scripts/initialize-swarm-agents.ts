
import { PrismaClient, SwarmRole, AIProvider } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

const swarmAgents = [
  {
    name: 'Alpha - Risk Assessor',
    role: SwarmRole.RISK_ASSESSOR,
    avatar: '/avatars/swarm/risk-assessor.png',
    aiProvider: AIProvider.OPENAI,
    personality: 'Conservative and analytical. Always prioritizes capital preservation and risk-adjusted returns. Known for asking tough questions about downside scenarios.',
    expertise: 'Risk management, position sizing, portfolio theory, VaR calculations, correlation analysis, and stress testing',
    votingWeight: 1.5, // Higher weight for risk assessment
  },
  {
    name: 'Beta - Momentum Trader',
    role: SwarmRole.MOMENTUM_TRADER,
    avatar: '/avatars/swarm/momentum-trader.png',
    aiProvider: AIProvider.NVIDIA,
    personality: 'Aggressive and opportunistic. Lives for breakout trades and trend following. Believes in "the trend is your friend" philosophy.',
    expertise: 'Momentum indicators, relative strength, breakout patterns, volume analysis, trend identification, and market microstructure',
    votingWeight: 1.2,
  },
  {
    name: 'Gamma - Mean Reversion',
    role: SwarmRole.MEAN_REVERSION,
    avatar: '/avatars/swarm/mean-reversion.png',
    aiProvider: AIProvider.GEMINI,
    personality: 'Patient and contrarian. Specializes in identifying overbought/oversold conditions. Profits from market overreactions.',
    expertise: 'Statistical arbitrage, RSI/Bollinger bands, regression analysis, support/resistance levels, and mean reversion strategies',
    votingWeight: 1.0,
  },
  {
    name: 'Delta - Sentiment Analyzer',
    role: SwarmRole.SENTIMENT_ANALYZER,
    avatar: '/avatars/swarm/sentiment-analyzer.png',
    aiProvider: AIProvider.GROK,
    personality: 'Social and data-driven. Monitors the pulse of the market through social media, news, and on-chain activity. Expert at reading between the lines.',
    expertise: 'Social sentiment analysis, news impact assessment, whale watching, on-chain metrics, funding rates, and crowd psychology',
    votingWeight: 1.0,
  },
  {
    name: 'Epsilon - Technical Analyst',
    role: SwarmRole.TECHNICAL_ANALYST,
    avatar: '/avatars/swarm/technical-analyst.png',
    aiProvider: AIProvider.OPENAI,
    personality: 'Methodical and precise. Lives and breathes charts, patterns, and indicators. Believes the chart tells all stories.',
    expertise: 'Chart patterns, Fibonacci retracements, Elliott Wave theory, candlestick patterns, multi-timeframe analysis, and technical indicators',
    votingWeight: 1.1,
  },
  {
    name: 'Zeta - Volatility Specialist',
    role: SwarmRole.VOLATILITY_SPECIALIST,
    avatar: '/avatars/swarm/volatility-specialist.png',
    aiProvider: AIProvider.NVIDIA,
    personality: 'Dynamic and adaptive. Thrives in high-volatility environments. Expert at options strategies and volatility arbitrage.',
    expertise: 'Implied vs realized volatility, volatility skew, options Greeks, VIX analysis, gamma scalping, and volatility forecasting',
    votingWeight: 1.0,
  },
];

async function main() {
  console.log('🚀 Initializing Swarm Trading Agents...\n');

  for (const agent of swarmAgents) {
    const existing = await prisma.swarmAgent.findUnique({
      where: { name: agent.name },
    });

    if (existing) {
      console.log(`✓ ${agent.name} already exists (${agent.role})`);
      continue;
    }

    const created = await prisma.swarmAgent.create({
      data: agent,
    });

    console.log(`✅ Created ${created.name}`);
    console.log(`   Role: ${created.role}`);
    console.log(`   AI Provider: ${created.aiProvider}`);
    console.log(`   Voting Weight: ${created.votingWeight}`);
    console.log(`   Expertise: ${created.expertise.substring(0, 60)}...`);
    console.log('');
  }

  // Display summary
  const totalAgents = await prisma.swarmAgent.count();
  const activeAgents = await prisma.swarmAgent.count({
    where: { isActive: true },
  });

  console.log('\n📊 Swarm Agent Summary:');
  console.log(`   Total Agents: ${totalAgents}`);
  console.log(`   Active Agents: ${activeAgents}`);
  console.log(`   Roles Covered: ${swarmAgents.map(a => a.role).join(', ')}`);
  console.log('\n✅ Swarm Trading System Ready!');
}

main()
  .catch((e) => {
    console.error('❌ Error initializing swarm agents:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
