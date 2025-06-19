'use client';
import { useSession } from 'next-auth/react';

export default function WorkersPage() {
  const { data: session } = useSession();

  return (
    <div>
      <h1>Workers</h1>
      <p>Accessed by: {session?.user?.email}</p>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

// Temporarily comment out modal imports to isolate the error
// import AddWorkerModal from '@/components/modals/AddWorkerModal';
// import CreateReportModal from '@/components/modals/CreateReportModal';

interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  startDate: string;
  visaExpiry: string;
  status: 'active' | 'inactive';
}

export default function WorkersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClientComponentClient();

  // Check authentication
  useEffect(() => {
    try {
      if (status === 'loading') return;
      if (!session) {
        router.push('/');
      }
    } catch (err) {
      console.error('Auth check error:', err);
    }
  }, [session, status, router]);

  // Fetch workers data
  useEffect(() => {
    try {
      if (session) {
        fetchWorkers();
      }
    } catch (err) {
      console.error('Fetch trigger error:', err);
    }
  }, [session]);

  const fetchWorkers = async () => {
    try {
      console.log('Fetching workers...');
      setLoading(true);

      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data, error });

      if (error) {
        throw error;
      }

      // Transform snake_case to camelCase
      if (data && Array.isArray(data)) {
        const transformedData: Worker[] = data.map((worker: any) => ({
          id: worker.id,
          firstName: worker.first_name || '',
          lastName: worker.last_name || '',
          email: worker.email || '',
          phone: worker.phone || '',
          role: worker.role || '',
          department: worker.department || '',
          startDate: worker.start_date || '',
          visaExpiry: worker.visa_expiry || '',
          status: worker.is_active ? 'active' : 'inactive'
        }));
        
        console.log('Transformed workers:', transformedData);
        setWorkers(transformedData);
      }
    } catch (error: any) {
      console.error('Error fetching workers:', error);
      toast.error('Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  };

  const handleViewWorker = (workerId: string) => {
    try {
      router.push(`/workers/${workerId}`);
    } catch (err) {
      console.error('Navigation error:', err);
    }
  };

  const handleDeleteWorker = async (workerId: string) => {
    try {
      if (!confirm('Are you sure you want to delete this worker?')) {
        return;
      }

      const { error } = await supabase
        .from('workers')
        .delete()
        .eq('id', workerId);

      if (error) {
        throw error;
      }

      toast.success('Worker deleted successfully');
      await fetchWorkers();
    } catch (error: any) {
      console.error('Error deleting worker:', error);
      toast.error('Failed to delete worker');
    }
  };

  // Filter workers based on search
  const filteredWorkers = workers.filter(worker => {
    try {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        worker.firstName.toLowerCase().includes(search) ||
        worker.lastName.toLowerCase().includes(search) ||
        worker.email.toLowerCase().includes(search) ||
        worker.role.toLowerCase().includes(search)
      );
    } catch (error) {
      return false;
    }
  });

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Workers</h1>
          <p className="text-muted-foreground">
            Manage your workforce and compliance documents
          </p>
        </div>
        <button
          onClick={() => toast.info('Add Worker feature coming soon')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Worker
        </button>
      </div>

      {/* Simple Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Total Workers</h3>
          <p className="text-2xl font-bold">{workers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Active</h3>
          <p className="text-2xl font-bold">
            {workers.filter(w => w.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Departments</h3>
          <p className="text-2xl font-bold">
            {new Set(workers.map(w => w.department).filter(Boolean)).size}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Search workers by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Workers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredWorkers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No workers found
                </td>
              </tr>
            ) : (
              filteredWorkers.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {worker.firstName} {worker.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{worker.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {worker.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {worker.department || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      worker.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {worker.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewWorker(worker.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteWorker(worker.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals - commented out for now */}
      {/* <AddWorkerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddWorker}
      />
      <CreateReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={handleCreateReport}
      /> */}
    </div>
  );
}