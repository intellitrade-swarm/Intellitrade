
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy } from 'lucide-react';
import { SportsPredictions } from '../oracle/components/sports-predictions';

export default function SportsPredictionsPage() {
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
          <div className="flex items-center justify-center gap-3">
            <Trophy className="h-8 w-8 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Sports Predictions
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            AI-powered predictions for NBA, NFL, MMA and more with real-time odds and analysis
          </p>
        </div>

        {/* Sports Predictions Component */}
        <Card className="terminal-crt-screen bg-gradient-to-br from-blue-900/20 via-blue-950/10 to-black backdrop-blur border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Trophy className="h-5 w-5 text-blue-400" />
              Sports Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SportsPredictions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
