import { NextRequest, NextResponse } from 'next/server';
import { masterComplianceService } from '@/lib/masterComplianceService';
import { MasterComplianceFilters } from '@/types/master-compliance.types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters from query parameters
    const filters: MasterComplianceFilters = {};
    
    if (searchParams.get('complianceStatus')) {
      filters.complianceStatus = searchParams.get('complianceStatus') as any;
    }
    
    if (searchParams.get('riskLevel')) {
      filters.riskLevel = searchParams.get('riskLevel') as any;
    }
    
    if (searchParams.get('agentType')) {
      filters.agentType = searchParams.get('agentType')!;
    }
    
    if (searchParams.get('hasRedFlags')) {
      filters.hasRedFlags = searchParams.get('hasRedFlags') === 'true';
    }
    
    if (searchParams.get('startDate') && searchParams.get('endDate')) {
      filters.dateRange = {
        start: searchParams.get('startDate')!,
        end: searchParams.get('endDate')!
      };
    }

    console.log('Master Compliance Summary API: Fetching metrics with filters:', filters);
    
    const metrics = await masterComplianceService.getMasterComplianceMetrics(filters);
    
    console.log('Master Compliance Summary API: Success! Returning metrics');
    
    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Master Compliance Summary API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch master compliance metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 