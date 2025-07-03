import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from "@/lib/auth-config"
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { userHasPurchasedProduct } from '@/lib/auth'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Verify user has purchased this product
    const hasPurchased = await userHasPurchasedProduct(session.user.id, productId)
    
    if (!hasPurchased) {
      return NextResponse.json(
        { error: 'Product not purchased or access denied' },
        { status: 403 }
      )
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (!product.file_path) {
      return NextResponse.json(
        { error: 'No file available for this product' },
        { status: 404 }
      )
    }

    // Generate signed URL for file download (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin
      .storage
      .from('products')
      .createSignedUrl(product.file_path, 3600) // 1 hour expiry

    if (signedUrlError || !signedUrlData) {
      console.error('Error creating signed URL:', signedUrlError)
      return NextResponse.json(
        { error: 'Failed to generate download link' },
        { status: 500 }
      )
    }

    // Log the download
    const userAgent = request.headers.get('user-agent') || ''
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown'

    // Get purchase ID for logging
    const { data: purchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('product_id', productId)
      .eq('status', 'completed')
      .single()

    if (purchase) {
      await supabaseAdmin
        .from('download_logs')
        .insert({
          user_id: session.user.id,
          product_id: productId,
          purchase_id: purchase.id,
          file_path: product.file_path,
          ip_address: ipAddress,
          user_agent: userAgent,
        })
    }

    // Redirect to the signed URL for download
    return NextResponse.redirect(signedUrlData.signedUrl)

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

