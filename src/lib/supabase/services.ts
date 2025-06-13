// src/lib/supabase/services.ts - Add missing exports to your existing file

import { createClient } from '@supabase/supabase-js'

// Your existing client exports
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Add the missing admin client export
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

// Add the missing workerProfileApi export
export const workerProfileApi = {
  async getWorkerProfile(workerId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('worker_profiles')
        .select('*')
        .eq('id', workerId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching worker profile:', error)
      return null
    }
  },

  async createWorkerProfile(workerData: any) {
    try {
      const { data, error } = await supabaseAdmin
        .from('worker_profiles')
        .insert([workerData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating worker profile:', error)
      throw error
    }
  },

  async updateWorkerProfile(workerId: string, updates: any) {
    try {
      const { data, error } = await supabaseAdmin
        .from('worker_profiles')
        .update(updates)
        .eq('id', workerId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating worker profile:', error)
      throw error
    }
  }
}

// Your existing exports remain the same...