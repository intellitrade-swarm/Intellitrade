
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const logPath = '/home/ubuntu/ipool_swarms/x_signal_posting.log';
    
    // Check if service is running
    const { exec } = require('child_process');
    const isRunning = await new Promise((resolve) => {
      exec('ps aux | grep "start-x-signal-posting" | grep -v grep', (error: any, stdout: string) => {
        resolve(stdout.trim().length > 0);
      });
    });
    
    // Get last 20 lines of log
    let recentLogs: string[] = [];
    if (fs.existsSync(logPath)) {
      const logContent = fs.readFileSync(logPath, 'utf-8');
      recentLogs = logContent.split('\n').filter(line => line.trim()).slice(-20);
    }
    
    // Load X API credentials to check config
    const secretsPath = '/home/ubuntu/.config/abacusai_auth_secrets.json';
    let hasCredentials = false;
    
    if (fs.existsSync(secretsPath)) {
      const secretsData = fs.readFileSync(secretsPath, 'utf-8');
      const secrets = JSON.parse(secretsData);
      hasCredentials = !!secrets['x (twitter)'];
    }
    
    return NextResponse.json({
      status: isRunning ? 'running' : 'stopped',
      hasCredentials,
      recentLogs,
      logPath,
      account: '@defidash_agent',
      checkInterval: '15 minutes',
      cooldown: '30 minutes',
      minConfidence: '60%',
      minPnl: '$50',
    });
  } catch (error: any) {
    console.error('Error getting X posting status:', error);
    return NextResponse.json(
      { error: 'Failed to get status', message: error.message },
      { status: 500 }
    );
  }
}
