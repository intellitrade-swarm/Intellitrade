
'use client';

import { Badge } from '../../../components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip';
import { Link2, Database, Activity } from 'lucide-react';

interface PriceFeedIndicatorProps {
  source?: 'chainlink' | 'dex' | 'coingecko' | 'fallback';
  chain?: string;
}

export function PriceFeedIndicator({ source = 'fallback', chain }: PriceFeedIndicatorProps) {
  const sourceConfig = {
    chainlink: {
      label: 'Chainlink Oracle',
      icon: Link2,
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      description: 'Real-time price from Chainlink oracle on Ethereum',
    },
    dex: {
      label: 'DEX Price',
      icon: Activity,
      color: 'bg-green-500/20 text-green-400 border-green-500/50',
      description: 'Real-time price from decentralized exchanges',
    },
    coingecko: {
      label: 'CoinGecko',
      icon: Database,
      color: 'bg-blue-400/20 text-blue-300 border-blue-400/50',
      description: 'Price from CoinGecko API',
    },
    fallback: {
      label: 'Simulated',
      icon: Activity,
      color: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
      description: 'Simulated price data',
    },
  };

  const config = sourceConfig[source];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${config.color} text-xs gap-1 cursor-help`}
          >
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{config.description}</p>
          {chain && <p className="text-xs text-slate-400 mt-1">Chain: {chain}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
