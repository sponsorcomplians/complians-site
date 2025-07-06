'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  FileText, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  Calendar,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { CanViewAnalytics } from '@/components/RoleBasedAccess';
import {
  TenantMetricsSummary,
  ComplianceTrends,
  BreachBreakdown
} from '@/types/database';

interface DailyMetric {
  date: string;
  documents_uploaded: number;
  assessments_run: number;
  narratives_generated: number;
  compliance_reports_generated: number;
  workers_added: number;
  alerts_created: number;
  remediation_actions_created: number;
}

interface ComplianceStatus {
  compliant: number;
  breach: number;
  serious_breach: number;
  total: number;
}

interface TenantAnalyticsData {
  summary: TenantMetricsSummary;
  dailyMetrics: DailyMetric[];
  complianceTrends: ComplianceTrends[];
  breachBreakdown: BreachBreakdown[];
  complianceStatus: ComplianceStatus;
  recentActivity: any[];
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
}

export default function TenantAnalyticsDashboard() {
  const [data, setData] = useState<TenantAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tenant-metrics?days=${timeRange}&trends=true&breachBreakdown=true`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch(`/api/tenant-metrics?days=${timeRange}&trends=true&breachBreakdown=true`);
      const data = await response.json();
      
      const csvContent = generateCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tenant-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const generateCSV = (data: TenantAnalyticsData) => {
    const headers = ['Date', 'Documents Uploaded', 'Assessments Run', 'Narratives Generated', 'Reports Generated', 'Workers Added', 'Alerts Created', 'Remediation Actions'];
    const rows = data.dailyMetrics.map(metric => [
      metric.date,
      metric.documents_uploaded,
      metric.assessments_run,
      metric.narratives_generated,
      metric.compliance_reports_generated,
      metric.workers_added,
      metric.alerts_created,
      metric.remediation_actions_created
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const getCompliancePercentage = () => {
    if (!data?.complianceStatus) return 0;
    const { compliant, total } = data.complianceStatus;
    return total > 0 ? Math.round((compliant / total) * 100) : 0;
  };

  const getRiskLevel = (percentage: number) => {
    if (percentage >= 90) return { level: 'Low', color: 'bg-green-100 text-green-800' };
    if (percentage >= 70) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'High', color: 'bg-red-100 text-red-800' };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading analytics...</p>
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
              Error Loading Analytics
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchAnalytics} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <CanViewAnalytics fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You need permission to view analytics.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tenant Analytics Dashboard</h1>
              <p className="text-gray-600">
                Comprehensive insights into your compliance activities and performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportData} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={fetchAnalytics} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {data && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              {/* Key Metrics Cards */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.summary.total_assessments_run}</div>
                  <p className="text-xs text-muted-foreground">
                    {data.summary.avg_daily_assessments.toFixed(1)} avg/day
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.summary.total_compliance_reports_generated}</div>
                  <p className="text-xs text-muted-foreground">
                    {data.summary.avg_daily_reports.toFixed(1)} avg/day
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Workers Added</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.summary.total_workers_added}</div>
                  <p className="text-xs text-muted-foreground">
                    Total workers in system
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getCompliancePercentage()}%</div>
                  <Badge className={getRiskLevel(getCompliancePercentage()).color}>
                    {getRiskLevel(getCompliancePercentage()).level} Risk
                  </Badge>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Compliance Trends</TabsTrigger>
              <TabsTrigger value="breaches">Breach Analysis</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {data && (
                <>
                  {/* Usage Trends Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Usage Trends</CardTitle>
                      <CardDescription>
                        Daily activity over the last {timeRange} days
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-end justify-between gap-2">
                        {data.dailyMetrics.slice(-10).map((metric, index) => (
                          <div key={index} className="flex flex-col items-center flex-1">
                            <div className="w-full bg-blue-100 rounded-t" style={{
                              height: `${Math.max(metric.assessments_run * 10, 20)}px`
                            }}></div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-sm text-gray-600">
                        Chart shows daily assessments run
                      </div>
                    </CardContent>
                  </Card>

                  {/* Compliance Status Breakdown */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Compliance Status</CardTitle>
                        <CardDescription>Current worker compliance breakdown</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Compliant
                            </span>
                            <Badge variant="secondary">{data.complianceStatus.compliant}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                              Breach
                            </span>
                            <Badge variant="secondary">{data.complianceStatus.breach}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-500" />
                              Serious Breach
                            </span>
                            <Badge variant="secondary">{data.complianceStatus.serious_breach}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Activity Summary</CardTitle>
                        <CardDescription>Key metrics for the period</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Documents Uploaded</span>
                            <span className="font-medium">{data.summary.total_documents_uploaded}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Narratives Generated</span>
                            <span className="font-medium">{data.summary.total_narratives_generated}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Alerts Created</span>
                            <span className="font-medium">{data.summary.total_alerts_created}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Remediation Actions</span>
                            <span className="font-medium">{data.summary.total_remediation_actions_created}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              {data && data.complianceTrends.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Trends</CardTitle>
                    <CardDescription>
                      Worker compliance status over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end justify-between gap-1">
                      {data.complianceTrends.slice(-14).map((trend, index) => (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div className="w-full flex flex-col-reverse gap-1">
                            <div className="w-full bg-green-200 rounded-t" style={{
                              height: `${Math.max(trend.compliant_count * 5, 10)}px`
                            }}></div>
                            <div className="w-full bg-yellow-200" style={{
                              height: `${Math.max(trend.breach_count * 5, 10)}px`
                            }}></div>
                            <div className="w-full bg-red-200 rounded-b" style={{
                              height: `${Math.max(trend.serious_breach_count * 5, 10)}px`
                            }}></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-200 rounded"></div>
                        <span>Compliant</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                        <span>Breach</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-200 rounded"></div>
                        <span>Serious Breach</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-500">
                      No compliance trend data available for the selected period.
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="breaches" className="space-y-4">
              {data && data.breachBreakdown.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Breach Breakdown by Type</CardTitle>
                    <CardDescription>
                      Analysis of compliance breaches by category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.breachBreakdown.map((breach, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{breach.breach_type}</h4>
                            <Badge variant="destructive">{breach.total_count} total</Badge>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <span className="text-yellow-600">
                              {breach.breach_count} breaches
                            </span>
                            <span className="text-red-600">
                              {breach.serious_breach_count} serious breaches
                            </span>
                          </div>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${(breach.total_count / Math.max(...data.breachBreakdown.map(b => b.total_count))) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-500">
                      No breach data available for the selected period.
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              {data && data.recentActivity.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Daily activity for the last 7 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.recentActivity.map((activity, index) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">
                              {new Date(activity.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {activity.assessments_run} assessments • {activity.compliance_reports_generated} reports
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{activity.assessments_run}</div>
                            <div className="text-sm text-gray-500">assessments</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-500">
                      No recent activity data available.
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </CanViewAnalytics>
  );
} 