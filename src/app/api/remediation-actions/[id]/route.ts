import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { UpdateRemediationActionRequest } from '@/types/master-compliance.types';

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

    const body: UpdateRemediationActionRequest = await request.json();
    const { actionSummary, detailedNotes, status } = body;

    // Verify action exists and belongs to user
    const { data: existingAction, error: fetchError } = await supabase
      .from('remediation_actions')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingAction) {
      return NextResponse.json({ error: 'Remediation action not found' }, { status: 404 });
    }

    // Update action
    const updateData: any = {};
    if (actionSummary !== undefined) updateData.action_summary = actionSummary;
    if (detailedNotes !== undefined) updateData.detailed_notes = detailedNotes;
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date().toISOString();

    const { data: action, error } = await supabase
      .from('remediation_actions')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating remediation action:', error);
      return NextResponse.json({ error: 'Failed to update remediation action' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: action
    });
  } catch (error) {
    console.error('Update remediation action API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    // Verify action exists and belongs to user
    const { data: existingAction, error: fetchError } = await supabase
      .from('remediation_actions')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingAction) {
      return NextResponse.json({ error: 'Remediation action not found' }, { status: 404 });
    }

    // Delete action
    const { error } = await supabase
      .from('remediation_actions')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting remediation action:', error);
      return NextResponse.json({ error: 'Failed to delete remediation action' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Remediation action deleted successfully'
    });
  } catch (error) {
    console.error('Delete remediation action API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 