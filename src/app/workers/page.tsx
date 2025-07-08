'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
  visaExpiry: string;
  status: 'active' | 'inactive';
}

export default function WorkersPage() {
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // if (!session) router.push('/'); // TEMPORARILY DISABLED FOR DEV

  useEffect(() => {
    if (session) fetchWorkers();
  }, [session]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

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

      setWorkers(transformedData);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  };

  const handleViewWorker = (id: string) => {
    router.push(`/workers/${id}`);
  };

  const handleDeleteWorker = async (id: string) => {
    if (!confirm('Are you sure you want to delete this worker?')) return;
    try {
      const { error } = await supabase.from('workers').delete().eq('id', id);
      if (error) throw error;
      toast.success('Worker deleted');
      fetchWorkers();
    } catch (error: any) {
      toast.error('Delete failed');
      console.error(error);
    }
  };

  const filteredWorkers = workers.filter(worker => {
    const search = searchTerm.toLowerCase();
    return (
      worker.firstName.toLowerCase().includes(search) ||
      worker.lastName.toLowerCase().includes(search) ||
      worker.email.toLowerCase().includes(search) ||
      worker.role.toLowerCase().includes(search)
    );
  });

  if (!mounted || status === 'loading' || loading) {
    return (
      <div className="container mx-auto p-6 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Workers</h1>
          <p className="text-muted-foreground">Manage your workforce</p>
        </div>
        <button
          onClick={() => toast.info('Add Worker coming soon')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Worker
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm font-medium text-gray-600">Total</h3>
          <p className="text-2xl font-bold">{workers.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm font-medium text-gray-600">Active</h3>
          <p className="text-2xl font-bold">{workers.filter(w => w.status === 'active').length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm font-medium text-gray-600">Departments</h3>
          <p className="text-2xl font-bold">
            {new Set(workers.map(w => w.department).filter(Boolean)).size}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, or role..."
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
        />
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredWorkers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No workers found.
                </td>
              </tr>
            ) : (
              filteredWorkers.map(worker => (
                <tr key={worker.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium">{worker.firstName} {worker.lastName}</div>
                    <div className="text-sm text-gray-500">{worker.email}</div>
                  </td>
                  <td className="px-6 py-4">{worker.role}</td>
                  <td className="px-6 py-4">{worker.department || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                      worker.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {worker.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleViewWorker(worker.id)} className="text-blue-600 hover:underline mr-3">
                      View
                    </button>
                    <button onClick={() => handleDeleteWorker(worker.id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
  );
}
