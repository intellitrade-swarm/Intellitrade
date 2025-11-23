

"use client";

import QRCodeSVG from "react-qr-code";
import { Copy, QrCode, X } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface WalletQRCodeProps {
  address: string;
  network: "EVM" | "SOL";
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function WalletQRCode({ address, network, label, size = "md" }: WalletQRCodeProps) {
  const [showDialog, setShowDialog] = useState(false);

  const qrSize = size === "sm" ? 80 : size === "md" ? 120 : 160;
  const dialogQrSize = 300;

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard!");
  };

  const getNetworkColor = () => {
    return network === "EVM" ? "text-blue-500" : "text-blue-500";
  };

  const getNetworkBg = () => {
    return network === "EVM" ? "bg-blue-50 dark:bg-blue-950" : "bg-purple-50 dark:bg-blue-950";
  };

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        {label && (
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {label}
          </div>
        )}
        
        <button
          onClick={() => setShowDialog(true)}
          className={`p-2 rounded-2xl transition-all hover:scale-105 ${getNetworkBg()}`}
          title="Click to view full QR code"
        >
          <QRCodeSVG
            value={address}
            size={qrSize}
            level="H"
          />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={copyAddress}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Copy address"
          >
            <Copy className="w-3 h-3" />
            <span className="font-mono truncate max-w-[100px]">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </button>
          
          <button
            onClick={() => setShowDialog(true)}
            className={`p-1 rounded ${getNetworkBg()} ${getNetworkColor()} hover:opacity-80 transition-opacity`}
            title="View full QR code"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Fund {network} Wallet</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDialog(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4 py-4">
            <div className={`p-4 rounded-2xl ${getNetworkBg()}`}>
              <QRCodeSVG
                value={address}
                size={dialogQrSize}
                level="H"
              />
            </div>

            <div className="w-full space-y-3">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {network === "EVM" ? "Base Network (ETH/USDC)" : "Solana Network (SOL)"}
                </div>
                <div className="font-mono text-xs break-all bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  {address}
                </div>
              </div>

              <Button
                onClick={copyAddress}
                className="w-full"
                variant="outline"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Address
              </Button>

              <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                Scan with your wallet app to send {network === "EVM" ? "ETH or USDC" : "SOL"}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface CompactWalletQRProps {
  address: string;
  network: "EVM" | "SOL" | "BNB";
}

export function CompactWalletQR({ address, network }: CompactWalletQRProps) {
  const [showDialog, setShowDialog] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard!");
  };

  const getNetworkColor = () => {
    if (network === "EVM") return "text-blue-500";
    if (network === "SOL") return "text-blue-500";
    return "text-blue-400";
  };

  const getNetworkBg = () => {
    if (network === "EVM") return "bg-blue-50 dark:bg-blue-950";
    if (network === "SOL") return "bg-purple-50 dark:bg-blue-950";
    return "bg-yellow-50 dark:bg-yellow-950";
  };

  const getNetworkInfo = () => {
    if (network === "EVM") return {
      name: "Base Network",
      assets: "ETH or USDC",
      chainId: "8453",
      warning: "Only send assets on Base network!"
    };
    if (network === "SOL") return {
      name: "Solana Network",
      assets: "SOL",
      chainId: "Mainnet-beta",
      warning: "Only send assets on Solana network!"
    };
    return {
      name: "BNB Smart Chain (BSC)",
      assets: "BNB",
      chainId: "56",
      warning: "Only send BNB on BSC network (Chain ID: 56). Wrong network = lost funds!"
    };
  };

  const networkInfo = getNetworkInfo();

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className={`p-1.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${getNetworkColor()}`}
        title={`View ${network} wallet QR code`}
      >
        <QrCode className="w-4 h-4" />
      </button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Fund {network} Wallet</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDialog(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4 py-4">
            {/* QR Code */}
            <div className={`p-4 rounded-2xl ${getNetworkBg()} border-2 ${
              network === "BNB" ? "border-blue-300" : network === "SOL" ? "border-blue-400" : "border-blue-400"
            }`}>
              <QRCodeSVG
                value={address}
                size={280}
                level="H"
                fgColor="#000000"
                bgColor="#FFFFFF"
              />
            </div>

            <div className="w-full space-y-3">
              {/* Network Warning for BNB */}
              {network === "BNB" && (
                <Alert className="bg-red-50 dark:bg-red-950 border-red-400">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-xs text-red-800 dark:text-red-200">
                    <strong>CRITICAL:</strong> {networkInfo.warning}
                  </AlertDescription>
                </Alert>
              )}

              {/* Network Info */}
              <div className="text-center space-y-2">
                <div className="space-y-1">
                  <div className="text-sm font-semibold">{networkInfo.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {network === "BNB" ? `Chain ID: ${networkInfo.chainId}` : networkInfo.chainId}
                  </div>
                </div>
                <div className="font-mono text-xs break-all bg-gray-100 dark:bg-gray-800 p-3 rounded border">
                  {address}
                </div>
              </div>

              {/* Copy Button */}
              <Button
                onClick={copyAddress}
                className="w-full"
                variant="outline"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Address
              </Button>

              {/* Instructions */}
              <div className={`p-3 rounded-2xl ${getNetworkBg()} border`}>
                <div className="text-xs space-y-1.5">
                  <div className="font-semibold mb-2">How to fund this wallet:</div>
                  <div>1. Open your wallet (MetaMask, Trust Wallet, etc.)</div>
                  {network === "BNB" && (
                    <>
                      <div>2. Switch to <strong>BSC network</strong> (Chain ID: 56)</div>
                      <div>3. Scan QR code or paste address</div>
                      <div>4. Send <strong>BNB</strong> (not ETH or other tokens)</div>
                    </>
                  )}
                  {network === "EVM" && (
                    <>
                      <div>2. Switch to <strong>Base network</strong></div>
                      <div>3. Scan QR code or paste address</div>
                      <div>4. Send ETH or USDC</div>
                    </>
                  )}
                  {network === "SOL" && (
                    <>
                      <div>2. Use <strong>Solana network</strong></div>
                      <div>3. Scan QR code or paste address</div>
                      <div>4. Send SOL</div>
                    </>
                  )}
                </div>
              </div>

              {/* Additional Help */}
              {network === "BNB" && (
                <div className="text-xs text-center text-muted-foreground">
                  Need help? <a 
                    href="https://docs.bnbchain.org/docs/wallet/metamask" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 underline"
                  >
                    Add BSC to MetaMask →
                  </a>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

