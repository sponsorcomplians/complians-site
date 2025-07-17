import { NextRequest, NextResponse } from 'next/server';
import { skillsExperienceSystemPrompt } from '@/lib/prompts/skillsExperiencePrompt';

// Simple API key check (you can enhance this with proper auth)
function isAuthorized(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  const authHeader = request.headers.get('authorization');
  
  console.log('[Auth Check] Headers received:', {
    'x-api-key': apiKey ? `***${apiKey.slice(-4)}` : 'not provided',
    'authorization': authHeader ? 'Bearer ***' : 'not provided'
  });
  
  // Allow if DISABLE_AUTH is set to true (development mode)
  if (process.env.DISABLE_AUTH === 'true') {
    console.log('[Auth Check] DISABLE_AUTH is true, allowing request');
    return true;
  }
  
  // Check for API key in header (check both public and secret keys)
  if (apiKey && (apiKey === process.env.NEXT_PUBLIC_API_KEY || apiKey === process.env.API_SECRET_KEY)) {
    console.log('[Auth Check] Valid API key provided');
    return true;
  }
  
  // Check for Bearer token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Add your token validation logic here
    if (token === process.env.API_SECRET_KEY) {
      console.log('[Auth Check] Valid Bearer token provided');
      return true;
    }
  }
  
  // For development, allow test key if no other auth is configured
  if (apiKey === 'test-public-key-123' && !process.env.NEXT_PUBLIC_API_KEY && !process.env.API_SECRET_KEY) {
    console.log('[Auth Check] Using test key in development mode');
    return true;
  }
  
  console.log('[Auth Check] Authorization failed');
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('[API Route] OpenAI API key not configured in environment variables');
      console.error('[API Route] Please set OPENAI_API_KEY in your .env.local file');
      return NextResponse.json(
        { 
          error: 'AI service not configured',
          details: 'OpenAI API key is missing. Please configure OPENAI_API_KEY in environment variables.'
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('API Route - Received request body:', JSON.stringify(body, null, 2));

    // Extract data with fallbacks
    const { 
      workerName, 
      cosReference, 
      assignmentDate, 
      jobTitle, 
      socCode, 
      cosDuties, 
      jobDescriptionDuties,
      hasJobDescription,
      hasCV,
      hasReferences,
      hasContracts,
      hasPayslips,
      hasTraining,
      employmentHistoryConsistent,
      experienceMatchesDuties,
      referencesCredible,
      experienceRecentAndContinuous,
      inconsistenciesDescription,
      missingDocs,
      worker,
      documents,
      assessmentData 
    } = body;

    // Build comprehensive data object for AI analysis
    const analysisData = {
      worker: {
        name: workerName || worker?.name || 'Unknown Worker',
        cosReference: cosReference || worker?.cosReference || 'Unknown CoS',
        assignmentDate: assignmentDate || worker?.assignmentDate || 'Unknown Date',
        jobTitle: jobTitle || worker?.jobTitle || 'Unknown Role',
        socCode: socCode || worker?.socCode || 'Unknown SOC',
        cosDuties: cosDuties || worker?.cosDuties || 'Not provided',
        jobDescriptionDuties: jobDescriptionDuties || worker?.jobDescriptionDuties || 'Not provided'
      },
      documents: {
        hasJobDescription: hasJobDescription || false,
        hasCV: hasCV || false,
        hasReferences: hasReferences || false,
        hasContracts: hasContracts || false,
        hasPayslips: hasPayslips || false,
        hasTraining: hasTraining || false,
        uploadedFiles: documents || []
      },
      assessment: {
        employmentHistoryConsistent: employmentHistoryConsistent || false,
        experienceMatchesDuties: experienceMatchesDuties || false,
        referencesCredible: referencesCredible || false,
        experienceRecentAndContinuous: experienceRecentAndContinuous || false,
        inconsistenciesDescription: inconsistenciesDescription || 'None noted',
        missingDocs: missingDocs || []
      },
      rawData: {
        worker,
        documents,
        assessmentData
      }
    };

    console.log('API Route - Structured analysis data:', JSON.stringify(analysisData, null, 2));

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: skillsExperienceSystemPrompt
          },
          {
            role: 'user',
            content: `Generate a compliance assessment based on the following extracted data. Use ONLY the information provided and do not use any templates or fallback content:\n\n${JSON.stringify(analysisData, null, 2)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Route] OpenAI API error response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      // Parse error if it's JSON
      let errorDetails = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.error?.message || errorText;
      } catch (e) {
        // Keep original error text if not JSON
      }
      
      throw new Error(`OpenAI API error (${response.status}): ${errorDetails}`);
    }

    const data = await response.json();
    console.log('API Route - OpenAI response:', JSON.stringify(data, null, 2));
    
    const narrative = data.choices[0]?.message?.content;

    if (!narrative) {
      console.error('API Route - No narrative generated from OpenAI');
      throw new Error('No narrative generated from AI service');
    }

    console.log('API Route - Generated narrative:', narrative);

    return NextResponse.json({ 
      success: true, 
      narrative,
      model: 'gpt-4-turbo',
      analysisData: analysisData
    });

  } catch (error) {
    console.error('Error generating narrative:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate narrative',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 