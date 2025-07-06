import { NextRequest, NextResponse } from 'next/server';
import { getTenantComplianceWorkers, createTenantComplianceWorker } from '@/lib/multi-tenant-service';
import { trackWorkerAddition } from '@/lib/tenant-metrics-service';
import { canPerformAction } from '@/lib/stripe-billing-service';
import { logAuditEvent } from '@/lib/audit-service';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentType = searchParams.get('agent_type');

    const workers = await getTenantComplianceWorkers(agentType || undefined);

    return NextResponse.json({
      success: true,
      data: workers
    });

  } catch (error) {
    console.error('Error fetching workers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = await headers();
    
    // Check if tenant can add more workers
    const canAddWorker = await canPerformAction(body.tenant_id || 'current', 'add_worker');
    
    if (!canAddWorker) {
      return NextResponse.json(
        { 
          error: 'Worker limit exceeded',
          message: 'You have reached the maximum number of workers for your current plan. Please upgrade your plan to add more workers.'
        },
        { status: 403 }
      );
    }
    
    // Map camelCase to snake_case for required fields
    const workerData = {
      agent_type: body.agentType || body.agent_type,
      name: body.name || `${body.firstName || body.first_name} ${body.lastName || body.last_name}`,
      job_title: body.jobTitle || body.job_title || body.role,
      soc_code: body.socCode || body.soc_code,
      cos_reference: body.cosReference || body.cos_reference || body.cosNumber,
      compliance_status: body.complianceStatus || body.compliance_status || 'COMPLIANT',
      risk_level: body.riskLevel || body.risk_level || 'LOW',
      red_flag: body.redFlag || body.red_flag || false,
      global_risk_score: body.globalRiskScore || body.global_risk_score || 0,
      assignment_date: body.assignmentDate || body.assignment_date || new Date().toISOString().split('T')[0]
    };

    const worker = await createTenantComplianceWorker(workerData);

    // Track worker addition metric
    try {
      await trackWorkerAddition();
      console.log('📊 [API] Tracked worker addition metric');
    } catch (trackingError) {
      console.warn('⚠️ [API] Failed to track worker addition metric:', trackingError);
      // Don't fail the request if tracking fails
    }

    // Log audit event for worker creation
    try {
      await logAuditEvent(
        'worker_created',
        {
          worker_name: workerData.name,
          job_title: workerData.job_title,
          soc_code: workerData.soc_code,
          compliance_status: workerData.compliance_status
        },
        'worker',
        worker.id,
        undefined,
        worker,
        headersList
      );
      console.log('📝 [API] Logged worker creation audit event');
    } catch (auditError) {
      console.warn('⚠️ [API] Failed to log worker creation audit event:', auditError);
      // Don't fail the request if audit logging fails
    }

    return NextResponse.json({
      success: true,
      data: worker
    });

  } catch (error) {
    console.error('Error creating worker:', error);
    return NextResponse.json(
      { error: 'Failed to create worker' },
      { status: 500 }
    );
  }
}
