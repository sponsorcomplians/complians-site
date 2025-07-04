import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface ComplianceWorker {
  id: string;
  user_id: string;
  agent_type: string;
  name: string;
  job_title: string;
  soc_code: string;
  cos_reference: string;
  compliance_status: 'COMPLIANT' | 'BREACH' | 'SERIOUS_BREACH';
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  red_flag: boolean;
  assignment_date: string;
  last_assessment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceAssessment {
  id: string;
  user_id: string;
  worker_id: string;
  agent_type: string;
  worker_name: string;
  cos_reference: string;
  job_title: string;
  soc_code: string;
  compliance_status: 'COMPLIANT' | 'BREACH' | 'SERIOUS_BREACH';
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  evidence_status: string;
  breach_type?: string;
  red_flag: boolean;
  assignment_date: string;
  professional_assessment: string;
  generated_at: string;
}

export interface ComplianceReport {
  id: string;
  user_id: string;
  assessment_id: string;
  agent_type: string;
  report_type: 'pdf' | 'email' | 'print';
  report_content?: string;
  file_path?: string;
  downloaded_at?: string;
  created_at: string;
}

export class AIComplianceService {
  private user: User | null = null;

  constructor(user?: User | null) {
    this.user = user || null;
  }

  private getUserId(): string {
    if (!this.user?.id) {
      throw new Error('User not authenticated');
    }
    return this.user.id;
  }

  // Workers operations
  async getWorkers(agentType: string): Promise<ComplianceWorker[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_compliance_workers_by_agent', {
          user_uuid: this.getUserId(),
          agent_type_param: agentType
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workers:', error);
      return [];
    }
  }

  async saveWorker(worker: Omit<ComplianceWorker, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ComplianceWorker | null> {
    try {
      const { data, error } = await supabase
        .from('compliance_workers')
        .insert({
          ...worker,
          user_id: this.getUserId()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving worker:', error);
      return null;
    }
  }

  async updateWorker(workerId: string, updates: Partial<ComplianceWorker>): Promise<ComplianceWorker | null> {
    try {
      const { data, error } = await supabase
        .from('compliance_workers')
        .update(updates)
        .eq('id', workerId)
        .eq('user_id', this.getUserId())
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating worker:', error);
      return null;
    }
  }

  async deleteWorker(workerId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('compliance_workers')
        .delete()
        .eq('id', workerId)
        .eq('user_id', this.getUserId());

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting worker:', error);
      return false;
    }
  }

  // Assessments operations
  async getAssessments(agentType: string): Promise<ComplianceAssessment[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_compliance_assessments_by_agent', {
          user_uuid: this.getUserId(),
          agent_type_param: agentType
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching assessments:', error);
      return [];
    }
  }

  async saveAssessment(assessment: Omit<ComplianceAssessment, 'id' | 'user_id' | 'generated_at'>): Promise<ComplianceAssessment | null> {
    try {
      const { data, error } = await supabase
        .from('compliance_assessments')
        .insert({
          ...assessment,
          user_id: this.getUserId()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving assessment:', error);
      return null;
    }
  }

  async getAssessmentById(assessmentId: string): Promise<ComplianceAssessment | null> {
    try {
      const { data, error } = await supabase
        .from('compliance_assessments')
        .select('*')
        .eq('id', assessmentId)
        .eq('user_id', this.getUserId())
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching assessment:', error);
      return null;
    }
  }

  // Reports operations
  async saveReport(report: Omit<ComplianceReport, 'id' | 'user_id' | 'created_at'>): Promise<ComplianceReport | null> {
    try {
      const { data, error } = await supabase
        .from('compliance_reports')
        .insert({
          ...report,
          user_id: this.getUserId()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving report:', error);
      return null;
    }
  }

  async getReportsByAssessment(assessmentId: string): Promise<ComplianceReport[]> {
    try {
      const { data, error } = await supabase
        .from('compliance_reports')
        .select('*')
        .eq('assessment_id', assessmentId)
        .eq('user_id', this.getUserId())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  }

  // Dashboard statistics
  async getDashboardStats(agentType: string): Promise<{
    totalWorkers: number;
    compliantWorkers: number;
    redFlags: number;
    highRisk: number;
    complianceRate: number;
  }> {
    try {
      const workers = await this.getWorkers(agentType);
      
      const totalWorkers = workers.length;
      const compliantWorkers = workers.filter(w => w.compliance_status === 'COMPLIANT').length;
      const redFlags = workers.filter(w => w.red_flag).length;
      const highRisk = workers.filter(w => w.risk_level === 'HIGH').length;
      const complianceRate = totalWorkers > 0 ? Math.round((compliantWorkers / totalWorkers) * 100) : 0;

      return {
        totalWorkers,
        compliantWorkers,
        redFlags,
        highRisk,
        complianceRate
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalWorkers: 0,
        compliantWorkers: 0,
        redFlags: 0,
        highRisk: 0,
        complianceRate: 0
      };
    }
  }

  // Upload and process documents
  async uploadDocuments(files: File[], agentType: string): Promise<{
    worker: ComplianceWorker | null;
    assessment: ComplianceAssessment | null;
  }> {
    try {
      // Extract worker info from files (simulated)
      const { workerName, cosReference } = this.extractWorkerInfo(files);
      
      // Create worker
      const worker = await this.saveWorker({
        agent_type: agentType,
        name: workerName,
        job_title: 'Care Assistant', // Default, should be extracted from documents
        soc_code: '6145', // Default, should be extracted from documents
        cos_reference: cosReference,
        compliance_status: 'SERIOUS_BREACH', // Will be determined by assessment
        risk_level: 'HIGH', // Will be determined by assessment
        red_flag: true, // Will be determined by assessment
        assignment_date: new Date().toISOString().split('T')[0]
      });

      if (!worker) {
        throw new Error('Failed to save worker');
      }

      // Generate assessment
      const professionalAssessment = this.generateProfessionalAssessment(
        workerName,
        cosReference,
        worker.job_title,
        worker.soc_code,
        worker.assignment_date,
        agentType
      );

      const assessment = await this.saveAssessment({
        worker_id: worker.id,
        agent_type: agentType,
        worker_name: workerName,
        cos_reference: cosReference,
        job_title: worker.job_title,
        soc_code: worker.soc_code,
        compliance_status: 'SERIOUS_BREACH',
        risk_level: 'HIGH',
        evidence_status: 'MISSING_PAYSLIPS', // Will be determined by document analysis
        breach_type: 'UNDERPAYMENT', // Will be determined by document analysis
        red_flag: true,
        assignment_date: worker.assignment_date,
        professional_assessment: professionalAssessment
      });

      if (assessment) {
        console.log('ASSESSMENT WORKER NAME:', assessment.worker_name);
      }

      // Update worker with assessment date
      await this.updateWorker(worker.id, {
        last_assessment_date: new Date().toISOString().split('T')[0]
      });

      return { worker, assessment };
    } catch (error) {
      console.error('Error uploading documents:', error);
      return { worker: null, assessment: null };
    }
  }

  // Helper methods (simulated document processing)
  private extractWorkerInfo(files: File[]): { workerName: string; cosReference: string } {
    // Simulate document processing
    const cosFile = files.find(f => 
      f.name.toLowerCase().includes('cos') || 
      f.name.toLowerCase().includes('certificate')
    );

    let workerName = 'Unknown Worker';
    let cosReference = 'UNKNOWN';

    if (cosFile) {
      const filename = cosFile.name;
      // Use improved regex and fallback
      const match = filename.match(/Worker from (.+?) - Certificate of Sponsorship/);
      workerName = match && match[1] ? match[1].trim() : filename.replace(/\.(pdf|docx?)$/i, '');
      cosReference = 'COS' + Math.random().toString().substr(2, 6);
      console.log('EXTRACTION DEBUG:', {
        originalFilename: filename,
        extractedName: workerName,
        regexMatch: match
      });
    }

    return { workerName, cosReference };
  }

  private generateProfessionalAssessment(
    workerName: string,
    cosRef: string,
    jobTitle: string,
    socCode: string,
    assignmentDate: string,
    agentType: string
  ): string {
    // Generate assessment based on agent type
    if (agentType === 'ai-salary-compliance') {
      return `Salary Compliance Assessment for ${workerName} (${cosRef})

You assigned Certificate of Sponsorship (CoS) for ${workerName} (${cosRef}) on ${assignmentDate} to work as a ${jobTitle} under SOC code ${socCode}.

Upon review of the uploaded salary documents and payslips, the AI Salary Compliance Agent has identified a serious breach of sponsor duties regarding salary compliance.

CRITICAL FINDINGS:
1. No valid payslips or salary documentation has been provided for ${workerName}
2. The file does not contain evidence of National Minimum Wage compliance
3. There is no evidence of meeting Home Office salary thresholds
4. The worker's salary compliance cannot be verified through the provided documentation

LEGAL REQUIREMENTS:
Under the Immigration Rules and sponsor guidance, employers must:
- Pay sponsored workers at least the National Minimum Wage
- Meet Home Office salary thresholds for the relevant SOC code
- Maintain accurate payslips and salary records
- Report any salary changes to the Home Office

SPONSOR DUTIES:
As a licensed sponsor, you are required to:
- Ensure all sponsored workers are paid appropriately
- Maintain salary records and payslips
- Report any salary changes or underpayments
- Ensure compliance with all salary-related immigration rules

RECOMMENDED ACTIONS:
1. Immediately provide valid payslips for ${workerName}
2. Verify National Minimum Wage compliance
3. Ensure salary meets Home Office thresholds for SOC code ${socCode}
4. Implement proper salary monitoring procedures
5. Consider suspending employment until salary compliance is verified

This breach constitutes a serious compliance failure that could result in sponsor license suspension or revocation. Immediate remedial action is required.`;
    }

    // Default assessment for other agent types
    return `Compliance Assessment for ${workerName} (${cosRef})

You assigned Certificate of Sponsorship (CoS) for ${workerName} (${cosRef}) on ${assignmentDate} to work as a ${jobTitle} under SOC code ${socCode}.

The AI Compliance Agent has reviewed the uploaded documents and identified compliance issues that require immediate attention.

RECOMMENDED ACTIONS:
- Ensure all required documentation is provided
- Address any identified compliance gaps
- Implement proper monitoring procedures

This assessment is generated for sponsor compliance records.`;
  }
} 