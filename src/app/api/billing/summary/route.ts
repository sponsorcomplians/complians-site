import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getBillingSummary } from '@/lib/stripe-billing-service';
import { hasPermission } from '@/lib/rbac-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.tenant_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has permission to view billing
    if (!(await hasPermission('can_view_analytics'))) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view billing summary' },
        { status: 403 }
      );
    }

    const summary = await getBillingSummary(session.user.tenant_id);

    return NextResponse.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Error fetching billing summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing summary' },
      { status: 500 }
    );
  }
} 