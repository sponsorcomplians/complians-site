import { NextRequest, NextResponse } from 'next/server';
import { masterCompliancePDFGenerator } from '@/lib/generateMasterCompliancePDF';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('Master Compliance PDF API: Generating comprehensive PDF report');
    
    const result = await masterCompliancePDFGenerator.generateMasterCompliancePDF();
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'Failed to generate master compliance PDF'
        },
        { status: 500 }
      );
    }

    console.log('Master Compliance PDF API: Success! Generated comprehensive PDF report');
    
    return NextResponse.json({
      success: true,
      pdfContent: result.pdfContent,
      narrative: result.narrative,
      timestamp: new Date().toISOString(),
      reportId: `MC_${Date.now()}`
    });
  } catch (error) {
    console.error('Master Compliance PDF API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate master compliance PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 