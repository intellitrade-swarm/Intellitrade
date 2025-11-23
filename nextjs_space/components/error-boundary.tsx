'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <Card className="max-w-lg w-full bg-gradient-to-br from-black via-[#0a0f0d] to-black border-[#3385ff]/20">
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-white">
                Something went wrong
              </h2>
              <p className="text-gray-400">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
              <Button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
                className="bg-gradient-to-r from-[#3385ff] to-[#0047b3] hover:from-[#3385ff]/90 hover:to-[#0047b3]/90 text-black font-semibold mt-4"
              >
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
