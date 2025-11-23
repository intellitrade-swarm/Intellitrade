import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Updating new agents to Base chain for AsterDEX trading...');

  // Update Volatility Sniper to Base chain
  const volatilitySniper = await prisma.aIAgent.updateMany({
    where: { name: "Volatility Sniper" },
    data: { primaryChain: "base" }
  });

  // Update Funding Phantom to Base chain
  const fundingPhantom = await prisma.aIAgent.updateMany({
    where: { name: "Funding Phantom" },
    data: { primaryChain: "base" }
  });

  console.log('✅ Updated Volatility Sniper to Base chain');
  console.log('✅ Updated Funding Phantom to Base chain');
  
  // Show all agents with their chains
  const allAgents = await prisma.aIAgent.findMany({
    select: {
      name: true,
      strategyType: true,
      primaryChain: true,
      isActive: true
    }
  });
  
  console.log('\n📊 All agents:');
  for (const agent of allAgents) {
    console.log(`  ${agent.name} (${agent.strategyType}) - Chain: ${agent.primaryChain?.toUpperCase() || 'BASE'} - Active: ${agent.isActive}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
