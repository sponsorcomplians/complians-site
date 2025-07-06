import { getSupabaseClient } from './supabase-client';
import {
  MasterComplianceMetrics,
  MasterComplianceWorker,
  MasterComplianceFilters,
  AgentComplianceSummary,
  ComplianceStatusDistribution,
  RiskLevelDistribution,
  ComplianceTrend,
  MasterComplianceTableData
} from '@/types/master-compliance.types';

// Define all AI agent types
export const AI_AGENT_TYPES = [
  'ai-salary-compliance',
  'ai-qualification-compliance',
  'ai-right-to-work-compliance',
  'ai-skills-experience-compliance',
  'ai-document-compliance',
  'ai-record-keeping-compliance',
  'ai-reporting-duties-compliance',
  'ai-third-party-labour-compliance',
  'ai-immigration-status-monitoring-compliance',
  'ai-migrant-contact-maintenance-compliance',
  'ai-migrant-tracking-compliance',
  'ai-contracted-hours-compliance',
  'ai-genuine-vacancies-compliance',
  'ai-paragraph-c7-26-compliance',
  'ai-right-to-rent-compliance'
] as const;

export const AI_AGENT_NAMES: Record<string, string> = {
  'ai-salary-compliance': 'Salary Compliance',
  'ai-qualification-compliance': 'Qualification Compliance',
  'ai-right-to-work-compliance': 'Right to Work Compliance',
  'ai-skills-experience-compliance': 'Skills & Experience Compliance',
  'ai-document-compliance': 'Document Compliance',
  'ai-record-keeping-compliance': 'Record Keeping Compliance',
  'ai-reporting-duties-compliance': 'Reporting Duties Compliance',
  'ai-third-party-labour-compliance': 'Third-Party Labour Compliance',
  'ai-immigration-status-monitoring-compliance': 'Immigration Status Monitoring',
  'ai-migrant-contact-maintenance-compliance': 'Migrant Contact Maintenance',
  'ai-migrant-tracking-compliance': 'Migrant Tracking Compliance',
  'ai-contracted-hours-compliance': 'Contracted Hours Compliance',
  'ai-genuine-vacancies-compliance': 'Genuine Vacancies Compliance',
  'ai-paragraph-c7-26-compliance': 'Paragraph C7-26 Compliance',
  'ai-right-to-rent-compliance': 'Right to Rent Compliance'
};

export const AI_AGENT_SLUGS: Record<string, string> = {
  'ai-salary-compliance': 'ai-salary-compliance',
  'ai-qualification-compliance': 'ai-qualification-compliance',
  'ai-right-to-work-compliance': 'ai-right-to-work-compliance',
  'ai-skills-experience-compliance': 'ai-skills-experience-compliance',
  'ai-document-compliance': 'ai-document-compliance',
  'ai-record-keeping-compliance': 'ai-record-keeping-compliance',
  'ai-reporting-duties-compliance': 'ai-reporting-duties-compliance',
  'ai-third-party-labour-compliance': 'ai-third-party-labour-compliance',
  'ai-immigration-status-monitoring-compliance': 'ai-immigration-status-monitoring-compliance',
  'ai-migrant-contact-maintenance-compliance': 'ai-migrant-contact-maintenance-compliance',
  'ai-migrant-tracking-compliance': 'ai-migrant-tracking-compliance',
  'ai-contracted-hours-compliance': 'ai-contracted-hours-compliance',
  'ai-genuine-vacancies-compliance': 'ai-genuine-vacancies-compliance',
  'ai-paragraph-c7-26-compliance': 'ai-paragraph-c7-26-compliance',
  'ai-right-to-rent-compliance': 'ai-right-to-rent-compliance'
};

export class MasterComplianceService {
  private supabase = getSupabaseClient();

  async getMasterComplianceMetrics(filters?: MasterComplianceFilters): Promise<MasterComplianceMetrics> {
    try {
      if (!this.supabase) {
        throw new Error('Database connection not available');
      }

      // Get all compliance workers across all agents
      const { data: workers, error: workersError } = await this.supabase
        .from('compliance_workers')
        .select('*')
        .order('created_at', { ascending: false });

      if (workersError) {
        throw new Error(`Failed to fetch workers: ${workersError.message}`);
      }

      // Get all assessments
      const { data: assessments, error: assessmentsError } = await this.supabase
        .from('compliance_assessments')
        .select('*')
        .order('generated_at', { ascending: false });

      if (assessmentsError) {
        throw new Error(`Failed to fetch assessments: ${assessmentsError.message}`);
      }

      // Calculate summary metrics
      const summary = this.calculateSummaryMetrics(workers || [], assessments || []);

      // Calculate agent summaries
      const agentSummaries = this.calculateAgentSummaries(workers || [], assessments || []);

      // Calculate distributions
      const statusDistribution = this.calculateStatusDistribution(workers || []);
      const riskDistribution = this.calculateRiskDistribution(workers || []);

      // Get top performing agents (by compliance rate)
      const topAgents = agentSummaries
        .filter(agent => agent.totalWorkers > 0)
        .sort((a, b) => b.complianceRate - a.complianceRate)
        .slice(0, 5);

      // Calculate recent trends (last 30 days)
      const recentTrends = this.calculateRecentTrends(workers || [], assessments || []);

      return {
        summary,
        agentSummaries,
        statusDistribution,
        riskDistribution,
        topAgents,
        recentTrends
      };
    } catch (error) {
      console.error('Error fetching master compliance metrics:', error);
      throw error;
    }
  }

  async getMasterComplianceWorkers(
    filters?: MasterComplianceFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<MasterComplianceTableData> {
    try {
      if (!this.supabase) {
        throw new Error('Database connection not available');
      }

      // Build query with filters
      let query = this.supabase
        .from('compliance_workers')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.complianceStatus) {
        query = query.eq('compliance_status', filters.complianceStatus);
      }
      if (filters?.riskLevel) {
        query = query.eq('risk_level', filters.riskLevel);
      }
      if (filters?.agentType) {
        query = query.eq('agent_type', filters.agentType);
      }
      if (filters?.hasRedFlags) {
        query = query.eq('red_flag', true);
      }
      if (filters?.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end);
      }

      // Get total count for pagination
      const { count: totalCount } = await query;

      // Apply pagination
      const { data: workers, error } = await query
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) {
        throw new Error(`Failed to fetch workers: ${error.message}`);
      }

      // Transform workers to master compliance format
      const masterWorkers = await this.transformToMasterComplianceWorkers(workers || []);

      return {
        workers: masterWorkers,
        totalCount: totalCount || 0,
        filteredCount: masterWorkers.length,
        pagination: {
          page,
          pageSize,
          totalPages: Math.ceil((totalCount || 0) / pageSize)
        }
      };
    } catch (error) {
      console.error('Error fetching master compliance workers:', error);
      throw error;
    }
  }

  private calculateSummaryMetrics(workers: any[], assessments: any[]) {
    const totalWorkers = workers.length;
    const totalAssessments = assessments.length;
    const compliantWorkers = workers.filter(w => w.compliance_status === 'COMPLIANT').length;
    const breachWorkers = workers.filter(w => w.compliance_status === 'BREACH').length;
    const seriousBreachWorkers = workers.filter(w => w.compliance_status === 'SERIOUS_BREACH').length;
    const redFlags = workers.filter(w => w.red_flag).length;
    const highRiskWorkers = workers.filter(w => w.risk_level === 'HIGH').length;

    return {
      totalWorkers,
      totalAssessments,
      overallComplianceRate: totalWorkers > 0 ? Math.round((compliantWorkers / totalWorkers) * 100) : 0,
      totalBreaches: breachWorkers + seriousBreachWorkers,
      totalSeriousBreaches: seriousBreachWorkers,
      totalRedFlags: redFlags,
      highRiskWorkers,
      lastUpdated: new Date().toISOString()
    };
  }

  private calculateAgentSummaries(workers: any[], assessments: any[]): AgentComplianceSummary[] {
    return AI_AGENT_TYPES.map(agentType => {
      const agentWorkers = workers.filter(w => w.agent_type === agentType);
      const agentAssessments = assessments.filter(a => a.agent_type === agentType);
      
      const totalWorkers = agentWorkers.length;
      const compliantWorkers = agentWorkers.filter(w => w.compliance_status === 'COMPLIANT').length;
      const breachWorkers = agentWorkers.filter(w => w.compliance_status === 'BREACH').length;
      const seriousBreachWorkers = agentWorkers.filter(w => w.compliance_status === 'SERIOUS_BREACH').length;
      const redFlags = agentWorkers.filter(w => w.red_flag).length;
      const highRiskWorkers = agentWorkers.filter(w => w.risk_level === 'HIGH').length;

      const lastAssessment = agentAssessments.length > 0 
        ? agentAssessments[0].generated_at 
        : undefined;

      return {
        agentType,
        agentName: AI_AGENT_NAMES[agentType],
        agentSlug: AI_AGENT_SLUGS[agentType],
        totalWorkers,
        compliantWorkers,
        breachWorkers,
        seriousBreachWorkers,
        complianceRate: totalWorkers > 0 ? Math.round((compliantWorkers / totalWorkers) * 100) : 0,
        redFlags,
        highRiskWorkers,
        lastAssessmentDate: lastAssessment
      };
    });
  }

  private calculateStatusDistribution(workers: any[]): ComplianceStatusDistribution {
    return {
      compliant: workers.filter(w => w.compliance_status === 'COMPLIANT').length,
      breach: workers.filter(w => w.compliance_status === 'BREACH').length,
      seriousBreach: workers.filter(w => w.compliance_status === 'SERIOUS_BREACH').length,
      pending: workers.filter(w => w.compliance_status === 'PENDING').length
    };
  }

  private calculateRiskDistribution(workers: any[]): RiskLevelDistribution {
    return {
      low: workers.filter(w => w.risk_level === 'LOW').length,
      medium: workers.filter(w => w.risk_level === 'MEDIUM').length,
      high: workers.filter(w => w.risk_level === 'HIGH').length
    };
  }

  private calculateRecentTrends(workers: any[], assessments: any[]): ComplianceTrend[] {
    const trends: ComplianceTrend[] = [];
    const today = new Date();
    
    // Calculate trends for last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Filter workers and assessments for this date
      const dayWorkers = workers.filter(w => {
        const workerDate = new Date(w.created_at).toISOString().split('T')[0];
        return workerDate === dateStr;
      });
      
      const dayAssessments = assessments.filter(a => {
        const assessmentDate = new Date(a.generated_at).toISOString().split('T')[0];
        return assessmentDate === dateStr;
      });

      const totalWorkers = dayWorkers.length;
      const compliantWorkers = dayWorkers.filter(w => w.compliance_status === 'COMPLIANT').length;
      const breaches = dayWorkers.filter(w => w.compliance_status === 'BREACH').length;
      const seriousBreaches = dayWorkers.filter(w => w.compliance_status === 'SERIOUS_BREACH').length;

      trends.push({
        date: dateStr,
        complianceRate: totalWorkers > 0 ? Math.round((compliantWorkers / totalWorkers) * 100) : 0,
        totalWorkers,
        breaches,
        seriousBreaches
      });
    }

    return trends;
  }

  private async transformToMasterComplianceWorkers(workers: any[]): Promise<MasterComplianceWorker[]> {
    // Group workers by name to aggregate across agents
    const workerGroups = new Map<string, any[]>();
    
    workers.forEach(worker => {
      const key = worker.name;
      if (!workerGroups.has(key)) {
        workerGroups.set(key, []);
      }
      workerGroups.get(key)!.push(worker);
    });

    const masterWorkers: MasterComplianceWorker[] = [];

    for (const [workerName, workerGroup] of workerGroups) {
      const firstWorker = workerGroup[0];
      
      // Calculate overall compliance status (worst case scenario)
      const overallStatus = this.calculateOverallComplianceStatus(workerGroup);
      const overallRiskLevel = this.calculateOverallRiskLevel(workerGroup);
      const totalRedFlags = workerGroup.filter(w => w.red_flag).length;

      // Build agent compliance object
      const agentCompliance: MasterComplianceWorker['agentCompliance'] = {};
      workerGroup.forEach(worker => {
        agentCompliance[worker.agent_type] = {
          status: worker.compliance_status,
          riskLevel: worker.risk_level,
          redFlag: worker.red_flag,
          lastAssessmentDate: worker.last_assessment_date
        };
      });

      masterWorkers.push({
        id: firstWorker.id,
        name: workerName,
        jobTitle: firstWorker.job_title,
        socCode: firstWorker.soc_code,
        cosReference: firstWorker.cos_reference,
        assignmentDate: firstWorker.assignment_date,
        overallComplianceStatus: overallStatus,
        overallRiskLevel: overallRiskLevel,
        totalRedFlags,
        agentCompliance,
        lastUpdated: firstWorker.updated_at || firstWorker.created_at
      });
    }

    return masterWorkers;
  }

  private calculateOverallComplianceStatus(workerGroup: any[]): 'COMPLIANT' | 'BREACH' | 'SERIOUS_BREACH' | 'PENDING' {
    if (workerGroup.some(w => w.compliance_status === 'SERIOUS_BREACH')) {
      return 'SERIOUS_BREACH';
    }
    if (workerGroup.some(w => w.compliance_status === 'BREACH')) {
      return 'BREACH';
    }
    if (workerGroup.some(w => w.compliance_status === 'PENDING')) {
      return 'PENDING';
    }
    return 'COMPLIANT';
  }

  private calculateOverallRiskLevel(workerGroup: any[]): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (workerGroup.some(w => w.risk_level === 'HIGH')) {
      return 'HIGH';
    }
    if (workerGroup.some(w => w.risk_level === 'MEDIUM')) {
      return 'MEDIUM';
    }
    return 'LOW';
  }
}

export const masterComplianceService = new MasterComplianceService(); 