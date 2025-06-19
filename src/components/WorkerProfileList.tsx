'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Simple type definitions
interface Worker {
  id: string;
  first_name: string;
  last_name: string;
  nationality: string;
  email: string;
  phone: string;
}

// Mock API function (replace with your actual Supabase implementation)
const fetchWorkers = async (): Promise<Worker[]> => {
  // In a real implementation, this would call Supabase
  return [
    {
      id: '1',
      first_name: 'John',
      last_name: 'Smith',
      nationality: 'United Kingdom',
      email: 'john.smith@example.com',
      phone: '+44 1234 567890'
    },
    {
      id: '2',
      first_name: 'Maria',
      last_name: 'Garcia',
      nationality: 'Spain',
      email: 'maria.garcia@example.com',
      phone: '+44 2345 678901'
    }
  ];
};

export default function WorkerProfileList() {
  const router = useRouter();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadWorkers = async () => {
      try {
        setLoading(true);
        const data = await fetchWorkers();
        setWorkers(data);
      } catch (err) {
        console.error('Error loading workers:', err);
        setError('Failed to load workers. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadWorkers();
  }, []);
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Sponsored Workers</h2>
        <button 
          onClick={() => router.push('/workers/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add New Worker
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading workers...</p>
        </div>
      ) : workers.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No workers found</p>
          <Link 
            href="/workers/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Your First Worker
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nationality</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {workers.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{worker.first_name} {worker.last_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{worker.nationality}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{worker.email}</div>
                    <div className="text-sm text-gray-500">{worker.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => router.push(`/workers/${worker.id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </button>
                    <button
                      onClick={() => router.push(`/workers/${worker.id}/edit`)}
                      className="text-amber-600 hover:text-amber-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
