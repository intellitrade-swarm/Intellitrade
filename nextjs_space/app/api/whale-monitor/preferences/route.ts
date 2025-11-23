
import { NextRequest, NextResponse } from 'next/server';
import { whaleMonitor } from '@/lib/whale-monitor';

/**
 * GET /api/whale-monitor/preferences
 * 
 * Get user signal preferences
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    
    const preferences = await whaleMonitor.getUserPreferences(userId);
    
    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error('Error getting preferences:', error);
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/whale-monitor/preferences
 * 
 * Set user signal preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'demo-user', ...preferences } = body;
    
    await whaleMonitor.setUserPreferences(userId, preferences);
    
    const updated = await whaleMonitor.getUserPreferences(userId);
    
    return NextResponse.json({
      success: true,
      preferences: updated,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
