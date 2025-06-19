import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';

export async function GET() {
  try {
    console.log('Workers GET: Starting...');
    
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      console.error('Workers GET: Supabase client is null');
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    console.log('Workers GET: Supabase client created, fetching workers...');
    
    const { data: workers, error } = await supabase
      .from('workers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Workers GET: Supabase error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { 
          error: 'Failed to fetch workers',
          details: error.message,
          code: error.code 
        },
        { status: 500 }
      );
    }

    console.log('Workers GET: Success! Found ' + (workers?.length || 0) + ' workers');
    
    // Transform snake_case to camelCase manually for better control
    const transformedWorkers = workers?.map((worker: any) => ({
      id: worker.id,
      firstName: worker.first_name,
      lastName: worker.last_name,
      email: worker.email,
      phone: worker.phone,
      dateOfBirth: worker.date_of_birth,
      nationality: worker.nationality,
      passportNumber: worker.passport_number,
      createdAt: worker.created_at,
      updatedAt: worker.updated_at,
      userId: worker.user_id,
      complianceStatus: worker.compliance_status,
      complianceScore: worker.compliance_score,
      lastComplianceCheck: worker.last_compliance_check,
      visaStatus: worker.visa_status,
      visaExpiry: worker.visa_expiry,
      isActive: worker.is_active,
      role: worker.role,
      department: worker.department,
      startDate: worker.start_date,
      cosNumber: worker.cos_number,
      passportExpiry: worker.passport_expiry,
      salary: worker.salary,
      address: worker.address,
      createdBy: worker.created_by,
      status: worker.is_active ? 'active' : 'inactive' // Add status field for UI
    }));
    
    return NextResponse.json({ workers: transformedWorkers || [] });
  } catch (error) {
    console.error('Workers GET: Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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
    
    // Map camelCase to snake_case for ALL required fields
    const dbData: any = {
      // Required fields
      first_name: body.firstName || body.first_name,
      last_name: body.lastName || body.last_name,
      email: body.email,
      phone: body.phone,
      date_of_birth: body.dateOfBirth || body.date_of_birth,
      nationality: body.nationality,
      passport_number: body.passportNumber || body.passport_number,
      visa_expiry: body.visaExpiry || body.visa_expiry,
      role: body.role,
      start_date: body.startDate || body.start_date
    };
    
    // Optional fields - only add if they exist
    if (body.department) dbData.department = body.department;
    if (body.address) dbData.address = body.address;
    if (body.salary) dbData.salary = body.salary;
    if (body.cosNumber || body.cos_number) dbData.cos_number = body.cosNumber || body.cos_number;
    if (body.passportExpiry || body.passport_expiry) dbData.passport_expiry = body.passportExpiry || body.passport_expiry;
    if (body.visaStatus || body.visa_status) dbData.visa_status = body.visaStatus || body.visa_status;
    if (body.complianceStatus || body.compliance_status) dbData.compliance_status = body.complianceStatus || body.compliance_status;
    if (body.complianceScore !== undefined) dbData.compliance_score = body.complianceScore || body.compliance_score;
    if (body.isActive !== undefined) dbData.is_active = body.isActive ?? true; // Default to true if not specified
    
    console.log('Creating worker with data:', dbData);
    
    const { data: worker, error } = await supabase
      .from('workers')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('Error creating worker:', error);
      return NextResponse.json(
        { error: 'Failed to create worker', details: error.message },
        { status: 500 }
      );
    }

    console.log('Worker created successfully:', worker);
    
    // Transform the response to camelCase
    const transformedWorker = {
      id: worker.id,
      firstName: worker.first_name,
      lastName: worker.last_name,
      email: worker.email,
      phone: worker.phone,
      dateOfBirth: worker.date_of_birth,
      nationality: worker.nationality,
      passportNumber: worker.passport_number,
      createdAt: worker.created_at,
      updatedAt: worker.updated_at,
      userId: worker.user_id,
      complianceStatus: worker.compliance_status,
      complianceScore: worker.compliance_score,
      lastComplianceCheck: worker.last_compliance_check,
      visaStatus: worker.visa_status,
      visaExpiry: worker.visa_expiry,
      isActive: worker.is_active,
      role: worker.role,
      department: worker.department,
      startDate: worker.start_date,
      cosNumber: worker.cos_number,
      passportExpiry: worker.passport_expiry,
      salary: worker.salary,
      address: worker.address,
      createdBy: worker.created_by,
      status: worker.is_active ? 'active' : 'inactive'
    };
    
    return NextResponse.json({ worker: transformedWorker });
  } catch (error) {
    console.error('Workers API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
