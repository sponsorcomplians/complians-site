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
      return NextResponse.json({ 
        error: 'Insert failed',
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    }
    
    // If successful, show the columns and delete the test record
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
    
    return NextResponse.json({ error: 'No data returned' });
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}
