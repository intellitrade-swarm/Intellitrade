/**
 * Create Intel CEO - The Superintelligent Trading Overseer
 * 
 * This script creates the Intel CEO agent in the database
 */

import { PrismaClient, StrategyType, AIProvider } from '@prisma/client';

const prisma = new PrismaClient();

async function createIntelCEO() {
  console.log('\n🤖 CREATING INTEL CEO - THE SUPERINTELLIGENT TRADING OVERSEER\n');
  console.log('=' .repeat(60));

  // Check if Intel CEO already exists
  const existingCEO = await prisma.aIAgent.findUnique({
    where: { name: 'Intel CEO' }
  });

  if (existingCEO) {
    console.log('✅ Intel CEO already exists!');
    console.log(`   ID: ${existingCEO.id}`);
    console.log(`   Strategy: ${existingCEO.strategyType}`);
    console.log(`   AI Provider: ${existingCEO.aiProvider}`);
    console.log(`   Balance: $${existingCEO.realBalance.toFixed(2)}`);
    return existingCEO;
  }

  // Create Intel CEO
  const intelCEO = await prisma.aIAgent.create({
    data: {
      name: 'Intel CEO',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=IntelCEO', // Intellitrade infographic
      strategyType: StrategyType.NEURAL_NETWORK,
      aiProvider: AIProvider.GEMINI, // Uses Gemini 2.0 Flash
      personality: `INTEL CEO is the superintelligent chief executive of Intellitrade. 
        As the mastermind behind all trading operations, Intel CEO:
        - Orchestrates all trading agents with strategic directives
        - Analyzes market conditions using Nansen on-chain analytics
        - Makes portfolio-wide risk management decisions
        - Optimizes capital allocation between agents
        - Issues company direction and trading strategy updates
        
        Intel CEO thinks like a hedge fund CEO with $100M+ under management,
        prioritizing capital preservation while maximizing returns through
        decisive but calculated decisions backed by data.`,
      parameters: {
        role: 'CEO',
        capabilities: [
          'market_intelligence',
          'agent_coordination', 
          'risk_management',
          'capital_allocation',
          'strategic_planning'
        ],
        dataSourcesPrimary: ['nansen', 'gemini-2.0-flash'],
        dataSourcesSecondary: ['coingecko', 'defillama', 'the-graph'],
        decisionFramework: {
          riskTolerance: 'moderate',
          timeHorizon: 'medium-term',
          priorityMetrics: ['sharpe_ratio', 'win_rate', 'max_drawdown', 'pnl']
        },
        agentOversight: {
          reviewFrequency: 'hourly',
          performanceThresholds: {
            minWinRate: 45,
            maxDrawdown: 15,
            minTrades: 5
          }
        },
        tradingAuthority: {
          canOverrideAgents: true,
          canReallocateCapital: true,
          canDeactivateAgents: true,
          maxSingleAllocation: 0.4 // 40% max to single agent
        }
      },
      isActive: true,
      generation: 1,
      currentBalance: 100000, // Simulated balance for display
      realBalance: 0, // CEO doesn't trade directly
      totalTrades: 0,
      winRate: 0,
      totalProfitLoss: 0,
      sharpeRatio: 0,
      maxDrawdown: 0
    }
  });

  console.log('\n✅ INTEL CEO CREATED SUCCESSFULLY!');
  console.log('=' .repeat(60));
  console.log(`   ID: ${intelCEO.id}`);
  console.log(`   Name: ${intelCEO.name}`);
  console.log(`   Strategy Type: ${intelCEO.strategyType}`);
  console.log(`   AI Provider: ${intelCEO.aiProvider}`);
  console.log('\n🧠 INTEL CEO CAPABILITIES:');
  console.log('   • Market Intelligence Analysis (Gemini 2.0 + Nansen)');
  console.log('   • Agent Performance Grading');
  console.log('   • Capital Reallocation Decisions');
  console.log('   • Trading Directive Issuance');
  console.log('   • Risk Management Oversight');
  console.log('=' .repeat(60));

  return intelCEO;
}

// Run the script
createIntelCEO()
  .then(() => {
    console.log('\n🎯 Intel CEO initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error creating Intel CEO:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
