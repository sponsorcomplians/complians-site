import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Ensure this runs in Node.js, not edge
export const dynamic = 'force-dynamic'; // Prevent static generation

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  try {
    // Dynamically import pdf-parse to prevent build-time execution
    const pdfParse = (await import('pdf-parse')).default;
    
    // @ts-ignore: File is a Blob in Next.js API routes
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await pdfParse(buffer);
    
    return NextResponse.json({ text: result.text });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to parse PDF', details: (error as Error).message }, { status: 500 });
  }
} 