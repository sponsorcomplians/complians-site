// Master Compliance Dashboard Types

export interface MasterComplianceSummary {
  totalWorkers: number;
  totalAssessments: number;
  overallComplianceRate: number;
  totalBreaches: number;
  totalSeriousBreaches: number;
  totalRedFlags: number;
  highRiskWorkers: number;
  lastUpdated: string;
}

export interface AgentComplianceSummary {
  agentType: string;
  agentName: string;
  agentSlug: string;
  totalWorkers: number;
  compliantWorkers: number;
  breachWorkers: number;
  seriousBreachWorkers: number;
  complianceRate: number;
  redFlags: number;
  highRiskWorkers: number;
  lastAssessmentDate?: string;
}

export interface ComplianceStatusDistribution {
  compliant: number;
  breach: number;
  seriousBreach: number;
  pending: number;
}

export interface RiskLevelDistribution {
  low: number;
  medium: number;
  high: number;
}

export interface MasterComplianceWorker {
  id: string;
  name: string;
  jobTitle: string;
  socCode: string;
  cosReference: string;
  assignmentDate: string;
  overallComplianceStatus: 'COMPLIANT' | 'BREACH' | 'SERIOUS_BREACH';
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  totalRedFlags: number;
  globalRiskScore: number; // 0-100
  agentCompliance: Record<string, {
    status: 'COMPLIANT' | 'BREACH' | 'SERIOUS_BREACH';
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    redFlag: boolean;
    lastAssessmentDate?: string;
  }>;
  remediationActions: RemediationAction[];
  createdAt: string;
  updatedAt: string;
  lastUpdated?: string;
}

export interface ComplianceTrend {
  date: string;
  complianceRate: number;
  totalWorkers: number;
  breaches: number;
  seriousBreaches: number;
}

export interface MasterComplianceFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  complianceStatus?: 'COMPLIANT' | 'BREACH' | 'SERIOUS_BREACH';
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  agentType?: string;
  hasRedFlags?: boolean;
}

export interface MasterComplianceMetrics {
  summary: MasterComplianceSummary;
  agentSummaries: AgentComplianceSummary[];
  statusDistribution: ComplianceStatusDistribution;
  riskDistribution: RiskLevelDistribution;
  topAgents: AgentComplianceSummary[];
  recentTrends: ComplianceTrend[];
}

export interface MasterComplianceChartData {
  pieChartData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  barChartData: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  trendData: Array<{
    date: string;
    value: number;
    label: string;
  }>;
}

export interface MasterComplianceTableData {
  workers: MasterComplianceWorker[];
  totalCount: number;
  filteredCount: number;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Remediation Action Types
export interface RemediationAction {
  id: string;
  userId: string;
  workerId: string;
  agentType: string;
  actionSummary: string;
  detailedNotes?: string;
  status: 'Open' | 'In Progress' | 'Completed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateRemediationActionRequest {
  workerId: string;
  agentType: string;
  actionSummary: string;
  detailedNotes?: string;
}

export interface UpdateRemediationActionRequest {
  actionSummary?: string;
  detailedNotes?: string;
  status?: 'Open' | 'In Progress' | 'Completed';
}

// Alert Types
export interface Alert {
  id: string;
  userId: string;
  workerId?: string;
  agentType: string;
  alertMessage: string;
  status: 'Unread' | 'Read' | 'Dismissed';
  createdAt: string;
  compliance_workers?: {
    name: string;
    job_title: string;
    cos_reference: string;
  };
}

export interface CreateAlertRequest {
  workerId?: string;
  agentType: string;
  alertMessage: string;
}

// Global Risk Score Types
export interface GlobalRiskScore {
  workerId: string;
  score: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  factors: {
    agentRiskLevels: Record<string, 'LOW' | 'MEDIUM' | 'HIGH'>;
    seriousBreaches: number;
    totalBreaches: number;
    redFlags: number;
  };
} 