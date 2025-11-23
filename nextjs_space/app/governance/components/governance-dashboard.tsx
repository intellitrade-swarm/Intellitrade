'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Vote, Shield, TrendingUp, Activity, ArrowLeft } from 'lucide-react';

export default function GovernanceDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-black p-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/arena')}
        className="mb-6 text-white hover:text-[#0066ff] hover:bg-gray-800"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Arena
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#3385ff] font-terminal tracking-wider mb-2">
              &gt; AGENT_GOVERNANCE_SYSTEM
            </h1>
            <p className="text-[#0066ff] font-terminal text-sm">
              BLOCKCHAIN-VERIFIED_IDS // COMMUNITY_VOTING // PERFORMANCE_STAKING
            </p>
          </div>
          <Badge className="bg-[#3385ff] text-black font-terminal text-lg px-4 py-2">
            ✅ ACTIVE
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="terminal-crt-screen border-2 border-[#3385ff]/30 bg-black/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#3385ff] flex items-center gap-2 text-sm">
              <Vote className="h-4 w-4" />
              Active Proposals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">0</div>
            <p className="text-xs text-gray-400">Awaiting votes</p>
          </CardContent>
        </Card>

        <Card className="terminal-crt-screen border-2 border-[#00ffff]/30 bg-black/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#00ffff] flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              Verified Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">0</div>
            <p className="text-xs text-gray-400">With blockchain IDs</p>
          </CardContent>
        </Card>

        <Card className="terminal-crt-screen border-2 border-[#ff00ff]/30 bg-black/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#ff00ff] flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              Total Staked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">$0</div>
            <p className="text-xs text-gray-400">Across all agents</p>
          </CardContent>
        </Card>

        <Card className="terminal-crt-screen border-2 border-[#ffff00]/30 bg-black/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#ffff00] flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4" />
              Rewards Claimed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">$0</div>
            <p className="text-xs text-gray-400">Total distributed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Selector */}
      <div className="space-y-6">
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
                      <Activity className="h-4 w-4 text-blue-400" />
                      <span>Overview</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="proposals" className="text-white hover:bg-blue-600/20 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Vote className="h-4 w-4 text-blue-400" />
                      <span>Governance</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="staking" className="text-white hover:bg-blue-600/20 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                      <span>Staking</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="audit" className="text-white hover:bg-blue-600/20 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span>Audit Trail</span>
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
          <Card className="terminal-crt-screen border-2 border-[#3385ff] bg-black/80">
            <CardHeader>
              <CardTitle className="text-[#3385ff] font-terminal">&gt; SYSTEM_STATUS</CardTitle>
              <CardDescription className="text-gray-400 font-terminal">
                Decentralized governance and staking system for AI trading agents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-[#3385ff]/30 p-4 rounded-2xl">
                  <h3 className="text-[#3385ff] font-terminal mb-2">Blockchain IDs</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Each agent gets a verified on-chain identity with built-in spending rules and audit trails.
                  </p>
                  <Badge className="bg-[#3385ff]/20 text-[#3385ff] border-[#3385ff]/50">
                    On-Chain Verified
                  </Badge>
                </div>

                <div className="border border-[#00ffff]/30 p-4 rounded-2xl">
                  <h3 className="text-[#00ffff] font-terminal mb-2">Community Governance</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Stake-weighted voting on agent parameters, spending caps, and strategy updates.
                  </p>
                  <Badge className="bg-[#00ffff]/20 text-[#00ffff] border-[#00ffff]/50">
                    Democratic Control
                  </Badge>
                </div>

                <div className="border border-[#ff00ff]/30 p-4 rounded-2xl">
                  <h3 className="text-[#ff00ff] font-terminal mb-2">Performance Staking</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Earn 10-40% APY by staking on agents based on their trading performance.
                  </p>
                  <Badge className="bg-[#ff00ff]/20 text-[#ff00ff] border-[#ff00ff]/50">
                    Rewards Active
                  </Badge>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-white font-terminal text-lg mb-4">&gt; KEY_FEATURES</h3>
                <ul className="space-y-2 text-gray-400 font-terminal text-sm">
                  <li>✅ Blockchain-verified agent identities with smart contracts</li>
                  <li>✅ Built-in spending caps and daily limits enforcement</li>
                  <li>✅ Community proposals with quorum and super-majority voting</li>
                  <li>✅ Performance-based staking rewards (base 10% + up to 30% bonus APY)</li>
                  <li>✅ Social recovery for lost agent access</li>
                  <li>✅ Immutable audit trail with hash-chain verification</li>
                  <li>✅ Tokenized co-ownership for collaborative trading pools</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          )}

          {activeTab === 'proposals' && (
          <Card className="terminal-crt-screen border-2 border-[#3385ff] bg-black/80">
            <CardHeader>
              <CardTitle className="text-[#3385ff] font-terminal">&gt; GOVERNANCE_PROPOSALS</CardTitle>
              <CardDescription className="text-gray-400 font-terminal">
                Community voting on agent parameters and strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Vote className="h-16 w-16 text-[#3385ff] mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 font-terminal mb-4">No active proposals</p>
                <p className="text-gray-500 text-sm font-terminal mb-6">
                  Proposals will appear here once agents have blockchain IDs
                </p>
                <Button className="bg-[#3385ff] text-black hover:bg-[#3385ff]/90 font-terminal">
                  Create Proposal
                </Button>
              </div>
            </CardContent>
          </Card>
          )}

          {activeTab === 'staking' && (
          <Card className="terminal-crt-screen border-2 border-[#3385ff] bg-black/80">
            <CardHeader>
              <CardTitle className="text-[#3385ff] font-terminal">&gt; PERFORMANCE_STAKING</CardTitle>
              <CardDescription className="text-gray-400 font-terminal">
                Stake on agents and earn rewards from their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-[#3385ff] mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 font-terminal mb-4">No active stakes</p>
                <p className="text-gray-500 text-sm font-terminal mb-6">
                  Stake on agents to earn 10-40% APY based on their trading performance
                </p>
                <Button className="bg-[#3385ff] text-black hover:bg-[#3385ff]/90 font-terminal">
                  Stake on Agent
                </Button>
              </div>
            </CardContent>
          </Card>
          )}

          {activeTab === 'audit' && (
          <Card className="terminal-crt-screen border-2 border-[#3385ff] bg-black/80">
            <CardHeader>
              <CardTitle className="text-[#3385ff] font-terminal">&gt; AUDIT_TRAIL</CardTitle>
              <CardDescription className="text-gray-400 font-terminal">
                Immutable record of all agent actions with hash-chain verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-[#3385ff] mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 font-terminal mb-4">No audit records</p>
                <p className="text-gray-500 text-sm font-terminal mb-6">
                  All agent actions are logged with blockchain-like hash chains
                </p>
                <Button className="bg-[#3385ff] text-black hover:bg-[#3385ff]/90 font-terminal">
                  Verify Integrity
                </Button>
              </div>
            </CardContent>
          </Card>
          )}
        </div>
      </div>
    </div>
  );
}
