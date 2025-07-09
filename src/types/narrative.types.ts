// src/types/narrative.types.ts
import { TenantSettings } from './database';

export interface NarrativeInput {
  // Worker information
  workerName: string;
  cosReference: string;
  assignmentDate: string;
  jobTitle: string;
  socCode: string;
  cosDuties: string;
  jobDescriptionDuties: string;
  
  // Decision tree results
  step1Pass: boolean;
  step2Pass: boolean;
  step3Pass: boolean;
  step4Pass: boolean;
  step5Pass: boolean;
  
  // Detailed flags
  hasJobDescription: boolean;
  hasCV: boolean;
  hasReferences: boolean;
  hasContracts: boolean;
  hasPayslips: boolean;
  hasTraining: boolean;
  employmentHistoryConsistent: boolean;
  experienceMatchesDuties: boolean;
  referencesCredible: boolean;
  experienceRecentAndContinuous: boolean;
  
  // Additional context
  inconsistenciesDescription?: string;
  missingDocs: string[];
  isCompliant: boolean;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  
  // Assessment details
  evidenceStatus?: string;
  breachType?: string;
  compliance_score?: number;
  risk_score?: number;
  compliance_status?: 'COMPLIANT' | 'BREACH' | 'SERIOUS_BREACH';

  // Agent type for narrative routing
  agentType?: string;
}

export interface NarrativeAudit {
  id: string;
  timestamp: string;
  input: NarrativeInput;
  output: string;
  model: string;
  promptVersion: string;
  temperature: number;
  duration: number;
  tokenCount: number;
  validationPassed: boolean;
  fallbackUsed: boolean;
  experimentGroup?: string;
  costEstimate?: number;
  cacheHit?: boolean;
  validationScore?: number;
  validationErrors?: string[];
  validationWarnings?: string[];
  
  // Tenant AI configuration
  tenantAIConfig?: TenantSettings;
  customPrompt?: string;
}

export interface ExperimentConfig {
  enabled: boolean;
  percentage: number;
  userGroups?: string[];
  version: string;
}

export interface LegalReference {
  code: string;
  description: string;
  version: string;
  effectiveDate: string;
  category: 'primary' | 'secondary' | 'guidance';
}

export interface DocumentContext {
  present: string;
  missing: string;
  partial?: string;
}

export interface ModelConfig {
  name: string;
  temperature: number;
  maxTokens: number;
  costPer1K: number;
} 