// src/app/api/workers/[id]/sw002/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Retrieve SW002 data for a worker
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    if (process.env.DISABLE_AUTH === 'true') return NextResponse.json({ user: { email: 'dev@test.com', role: 'admin' } });

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Use the helper function to get all SW002 data
    const { data, error } = await supabase
      .rpc('get_sw002_data', { p_worker_id: id });

    if (error) {
      console.error('Error fetching SW002 data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch SW002 data', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || {});
  } catch (error) {
    console.error('Error in SW002 GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create SW002 record for a worker
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    if (process.env.DISABLE_AUTH === 'true') return NextResponse.json({ user: { email: 'dev@test.com', role: 'admin' } });

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Create SW002 record structure
    const { data, error } = await supabase
      .rpc('create_sw002_record', { p_worker_id: id });

    if (error) {
      console.error('Error creating SW002 record:', error);
      return NextResponse.json(
        { error: 'Failed to create SW002 record', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in SW002 POST:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update SW002 data
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    if (process.env.DISABLE_AUTH === 'true') return NextResponse.json({ user: { email: 'dev@test.com', role: 'admin' } });

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { section, data } = body;

    let updateResult;

    // Update specific section based on what's being saved
    switch (section) {
      case 'personal_information':
        updateResult = await supabase
          .from('sw_personal_information')
          .upsert({ ...data, worker_id: id })
          .select();
        break;

      case 'cos_summary':
        updateResult = await supabase
          .from('sw_cos_summary')
          .upsert({ ...data, worker_id: id })
          .select();
        break;

      case 'immigration_monitoring':
        updateResult = await supabase
          .from('sw_immigration_monitoring')
          .upsert({ ...data, worker_id: id })
          .select();
        break;

      case 'contact_details':
        updateResult = await supabase
          .from('sw_contact_details')
          .upsert({ ...data, worker_id: id })
          .select();
        break;

      case 'documents_part1':
        updateResult = await supabase
          .from('sw_documents_part1')
          .upsert({ ...data, worker_id: id })
          .select();
        break;

      case 'recruitment_evidence':
        updateResult = await supabase
          .from('sw_recruitment_evidence')
          .upsert({ ...data, worker_id: id })
          .select();
        break;

      case 'salary_documents':
        updateResult = await supabase
          .from('sw_salary_documents')
          .upsert({ ...data, worker_id: id })
          .select();
        break;

      case 'skill_evidence':
        updateResult = await supabase
          .from('sw_skill_evidence')
          .upsert({ ...data, worker_id: id })
          .select();
        break;

      case 'migrant_tracking':
        updateResult = await supabase
          .from('sw_migrant_tracking')
          .upsert({ ...data, worker_id: id })
          .select();
        break;

      case 'training_modules':
        updateResult = await supabase
          .from('sw_training_modules')
          .upsert({ ...data, worker_id: id })
          .select();
        break;

      case 'other_documents':
        updateResult = await supabase
          .from('sw_other_documents')
          .upsert({ ...data, worker_id: id })
          .select();
        break;

      case 'documents_area1':
        updateResult = await supabase
          .from('sw_documents_area1')
          .upsert({ ...data, worker_id: id })
          .select();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid section specified' },
          { status: 400 }
        );
    }

    if (updateResult.error) {
      console.error('Error updating SW002 section:', updateResult.error);
      return NextResponse.json(
        { error: 'Failed to update SW002 data', details: updateResult.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(updateResult.data);
  } catch (error) {
    console.error('Error in SW002 PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}