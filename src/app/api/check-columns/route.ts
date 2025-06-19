// src/app/api/check-columns/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Try with minimal data
    const testData = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test' + Date.now() + '@example.com'
    };

    console.log('Trying to insert:', testData);

    const { data, error } = await supabase
      .from('workers')
      .insert(testData)
      .select();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json(
        {
          error: 'Insert failed',
          message: error.message,
          details: error.details,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    if (data && data[0]) {
      const columns = Object.keys(data[0]);
      await supabase.from('workers').delete().eq('id', data[0].id);

      return NextResponse.json({
        success: true,
        message: 'Found table columns',
        columns: columns,
        sampleData: data[0]
      });
    }

    return NextResponse.json({ error: 'No data returned' }, { status: 404 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
