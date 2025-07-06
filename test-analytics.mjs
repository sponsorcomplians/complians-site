import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAnalyticsSystem() {
  console.log('🧪 Testing Tenant Analytics System...\n');

  try {
    // Test 1: Check if tenant_usage_metrics table exists
    console.log('1. Checking tenant_usage_metrics table...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('tenant_usage_metrics')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Table check failed:', tableError.message);
      return;
    }
    console.log('✅ Table exists and is accessible\n');

    // Test 2: Check if functions exist
    console.log('2. Testing database functions...');
    
    // Test increment function
    const { error: incrementError } = await supabase
      .rpc('increment_tenant_metric', {
        tenant_uuid: '00000000-0000-0000-0000-000000000000', // Test UUID
        metric_column: 'assessments_run',
        increment_value: 1
      });

    if (incrementError) {
      console.error('❌ Increment function failed:', incrementError.message);
    } else {
      console.log('✅ Increment function works');
    }

    // Test summary function
    const { data: summaryData, error: summaryError } = await supabase
      .rpc('get_tenant_metrics_summary', {
        tenant_uuid: '00000000-0000-0000-0000-000000000000',
        days_back: 30
      });

    if (summaryError) {
      console.error('❌ Summary function failed:', summaryError.message);
    } else {
      console.log('✅ Summary function works');
    }

    // Test metrics function
    const { data: metricsData, error: metricsError } = await supabase
      .rpc('get_tenant_metrics', {
        tenant_uuid: '00000000-0000-0000-0000-000000000000',
        start_date: '2024-01-01',
        end_date: '2024-01-31'
      });

    if (metricsError) {
      console.error('❌ Metrics function failed:', metricsError.message);
    } else {
      console.log('✅ Metrics function works');
    }

    console.log('\n3. Testing API endpoints...');
    
    // Test the analytics API endpoint
    const response = await fetch('http://localhost:3000/api/tenant-metrics?days=7');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Analytics API endpoint works');
      console.log('📊 Response structure:', Object.keys(data));
    } else {
      console.error('❌ Analytics API failed:', response.status, response.statusText);
    }

    console.log('\n🎉 Analytics system test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Run the SQL migration: tenant-metrics-migration.sql');
    console.log('2. Visit /analytics in your browser');
    console.log('3. Check the analytics dashboard functionality');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAnalyticsSystem(); 