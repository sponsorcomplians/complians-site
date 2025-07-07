// src/app/api/check-columns/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Try with minimal data including required fields
    const testData = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test' + Date.now() + '@example.com',
      date_of_birth: '1990-01-01', // Required field
      nationality: 'British', // Required field
      passport_number: 'TEST123456', // Required field
      phone: '07123456789', // Required field
      role: 'Test Role', // Required field
      start_date: '2024-01-01', // Required field
      visa_expiry: '2025-12-31' // Required field
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
