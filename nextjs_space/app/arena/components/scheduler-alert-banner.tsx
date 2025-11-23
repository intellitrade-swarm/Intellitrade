'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Play, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function SchedulerAlertBanner() {
  const [isRunning, setIsRunning] = useState<boolean | null>(null);
  const [starting, setStarting] = useState(false);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/trading/scheduler');
      const data = await response.json();
      if (data.success) {
        setIsRunning(data.scheduler.isRunning);
      }
    } catch (error) {
      console.error('Error checking scheduler:', error);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    setStarting(true);
    try {
      const response = await fetch('/api/trading/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', intervalMinutes: 15 }),
      });

      const data = await response.json();

      if (data.success || response.ok) {
        toast.success('Trading scheduler started! First cycle is running...');
        setTimeout(checkStatus, 2000); // Check status after 2 seconds
      } else {
        toast.error(data.error || 'Failed to start scheduler');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to start scheduler');
    } finally {
      setStarting(false);
    }
  };

  // Don't show anything while loading
  if (isRunning === null) {
    return null;
  }

  // Don't show banner if scheduler is running
  if (isRunning) {
    return null;
  }

  return (
    <Alert variant="destructive" className="border-blue-400/50 bg-blue-400/10">
      <AlertCircle className="h-5 w-5 text-blue-400" />
      <AlertTitle className="text-blue-400 font-semibold">
        Trading Scheduler Not Running
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          The autonomous trading system is currently stopped. No new trades will be executed until you start it.
        </span>
        <Button
          onClick={handleStart}
          disabled={starting}
          size="sm"
          className="ml-4 bg-green-500 hover:bg-green-600 text-white"
        >
          {starting ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Trading
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
