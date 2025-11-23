/**
 * Agent Governance & Staking Dashboard
 * Blockchain-verified agent IDs, on-chain voting, and performance-based staking
 */

import { Metadata } from 'next';
import GovernanceDashboard from './components/governance-dashboard';

export const metadata: Metadata = {
  title: 'Agent Governance & Staking | Intellitrade',
  description: 'Community governance, performance staking, and blockchain-verified AI agents'
};

export default function GovernancePage() {
  return (
    <div className="min-h-screen bg-black terminal-crt-screen">
      <GovernanceDashboard />
    </div>
  );
}
