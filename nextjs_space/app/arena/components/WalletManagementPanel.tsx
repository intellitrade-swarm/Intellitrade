
'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  DollarSign,
  QrCode,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import QRCodeLib from 'qrcode';

interface WalletPanelProps {
  agents: any[];
}

export function WalletManagementPanel({ agents }: WalletPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [creatingWallets, setCreatingWallets] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  const agentsWithWallets = agents.filter(a => a.walletAddress);
  const agentsWithoutWallets = agents.filter(a => !a.walletAddress);

  useEffect(() => {
    if (selectedAgent && selectedAgent.walletAddress) {
      fetchBalance(selectedAgent.id);
      generateQRCode(selectedAgent.walletAddress);
    } else {
      setQrCode(null);
      setShowQR(false);
    }
  }, [selectedAgent]);

  const generateQRCode = async (address: string) => {
    try {
      const qrDataUrl = await QRCodeLib.toDataURL(address, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCode(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const createBulkWallets = async () => {
    setCreatingWallets(true);
    try {
      const response = await fetch('/api/wallet/bulk-create', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        // Refresh the page to show new wallets
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to create wallets');
      }
    } catch (error) {
      console.error('Error creating wallets:', error);
      toast.error('Failed to create wallets');
    } finally {
      setCreatingWallets(false);
    }
  };

  const createWallet = async (agentId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/wallet/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, chain: 'base' }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Wallet created successfully!');
        // Refresh agents
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to create wallet');
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
      toast.error('Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async (agentId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/wallet/balance?agentId=${agentId}`);
      const data = await response.json();

      if (data.success) {
        setBalance(data.balances);
      } else {
        setBalance(null);
        toast.error(data.error || 'Failed to fetch balance');
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Failed to fetch balance');
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getExplorerUrl = (address: string, chain: string = 'base') => {
    const explorers: Record<string, string> = {
      base: 'https://basescan.org/address/',
      ethereum: 'https://etherscan.io/address/',
      bsc: 'https://bscscan.com/address/',
    };
    return `${explorers[chain] || explorers.base}${address}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Agent Wallets
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage blockchain wallets for your trading agents
          </p>
        </div>
        {agentsWithoutWallets.length > 0 && (
          <Button
            onClick={createBulkWallets}
            disabled={creatingWallets}
            className="gap-2"
          >
            {creatingWallets ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                Create All Wallets ({agentsWithoutWallets.length})
              </>
            )}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="terminal-crt-screen p-4">
          <div className="text-sm text-muted-foreground">Total Agents</div>
          <div className="text-2xl font-bold">{agents.length}</div>
        </Card>
        <Card className="terminal-crt-screen p-4">
          <div className="text-sm text-muted-foreground">With Wallets</div>
          <div className="text-2xl font-bold text-green-600">
            {agentsWithWallets.length}
          </div>
        </Card>
        <Card className="terminal-crt-screen p-4">
          <div className="text-sm text-muted-foreground">Without Wallets</div>
          <div className="text-2xl font-bold text-blue-600">
            {agentsWithoutWallets.length}
          </div>
        </Card>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <Card
            key={agent.id}
            className={`p-4 cursor-pointer transition-all ${
              selectedAgent?.id === agent.id
                ? 'ring-2 ring-primary'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedAgent(agent)}
          >
            <div className="space-y-3">
              {/* Agent Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
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
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {agent.strategyType}
                    </Badge>
                  </div>
                </div>
                {agent.walletAddress ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                )}
              </div>

              {/* Wallet Info or Create Button */}
              {agent.walletAddress ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Wallet</span>
                    <div className="flex items-center gap-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {agent.walletAddress.slice(0, 6)}...
                        {agent.walletAddress.slice(-4)}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(agent.walletAddress);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            getExplorerUrl(agent.walletAddress, agent.primaryChain),
                            '_blank'
                          );
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Balance</span>
                    <span className="font-mono font-semibold">
                      ${agent.realBalance?.toFixed(2) || '0.00'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Chain</span>
                    <Badge variant="secondary">
                      {agent.primaryChain?.toUpperCase() || 'BASE'}
                    </Badge>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    createWallet(agent.id);
                  }}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Create Wallet
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Selected Agent Details */}
      {selectedAgent && selectedAgent.walletAddress && (
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
                {selectedAgent.name} - Wallet Details
              </h3>
              <Button
                onClick={() => fetchBalance(selectedAgent.id)}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {balance && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-2xl">
                  <div className="text-sm text-muted-foreground mb-1">
                    Native Balance
                  </div>
                  <div className="text-2xl font-bold">
                    {parseFloat(balance.native).toFixed(4)} {balance.symbol}
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-2xl">
                  <div className="text-sm text-muted-foreground mb-1">
                    USD Value
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ${balance.usdValue}
                  </div>
                </div>
              </div>
            )}

            {/* Deposit Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-blue-950 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-4">
                <Send className="h-5 w-5 text-green-600" />
                <h4 className="text-lg font-semibold text-green-900 dark:text-green-100">
                  Fund This Agent
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* QR Code Section */}
                <div className="flex flex-col items-center space-y-3">
                  <Button
                    onClick={() => setShowQR(!showQR)}
                    variant="outline"
                    className="w-full"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    {showQR ? 'Hide QR Code' : 'Show QR Code'}
                  </Button>
                  
                  {showQR && qrCode && (
                    <div className="bg-white p-4 rounded-2xl border-2 border-green-300">
                      <Image
                        src={qrCode}
                        alt="Wallet QR Code"
                        width={200}
                        height={200}
                        className="rounded"
                      />
                      <p className="text-xs text-center text-gray-600 mt-2">
                        Scan to deposit
                      </p>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <p className="font-semibold text-sm text-green-900 dark:text-green-100">
                      Quick Deposit Instructions:
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                      <li>Copy the wallet address below</li>
                      <li>Send <strong>ETH</strong> on <strong>Base network</strong></li>
                      <li>Wait for confirmation (1-2 min)</li>
                      <li>Agent will auto-trade with funds</li>
                    </ol>
                  </div>
                  
                  <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-300 dark:border-blue-700">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-xs text-blue-700 dark:text-yellow-200">
                      <strong>Network Warning:</strong> Only send funds on Base network. Wrong network = lost funds!
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Network: Base
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Asset: ETH
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Address */}
            <div className="p-4 bg-muted rounded-2xl border border-gray-300 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Wallet Address
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(selectedAgent.walletAddress)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(getExplorerUrl(selectedAgent.walletAddress, selectedAgent.primaryChain), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Explorer
                  </Button>
                </div>
              </div>
              <code className="text-xs break-all bg-gray-100 dark:bg-gray-800 p-2 rounded block">
                {selectedAgent.walletAddress}
              </code>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
