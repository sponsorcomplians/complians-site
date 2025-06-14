'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  FileText, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Plus,
  TrendingUp,
  Building
} from 'lucide-react';
import AddWorkerModal from '@/components/AddWorkerModal';
import NewReportingDutyModal from '@/components/NewReportingDutyModal';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

interface DashboardStats {
  totalWorkers: number;
  totalReports: number;
  pendingReports: number;
  upcomingDeadlines: number;
  complianceRate: number;
}

interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  startDate: string;
  status: 'active' | 'inactive';
}

interface Report {
  id: string;
  title: string;
  type: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'approved';
  assignedTo: string;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkers: 0,
    totalReports: 0,
    pendingReports: 0,
    upcomingDeadlines: 0,
    complianceRate: 0
  });
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [isNewReportingDutyOpen, setIsNewReportingDutyOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch workers
      const { data: workersData, error: workersError } = await supabase
        .from('workers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (workersError) throw workersError;
      setWorkers(workersData || []);
      
      // Fetch reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (reportsError) throw reportsError;
      setReports(reportsData || []);
      
      // Calculate stats
      const pendingReports = reportsData?.filter(r => r.status === 'pending').length || 0;
      const upcomingDeadlines = reportsData?.filter(r => {
        const dueDate = new Date(r.dueDate);
        const today = new Date();
        const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7 && daysDiff >= 0;
      }).length || 0;
      
      const completedReports = reportsData?.filter(r => r.status === 'approved').length || 0;
      const complianceRate = reportsData && reportsData.length > 0 
        ? Math.round((completedReports / reportsData.length) * 100)
        : 0;
      
      setStats({
        totalWorkers: workersData?.length || 0,
        totalReports: reportsData?.length || 0,
        pendingReports,
        upcomingDeadlines,
        complianceRate
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorker = async (workerData: any) => {
    try {
      const { error } = await supabase
        .from('workers')
        .insert([{
          ...workerData,
          status: 'active',
          created_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      toast.success('Worker added successfully!');
      setIsAddWorkerOpen(false);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error adding worker:', error);
      toast.error('Failed to add worker');
    }
  };

  const handleCreateReport = async (reportData: any) => {
    try {
      const { error } = await supabase
        .from('reports')
        .insert([{
          ...reportData,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      toast.success('Reporting duty created successfully!');
      setIsNewReportingDutyOpen(false);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Failed to create reporting duty');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {session.user?.email}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReports}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingDeadlines}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complianceRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddWorkerModal
        isOpen={isAddWorkerOpen}
        onClose={() => setIsAddWorkerOpen(false)}
        onWorkerAdded={handleAddWorker}
      />

      <NewReportingDutyModal
        isOpen={isNewReportingDutyOpen}
        onClose={() => setIsNewReportingDutyOpen(false)}
        onCreateReport={handleCreateReport}
      />

      {/* Main Content Tabs */}
      <Tabs defaultValue="workers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
        </TabsList>

        <TabsContent value="workers" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Workers</h2>
            <Button onClick={() => setIsAddWorkerOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Worker
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Email</th>
                      <th className="text-left p-4">Role</th>
                      <th className="text-left p-4">Department</th>
                      <th className="text-left p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map((worker) => (
                      <tr key={worker.id} className="border-b">
                        <td className="p-4">{worker.firstName} {worker.lastName}</td>
                        <td className="p-4">{worker.email}</td>
                        <td className="p-4">{worker.role}</td>
                        <td className="p-4">{worker.department}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            worker.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {worker.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Reports</h2>
            <Button onClick={() => setIsNewReportingDutyOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Reporting Duty
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">Title</th>
                      <th className="text-left p-4">Type</th>
                      <th className="text-left p-4">Due Date</th>
                      <th className="text-left p-4">Assigned To</th>
                      <th className="text-left p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b">
                        <td className="p-4">{report.title}</td>
                        <td className="p-4">{report.type}</td>
                        <td className="p-4">{new Date(report.dueDate).toLocaleDateString()}</td>
                        <td className="p-4">{report.assignedTo}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            report.status === 'approved' 
                              ? 'bg-green-100 text-green-800'
                              : report.status === 'submitted'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deadlines" className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Upcoming Deadlines</h2>
          
          <div className="space-y-4">
            {reports
              .filter(report => {
                const dueDate = new Date(report.dueDate);
                const today = new Date();
                const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return daysDiff <= 14 && daysDiff >= 0;
              })
              .map((report) => {
                const dueDate = new Date(report.dueDate);
                const today = new Date();
                const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{report.title}</CardTitle>
                          <CardDescription>
                            Due: {dueDate.toLocaleDateString()} ({daysDiff} days remaining)
                          </CardDescription>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          daysDiff <= 3 
                            ? 'bg-red-100 text-red-800'
                            : daysDiff <= 7
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {daysDiff <= 3 ? 'Urgent' : daysDiff <= 7 ? 'Soon' : 'Upcoming'}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Type: {report.type} | Assigned to: {report.assignedTo} | Status: {report.status}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}