import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-config';
import { Tenant, TenantSettings, User, ComplianceWorker, ComplianceAssessment, ComplianceReport, RemediationAction, Alert, Document, TrainingRecord, Note, AuditLog, Worker } from '@/types/database';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface TenantContext {
  tenant_id: string;
  user_id: string;
  company: string;
  tenant?: Tenant;
}

/**
 * Get the current user's tenant context from session
 */
export async function getTenantContext(): Promise<TenantContext | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.tenant_id || !session?.user?.company) {
      return null;
    }

    return {
      tenant_id: session.user.tenant_id,
      user_id: session.user.id,
      company: session.user.company
    };
  } catch (error) {
    console.error('Error getting tenant context:', error);
    return null;
  }
}

/**
 * Get the current user's full tenant information
 */
export async function getCurrentTenant(): Promise<Tenant | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_current_user_tenant')
      .single();

    if (error) {
      console.error('Error getting current tenant:', error);
      return null;
    }

    return data as Tenant;
  } catch (error) {
    console.error('Error getting current tenant:', error);
    return null;
  }
}

/**
 * Create a tenant-filtered Supabase query builder
 */
export function createTenantQuery(table: string, tenantContext: TenantContext) {
  return supabase
    .from(table)
    .eq('tenant_id', tenantContext.tenant_id);
}

/**
 * Get all compliance workers for the current tenant
 */
export async function getTenantComplianceWorkers(agentType?: string): Promise<ComplianceWorker[]> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  let query = createTenantQuery('compliance_workers', tenantContext);
  
  if (agentType) {
    query = query.eq('agent_type', agentType);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get all compliance assessments for the current tenant
 */
export async function getTenantComplianceAssessments(agentType?: string): Promise<ComplianceAssessment[]> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  let query = createTenantQuery('compliance_assessments', tenantContext);
  
  if (agentType) {
    query = query.eq('agent_type', agentType);
  }

  const { data, error } = await query
    .order('generated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get all compliance reports for the current tenant
 */
export async function getTenantComplianceReports(agentType?: string): Promise<ComplianceReport[]> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  let query = createTenantQuery('compliance_reports', tenantContext);
  
  if (agentType) {
    query = query.eq('agent_type', agentType);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get all remediation actions for the current tenant
 */
export async function getTenantRemediationActions(status?: string): Promise<RemediationAction[]> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  let query = createTenantQuery('remediation_actions', tenantContext);
  
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get all alerts for the current tenant
 */
export async function getTenantAlerts(status?: string): Promise<Alert[]> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  let query = createTenantQuery('alerts', tenantContext);
  
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get all documents for the current tenant
 */
export async function getTenantDocuments(workerId?: string): Promise<Document[]> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  let query = createTenantQuery('documents', tenantContext);
  
  if (workerId) {
    query = query.eq('worker_id', workerId);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get all training records for the current tenant
 */
export async function getTenantTrainingRecords(workerId?: string): Promise<TrainingRecord[]> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  let query = createTenantQuery('training_records', tenantContext);
  
  if (workerId) {
    query = query.eq('worker_id', workerId);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get all notes for the current tenant
 */
export async function getTenantNotes(workerId?: string, assessmentId?: string): Promise<Note[]> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  let query = createTenantQuery('notes', tenantContext);
  
  if (workerId) {
    query = query.eq('worker_id', workerId);
  }
  
  if (assessmentId) {
    query = query.eq('assessment_id', assessmentId);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get all workers for the current tenant
 */
export async function getTenantWorkers(): Promise<Worker[]> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  const { data, error } = await createTenantQuery('workers', tenantContext)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get audit logs for the current tenant
 */
export async function getTenantAuditLogs(limit: number = 100): Promise<AuditLog[]> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  const { data, error } = await createTenantQuery('audit_logs', tenantContext)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data || [];
}

// CREATE operations

/**
 * Create a new compliance worker with tenant context
 */
export async function createTenantComplianceWorker(workerData: Partial<ComplianceWorker>): Promise<ComplianceWorker> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  const { data, error } = await supabase
    .from('compliance_workers')
    .insert({
      ...workerData,
      user_id: tenantContext.user_id,
      tenant_id: tenantContext.tenant_id
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Create a new compliance assessment with tenant context
 */
export async function createTenantComplianceAssessment(assessmentData: Partial<ComplianceAssessment>): Promise<ComplianceAssessment> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  const { data, error } = await supabase
    .from('compliance_assessments')
    .insert({
      ...assessmentData,
      user_id: tenantContext.user_id,
      tenant_id: tenantContext.tenant_id
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Create a new remediation action with tenant context
 */
export async function createTenantRemediationAction(actionData: Partial<RemediationAction>): Promise<RemediationAction> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  const { data, error } = await supabase
    .from('remediation_actions')
    .insert({
      ...actionData,
      user_id: tenantContext.user_id,
      tenant_id: tenantContext.tenant_id
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Create a new alert with tenant context
 */
export async function createTenantAlert(alertData: Partial<Alert>): Promise<Alert> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  const { data, error } = await supabase
    .from('alerts')
    .insert({
      ...alertData,
      user_id: tenantContext.user_id,
      tenant_id: tenantContext.tenant_id
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Create a new document with tenant context
 */
export async function createTenantDocument(documentData: Partial<Document>): Promise<Document> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  const { data, error } = await supabase
    .from('documents')
    .insert({
      ...documentData,
      user_id: tenantContext.user_id,
      tenant_id: tenantContext.tenant_id
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Create a new training record with tenant context
 */
export async function createTenantTrainingRecord(trainingData: Partial<TrainingRecord>): Promise<TrainingRecord> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  const { data, error } = await supabase
    .from('training_records')
    .insert({
      ...trainingData,
      user_id: tenantContext.user_id,
      tenant_id: tenantContext.tenant_id
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Create a new note with tenant context
 */
export async function createTenantNote(noteData: Partial<Note>): Promise<Note> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  const { data, error } = await supabase
    .from('notes')
    .insert({
      ...noteData,
      user_id: tenantContext.user_id,
      tenant_id: tenantContext.tenant_id
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Create a new worker with tenant context
 */
export async function createTenantWorker(workerData: Partial<Worker>): Promise<Worker> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  const { data, error } = await supabase
    .from('workers')
    .insert({
      ...workerData,
      tenant_id: tenantContext.tenant_id
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get tenant statistics
 */
export async function getTenantStats() {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  const [
    workersResult,
    assessmentsResult,
    reportsResult,
    remediationResult,
    alertsResult,
    documentsResult,
    trainingResult,
    notesResult
  ] = await Promise.all([
    supabase
      .from('compliance_workers')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantContext.tenant_id),
    supabase
      .from('compliance_assessments')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantContext.tenant_id),
    supabase
      .from('compliance_reports')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantContext.tenant_id),
    supabase
      .from('remediation_actions')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantContext.tenant_id),
    supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantContext.tenant_id),
    supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantContext.tenant_id),
    supabase
      .from('training_records')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantContext.tenant_id),
    supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantContext.tenant_id)
  ]);

  return {
    total_workers: workersResult.count || 0,
    total_assessments: assessmentsResult.count || 0,
    total_reports: reportsResult.count || 0,
    total_remediation_actions: remediationResult.count || 0,
    total_alerts: alertsResult.count || 0,
    total_documents: documentsResult.count || 0,
    total_training_records: trainingResult.count || 0,
    total_notes: notesResult.count || 0,
    company: tenantContext.company
  };
}

/**
 * Check if user has permission to access a specific resource
 */
export async function checkTenantPermission(resourceTenantId: string): Promise<boolean> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    return false;
  }
  
  return tenantContext.tenant_id === resourceTenantId;
}

/**
 * Get users in the current tenant
 */
export async function getTenantUsers(): Promise<User[]> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  const { data, error } = await createTenantQuery('users', tenantContext)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get tenant AI configuration settings
 */
export async function getTenantAIConfig(): Promise<TenantSettings> {
  try {
    const tenant = await getCurrentTenant();
    if (!tenant) {
      // Return default settings if no tenant found
      return getDefaultAISettings();
    }
    
    return tenant.settings || getDefaultAISettings();
  } catch (error) {
    console.error('Error getting tenant AI config:', error);
    return getDefaultAISettings();
  }
}

/**
 * Update tenant AI configuration settings
 */
export async function updateTenantAIConfig(settings: Partial<TenantSettings>): Promise<TenantSettings> {
  const tenantContext = await getTenantContext();
  if (!tenantContext) {
    throw new Error('No tenant context available');
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get current settings
  const currentSettings = await getTenantAIConfig();
  
  // Merge with new settings
  const updatedSettings = {
    ...currentSettings,
    ...settings
  };

  const { data, error } = await supabase
    .from('tenants')
    .update({ 
      settings: updatedSettings,
      updated_at: new Date().toISOString()
    })
    .eq('id', tenantContext.tenant_id)
    .select('settings')
    .single();

  if (error) {
    throw error;
  }

  return data.settings;
}

/**
 * Get default AI settings
 */
export function getDefaultAISettings(): TenantSettings {
  return {
    ai_tone: 'strict',
    risk_tolerance: 'low',
    narrative_style: 'formal',
    compliance_strictness: 'high',
    custom_prompts: {
      assessment_intro: '',
      risk_analysis: '',
      recommendations: ''
    },
    notification_preferences: {
      email_alerts: true,
      dashboard_notifications: true,
      weekly_reports: false
    }
  };
}

/**
 * Generate AI prompt based on tenant settings
 */
export function generateAIPrompt(
  basePrompt: string,
  assessmentData: any,
  aiConfig: TenantSettings
): string {
  const toneInstructions = getToneInstructions(aiConfig.ai_tone);
  const styleInstructions = getStyleInstructions(aiConfig.narrative_style);
  const strictnessInstructions = getStrictnessInstructions(aiConfig.compliance_strictness);
  const riskInstructions = getRiskInstructions(aiConfig.risk_tolerance);

  return `
${basePrompt}

## AI Configuration Instructions:
${toneInstructions}
${styleInstructions}
${strictnessInstructions}
${riskInstructions}

## Assessment Data:
${JSON.stringify(assessmentData, null, 2)}

## Custom Prompts (if configured):
${aiConfig.custom_prompts?.assessment_intro ? `Assessment Introduction: ${aiConfig.custom_prompts.assessment_intro}` : ''}
${aiConfig.custom_prompts?.risk_analysis ? `Risk Analysis: ${aiConfig.custom_prompts.risk_analysis}` : ''}
${aiConfig.custom_prompts?.recommendations ? `Recommendations: ${aiConfig.custom_prompts.recommendations}` : ''}

Please generate a compliance assessment narrative following the above configuration guidelines.
  `.trim();
}

/**
 * Get tone-specific instructions
 */
function getToneInstructions(tone: string = 'strict'): string {
  switch (tone) {
    case 'strict':
      return 'Tone: Use a strict, authoritative tone. Emphasize compliance requirements and potential consequences of non-compliance.';
    case 'moderate':
      return 'Tone: Use a balanced, professional tone. Present both compliance requirements and practical considerations.';
    case 'lenient':
      return 'Tone: Use a supportive, educational tone. Focus on guidance and improvement opportunities.';
    default:
      return 'Tone: Use a professional, authoritative tone.';
  }
}

/**
 * Get style-specific instructions
 */
function getStyleInstructions(style: string = 'formal'): string {
  switch (style) {
    case 'formal':
      return 'Style: Use formal, legal-style language. Include specific regulatory references and technical terminology.';
    case 'professional':
      return 'Style: Use professional business language. Balance technical accuracy with accessibility.';
    case 'conversational':
      return 'Style: Use clear, conversational language. Avoid excessive jargon and focus on practical understanding.';
    default:
      return 'Style: Use professional, clear language.';
  }
}

/**
 * Get strictness-specific instructions
 */
function getStrictnessInstructions(strictness: string = 'high'): string {
  switch (strictness) {
    case 'high':
      return 'Compliance Strictness: Apply the highest standards of compliance interpretation. Flag any potential issues, even minor ones.';
    case 'medium':
      return 'Compliance Strictness: Apply standard compliance interpretation. Focus on significant issues while noting minor concerns.';
    case 'low':
      return 'Compliance Strictness: Apply practical compliance interpretation. Focus on major issues and provide constructive guidance.';
    default:
      return 'Compliance Strictness: Apply standard compliance interpretation.';
  }
}

/**
 * Get risk tolerance instructions
 */
function getRiskInstructions(riskTolerance: string = 'low'): string {
  switch (riskTolerance) {
    case 'low':
      return 'Risk Assessment: Be conservative in risk assessment. Identify and highlight all potential risks, even those with low probability.';
    case 'medium':
      return 'Risk Assessment: Use balanced risk assessment. Focus on moderate to high probability risks with significant impact.';
    case 'high':
      return 'Risk Assessment: Be pragmatic in risk assessment. Focus on high probability risks with significant impact.';
    default:
      return 'Risk Assessment: Use standard risk assessment criteria.';
  }
}

/**
 * Get tenant-specific compliance thresholds
 */
export function getComplianceThresholds(aiConfig: TenantSettings) {
  const strictness = aiConfig.compliance_strictness || 'high';
  const riskTolerance = aiConfig.risk_tolerance || 'low';

  const thresholds = {
    risk_score_threshold: strictness === 'high' ? 0.3 : strictness === 'medium' ? 0.5 : 0.7,
    compliance_score_threshold: strictness === 'high' ? 0.8 : strictness === 'medium' ? 0.7 : 0.6,
    alert_threshold: riskTolerance === 'low' ? 0.4 : riskTolerance === 'medium' ? 0.6 : 0.8,
    remediation_threshold: strictness === 'high' ? 0.6 : strictness === 'medium' ? 0.7 : 0.8
  };

  return thresholds;
}

/**
 * Apply tenant AI settings to assessment results
 */
export function applyTenantAISettings(
  assessmentData: any,
  aiConfig: TenantSettings
): any {
  const thresholds = getComplianceThresholds(aiConfig);
  
  // Adjust risk levels based on tenant settings
  if (assessmentData.risk_score !== undefined) {
    const originalRiskLevel = assessmentData.risk_level;
    
    // Adjust risk level based on risk tolerance
    if (aiConfig.risk_tolerance === 'low' && assessmentData.risk_score > thresholds.risk_score_threshold) {
      assessmentData.risk_level = 'HIGH';
    } else if (aiConfig.risk_tolerance === 'high' && assessmentData.risk_score < thresholds.risk_score_threshold) {
      assessmentData.risk_level = 'LOW';
    }
    
    // Log if risk level was adjusted
    if (originalRiskLevel !== assessmentData.risk_level) {
      console.log(`Risk level adjusted from ${originalRiskLevel} to ${assessmentData.risk_level} based on tenant settings`);
    }
  }

  // Adjust compliance status based on strictness
  if (assessmentData.compliance_score !== undefined) {
    const originalStatus = assessmentData.compliance_status;
    
    if (aiConfig.compliance_strictness === 'high' && assessmentData.compliance_score < thresholds.compliance_score_threshold) {
      assessmentData.compliance_status = 'BREACH';
    } else if (aiConfig.compliance_strictness === 'low' && assessmentData.compliance_score > thresholds.compliance_score_threshold) {
      assessmentData.compliance_status = 'COMPLIANT';
    }
    
    if (originalStatus !== assessmentData.compliance_status) {
      console.log(`Compliance status adjusted from ${originalStatus} to ${assessmentData.compliance_status} based on tenant settings`);
    }
  }

  return assessmentData;
} 