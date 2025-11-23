
/**
 * Update 2 agents to use Grok AI
 */

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
config();

const prisma = new PrismaClient();

async function main() {
  console.log('🤖 Updating agents to use Grok AI...\n');
  
  // Get all agents
  const agents = await prisma.aIAgent.findMany({
    select: {
      id: true,
      name: true,
      aiProvider: true,
      strategyType: true
    },
    orderBy: {
      name: 'asc'
    }
  });
  
  console.log(`Found ${agents.length} total agents\n`);
  
  if (agents.length < 2) {
    console.log('❌ Need at least 2 agents to update. Please create agents first.');
    return;
  }
  
  // Select 2 agents to update - prefer different strategies
  const agentsToUpdate = [];
  const strategies = new Set<string>();
  
  for (const agent of agents) {
    if (agentsToUpdate.length >= 2) break;
    if (!strategies.has(agent.strategyType)) {
      agentsToUpdate.push(agent);
      strategies.add(agent.strategyType);
    }
  }
  
  // If we still need more agents, just take the next ones
  if (agentsToUpdate.length < 2) {
    for (const agent of agents) {
      if (agentsToUpdate.length >= 2) break;
      if (!agentsToUpdate.find(a => a.id === agent.id)) {
        agentsToUpdate.push(agent);
      }
    }
  }
  
  console.log('📝 Agents selected for Grok AI update:\n');
  agentsToUpdate.forEach((agent, i) => {
    console.log(`${i + 1}. ${agent.name}`);
    console.log(`   Current Provider: ${agent.aiProvider}`);
    console.log(`   Strategy: ${agent.strategyType}\n`);
  });
  
  // Update the agents
  for (const agent of agentsToUpdate) {
    await prisma.aIAgent.update({
      where: { id: agent.id },
      data: { aiProvider: 'GROK' }
    });
    console.log(`✅ Updated ${agent.name} to use Grok AI`);
  }
  
  console.log('\n✨ Successfully updated 2 agents to use Grok AI!');
  console.log('\n📊 Updated Agent Summary:');
  
  const updatedAgents = await prisma.aIAgent.findMany({
    where: {
      id: {
        in: agentsToUpdate.map(a => a.id)
      }
    },
    select: {
      name: true,
      aiProvider: true,
      strategyType: true,
      personality: true
    }
  });
  
  updatedAgents.forEach((agent, i) => {
    console.log(`\n${i + 1}. ${agent.name}`);
    console.log(`   AI Provider: ${agent.aiProvider} ✨`);
    console.log(`   Strategy: ${agent.strategyType}`);
    console.log(`   Personality: ${agent.personality.substring(0, 100)}...`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
