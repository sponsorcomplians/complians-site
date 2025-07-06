'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { UserRoleType, RolePermissions } from '@/lib/rbac-service';

interface RoleBasedAccessProps {
  children: ReactNode;
  requiredPermission?: keyof RolePermissions;
  requiredRole?: UserRoleType;
  fallback?: ReactNode;
  showFallback?: boolean;
}

interface PermissionCheckProps {
  children: ReactNode;
  permission: keyof RolePermissions;
  fallback?: ReactNode;
}

interface RoleCheckProps {
  children: ReactNode;
  minimumRole: UserRoleType;
  fallback?: ReactNode;
}

export function RoleBasedAccess({ 
  children, 
  requiredPermission, 
  requiredRole, 
  fallback = null,
  showFallback = false 
}: RoleBasedAccessProps) {
  const { data: session, status } = useSession();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (status === 'loading') return;
      
      if (!session?.user) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      try {
        let access = true;

        if (requiredPermission) {
          const response = await fetch('/api/rbac/check-permission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permission: requiredPermission })
          });
          
          if (!response.ok) {
            access = false;
          } else {
            const result = await response.json();
            access = result.hasPermission;
          }
        }

        if (requiredRole && access) {
          const response = await fetch('/api/rbac/check-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ minimumRole: requiredRole })
          });
          
          if (!response.ok) {
            access = false;
          } else {
            const result = await response.json();
            access = result.hasRole;
          }
        }

        setHasAccess(access);
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [session, status, requiredPermission, requiredRole]);

  if (isLoading) {
    return null; // Don't show anything while loading
  }

  if (!hasAccess) {
    return showFallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

export function PermissionCheck({ children, permission, fallback }: PermissionCheckProps) {
  return (
    <RoleBasedAccess requiredPermission={permission} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function RoleCheck({ children, minimumRole, fallback }: RoleCheckProps) {
  return (
    <RoleBasedAccess requiredRole={minimumRole} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

// Specific permission components for common use cases
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleCheck minimumRole="Admin" fallback={fallback}>
      {children}
    </RoleCheck>
  );
}

export function ManagerOrHigher({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleCheck minimumRole="Manager" fallback={fallback}>
      {children}
    </RoleCheck>
  );
}

export function AuditorOrHigher({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleCheck minimumRole="Auditor" fallback={fallback}>
      {children}
    </RoleCheck>
  );
}

export function CanManageUsers({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionCheck permission="can_manage_users" fallback={fallback}>
      {children}
    </PermissionCheck>
  );
}

export function CanManageWorkers({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionCheck permission="can_manage_workers" fallback={fallback}>
      {children}
    </PermissionCheck>
  );
}

export function CanManageAssessments({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionCheck permission="can_manage_assessments" fallback={fallback}>
      {children}
    </PermissionCheck>
  );
}

export function CanCreateReports({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionCheck permission="can_create_reports" fallback={fallback}>
      {children}
    </PermissionCheck>
  );
}

export function CanViewAuditLogs({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionCheck permission="can_view_audit_logs" fallback={fallback}>
      {children}
    </PermissionCheck>
  );
}

export function CanExportData({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionCheck permission="can_export_data" fallback={fallback}>
      {children}
    </PermissionCheck>
  );
}

export function CanManageTenantSettings({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionCheck permission="can_manage_tenant_settings" fallback={fallback}>
      {children}
    </PermissionCheck>
  );
}

export function CanViewDashboards({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionCheck permission="can_view_dashboards" fallback={fallback}>
      {children}
    </PermissionCheck>
  );
}

export function CanViewAnalytics({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionCheck permission="can_view_analytics" fallback={fallback}>
      {children}
    </PermissionCheck>
  );
} 