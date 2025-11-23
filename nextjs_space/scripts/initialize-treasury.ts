
import 'dotenv/config';
import { initializeTreasury, getTreasuryAddresses, getTreasuryStats } from '../lib/treasury';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('🏦 Treasury Fund Initialization\n');
  console.log('=' .repeat(70));
  
  try {
    // Initialize treasury
    await initializeTreasury();
    
    // Get addresses
    const addresses = await getTreasuryAddresses();
    
    console.log('\n📋 Treasury Wallet Addresses:');
    console.log('─'.repeat(70));
    
    if (addresses.evm) {
      console.log('\n🔷 EVM Wallet (Base, BSC, Ethereum):');
      console.log(`   ${addresses.evm}`);
      
      // Generate QR code for EVM address
      const evmQrPath = path.join(process.cwd(), 'public', 'treasury-evm-qr.png');
      await QRCode.toFile(evmQrPath, addresses.evm, {
        width: 400,
        margin: 2,
      });
      console.log(`   QR Code: ${evmQrPath}`);
    }
    
    if (addresses.solana) {
      console.log('\n🟣 Solana Wallet:');
      console.log(`   ${addresses.solana}`);
      
      // Generate QR code for Solana address
      const solanaQrPath = path.join(process.cwd(), 'public', 'treasury-solana-qr.png');
      await QRCode.toFile(solanaQrPath, addresses.solana, {
        width: 400,
        margin: 2,
      });
      console.log(`   QR Code: ${solanaQrPath}`);
    }
    
    // Get initial stats
    const stats = await getTreasuryStats();
    
    console.log('\n📊 Treasury Statistics:');
    console.log('─'.repeat(70));
    console.log(`   Total Balance: $${stats.balance.total.toFixed(2)}`);
    console.log(`   Profit Share: ${stats.profitSharePercentage}%`);
    console.log(`   Transactions: ${stats.totalTransactions}`);
    
    console.log('\n💡 Treasury Features:');
    console.log('─'.repeat(70));
    console.log('   ✅ Multi-chain support (Base, BSC, Ethereum, Solana)');
    console.log('   ✅ Automatic profit sharing from agent trades');
    console.log('   ✅ 5% of profits automatically sent to treasury');
    console.log('   ✅ Minimum $1 profit threshold');
    console.log('   ✅ Real-time balance tracking');
    console.log('   ✅ Transaction history');
    
    console.log('\n🎯 Next Steps:');
    console.log('─'.repeat(70));
    console.log('   1. Fund the treasury wallets with USDC');
    console.log('   2. Monitor treasury on the dashboard');
    console.log('   3. Profit sharing will happen automatically');
    
    console.log('\n✅ Treasury initialization complete!');
    console.log('=' .repeat(70));
    
  } catch (error) {
    console.error('\n❌ Error initializing treasury:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
