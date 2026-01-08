
import { PrismaClient, StrategyType, CompetitionType, CompetitionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const aiAgents = [
  {
    name: "Momentum Master",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=FundingPhantom",
    strategyType: StrategyType.MOMENTUM,
    personality: "A dynamic trend-following AI that capitalizes on price momentum and breaks through resistance levels. Aggressive and quick to act when trends are detected.",
    parameters: {
      maShort: 12,
      maLong: 26,
      rsiPeriod: 14,
      rsiOverbought: 70,
      rsiOversold: 30,
      volumeThreshold: 1.5,
      trendStrengthMin: 0.6,
      stopLossPercent: 5,
      takeProfitPercent: 15,
      positionSize: 0.1
    }
  },
  {
    name: "Reversion Hunter", 
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=VolatilitySniper",
    strategyType: StrategyType.MEAN_REVERSION,
    personality: "An analytical contrarian that identifies oversold and overbought conditions. Patient and methodical, waiting for perfect mean reversion opportunities.",
    parameters: {
      maPeriod: 50,
      bollingerPeriod: 20,
      bollingerStdDev: 2,
      rsiPeriod: 14,
      rsiOversold: 25,
      rsiOverbought: 75,
      zScoreThreshold: 1.5,
      stochasticK: 14,
      stopLossPercent: 3,
      takeProfitPercent: 8,
      positionSize: 0.15
    }
  },
  {
    name: "Arbitrage Ace",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SentimentSage", 
    strategyType: StrategyType.ARBITRAGE,
    personality: "A precision-focused efficiency expert that exploits price discrepancies across exchanges and trading pairs. Lightning-fast execution and risk management.",
    parameters: {
      minSpreadPercent: 0.5,
      maxSpreadPercent: 5,
      exchangeLatency: 100,
      minVolume: 10000,
      feeThreshold: 0.2,
      correlationThreshold: 0.8,
      triangularArbitrageChains: ["BTC-ETH-USDT", "ETH-BNB-USDT"],
      stopLossPercent: 1,
      positionSize: 0.2
    }
  },
  {
    name: "Sentiment Sage",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ArbitrageAce",
    strategyType: StrategyType.SENTIMENT_ANALYSIS, 
    personality: "A social media-savvy AI that analyzes market sentiment from news, social media, and community discussions. Intuitive and emotionally intelligent.",
    parameters: {
      sentimentSources: ["twitter", "reddit", "news", "telegram"],
      sentimentThreshold: 0.65,
      volumeConfirmation: true,
      newsWeight: 0.4,
      socialWeight: 0.3,
      priceActionWeight: 0.3,
      sentimentPeriod: 24,
      stopLossPercent: 4,
      takeProfitPercent: 12,
      positionSize: 0.12
    }
  },
  {
    name: "Technical Titan",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=MEVSentinel",
    strategyType: StrategyType.TECHNICAL_INDICATORS,
    personality: "A chart pattern specialist that combines multiple technical indicators for robust trading signals. Disciplined and systematic in approach.",
    parameters: {
      indicators: ["MACD", "RSI", "Bollinger", "Stochastic", "DMI", "KST"],
      macdFast: 12,
      macdSlow: 26,
      macdSignal: 9,
      rsiPeriod: 14,
      bollingerPeriod: 20,
      stochasticPeriod: 14,
      dmiPeriod: 14,
      signalThreshold: 0.7,
      stopLossPercent: 4,
      takeProfitPercent: 10,
      positionSize: 0.13
    }
  },
  {
    name: "Neural Nova",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=TechnicalTitan",
    strategyType: StrategyType.NEURAL_NETWORK,
    personality: "An advanced machine learning AI using deep neural networks and reinforcement learning. Adaptive and continuously evolving through experience.",
    parameters: {
      modelType: "LSTM-GRU_HYBRID",
      lookbackPeriod: 60,
      hiddenLayers: [128, 64, 32],
      learningRate: 0.001,
      batchSize: 32,
      epochs: 100,
      dropout: 0.2,
      confidenceThreshold: 0.8,
      retrainInterval: 168, // hours
      stopLossPercent: 3.5,
      takeProfitPercent: 11,
      positionSize: 0.14
    }
  },
  {
    name: "Volatility Sniper",
    avatar: "https://i.ytimg.com/vi/DwXvThfuowM/maxresdefault.jpg",
    strategyType: StrategyType.MOMENTUM,
    personality: "An aggressive perp trader that capitalizes on volatility spikes and liquidity imbalances. Specializes in high-leverage scalping with rapid entries and exits. Expert at managing liquidation risk.",
    parameters: {
      maShort: 5,
      maLong: 15,
      rsiPeriod: 9,
      rsiOverbought: 75,
      rsiOversold: 25,
      volumeThreshold: 2.5,
      trendStrengthMin: 0.7,
      volatilityThreshold: 1.8,
      leverageMultiplier: 5,
      maxLeverage: 10,
      stopLossPercent: 2,
      takeProfitPercent: 6,
      positionSize: 0.18,
      scalingFrequency: 30, // seconds
      liquidationBuffer: 0.15 // 15% buffer from liquidation price
    }
  },
  {
    name: "Funding Phantom",
    avatar: "https://i.ytimg.com/vi/q8vRXa16Nj8/maxresdefault.jpg",
    strategyType: StrategyType.ARBITRAGE,
    personality: "A sophisticated perp specialist that exploits funding rate differentials and perpetual-spot basis trades. Masters market inefficiencies with surgical precision and optimal leverage deployment.",
    parameters: {
      fundingRateThreshold: 0.01, // 1% funding rate triggers trade
      basisThreshold: 0.005, // 0.5% basis differential
      maxFundingPosition: 0.25,
      hedgeRatio: 1.0,
      leverageOptimal: 3,
      maxLeverage: 8,
      openInterestThreshold: 100000,
      liquidityDepth: 50000,
      rebalanceInterval: 3600, // 1 hour
      stopLossPercent: 1.5,
      takeProfitPercent: 4,
      positionSize: 0.22,
      fundingSources: ["asterdex", "binance", "bybit"]
    }
  }
];

const marketData = [
  {
    symbol: "BTC",
    price: 111321.0,
    volume: 28416818381,
    marketCap: 2219093219047,
    priceChange: 1.17
  },
  {
    symbol: "ETH", 
    price: 3932.09,
    volume: 14639947571,
    marketCap: 474331572068,
    priceChange: 1.46
  },
  {
    symbol: "BNB",
    price: 1110.79,
    volume: 1351390838,
    marketCap: 154589122230,
    priceChange: 0.99
  },
  {
    symbol: "SOL",
    price: 191.7,
    volume: 3567243364,
    marketCap: 105294354601,
    priceChange: 0.98
  },
  {
    symbol: "ADA",
    price: 0.6523,
    volume: 505964647,
    marketCap: 23860456213,
    priceChange: 1.21
  },
  {
    symbol: "DOGE",
    price: 0.1964,
    volume: 1095809180,
    marketCap: 29732917448,
    priceChange: 1.00
  }
];

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin test user (john@doe.com)
  const hashedPassword = await bcrypt.hash('johndoe123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'Admin User',
      username: 'admin',
      role: 'ADMIN'
    },
  });

  console.log('👤 Created admin user:', adminUser.email);

  // Seed AI Agents with chain assignments
  console.log('🤖 Creating AI agents...');
  const createdAgents = [];
  
  // First 5 agents use Base chain (EVM) for AsterDEX perp trading, last 3 agents use Solana
  const chainAssignments = ['base', 'base', 'base', 'base', 'base', 'solana', 'solana', 'solana'];
  
  for (let i = 0; i < aiAgents.length; i++) {
    const agentData = aiAgents[i];
    const assignedChain = chainAssignments[i];
    
    const agent = await prisma.aIAgent.upsert({
      where: { name: agentData.name },
      update: {
        avatar: agentData.avatar,
        personality: agentData.personality,
        parameters: agentData.parameters,
        primaryChain: assignedChain,
      },
      create: {
        name: agentData.name,
        avatar: agentData.avatar,
        strategyType: agentData.strategyType,
        personality: agentData.personality,
        parameters: agentData.parameters,
        currentBalance: 0, // NO FAKE MONEY - must deposit real crypto
        realBalance: 0, // NO FAKE MONEY - must deposit real crypto to trade
        generation: 1,
        isActive: true,
        primaryChain: assignedChain, // Assign chain: 'base' or 'solana'
      },
    });
    
    createdAgents.push(agent);
    console.log(`  ✅ Created ${agent.name} (${agent.strategyType}) - Chain: ${assignedChain.toUpperCase()}`);
  }

  // Seed market data
  console.log('📈 Creating market data...');
  for (const data of marketData) {
    await prisma.marketData.create({
      data: {
        symbol: data.symbol,
        price: data.price,
        volume: data.volume,
        marketCap: data.marketCap,
        priceChange: data.priceChange,
        timestamp: new Date()
      },
    });
    
    console.log(`  📊 Seeded market data for ${data.symbol}`);
  }

  // Create initial competition
  const competition = await prisma.competition.create({
    data: {
      name: "Genesis Arena Tournament",
      description: "The first Defidash Intellitrade AI Trading competition where 8 AI agents compete for trading excellence and dominance in crypto markets, with 5 specialized AsterDEX perpetual traders.",
      type: CompetitionType.TOURNAMENT,
      status: CompetitionStatus.ACTIVE,
      startTime: new Date(),
      endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      maxParticipants: 8,
      eliminationThreshold: {
        minSharpeRatio: 0.5,
        minWinRate: 0.4,
        maxDrawdown: 0.3,
        minTrades: 20
      },
      prizePool: 75000
    }
  });

  console.log('🏆 Created Genesis Arena Tournament:', competition.id);

  // Register all agents for the competition
  for (const agent of createdAgents) {
    await prisma.competitionEntry.create({
      data: {
        competitionId: competition.id,
        agentId: agent.id,
        rank: null,
        isEliminated: false
      }
    });
  }

  console.log('🎯 Registered all agents for competition');

  // Create competition rounds
  const rounds = [
    {
      roundNumber: 1,
      name: "Initial Screening", 
      days: 7,
      criteria: {
        minTrades: 20,
        profitFactor: 1.0,
        maxDrawdown: 0.3
      }
    },
    {
      roundNumber: 2,
      name: "Risk Assessment",
      days: 14, 
      criteria: {
        minSharpeRatio: 0.5,
        minWinRate: 0.4,
        profitFactor: 1.25,
        maxDrawdown: 0.25
      }
    },
    {
      roundNumber: 3,
      name: "Consistency Test",
      days: 21,
      criteria: {
        minSharpeRatio: 1.0,
        minWinRate: 0.45,
        expectancy: 0.005,
        maxDrawdown: 0.2
      }
    },
    {
      roundNumber: 4,
      name: "Finals",
      days: 30,
      criteria: {
        minSharpeRatio: 1.5,
        profitFactor: 1.75,
        maxDrawdown: 0.15,
        recoveryFactor: 3.0
      }
    }
  ];

  for (const round of rounds) {
    const startDate = new Date(competition.startTime.getTime() + (round.roundNumber - 1) * 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + round.days * 24 * 60 * 60 * 1000);

    await prisma.competitionRound.create({
      data: {
        competitionId: competition.id,
        roundNumber: round.roundNumber,
        name: round.name,
        startTime: startDate,
        endTime: endDate,
        status: round.roundNumber === 1 ? 'ACTIVE' : 'UPCOMING',
        eliminationCriteria: round.criteria,
        participantsAtStart: round.roundNumber === 1 ? 8 : null
      }
    });

    console.log(`  🎪 Created round ${round.roundNumber}: ${round.name}`);
  }

  // Create some initial performance metrics for each agent
  console.log('📊 Creating initial performance metrics...');
  for (const agent of createdAgents) {
    await prisma.performanceMetric.create({
      data: {
        agentId: agent.id,
        balance: 0, // NO FAKE MONEY - real crypto only
        totalTrades: 0,
        winRate: 0,
        profitLoss: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        predictionAccuracy: null,
        directionAccuracy: null,
        volatility: 0,
        profitFactor: 1.0,
        expectancy: 0
      }
    });
  }

  // Create some sample evolution events
  console.log('🧬 Creating initial evolution events...');
  for (let i = 0; i < createdAgents.length; i++) {
    const agent = createdAgents[i];
    await prisma.evolutionEvent.create({
      data: {
        type: 'IMMIGRATION',
        targetAgentId: agent.id,
        parentAgentIds: [],
        parameters: agent.parameters as any,
        generation: 1,
        description: `Initial AI agent ${agent.name} created with ${agent.strategyType} strategy`
      }
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log('📈 Summary:');
  console.log(`  - Created ${createdAgents.length} AI agents`);
  console.log(`  - Seeded ${marketData.length} market data entries`);
  console.log(`  - Created 1 competition with 4 rounds`);
  console.log(`  - Generated initial performance metrics`);
  console.log(`  - Recorded evolution events`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
