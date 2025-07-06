import { NextRequest, NextResponse } from 'next/server';
import { masterComplianceService } from '@/lib/masterComplianceService';
import { generateExecutiveSummaryPDF } from '@/lib/generateExecutiveSummaryPDF';

export async function POST(request: NextRequest) {
  try {
    console.log('Executive Summary API: Generating comprehensive executive summary');
    
    // Get current user
    const supabase = masterComplianceService['supabase'];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all master compliance metrics
    const metrics = await masterComplianceService.getMasterComplianceMetrics();
    
    // Get worker details for summary
    const workersData = await masterComplianceService.getMasterComplianceWorkers();
    const workerDetails = workersData.workers.slice(0, 20); // Limit to first 20 for summary

    // Generate executive summary
    const result = await generateExecutiveSummaryPDF(metrics, workerDetails);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'Failed to generate executive summary'
        },
        { status: 500 }
      );
    }

    console.log('Executive Summary API: Success! Generated comprehensive executive summary');
    
    return NextResponse.json({
      success: true,
      pdfContent: result.pdfContent,
      narrative: result.narrative,
      timestamp: new Date().toISOString(),
      reportId: `ES_${Date.now()}`
    });
  } catch (error) {
    console.error('Executive Summary API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate executive summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 