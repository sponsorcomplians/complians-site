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
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly RATE_LIMIT = 100; // requests per minute
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds

  private checkRateLimit(): void {
    const now = Date.now();
    if (now - this.lastRequestTime > this.RATE_LIMIT_WINDOW) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }
    
    this.requestCount++;
    if (this.requestCount > this.RATE_LIMIT) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
  }

  private validateUserAccess(userId: string): void {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user authentication');
    }
  }

  private sanitizeFilters(filters?: MasterComplianceFilters): MasterComplianceFilters | undefined {
    if (!filters) return undefined;
    
    const sanitized: MasterComplianceFilters = {};
    
    if (filters.complianceStatus && ['COMPLIANT', 'BREACH', 'SERIOUS_BREACH'].includes(filters.complianceStatus)) {
      sanitized.complianceStatus = filters.complianceStatus;
    }
    
    if (filters.riskLevel && ['LOW', 'MEDIUM', 'HIGH'].includes(filters.riskLevel)) {
      sanitized.riskLevel = filters.riskLevel;
    }
    
    if (filters.agentType && typeof filters.agentType === 'string') {
      sanitized.agentType = filters.agentType;
    }
    
    if (typeof filters.hasRedFlags === 'boolean') {
      sanitized.hasRedFlags = filters.hasRedFlags;
    }
    
    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate <= endDate) {
        sanitized.dateRange = {
          start: filters.dateRange.start,
          end: filters.dateRange.end
        };
      }
    }
    
    return Object.keys(sanitized).length > 0 ? sanitized : undefined;
  }

  async getMasterComplianceMetrics(filters?: MasterComplianceFilters): Promise<MasterComplianceMetrics> {
    try {
      // Apply rate limiting
      this.checkRateLimit();

      if (!this.supabase) {
        throw new Error('Database connection not available');
      }

      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate user access
      this.validateUserAccess(user.id);

      // Sanitize filters
      const sanitizedFilters = this.sanitizeFilters(filters);

      // Build optimized queries with filters
      let workersQuery = this.supabase
        .from('compliance_workers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      let assessmentsQuery = this.supabase
        .from('compliance_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false });

      // Apply sanitized filters to both queries
      if (sanitizedFilters?.complianceStatus) {
        workersQuery = workersQuery.eq('compliance_status', sanitizedFilters.complianceStatus);
        assessmentsQuery = assessmentsQuery.eq('compliance_status', sanitizedFilters.complianceStatus);
      }
      if (sanitizedFilters?.riskLevel) {
        workersQuery = workersQuery.eq('risk_level', sanitizedFilters.riskLevel);
        assessmentsQuery = assessmentsQuery.eq('risk_level', sanitizedFilters.riskLevel);
      }
      if (sanitizedFilters?.agentType) {
        workersQuery = workersQuery.eq('agent_type', sanitizedFilters.agentType);
        assessmentsQuery = assessmentsQuery.eq('agent_type', sanitizedFilters.agentType);
      }
      if (sanitizedFilters?.hasRedFlags) {
        workersQuery = workersQuery.eq('red_flag', true);
        assessmentsQuery = assessmentsQuery.eq('red_flag', true);
      }
      if (sanitizedFilters?.dateRange) {
        workersQuery = workersQuery
          .gte('created_at', sanitizedFilters.dateRange.start)
          .lte('created_at', sanitizedFilters.dateRange.end);
        assessmentsQuery = assessmentsQuery
          .gte('generated_at', sanitizedFilters.dateRange.start)
          .lte('generated_at', sanitizedFilters.dateRange.end);
      }

      // Execute queries in parallel for better performance
      const [workersResult, assessmentsResult] = await Promise.all([
        workersQuery,
        assessmentsQuery
      ]);

      if (workersResult.error) {
        throw new Error(`Failed to fetch workers: ${workersResult.error.message}`);
      }

      if (assessmentsResult.error) {
        throw new Error(`Failed to fetch assessments: ${assessmentsResult.error.message}`);
      }

      const workers = workersResult.data || [];
      const assessments = assessmentsResult.data || [];

      // Add performance logging for large datasets
      if (workers.length > 100 || assessments.length > 100) {
        console.log(`Performance: Processing ${workers.length} workers and ${assessments.length} assessments`);
      }

      // Calculate summary metrics
      const summary = this.calculateSummaryMetrics(workers, assessments);

      // Calculate agent summaries
      const agentSummaries = this.calculateAgentSummaries(workers, assessments);

      // Calculate distributions
      const statusDistribution = this.calculateStatusDistribution(workers);
      const riskDistribution = this.calculateRiskDistribution(workers);

      // Get top performing agents (by compliance rate)
      const topAgents = agentSummaries
        .filter(agent => agent.totalWorkers > 0)
        .sort((a, b) => b.complianceRate - a.complianceRate)
        .slice(0, 5);

      // Calculate recent trends (last 30 days) - optimized for performance
      const recentTrends = this.calculateRecentTrends(workers, assessments);

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

      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Build query with filters
      let query = this.supabase
        .from('compliance_workers')
        .select('*')
        .eq('user_id', user.id)
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
      pending: 0 // Database schema doesn't support PENDING for compliance_workers
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
        globalRiskScore: firstWorker.global_risk_score ?? 0,
        remediationActions: [],
        createdAt: firstWorker.created_at,
        updatedAt: firstWorker.updated_at,
        lastUpdated: firstWorker.updated_at || firstWorker.created_at,
      });
    }

    return masterWorkers;
  }

  private calculateOverallComplianceStatus(workerGroup: any[]): 'COMPLIANT' | 'BREACH' | 'SERIOUS_BREACH' {
    if (workerGroup.some(w => w.compliance_status === 'SERIOUS_BREACH')) {
      return 'SERIOUS_BREACH';
    }
    if (workerGroup.some(w => w.compliance_status === 'BREACH')) {
      return 'BREACH';
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

  async generateGlobalSummaryPDF(): Promise<{ success: boolean; filePath?: string; content?: string; error?: string }> {
    try {
      if (!this.supabase) {
        throw new Error('Database connection not available');
      }

      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get all metrics for the summary
      const metrics = await this.getMasterComplianceMetrics();
      
      // Generate comprehensive summary content
      const summaryContent = this.generateSummaryContent(metrics);
      
      // For now, return the content structure - PDF generation can be implemented later
      return {
        success: true,
        filePath: `/api/master-compliance/export/summary-${Date.now()}.pdf`,
        content: summaryContent
      };
    } catch (error) {
      console.error('Error generating global summary PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async generateCombinedNarrative(workerId: string): Promise<{ success: boolean; narrative?: string; error?: string }> {
    try {
      if (!this.supabase) {
        throw new Error('Database connection not available');
      }

      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get all assessments for this worker across all agents
      const { data: assessments, error } = await this.supabase
        .from('compliance_assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('worker_name', workerId) // Using worker_name as identifier
        .order('generated_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch assessments: ${error.message}`);
      }

      if (!assessments || assessments.length === 0) {
        return {
          success: false,
          error: 'No assessments found for this worker'
        };
      }

      // Generate combined narrative from all assessments
      const combinedNarrative = this.generateCombinedNarrativeContent(assessments);
      
      return {
        success: true,
        narrative: combinedNarrative
      };
    } catch (error) {
      console.error('Error generating combined narrative:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateSummaryContent(metrics: MasterComplianceMetrics): string {
    const { summary, agentSummaries, statusDistribution, riskDistribution, topAgents } = metrics;
    
    let content = `MASTER COMPLIANCE SUMMARY REPORT\n`;
    content += `Generated: ${new Date().toLocaleDateString('en-GB')}\n\n`;
    
    // Overall Summary
    content += `OVERALL COMPLIANCE SUMMARY\n`;
    content += `Total Workers: ${summary.totalWorkers}\n`;
    content += `Total Assessments: ${summary.totalAssessments}\n`;
    content += `Overall Compliance Rate: ${summary.overallComplianceRate}%\n`;
    content += `Total Breaches: ${summary.totalBreaches}\n`;
    content += `Total Serious Breaches: ${summary.totalSeriousBreaches}\n`;
    content += `Total Red Flags: ${summary.totalRedFlags}\n`;
    content += `High Risk Workers: ${summary.highRiskWorkers}\n\n`;
    
    // Status Distribution
    content += `COMPLIANCE STATUS DISTRIBUTION\n`;
    content += `Compliant: ${statusDistribution.compliant}\n`;
    content += `Breach: ${statusDistribution.breach}\n`;
    content += `Serious Breach: ${statusDistribution.seriousBreach}\n\n`;
    
    // Risk Distribution
    content += `RISK LEVEL DISTRIBUTION\n`;
    content += `Low Risk: ${riskDistribution.low}\n`;
    content += `Medium Risk: ${riskDistribution.medium}\n`;
    content += `High Risk: ${riskDistribution.high}\n\n`;
    
    // Top Performing Agents
    content += `TOP PERFORMING AGENTS\n`;
    topAgents.forEach((agent, index) => {
      content += `${index + 1}. ${agent.agentName}: ${agent.complianceRate}% (${agent.totalWorkers} workers)\n`;
    });
    content += `\n`;
    
    // Agent Breakdown
    content += `DETAILED AGENT BREAKDOWN\n`;
    agentSummaries.forEach(agent => {
      if (agent.totalWorkers > 0) {
        content += `${agent.agentName}:\n`;
        content += `  - Total Workers: ${agent.totalWorkers}\n`;
        content += `  - Compliance Rate: ${agent.complianceRate}%\n`;
        content += `  - Breaches: ${agent.breachWorkers}\n`;
        content += `  - Serious Breaches: ${agent.seriousBreachWorkers}\n`;
        content += `  - Red Flags: ${agent.redFlags}\n`;
        content += `  - High Risk: ${agent.highRiskWorkers}\n\n`;
      }
    });
    
    return content;
  }

  private generateCombinedNarrativeContent(assessments: any[]): string {
    let narrative = `COMBINED COMPLIANCE ASSESSMENT NARRATIVE\n\n`;
    
    // Group assessments by agent type
    const agentGroups = new Map<string, any[]>();
    assessments.forEach(assessment => {
      if (!agentGroups.has(assessment.agent_type)) {
        agentGroups.set(assessment.agent_type, []);
      }
      agentGroups.get(assessment.agent_type)!.push(assessment);
    });
    
    // Generate narrative for each agent type
    agentGroups.forEach((agentAssessments, agentType) => {
      const latestAssessment = agentAssessments[0]; // Most recent
      
      narrative += `${agentType.toUpperCase().replace(/-/g, ' ')} ASSESSMENT\n`;
      narrative += `Worker: ${latestAssessment.worker_name}\n`;
      narrative += `Job Title: ${latestAssessment.job_title}\n`;
      narrative += `SOC Code: ${latestAssessment.soc_code}\n`;
      narrative += `Compliance Status: ${latestAssessment.compliance_status}\n`;
      narrative += `Risk Level: ${latestAssessment.risk_level}\n`;
      narrative += `Red Flag: ${latestAssessment.red_flag ? 'Yes' : 'No'}\n`;
      narrative += `Assessment Date: ${new Date(latestAssessment.generated_at).toLocaleDateString('en-GB')}\n\n`;
      
      narrative += `Professional Assessment:\n${latestAssessment.professional_assessment}\n\n`;
      
      if (latestAssessment.breach_type) {
        narrative += `Breach Type: ${latestAssessment.breach_type}\n`;
      }
      
      narrative += `\n---\n\n`;
    });
    
    // Overall summary
    const totalAssessments = assessments.length;
    const compliantAssessments = assessments.filter(a => a.compliance_status === 'COMPLIANT').length;
    const breachAssessments = assessments.filter(a => a.compliance_status === 'BREACH').length;
    const seriousBreachAssessments = assessments.filter(a => a.compliance_status === 'SERIOUS_BREACH').length;
    const redFlagAssessments = assessments.filter(a => a.red_flag).length;
    
    narrative += `OVERALL SUMMARY\n`;
    narrative += `Total Assessments: ${totalAssessments}\n`;
    narrative += `Compliant: ${compliantAssessments}\n`;
    narrative += `Breaches: ${breachAssessments}\n`;
    narrative += `Serious Breaches: ${seriousBreachAssessments}\n`;
    narrative += `Red Flags: ${redFlagAssessments}\n\n`;
    
    if (seriousBreachAssessments > 0) {
      narrative += `CRITICAL: This worker has ${seriousBreachAssessments} serious breach(es) requiring immediate attention.\n`;
    } else if (breachAssessments > 0) {
      narrative += `WARNING: This worker has ${breachAssessments} breach(es) that need to be addressed.\n`;
    } else {
      narrative += `POSITIVE: This worker is compliant across all assessed areas.\n`;
    }
    
    return narrative;
  }

  // Calculate global risk score for a worker
  async calculateGlobalRiskScore(workerId: string): Promise<number> {
    try {
      // Get all assessments for this worker
      const { data: assessments, error } = await this.supabase
        .from('compliance_assessments')
        .select('*')
        .eq('worker_id', workerId);

      if (error) {
        console.error('Error fetching assessments for risk score:', error);
        return 0;
      }

      if (!assessments || assessments.length === 0) {
        return 0;
      }

      let totalScore = 0;
      let maxPossibleScore = 0;

      // Risk level weights
      const riskWeights = {
        'LOW': 1,
        'MEDIUM': 3,
        'HIGH': 5
      };

      // Compliance status weights
      const statusWeights = {
        'COMPLIANT': 0,
        'BREACH': 2,
        'SERIOUS_BREACH': 4
      };

      // Red flag penalty
      const redFlagPenalty = 3;

      assessments.forEach((assessment: any) => {
        // Base score from risk level
        const riskScore = riskWeights[assessment.risk_level as keyof typeof riskWeights] || 0;
        
        // Additional score from compliance status
        const statusScore = statusWeights[assessment.compliance_status as keyof typeof statusWeights] || 0;
        
        // Red flag penalty
        const flagPenalty = assessment.red_flag ? redFlagPenalty : 0;
        
        totalScore += riskScore + statusScore + flagPenalty;
        maxPossibleScore += 5 + 4 + redFlagPenalty; // Max risk + max status + red flag
      });

      // Calculate percentage and ensure it's between 0-100
      const riskPercentage = Math.round((totalScore / maxPossibleScore) * 100);
      return Math.min(Math.max(riskPercentage, 0), 100);
    } catch (error) {
      console.error('Error calculating global risk score:', error);
      return 0;
    }
  }

  // Update global risk score for a worker
  async updateWorkerGlobalRiskScore(workerId: string): Promise<void> {
    try {
      const riskScore = await this.calculateGlobalRiskScore(workerId);
      
      const { error } = await this.supabase
        .from('compliance_workers')
        .update({ global_risk_score: riskScore })
        .eq('id', workerId);

      if (error) {
        console.error('Error updating global risk score:', error);
      }
    } catch (error) {
      console.error('Error updating global risk score:', error);
    }
  }

  // Create alert for serious breaches or high-risk statuses
  async createAlertForWorker(workerId: string, agentType: string, assessment: {
    compliance_status: string;
    risk_level: string;
    red_flag: boolean;
    worker_name: string;
  }): Promise<void> {
    try {
      const shouldCreateAlert = 
        assessment.compliance_status === 'SERIOUS_BREACH' ||
        assessment.risk_level === 'HIGH' ||
        assessment.red_flag === true;

      if (!shouldCreateAlert) {
        return;
      }

      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return;

      let alertMessage = '';
      
      if (assessment.compliance_status === 'SERIOUS_BREACH') {
        alertMessage = `SERIOUS BREACH detected in ${AI_AGENT_NAMES[agentType] || agentType} for worker ${assessment.worker_name}. Immediate action required.`;
      } else if (assessment.risk_level === 'HIGH') {
        alertMessage = `HIGH RISK status detected in ${AI_AGENT_NAMES[agentType] || agentType} for worker ${assessment.worker_name}. Enhanced monitoring recommended.`;
      } else if (assessment.red_flag === true) {
        alertMessage = `RED FLAG raised in ${AI_AGENT_NAMES[agentType] || agentType} for worker ${assessment.worker_name}. Review required.`;
      }

      if (alertMessage) {
        await this.supabase
          .from('alerts')
          .insert({
            user_id: user.id,
            worker_id: workerId,
            agent_type: agentType,
            alert_message: alertMessage,
            status: 'Unread'
          });
      }
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }
}

export const masterComplianceService = new MasterComplianceService(); 