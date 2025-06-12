'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import WorkerProfileForm from '@/components/WorkerProfileForm'

// Simple type definition
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

// Mock API function (replace with your actual Supabase implementation)
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

export default function EditWorkerPage() {
  const params = useParams();
  const workerId = params?.id as string;
  
  const [worker, setWorker] = useState<Worker | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadWorker = async () => {
      if (!workerId) return;
      
      try {
        const data = await fetchWorker(workerId);
        setWorker(data);
      } catch (err) {
        console.error('Error loading worker:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadWorker();
  }, [workerId]);
  
  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Loading worker data...</p>
      </div>
    );
  }
  
  return <WorkerProfileForm worker={worker} />;
}
