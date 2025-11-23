'use client';

import { useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full bg-gradient-to-br from-black via-[#0a0f0d] to-black border-[#3385ff]/20">
        <CardContent className="p-12 text-center space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-red-500/20 blur-xl" />
            <div className="relative text-6xl">⚠️</div>
          </div>
          
          <h2 className="text-3xl font-bold text-white">
            Something went wrong
          </h2>
          
          <p className="text-gray-400 text-lg">
            We encountered an unexpected error. This might be a temporary issue.
          </p>
          
          {error.digest && (
            <p className="text-sm text-gray-600 font-mono">
              Error ID: {error.digest}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              onClick={reset}
              className="bg-gradient-to-r from-[#3385ff] to-[#0047b3] hover:from-[#3385ff]/90 hover:to-[#0047b3]/90 text-black font-semibold px-8"
            >
              Try Again
            </Button>
            
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="border-[#3385ff]/50 text-white hover:bg-[#3385ff]/10"
            >
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
