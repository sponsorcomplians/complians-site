'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TenantInfo {
  tenant_context: {
    tenant_id: string;
    user_id: string;
    company: string;
  };
  tenant_info: {
    id: string;
    name: string;
    industry: string;
    max_workers: number;
    subscription_plan: string;
    subscription_status: string;
  };
  statistics: {
    total_workers: number;
    total_assessments: number;
    total_reports: number;
    total_remediation_actions: number;
    total_alerts: number;
    total_documents: number;
    total_training_records: number;
    total_notes: number;
    company: string;
  };
}

export default function TestTenantPage() {
  const { data: session, status } = useSession();
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTenantInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tenants');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTenantInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tenant info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchTenantInfo();
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // if (!session) { /* block or redirect logic */ } // TEMPORARILY DISABLED FOR DEV

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Multi-Tenant System Test</h1>
        <p className="text-gray-600">Testing tenant isolation and data access</p>
      </div>

      <div className="mb-6">
        <Button onClick={fetchTenantInfo} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Tenant Info'}
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {tenantInfo && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Email:</span> {session?.user?.email ?? 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Name:</span> {session?.user?.name ?? 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Company:</span> {session?.user?.company ?? 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Tenant ID:</span> 
                  <code className="ml-1 text-xs bg-gray-100 px-1 rounded">
                    {session?.user?.tenant_id ?? 'N/A'}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tenant Context */}
          <Card>
            <CardHeader>
              <CardTitle>Tenant Context</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Tenant ID:</span>
                  <code className="ml-1 text-xs bg-gray-100 px-1 rounded">
                    {tenantInfo.tenant_context.tenant_id}
                  </code>
                </div>
                <div>
                  <span className="font-medium">User ID:</span>
                  <code className="ml-1 text-xs bg-gray-100 px-1 rounded">
                    {tenantInfo.tenant_context.user_id}
                  </code>
                </div>
                <div>
                  <span className="font-medium">Company:</span> {tenantInfo.tenant_context.company}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tenant Info */}
          <Card>
            <CardHeader>
              <CardTitle>Tenant Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Name:</span> {tenantInfo.tenant_info.name}
                </div>
                <div>
                  <span className="font-medium">Industry:</span> {tenantInfo.tenant_info.industry}
                </div>
                <div>
                  <span className="font-medium">Max Workers:</span> {tenantInfo.tenant_info.max_workers}
                </div>
                <div>
                  <span className="font-medium">Plan:</span> 
                  <Badge variant="secondary" className="ml-1">
                    {tenantInfo.tenant_info.subscription_plan}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge 
                    variant={tenantInfo.tenant_info.subscription_status === 'active' ? 'default' : 'destructive'}
                    className="ml-1"
                  >
                    {tenantInfo.tenant_info.subscription_status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Tenant Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {tenantInfo.statistics.total_workers}
                  </div>
                  <div className="text-sm text-gray-600">Workers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {tenantInfo.statistics.total_assessments}
                  </div>
                  <div className="text-sm text-gray-600">Assessments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {tenantInfo.statistics.total_reports}
                  </div>
                  <div className="text-sm text-gray-600">Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {tenantInfo.statistics.total_alerts}
                  </div>
                  <div className="text-sm text-gray-600">Alerts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {tenantInfo.statistics.total_documents}
                  </div>
                  <div className="text-sm text-gray-600">Documents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">
                    {tenantInfo.statistics.total_training_records}
                  </div>
                  <div className="text-sm text-gray-600">Training</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">
                    {tenantInfo.statistics.total_notes}
                  </div>
                  <div className="text-sm text-gray-600">Notes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {tenantInfo.statistics.total_remediation_actions}
                  </div>
                  <div className="text-sm text-gray-600">Remediation</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!tenantInfo && !loading && !error && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">Click "Refresh Tenant Info" to load tenant data.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 