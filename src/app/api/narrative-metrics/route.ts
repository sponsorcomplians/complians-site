import { NextRequest, NextResponse } from 'next/server';
import { NarrativeAudit } from '@/types/narrative.types';

export async function POST(request: NextRequest) {
  try {
    const audit: NarrativeAudit = await request.json();
    
    // Here you would typically store the metrics in a database
    // For now, we'll just log them and return success
    console.log('Narrative metrics logged:', {
      id: audit.id,
      timestamp: audit.timestamp,
      model: audit.model,
      duration: audit.duration,
      validationPassed: audit.validationPassed,
      costEstimate: audit.costEstimate
    });
    
    return NextResponse.json({ success: true, message: 'Metrics logged successfully' });
  } catch (error) {
    console.error('Error logging narrative metrics:', error);
    return NextResponse.json(
      { error: 'Failed to log metrics' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') as 'hour' | 'day' | 'week' || 'day';
    
    // Here you would typically fetch metrics from a database
    // For now, we'll return mock data
    const mockStats = {
      totalGenerations: 150,
      aiGenerations: 120,
      fallbackGenerations: 30,
      averageDuration: 2500,
      validationPassRate: 0.95,
      totalCost: 12.50,
      modelUsage: {
        'gpt-4': 80,
        'gpt-3.5-turbo': 30,
        'cache-hit': 40
      }
    };
    
    return NextResponse.json({ 
      success: true, 
      timeframe,
      stats: mockStats 
    });
  } catch (error) {
    console.error('Error fetching narrative metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
} 