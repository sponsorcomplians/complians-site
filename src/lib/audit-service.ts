import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-config';
import { headers } from 'next/headers';
import {
  AuditLog,
  AuditSummary,
  AuditLogFilters,
  AuditAction
} from '@/types/database';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Get client IP address from request headers
 */
export function getClientIP(headersList?: Headers): string | null {
  if (!headersList) return null;
  
  // Check various headers for IP address
  const forwarded = headersList.get('x-forwarded-for');
  const realIP = headersList.get('x-real-ip');
  const cfConnectingIP = headersList.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return null;
}

/**
 * Log a successful login attempt
 */
export async function logLoginSuccess(
  email: string,
  headersList?: Headers
): Promise<void> {
  try {
    const clientIP = getClientIP(headersList);
    const userAgent = headersList?.get('user-agent') || 'unknown';

    await logAuditEvent(
      'login_success',
      {
        email,
        client_ip: clientIP,
        user_agent: userAgent
      },
      'user',
      email,
      undefined,
      undefined,
      headersList
    );
  } catch (error) {
    console.error('Failed to log login success:', error);
  }
}

/**
 * Log a failed login attempt
 */
export async function logLoginFailure(
  email: string,
  reason: string,
  headersList?: Headers
): Promise<void> {
  try {
    const clientIP = getClientIP(headersList);
    const userAgent = headersList?.get('user-agent') || 'unknown';

    await logAuditEvent(
      'login_failed',
      {
        email,
        reason,
        client_ip: clientIP,
        user_agent: userAgent
      },
      'user',
      email,
      undefined,
      undefined,
      headersList
    );
  } catch (error) {
    console.error('Failed to log login failure:', error);
  }
}

/**
 * Log a password reset request
 */
export async function logPasswordResetRequest(
  email: string,
  headersList?: Headers
): Promise<void> {
  try {
    const clientIP = getClientIP(headersList);

    await logAuditEvent(
      'password_reset_requested',
      {
        email,
        client_ip: clientIP
      },
      'user',
      email,
      undefined,
      undefined,
      headersList
    );
  } catch (error) {
    console.error('Failed to log password reset request:', error);
  }
}

/**
 * Log a password reset completion
 */
export async function logPasswordResetCompleted(
  email: string,
  headersList?: Headers
): Promise<void> {
  try {
    const clientIP = getClientIP(headersList);

    await logAuditEvent(
      'password_reset_completed',
      {
        email,
        client_ip: clientIP
      },
      'user',
      email,
      undefined,
      undefined,
      headersList
    );
  } catch (error) {
    console.error('Failed to log password reset completion:', error);
  }
}

/**
 * Log an email verification sent event
 */
export async function logEmailVerificationSent(
  email: string,
  headersList?: Headers
): Promise<void> {
  try {
    const clientIP = getClientIP(headersList);

    await logAuditEvent(
      'email_verification_sent',
      {
        email,
        client_ip: clientIP
      },
      'user',
      email,
      undefined,
      undefined,
      headersList
    );
  } catch (error) {
    console.error('Failed to log email verification sent:', error);
  }
}

/**
 * Log an email verification completion
 */
export async function logEmailVerificationCompleted(
  email: string,
  headersList?: Headers
): Promise<void> {
  try {
    const clientIP = getClientIP(headersList);

    await logAuditEvent(
      'email_verification_completed',
      {
        email,
        client_ip: clientIP
      },
      'user',
      email,
      undefined,
      undefined,
      headersList
    );
  } catch (error) {
    console.error('Failed to log email verification completion:', error);
  }
}

/**
 * Log a general audit event
 */
export async function logAuditEvent(
  action: AuditAction,
  details: Record<string, any>,
  entityType: 'user' | 'worker' | 'tenant' | 'system',
  entityId: string,
  tenantId?: string,
  previousData?: any,
  newData?: any,
  headersList?: Headers
): Promise<void> {
  try {
    const session = await getServerSession(authOptions);
    const clientIP = getClientIP(headersList);
    const userAgent = headersList?.get('user-agent') || 'unknown';

    const auditLog: Partial<AuditLog> = {
      tenant_id: tenantId || session?.user?.tenant_id,
      user_id: session?.user?.id || 'system',
      action,
      details: {
        ...details,
        client_ip: clientIP,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        entity_type: entityType,
        entity_id: entityId,
        previous_data: previousData,
        new_data: newData
      },
      ip_address: clientIP || undefined,
      user_agent: userAgent
    };

    const { error } = await supabase
      .from('audit_logs')
      .insert(auditLog);

    if (error) {
      console.error('Failed to insert audit log:', error);
    }
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
}

/**
 * Get audit logs with filtering and pagination
 */
export async function getAuditLogs(
  filters: AuditLogFilters = {},
  tenantId?: string
): Promise<{ logs: AuditLog[]; total: number }> {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' });

    // Apply tenant filter
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    // Apply action filter
    if (filters.action) {
      query = query.eq('action', filters.action);
    }

    // Apply user filter
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    // Apply date range filter
    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    // Apply pagination
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Order by created_at descending
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return {
      logs: data || [],
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
}

/**
 * Get audit summary statistics
 */
export async function getAuditSummary(
  tenantId?: string,
  daysBack: number = 30
): Promise<{
  totalEvents: number;
  actionBreakdown: Record<string, number>;
  dailyBreakdown: Record<string, number>;
  period: {
    start: string;
    end: string;
  };
}> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    let query = supabase
      .from('audit_logs')
      .select('action, created_at');

    // Apply tenant filter
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    // Apply date filter
    query = query.gte('created_at', startDate.toISOString());

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const logs = data || [];
    const actionCounts: Record<string, number> = {};
    const dailyCounts: Record<string, number> = {};

    logs.forEach(log => {
      // Count actions
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;

      // Count by day
      const date = new Date(log.created_at).toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    return {
      totalEvents: logs.length,
      actionBreakdown: actionCounts,
      dailyBreakdown: dailyCounts,
      period: {
        start: startDate.toISOString(),
        end: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error fetching audit summary:', error);
    throw error;
  }
}

/**
 * Clean up old audit logs
 */
export async function cleanupOldAuditLogs(
  daysToKeep: number = 90
): Promise<{ deleted: number }> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { data, error } = await supabase
      .from('audit_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select('id');

    if (error) {
      throw error;
    }

    return {
      deleted: data?.length || 0
    };
  } catch (error) {
    console.error('Error cleaning up old audit logs:', error);
    throw error;
  }
} 