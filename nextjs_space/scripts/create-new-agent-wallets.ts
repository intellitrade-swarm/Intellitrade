import { PrismaClient } from '@prisma/client';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Generating wallet addresses for new agents...\n');

  const newAgents = await prisma.aIAgent.findMany({
    where: {
      name: {
        in: ['Volatility Sniper', 'Funding Phantom']
      }
    }
  });

  for (const agent of newAgents) {
    // Generate a new private key
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    
    // Update agent with wallet info
    await prisma.aIAgent.update({
      where: { id: agent.id },
      data: {
        walletAddress: account.address,
        encryptedPrivateKey: privateKey, // In production, this should be encrypted
      }
    });
    
    console.log(`✅ ${agent.name}:`);
    console.log(`   Wallet Address: ${account.address}`);
    console.log(`   Private Key: ${privateKey}\n`);
  }
  
  console.log('🎉 Wallet addresses generated successfully!\n');
  console.log('⚠️  IMPORTANT: Fund these wallets with ETH on Base chain for gas fees.');
  console.log('⚠️  IMPORTANT: Fund these wallets with USDC on Base chain for trading.');
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
