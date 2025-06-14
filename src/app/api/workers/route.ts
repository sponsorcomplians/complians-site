// src/app/api/workers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const { data: workers, error } = await supabase
      .from('workers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch workers' },
        { status: 500 }
      );
    }

    return NextResponse.json({ workers: workers || [] });
  } catch (error) {
    console.error('Workers API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    const { data: worker, error } = await supabase
      .from('workers')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('Error creating worker:', error);
      return NextResponse.json(
        { error: 'Failed to create worker' },
        { status: 500 }
      );
    }

    return NextResponse.json({ worker });
  } catch (error) {
    console.error('Workers API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}