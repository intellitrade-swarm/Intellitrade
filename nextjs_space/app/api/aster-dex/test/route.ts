
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { testConnection, isConfigured } from '../../../../lib/aster-dex';

export const dynamic = "force-dynamic";

/**
 * Test Aster Dex API connection
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const configured = isConfigured();
    
    if (!configured) {
      return NextResponse.json({ 
        success: false,
        configured: false,
        message: 'Aster Dex API credentials not configured. Please set ASTER_DEX_API_KEY and ASTER_DEX_API_SECRET environment variables.'
      });
    }

    const connected = await testConnection();

    return NextResponse.json({
      success: connected,
      configured: true,
      connected,
      message: connected 
        ? 'Successfully connected to Aster Dex API' 
        : 'Failed to connect to Aster Dex API. Please check your credentials.'
    });

  } catch (error) {
    console.error('Error testing Aster Dex connection:', error);
    return NextResponse.json(
      { 
        success: false,
        configured: isConfigured(),
        connected: false,
        error: 'Connection test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

