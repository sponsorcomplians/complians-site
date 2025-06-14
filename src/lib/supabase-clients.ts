// src/lib/supabase-client.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Server-side: always create a new client
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Supabase environment variables are not configured')
    }
    
    return createClient(url, key)
  }
  
  // Client-side: create singleton
  if (!supabaseClient) {
    // These should be available after build
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      console.error('Supabase environment variables are not available on client')
      // Return a dummy client that will fail gracefully
      return null as any
    }
    
    supabaseClient = createClient(url, key)
  }
  
  return supabaseClient
}