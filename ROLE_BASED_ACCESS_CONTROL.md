# Role-Based Access Control (RBAC) System

## Overview

The Role-Based Access Control (RBAC) system provides granular permissions and role management for the multi-tenant compliance platform. It ensures that users can only access features and data appropriate to their role within their organization.

## Architecture

### Database Schema

#### User Roles Table
```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Manager', 'Auditor', 'Viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);
```

#### Users Table Updates
- Added `role` column for backward compatibility
- Role defaults to 'Viewer' for new users
- First user in a tenant automatically becomes 'Admin'

### Role Hierarchy

1. **Admin** - Full access to all features
2. **Manager** - Can manage workers, assessments, and create reports
3. **Auditor** - View-only access to all data and analytics
4. **Viewer** - Basic read-only access to dashboards

## Role Permissions

### Admin Permissions
- ✅ Manage users and roles
- ✅ Manage tenant settings
- ✅ Manage workers and assessments
- ✅ Create and export reports
- ✅ View audit logs
- ✅ Export data
- ✅ View all dashboards and analytics
- ✅ Manage AI configuration

### Manager Permissions
- ❌ Manage users and roles
- ❌ Manage tenant settings
- ✅ Manage workers and assessments
- ✅ Create and export reports
- ✅ View audit logs
- ✅ Export data
- ✅ View all dashboards and analytics
- ❌ Manage AI configuration

### Auditor Permissions
- ❌ Manage users and roles
- ❌ Manage tenant settings
- ❌ Manage workers and assessments
- ❌ Create reports
- ❌ View audit logs
- ❌ Export data
- ✅ View all dashboards and analytics
- ❌ Manage AI configuration

### Viewer Permissions
- ❌ Manage users and roles
- ❌ Manage tenant settings
- ❌ Manage workers and assessments
- ❌ Create reports
- ❌ View audit logs
- ❌ Export data
- ✅ View dashboards
- ❌ View analytics
- ❌ Manage AI configuration

## Implementation

### Backend Services

#### RBAC Service (`src/lib/rbac-service.ts`)
```typescript
// Core RBAC functions
export async function getCurrentUserRole(): Promise<UserRoleType | null>
export async function getCurrentUserPermissions(): Promise<RolePermissions | null>
export async function hasPermission(permission: keyof RolePermissions): Promise<boolean>
export async function hasRole(minimumRole: UserRoleType): Promise<boolean>
export async function getTenantUsersWithRoles(): Promise<TenantUser[]>
export async function assignUserRole(userId: string, role: UserRoleType): Promise<void>
```

#### API Routes
- `GET /api/rbac/current-role` - Get current user's role
- `GET /api/rbac/permissions` - Get current user's permissions
- `POST /api/rbac/check-permission` - Check specific permission
- `POST /api/rbac/check-role` - Check role hierarchy
- `GET /api/rbac/users` - Get tenant users with roles
- `POST /api/rbac/users` - Assign user role
- `DELETE /api/rbac/users` - Remove user role

### Frontend Components

#### Role-Based Access Component (`src/components/RoleBasedAccess.tsx`)
```typescript
// Main RBAC wrapper
<RoleBasedAccess requiredPermission="can_manage_users">
  <AdminOnlyContent />
</RoleBasedAccess>

// Specific permission components
<CanManageUsers>
  <UserManagementContent />
</CanManageUsers>

<ManagerOrHigher>
  <ManagerContent />
</ManagerOrHigher>
```

#### User Management Page (`src/app/admin/users/page.tsx`)
- Admin-only page for managing user roles
- View all users in tenant with their roles
- Assign/change user roles
- Remove user roles (sets to Viewer)

### Database Functions

#### Permission Checking
```sql
CREATE OR REPLACE FUNCTION public.check_user_permission(
  user_uuid UUID, 
  tenant_uuid UUID, 
  action TEXT
) RETURNS BOOLEAN
```

#### User Role Management
```sql
CREATE OR REPLACE FUNCTION public.get_user_role(
  user_uuid UUID, 
  tenant_uuid UUID
) RETURNS TEXT

CREATE OR REPLACE FUNCTION public.user_has_role(
  user_uuid UUID, 
  tenant_uuid UUID, 
  required_role TEXT
) RETURNS BOOLEAN
```

#### Tenant User Listing
```sql
CREATE OR REPLACE FUNCTION public.get_tenant_users_with_roles(
  tenant_uuid UUID
) RETURNS TABLE (...)
```

## Row Level Security (RLS) Policies

### Role-Based RLS
All compliance tables now use role-based RLS policies that check user permissions:

```sql
-- Example: Compliance Workers
CREATE POLICY "Role-based access to compliance workers" ON public.compliance_workers
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()) AND
    public.check_user_permission(auth.uid(), tenant_id, 'view_workers')
  );
```

### Policy Actions
- **SELECT**: Check `view_*` permissions
- **INSERT**: Check `manage_*` permissions
- **UPDATE**: Check `manage_*` permissions
- **DELETE**: Check `manage_*` permissions

## Authentication Integration

### NextAuth Session
```typescript
// Session includes role information
interface Session {
  user: {
    id: string;
    tenant_id: string;
    company: string;
    role?: 'Admin' | 'Manager' | 'Auditor' | 'Viewer';
  }
}
```

### Signup Process
1. First user in a tenant becomes 'Admin'
2. Subsequent users become 'Viewer' by default
3. User role record created in `user_roles` table
4. Role included in session and JWT

## UI Integration

### Header Component
- Displays user role badge with color coding
- Admin-only navigation links
- Role-based menu items

### Navigation Guards
- Route-level permission checks
- Component-level access control
- Graceful fallbacks for unauthorized access

## Usage Examples

### Backend Permission Checks
```typescript
// In API routes
import { hasPermission, hasRole } from '@/lib/rbac-service';

export async function POST(request: NextRequest) {
  // Check specific permission
  if (!(await hasPermission('can_manage_workers'))) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  
  // Check role hierarchy
  if (!(await hasRole('Manager'))) {
    return NextResponse.json({ error: 'Manager or higher required' }, { status: 403 });
  }
}
```

### Frontend Permission Checks
```typescript
// In React components
import { CanManageUsers, AdminOnly } from '@/components/RoleBasedAccess';

function MyComponent() {
  return (
    <div>
      <CanManageUsers>
        <UserManagementSection />
      </CanManageUsers>
      
      <AdminOnly>
        <AdminOnlySection />
      </AdminOnly>
    </div>
  );
}
```

### Client-Side Permission Checks
```typescript
// Using the RBAC hook
import { useRoleCheck } from '@/lib/rbac-service';

function MyComponent() {
  const { hasPermission, hasRole } = useRoleCheck();
  
  const handleAction = async () => {
    if (await hasPermission('can_manage_workers')) {
      // Perform action
    }
  };
}
```

## Security Features

### Multi-Tenant Isolation
- All role checks include tenant context
- Users can only manage roles within their tenant
- Cross-tenant access prevention

### Audit Logging
- All role changes are logged
- Includes old and new values
- Tracks who made the change

### Role Hierarchy Enforcement
- Database-level role validation
- Application-level permission checks
- UI-level access control

## Migration Guide

### Database Migration
1. Run `user-roles-migration.sql`
2. Existing users get 'Viewer' role by default
3. First user in each tenant becomes 'Admin'

### Application Updates
1. Update authentication configuration
2. Add role-based components
3. Update API routes with permission checks
4. Test all role combinations

## Testing

### Role Testing Matrix
| Role | Admin | Manager | Auditor | Viewer |
|------|-------|---------|---------|--------|
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| Manage Workers | ✅ | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ❌ |
| View Dashboards | ✅ | ✅ | ✅ | ✅ |

### Test Scenarios
1. **Admin Access**: Full access to all features
2. **Manager Access**: Can manage workers but not users
3. **Auditor Access**: View-only access to data
4. **Viewer Access**: Limited dashboard access
5. **Cross-Tenant**: No access to other tenant data
6. **Role Changes**: Proper permission updates

## Troubleshooting

### Common Issues

#### Role Not Showing
- Check if user_roles record exists
- Verify session includes role information
- Check database triggers

#### Permission Denied
- Verify user has correct role
- Check RLS policies are active
- Confirm tenant context is correct

#### Role Assignment Fails
- Ensure user is in same tenant
- Check admin permissions
- Verify database constraints

### Debug Commands
```sql
-- Check user role
SELECT * FROM user_roles WHERE user_id = 'user-uuid';

-- Check permissions
SELECT public.check_user_permission('user-uuid', 'tenant-uuid', 'manage_workers');

-- List tenant users
SELECT * FROM public.get_tenant_users_with_roles('tenant-uuid');
```

## Future Enhancements

### Planned Features
1. **Custom Roles**: Tenant-specific role definitions
2. **Permission Groups**: Group permissions for easier management
3. **Temporary Permissions**: Time-limited elevated access
4. **Approval Workflows**: Multi-step permission requests
5. **Role Templates**: Predefined role configurations

### Integration Points
1. **SSO Integration**: Role mapping from external systems
2. **API Rate Limiting**: Role-based rate limits
3. **Audit Trail**: Enhanced logging and reporting
4. **Notification System**: Role change notifications

## Best Practices

### Security
1. Always check permissions on both frontend and backend
2. Use principle of least privilege
3. Regular role audits
4. Monitor for suspicious permission changes

### Performance
1. Cache role information in session
2. Use database indexes on role columns
3. Minimize permission checks in loops
4. Batch role assignments when possible

### Maintenance
1. Regular role cleanup for inactive users
2. Monitor role distribution across tenants
3. Review and update permission matrices
4. Document custom role configurations 