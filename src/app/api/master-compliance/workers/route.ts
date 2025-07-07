import { NextRequest, NextResponse } from 'next/server';
import { masterComplianceService } from '@/lib/masterComplianceService';
import { MasterComplianceFilters } from '@/types/master-compliance.types';
import { getSupabaseClient } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Master Compliance Workers API: Starting request');
    
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

    console.log('🔍 Master Compliance Workers API: Filters parsed:', filters, 'page:', page, 'pageSize:', pageSize);
    
    // Check authentication first
    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Master Compliance Workers API: Authentication error:', authError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication failed',
          details: authError.message
        },
        { status: 401 }
      );
    }
    
    if (!user) {
      console.error('❌ Master Compliance Workers API: No authenticated user');
      return NextResponse.json(
        { 
          success: false,
          error: 'User not authenticated'
        },
        { status: 401 }
      );
    }
    
    console.log('✅ Master Compliance Workers API: User authenticated:', user.id);
    
    // Check if required tables exist
    const { data: tablesCheck, error: tablesError } = await supabase
      .from('compliance_workers')
      .select('id')
      .limit(1);
    
    if (tablesError) {
      console.error('❌ Master Compliance Workers API: Tables check failed:', tablesError);
      
      // Return empty workers data instead of failing
      const emptyWorkersData = {
        workers: [],
        totalCount: 0,
        filteredCount: 0,
        pagination: {
          page,
          pageSize,
          totalPages: 0
        }
      };
      
      return NextResponse.json({
        success: true,
        data: emptyWorkersData,
        timestamp: new Date().toISOString(),
        warning: 'No compliance data available yet'
      });
    }
    
    console.log('✅ Master Compliance Workers API: Tables exist, fetching workers');
    
    const workersData = await masterComplianceService.getMasterComplianceWorkers(filters, page, pageSize);
    
    console.log('✅ Master Compliance Workers API: Success! Returning', workersData.workers.length, 'workers');
    
    return NextResponse.json({
      success: true,
      data: workersData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Master Compliance Workers API Error:', error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch master compliance workers',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 