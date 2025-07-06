import { NextRequest, NextResponse } from 'next/server';
import { masterComplianceService } from '@/lib/masterComplianceService';
import { MasterComplianceFilters } from '@/types/master-compliance.types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    
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

    console.log('Master Compliance Workers API: Fetching workers with filters:', filters, 'page:', page, 'pageSize:', pageSize);
    
    const workersData = await masterComplianceService.getMasterComplianceWorkers(filters, page, pageSize);
    
    console.log('Master Compliance Workers API: Success! Returning', workersData.workers.length, 'workers');
    
    return NextResponse.json({
      success: true,
      data: workersData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Master Compliance Workers API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch master compliance workers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 