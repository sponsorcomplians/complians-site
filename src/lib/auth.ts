import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabase, supabaseAdmin } from './supabase'
import { Profile } from '@/types/database'

// Get current user session on server side
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user || null
}

// Get user profile from database
export async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    return null
  }

  return data
}

// Check if user has purchased a product
export async function userHasPurchasedProduct(
  userId: string,
  productId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('user_has_purchased_product', {
      user_uuid: userId,
      product_uuid: productId
    })

  if (error) {
    console.error('Error checking product purchase:', error)
    return false
  }

  return data || false
}

// Get user's purchased products
export async function getUserPurchasedProducts(userId: string) {
  const { data, error } = await supabase
    .rpc('get_user_purchased_products', {
      user_uuid: userId
    })

  if (error) {
    console.error('Error fetching purchased products:', error)
    return []
  }

  return data || []
}

// Create or update user profile (admin function)
export async function createUserProfile(
  userId: string,
  email: string,
  fullName?: string
): Promise<Profile | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: userId,
      email,
      full_name: fullName,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    return null
  }

  return data
}

