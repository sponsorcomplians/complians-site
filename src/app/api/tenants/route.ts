import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext, getCurrentTenant, getTenantStats } from '@/lib/multi-tenant-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tenantContext = await getTenantContext();
    
    if (!tenantContext) {
      return NextResponse.json(
        { error: 'No tenant context available' },
        { status: 401 }
      );
    }

    // Get current tenant information
    const tenant = await getCurrentTenant();
    
    // Get tenant statistics
    const stats = await getTenantStats();

    return NextResponse.json({
      tenant_context: tenantContext,
      tenant_info: tenant,
      statistics: stats
    });

  } catch (error) {
    console.error('Error getting tenant information:', error);
    return NextResponse.json(
      { error: 'Failed to get tenant information' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, industry, max_workers, subscription_plan } = await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Tenant name is required' },
        { status: 400 }
      );
    }

    // Check if user is admin (you can implement admin check here)
    const tenantContext = await getTenantContext();
    if (!tenantContext) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create new tenant
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: newTenant, error } = await supabase
      .from('tenants')
      .insert({
        name,
        industry: industry || 'General',
        max_workers: max_workers || 100,
        subscription_plan: subscription_plan || 'Basic',
        subscription_status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Tenant creation failed:', {
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        tenant_name: name,
        industry: industry,
        max_workers: max_workers,
        subscription_plan: subscription_plan
      });
      return NextResponse.json(
        { 
          error: 'Failed to create tenant',
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tenant: newTenant
    });

  } catch (error) {
    console.error('Tenant creation error:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred during tenant creation'
      },
      { status: 500 }
    );
  }
} 