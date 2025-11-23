import { PrismaClient } from '@prisma/client';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking wallet addresses for new agents...\n');

  const newAgents = await prisma.aIAgent.findMany({
    where: {
      name: {
        in: ['Volatility Sniper', 'Funding Phantom']
      }
    },
    select: {
      id: true,
      name: true,
      walletAddress: true,
      encryptedPrivateKey: true,
      primaryChain: true
    }
  });

  console.log('📊 New Agents Status:');
  for (const agent of newAgents) {
    console.log(`\n${agent.name}:`);
    console.log(`  ID: ${agent.id}`);
    console.log(`  Chain: ${agent.primaryChain}`);
    console.log(`  Wallet Address: ${agent.walletAddress || 'NOT SET'}`);
    console.log(`  Private Key: ${agent.encryptedPrivateKey ? '✓ Set' : '✗ Not Set'}`);
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
