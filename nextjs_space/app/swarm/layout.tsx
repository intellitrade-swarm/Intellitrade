
'use client';

import { SidebarLayout } from '../components/sidebar-layout';
import { 
  Activity,
  BarChart3,
  Bot,
  Copy,
} from 'lucide-react';

const swarmNavItems = [
  {
    id: 'trading-hub',
    label: 'Trading Hub',
    icon: Activity,
    path: '/arena',
    badge: 'LIVE',
  },
  {
    id: 'performance',
    label: 'Performance Analytics',
    icon: BarChart3,
    path: '/performance',
  },
  {
    id: 'agents',
    label: 'AI Agents',
    icon: Bot,
    path: '/agents',
  },
  {
    id: 'copy-trading',
    label: 'Copy Trading',
    icon: Copy,
    path: '/copytrading',
  },
];

export default function SwarmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarLayout
      navItems={swarmNavItems}
      title="Explore Swarm"
      subtitle="AI-Powered Trading"
    >
      {children}
    </SidebarLayout>
  );
}
