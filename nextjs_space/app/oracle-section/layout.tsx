
'use client';

import { SidebarLayout } from '../components/sidebar-layout';
import { 
  Zap,
  Target,
  Trophy,
  TrendingUp,
  Shield,
  Cpu,
  Code,
} from 'lucide-react';

const oracleNavItems = [
  {
    id: 'oracle',
    label: 'Oracle Intelligence',
    icon: Zap,
    path: '/oracle',
    badge: 'AI',
  },
  {
    id: 'trading-signals',
    label: 'Trading Signals',
    icon: Target,
    path: '/trading-signals',
    badge: 'LIVE',
  },
  {
    id: 'sports',
    label: 'Sports Prediction',
    icon: Trophy,
    path: '/sports-predictions',
  },
  {
    id: 'whale-monitor',
    label: 'Whale Monitor',
    icon: TrendingUp,
    path: '/whale-monitor',
    badge: 'INTEL',
  },
  {
    id: 'governance',
    label: 'Governance',
    icon: Shield,
    path: '/governance',
  },
  {
    id: 'perps',
    label: 'Perp Intelligence',
    icon: Cpu,
    path: '/perps',
    badge: 'INTEL',
  },
  {
    id: 'integration',
    label: 'Integration Guide',
    icon: Code,
    path: '/integration-guide',
  },
];

export default function OracleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarLayout
      navItems={oracleNavItems}
      title="Explore Oracle"
      subtitle="Market Intelligence"
    >
      {children}
    </SidebarLayout>
  );
}
