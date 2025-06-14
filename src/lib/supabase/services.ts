// src/lib/supabase/services.ts
import { supabaseAdmin } from '@/lib/supabase';

export const workerService = {
  async getAll() {
    const { data, error } = await supabaseAdmin
      .from('workers')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async getWorkers() {
    // Alias for getAll to match component expectations
    return this.getAll();
  },

  async getById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('workers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(worker: any) {
    const { data, error } = await supabaseAdmin
      .from('workers')
      .insert(worker)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from('workers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin
      .from('workers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

export const reportingDutyService = {
  async getAll() {
    const { data, error } = await supabaseAdmin
      .from('reporting_duties')
      .select(`
        *,
        worker:workers(id, name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getByWorkerId(workerId: string) {
    const { data, error } = await supabaseAdmin
      .from('reporting_duties')
      .select('*')
      .eq('worker_id', workerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(duty: any) {
    const { data, error } = await supabaseAdmin
      .from('reporting_duties')
      .insert(duty)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from('reporting_duties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin
      .from('reporting_duties')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getActiveCount() {
    const { count, error } = await supabaseAdmin
      .from('reporting_duties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    if (error) throw error;
    return count || 0;
  }
};