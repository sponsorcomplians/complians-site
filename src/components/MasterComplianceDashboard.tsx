"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Filter,
  FileText,
  LogIn,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import MasterComplianceSummaryCard from './MasterComplianceSummaryCard';
import MasterCompliancePieChart from './MasterCompliancePieChart';
import MasterComplianceBarChart from './MasterComplianceBarChart';
import MasterComplianceWorkersTable from './MasterComplianceWorkersTable';
import { 
  MasterComplianceMetrics, 
  MasterComplianceWorker,
  MasterComplianceFilters,
  AgentComplianceSummary
} from '@/types/master-compliance.types';
import { masterComplianceService, AI_AGENT_NAMES } from '@/lib/masterComplianceService';

// Comprehensive safe render helper
const safe = (value: any): React.ReactNode => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (React.isValidElement(value)) return value;
  if (Array.isArray(value)) return value.map((v, i) => <React.Fragment key={i}>{safe(v)}</React.Fragment>);
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'object') {
    // Check for common object properties
    if (value.message) return value.message;
    if (value.error) return value.error;
    if (value.data) return safe(value.data);
    if (value.toString && value.toString !== Object.prototype.toString) return value.toString();
    return JSON.stringify(value);
  }
  return String(value);
};

export default function MasterComplianceDashboard() {
  // At the VERY TOP of the component, before ANY other code
  console.log('=== COMPONENT RENDER START ===');
  let hookCount = 0;

  // Wrap every hook call
  const useTrackedState = (initial: any) => {
    console.log(`Hook #${++hookCount}: useState`);
    return useState(initial);
  };

  const useTrackedEffect = (fn: any, deps: any) => {
    console.log(`Hook #${++hookCount}: useEffect`);
    return useEffect(fn, deps);
  };

  const useTrackedSession = () => {
    console.log(`Hook #${++hookCount}: useSession`);
    return useSession();
  };

  // ALL HOOKS MUST BE AT THE TOP - NO CONDITIONAL RETURNS BEFORE THIS
  const { data: session, status } = useTrackedSession();
  const [activeTab, setActiveTab] = useTrackedState('overview');
  const [metrics, setMetrics] = useTrackedState(null);
  const [workers, setWorkers] = useTrackedState([]);
  const [loading, setLoading] = useTrackedState(true);
  const [error, setError] = useTrackedState(null);
  const [filters, setFilters] = useTrackedState({});
  const [currentPage, setCurrentPage] = useTrackedState(1);
  const [pagination, setPagination] = useTrackedState({
    page: 1,
    pageSize: 20,
    totalPages: 1
  });
  const [exporting, setExporting] = useTrackedState(false);
  const [generatingNarrative, setGeneratingNarrative] = useTrackedState(null);
  const [generatingPDF, setGeneratingPDF] = useTrackedState(false);

  // TEMPORARY DEBUG CODE - REMOVE AFTER FIXING
  useTrackedEffect(() => {
    if (typeof window !== 'undefined') {
      const origError = console.error;
      console.error = (...args) => {
        if (args[0]?.toString?.().includes('Objects are not valid')) {
          console.log('🔴 REACT ERROR #310 DETECTED');
          console.log('Check these common issues:');
          console.log('- error objects: use error.message');
          console.log('- API responses: use response.data');
          console.log('- user objects: use user.name or user.email');
          console.trace('Component stack trace:');
        }
        origError.apply(console, args);
      };
      
      return () => { console.error = origError; };
    }
  }, []);

  // Also log all state values
  useTrackedEffect(() => {
    console.log('Dashboard State:', {
      session: typeof session,
      error: typeof error,
      loading: typeof loading,
      metrics: typeof metrics,
      workers: typeof workers,
      filters: typeof filters
    });
  }, []);

  // Debug React Error #310
  useTrackedEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.('Objects are not valid')) {
        debugger; // This will pause execution when error occurs
      }
      originalError(...args);
    };
  }, []);

  // Show authentication prompt if not logged in
  if (status === 'loading') {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-brand-light mx-auto mb-4" />
            <p className="text-gray-600">
              {safe('Checking authentication...')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <Shield className="h-16 w-16 text-brand-light mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-brand-dark mb-2">
                Authentication Required
              </h1>
              <p className="text-gray-600">
                Please sign in to access the Master Compliance Dashboard
              </p>
            </div>
            
            <div className="space-y-3">
              <Link href="/auth/signin">
                <Button className="w-full" size="lg">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-brand-light hover:text-brand-dark">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Load metrics on component mount
  useTrackedEffect(() => {
    if (session) {
      loadMetrics();
    }
  }, [filters, session]);

  // Load workers when tab changes or page changes
  useTrackedEffect(() => {
    if (session && activeTab === 'workers') {
      loadWorkers();
    }
  }, [activeTab, currentPage, filters, session]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/master-compliance/summary?' + new URLSearchParams({
        ...(filters.complianceStatus && { complianceStatus: filters.complianceStatus }),
        ...(filters.riskLevel && { riskLevel: filters.riskLevel }),
        ...(filters.agentType && { agentType: filters.agentType }),
        ...(filters.hasRedFlags && { hasRedFlags: filters.hasRedFlags.toString() }),
        ...(filters.dateRange && { 
          startDate: filters.dateRange.start,
          endDate: filters.dateRange.end
        })
      }));

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          throw new Error('Authentication required. Please sign in again.');
        }
        throw new Error(errorData.error || 'Failed to fetch metrics');
      }

      const result = await response.json();
      console.log('🔍 MasterComplianceDashboard: API response:', result);
      
      if (result.success) {
        console.log('🔍 MasterComplianceDashboard: Setting metrics:', result.data);
        // Debug: Check for any objects that might cause rendering issues
        if (result.data?.summary) {
          console.log('🔍 MasterComplianceDashboard: Summary data:', result.data.summary);
          // Check for Date objects or other complex objects
          Object.entries(result.data.summary).forEach(([key, value]) => {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
              console.warn(`⚠️ MasterComplianceDashboard: Summary contains object at ${key}:`, value);
            }
          });
        }
        if (result.data?.agentSummaries) {
          console.log('🔍 MasterComplianceDashboard: Agent summaries:', result.data.agentSummaries);
          result.data.agentSummaries.forEach((agent: any, index: number) => {
            Object.entries(agent).forEach(([key, value]) => {
              if (value && typeof value === 'object' && !Array.isArray(value)) {
                console.warn(`⚠️ MasterComplianceDashboard: Agent ${index} contains object at ${key}:`, value);
              }
            });
          });
        }
        setMetrics(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch metrics');
      }
    } catch (err) {
      console.error('Error loading metrics:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/master-compliance/workers?' + new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pagination.pageSize.toString(),
        ...(filters.complianceStatus && { complianceStatus: filters.complianceStatus }),
        ...(filters.riskLevel && { riskLevel: filters.riskLevel }),
        ...(filters.agentType && { agentType: filters.agentType }),
        ...(filters.hasRedFlags && { hasRedFlags: filters.hasRedFlags.toString() }),
        ...(filters.dateRange && { 
          startDate: filters.dateRange.start,
          endDate: filters.dateRange.end
        })
      }));

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          throw new Error('Authentication required. Please sign in again.');
        }
        throw new Error(errorData.error || 'Failed to fetch workers');
      }

      const result = await response.json();
      console.log('🔍 MasterComplianceDashboard: Workers API response:', result);
      
      if (result.success) {
        console.log('🔍 MasterComplianceDashboard: Setting workers:', result.data.workers);
        // Debug: Check for any objects that might cause rendering issues
        if (result.data?.workers) {
          result.data.workers.forEach((worker: any, index: number) => {
            console.log(`🔍 MasterComplianceDashboard: Worker ${index}:`, worker);
            // Check for Date objects or other complex objects
            Object.entries(worker).forEach(([key, value]) => {
              if (value && typeof value === 'object' && !Array.isArray(value)) {
                console.warn(`⚠️ MasterComplianceDashboard: Worker ${index} contains object at ${key}:`, value);
              }
            });
          });
        }
        setWorkers(result.data.workers);
        setPagination(result.data.pagination);
      } else {
        throw new Error(result.error || 'Failed to fetch workers');
      }
    } catch (err) {
      console.error('Error loading workers:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'COMPLIANT':
        return (
          <Badge className={`${baseClasses} bg-green-100 text-green-800 border-green-200`}>
            <CheckCircle className="w-3 h-3 mr-1" />
            Compliant
          </Badge>
        );
      case 'BREACH':
        return (
          <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-200`}>
            <AlertTriangle className="w-3 h-3 mr-1" />
            Breach
          </Badge>
        );
      case 'SERIOUS_BREACH':
        return (
          <Badge className={`${baseClasses} bg-red-100 text-red-800 border-red-200`}>
            <XCircle className="w-3 h-3 mr-1" />
            Serious Breach
          </Badge>
        );
      default:
        return (
          <Badge className={`${baseClasses} bg-gray-100 text-gray-800 border-gray-200`}>
            {status}
          </Badge>
        );
    }
  };

  const handleExportSummary = async () => {
    try {
      setExporting(true);
      setError(null);
      
      const response = await fetch('/api/master-compliance/export/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export summary');
      }

      const result = await response.json();
      if (result.success) {
        // Create and download the file
        const blob = new Blob([result.content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `master-compliance-summary-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error(result.error || 'Failed to export summary');
      }
    } catch (err) {
      console.error('Error exporting summary:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setExporting(false);
    }
  };

  const handleGenerateNarrative = async (workerName: string) => {
    try {
      setGeneratingNarrative(workerName);
      setError(null);
      
      const response = await fetch('/api/master-compliance/narrative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workerId: workerName })
      });

      if (!response.ok) {
        throw new Error('Failed to generate narrative');
      }

      const result = await response.json();
      if (result.success) {
        // Create and download the narrative file
        const blob = new Blob([result.narrative], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `combined-narrative-${workerName}-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error(result.error || 'Failed to generate narrative');
      }
    } catch (err) {
      console.error('Error generating narrative:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setGeneratingNarrative(null);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setGeneratingPDF(true);
      setError(null);
      
      const response = await fetch('/api/master-compliance/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const result = await response.json();
      if (result.success) {
        // Create and download the PDF file
        const blob = new Blob([result.pdfContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `master-compliance-report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error(result.error || 'Failed to generate PDF');
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-brand-light mx-auto mb-4" />
            <p className="text-gray-600">
              {safe('Loading Master Compliance Dashboard...')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
          </div>
          <p className="text-red-600 mt-1">
            {safe(error)}
          </p>
          <Button onClick={loadMetrics} className="mt-3">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  // Prepare chart data
  const statusPieData = [
    { name: 'Compliant', value: metrics.statusDistribution.compliant, color: '#10B981' },
    { name: 'Breach', value: metrics.statusDistribution.breach, color: '#F59E0B' },
    { name: 'Serious Breach', value: metrics.statusDistribution.seriousBreach, color: '#EF4444' },
    { name: 'Pending', value: metrics.statusDistribution.pending, color: '#6B7280' }
  ];

  const riskBarData = [
    { name: 'Low Risk', value: metrics.riskDistribution.low, color: '#10B981' },
    { name: 'Medium Risk', value: metrics.riskDistribution.medium, color: '#F59E0B' },
    { name: 'High Risk', value: metrics.riskDistribution.high, color: '#EF4444' }
  ];

  const topAgentsData = metrics.topAgents.map(agent => ({
    name: agent.agentName,
    value: agent.complianceRate,
    color: agent.complianceRate >= 80 ? '#10B981' : agent.complianceRate >= 60 ? '#F59E0B' : '#EF4444'
  }));

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark mb-2 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-brand-light" />
              Master Compliance Dashboard
            </h1>
            <p className="text-gray-600">
              Unified view of all AI compliance agent assessments and worker status across 15 compliance areas.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={loadMetrics} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {safe('Refresh')}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportSummary} 
              disabled={exporting}
            >
              <Download className={`h-4 w-4 mr-2 ${exporting ? 'animate-spin' : ''}`} />
              {exporting ? 'Exporting...' : 'Export Summary'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleGeneratePDF} 
              disabled={generatingPDF}
            >
              <FileText className={`h-4 w-4 mr-2 ${generatingPDF ? 'animate-spin' : ''}`} />
              {generatingPDF ? 'Generating PDF...' : 'Download Master PDF'}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="workers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Workers
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          {/* Summary Cards */}
          <div className="mb-6">
            {safe(<MasterComplianceSummaryCard summary={metrics.summary} className="mb-6" />)}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              {safe(<MasterCompliancePieChart 
                data={statusPieData}
                title="Compliance Status Distribution"
              />)}
            </div>
            <div>
              {safe(<MasterComplianceBarChart 
                data={riskBarData}
                title="Risk Level Breakdown"
              />)}
            </div>
          </div>

          {/* Top Performing Agents */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-brand-dark flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Performing Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.topAgents.map((agent, index) => {
                  // Defensive rendering: ensure all values are properly typed
                  const agentName = typeof agent.agentName === 'string' ? agent.agentName : 'Unknown Agent';
                  const complianceRate = typeof agent.complianceRate === 'number' ? agent.complianceRate : 0;
                  const totalWorkers = typeof agent.totalWorkers === 'number' ? agent.totalWorkers : 0;
                  const redFlags = typeof agent.redFlags === 'number' ? agent.redFlags : 0;
                  
                  return (
                    <Card key={agent.agentType} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {safe(agentName)}
                          </h4>
                          <Link href={`/${agent.agentSlug}`}>
                            <Button variant="ghost" size="sm" className="h-6 text-xs">
                              View
                            </Button>
                          </Link>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Compliance Rate:</span>
                            <span className="font-medium">
                              {safe(`${complianceRate}%`)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Workers:</span>
                            <span className="font-medium">
                              {safe(totalWorkers)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Red Flags:</span>
                            <span className="font-medium">
                              {safe(redFlags)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle className="text-brand-dark flex items-center gap-2">
                <Users className="h-5 w-5" />
                All AI Compliance Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.agentSummaries.map((agent) => {
                  // Defensive rendering: ensure all values are properly typed
                  const agentName = typeof agent.agentName === 'string' ? agent.agentName : 'Unknown Agent';
                  const complianceRate = typeof agent.complianceRate === 'number' ? agent.complianceRate : 0;
                  const totalWorkers = typeof agent.totalWorkers === 'number' ? agent.totalWorkers : 0;
                  const breachWorkers = typeof agent.breachWorkers === 'number' ? agent.breachWorkers : 0;
                  const seriousBreachWorkers = typeof agent.seriousBreachWorkers === 'number' ? agent.seriousBreachWorkers : 0;
                  const redFlags = typeof agent.redFlags === 'number' ? agent.redFlags : 0;
                  
                  return (
                    <Card key={agent.agentType} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">
                            {safe(agentName)}
                          </h4>
                          {getStatusBadge((complianceRate || 0) >= 80 ? 'COMPLIANT' : (complianceRate || 0) >= 60 ? 'BREACH' : 'SERIOUS_BREACH')}
                        </div>
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Compliance Rate:</span>
                            <span className="font-medium">
                              {safe(`${complianceRate}%`)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Workers:</span>
                            <span className="font-medium">
                              {safe(totalWorkers)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Breaches:</span>
                            <span className="font-medium">
                              {safe(`${breachWorkers + seriousBreachWorkers}`)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Red Flags:</span>
                            <span className="font-medium">
                              {safe(redFlags)}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/${agent.agentSlug}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              View Dashboard
                            </Button>
                          </Link>
                          <Link href={`/reports?agent=${agent.agentType}`}>
                            <Button variant="ghost" size="sm">
                              Reports
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workers Tab */}
        <TabsContent value="workers">
          <MasterComplianceWorkersTable
            workers={workers}
            totalCount={pagination.totalPages * pagination.pageSize}
            filteredCount={workers.length}
            pagination={pagination}
            onPageChange={handlePageChange}
            onGenerateNarrative={handleGenerateNarrative}
            generatingNarrative={generatingNarrative}
          />
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="text-brand-dark flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Compliance Trends (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.recentTrends.slice(-7).map((trend, index) => {
                  // Defensive rendering: ensure date is a string
                  const trendDate = typeof trend.date === 'string' ? trend.date : 'Unknown Date';
                  
                  return (
                    <div key={trendDate} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">
                          {safe(new Date(trendDate).toLocaleDateString('en-GB', { 
                            day: 'numeric', 
                            month: 'short' 
                          }))}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Compliance Rate:</span>
                          <span className={`font-medium ${
                            (trend.complianceRate || 0) >= 80 ? 'text-green-600' : 
                            (trend.complianceRate || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {safe(`${trend.complianceRate || 0}%`)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          Workers: {safe(trend.totalWorkers || 0)}
                        </span>
                        <span>
                          Breaches: {safe(trend.breaches || 0)}
                        </span>
                        <span>
                          Serious: {safe(trend.seriousBreaches || 0)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 