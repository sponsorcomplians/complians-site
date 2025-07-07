import { NextRequest, NextResponse } from 'next/server';
import { masterComplianceService } from '@/lib/masterComplianceService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('Master Compliance Export API: Generating global summary PDF');
    
    const result = await masterComplianceService.generateGlobalSummaryPDF();
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'Failed to generate summary PDF'
        },
        { status: 500 }
      );
    }

    console.log('Master Compliance Export API: Success! Generated summary PDF');
    
    return NextResponse.json({
      success: true,
      filePath: result.filePath,
      content: result.content,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Master Compliance Export API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate summary PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 