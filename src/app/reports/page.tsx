'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  FileText,
  Calendar,
  User,
  AlertTriangle,
  Plus
} from 'lucide-react';
import * as services from '@/lib/supabase/services';
import NewReportingDutyModal from '@/components/NewReportingDutyModal';

const { reportingDutyService } = services;

interface ReportingDuty {
  id: string;
  worker_id: string;
  event_type: string;
  event_date: string;
  event_details?: any;
  report_deadline: string;
  status: string;
  submitted_at?: string;
  submitted_by?: string;
  submission_reference?: string;
  escalation_level: number;
  last_escalation?: string;
  created_at: string;
  workers?: {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

export default function ReportsPage() {
  const [duties, setDuties] = useState<ReportingDuty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewDutyForm, setShowNewDutyForm] = useState(false);

  useEffect(() => {
    fetchReportingDuties();
  }, []);

  const fetchReportingDuties = async () => {
    try {
      setLoading(true);
      const data = await reportingDutyService.getPendingDuties();
      
      // Update status based on deadline
      const updatedDuties = data.map((duty: ReportingDuty) => {
        if (duty.status === 'pending' && new Date(duty.report_deadline) < new Date()) {
          return { ...duty, status: 'overdue' };
        }
        return duty;
      });

      setDuties(updatedDuties);
    } catch (err) {
      setError('Failed to fetch reporting duties');
    } finally {
      setLoading(false);
    }
  };

  const calculateWorkingDays = (deadline: string): number => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    let workingDays = 0;
    const current = new Date(now);
    
    while (current < deadlineDate) {
      if (current.getDay() !== 0 && current.getDay() !== 6) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return workingDays;
  };

  const getUrgencyLevel = (days: number, status: string): string => {
    if (status === 'submitted') return 'success';
    if (status === 'overdue' || days < 0) return 'danger';
    if (days <= 2) return 'warning';
    return 'default';
  };

  const handleSubmit = async (id: string) => {
    try {
      await reportingDutyService.submitReport(id, `REF-${Date.now()}`);
      await fetchReportingDuties();
    } catch (err) {
      alert('Failed to submit reporting duty');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <div className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Reporting Duties</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchReportingDuties}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  const overdueCount = duties.filter(d => d.status === 'overdue').length;
  const urgentCount = duties.filter(d => 
    d.status === 'pending' && calculateWorkingDays(d.report_deadline) <= 2
  ).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">10-Day Reporting Duties</h1>
        <p className="text-gray-600">Track and manage Home Office reporting requirements</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Duties</p>
                <p className="text-2xl font-bold">{duties.length}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{duties.filter(d => d.status === 'pending').length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className={urgentCount > 0 ? 'border-yellow-500' : ''}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent (≤2 days)</p>
                <p className="text-2xl font-bold text-yellow-600">{urgentCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </Card>

        <Card className={overdueCount > 0 ? 'border-red-500' : ''}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="mb-6">
        <Button 
          onClick={() => setShowNewDutyForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Reporting Duty
        </Button>
      </div>

      {/* Reporting Duties List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Worker</th>
                <th className="text-left p-4">Event Type</th>
                <th className="text-left p-4">Event Date</th>
                <th className="text-left p-4">Deadline</th>
                <th className="text-left p-4">Days Left</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {duties.map((duty) => {
                const daysLeft = calculateWorkingDays(duty.report_deadline);
                const urgencyLevel = getUrgencyLevel(daysLeft, duty.status);
                
                return (
                  <tr key={duty.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {duty.workers?.first_name} {duty.workers?.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium">{duty.event_type}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {new Date(duty.event_date).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">
                        {new Date(duty.report_deadline).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`
                        font-bold text-sm
                        ${urgencyLevel === 'danger' ? 'text-red-600' : ''}
                        ${urgencyLevel === 'warning' ? 'text-yellow-600' : ''}
                        ${urgencyLevel === 'success' ? 'text-green-600' : ''}
                      `}>
                        {duty.status === 'submitted' ? 'Completed' : 
                         duty.status === 'overdue' ? 'OVERDUE' : 
                         `${daysLeft} working days`}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`
                        inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                        ${duty.status === 'submitted' ? 'bg-green-100 text-green-800' : ''}
                        ${duty.status === 'pending' ? 'bg-blue-100 text-blue-800' : ''}
                        ${duty.status === 'overdue' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {duty.status === 'submitted' && <CheckCircle className="h-3 w-3" />}
                        {duty.status === 'pending' && <Clock className="h-3 w-3" />}
                        {duty.status === 'overdue' && <AlertCircle className="h-3 w-3" />}
                        {duty.status.charAt(0).toUpperCase() + duty.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      {duty.status !== 'submitted' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleSubmit(duty.id)}
                          variant={urgencyLevel === 'danger' ? 'destructive' : 'default'}
                        >
                          Mark Submitted
                        </Button>
                      )}
                      {duty.submitted_at && (
                        <span className="text-xs text-gray-500">
                          Submitted: {new Date(duty.submitted_at).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {duties.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No reporting duties found</p>
              <p className="text-sm text-gray-400 mt-2">Add your first reporting duty to get started</p>
            </div>
          )}
        </div>
      </Card>
      
      {/* New Reporting Duty Modal */}
      <NewReportingDutyModal
        isOpen={showNewDutyForm}
        onClose={() => setShowNewDutyForm(false)}
        onSuccess={fetchReportingDuties}
      />
    </div>
  );
}