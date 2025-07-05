import { NextRequest, NextResponse } from 'next/server';
import { NarrativeInput, ModelConfig } from '@/types/narrative.types';

interface GenerateRequest {
  input: NarrativeInput;
  prompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export async function POST(request: NextRequest) {
  try {
    const { input, prompt, model, temperature, maxTokens }: GenerateRequest = await request.json();
    
    // Validate required environment variables
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a Senior Immigration Solicitor specializing in UK sponsor compliance. Generate formal assessment letters in British legal English.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: temperature,
        max_tokens: maxTokens,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: 'AI generation failed', details: errorData },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    const narrative = data.choices[0]?.message?.content?.trim();
    
    if (!narrative) {
      return NextResponse.json(
        { error: 'No narrative generated' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      narrative,
      usage: data.usage,
      model: model
    });
    
  } catch (error) {
    console.error('Error generating narrative:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 