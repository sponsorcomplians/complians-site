import { NextRequest, NextResponse } from 'next/server';
import { NarrativeAudit } from '@/types/narrative.types';

// In production, this would save to a database
const metricsStore: NarrativeAudit[] = [];

export async function POST(request: NextRequest) {
  try {
    const audit: NarrativeAudit = await request.json();
    
    // Basic validation
    if (!audit.id || !audit.timestamp) {
      return NextResponse.json(
        { error: 'Invalid audit data' },
        { status: 400 }
      );
    }
    
    // Store metrics (in production, save to database)
    metricsStore.push(audit);
    
    // Alert on issues (in production, send to monitoring service)
    if (!audit.validationPassed) {
      console.error('Validation failed for narrative:', audit.id);
    }
    
    if (audit.duration > 10000) {
      console.warn('Slow narrative generation:', audit.id, audit.duration);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Metrics logging error:', error);
    return NextResponse.json(
      { error: 'Failed to log metrics' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const timeframe = request.nextUrl.searchParams.get('timeframe') || 'day';
  
  // Calculate stats (simplified for demo)
  const stats = {
    total: metricsStore.length,
    averageDuration: metricsStore.reduce((sum, m) => sum + m.duration, 0) / metricsStore.length || 0,
    validationPassRate: metricsStore.filter(m => m.validationPassed).length / metricsStore.length || 0,
    modelBreakdown: metricsStore.reduce((acc, m) => {
      acc[m.model] = (acc[m.model] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
  
  return NextResponse.json(stats);
} 