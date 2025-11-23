
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Sparkles,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface SolanaWalletPanelProps {
  agents: any[];
}

export function SolanaWalletPanel({ agents }: SolanaWalletPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [balances, setBalances] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [creatingWallets, setCreatingWallets] = useState(false);

  const agentsWithSolanaWallets = agents.filter(a => a.solanaWalletAddress);
  const agentsWithoutSolanaWallets = agents.filter(a => !a.solanaWalletAddress);

  useEffect(() => {
    // Fetch balances for all agents with Solana wallets
    if (agentsWithSolanaWallets.length > 0) {
      fetchAllBalances();
    }
  }, [agents]);

  const fetchAllBalances = async () => {
    const newBalances: Record<string, any> = {};
    
    for (const agent of agentsWithSolanaWallets) {
      try {
        const response = await fetch(`/api/wallet/solana/balance?agentId=${agent.id}`);
        const data = await response.json();
        
        if (data.success) {
          newBalances[agent.id] = data;
        }
      } catch (error) {
        console.error(`Error fetching balance for ${agent.name}:`, error);
      }
    }
    
    setBalances(newBalances);
  };

  const createSolanaWallets = async () => {
    setCreatingWallets(true);
    try {
      const response = await fetch('/api/wallet/solana/bulk-create', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to create Solana wallets');
      }
    } catch (error) {
      console.error('Error creating Solana wallets:', error);
      toast.error('Failed to create Solana wallets');
    } finally {
      setCreatingWallets(false);
    }
  };

  const createSolanaWallet = async (agentId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/wallet/solana/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Solana wallet created successfully!');
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to create Solana wallet');
      }
    } catch (error) {
      console.error('Error creating Solana wallet:', error);
      toast.error('Failed to create Solana wallet');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getSolscanUrl = (address: string) => {
    return `https://solscan.io/address/${address}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Solana Wallets</h2>
            <p className="text-sm text-muted-foreground">
              Manage agent Solana wallets and balances
            </p>
          </div>
        </div>
        
        {agentsWithoutSolanaWallets.length > 0 && (
          <Button
            onClick={createSolanaWallets}
            disabled={creatingWallets}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {creatingWallets ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Create All Solana Wallets
              </>
            )}
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="terminal-crt-screen p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10">
          <div className="text-sm text-muted-foreground">Agents with SOL Wallets</div>
          <div className="text-2xl font-bold text-blue-600">
            {agentsWithSolanaWallets.length}/{agents.length}
          </div>
        </Card>
        <Card className="terminal-crt-screen p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/10">
          <div className="text-sm text-muted-foreground">Total SOL Balance</div>
          <div className="text-2xl font-bold text-blue-600">
            {Object.values(balances).reduce((sum, b) => sum + (b.solBalance || 0), 0).toFixed(4)} SOL
          </div>
        </Card>
        <Card className="terminal-crt-screen p-4 bg-gradient-to-br from-green-500/10 to-blue-500/10">
          <div className="text-sm text-muted-foreground">Total USD Value</div>
          <div className="text-2xl font-bold text-green-600">
            ${Object.values(balances).reduce((sum, b) => sum + (b.usdValue || 0), 0).toFixed(2)}
          </div>
        </Card>
        <Card className="terminal-crt-screen p-4 bg-gradient-to-br from-blue-500/10 to-red-500/10">
          <div className="text-sm text-muted-foreground">SOL Price</div>
          <div className="text-2xl font-bold text-blue-600">
            ${balances[Object.keys(balances)[0]]?.solPrice?.toFixed(2) || '0.00'}
          </div>
        </Card>
      </div>

      {/* Instructions */}
      {agentsWithSolanaWallets.length === 0 && (
        <Alert className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-blue-500/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>No Solana wallets yet!</strong>
            <br />
            Click "Create All Solana Wallets" to generate Solana wallets for all agents. 
            Each agent will get a unique SOL wallet for trading on Solana DEXes via Jupiter aggregator.
          </AlertDescription>
        </Alert>
      )}

      {/* Wallet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentsWithSolanaWallets.map((agent) => (
          <Card 
            key={agent.id}
            className="p-4 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-card to-card/80 border-blue-500/20"
            onClick={() => setSelectedAgent(agent)}
          >
            <div className="flex items-start gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                {agent.avatar && typeof agent.avatar === 'string' && agent.avatar.trim().length > 0 ? (
                  <Image
                    src={agent.avatar}
                    alt={agent.name || 'Agent'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold bg-gradient-to-br from-blue-500 to-blue-500">
                    {agent.name ? agent.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{agent.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {agent.aiProvider}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="mt-3 p-2 bg-black/30 rounded">
              <div className="text-xs text-muted-foreground mb-1">Solana Address</div>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono flex-1 truncate">
                  {agent.solanaWalletAddress}
                </code>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(agent.solanaWalletAddress);
                  }}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <Copy className="h-3 w-3" />
                </button>
                <a
                  href={getSolscanUrl(agent.solanaWalletAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Balance */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded">
                <div className="text-xs text-muted-foreground">SOL Balance</div>
                <div className="font-semibold text-blue-400">
                  {balances[agent.id]?.solBalance?.toFixed(4) || '0.0000'} SOL
                </div>
              </div>
              <div className="p-2 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded">
                <div className="text-xs text-muted-foreground">USD Value</div>
                <div className="font-semibold text-green-400">
                  ${balances[agent.id]?.usdValue?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-3">
              {balances[agent.id]?.solBalance > 0 ? (
                <Badge className="w-full justify-center bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Funded & Ready
                </Badge>
              ) : (
                <Badge variant="outline" className="w-full justify-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Needs Funding
                </Badge>
              )}
            </div>
          </Card>
        ))}

        {/* Create wallet cards for agents without Solana wallets */}
        {agentsWithoutSolanaWallets.map((agent) => (
          <Card 
            key={agent.id}
            className="p-4 border-dashed border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-blue-600/5"
          >
            <div className="flex items-start gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                {agent.avatar && typeof agent.avatar === 'string' && agent.avatar.trim().length > 0 ? (
                  <Image
                    src={agent.avatar}
                    alt={agent.name || 'Agent'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold bg-gradient-to-br from-blue-500 to-blue-500">
                    {agent.name ? agent.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{agent.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  No Solana wallet yet
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => createSolanaWallet(agent.id)}
              disabled={loading}
              variant="outline"
              className="w-full mt-3 border-blue-500/50 hover:bg-blue-500/10"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Create SOL Wallet
                </>
              )}
            </Button>
          </Card>
        ))}
      </div>

      {/* Funding Instructions */}
      {agentsWithSolanaWallets.length > 0 && (
        <Alert className="bg-gradient-to-r from-blue-500/20 to-blue-500/20 border-blue-500/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to fund Solana wallets:</strong>
            <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
              <li>Copy the Solana address of an agent</li>
              <li>Send SOL from any Solana wallet (Phantom, Solflare, etc.)</li>
              <li>Recommended: $50-100 worth of SOL per agent</li>
              <li>Network: Solana Mainnet</li>
            </ol>
            <div className="mt-3 flex gap-2">
              <a 
                href="https://phantom.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                Get Phantom Wallet →
              </a>
              <a 
                href="https://www.coinbase.com/price/solana" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                Buy SOL on Coinbase →
              </a>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Refresh Button */}
      {agentsWithSolanaWallets.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={fetchAllBalances}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All Balances
          </Button>
        </div>
      )}
    </div>
  );
}
