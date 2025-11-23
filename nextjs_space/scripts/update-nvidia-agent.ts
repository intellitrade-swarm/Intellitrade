

import 'dotenv/config';
import { prisma } from '../lib/db';

async function main() {
  const agentName = process.argv[2] || 'Technical Titan';
  
  try {
    console.log(`🔍 Looking for ${agentName} agent...`);
    
    // Get the specified agent
    const agent = await prisma.aIAgent.findFirst({
      where: {
        name: agentName
      }
    });

    if (agent) {
      console.log(`Found ${agent.name} with current AI provider: ${agent.aiProvider}`);
      
      // Update to use NVIDIA
      await prisma.aIAgent.update({
        where: { id: agent.id },
        data: { aiProvider: 'NVIDIA' }
      });
      
      console.log(`✅ Successfully updated ${agent.name} to use NVIDIA AI!`);
      console.log(`${agent.name} will now use NVIDIA Llama 3.3 Nemotron for market analysis and trading decisions.`);
    } else {
      console.log(`❌ ${agentName} agent not found.`);
      
      // List available agents
      const agents = await prisma.aIAgent.findMany({
        select: { name: true, aiProvider: true }
      });
      
      console.log('\n📋 Available agents:');
      agents.forEach(a => {
        console.log(`  - ${a.name} (currently using ${a.aiProvider})`);
      });
      
      console.log('\n💡 Usage: yarn tsx scripts/update-nvidia-agent.ts "Agent Name"');
    }
  } catch (error) {
    console.error('Error updating agent:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
