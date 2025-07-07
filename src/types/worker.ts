// src/types/worker.ts

export interface Worker {
  id: string;
  tenant_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  position?: string;
  status?: string;
  start_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkerDocument {
  id: string;
  tenant_id: string;
  worker_id: string;
  document_code: string;
  document_url?: string;
  uploaded_at?: string;
  updated_at?: string;
}

export interface WorkerTraining {
  id: string;
  tenant_id: string;
  worker_id: string;
  module_code: string;
  completed: boolean;
  completed_at?: string;
  updated_at?: string;
}

export interface WorkerNote {
  id: string;
  tenant_id: string;
  worker_id: string;
  note_type: string;
  note_content: string;
  created_by?: string;
  created_at?: string;
}
