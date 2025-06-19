// src/app/api/sw002/reporting-duties/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const { data, error } = await supabase
      .from('sw_reporting_duties')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('Error creating reporting duty:', error);
      return NextResponse.json(
        { error: 'Failed to create reporting duty', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in reporting duties POST:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const workerId = searchParams.get('worker_id');

    if (!workerId) {
      return NextResponse.json({ error: 'Worker ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('sw_reporting_duties')
      .select('*')
      .eq('worker_id', workerId)
      .order('event_date', { ascending: false });

    if (error) {
      console.error('Error fetching reporting duties:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reporting duties', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in reporting duties GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}