import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { masterComplianceService } from '@/lib/masterComplianceService';
import { MasterComplianceFilters } from '@/types/master-compliance.types';
import { getSupabaseClient } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Master Compliance Workers API: Starting request');
    
    // Check authentication using NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('❌ Master Compliance Workers API: No valid session found');
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized'
        },
        { status: 401 }
      );
    }
    
    console.log('✅ Master Compliance Workers API: User authenticated:', session.user.email);
    
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

    console.log('🔍 Master Compliance Workers API: Filters parsed:', filters);
    console.log('🔍 Master Compliance Workers API: Pagination - page:', page, 'pageSize:', pageSize);
    
    // Check if required tables exist
    const supabase = getSupabaseClient();
    const { data: tablesCheck, error: tablesError } = await supabase
      .from('compliance_workers')
      .select('id')
      .limit(1);
    
    if (tablesError) {
      console.error('❌ Master Compliance Workers API: Tables check failed:', tablesError);
      
      // Return empty workers data instead of failing
      const emptyWorkersData = {
        workers: [],
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          totalPages: 0,
          totalWorkers: 0,
          hasNextPage: false,
          hasPreviousPage: false
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
    
    // Try to get workers from the service
    const workersData = await masterComplianceService.getMasterComplianceWorkers(filters, page, pageSize);
    
    console.log('✅ Master Compliance Workers API: Success! Returning workers data');
    
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
    
    // Return a more detailed error response
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