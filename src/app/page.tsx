// src/app/workers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AddWorkerModal from '@/components/AddWorkerModal';
import NewReportingDutyModal from '@/components/NewReportingDutyModal';
import { Plus, Users, FileText } from 'lucide-react';

interface Worker {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  created_at: string;
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [isReportingDutyOpen, setIsReportingDutyOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalWorkers: 0,
    activeReports: 0,
    departments: 0
  });

  useEffect(() => {
    fetchWorkers();
    fetchStats();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use API route instead of direct Supabase access
      const response = await fetch('/api/workers');
      if (!response.ok) {
        throw new Error('Failed to fetch workers');
      }
      
      const data = await response.json();
      setWorkers(data.workers || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
      setError('Failed to load workers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Use API route for stats
      const response = await fetch('/api/workers/stats');
      if (!response.ok) {
        console.error('Failed to fetch stats');
        return;
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddWorker = async (workerData: any) => {
    try {
      const response = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workerData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add worker');
      }
      
      fetchWorkers();
      fetchStats();
    } catch (error) {
      console.error('Error adding worker:', error);
      setError('Failed to add worker. Please try again.');
    }
  };

  const handleReportingDutySuccess = () => {
    fetchStats();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Workers Management</h1>
        <p className="text-gray-600">Manage your workforce and compliance reporting</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkers}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeReports}</div>
            <p className="text-xs text-muted-foreground">Pending duties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departments}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <Button onClick={() => setIsAddWorkerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Worker
        </Button>
        <Button variant="outline" onClick={() => setIsReportingDutyOpen(true)}>
          <FileText className="mr-2 h-4 w-4" />
          New Reporting Duty
        </Button>
      </div>

      {/* Workers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Workers</CardTitle>
          <CardDescription>A list of all workers in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading workers...</div>
          ) : workers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No workers added yet</p>
              <Button onClick={() => setIsAddWorkerOpen(true)}>
                Add Your First Worker
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Role</th>
                    <th className="text-left p-2">Department</th>
                    <th className="text-left p-2">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((worker) => (
                    <tr key={worker.id} className="border-b">
                      <td className="p-2">{worker.name}</td>
                      <td className="p-2">{worker.email}</td>
                      <td className="p-2">{worker.role}</td>
                      <td className="p-2">{worker.department}</td>
                      <td className="p-2">
                        {new Date(worker.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddWorkerModal
        isOpen={isAddWorkerOpen}
        onClose={() => setIsAddWorkerOpen(false)}
        onAddWorker={handleAddWorker}
      />

      <NewReportingDutyModal
        isOpen={isReportingDutyOpen}
        onClose={() => setIsReportingDutyOpen(false)}
        onSuccess={handleReportingDutySuccess}
      />
        </div>
  );
}