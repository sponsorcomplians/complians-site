import { NextRequest, NextResponse } from 'next/server';
import { getBillingPlans } from '@/lib/stripe-billing-service';
import { hasPermission } from '@/lib/rbac-service';

export async function GET(request: NextRequest) {
  try {
    // Check if user has permission to view billing
    if (!(await hasPermission('can_view_analytics'))) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view billing plans' },
        { status: 403 }
      );
    }

    const plans = await getBillingPlans();

    return NextResponse.json({
      success: true,
      data: plans
    });

  } catch (error) {
    console.error('Error fetching billing plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing plans' },
      { status: 500 }
    );
  }
} 