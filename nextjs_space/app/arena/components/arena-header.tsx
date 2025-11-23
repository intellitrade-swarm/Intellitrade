

'use client';

import { Button } from '../../../components/ui/button';
import { Icons } from '../../../components/ui/icons';
import { Badge } from '../../../components/ui/badge';

interface ArenaHeaderProps {
  user: any;
  activeView: string;
  setActiveView: (view: 'arena' | 'dashboard' | 'agents' | 'trading' | 'social' | 'asterdex' | 'copytrading') => void;
  isLive: boolean;
  setIsLive: (live: boolean) => void;
}

export function ArenaHeader({ user, activeView, setActiveView, isLive, setIsLive }: ArenaHeaderProps) {

  const navigationItems = [
    { id: 'arena', label: 'Trading Hub', icon: Icons.play },
    { id: 'dashboard', label: 'Performance', icon: Icons.barChart },
    { id: 'agents', label: 'Agents', icon: Icons.bot },
    { id: 'copytrading', label: 'Copy Trading', icon: Icons.copy },
    { id: 'whalemonitor', label: 'Alpha Signals', icon: Icons.trendingUp, external: '/whale-monitor' },
    { id: 'governance', label: 'Governance', icon: Icons.target, external: '/governance' },
    { id: 'profile', label: 'Profile', icon: Icons.user, external: '/profile' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-neon-cyan/30 bg-black/80 backdrop-blur-xl shadow-lg neon-border-cyan">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Icons.bot className="h-10 w-10 text-neon-cyan animate-neural-glow" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-cyan rounded-full animate-ping pulse-ring"></div>
              </div>
              <div>
                <span className="text-2xl font-bold holographic animate-swarm-float">
                  INTELLITRADE
                </span>
                <div className="text-[10px] text-neon-cyan/70 -mt-1 tracking-widest font-mono">SWARM INTELLIGENCE</div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-2">
              <Badge variant={isLive ? "default" : "secondary"} className="neon-border-magenta bg-black text-neon-magenta animate-neon-pulse">
                <div className="w-2 h-2 rounded-full bg-neon-magenta mr-1 animate-pulse" />
                {isLive ? 'SWARM ACTIVE' : 'HIBERNATING'}
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navigationItems.map((item: any) => (
              <Button
                key={item.id}
                variant={activeView === item.id ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  if (item.external) {
                    window.location.href = item.external;
                  } else {
                    setActiveView(item.id as any);
                  }
                }}
                className={`text-white font-mono tracking-wide transition-all ${
                  activeView === item.id 
                    ? 'neon-button-cyan bg-neon-cyan/10' 
                    : 'hover:bg-gray-900/50 hover:text-neon-cyan border border-transparent hover:border-neon-cyan/30'
                }`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Controls and User Menu */}
          <div className="flex items-center space-x-3">
            {/* Live Toggle */}
            <Button
              variant={isLive ? "default" : "outline"}
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className={`hidden md:flex ${
                isLive 
                  ? 'bg-[#0066ff] text-black hover:bg-[#0066ff]/90' 
                  : 'border-[#0066ff] text-[#0066ff] hover:bg-[#0066ff]/10'
              }`}
            >
              {isLive ? <Icons.pause className="h-4 w-4" /> : <Icons.play className="h-4 w-4" />}
            </Button>

            {/* Public Access Indicator - No Login Required */}
            <Badge variant="outline" className="hidden md:flex border-[#0066ff]/50 text-[#0066ff]">
              <Icons.globe className="h-3 w-3 mr-1" />
              Public Access
            </Badge>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden mt-4 flex space-x-2 overflow-x-auto">
          {navigationItems.map((item: any) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                if (item.external) {
                  window.location.href = item.external;
                } else {
                  setActiveView(item.id as any);
                }
              }}
              className={`text-white whitespace-nowrap ${
                activeView === item.id 
                  ? 'bg-[#0066ff] text-black hover:bg-[#0066ff]/90' 
                  : 'hover:bg-gray-800 hover:text-[#0066ff]'
              }`}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </header>
  );
}

