
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Code } from 'lucide-react';

export default function IntegrationGuidePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/20 via-blue-950/10 to-black">
      {/* Background Grid */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 102, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 102, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="text-white hover:text-blue-400 hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Integration Guide
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Learn how to integrate the Intellitrade Oracle service into your smart contracts and applications
          </p>
        </div>

        {/* Integration Guide Card */}
        <Card className="terminal-crt-screen bg-gradient-to-br from-blue-900/20 via-blue-950/10 to-black backdrop-blur border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Code className="h-5 w-5 text-blue-400" />
              Integration Guide
            </CardTitle>
            <CardDescription className="text-gray-400">
              How to use the oracle service in your smart contracts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="smart-contract">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
                <TabsTrigger value="smart-contract" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
                  Smart Contract
                </TabsTrigger>
                <TabsTrigger value="javascript" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
                  JavaScript
                </TabsTrigger>
                <TabsTrigger value="data-sources" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
                  Data Sources
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="smart-contract" className="space-y-4 mt-6">
                <div className="p-6 rounded-2xl bg-gray-900/80 font-mono text-sm overflow-x-auto border border-blue-500/20">
                  <pre className="text-gray-300">{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOracle {
    function requestData(string calldata _dataUrl) 
        external returns (uint256);
    function getData(uint256 _id) 
        external view returns (uint256);
}

contract MyDeFiApp {
    IOracle public oracle;
    
    constructor(address _oracle) {
        oracle = IOracle(_oracle);
    }
    
    function getETHPrice() external returns (uint256) {
        uint256 requestId = oracle.requestData("eth-price");
        return requestId;
    }
    
    function readETHPrice(uint256 _requestId) 
        external view returns (uint256) {
        return oracle.getData(_requestId);
    }
}`}</pre>
                </div>
                <div className="p-4 rounded-2xl bg-blue-900/20 border border-blue-500/30">
                  <p className="text-sm text-gray-300">
                    <strong className="text-blue-400">💡 Tip:</strong> Deploy your contract with the oracle address to start requesting data on-chain.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="javascript" className="space-y-4 mt-6">
                <div className="p-6 rounded-2xl bg-gray-900/80 font-mono text-sm overflow-x-auto border border-blue-500/20">
                  <pre className="text-gray-300">{`import { ethers } from 'ethers';
import { OracleClient } from './blockchain-oracle';

// Initialize oracle client
const oracleClient = new OracleClient('astar-zkevm');

// Request ETH price
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const requestId = await oracleClient.requestData(
  'eth-price',
  wallet
);

console.log('Request ID:', requestId);

// Wait for oracle to fulfill
setTimeout(async () => {
  const price = await oracleClient.getData(requestId);
  console.log('ETH Price:', price / 100); // Divide by 100
}, 30000); // Wait 30 seconds`}</pre>
                </div>
                <div className="p-4 rounded-2xl bg-blue-900/20 border border-blue-500/30">
                  <p className="text-sm text-gray-300">
                    <strong className="text-blue-400">💡 Tip:</strong> Use the OracleClient to interact with the service programmatically.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="data-sources" className="space-y-4 mt-6">
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-950/20">
                    <h4 className="font-semibold text-sm mb-2 text-blue-300">eth-price</h4>
                    <p className="text-xs text-gray-400">Ethereum price in USD (×100 for decimals)</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-950/20">
                    <h4 className="font-semibold text-sm mb-2 text-blue-300">btc-price</h4>
                    <p className="text-xs text-gray-400">Bitcoin price in USD (×100 for decimals)</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-950/20">
                    <h4 className="font-semibold text-sm mb-2 text-blue-300">ai-sentiment:SYMBOL</h4>
                    <p className="text-xs text-gray-400">AI-powered sentiment: 100=Bullish, 50=Neutral, 0=Bearish</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-950/20">
                    <h4 className="font-semibold text-sm mb-2 text-blue-300">https://your-api.com/data</h4>
                    <p className="text-xs text-gray-400">Custom HTTP endpoint returning numeric data</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-blue-900/20 border border-blue-500/30 mt-6">
                  <p className="text-sm text-gray-300">
                    <strong className="text-blue-400">💡 Tip:</strong> You can request any numeric data from supported endpoints or custom APIs.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <Card className="terminal-crt-screen bg-gradient-to-br from-blue-900/20 via-blue-950/10 to-black backdrop-blur border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white">Additional Resources</CardTitle>
            <CardDescription className="text-gray-400">
              More information to help you get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gray-900/50 border border-blue-500/20">
                <h4 className="font-semibold text-blue-300 mb-2">Oracle Contract Address</h4>
                <code className="text-xs text-gray-300 break-all">0x...</code>
                <p className="text-xs text-gray-400 mt-2">Use this address when deploying your contracts</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-900/50 border border-blue-500/20">
                <h4 className="font-semibold text-blue-300 mb-2">Network</h4>
                <p className="text-sm text-gray-300">Astar zkEVM (Testnet & Mainnet)</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-900/50 border border-blue-500/20">
                <h4 className="font-semibold text-blue-300 mb-2">Support</h4>
                <p className="text-sm text-gray-300">Join our Discord for technical support and updates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
