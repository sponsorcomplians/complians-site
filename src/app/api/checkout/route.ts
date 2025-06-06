import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import { getProductBySlug } from '@/lib/products'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const productSlug = searchParams.get('productSlug')

    if (!productId && !productSlug) {
      return NextResponse.json(
        { error: 'Product ID or slug is required' },
        { status: 400 }
      )
    }

    // Get product details
    let product
    if (productId) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('is_active', true)
        .single()
      product = data
    } else if (productSlug) {
      product = await getProductBySlug(productSlug)
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if user already purchased this product
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', session.user.email)
      .eq('product_id', product.id)
      .eq('status', 'completed')
      .single()

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Product already purchased' },
        { status: 400 }
      )
    }

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: product.title,
              description: product.description || undefined,
              images: product.thumbnail_url ? [product.thumbnail_url] : undefined,
            },
            unit_amount: formatAmountForStripe(product.price),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}?canceled=true`,
      customer_email: session.user.email || undefined,
      metadata: {
        userId: session.user.email,
        productId: product.id,
        productSlug: product.slug,
      },
    })

    // Create pending purchase record
    await supabase
      .from('purchases')
      .insert({
        user_id: session.user.email,
        product_id: product.id,
        stripe_session_id: checkoutSession.id,
        amount: product.price,
        currency: 'gbp',
        status: 'pending',
      })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}