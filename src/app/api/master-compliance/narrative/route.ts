import { NextRequest, NextResponse } from 'next/server';
import { masterComplianceService } from '@/lib/masterComplianceService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workerId } = body;

    if (!workerId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Worker ID is required'
        },
        { status: 400 }
      );
    }

    console.log('Master Compliance Narrative API: Generating combined narrative for worker:', workerId);
    
    const result = await masterComplianceService.generateCombinedNarrative(workerId);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'Failed to generate combined narrative'
        },
        { status: 500 }
      );
    }

    console.log('Master Compliance Narrative API: Success! Generated combined narrative');
    
    return NextResponse.json({
      success: true,
      narrative: result.narrative,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Master Compliance Narrative API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate combined narrative',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 