
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Loader2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface TreasuryManagementProps {
  isOpen: boolean;
  onClose: () => void;
  treasuryStats: TreasuryStats;
}

export function TreasuryManagement({
  isOpen,
  onClose,
  treasuryStats,
}: TreasuryManagementProps) {
  const [chain, setChain] = useState('base');
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [txHash, setTxHash] = useState('');

  const handleWithdraw = async () => {
    setError('');
    setSuccess('');
    setTxHash('');

    if (!chain || !amount || !recipientAddress) {
      setError('Please fill in all fields');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError('Invalid amount');
      return;
    }

    // Check if sufficient balance
    const chainBalance =
      chain === 'base'
        ? treasuryStats.balance.base
        : chain === 'bsc'
        ? treasuryStats.balance.bsc
        : chain === 'ethereum'
        ? treasuryStats.balance.ethereum
        : treasuryStats.balance.solana;

    if (withdrawAmount > chainBalance) {
      setError(`Insufficient balance. Available: $${chainBalance.toFixed(2)}`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/treasury/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chain,
          amount: withdrawAmount,
          recipientAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Withdrawal failed');
      }

      setSuccess('Withdrawal successful!');
      setTxHash(data.txHash);
      setAmount('');
      setRecipientAddress('');

      // Close modal after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to process withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableBalance = () => {
    switch (chain) {
      case 'base':
        return treasuryStats.balance.base;
      case 'bsc':
        return treasuryStats.balance.bsc;
      case 'ethereum':
        return treasuryStats.balance.ethereum;
      case 'solana':
        return treasuryStats.balance.solana;
      default:
        return 0;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-gray-900 to-black border-2 border-blue-500/30 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Wallet className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Treasury Management</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Chain Selection */}
              <div>
                <Label htmlFor="chain" className="text-gray-300">
                  Chain
                </Label>
                <Select value={chain} onValueChange={setChain}>
                  <SelectTrigger className="w-full bg-black/40 border-blue-500/30">
                    <SelectValue placeholder="Select chain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="base">Base</SelectItem>
                    <SelectItem value="bsc">BSC</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="solana">Solana</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Available: ${getAvailableBalance().toFixed(2)}
                </p>
              </div>

              {/* Amount */}
              <div>
                <Label htmlFor="amount" className="text-gray-300">
                  Amount (USD)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-black/40 border-blue-500/30"
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Recipient Address */}
              <div>
                <Label htmlFor="recipient" className="text-gray-300">
                  Recipient Address
                </Label>
                <Input
                  id="recipient"
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder={
                    chain === 'solana'
                      ? 'Solana wallet address'
                      : 'EVM wallet address (0x...)'
                  }
                  className="bg-black/40 border-blue-500/30"
                />
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert className="bg-green-500/10 border-green-500/30">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-400">
                    {success}
                    {txHash && (
                      <div className="mt-1 text-xs break-all">
                        TX: {txHash.slice(0, 20)}...
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Withdraw Button */}
              <Button
                onClick={handleWithdraw}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Withdraw'
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
