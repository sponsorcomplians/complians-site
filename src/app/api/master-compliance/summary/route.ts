import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { masterComplianceService } from '@/lib/masterComplianceService';
import { MasterComplianceFilters } from '@/types/master-compliance.types';
import { getSupabaseClient } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Master Compliance Summary API: Starting request');
    
    // Check authentication using NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('❌ Master Compliance Summary API: No valid session found');
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required',
          message: 'Please sign in to access the Master Compliance Dashboard'
        },
        { status: 401 }
      );
    }
    
    console.log('✅ Master Compliance Summary API: User authenticated:', session.user.email);
    
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

    console.log('🔍 Master Compliance Summary API: Filters parsed:', filters);
    
    // Check if required tables exist
    const supabase = getSupabaseClient();
    const { data: tablesCheck, error: tablesError } = await supabase
      .from('compliance_workers')
      .select('id')
      .limit(1);
    
    if (tablesError) {
      console.error('❌ Master Compliance Summary API: Tables check failed:', tablesError);
      
      // Return empty metrics instead of failing
      const emptyMetrics = {
        summary: {
          totalWorkers: 0,
          totalAssessments: 0,
          overallComplianceRate: 0,
          totalBreaches: 0,
          totalSeriousBreaches: 0,
          totalRedFlags: 0,
          highRiskWorkers: 0,
          lastUpdated: new Date().toISOString()
        },
        agentSummaries: [],
        statusDistribution: {
          compliant: 0,
          breach: 0,
          seriousBreach: 0,
          pending: 0
        },
        riskDistribution: {
          low: 0,
          medium: 0,
          high: 0
        },
        topAgents: [],
        recentTrends: []
      };
      
      return NextResponse.json({
        success: true,
        data: emptyMetrics,
        timestamp: new Date().toISOString(),
        warning: 'No compliance data available yet'
      });
    }
    
    console.log('✅ Master Compliance Summary API: Tables exist, fetching metrics');
    
    // Try to get metrics from the service
    const metrics = await masterComplianceService.getMasterComplianceMetrics(filters);
    
    console.log('✅ Master Compliance Summary API: Success! Returning metrics');
    
    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Master Compliance Summary API Error:', error);
    
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
        error: 'Failed to fetch master compliance metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 