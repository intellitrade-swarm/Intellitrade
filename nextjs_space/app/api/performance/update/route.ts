
import { NextResponse } from 'next/server';
import { updateAllAgentPerformance } from '../../../../lib/performance-tracker';

export const dynamic = "force-dynamic";

/**
 * API endpoint to update performance metrics for all agents
 */
export async function POST() {
  try {
    await updateAllAgentPerformance();
    return NextResponse.json({ 
      success: true, 
      message: 'Performance metrics updated for all agents' 
    });
  } catch (error) {
    console.error('Error updating performance:', error);
    return NextResponse.json(
      { error: 'Failed to update performance metrics' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await updateAllAgentPerformance();
    return NextResponse.json({ 
      success: true, 
      message: 'Performance metrics updated for all agents' 
    });
  } catch (error) {
    console.error('Error updating performance:', error);
    return NextResponse.json(
      { error: 'Failed to update performance metrics' },
      { status: 500 }
    );
  }
}
