import { NextRequest, NextResponse } from 'next/server';
import { skillsExperienceSystemPrompt } from '@/lib/prompts/skillsExperiencePrompt';

// Simple API key check (you can enhance this with proper auth)
function isAuthorized(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  const authHeader = request.headers.get('authorization');
  
  // Check for API key in header
  if (apiKey && apiKey === process.env.API_SECRET_KEY) {
    return true;
  }
  
  // Check for Bearer token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Add your token validation logic here
    return token === process.env.API_SECRET_KEY;
  }
  
  // Allow if DISABLE_AUTH is set to true
  if (process.env.DISABLE_AUTH === 'true') {
    return true;
  }
  
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
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { worker, documents, assessmentData } = body;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: skillsExperienceSystemPrompt
          },
          {
            role: 'user',
            content: `Generate a compliance assessment for the following worker:\n\n${JSON.stringify({ worker, documents, assessmentData }, null, 2)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate narrative');
    }

    const data = await response.json();
    const narrative = data.choices[0]?.message?.content;

    if (!narrative) {
      throw new Error('No narrative generated');
    }

    return NextResponse.json({ 
      success: true, 
      narrative,
      model: 'gpt-4-turbo-preview'
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