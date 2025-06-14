import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"  
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Get the current session on the server
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

// Check if user is authenticated
export async function isAuthenticated() {
  const session = await getServerSession(authOptions)
  return !!session
}

// Get session with type safety
export async function getSession() {
  return await getServerSession(authOptions)
}

// Missing functions that other files need
export async function getUserProfile(userId: string) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return user
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function userHasPurchasedProduct(userId: string, productId: string) {
  try {
    const { data: purchase, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('status', 'completed')
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return !!purchase
  } catch (error) {
    console.error('Error checking product purchase:', error)
    return false
  }
}

export async function getUserProductAccess(userId: string) {
  try {
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('product_id, products(*)')
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (error) throw error
    return purchases || []
  } catch (error) {
    console.error('Error fetching user product access:', error)
    return []
  }
}