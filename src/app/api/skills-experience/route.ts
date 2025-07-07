import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all assessments for a worker
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get('workerId');
    const assessmentType = searchParams.get('type'); // 'skills', 'experience', 'cv'

    if (!workerId) {
      return NextResponse.json(
        { error: 'Worker ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('skills_experience_assessments')
      .select('*')
      .eq('worker_id', workerId);

    if (assessmentType) {
      query = query.eq('assessment_type', assessmentType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assessments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch assessments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ assessments: data });
  } catch (error) {
    console.error('Error in GET /api/skills-experience:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new assessment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      worker_id,
      assessment_type,
      assessment_data,
      compliance_status,
      notes
    } = body;

    if (!worker_id || !assessment_type) {
      return NextResponse.json(
        { error: 'Worker ID and assessment type are required' },
        { status: 400 }
      );
    }

    const assessment = {
      worker_id,
      assessment_type,
      assessment_data,
      compliance_status: compliance_status || 'PENDING',
      notes: notes || '',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('skills_experience_assessments')
      .insert(assessment)
      .select()
      .single();

    if (error) {
      console.error('Error creating assessment:', error);
      return NextResponse.json(
        { error: 'Failed to create assessment' },
        { status: 500 }
      );
    }

    // Update worker's compliance status
    await updateWorkerComplianceStatus(worker_id, assessment_type);

    return NextResponse.json({ assessment: data });
  } catch (error) {
    console.error('Error in POST /api/skills-experience:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update assessment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      assessment_data,
      compliance_status,
      notes
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    const updates: any = {
      updated_at: new Date().toISOString()
    };

    if (assessment_data) updates.assessment_data = assessment_data;
    if (compliance_status) updates.compliance_status = compliance_status;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabase
      .from('skills_experience_assessments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating assessment:', error);
      return NextResponse.json(
        { error: 'Failed to update assessment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ assessment: data });
  } catch (error) {
    console.error('Error in PUT /api/skills-experience:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete assessment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('skills_experience_assessments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting assessment:', error);
      return NextResponse.json(
        { error: 'Failed to delete assessment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/skills-experience:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to update worker's compliance status
async function updateWorkerComplianceStatus(workerId: string, assessmentType: string) {
  try {
    const dateField = `${assessmentType}_assessment_date`;
    
    const { error } = await supabase
      .from('workers')
      .update({
        [dateField]: new Date().toISOString()
      })
      .eq('id', workerId);

    if (error) {
      console.error('Error updating worker compliance status:', error);
    }
  } catch (error) {
    console.error('Error in updateWorkerComplianceStatus:', error);
  }
} 