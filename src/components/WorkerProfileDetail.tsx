'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import DocumentUploadForm from '@/components/DocumentUploadForm' // Import the new component

// Simple type definitions
interface Worker {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  passport_number: string;
  email: string;
  phone: string;
}

interface ImmigrationStatus {
  id: string;
  worker_id: string;
  visa_type: string;
  visa_number: string;
  start_date: string;
  expiry_date: string;
  brp_number: string;
  cos_reference: string;
  status: string;
}

interface WorkerDocument {
  id: string;
  worker_id: string;
  category_name: string; // Assuming we get the name directly for display
  file_name: string;
  file_url: string;
  uploaded_at: string;
  expiry_date?: string;
  is_verified: boolean;
}

// Mock API functions (replace with your actual Supabase implementation)
const fetchWorker = async (id: string): Promise<Worker> => {
  // In a real implementation, this would call Supabase
  return {
    id,
    first_name: 'John',
    last_name: 'Smith',
    date_of_birth: '1990-01-15',
    nationality: 'United Kingdom',
    passport_number: '123456789',
    email: 'john.smith@example.com',
    phone: '+44 1234 567890'
  };
};

const fetchImmigrationStatus = async (workerId: string): Promise<ImmigrationStatus> => {
  // In a real implementation, this would call Supabase
  return {
    id: '1',
    worker_id: workerId,
    visa_type: 'Skilled Worker',
    visa_number: 'SW123456789',
    start_date: '2023-01-01',
    expiry_date: '2026-01-01',
    brp_number: 'BRP987654321',
    cos_reference: 'COS123456789',
    status: 'Active'
  };
};

const fetchWorkerDocuments = async (workerId: string): Promise<WorkerDocument[]> => {
  // In a real implementation, this would call Supabase to get documents for the worker
  return [
    {
      id: 'doc1',
      worker_id: workerId,
      category_name: 'Passport',
      file_name: 'john_smith_passport.pdf',
      file_url: '#',
      uploaded_at: '2024-01-10T10:00:00Z',
      expiry_date: '2030-01-10',
      is_verified: true,
    },
    {
      id: 'doc2',
      worker_id: workerId,
      category_name: 'Visa',
      file_name: 'john_smith_visa.pdf',
      file_url: '#',
      uploaded_at: '2024-01-15T11:30:00Z',
      expiry_date: '2026-01-01',
      is_verified: false,
    },
  ];
};

const deleteWorkerDocument = async (documentId: string): Promise<void> => {
  // In a real implementation, this would delete the document from Supabase storage and database
  console.log(`Simulating deletion of document: ${documentId}`);
  return Promise.resolve();
};

export default function WorkerProfileDetail() {
  const router = useRouter();
  const params = useParams();
  const workerId = params?.id as string;
  
  const [worker, setWorker] = useState<Worker | null>(null);
  const [immigrationStatus, setImmigrationStatus] = useState<ImmigrationStatus | null>(null);
  const [documents, setDocuments] = useState<WorkerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadWorkerData = async () => {
    if (!workerId) return;
    
    try {
      setLoading(true);
      const workerData = await fetchWorker(workerId);
      setWorker(workerData);
      
      const immigrationData = await fetchImmigrationStatus(workerId);
      setImmigrationStatus(immigrationData);

      const workerDocuments = await fetchWorkerDocuments(workerId);
      setDocuments(workerDocuments);

    } catch (err) {
      console.error('Error loading worker data:', err);
      setError('Failed to load worker data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkerData();
  }, [workerId]);

  const handleDeleteDocument = async (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteWorkerDocument(documentId);
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));
      } catch (err) {
        console.error('Error deleting document:', err);
        alert('Failed to delete document. Please try again.');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Loading worker profile...</p>
      </div>
    );
  }
  
  if (error || !worker) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          {error || 'Worker not found'}
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Worker Profile: {worker.first_name} {worker.last_name}</h1>
        <div className="space-x-2">
          <button
            onClick={() => router.push(`/workers/${worker.id}/edit`)}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Edit Profile
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">First Name</p>
                <p className="font-medium">{worker.first_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Name</p>
                <p className="font-medium">{worker.last_name}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium">{new Date(worker.date_of_birth).toLocaleDateString()}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Nationality</p>
              <p className="font-medium">{worker.nationality}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Passport Number</p>
              <p className="font-medium">{worker.passport_number}</p>
            </div>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="font-medium">{worker.email}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium">{worker.phone}</p>
            </div>
          </div>
        </div>
        
        {/* Immigration Status */}
        {immigrationStatus && (
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Immigration Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Visa Type</p>
                <p className="font-medium">{immigrationStatus.visa_type}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Visa Number</p>
                <p className="font-medium">{immigrationStatus.visa_number}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-medium">{new Date(immigrationStatus.start_date).toLocaleDateString()}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Expiry Date</p>
                <p className="font-medium">{new Date(immigrationStatus.expiry_date).toLocaleDateString()}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">BRP Number</p>
                <p className="font-medium">{immigrationStatus.brp_number}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">CoS Reference</p>
                <p className="font-medium">{immigrationStatus.cos_reference}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {immigrationStatus.status}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Document Upload Form */}
        <div className="md:col-span-2">
          <DocumentUploadForm workerId={workerId} />
        </div>

        {/* Worker Documents List */}
        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Worker Documents</h2>
          {documents.length === 0 ? (
            <p className="text-gray-600">No documents uploaded for this worker yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          {doc.file_name}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.category_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(doc.uploaded_at), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doc.expiry_date ? format(new Date(doc.expiry_date), 'dd/MM/yyyy') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {doc.is_verified ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Yes
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
