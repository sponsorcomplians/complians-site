import { workerProfileApi } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== TESTING REAL WORKERS FORM API ===')
    
    const data = await request.json()
    console.log('Received worker data:', data)
    
    // Test the EXACT same code your workers form uses
    console.log('Calling workerProfileApi.create()...')
    const result = await workerProfileApi.create(data)
    
    console.log('✅ Worker created successfully:', result)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Worker created successfully! No "supabaseKey is required" error!',
      data: result 
    })
    
  } catch (error: any) {
    console.error('❌ Error creating worker:', error)
    
    // Check if it's the old error
    if (error.message.includes('supabaseKey is required')) {
      return NextResponse.json({ 
        success: false, 
        error: 'OLD ERROR STILL EXISTS: supabaseKey is required',
        message: 'The fix did not work'
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      message: 'Different error (proves Supabase fix worked!)'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Worker API test endpoint ready. Use POST to test worker creation.' 
  })
}