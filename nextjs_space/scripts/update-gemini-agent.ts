
import { prisma } from '../lib/db';

async function main() {
  try {
    console.log('🔍 Looking for Neral Nova agent...');
    
    // Get the Neral Nova agent
    const agent = await prisma.aIAgent.findFirst({
      where: {
        name: 'Neral Nova'
      }
    });

    if (agent) {
      console.log(`Found ${agent.name} with current AI provider: ${agent.aiProvider}`);
      
      // Update to use Gemini
      await prisma.aIAgent.update({
        where: { id: agent.id },
        data: { aiProvider: 'GEMINI' }
      });
      
      console.log(`✅ Successfully updated ${agent.name} to use Gemini AI!`);
      console.log(`${agent.name} will now use Google Gemini Pro for market analysis and trading decisions.`);
    } else {
      console.log('❌ Neral Nova agent not found. Creating a Gemini-powered agent...');
      
      // If Neral Nova doesn't exist, we'll note that and suggest checking the database
      console.log('Please ensure the agent exists in the database first.');
    }
  } catch (error) {
    console.error('Error updating agent:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
