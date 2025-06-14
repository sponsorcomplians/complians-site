// src/app/api/user/purchases/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { supabaseAdmin } from '@/lib/supabase';

interface Purchase {
  id: string;
  user_id: string;
  product_id: string;
  status: string;
  created_at: string;
  product?: {
    id: string;
    name: string;
    price: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch actual purchases from database
    const { data: purchases, error } = await supabaseAdmin
      .from('purchases')
      .select(`
        *,
        products (
          id,
          name,
          price
        )
      `)
      .eq('user_id', session.user.id)
      .eq('status', 'completed');

    if (error) {
      console.error('Error fetching purchases:', error);
      // Return empty array on error
      const purchases: Purchase[] = [];
      return NextResponse.json({ purchases });
    }

    return NextResponse.json({ purchases: purchases || [] });
  } catch (error) {
    console.error('Purchases API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}