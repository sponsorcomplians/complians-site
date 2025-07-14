import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export const runtime = 'nodejs'; // Ensure this runs in Node.js, not edge

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // @ts-ignore: File is a Blob in Next.js API routes
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await pdfParse(buffer);
    return NextResponse.json({ text: result.text });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to parse PDF', details: (error as Error).message }, { status: 500 });
  }
} 