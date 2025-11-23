
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function fixTreasuryBalances() {
  console.log('🔧 Fixing Treasury Balances...\n');

  // Get treasury
  const treasury = await prisma.treasury.findFirst();
  
  if (!treasury) {
    console.log('❌ No treasury found');
    return;
  }

  console.log('📊 Current Treasury State:');
  console.log(`   Base: $${treasury.baseBalance}`);
  console.log(`   BSC: $${treasury.bscBalance}`);
  console.log(`   Ethereum: $${treasury.ethereumBalance}`);
  console.log(`   Solana: $${treasury.solanaBalance}`);
  console.log(`   TOTAL: $${treasury.baseBalance + treasury.bscBalance + treasury.ethereumBalance + treasury.solanaBalance}\n`);

  // Step 1: Move misplaced balance from solana to base (AsterDEX is on Base)
  console.log('🔄 Step 1: Moving misplaced balance from Solana to Base...');
  
  const misplacedBalance = treasury.solanaBalance;
  
  if (misplacedBalance > 0) {
    await prisma.treasury.update({
      where: { id: treasury.id },
      data: {
        baseBalance: { increment: misplacedBalance },
        solanaBalance: 0
      }
    });
    console.log(`   ✅ Moved $${misplacedBalance.toFixed(2)} from Solana to Base\n`);
  } else {
    console.log('   ⏭️  No misplaced balance to move\n');
  }

  // Step 2: Check for missing profit shares from closed profitable trades
  console.log('🔄 Step 2: Checking for missing profit shares...');
  
  const closedProfitableTrades = await prisma.trade.findMany({
    where: {
      status: 'CLOSED',
      profitLoss: { gt: 0 },
      isRealTrade: true
    },
    select: {
      id: true,
      agentId: true,
      profitLoss: true,
      chain: true,
      entryTime: true
    }
  });

  console.log(`   Found ${closedProfitableTrades.length} closed profitable trades`);

  // Get all existing treasury transactions
  const existingTransactions = await prisma.treasuryTransaction.findMany({
    select: { tradeId: true }
  });

  const recordedTradeIds = new Set(existingTransactions.map(tx => tx.tradeId));
  
  // Find trades missing treasury records
  const missingTrades = closedProfitableTrades.filter(
    trade => !recordedTradeIds.has(trade.id)
  );

  console.log(`   Found ${missingTrades.length} trades missing profit share records\n`);

  if (missingTrades.length > 0) {
    console.log('💰 Backfilling missing profit shares...');
    
    for (const trade of missingTrades) {
      const profitShare = (trade.profitLoss || 0) * 0.05; // 5% share
      
      if (profitShare >= 1) { // Only record if >= $1
        // Normalize chain name
        const chain = trade.chain === 'astar-zkevm' ? 'base' : (trade.chain || 'base');
        const balanceField = chain === 'base' ? 'baseBalance' :
                           chain === 'bsc' ? 'bscBalance' :
                           chain === 'ethereum' ? 'ethereumBalance' :
                           chain === 'solana' ? 'solanaBalance' :
                           'baseBalance';

        await prisma.$transaction(async (tx) => {
          // Update treasury balance
          await tx.treasury.update({
            where: { id: treasury.id },
            data: {
              [balanceField]: { increment: profitShare },
              totalReceived: { increment: profitShare },
              totalTransactions: { increment: 1 }
            }
          });

          // Create transaction record
          await tx.treasuryTransaction.create({
            data: {
              treasuryId: treasury.id,
              agentId: trade.agentId,
              tradeId: trade.id,
              amount: profitShare,
              currency: 'USDC',
              chain: chain,
              description: `5% profit share from trade ${trade.id} (backfilled)`,
              createdAt: trade.entryTime // Use original trade date
            }
          });
        });

        console.log(`   ✅ Added $${profitShare.toFixed(2)} profit share for trade ${trade.id.slice(0, 8)}... on ${chain}`);
      }
    }
    
    console.log(`\n✅ Backfilled ${missingTrades.filter(t => (t.profitLoss || 0) * 0.05 >= 1).length} missing profit shares`);
  }

  // Step 3: Display final state
  console.log('\n📊 Final Treasury State:');
  const updatedTreasury = await prisma.treasury.findFirst();
  
  if (updatedTreasury) {
    console.log(`   Base: $${updatedTreasury.baseBalance.toFixed(2)}`);
    console.log(`   BSC: $${updatedTreasury.bscBalance.toFixed(2)}`);
    console.log(`   Ethereum: $${updatedTreasury.ethereumBalance.toFixed(2)}`);
    console.log(`   Solana: $${updatedTreasury.solanaBalance.toFixed(2)}`);
    console.log(`   TOTAL: $${(updatedTreasury.baseBalance + updatedTreasury.bscBalance + updatedTreasury.ethereumBalance + updatedTreasury.solanaBalance).toFixed(2)}`);
    console.log(`\n   Total Received: $${updatedTreasury.totalReceived.toFixed(2)}`);
    console.log(`   Total Transactions: ${updatedTreasury.totalTransactions}`);
  }

  // Verification
  const totalProfits = closedProfitableTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
  const expected5Percent = totalProfits * 0.05;
  const actualTotal = updatedTreasury ? 
    updatedTreasury.baseBalance + updatedTreasury.bscBalance + 
    updatedTreasury.ethereumBalance + updatedTreasury.solanaBalance : 0;
  
  console.log(`\n✅ Verification:`);
  console.log(`   Total profits from all closed trades: $${totalProfits.toFixed(2)}`);
  console.log(`   Expected 5% treasury share: $${expected5Percent.toFixed(2)}`);
  console.log(`   Actual treasury balance: $${actualTotal.toFixed(2)}`);
  console.log(`   Difference: $${(expected5Percent - actualTotal).toFixed(2)}`);
  
  if (Math.abs(expected5Percent - actualTotal) < 0.1) {
    console.log('\n🎉 Treasury balances are now correct!');
  } else if (expected5Percent - actualTotal > 0.1) {
    console.log('\n⚠️  Some profit shares may still be missing (likely due to $1 minimum threshold)');
  }
}

fixTreasuryBalances()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
