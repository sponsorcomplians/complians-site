// src/lib/supabase.ts
'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Factory function - creates client when called, not at module load
export const createSupabaseClient = () => {
  return createClientComponentClient()
}

// API functions that create client when called
export const workerProfileApi = {
  create: async (data: any) => {
    const supabase = createSupabaseClient() // Create fresh client each time
    const { data: result, error } = await supabase
      .from('workers')
      .insert(data)
      .select()
    
    if (error) throw error
    return result
  },

  update: async (id: string, data: any) => {
    const supabase = createSupabaseClient()
    const { data: result, error } = await supabase
      .from('workers')
      .update(data)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return result
  },

  getAll: async () => {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('workers')
      .select('*')
    
    if (error) throw error
    return data
  },

  // Alias for backwards compatibility
  createWorker: async (data: any) => {
    const supabase = createSupabaseClient()
    const { data: result, error } = await supabase
      .from('workers')
      .insert(data)
      .select()
    
    if (error) throw error
    return result
  }
}