import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Worker {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  start_date: string;
  status: 'active' | 'inactive' | 'on-leave';
  phone?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  avatar_url?: string;
  tenant_id: string;
  created_at?: string;
  updated_at?: string;
}

export const workersService = {
  // Get all workers for a tenant
  async getWorkers(tenant_id: string) {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get single worker for a tenant
  async getWorker(id: string, tenant_id: string) {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenant_id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create worker for a tenant
  async createWorker(worker: Omit<Worker, 'id' | 'created_at' | 'updated_at'>, tenant_id: string) {
    const { data, error } = await supabase
      .from('workers')
      .insert([{ ...worker, tenant_id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update worker for a tenant
  async updateWorker(id: string, updates: Partial<Worker>, tenant_id: string) {
    const { data, error } = await supabase
      .from('workers')
      .update(updates)
      .eq('id', id)
      .eq('tenant_id', tenant_id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete worker for a tenant
  async deleteWorker(id: string, tenant_id: string) {
    const { error } = await supabase
      .from('workers')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenant_id);

    if (error) throw error;
  },

  // Bulk import workers for a tenant
  async bulkImportWorkers(workers: Omit<Worker, 'id' | 'created_at' | 'updated_at'>[], tenant_id: string) {
    const workersWithTenant = workers.map(w => ({ ...w, tenant_id }));
    const { data, error } = await supabase
      .from('workers')
      .insert(workersWithTenant)
      .select();

    if (error) throw error;
    return data;
  },

  // Upload avatar (no tenant_id needed here)
  async uploadAvatar(file: File, workerId: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${workerId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('worker-avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('worker-avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};

// Supabase Database Schema (run this in Supabase SQL editor):
/*
-- Create workers table
CREATE TABLE workers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'on-leave')) DEFAULT 'active',
  phone VARCHAR(50),
  address TEXT,
  emergency_contact VARCHAR(200),
  emergency_phone VARCHAR(50),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('worker-avatars', 'worker-avatars', true);

-- Create RLS policies
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all workers
CREATE POLICY "Workers are viewable by authenticated users" ON workers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert workers
CREATE POLICY "Authenticated users can insert workers" ON workers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update workers
CREATE POLICY "Authenticated users can update workers" ON workers
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete workers
CREATE POLICY "Authenticated users can delete workers" ON workers
  FOR DELETE USING (auth.role() = 'authenticated');
*/