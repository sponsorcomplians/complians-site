import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { CreateAlertRequest } from '@/types/master-compliance.types';

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
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query = supabase
      .from('alerts')
      .select(`
        *,
        compliance_workers(name, job_title, cos_reference)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: alerts, error } = await query;

    if (error) {
      console.error('Error fetching alerts:', error);
      return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Alerts API error:', error);
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

    const body: CreateAlertRequest = await request.json();
    const { workerId, agentType, alertMessage } = body;

    // Validate required fields
    if (!agentType || !alertMessage) {
      return NextResponse.json({ 
        error: 'Agent type and alert message are required' 
      }, { status: 400 });
    }

    // Verify worker exists and belongs to user if workerId is provided
    if (workerId) {
      const { data: worker, error: workerError } = await supabase
        .from('compliance_workers')
        .select('id')
        .eq('id', workerId)
        .eq('user_id', user.id)
        .single();

      if (workerError || !worker) {
        return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
      }
    }

    // Create alert
    const { data: alert, error } = await supabase
      .from('alerts')
      .insert({
        user_id: user.id,
        worker_id: workerId,
        agent_type: agentType,
        alert_message: alertMessage,
        status: 'Unread'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating alert:', error);
      return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Create alert API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 