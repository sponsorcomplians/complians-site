import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/simple-ai-service';

export async function POST(request: NextRequest) {
  try {
    console.log('[API v2] Narrative generation request received');
    
    // Parse request body
    const body = await request.json();
    
    // Extract the data we need
    const narrativeData = {
      workerName: body.workerName || 'Unknown Worker',
      cosReference: body.cosReference || 'Unknown',
      assignmentDate: body.assignmentDate || new Date().toISOString(),
      jobTitle: body.jobTitle || 'Unknown Role',
      socCode: body.socCode || 'Unknown',
      cosDuties: body.cosDuties || 'Not provided',
      jobDescriptionDuties: body.jobDescriptionDuties || 'Not provided',
      missingDocs: body.missingDocs || [],
      employmentHistoryConsistent: body.employmentHistoryConsistent || false,
      experienceMatchesDuties: body.experienceMatchesDuties || false,
      referencesCredible: body.referencesCredible || false,
      experienceRecentAndContinuous: body.experienceRecentAndContinuous || false,
      inconsistenciesDescription: body.inconsistenciesDescription || ''
    };
    
    console.log('[API v2] Processing narrative for:', narrativeData.workerName);
    
    // Generate narrative using simple AI service
    const narrative = await aiService.generateNarrative(narrativeData);
    
    console.log('[API v2] Narrative generated successfully');
    
    return NextResponse.json({
      success: true,
      narrative: narrative,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[API v2] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate narrative',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Also support GET for testing
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Narrative generation API v2 is running',
    openai_configured: !!process.env.OPENAI_API_KEY,
    tip: 'Use POST method to generate narratives'
  });
}