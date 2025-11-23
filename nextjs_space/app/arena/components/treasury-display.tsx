
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, Activity, Copy, Check, Lock, Sparkles, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TreasuryManagement } from './treasury-management';

interface TreasuryBalance {
  base: number;
  bsc: number;
  ethereum: number;
  solana: number;
  total: number;
}

interface TreasuryStats {
  balance: TreasuryBalance;
  totalReceived: number;
  totalTransactions: number;
  profitSharePercentage: number;
  recentTransactions: any[];
}

interface TreasuryAddresses {
  evm: string | null;
  solana: string | null;
}

export function TreasuryDisplay() {
  const [stats, setStats] = useState<TreasuryStats | null>(null);
  const [addresses, setAddresses] = useState<TreasuryAddresses | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedEvm, setCopiedEvm] = useState(false);
  const [copiedSolana, setCopiedSolana] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchData = async () => {
    
    try {
      // Always fetch stats for all users
      const statsRes = await fetch('/api/treasury/stats');
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
        
        // Check if user is admin by trying to fetch addresses
        const addressesRes = await fetch('/api/treasury/addresses');
        if (addressesRes.ok) {
          const addressesData = await addressesRes.json();
          setAddresses(addressesData);
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    } catch (error) {
      console.error('Error fetching treasury data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = async (text: string, type: 'evm' | 'solana') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'evm') {
        setCopiedEvm(true);
        setTimeout(() => setCopiedEvm(false), 2000);
      } else {
        setCopiedSolana(true);
        setTimeout(() => setCopiedSolana(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (loading) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-6 rounded-2xl border-2 bg-gradient-to-br from-amber-900/40 to-blue-800/30 border-amber-500/40 shadow-lg shadow-amber-500/20"
      >
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-400"></div>
        </div>
      </motion.div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative p-6 rounded-2xl border-2 bg-gradient-to-br from-amber-900/40 via-blue-800/30 to-amber-800/40 border-amber-500/40 shadow-xl shadow-amber-500/20 overflow-hidden"
      >
        {/* Animated background glow */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-blue-400/10 to-amber-500/10 pointer-events-none"
        />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <motion.div 
              className="flex items-center gap-2"
              animate={{ 
                textShadow: [
                  "0 0 10px rgba(251, 191, 36, 0.5)",
                  "0 0 20px rgba(251, 191, 36, 0.8)",
                  "0 0 10px rgba(251, 191, 36, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Building2 className="h-5 w-5 text-amber-400" />
              <span className="text-amber-300 text-sm font-bold">
                Treasury Fund
              </span>
              <Sparkles className="h-4 w-4 text-blue-300 animate-pulse" />
            </motion.div>
            <Badge 
              variant="outline" 
              className="border-amber-500/60 text-amber-300 bg-amber-950/50 font-bold"
            >
              {stats.profitSharePercentage}% Share
            </Badge>
          </div>
          
          {/* Eye-catching balance display */}
          <motion.div 
            className="text-3xl font-extrabold mb-2"
            animate={{ 
              textShadow: [
                "0 0 20px rgba(251, 191, 36, 0.8)",
                "0 0 30px rgba(251, 191, 36, 1)",
                "0 0 20px rgba(251, 191, 36, 0.8)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
              ${stats.balance.total.toFixed(2)}
            </span>
          </motion.div>
          
          <div className="text-xs text-amber-200/80 space-y-1 mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="font-semibold">Total Received: ${stats.totalReceived.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-amber-400" />
              <span>{stats.totalTransactions} profit contributions</span>
            </div>
          </div>

          {/* Chain Breakdown - visible to all users */}
          <div className="mt-3 pt-3 border-t border-amber-500/30">
            <div className="text-xs text-amber-200/70 space-y-1.5">
              {stats.balance.base > 0 && (
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    Base Chain:
                  </span>
                  <span className="text-amber-300 font-bold">${stats.balance.base.toFixed(2)}</span>
                </div>
              )}
              {stats.balance.bsc > 0 && (
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                    BSC Chain:
                  </span>
                  <span className="text-amber-300 font-bold">${stats.balance.bsc.toFixed(2)}</span>
                </div>
              )}
              {stats.balance.ethereum > 0 && (
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    Ethereum:
                  </span>
                  <span className="text-amber-300 font-bold">${stats.balance.ethereum.toFixed(2)}</span>
                </div>
              )}
              {stats.balance.solana > 0 && (
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Solana:
                  </span>
                  <span className="text-amber-300 font-bold">${stats.balance.solana.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Admin-only sections */}
          {isAdmin && (
            <>
              {/* Wallet Addresses */}
              {addresses && (
                <div className="mt-3 pt-3 border-t border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-4 w-4 text-amber-400" />
                    <span className="text-xs text-amber-300 font-bold">Admin Access</span>
                  </div>
                  
                  {addresses.evm && (
                    <div>
                      <div className="text-xs text-amber-200/70 mb-1">EVM Wallet (Base/BSC/ETH)</div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-black/50 px-2 py-1 rounded text-amber-300 flex-1 truncate border border-amber-500/20">
                          {addresses.evm.slice(0, 10)}...{addresses.evm.slice(-8)}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 hover:bg-amber-500/20"
                          onClick={() => copyToClipboard(addresses.evm!, 'evm')}
                        >
                          {copiedEvm ? (
                            <Check className="h-3 w-3 text-green-400" />
                          ) : (
                            <Copy className="h-3 w-3 text-amber-300" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {addresses.solana && (
                    <div>
                      <div className="text-xs text-amber-200/70 mb-1">Solana Wallet</div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-black/50 px-2 py-1 rounded text-amber-300 flex-1 truncate border border-amber-500/20">
                          {addresses.solana.slice(0, 10)}...{addresses.solana.slice(-8)}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 hover:bg-amber-500/20"
                          onClick={() => copyToClipboard(addresses.solana!, 'solana')}
                        >
                          {copiedSolana ? (
                            <Check className="h-3 w-3 text-green-400" />
                          ) : (
                            <Copy className="h-3 w-3 text-amber-300" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Admin Actions */}
              <div className="mt-3 pt-3 border-t border-amber-500/30">
                <Button
                  onClick={() => setShowManagement(true)}
                  className="w-full bg-gradient-to-r from-amber-600 to-blue-500 hover:from-amber-700 hover:to-blue-600 text-white font-bold shadow-lg shadow-amber-500/30"
                  size="sm"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Manage & Withdraw
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Treasury Management Modal - Admin only */}
      {isAdmin && showManagement && (
        <TreasuryManagement
          isOpen={showManagement}
          onClose={() => {
            setShowManagement(false);
            fetchData(); // Refresh data after management
          }}
          treasuryStats={stats}
        />
      )}
    </>
  );
}
