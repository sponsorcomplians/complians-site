'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminOnly, CanManageUsers } from '@/components/RoleBasedAccess';
import { UserRoleType, getRoleHierarchy } from '@/lib/rbac-service';
import { Shield, Users, UserCheck, UserX, AlertTriangle } from 'lucide-react';

interface TenantUser {
  user_id: string;
  email: string;
  full_name: string | null;
  role: UserRoleType;
  created_at: string;
}

export default function UserManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const roleHierarchy = getRoleHierarchy();

  useEffect(() => {
    if (status === 'loading') return;
    
    // if (!session) { /* block or redirect logic */ } // TEMPORARILY DISABLED FOR DEV

    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rbac/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRoleType) => {
    try {
      setUpdatingUser(userId);
      setError(null);
      
      const response = await fetch('/api/rbac/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user role');
      }
      
      setMessage({ type: 'success', text: 'User role updated successfully' });
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Failed to update user role');
    } finally {
      setUpdatingUser(null);
    }
  };

  const removeUserRole = async (userId: string) => {
    try {
      setUpdatingUser(userId);
      setError(null);
      
      const response = await fetch('/api/rbac/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove user role');
      }
      
      setMessage({ type: 'success', text: 'User role removed successfully' });
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error removing user role:', error);
      setError('Failed to remove user role');
    } finally {
      setUpdatingUser(null);
    }
  };

  const getRoleBadgeColor = (role: UserRoleType) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Manager': return 'bg-blue-100 text-blue-800';
      case 'Auditor': return 'bg-yellow-100 text-yellow-800';
      case 'Viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: UserRoleType) => {
    switch (role) {
      case 'Admin': return <Shield className="w-4 h-4" />;
      case 'Manager': return <Users className="w-4 h-4" />;
      case 'Auditor': return <UserCheck className="w-4 h-4" />;
      case 'Viewer': return <UserX className="w-4 h-4" />;
      default: return <UserX className="w-4 h-4" />;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminOnly fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You need administrator privileges to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    }>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-gray-600">
            Manage user roles and permissions within your organization
          </p>
        </div>

        {message && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <CanManageUsers fallback={
          <Card>
            <CardHeader>
              <CardTitle>Insufficient Permissions</CardTitle>
              <CardDescription>
                You need permission to manage users to access this feature.
              </CardDescription>
            </CardHeader>
          </Card>
        }>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Organization Users
              </CardTitle>
              <CardDescription>
                {users.length} user{users.length !== 1 ? 's' : ''} in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No users found in your organization.
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {user.full_name || 'No name provided'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">
                            Joined {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={getRoleBadgeColor(user.role)}>
                          <span className="flex items-center gap-1">
                            {getRoleIcon(user.role)}
                            {user.role}
                          </span>
                        </Badge>
                        
                        {user.user_id !== session?.user?.id && (
                          <div className="flex items-center gap-2">
                            <Select
                              value={user.role}
                              onValueChange={(value: string) => updateUserRole(user.user_id, value as UserRoleType)}
                              disabled={updatingUser === user.user_id}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {roleHierarchy.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeUserRole(user.user_id)}
                              disabled={updatingUser === user.user_id}
                            >
                              {updatingUser === user.user_id ? 'Updating...' : 'Remove'}
                            </Button>
                          </div>
                        )}
                        
                        {user.user_id === session?.user?.id && (
                          <Badge variant="secondary">Current User</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </CanManageUsers>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Role Descriptions</CardTitle>
              <CardDescription>
                Understanding the different user roles and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {roleHierarchy.map((role) => (
                  <div key={role.value} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {getRoleIcon(role.value)}
                      <h3 className="font-medium">{role.label}</h3>
                      <Badge className={getRoleBadgeColor(role.value)}>
                        {role.value}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminOnly>
  );
} 