import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function consolidateAgents() {
  try {
    // Top 3 agents to keep (by PnL performance)
    const keepAgents = [
      { name: 'Volatility Sniper', newBalance: 120 },
      { name: 'Funding Phantom', newBalance: 120 },
      { name: 'Reversion Hunter', newBalance: 70 }
    ];
    
    console.log('=== AGENT CONSOLIDATION ===\n');
    
    // Deactivate all agents first
    await prisma.aIAgent.updateMany({
      data: {
        isActive: false,
        realBalance: 0
      }
    });
    
    console.log('✅ All agents deactivated\n');
    
    // Reactivate and fund top 3
    for (const agent of keepAgents) {
      const updated = await prisma.aIAgent.updateMany({
        where: {
          name: agent.name
        },
        data: {
          isActive: true,
          realBalance: agent.newBalance
        }
      });
      
      console.log(`✅ ${agent.name}: $${agent.newBalance} (Active)`);
    }
    
    console.log('\n=== CONSOLIDATION COMPLETE ===');
    console.log(`Total Active Agents: 3`);
    console.log(`Total Capital: $310`);
    console.log(`Per Agent: $70-120`);
    console.log(`Trade Size Range: $17.50 - $30 (25% of balance)\n`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

consolidateAgents();
