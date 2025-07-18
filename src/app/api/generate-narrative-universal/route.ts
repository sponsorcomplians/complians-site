import { NextRequest, NextResponse } from 'next/server';
import { universalAIService } from '@/lib/universal-ai-service';

export async function POST(request: NextRequest) {
  try {
    console.log('[Universal Narrative API] Received request');
    
    const body = await request.json();
    const { agentType, workerName, jobTitle, socCode, cosReference, assignmentDate, assessmentData } = body;
    
    // Validate required fields
    if (!agentType || !workerName || !jobTitle) {
      console.log('[Universal Narrative API] Missing required fields');
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: 'agentType, workerName, and jobTitle are required'
        },
        { status: 400 }
      );
    }
    
    console.log('[Universal Narrative API] Processing for agent:', agentType);
    
    // Generate narrative using universal AI service
    const narrative = await universalAIService.generateNarrative({
      agentType,
      workerName,
      jobTitle,
      socCode,
      cosReference,
      assignmentDate,
      assessmentData: assessmentData || {}
    });
    
    console.log('[Universal Narrative API] Narrative generated successfully');
    
    return NextResponse.json({
      success: true,
      narrative,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[Universal Narrative API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate narrative',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}