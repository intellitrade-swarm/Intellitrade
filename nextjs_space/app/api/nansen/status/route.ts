
/**
 * Nansen API Status Check
 * GET: Check if Nansen API is configured and operational
 */

import { NextRequest, NextResponse } from 'next/server';
import { nansenAPI } from '@/lib/nansen-api';

export async function GET(req: NextRequest) {
  try {
    const isConfigured = nansenAPI.isConfigured();

    return NextResponse.json({ 
      success: true,
      configured: isConfigured,
      status: isConfigured ? 'operational' : 'not_configured',
      message: isConfigured 
        ? 'Nansen API is configured and ready' 
        : 'Nansen API key not found in environment variables'
    });
  } catch (error: any) {
    console.error('[Nansen Status API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
