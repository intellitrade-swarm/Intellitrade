
'use client';

import { useEffect, useState } from 'react';
import { UnifiedAgentWallet } from '../arena/components/UnifiedAgentWallet';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Agent {
  id: string;
  name: string;
  strategyType: string;
  balance: number;
  realBalance: number;
  status: string;
}

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        if (response.ok) {
          const data = await response.json();
          setAgents(data.agents || []);
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white terminal-crt-screen">
      {/* Terminal Grid Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-blue-950/10 to-black"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0, 102, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 102, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4 text-white hover:text-[#0066ff] hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <div className="space-y-6">
            {loading ? (
              <div className="text-center text-blue-400">Loading agents...</div>
            ) : (
              <UnifiedAgentWallet 
                agents={agents} 
                selectedAgent={null}
                onSelectAgent={() => {}}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
