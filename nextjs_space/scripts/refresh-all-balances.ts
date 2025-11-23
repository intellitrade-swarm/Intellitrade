
import { PrismaClient } from '@prisma/client';
import { getWalletBalances } from '../lib/wallet';
import { ChainName } from '../lib/blockchain-config';
import { fetchBlockchainPrices } from '../lib/blockchain';

const prisma = new PrismaClient();

async function refreshAllBalances() {
  console.log('\n🔄 Refreshing all agent wallet balances...\n');

  try {
    // Get all agents
    const agents = await prisma.aIAgent.findMany({
      where: { isActive: true },
    });

    console.log(`Found ${agents.length} active agents\n`);

    // Fetch current prices
    console.log('Fetching current prices...');
    const prices = await fetchBlockchainPrices();
    console.log('✓ Prices fetched\n');

    for (const agent of agents) {
      console.log(`\n📊 Updating balances for: ${agent.name}`);

      // Update ETH/Base wallet balance
      if (agent.walletAddress) {
        try {
          const chain = (agent.primaryChain || 'base') as ChainName;
          const balances = await getWalletBalances(agent.walletAddress, chain);
          
          let nativeUsdValue = 0;
          const nativeBalance = parseFloat(balances.native);
          const usdcBalance = parseFloat(balances.usdc);
          
          if (chain === 'ethereum' || chain === 'base') {
            const ethPrice = prices.get('ETH');
            if (ethPrice) {
              nativeUsdValue = nativeBalance * ethPrice.price;
            }
          } else if (chain === 'bsc') {
            const bnbPrice = prices.get('BNB');
            if (bnbPrice) {
              nativeUsdValue = nativeBalance * bnbPrice.price;
            }
          }
          
          const totalUsdValue = nativeUsdValue + usdcBalance;

          // Update agent's real balance
          await prisma.aIAgent.update({
            where: { id: agent.id },
            data: { realBalance: totalUsdValue },
          });

          console.log(`   ✓ ETH/Base: $${totalUsdValue.toFixed(2)} (${nativeBalance.toFixed(4)} ${balances.nativeSymbol} + ${usdcBalance.toFixed(2)} USDC)`);
        } catch (error) {
          console.error(`   ✗ Error fetching ETH balance:`, error);
        }
      } else {
        console.log(`   - No ETH wallet`);
      }

      // Note: BSC and Solana wallet balances are tracked separately in application logic
      // Only ETH/Base wallet balance is stored in the realBalance field
      if (agent.bscWalletAddress) {
        console.log(`   - BSC wallet: ${agent.bscWalletAddress} (balance tracked separately)`);
      } else {
        console.log(`   - No BSC wallet`);
      }

      if (agent.solanaWalletAddress) {
        console.log(`   - SOL wallet: ${agent.solanaWalletAddress} (balance tracked separately)`);
      } else {
        console.log(`   - No SOL wallet`);
      }
    }

    console.log('\n\n✅ All wallet balances refreshed successfully!\n');

    // Show summary
    const updatedAgents = await prisma.aIAgent.findMany({
      where: { isActive: true },
      select: {
        name: true,
        realBalance: true,
      },
    });

    console.log('\n📊 Summary (ETH/Base Balances):\n');
    for (const agent of updatedAgents) {
      const balance = parseFloat((agent.realBalance || 0).toString());
      console.log(`${agent.name}: $${balance.toFixed(2)}`);
    }

  } catch (error) {
    console.error('\n❌ Error refreshing balances:', error);
  } finally {
    await prisma.$disconnect();
  }
}

refreshAllBalances();
