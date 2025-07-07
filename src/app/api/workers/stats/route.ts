// src/app/api/workers/stats/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({
        totalWorkers: 0,
        activeReports: 0,
        departments: 0
      });
    }

    // Get total workers
    const { count: workersCount } = await supabase
      .from('workers')
      .select('*', { count: 'exact', head: true });

    // Get departments count
    const { data: workers } = await supabase
      .from('workers')
      .select('department');
    
    const uniqueDepartments = new Set(workers?.map((w: any) => w.department) || []);

    // Get active reports count
    const { count: reportsCount } = await supabase
      .from('reporting_duties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    return NextResponse.json({
      totalWorkers: workersCount || 0,
      activeReports: reportsCount || 0,
      departments: uniqueDepartments.size
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({
      totalWorkers: 0,
      activeReports: 0,
      departments: 0
    });
  }
}