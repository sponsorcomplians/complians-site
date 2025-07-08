"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PaymentGate from "@/components/PaymentGate";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import SW002Form from "@/components/sw002/SW002Form";

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
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#00AEEF] mb-2">
                SW002 Skilled Worker Coversheet
              </h1>
              <h2 className="text-xl font-bold text-[#00AEEF]">
                {worker.firstName} {worker.lastName}
              </h2>
            </div>
            <SW002Form workerId={workerId} />
          </div>
        )}
      </div>
    </PaymentGate>
  );
} 