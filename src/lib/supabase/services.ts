// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set')
}

// Regular client for client-side usage
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any

// Function to create a new Supabase client (for components that need fresh instances)
export const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not set')
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Admin client with service role key for server-side usage
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null as any

// Worker profile API helper
export const workerProfileApi = {
  async getProfile(workerId: string) {
    const { data, error } = await supabaseAdmin
      .from('worker_profiles')
      .select('*')
      .eq('id', workerId)
      .single()
    
    if (error) throw error
    return data
  },
  
  async updateProfile(workerId: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from('worker_profiles')
      .update(updates)
      .eq('id', workerId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async create(profile: any) {
    const { data, error } = await supabaseAdmin
      .from('worker_profiles')
      .insert(profile)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async createProfile(profile: any) {
    // Alias for backwards compatibility
    return this.create(profile)
  },

  async deleteProfile(workerId: string) {
    const { error } = await supabaseAdmin
      .from('worker_profiles')
      .delete()
      .eq('id', workerId)
    
    if (error) throw error
    return true
  }
}