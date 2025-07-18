import { NextResponse } from 'next/server';
import { aiService } from '@/lib/simple-ai-service';

// Test endpoint to verify narrative generation
export async function GET() {
  const testData = {
    workerName: 'John Smith',
    cosReference: 'COS123456',
    assignmentDate: '2025-01-15',
    jobTitle: 'Software Engineer',
    socCode: '2136',
    cosDuties: 'Develop and maintain software applications',
    jobDescriptionDuties: 'Design, code, test and debug software',
    missingDocs: [],
    employmentHistoryConsistent: true,
    experienceMatchesDuties: true,
    referencesCredible: true,
    experienceRecentAndContinuous: true
  };

  try {
    const narrative = await aiService.generateNarrative(testData);
    
    return NextResponse.json({
      success: true,
      test_data: testData,
      narrative: narrative,
      openai_configured: !!process.env.OPENAI_API_KEY,
      using_ai: narrative.includes('Generated:') ? false : true
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      openai_configured: !!process.env.OPENAI_API_KEY
    });
  }
}