'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Wallet,
  History,
  ArrowRightLeft,
  Users,
  Link2,
  TrendingUp,
  Tag,
  DollarSign,
  Activity,
  Award,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function AddressProfilerPanel() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [balances, setBalances] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [counterparties, setCounterparties] = useState<any[]>([]);
  const [relatedWallets, setRelatedWallets] = useState<any[]>([]);
  const [pnl, setPnl] = useState<any>(null);
  const [labels, setLabels] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const analyzeAddress = async () => {
    if (!address) return;

    setLoading(true);
    try {
      // Fetch all profiler data in parallel
      const [
        profileRes,
        balancesRes,
        transactionsRes,
        counterpartiesRes,
        relatedRes,
        pnlRes,
        labelsRes,
      ] = await Promise.all([
        fetch(`/api/nansen/profiler/profile?address=${address}`),
        fetch(`/api/nansen/profiler/balances?address=${address}`),
        fetch(`/api/nansen/profiler/transactions?address=${address}&limit=20`),
        fetch(`/api/nansen/profiler/counterparties?address=${address}&limit=10`),
        fetch(`/api/nansen/profiler/related-wallets?address=${address}&limit=5`),
        fetch(`/api/nansen/profiler/pnl?address=${address}`),
        fetch(`/api/nansen/profiler/labels?address=${address}`),
      ]);

      const [
        profileData,
        balancesData,
        transactionsData,
        counterpartiesData,
        relatedData,
        pnlData,
        labelsData,
      ] = await Promise.all([
        profileRes.json(),
        balancesRes.json(),
        transactionsRes.json(),
        counterpartiesRes.json(),
        relatedRes.json(),
        pnlRes.json(),
        labelsRes.json(),
      ]);

      setProfile(profileData.profile);
      setBalances(balancesData.balances);
      setTransactions(transactionsData.transactions || []);
      setCounterparties(counterpartiesData.counterparties || []);
      setRelatedWallets(relatedData.relatedWallets || []);
      setPnl(pnlData.pnl);
      setLabels(labelsData.labels);
    } catch (error) {
      console.error('Error analyzing address:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="terminal-crt-screen bg-black/50 border-[#3385ff]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#3385ff]">
            <User className="h-5 w-5" />
            Wallet Address Profiler
          </CardTitle>
          <CardDescription className="text-gray-400">
            Enter an Ethereum address to view comprehensive on-chain profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="0x... (Ethereum address)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-black/50 border-[#3385ff]/20 text-white"
            />
            <Button
              onClick={analyzeAddress}
              disabled={loading || !address}
              className="bg-[#3385ff] text-black hover:bg-[#00dd77]"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {profile && (
        <div className="space-y-4">
          {/* Dropdown Selector */}
          <Card className="bg-gradient-to-br from-gray-900/50 to-transparent border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-400 whitespace-nowrap">
                  Select View:
                </label>
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className="flex-1 bg-gray-800/50 border-gray-700 text-white hover:border-blue-500 transition-colors">
                    <SelectValue placeholder="Select a view" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="overview" className="text-white hover:bg-blue-600/20 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-400" />
                        <span>Overview</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="balances" className="text-white hover:bg-blue-600/20 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-blue-400" />
                        <span>Balances</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="transactions" className="text-white hover:bg-blue-600/20 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="h-4 w-4 text-blue-400" />
                        <span>Activity</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="network" className="text-white hover:bg-blue-600/20 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-400" />
                        <span>Network</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Conditional Content Rendering */}
          <div className="space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Profile Card */}
              <Card className="terminal-crt-screen bg-black/50 border-[#3385ff]/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#3385ff]">
                    <User className="h-5 w-5" />
                    Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">Address</p>
                    <p className="text-white font-mono text-sm">{address}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Category</p>
                    <Badge className="bg-blue-500/20 text-purple-300">
                      {profile.category || 'Unknown'}
                    </Badge>
                  </div>
                  {profile.nansenScore && (
                    <div>
                      <p className="text-gray-400 text-sm">Wallet Score</p>
                      <p className="text-[#3385ff] text-2xl font-bold">{profile.nansenScore}/100</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-400 text-sm">Total Transactions</p>
                    <p className="text-white text-lg font-semibold">
                      {profile.totalTransactions?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Value</p>
                    <p className="text-white text-lg font-semibold">
                      {formatCurrency(profile.totalValueUSD || 0)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Labels Card */}
              <Card className="terminal-crt-screen bg-black/50 border-[#3385ff]/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#3385ff]">
                    <Tag className="h-5 w-5" />
                    Labels
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {labels?.labels && labels.labels.length > 0 ? (
                    labels.labels.map((label: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-black/30 rounded"
                      >
                        <div>
                          <p className="text-white font-semibold">{label.name}</p>
                          <p className="text-gray-400 text-xs">{label.source}</p>
                        </div>
                        <Badge className="bg-[#3385ff]/20 text-[#3385ff]">
                          {label.confidence}% confidence
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No labels found</p>
                  )}
                </CardContent>
              </Card>

              {/* PnL Card */}
              {pnl && (
                <Card className="terminal-crt-screen bg-black/50 border-[#3385ff]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#3385ff]">
                      <TrendingUp className="h-5 w-5" />
                      Trading Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm">Total PnL</p>
                      <p
                        className={`text-2xl font-bold ${
                          pnl.totalPnLUSD >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {formatCurrency(pnl.totalPnLUSD)}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Win Rate</p>
                        <p className="text-white text-lg font-semibold">
                          {pnl.winRate?.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Total Trades</p>
                        <p className="text-white text-lg font-semibold">{pnl.totalTrades}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">ROI</p>
                        <p
                          className={`text-lg font-semibold ${
                            pnl.totalROI >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {pnl.totalROI?.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Avg PnL/Trade</p>
                        <p className="text-white text-lg font-semibold">
                          {formatCurrency(pnl.averagePnLPerTrade || 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Portfolio Card */}
              {balances && (
                <Card className="terminal-crt-screen bg-black/50 border-[#3385ff]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#3385ff]">
                      <Wallet className="h-5 w-5" />
                      Portfolio Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-gray-400 text-sm">Total Value</p>
                        <p className="text-[#3385ff] text-3xl font-bold">
                          {formatCurrency(balances.totalValueUSD)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Assets Held</p>
                        <p className="text-white text-lg font-semibold">
                          {balances.balances?.length || 0} tokens
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            </div>
          )}

          {activeTab === 'balances' && (
            <div className="space-y-4">
            <Card className="terminal-crt-screen bg-black/50 border-[#3385ff]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#3385ff]">
                  <Wallet className="h-5 w-5" />
                  Token Balances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {balances?.balances && balances.balances.length > 0 ? (
                    balances.balances.map((token: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-black/30 rounded hover:bg-black/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-white font-semibold">{token.tokenSymbol}</p>
                            <p className="text-gray-400 text-sm">{token.tokenName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">
                            {token.balance.toFixed(4)} {token.tokenSymbol}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {formatCurrency(token.balanceUSD)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No token balances found</p>
                  )}
                </div>
              </CardContent>
            </Card>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
            <Card className="terminal-crt-screen bg-black/50 border-[#3385ff]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#3385ff]">
                  <ArrowRightLeft className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transactions && transactions.length > 0 ? (
                    transactions.map((tx: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-black/30 rounded"
                      >
                        <div>
                          <p className="text-white font-semibold">{tx.type}</p>
                          <p className="text-gray-400 text-sm">
                            {tx.tokenSymbol} • {formatAddress(tx.hash)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">
                            {tx.amount.toFixed(4)} {tx.tokenSymbol}
                          </p>
                          <p className="text-gray-400 text-sm">{formatCurrency(tx.amountUSD)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No recent transactions found</p>
                  )}
                </div>
              </CardContent>
            </Card>
            </div>
          )}

          {activeTab === 'network' && (
            <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Counterparties */}
              <Card className="terminal-crt-screen bg-black/50 border-[#3385ff]/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#3385ff]">
                    <Users className="h-5 w-5" />
                    Top Counterparties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {counterparties && counterparties.length > 0 ? (
                      counterparties.map((cp: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-black/30 rounded"
                        >
                          <div>
                            <p className="text-white font-semibold">
                              {cp.label || formatAddress(cp.address)}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {cp.transactionCount} transactions
                            </p>
                          </div>
                          <Badge className="bg-blue-500/20 text-blue-300">
                            {cp.relationship}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">No counterparties found</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Related Wallets */}
              <Card className="terminal-crt-screen bg-black/50 border-[#3385ff]/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#3385ff]">
                    <Link2 className="h-5 w-5" />
                    Related Wallets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {relatedWallets && relatedWallets.length > 0 ? (
                      relatedWallets.map((rw: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-black/30 rounded"
                        >
                          <div>
                            <p className="text-white font-semibold">
                              {rw.label || formatAddress(rw.address)}
                            </p>
                            <p className="text-gray-400 text-xs">{rw.relationship}</p>
                          </div>
                          <Badge className="bg-blue-500/20 text-purple-300">
                            {rw.confidence}% confidence
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">No related wallets found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!profile && !loading && (
        <Card className="terminal-crt-screen bg-black/50 border-[#3385ff]/20">
          <CardHeader>
            <CardTitle className="text-[#3385ff]">How to Use Address Profiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-[#3385ff]" />
                Comprehensive Wallet Analysis
              </h4>
              <p className="text-gray-400 text-sm">
                Enter any Ethereum address to view detailed on-chain profile including labels,
                transaction history, trading performance, and network connections.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Wallet className="h-4 w-4 text-[#3385ff]" />
                Portfolio Tracking
              </h4>
              <p className="text-gray-400 text-sm">
                See current token balances, portfolio value, and asset distribution across multiple
                tokens.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#3385ff]" />
                Trading Performance
              </h4>
              <p className="text-gray-400 text-sm">
                Analyze PnL, ROI, win rate, and identify best/worst performing trades.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-[#3385ff]" />
                Network Analysis
              </h4>
              <p className="text-gray-400 text-sm">
                Discover related wallets, frequent counterparties, and potential clusters of
                connected addresses.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
