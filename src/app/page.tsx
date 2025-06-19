'use client';
export const dynamic = 'force-dynamic';

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
  Building,
  User
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

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkers: 1,
    totalReports: 0,
    pendingReports: 0,
    upcomingDeadlines: 0,
    complianceRate: 0
  });
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [isNewReportingDutyOpen, setIsNewReportingDutyOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    } else {
      setLoading(false);
    }
  }, [session, status, router]);

  const handleAddWorker = () => {
    toast.success('Worker added successfully!');
  };

  const handleCreateReport = () => {
    toast.success('Report created successfully!');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {session?.user?.email}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/workers/dc99da28-756b-433a-a269-f78b1987ef53')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                View Worker Compliance
              </CardTitle>
              <CardDescription>
                Access the compliance dashboard for Altaf Umarji Mahmed Patel
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setIsAddWorkerOpen(true)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Worker
              </CardTitle>
              <CardDescription>
                Register a new worker in the system
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setIsNewReportingDutyOpen(true)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                New Reporting Duty
              </CardTitle>
              <CardDescription>
                Create a new compliance report
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        {[
          { title: 'Total Workers', value: stats.totalWorkers, icon: <Users className="h-4 w-4 text-muted-foreground" /> },
          { title: 'Total Reports', value: stats.totalReports, icon: <FileText className="h-4 w-4 text-muted-foreground" /> },
          { title: 'Pending Reports', value: stats.pendingReports, icon: <Clock className="h-4 w-4 text-muted-foreground" /> },
          { title: 'Upcoming Deadlines', value: stats.upcomingDeadlines, icon: <AlertCircle className="h-4 w-4 text-muted-foreground" /> },
          { title: 'Compliance Rate', value: `${stats.complianceRate}%`, icon: <TrendingUp className="h-4 w-4 text-muted-foreground" /> },
        ].map((stat, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddWorkerModal
        isOpen={isAddWorkerOpen}
        onClose={() => setIsAddWorkerOpen(false)}
        onWorkerAdded={handleAddWorker}
      />

      <NewReportingDutyModal
        isOpen={isNewReportingDutyOpen}
        onClose={() => setIsNewReportingDutyOpen(false)}
        onSuccess={handleCreateReport}
      />

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Welcome to your compliance management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Key Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Track worker compliance and documentation</li>
                <li>Monitor visa and work permit expiry dates</li>
                <li>Manage training and qualification records</li>
                <li>Generate compliance reports</li>
                <li>Set up automatic reminders for important dates</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Quick Tips:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Click "View Worker Compliance" to access the detailed compliance dashboard</li>
                <li>Use "Add New Worker" to register additional workers</li>
                <li>Set up reporting duties to track compliance requirements</li>
                <li>Check the Workers page for a full list of all registered workers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
