import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-config';
import { UserRole, UserPermissions } from '@/types/database';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type UserRoleType = 'Admin' | 'Manager' | 'Auditor' | 'Viewer';

export interface RolePermissions {
  can_manage_users: boolean;
  can_manage_workers: boolean;
  can_manage_assessments: boolean;
  can_create_reports: boolean;
  can_view_audit_logs: boolean;
  can_export_data: boolean;
  can_manage_tenant_settings: boolean;
  can_view_dashboards: boolean;
  can_view_analytics: boolean;
}

// Define role hierarchy and permissions
export const ROLE_PERMISSIONS: Record<UserRoleType, RolePermissions> = {
  Admin: {
    can_manage_users: true,
    can_manage_workers: true,
    can_manage_assessments: true,
    can_create_reports: true,
    can_view_audit_logs: true,
    can_export_data: true,
    can_manage_tenant_settings: true,
    can_view_dashboards: true,
    can_view_analytics: true,
  },
  Manager: {
    can_manage_users: false,
    can_manage_workers: true,
    can_manage_assessments: true,
    can_create_reports: true,
    can_view_audit_logs: true,
    can_export_data: true,
    can_manage_tenant_settings: false,
    can_view_dashboards: true,
    can_view_analytics: true,
  },
  Auditor: {
    can_manage_users: false,
    can_manage_workers: false,
    can_manage_assessments: false,
    can_create_reports: false,
    can_view_audit_logs: false,
    can_export_data: false,
    can_manage_tenant_settings: false,
    can_view_dashboards: true,
    can_view_analytics: true,
  },
  Viewer: {
    can_manage_users: false,
    can_manage_workers: false,
    can_manage_assessments: false,
    can_create_reports: false,
    can_view_audit_logs: false,
    can_export_data: false,
    can_manage_tenant_settings: false,
    can_view_dashboards: true,
    can_view_analytics: false,
  },
};

/**
 * Get the current user's role for their tenant
 */
export async function getCurrentUserRole(): Promise<UserRoleType | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.tenant_id) {
      return null;
    }

    // Use the new database function that handles fallback logic
    const { data, error } = await supabase
      .rpc('get_user_role_with_fallback', {
        user_uuid: session.user.id,
        tenant_uuid: session.user.tenant_id
      });

    if (error) {
      console.error('Error getting user role from database function:', error);
      
      // Fallback to direct query
      const { data: userRole, error: fallbackError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('tenant_id', session.user.tenant_id)
        .single();

      if (fallbackError || !userRole) {
        // Return default role from session or 'Viewer'
        return (session.user.role as UserRoleType) || 'Viewer';
      }

      return userRole.role as UserRoleType;
    }

    return (data as UserRoleType) || 'Viewer';
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Get the current user's permissions
 */
export async function getCurrentUserPermissions(): Promise<RolePermissions | null> {
  const role = await getCurrentUserRole();
  if (!role) return null;
  
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if the current user has a specific permission
 */
export async function hasPermission(permission: keyof RolePermissions): Promise<boolean> {
  const permissions = await getCurrentUserPermissions();
  if (!permissions) return false;
  
  return permissions[permission];
}

/**
 * Check if the current user has a specific role or higher
 */
export async function hasRole(minimumRole: UserRoleType): Promise<boolean> {
  const currentRole = await getCurrentUserRole();
  if (!currentRole) return false;

  const roleHierarchy: UserRoleType[] = ['Viewer', 'Auditor', 'Manager', 'Admin'];
  const currentRoleIndex = roleHierarchy.indexOf(currentRole);
  const minimumRoleIndex = roleHierarchy.indexOf(minimumRole);

  return currentRoleIndex >= minimumRoleIndex;
}

/**
 * Get all users in the current tenant with their roles
 */
export async function getTenantUsersWithRoles(): Promise<Array<{
  user_id: string;
  email: string;
  full_name: string | null;
  role: UserRoleType;
  created_at: string;
}>> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenant_id) {
      throw new Error('No tenant context');
    }

    // Check if user has permission to view users
    if (!(await hasPermission('can_manage_users'))) {
      throw new Error('Insufficient permissions');
    }

    const { data, error } = await supabase
      .rpc('get_tenant_users_with_roles', {
        tenant_uuid: session.user.tenant_id
      });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting tenant users:', error);
    throw error;
  }
}

/**
 * Assign a role to a user in the current tenant
 */
export async function assignUserRole(userId: string, role: UserRoleType): Promise<void> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.tenant_id) {
      throw new Error('No session context');
    }

    // Check if current user has permission to manage users
    if (!(await hasPermission('can_manage_users'))) {
      throw new Error('Insufficient permissions to manage users');
    }

    // Use the new database function for role management
    const { data, error } = await supabase
      .rpc('manage_user_role', {
        target_user_uuid: userId,
        new_role: role,
        current_user_uuid: session.user.id
      });

    if (error) {
      console.error('Error calling manage_user_role function:', error);
      throw new Error(`Failed to assign role: ${error.message}`);
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Failed to assign role');
    }

    console.log('Role assigned successfully:', data);
  } catch (error) {
    console.error('Error assigning user role:', error);
    throw error;
  }
}

/**
 * Remove a user's role (sets to Viewer)
 */
export async function removeUserRole(userId: string): Promise<void> {
  await assignUserRole(userId, 'Viewer');
}

/**
 * Get user permissions summary for the current user
 */
export async function getUserPermissionsSummary(): Promise<UserPermissions | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.tenant_id) {
      return null;
    }

    const { data, error } = await supabase
      .rpc('get_user_permissions_summary', {
        user_uuid: session.user.id,
        tenant_uuid: session.user.tenant_id
      });

    if (error || !data || data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Error getting user permissions summary:', error);
    return null;
  }
}

/**
 * Check if user can perform a specific action
 */
export async function canPerformAction(action: string): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.tenant_id) {
      return false;
    }

    const { data, error } = await supabase
      .rpc('check_user_permission', {
        user_uuid: session.user.id,
        tenant_uuid: session.user.tenant_id,
        action: action
      });

    if (error) {
      console.error('Error checking user permission:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

/**
 * Get role hierarchy for UI display
 */
export function getRoleHierarchy(): Array<{ value: UserRoleType; label: string; description: string }> {
  return [
    {
      value: 'Admin',
      label: 'Administrator',
      description: 'Full access to all features and user management'
    },
    {
      value: 'Manager',
      label: 'Manager',
      description: 'Can manage workers, assessments, and create reports'
    },
    {
      value: 'Auditor',
      label: 'Auditor',
      description: 'Can view all data and analytics, read-only access'
    },
    {
      value: 'Viewer',
      label: 'Viewer',
      description: 'Basic read-only access to dashboards'
    }
  ];
}

/**
 * Client-side role check hook (for use in components)
 */
export function useRoleCheck() {
  return {
    hasPermission: async (permission: keyof RolePermissions) => {
      const response = await fetch('/api/rbac/check-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permission })
      });
      
      if (!response.ok) return false;
      const result = await response.json();
      return result.hasPermission;
    },
    
    hasRole: async (minimumRole: UserRoleType) => {
      const response = await fetch('/api/rbac/check-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minimumRole })
      });
      
      if (!response.ok) return false;
      const result = await response.json();
      return result.hasRole;
    },
    
    getCurrentRole: async () => {
      const response = await fetch('/api/rbac/current-role');
      if (!response.ok) return null;
      const result = await response.json();
      return result.role;
    },
    
    getPermissions: async () => {
      const response = await fetch('/api/rbac/permissions');
      if (!response.ok) return null;
      const result = await response.json();
      return result.permissions;
    }
  };
} 