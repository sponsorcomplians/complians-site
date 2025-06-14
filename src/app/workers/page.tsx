'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  Building,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import AddWorkerModal from '@/components/AddWorkerModal';
import NewReportingDutyModal from '@/components/NewReportingDutyModal';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  startDate: string;
  employmentType: string;
  salary: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export default function WorkersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [isNewReportingDutyOpen, setIsNewReportingDutyOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  // Fetch workers data
  useEffect(() => {
    if (session) {
      fetchWorkers();
    }
  }, [session]);

  // Filter workers based on search and filters
  useEffect(() => {
    let filtered = workers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(worker => 
        worker.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(worker => worker.department === departmentFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(worker => worker.status === statusFilter);
    }

    setFilteredWorkers(filtered);
  }, [workers, searchTerm, departmentFilter, statusFilter]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setWorkers(data || []);
      
    } catch (error) {
      console.error('Error fetching workers:', error);
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorker = () => {
    // The modal handles the submission internally
    // We just need to refresh the data when a worker is added
    fetchWorkers();
  };

  const handleCreateReport = () => {
    // The modal handles the submission internally
    // We just need to refresh the data when a report is created
    fetchWorkers();
  };

  const handleEditWorker = (worker: Worker) => {
    // TODO: Implement edit functionality
    setSelectedWorker(worker);
    toast.info('Edit functionality coming soon!');
  };

  const handleDeleteWorker = async (workerId: string) => {
    if (!confirm('Are you sure you want to delete this worker?')) return;

    try {
      const { error } = await supabase
        .from('workers')
        .delete()
        .eq('id', workerId);
      
      if (error) throw error;
      
      toast.success('Worker deleted successfully');
      fetchWorkers();
    } catch (error) {
      console.error('Error deleting worker:', error);
      toast.error('Failed to delete worker');
    }
  };

  const handleExportWorkers = () => {
    // TODO: Implement export functionality
    toast.info('Export functionality coming soon!');
  };

  const getDepartments = () => {
    const departments = [...new Set(workers.map(w => w.department))];
    return departments.filter(Boolean);
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Workers Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your workforce and compliance requirements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportWorkers}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsAddWorkerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Worker
          </Button>
        </div>
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
        onSuccess={handleCreateReport}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workers.filter(w => w.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getDepartments().length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workers.filter(w => {
                const startDate = new Date(w.startDate);
                const now = new Date();
                return startDate.getMonth() === now.getMonth() && 
                       startDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search workers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Departments</option>
              {getDepartments().map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Users className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workers List/Grid */}
      {viewMode === 'list' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Contact</th>
                    <th className="text-left p-4">Role</th>
                    <th className="text-left p-4">Department</th>
                    <th className="text-left p-4">Start Date</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.map((worker) => (
                    <tr key={worker.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{worker.firstName} {worker.lastName}</div>
                          <div className="text-sm text-muted-foreground">ID: {worker.id.slice(0, 8)}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {worker.email}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {worker.phone}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{worker.role}</td>
                      <td className="p-4">{worker.department}</td>
                      <td className="p-4">{new Date(worker.startDate).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          worker.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {worker.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => router.push(`/workers/${worker.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditWorker(worker)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteWorker(worker.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkers.map((worker) => (
            <Card key={worker.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {worker.firstName} {worker.lastName}
                    </CardTitle>
                    <CardDescription>{worker.role}</CardDescription>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    worker.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {worker.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    {worker.department}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {worker.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {worker.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Started: {new Date(worker.startDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => router.push(`/workers/${worker.id}`)}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditWorker(worker)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredWorkers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || departmentFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first worker'}
            </p>
            {!searchTerm && departmentFilter === 'all' && statusFilter === 'all' && (
              <Button onClick={() => setIsAddWorkerOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Worker
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}