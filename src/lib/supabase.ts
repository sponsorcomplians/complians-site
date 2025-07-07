// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Regular client for client-side usage
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Function to create a new Supabase client (for components that need fresh instances)
export const createSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Admin client with service role key for server-side usage
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Worker profile API helper
export const workerProfileApi = {
  async getProfile(workerId: string, tenant_id: string) {
    const { data, error } = await supabaseAdmin
      .from('worker_profiles')
      .select('*')
      .eq('id', workerId)
      .eq('tenant_id', tenant_id)
      .single()
    
    if (error) throw error
    return data
  },
  
  async updateProfile(workerId: string, updates: any, tenant_id: string) {
    const { data, error } = await supabaseAdmin
      .from('worker_profiles')
      .update(updates)
      .eq('id', workerId)
      .eq('tenant_id', tenant_id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async create(profile: any, tenant_id: string) {
    const { data, error } = await supabaseAdmin
      .from('worker_profiles')
      .insert({ ...profile, tenant_id })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async createProfile(profile: any, tenant_id: string) {
    // Alias for backwards compatibility
    return this.create(profile, tenant_id)
  },

  async deleteProfile(workerId: string, tenant_id: string) {
    const { error } = await supabaseAdmin
      .from('worker_profiles')
      .delete()
      .eq('id', workerId)
      .eq('tenant_id', tenant_id)
    
    if (error) throw error
    return true
  }
}