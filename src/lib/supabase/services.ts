import { supabase } from '../supabase';

// Type definitions
interface Worker {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  department?: string;
  salary?: number;
  start_date: string;
  visa_status: string;
  visa_expiry: string;
  cos_number?: string;
  passport_number?: string;
  passport_expiry?: string;
  compliance_status: 'compliant' | 'warning' | 'critical';
  compliance_score: number;
  last_compliance_check?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  is_active: boolean;
}

interface ReportingDuty {
  id: string;
  worker_id: string;
  event_type: string;
  event_date: string;
  event_details?: any;
  report_deadline: string;
  status: string;
  submitted_at?: string;
  submitted_by?: string;
  submission_reference?: string;
  escalation_level: number;
  last_escalation?: string;
  created_at: string;
  workers?: {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

// Worker Service
export const workerService = {
  async getWorkers(): Promise<Worker[]> {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getWorker(id: string): Promise<Worker | null> {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createWorker(workerData: Partial<Worker>): Promise<Worker> {
    const { data, error } = await supabase
      .from('workers')
      .insert(workerData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Reporting Duty Service
export const reportingDutyService = {
  async getPendingDuties(): Promise<ReportingDuty[]> {
    const { data, error } = await supabase
      .from('reporting_duties')
      .select(`
        *,
        workers!inner(
          id,
          first_name,
          last_name,
          role
        )
      `)
      .order('report_deadline');
    
    if (error) throw error;
    return data || [];
  },

  async createReportingDuty(
    workerId: string, 
    eventType: string, 
    eventDetails: any
  ): Promise<ReportingDuty> {
    const deadline = this.calculateDeadline(new Date(), 10);
    
    const { data, error } = await supabase
      .from('reporting_duties')
      .insert({
        worker_id: workerId,
        event_type: eventType,
        event_date: new Date().toISOString().split('T')[0],
        event_details: eventDetails,
        report_deadline: deadline.toISOString().split('T')[0]
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  calculateDeadline(startDate: Date, workingDays: number): Date {
    let date = new Date(startDate);
    let daysAdded = 0;
    
    while (daysAdded < workingDays) {
      date.setDate(date.getDate() + 1);
      // Skip weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        daysAdded++;
      }
    }
    
    return date;
  },

  async submitReport(dutyId: string, reference: string): Promise<ReportingDuty> {
    const { data, error } = await supabase
      .from('reporting_duties')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        submission_reference: reference
      })
      .eq('id', dutyId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async checkOverdueReports(): Promise<ReportingDuty[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: overdue, error } = await supabase
      .from('reporting_duties')
      .select('*')
      .eq('status', 'pending')
      .lt('report_deadline', today);
    
    if (error) throw error;
    
    // Update status to overdue
    for (const duty of overdue || []) {
      await supabase
        .from('reporting_duties')
        .update({
          status: 'overdue',
          escalation_level: (duty.escalation_level || 0) + 1,
          last_escalation: new Date().toISOString()
        })
        .eq('id', duty.id);
    }
    
    return overdue || [];
  }
};

// Dashboard Service
export const dashboardService = {
  async getDashboardMetrics() {
    // Get worker counts by status
    const { data: workers, error: workersError } = await supabase
      .from('workers')
      .select('id, first_name, last_name, compliance_status, visa_expiry')
      .eq('is_active', true);
    
    if (workersError) throw workersError;
    
    const workersList = workers || [];
    
    const counts = {
      total: workersList.length,
      compliant: workersList.filter((w: any) => w.compliance_status === 'compliant').length,
      warning: workersList.filter((w: any) => w.compliance_status === 'warning').length,
      critical: workersList.filter((w: any) => w.compliance_status === 'critical').length
    };
    
    // Get expiring visas (within 60 days)
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
    
    const expiringVisas = workersList.filter((w: any) => {
      const expiryDate = new Date(w.visa_expiry);
      return expiryDate <= sixtyDaysFromNow && expiryDate >= new Date();
    });
    
    // Get pending reporting duties
    const { data: pendingReports, error: reportsError } = await supabase
      .from('reporting_duties')
      .select(`
        *,
        workers!inner(
          first_name,
          last_name
        )
      `)
      .eq('status', 'pending');
    
    if (reportsError) throw reportsError;
    
    // For now, return empty array for expiring documents
    const expiringDocuments: any[] = [];
    
    return {
      workerCounts: counts,
      expiringVisas: expiringVisas || [],
      pendingReports: pendingReports || [],
      expiringDocuments: expiringDocuments,
      complianceRate: counts.total > 0 ? Math.round((counts.compliant / counts.total) * 100) : 0
    };
  }
};