import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function checkAgents() {
  const agents = await prisma.aIAgent.findMany({
    orderBy: { name: 'asc' }
  });
  
  console.log('\n📊 Current Agents:\n');
  agents.forEach(agent => {
    console.log(`${agent.name}:`);
    console.log(`  - Strategy: ${agent.strategyType}`);
    console.log(`  - AI Provider: ${agent.aiProvider}`);
    console.log(`  - Balance: $${agent.realBalance?.toFixed(2) || '0.00'}`);
    console.log(`  - Win Rate: ${((agent.winRate || 0) * 100).toFixed(1)}%`);
    console.log('');
  });
  
  await prisma.$disconnect();
}

checkAgents();
