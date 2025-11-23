
/**
 * Script to update performance metrics for all agents
 * Run with: yarn tsx --require dotenv/config scripts/update-performance-metrics.ts
 */

import { updateAllAgentPerformance } from '../lib/performance-tracker';

async function main() {
  console.log('🚀 Starting performance metrics update...\n');
  
  try {
    await updateAllAgentPerformance();
    console.log('\n✅ Performance metrics update completed successfully!');
  } catch (error) {
    console.error('\n❌ Error updating performance metrics:', error);
    process.exit(1);
  }
}

main();
