import { prisma } from '../lib/db';
import { AIProvider } from '@prisma/client';

async function updateAgents() {
  console.log('Updating AI providers for all agents...\n');
  
  // Update all agents to use working AI providers
  const updates: Array<{ name: string; aiProvider: AIProvider }> = [
    { name: 'Reversion Hunter', aiProvider: AIProvider.OPENAI },
    { name: 'Sentiment Sage', aiProvider: AIProvider.OPENAI },
    { name: 'Arbitrage Ace', aiProvider: AIProvider.OPENAI }, // Switch from GROK to OPENAI
    { name: 'Neural Nova', aiProvider: AIProvider.NVIDIA },
    { name: 'Momentum Master', aiProvider: AIProvider.NVIDIA },
    { name: 'Technical Titan', aiProvider: AIProvider.NVIDIA },
  ];
  
  for (const update of updates) {
    const agent = await prisma.aIAgent.findFirst({
      where: { name: update.name }
    });
    
    if (agent) {
      await prisma.aIAgent.update({
        where: { id: agent.id },
        data: { aiProvider: update.aiProvider }
      });
      console.log(`✅ ${update.name}: ${agent.aiProvider} → ${update.aiProvider}`);
    }
  }
  
  console.log('\n✅ All agents updated to use working AI providers');
  
  await prisma.$disconnect();
}

updateAgents().catch(console.error);
