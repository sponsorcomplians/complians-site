'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  RefreshCw,
  Eye,
  User,
  FileText,
  Users,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity
} from 'lucide-react';
import { AdminOnly } from '@/components/RoleBasedAccess';
import {
  AuditLog,
  AuditSummary,
  AuditAction
} from '@/types/database';

interface AuditLogsDashboardProps {
  className?: string;
}

export default function AuditLogsDashboard({ className }: AuditLogsDashboardProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditSummary, setAuditSummary] = useState<AuditSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('logs');
  
  // Filters
  const [filters, setFilters] = useState({
    action: '',
    user_id: '',
    start_date: '',
    end_date: '',
    limit: 100
  });

  // Pagination
  const [pagination, setPagination] = useState({
    limit: 100,
    offset: 0,
    total: 0
  });

  useEffect(() => {
    fetchAuditData();
  }, [filters, pagination.offset]);

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      params.append('limit', pagination.limit.toString());
      params.append('offset', pagination.offset.toString());

      // Fetch audit logs
      const logsResponse = await fetch(`/api/audit-logs?${params}`);
      if (!logsResponse.ok) throw new Error('Failed to fetch audit logs');
      const logsData = await logsResponse.json();

      // Fetch audit summary
      const summaryResponse = await fetch('/api/audit-logs?summary=true&days=30');
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setAuditSummary(summaryData.data || []);
      }

      setAuditLogs(logsData.data || []);
      setPagination(prev => ({
        ...prev,
        total: logsData.pagination?.total || 0
      }));

    } catch (error) {
      console.error('Error fetching audit data:', error);
      setError('Failed to load audit data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handlePageChange = (newOffset: number) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
  };

  const handleCleanOldLogs = async () => {
    if (!confirm('Are you sure you want to clean old audit logs? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clean_old_logs',
          days_to_keep: 365
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Successfully cleaned ${data.deleted_count} old audit logs`);
        fetchAuditData();
      } else {
        throw new Error('Failed to clean old logs');
      }
    } catch (error) {
      console.error('Error cleaning old logs:', error);
      alert('Failed to clean old audit logs');
    }
  };

  const exportAuditLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Details', 'IP Address', 'Resource Type', 'Resource ID'].join(','),
      ...auditLogs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.user_email || log.user_name || 'Unknown',
        log.action,
        JSON.stringify(log.details || {}),
        log.ip_address || '',
        log.resource_type || '',
        log.resource_id || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'worker_created':
      case 'worker_updated':
      case 'worker_deleted':
        return <Users className="h-4 w-4" />;
      case 'document_uploaded':
        return <FileText className="h-4 w-4" />;
      case 'assessment_run':
        return <BarChart3 className="h-4 w-4" />;
      case 'narrative_generated':
        return <FileText className="h-4 w-4" />;
      case 'user_role_assigned':
      case 'user_role_changed':
      case 'user_role_removed':
        return <User className="h-4 w-4" />;
      case 'login_success':
        return <CheckCircle className="h-4 w-4" />;
      case 'login_failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('created') || action.includes('success')) return 'bg-green-100 text-green-800';
    if (action.includes('updated') || action.includes('changed')) return 'bg-blue-100 text-blue-800';
    if (action.includes('deleted') || action.includes('failed') || action.includes('removed')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Error Loading Audit Logs
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchAuditData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
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
              You need admin permissions to view audit logs.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <div className={`container mx-auto p-6 ${className}`}>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
              <p className="text-gray-600">
                Track and monitor all system activities
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchAuditData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportAuditLogs} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleCleanOldLogs} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clean Old Logs
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="logs">Audit Logs</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="logs" className="space-y-4">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="action-filter">Action</Label>
                      <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="All actions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All actions</SelectItem>
                          <SelectItem value="worker_created">Worker Created</SelectItem>
                          <SelectItem value="worker_updated">Worker Updated</SelectItem>
                          <SelectItem value="worker_deleted">Worker Deleted</SelectItem>
                          <SelectItem value="document_uploaded">Document Uploaded</SelectItem>
                          <SelectItem value="assessment_run">Assessment Run</SelectItem>
                          <SelectItem value="narrative_generated">Narrative Generated</SelectItem>
                          <SelectItem value="user_role_assigned">User Role Assigned</SelectItem>
                          <SelectItem value="user_role_changed">User Role Changed</SelectItem>
                          <SelectItem value="login_success">Login Success</SelectItem>
                          <SelectItem value="login_failed">Login Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="user-filter">User ID</Label>
                      <Input
                        id="user-filter"
                        placeholder="Filter by user ID"
                        value={filters.user_id}
                        onChange={(e) => handleFilterChange('user_id', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={filters.start_date}
                        onChange={(e) => handleFilterChange('start_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={filters.end_date}
                        onChange={(e) => handleFilterChange('end_date', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audit Logs Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Showing {auditLogs.length} of {pagination.total} logs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            {getActionIcon(log.action)}
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge className={getActionBadgeColor(log.action)}>
                                  {log.action.replace('_', ' ')}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  by {log.user_email || log.user_name || 'Unknown'}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {log.details && typeof log.details === 'object' && (
                                  <span>
                                    {Object.entries(log.details).map(([key, value]) => (
                                      <span key={key} className="mr-4">
                                        {key}: {String(value)}
                                      </span>
                                    ))}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(log.timestamp)}
                            </div>
                            {log.ip_address && (
                              <div className="text-xs mt-1">
                                IP: {log.ip_address}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.total > pagination.limit && (
                    <div className="flex justify-between items-center mt-6">
                      <div className="text-sm text-gray-600">
                        Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pagination.offset === 0}
                          onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pagination.offset + pagination.limit >= pagination.total}
                          onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Summary (Last 30 Days)</CardTitle>
                  <CardDescription>
                    Overview of system activities and usage patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {auditSummary.map((summary) => (
                      <div key={summary.action} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium capitalize">
                              {summary.action.replace('_', ' ')}
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              {summary.count}
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div>Last: {new Date(summary.last_occurrence).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminOnly>
  );
} 