"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PaymentGate from "@/components/PaymentGate";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import SW002Form from "@/components/sw002/SW002Form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
            <SW002Form workerId={workerId} />
            <div className="mt-6">
              <Label htmlFor="migrantName" className="text-lg font-semibold text-[#00AEEF]">
                Name of the Migrant
              </Label>
              <Input
                id="migrantName"
                name="migrantName"
                value={`${worker.firstName} ${worker.lastName}`}
                className="mt-2 text-lg font-medium"
                readOnly
              />
            </div>
          </div>
        )}
      </div>
    </PaymentGate>
  );
} 