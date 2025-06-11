import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserProfile, updateUserProfile } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const profile = await getUserProfile(session.user.email)
    
    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile
    })

  } catch (error) {
    console.error('Get profile API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { full_name, company_name, phone, job_title, company_size, industry } = body

    const updates = {
      full_name,
      company_name,
      phone,
      job_title,
      company_size,
      industry,
      updated_at: new Date().toISOString()
    }

    const result = await updateUserProfile(session.user.email, updates)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Update profile API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
