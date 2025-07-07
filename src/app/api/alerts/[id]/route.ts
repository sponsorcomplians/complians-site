import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!status || !['Read', 'Dismissed'].includes(status)) {
      return NextResponse.json({ 
        error: 'Status must be either "Read" or "Dismissed"' 
      }, { status: 400 });
    }

    // Verify alert exists and belongs to user
    const { data: existingAlert, error: fetchError } = await supabase
      .from('alerts')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingAlert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    // Update alert status
    const { data: alert, error } = await supabase
      .from('alerts')
      .update({ status })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating alert:', error);
      return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Update alert API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 