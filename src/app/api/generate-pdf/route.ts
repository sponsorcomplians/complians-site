import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { html, filename } = await req.json();
    if (!html) {
      return NextResponse.json({ error: 'Missing HTML content' }, { status: 400 });
    }

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // Debug log for PDF response
    console.log('PDF Response headers:', {
      contentType: 'application/pdf',
      contentLength: pdfBuffer.length
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename || 'report'}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    // Fallback: return HTML as PDF-like buffer
    try {
      const { html, filename } = await req.json();
      const htmlBuffer = Buffer.from(html, 'utf-8');
      return new NextResponse(htmlBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename || 'report'}.pdf"`,
        },
      });
    } catch (fallbackError) {
      return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
  }
} 