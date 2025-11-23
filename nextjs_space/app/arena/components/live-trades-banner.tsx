
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import { useRealTimeActiveTrades } from '../../../hooks/use-real-time-data';

interface Trade {
  id: string;
  agentName: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  quantity: number;
  entryTime: Date;
  leverage?: number;
  strategy?: string;
}

export function LiveTradesBanner() {
  const { data: tradesData, isLive } = useRealTimeActiveTrades();
  const [currentPrice, setCurrentPrice] = useState<{ [key: string]: number }>({});
  
  const trades = tradesData?.trades || [];

  // Calculate unrealized P&L
  const calculatePnL = (trade: Trade): number => {
    const current = currentPrice[trade.symbol] || trade.entryPrice;
    const priceDiff = current - trade.entryPrice;
    const multiplier = trade.side === 'BUY' ? 1 : -1;
    return priceDiff * trade.quantity * multiplier * (trade.leverage || 1);
  };

  // Calculate P&L percentage
  const calculatePnLPercent = (trade: Trade): number => {
    const current = currentPrice[trade.symbol] || trade.entryPrice;
    const priceDiff = current - trade.entryPrice;
    const multiplier = trade.side === 'BUY' ? 1 : -1;
    const percent = (priceDiff / trade.entryPrice) * 100 * multiplier * (trade.leverage || 1);
    return percent;
  };

  if (trades.length === 0) {
    return null;
  }

  // Create duplicated array for seamless loop
  const duplicatedTrades = [...trades, ...trades, ...trades];

  return (
    <div className="w-full bg-gradient-to-r from-blue-500/10 via-blue-500/10 to-blue-500/10 border-y border-blue-500/20 backdrop-blur-sm overflow-hidden">
      <div className="relative h-16 flex items-center">
        {/* Animated ticker */}
        <motion.div
          className="flex gap-6 whitespace-nowrap"
          animate={{
            x: [0, -1000 * (trades.length / 3)], // Adjust based on number of trades
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          {duplicatedTrades.map((trade, index) => {
            const pnl = calculatePnL(trade);
            const pnlPercent = calculatePnLPercent(trade);
            const isProfitable = pnl >= 0;

            return (
              <div
                key={`${trade.id}-${index}`}
                className="flex items-center gap-3 px-6 py-2 bg-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-blue-500/50 transition-all"
              >
                {/* Agent Avatar */}
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    trade.side === 'BUY' 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                      : 'bg-gradient-to-br from-red-500 to-red-600'
                  }`}>
                    {trade.agentName.substring(0, 2)}
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                </div>

                {/* Trade Info */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 font-medium text-sm">
                    {trade.agentName}
                  </span>
                  <div className="w-px h-4 bg-gray-600" />
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    trade.side === 'BUY' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {trade.side}
                  </span>
                  <span className="text-white font-bold">
                    {trade.symbol}
                  </span>
                  {trade.leverage && trade.leverage > 1 && (
                    <>
                      <div className="w-px h-4 bg-gray-600" />
                      <div className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs font-bold">
                        <Zap className="w-3 h-3" />
                        {trade.leverage}x
                      </div>
                    </>
                  )}
                </div>

                {/* Price Info */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="text-gray-400">
                    Entry: <span className="text-gray-200 font-medium">${(trade.entryPrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="w-px h-4 bg-gray-600" />
                  <div className="text-gray-400">
                    Current: <span className="text-gray-200 font-medium">
                      ${(currentPrice[trade.symbol] || trade.entryPrice || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* P&L */}
                <div className={`flex items-center gap-1 px-2 py-1 rounded font-bold text-sm ${
                  isProfitable 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {isProfitable ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>
                    {isProfitable ? '+' : ''}{(pnlPercent || 0).toFixed(2)}%
                  </span>
                  <span className="text-xs opacity-75">
                    (${isProfitable ? '+' : ''}{(pnl || 0).toFixed(2)})
                  </span>
                </div>

                {/* Activity Indicator */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Activity className="w-3 h-3" />
                  <span>
                    {Math.floor((Date.now() - new Date(trade.entryTime).getTime()) / 60000)}m ago
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
