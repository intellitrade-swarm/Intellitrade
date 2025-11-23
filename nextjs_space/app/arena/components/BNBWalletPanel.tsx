
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
  Coins,
  QrCode,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { CompactWalletQR } from './wallet-qr-code';
import QRCodeSVG from 'react-qr-code';

interface BNBWalletPanelProps {
  agents: any[];
}

export function BNBWalletPanel({ agents }: BNBWalletPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [balances, setBalances] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [creatingWallets, setCreatingWallets] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const agentsWithBSCWallets = agents.filter(a => a.bscWalletAddress);
  const agentsWithoutBSCWallets = agents.filter(a => !a.bscWalletAddress);

  useEffect(() => {
    // Fetch balances for all agents with BSC wallets
    if (agentsWithBSCWallets.length > 0) {
      fetchAllBalances();
    }
  }, [agents]);

  const fetchAllBalances = async () => {
    const newBalances: Record<string, any> = {};
    
    for (const agent of agentsWithBSCWallets) {
      try {
        const response = await fetch(`/api/wallet/bsc/balance?agentId=${agent.id}`);
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

  const createBSCWallets = async () => {
    setCreatingWallets(true);
    try {
      const response = await fetch('/api/wallet/bsc/bulk-create', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to create BSC wallets');
      }
    } catch (error) {
      console.error('Error creating BSC wallets:', error);
      toast.error('Failed to create BSC wallets');
    } finally {
      setCreatingWallets(false);
    }
  };

  const createBSCWallet = async (agentId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/wallet/bsc/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success('BSC wallet created successfully!');
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to create BSC wallet');
      }
    } catch (error) {
      console.error('Error creating BSC wallet:', error);
      toast.error('Failed to create BSC wallet');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getBscscanUrl = (address: string) => {
    return `https://bscscan.com/address/${address}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl">
            <Coins className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">BNB Wallets (BSC)</h2>
            <p className="text-sm text-muted-foreground">
              Manage agent BNB wallets on Binance Smart Chain
            </p>
          </div>
        </div>
        
        {agentsWithoutBSCWallets.length > 0 && (
          <Button
            onClick={createBSCWallets}
            disabled={creatingWallets}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            {creatingWallets ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                Create All BSC Wallets
              </>
            )}
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="terminal-crt-screen p-4 bg-gradient-to-br from-blue-400/10 to-blue-500/10">
          <div className="text-sm text-muted-foreground">Agents with BNB Wallets</div>
          <div className="text-2xl font-bold text-blue-500">
            {agentsWithBSCWallets.length}/{agents.length}
          </div>
        </Card>
        <Card className="terminal-crt-screen p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/10">
          <div className="text-sm text-muted-foreground">Total BNB Balance</div>
          <div className="text-2xl font-bold text-blue-600">
            {Object.values(balances).reduce((sum, b) => sum + (b.bnbBalance || 0), 0).toFixed(4)} BNB
          </div>
        </Card>
        <Card className="terminal-crt-screen p-4 bg-gradient-to-br from-green-500/10 to-blue-500/10">
          <div className="text-sm text-muted-foreground">Total USD Value</div>
          <div className="text-2xl font-bold text-green-600">
            ${Object.values(balances).reduce((sum, b) => sum + (b.usdValue || 0), 0).toFixed(2)}
          </div>
        </Card>
        <Card className="terminal-crt-screen p-4 bg-gradient-to-br from-blue-500/10 to-red-500/10">
          <div className="text-sm text-muted-foreground">BNB Price</div>
          <div className="text-2xl font-bold text-blue-600">
            ${balances[Object.keys(balances)[0]]?.bnbPrice?.toFixed(2) || '0.00'}
          </div>
        </Card>
      </div>

      {/* Instructions */}
      {agentsWithBSCWallets.length === 0 && (
        <Alert className="bg-gradient-to-r from-blue-400/20 to-blue-500/20 border-blue-400/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>No BSC wallets yet!</strong>
            <br />
            Click "Create All BSC Wallets" to generate BNB wallets for all agents. 
            Each agent will get a unique BNB wallet for trading on BSC DEXes like PancakeSwap.
          </AlertDescription>
        </Alert>
      )}

      {/* Wallet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentsWithBSCWallets.map((agent) => (
          <Card 
            key={agent.id}
            className={`p-4 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-card to-card/80 border-blue-400/20 ${
              selectedAgent?.id === agent.id ? 'ring-2 ring-blue-400' : ''
            }`}
            onClick={() => setSelectedAgent(agent)}
          >
            <div className="space-y-3">
              {/* Agent Header */}
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
              <div className="p-2 bg-black/30 rounded">
                <div className="text-xs text-muted-foreground mb-1">BSC Address</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono flex-1 truncate">
                    {agent.bscWalletAddress}
                  </code>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(agent.bscWalletAddress);
                    }}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <a
                    href={getBscscanUrl(agent.bscWalletAddress)}
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
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-400/20 to-blue-500/20 rounded">
                  <div className="text-xs text-muted-foreground">BNB Balance</div>
                  <div className="font-semibold text-blue-300">
                    {balances[agent.id]?.bnbBalance?.toFixed(4) || '0.0000'} BNB
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
              <div>
                {balances[agent.id]?.bnbBalance > 0 ? (
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
            </div>
          </Card>
        ))}

        {/* Create wallet cards for agents without BSC wallets */}
        {agentsWithoutBSCWallets.map((agent) => (
          <Card 
            key={agent.id}
            className="p-4 border-dashed border-2 border-blue-400/30 bg-gradient-to-br from-blue-400/5 to-blue-500/5"
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
                  No BSC wallet yet
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => createBSCWallet(agent.id)}
              disabled={loading}
              variant="outline"
              className="w-full mt-3 border-blue-400/50 hover:bg-blue-400/10"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Create BNB Wallet
                </>
              )}
            </Button>
          </Card>
        ))}
      </div>

      {/* Funding Instructions */}
      {agentsWithBSCWallets.length > 0 && (
        <Alert className="bg-gradient-to-r from-blue-500/20 to-blue-500/20 border-blue-500/50">
          <Send className="h-4 w-4" />
          <AlertDescription>
            <strong>How to fund BNB wallets:</strong>
            <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
              <li>Select an agent to see their QR code</li>
              <li>Send BNB from any BSC wallet (MetaMask, Trust Wallet, etc.)</li>
              <li>Recommended: $50-100 worth of BNB per agent</li>
              <li>Network: <strong>BNB Smart Chain (BSC)</strong> - Chain ID: 56</li>
              <li>⚠️ <strong>Important:</strong> Do NOT send on Ethereum or other networks!</li>
            </ol>
            <div className="mt-3 flex gap-2">
              <a 
                href="https://www.binance.com/en/how-to-buy/bnb" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                Buy BNB on Binance →
              </a>
              <a 
                href="https://docs.bnbchain.org/docs/wallet/metamask" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                Add BSC to MetaMask →
              </a>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Selected Agent Details with QR Code */}
      {selectedAgent && selectedAgent.bscWalletAddress && (
        <Card className="terminal-crt-screen p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {selectedAgent.avatar && typeof selectedAgent.avatar === 'string' && selectedAgent.avatar.trim().length > 0 ? (
                    <Image
                      src={selectedAgent.avatar}
                      alt={selectedAgent.name || 'Agent'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-blue-500 to-blue-500">
                      {selectedAgent.name ? selectedAgent.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                </div>
                {selectedAgent.name} - BSC Wallet Details
              </h3>
              <Button
                onClick={() => {
                  fetch(`/api/wallet/bsc/balance?agentId=${selectedAgent.id}`)
                    .then(res => res.json())
                    .then(data => {
                      if (data.success) {
                        setBalances(prev => ({ ...prev, [selectedAgent.id]: data }));
                        toast.success('Balance refreshed!');
                      }
                    });
                }}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {balances[selectedAgent.id] && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-400/20 to-blue-500/20 rounded-2xl">
                  <div className="text-sm text-muted-foreground mb-1">
                    BNB Balance
                  </div>
                  <div className="text-2xl font-bold text-blue-300">
                    {balances[selectedAgent.id].bnbBalance?.toFixed(4)} BNB
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-2xl">
                  <div className="text-sm text-muted-foreground mb-1">
                    USD Value
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    ${balances[selectedAgent.id].usdValue?.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {/* Deposit Section with QR Code */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-2xl p-6 border-2 border-yellow-200 dark:border-blue-700">
              <div className="flex items-center gap-2 mb-4">
                <Send className="h-5 w-5 text-blue-500" />
                <h4 className="text-lg font-semibold text-blue-800 dark:text-yellow-100">
                  Fund This Agent with BNB
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* QR Code Section */}
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="bg-white p-4 rounded-2xl border-2 border-yellow-300 shadow-lg">
                    <QRCodeSVG
                      value={selectedAgent.bscWalletAddress}
                      size={220}
                      level="H"
                      fgColor="#000000"
                      bgColor="#FFFFFF"
                    />
                  </div>
                  <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                    Scan with your wallet app to send BNB
                  </p>
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <p className="font-semibold text-sm text-blue-800 dark:text-yellow-100">
                      Quick Deposit Instructions:
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                      <li>Scan QR code or copy address below</li>
                      <li>Open your wallet (MetaMask, Trust Wallet)</li>
                      <li>Switch to <strong>BSC network</strong> (Chain ID: 56)</li>
                      <li>Send <strong>BNB</strong> to the address</li>
                      <li>Wait for confirmation (1-2 min)</li>
                      <li>Agent will auto-trade with funds</li>
                    </ol>
                  </div>
                  
                  <Alert className="bg-red-50 dark:bg-red-950 border-red-400">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-xs text-red-800 dark:text-red-200">
                      <strong>CRITICAL WARNING:</strong> Only send BNB on BSC network (Chain ID: 56). Sending on Ethereum or other networks will result in lost funds!
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs bg-yellow-100 dark:bg-blue-800 text-blue-800 dark:text-yellow-100">
                      Network: BSC
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-orange-100 dark:bg-blue-900 text-blue-900 dark:text-orange-100">
                      Chain ID: 56
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-yellow-200 dark:bg-blue-700 text-blue-800 dark:text-yellow-100">
                      Asset: BNB
                    </Badge>
                  </div>

                  <a 
                    href="https://docs.bnbchain.org/docs/wallet/metamask" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 underline"
                  >
                    Need help adding BSC to MetaMask? →
                  </a>
                </div>
              </div>
            </div>

            {/* Full Address */}
            <div className="p-4 bg-muted rounded-2xl border border-gray-300 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-muted-foreground">
                  BSC Wallet Address
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(selectedAgent.bscWalletAddress)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(getBscscanUrl(selectedAgent.bscWalletAddress), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    BscScan
                  </Button>
                </div>
              </div>
              <code className="text-xs break-all bg-gray-100 dark:bg-gray-800 p-2 rounded block">
                {selectedAgent.bscWalletAddress}
              </code>
            </div>
          </div>
        </Card>
      )}

      {/* Refresh Button */}
      {agentsWithBSCWallets.length > 0 && (
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
