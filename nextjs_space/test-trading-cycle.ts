import { runAsterAutonomousTradingCycle } from './lib/aster-autonomous-trading';
import { prisma } from './lib/db';

async function test() {
  console.log('Testing AsterDEX autonomous trading cycle...\n');
  
  // First check agents
  const agents = await prisma.aIAgent.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      realBalance: true,
      isActive: true,
    },
  });
  
  console.log('Active agents:');
  for (const agent of agents) {
    console.log(`  ${agent.name}: $${agent.realBalance} (active: ${agent.isActive})`);
  }
  
  console.log('\nStarting trading cycle...\n');
  
  const results = await runAsterAutonomousTradingCycle();
  
  console.log('\nResults:');
  for (const result of results) {
    console.log(`  ${result.agentName}: ${result.action || 'ERROR'} - ${result.reason}`);
  }
  
  await prisma.$disconnect();
}

test().catch(console.error);
