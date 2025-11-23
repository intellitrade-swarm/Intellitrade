
'use client';

import { motion } from 'framer-motion';
import { Activity, Circle } from 'lucide-react';
import { Badge } from './badge';

interface LiveIndicatorProps {
  isLive?: boolean;
  lastUpdated?: Date | null;
  className?: string;
  showTimestamp?: boolean;
}

export function LiveIndicator({ 
  isLive = true, 
  lastUpdated, 
  className = '',
  showTimestamp = true 
}: LiveIndicatorProps) {
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={isLive ? 'default' : 'secondary'}
        className={`gap-1 px-2 py-1 ${
          isLive 
            ? 'bg-green-500/20 text-green-400 border-green-500/50' 
            : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
        }`}
      >
        <motion.div
          animate={isLive ? {
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1]
          } : {}}
          transition={isLive ? {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          } : {}}
        >
          <Circle className={`h-2 w-2 ${isLive ? 'fill-green-400' : 'fill-gray-400'}`} />
        </motion.div>
        <span className="text-xs font-semibold">
          {isLive ? 'LIVE' : 'PAUSED'}
        </span>
      </Badge>
      
      {showTimestamp && lastUpdated && (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Activity className="h-3 w-3" />
          Updated {getTimeAgo(lastUpdated)}
        </span>
      )}
    </div>
  );
}
