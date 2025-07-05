import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { input, prompt, model, temperature, maxTokens } = await request.json();
    
    // For structured output
    if (request.headers.get('Accept') === 'application/json') {
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: JSON.stringify(input) }
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" }
      });
      
      return NextResponse.json({ 
        narrative: completion.choices[0].message.content 
      });
    }
    
    // For streaming
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: JSON.stringify(input) }
      ],
      temperature,
      max_tokens: maxTokens,
      stream: true
    });
    
    (async () => {
      try {
        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            await writer.write(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        console.error('Streaming error:', error);
      } finally {
        await writer.close();
      }
    })();
    
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate narrative' },
      { status: 500 }
    );
  }
} 