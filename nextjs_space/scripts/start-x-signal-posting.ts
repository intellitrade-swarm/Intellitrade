
import * as dotenv from 'dotenv';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { startSignalPosting } from '../lib/x-signal-poster';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🤖 X Signal Posting Service');
  console.log('============================\n');
  
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Verify X API credentials
    const fs = require('fs');
    const path = require('path');
    const secretsPath = path.join('/home/ubuntu/.config/abacusai_auth_secrets.json');
    
    if (!fs.existsSync(secretsPath)) {
      throw new Error('X API credentials not found');
    }
    
    const secretsData = fs.readFileSync(secretsPath, 'utf-8');
    const secrets = JSON.parse(secretsData);
    
    if (!secrets['x (twitter)']) {
      throw new Error('X API credentials not configured');
    }
    
    console.log('✅ X API credentials loaded\n');
    
    console.log('📱 Signal Posting Settings:');
    console.log('  • Check interval: Every 5 minutes');
    console.log('  • Post cooldown: 10 minutes between posts');
    console.log('  • Trade lookback: 48 hours');
    console.log('  • Min confidence: 60%');
    console.log('  • Min P&L for updates: $10');
    console.log('  • Performance updates: Every 2 hours');
    console.log('  • Price source: Real-time\n');
    
    console.log('🎯 What gets posted:');
    console.log('  ✓ Trade signals (LONG/SHORT)');
    console.log('  ✓ Trade closures with P&L');
    console.log('  ✓ 24-hour performance summaries');
    console.log('  ✓ Real trades only\n');
    
    console.log('🚀 Starting automated signal posting...\n');
    
    // Start the posting service (checks every 5 minutes for increased frequency)
    await startSignalPosting(5);
    
    // Keep the script running
    process.on('SIGINT', async () => {
      console.log('\n\n👋 Shutting down signal posting service...');
      await prisma.$disconnect();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error starting signal posting service:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
