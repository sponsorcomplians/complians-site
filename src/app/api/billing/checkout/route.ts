import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { createCheckoutSession } from '@/lib/stripe-billing-service';
import { hasPermission } from '@/lib/rbac-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.tenant_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has permission to manage billing
    if (!(await hasPermission('can_manage_tenant_settings'))) {
      return NextResponse.json(
        { error: 'Insufficient permissions to manage billing' },
        { status: 403 }
      );
    }

    const { planName, billingCycle, successUrl, cancelUrl } = await request.json();

    if (!planName || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: planName, successUrl, cancelUrl' },
        { status: 400 }
      );
    }

    const checkoutSession = await createCheckoutSession(
      session.user.tenant_id,
      planName,
      billingCycle || 'monthly',
      successUrl,
      cancelUrl
    );

    return NextResponse.json({
      success: true,
      data: {
        sessionId: checkoutSession.id,
        url: checkoutSession.url
      }
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 