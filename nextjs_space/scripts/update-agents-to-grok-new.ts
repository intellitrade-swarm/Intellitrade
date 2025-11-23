
import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../lib/db';

async function updateAgentsToGrok() {
  try {
    // Get all agents
    const agents = await prisma.aIAgent.findMany({
      select: { id: true, name: true, aiProvider: true }
    });

    console.log('Current agents:', agents);

    // Update specific agents to use Grok
    // Let's update 2-3 agents to use Grok for diversity
    const agentsToUpdate = ['Arbitrage Ace', 'Momentum Master', 'Sentiment Sage'];
    
    for (const agentName of agentsToUpdate) {
      const agent = agents.find(a => a.name === agentName);
      if (agent) {
        await prisma.aIAgent.update({
          where: { id: agent.id },
          data: { aiProvider: 'GROK' }
        });
        console.log(`✅ Updated ${agentName} to use Grok`);
      }
    }

    // Verify updates
    const updatedAgents = await prisma.aIAgent.findMany({
      where: { aiProvider: 'GROK' },
      select: { name: true, aiProvider: true, realBalance: true }
    });

    console.log('\n✅ Agents now using Grok:');
    updatedAgents.forEach(agent => {
      console.log(`  - ${agent.name} (Balance: $${agent.realBalance.toFixed(2)})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAgentsToGrok();
