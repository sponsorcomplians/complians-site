"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PaymentGate from "@/components/PaymentGate";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const COMPLIANS_HR_PRODUCT_ID = "complians-hr";

interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  status: string;
}

export default function CompliansHRWorkerPage() {
  const params = useParams();
  const workerId = params.id as string;
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (workerId) {
      fetchWorker();
    }
  }, [workerId]);

  const fetchWorker = async () => {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('id', workerId)
        .single();

      if (error) throw error;

      if (data) {
        const transformedWorker: Worker = {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          role: data.role,
          department: data.department,
          status: data.is_active ? 'active' : 'inactive',
        };

        setWorker(transformedWorker);
      }
    } catch (error) {
      console.error('Error fetching worker:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaymentGate productId={COMPLIANS_HR_PRODUCT_ID} productName="Complians HR Correction Pack">
      <div className="container mx-auto p-8">
        {loading ? (
          <div>Loading worker details...</div>
        ) : !worker ? (
          <div>Worker not found.</div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                Complians HR Correction Pack for {worker.firstName} {worker.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-gray-700 font-medium">Email: {worker.email}</div>
                <div className="text-gray-700 font-medium">Role: {worker.role}</div>
                <div className="text-gray-700 font-medium">Department: {worker.department || 'N/A'}</div>
                <div className="text-gray-700 font-medium">Status: {worker.status}</div>
              </div>
              <div className="mt-8">
                {/* Correction form module will go here */}
                <div className="p-6 bg-gray-50 rounded border border-dashed border-gray-300 text-gray-500 text-center">
                  Correction form coming soon...
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PaymentGate>
  );
} 