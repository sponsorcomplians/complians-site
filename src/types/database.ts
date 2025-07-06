export interface Product {
  id: string
  title: string
  description: string
  price: number
  slug: string
  thumbnail_url?: string | null
  video_url?: string | null
  is_active: boolean
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name?: string | null
  created_at: string
}

// Tenant interface
export interface Tenant {
  id: string
  name: string
  industry?: string | null
  max_workers: number
  subscription_plan: string
  settings: TenantSettings
  stripe_customer_id?: string | null
  subscription_status: string
  created_at: string
  updated_at: string
}

// Tenant settings interface with AI configuration
export interface TenantSettings {
  ai_tone?: 'strict' | 'moderate' | 'lenient'
  risk_tolerance?: 'low' | 'medium' | 'high'
  narrative_style?: 'formal' | 'professional' | 'conversational'
  compliance_strictness?: 'high' | 'medium' | 'low'
  custom_prompts?: {
    assessment_intro?: string
    risk_analysis?: string
    recommendations?: string
  }
  notification_preferences?: {
    email_alerts?: boolean
    dashboard_notifications?: boolean
    weekly_reports?: boolean
  }
  [key: string]: any // Allow for additional settings
}

// User role interface
export interface UserRole {
  id: string
  user_id: string
  tenant_id: string
  role: 'Admin' | 'Manager' | 'Auditor' | 'Viewer'
  created_at: string
  updated_at: string
}

// User permissions interface
export interface UserPermissions {
  role: 'Admin' | 'Manager' | 'Auditor' | 'Viewer'
  can_manage_users: boolean
  can_manage_workers: boolean
  can_manage_assessments: boolean
  can_create_reports: boolean
  can_view_audit_logs: boolean
  can_export_data: boolean
  can_manage_tenant_settings: boolean
}

// Multi-tenant user interface
export interface User {
  id: string
  email: string
  full_name?: string | null
  company: string
  phone?: string | null
  tenant_id: string
  role?: 'Admin' | 'Manager' | 'Auditor' | 'Viewer' | null
  is_email_verified: boolean
  created_at: string
  updated_at: string
}

// Multi-tenant compliance interfaces
export interface ComplianceWorker {
  id: string
  user_id: string
  tenant_id: string
  agent_type: string
  name: string
  job_title: string
  soc_code: string
  cos_reference: string
  compliance_status: 'COMPLIANT' | 'BREACH' | 'SERIOUS_BREACH'
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
  red_flag: boolean
  global_risk_score: number
  assignment_date: string
  last_assessment_date?: string | null
  created_at: string
  updated_at: string
}

export interface ComplianceAssessment {
  id: string
  user_id: string
  tenant_id: string
  worker_id: string
  agent_type: string
  worker_name: string
  cos_reference: string
  job_title: string
  soc_code: string
  compliance_status: 'COMPLIANT' | 'BREACH' | 'SERIOUS_BREACH'
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
  evidence_status: string
  breach_type?: string | null
  red_flag: boolean
  assignment_date: string
  professional_assessment: string
  generated_at: string
}

export interface ComplianceReport {
  id: string
  user_id: string
  tenant_id: string
  assessment_id: string
  agent_type: string
  report_type: 'pdf' | 'email' | 'print'
  report_content?: string | null
  file_path?: string | null
  downloaded_at?: string | null
  created_at: string
}

export interface RemediationAction {
  id: string
  user_id: string
  tenant_id: string
  worker_id: string
  agent_type: string
  action_summary: string
  detailed_notes?: string | null
  status: 'Open' | 'In Progress' | 'Completed'
  created_at: string
  updated_at: string
}

export interface Alert {
  id: string
  user_id: string
  tenant_id: string
  worker_id?: string | null
  agent_type: string
  alert_message: string
  status: 'Unread' | 'Read' | 'Dismissed'
  created_at: string
}

// Document management interfaces
export interface Document {
  id: string
  tenant_id: string
  user_id: string
  worker_id?: string | null
  document_type: string
  file_name: string
  file_path: string
  file_size?: number | null
  mime_type?: string | null
  uploaded_at: string
  created_at: string
}

// Training records interface
export interface TrainingRecord {
  id: string
  tenant_id: string
  user_id: string
  worker_id?: string | null
  training_type: string
  training_date: string
  expiry_date?: string | null
  certificate_number?: string | null
  status: 'active' | 'expired' | 'pending'
  notes?: string | null
  created_at: string
  updated_at: string
}

// Notes interface
export interface Note {
  id: string
  tenant_id: string
  user_id: string
  worker_id?: string | null
  assessment_id?: string | null
  note_type: string
  title: string
  content: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  is_private: boolean
  created_at: string
  updated_at: string
}

// Audit log interface
export interface AuditLog {
  id: string
  tenant_id: string
  user_id: string
  action: string
  details: any
  ip_address?: string
  user_agent?: string
  resource_type?: string
  resource_id?: string
  old_values?: any
  new_values?: any
  timestamp: string
  user_email?: string
  user_name?: string
}

// Audit log summary interface
export interface AuditSummary {
  action: string
  count: number
  last_occurrence: string
}

// Audit log filters interface
export interface AuditLogFilters {
  action?: string
  user_id?: string
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

// Audit action types
export type AuditAction = 
  | 'worker_created'
  | 'worker_updated'
  | 'worker_deleted'
  | 'document_uploaded'
  | 'assessment_run'
  | 'narrative_generated'
  | 'user_role_assigned'
  | 'user_role_changed'
  | 'user_role_removed'
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_canceled'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'login_success'
  | 'login_failed'
  | 'password_changed'
  | 'settings_updated'
  | 'signup_success'
  | 'signup_failed'
  | 'email_verification_sent'
  | 'email_verification_completed'
  | 'password_reset_requested'
  | 'password_reset_completed';

// Worker interface (if workers table exists)
export interface Worker {
  id: string
  tenant_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string | null
  date_of_birth?: string | null
  nationality?: string | null
  passport_number?: string | null
  visa_expiry?: string | null
  role?: string | null
  start_date?: string | null
  department?: string | null
  address?: string | null
  salary?: string | null
  cos_number?: string | null
  passport_expiry?: string | null
  visa_status?: string | null
  compliance_status?: string | null
  compliance_score?: number | null
  is_active?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

// Tenant usage metrics interface
export interface TenantUsageMetrics {
  id: string
  tenant_id: string
  date: string
  documents_uploaded: number
  assessments_run: number
  narratives_generated: number
  compliance_reports_generated: number
  workers_added: number
  alerts_created: number
  remediation_actions_created: number
  created_at: string
  updated_at: string
}

// Tenant metrics summary interface
export interface TenantMetricsSummary {
  total_documents_uploaded: number
  total_assessments_run: number
  total_narratives_generated: number
  total_compliance_reports_generated: number
  total_workers_added: number
  total_alerts_created: number
  total_remediation_actions_created: number
  avg_daily_documents: number
  avg_daily_assessments: number
  avg_daily_narratives: number
  avg_daily_reports: number
}

// Compliance trends interface
export interface ComplianceTrends {
  date: string
  compliant_count: number
  breach_count: number
  serious_breach_count: number
  total_workers: number
}

// Breach breakdown interface
export interface BreachBreakdown {
  breach_type: string
  breach_count: number
  serious_breach_count: number
  total_count: number
}

// Top performing tenant interface
export interface TopPerformingTenant {
  tenant_id: string
  company_name: string
  total_assessments: number
  total_reports: number
  avg_compliance_score: number
  total_workers: number
}

// Billing plan interface
export interface BillingPlan {
  id: string
  plan_name: string
  stripe_price_id: string | null
  monthly_price: number
  yearly_price: number
  plan_limits: {
    workers: number
    assessments_per_month: number
    reports_per_month: number
    narratives_per_month: number
  }
  features: {
    ai_agents: string[]
    support: string
    analytics: boolean
    priority_support?: boolean
    custom_integrations?: boolean
    sla?: boolean
  }
  is_active: boolean
  created_at: string
  updated_at: string
}

// Usage billing interface
export interface UsageBilling {
  id: string
  tenant_id: string
  billing_period_start: string
  billing_period_end: string
  metric_type: 'workers' | 'assessments' | 'reports' | 'narratives'
  usage_count: number
  plan_limit: number
  overage_count: number
  overage_rate: number
  overage_amount: number
  stripe_invoice_id: string | null
  is_paid: boolean
  created_at: string
  updated_at: string
}

// Billing event interface
export interface BillingEvent {
  id: string
  tenant_id: string
  event_type: 'subscription_created' | 'subscription_updated' | 'subscription_canceled' | 'payment_succeeded' | 'payment_failed' | 'usage_recorded' | 'overage_charged'
  stripe_event_id: string | null
  event_data: any
  created_at: string
}

// Tenant usage interface
export interface TenantUsage {
  metric_type: string
  usage_count: number
  plan_limit: number
  overage_count: number
  overage_amount: number
}

// Billing summary interface
export interface BillingSummary {
  current_plan: string
  subscription_status: string
  next_billing_date: string | null
  current_period_usage: {
    [key: string]: {
      usage_count: number
      plan_limit: number
      overage_count: number
    }
  }
  total_overage_amount: number
  plan_limits: {
    workers: number
    assessments_per_month: number
    reports_per_month: number
    narratives_per_month: number
  }
}

// Stripe customer interface
export interface StripeCustomer {
  id: string
  email: string
  name: string | null
  metadata: {
    tenant_id: string
  }
}

// Stripe subscription interface
export interface StripeSubscription {
  id: string
  customer: string
  status: string
  current_period_start: number
  current_period_end: number
  items: {
    data: Array<{
      id: string
      price: {
        id: string
        unit_amount: number
        currency: string
      }
    }>
  }
}

// Stripe invoice interface
export interface StripeInvoice {
  id: string
  customer: string
  subscription: string | null
  amount_due: number
  amount_paid: number
  status: string
  created: number
  due_date: number | null
}