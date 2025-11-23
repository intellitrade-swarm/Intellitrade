
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Activity,
  BarChart3,
  Bot,
  Copy,
  Zap,
  Target,
  Trophy,
  TrendingUp,
  Shield,
  Cpu,
  Code,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  badge?: string;
}

interface SidebarLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
  subtitle: string;
}

export function SidebarLayout({ children, navItems, title, subtitle }: SidebarLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm border-r border-blue-500/20 flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-blue-500/20">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="text-white hover:text-blue-400 hover:bg-gray-800 w-full justify-start mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                onClick={() => router.push(item.path)}
                className={`w-full justify-start group relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge className="ml-2 bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                    {item.badge}
                  </Badge>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-blue-500/20">
          <div className="text-xs text-gray-500 text-center">
            <p>© 2025 Intellitrade</p>
            <Badge className="mt-2 bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
              PUBLIC ACCESS
            </Badge>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
