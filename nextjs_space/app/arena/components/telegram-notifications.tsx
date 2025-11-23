
'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Icons } from '../../../components/ui/icons';
import { useToast } from '../../../hooks/use-toast';

export function TelegramNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const { toast } = useToast();

  // Check current subscription status
  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/telegram/subscribe', {
        credentials: 'include', // Include cookies for session
      });
      if (response.ok) {
        const data = await response.json();
        setIsSubscribed(data.subscribed || false);
        setCurrentUsername(data.username || '');
        setTelegramUsername(data.username || '');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSubscribe = async () => {
    if (!telegramUsername.trim()) {
      toast({
        title: 'Username Required',
        description: 'Please enter your Telegram username',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    console.log('🔄 Subscribing to Telegram notifications...', telegramUsername.trim());
    
    try {
      const response = await fetch('/api/telegram/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({ telegramUsername: telegramUsername.trim() }),
      });

      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok) {
        console.log('✅ Subscription successful');
        setIsSubscribed(true);
        setCurrentUsername(data.username);
        toast({
          title: '✅ Successfully Subscribed!',
          description: data.message || 'Your Telegram username has been saved. Please message @swarmiQbot to activate notifications.',
          duration: 6000,
        });
      } else {
        console.error('❌ Subscription failed:', data.error);
        
        // Handle specific error cases
        if (response.status === 401) {
          toast({
            title: '🔐 Authentication Required',
            description: 'Please log out and log back in, then try again.',
            variant: 'destructive',
            duration: 8000,
          });
        } else {
          toast({
            title: '❌ Subscription Failed',
            description: data.error || 'Failed to subscribe to notifications. Please try again.',
            variant: 'destructive',
            duration: 6000,
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Error subscribing:', error);
      toast({
        title: '❌ Network Error',
        description: error.message || 'Failed to connect to server. Please check your connection and try again.',
        variant: 'destructive',
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/telegram/unsubscribe', {
        method: 'POST',
        credentials: 'include', // Include cookies for session
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubscribed(false);
        setCurrentUsername('');
        toast({
          title: 'Unsubscribed',
          description: data.message,
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to unsubscribe',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: 'Error',
        description: 'Failed to unsubscribe',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <Card className="terminal-crt-screen premium-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Icons.spinner className="h-6 w-6 animate-spin text-[#3385ff]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="terminal-crt-screen premium-card">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="relative flex-shrink-0">
            <Icons.bell className="h-6 w-6 text-[#3385ff]" />
            {isSubscribed && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-[#3385ff] rounded-full animate-pulse" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="break-words">Telegram Notifications</CardTitle>
            <CardDescription className="break-words">
              Get instant alerts for profitable trades
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSubscribed ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="telegram-username">Telegram Username</Label>
              <div className="flex space-x-2">
                <Input
                  id="telegram-username"
                  placeholder="@username or username"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  disabled={isLoading}
                  className="bg-black/50 border-[#3385ff]/30 focus:border-[#3385ff]"
                />
              </div>
              <p className="text-xs text-gray-400">
                Enter your Telegram username to receive live trade notifications
              </p>
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={isLoading || !telegramUsername.trim()}
              className="w-full bg-gradient-to-r from-[#3385ff] to-[#0047b3] hover:from-[#3385ff]/90 hover:to-[#0047b3]/90 text-black font-semibold"
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  <Icons.bell className="mr-2 h-4 w-4" />
                  Receive Live Trade Notifications
                </>
              )}
            </Button>

            <div className="bg-[#3385ff]/5 border border-[#3385ff]/20 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-medium text-[#3385ff]">📱 How to activate notifications:</p>
              <ol className="text-xs text-gray-300 space-y-2 ml-4 list-decimal break-words">
                <li className="font-medium">Enter your Telegram username above</li>
                <li className="font-medium break-words">Click <span className="text-[#3385ff]">"Receive Live Trade Notifications"</span></li>
                <li className="font-medium break-words">Open Telegram and search for <span className="text-[#3385ff] font-bold break-all">@swarmiQbot</span></li>
                <li className="font-medium break-words">Send <span className="text-[#3385ff] font-mono">/start</span> to the bot</li>
                <li className="text-[#3385ff] break-words">Done! You'll now get instant alerts for profitable trades! 🚀</li>
              </ol>
            </div>
          </>
        ) : (
          <>
            <div className="bg-[#3385ff]/10 border border-[#3385ff]/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Icons.checkCircle className="h-5 w-5 text-[#3385ff] flex-shrink-0" />
                <p className="font-semibold text-white">✅ Subscription Confirmed</p>
              </div>
              <p className="text-sm text-gray-300 break-words">
                Subscribed as <span className="text-[#3385ff] font-semibold break-all">@{currentUsername}</span>
              </p>
              <div className="border-t border-[#3385ff]/20 pt-2 space-y-1">
                <p className="text-xs text-gray-400 break-words">
                  📱 <span className="font-semibold">Important:</span> If you haven't already, open Telegram and send <span className="text-[#3385ff] font-mono">/start</span> to <span className="text-[#3385ff] font-semibold break-all">@swarmiQbot</span> to activate notifications.
                </p>
                <p className="text-xs text-gray-500 break-words">
                  You'll receive instant alerts when AI agents complete profitable trades! 🚀
                </p>
              </div>
            </div>

            <Button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              variant="outline"
              className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Unsubscribing...
                </>
              ) : (
                <>
                  <Icons.bellOff className="mr-2 h-4 w-4" />
                  Unsubscribe
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
