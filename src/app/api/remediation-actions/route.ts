import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { CreateRemediationActionRequest } from '@/types/master-compliance.types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get('workerId');
    const agentType = searchParams.get('agentType');
    const status = searchParams.get('status');

    // Build query
    let query = supabase
      .from('remediation_actions')
      .select(`
        *,
        compliance_workers!inner(name, job_title, cos_reference)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (workerId) {
      query = query.eq('worker_id', workerId);
    }
    if (agentType) {
      query = query.eq('agent_type', agentType);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: actions, error } = await query;

    if (error) {
      console.error('Error fetching remediation actions:', error);
      return NextResponse.json({ error: 'Failed to fetch remediation actions' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: actions
    });
  } catch (error) {
    console.error('Remediation actions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateRemediationActionRequest = await request.json();
    const { workerId, agentType, actionSummary, detailedNotes } = body;

    // Validate required fields
    if (!workerId || !agentType || !actionSummary) {
      return NextResponse.json({ 
        error: 'Worker ID, agent type, and action summary are required' 
      }, { status: 400 });
    }

    // Verify worker exists and belongs to user
    const { data: worker, error: workerError } = await supabase
      .from('compliance_workers')
      .select('id')
      .eq('id', workerId)
      .eq('user_id', user.id)
      .single();

    if (workerError || !worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    // Create remediation action
    const { data: action, error } = await supabase
      .from('remediation_actions')
      .insert({
        user_id: user.id,
        worker_id: workerId,
        agent_type: agentType,
        action_summary: actionSummary,
        detailed_notes: detailedNotes,
        status: 'Open'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating remediation action:', error);
      return NextResponse.json({ error: 'Failed to create remediation action' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: action
    });
  } catch (error) {
    console.error('Create remediation action API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 