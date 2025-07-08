"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PaymentGate from "@/components/PaymentGate";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  status: string;
}

const COMPLIANS_HR_PRODUCT_ID = "complians-hr";

export default function CompliansHRLanding() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("workers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setWorkers([]);
    } else {
      setWorkers(
        (data || []).map((w: any) => ({
          id: w.id,
          firstName: w.first_name,
          lastName: w.last_name,
          email: w.email,
          role: w.role,
          department: w.department,
          status: w.is_active ? "active" : "inactive",
        }))
      );
    }
    setLoading(false);
  };

  return (
    <PaymentGate productId={COMPLIANS_HR_PRODUCT_ID} productName="Complians HR Correction Pack">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-2">Complians HR Correction Packs</h1>
        <p className="text-gray-600 mb-6">Proactive and reactive HR compliance correction for your workforce.</p>
        {loading ? (
          <div>Loading...</div>
        ) : workers.length === 0 ? (
          <div className="text-center mt-12">
            <p className="mb-4 text-lg">No correction packs started yet.</p>
            <Button asChild>
              <Link href="/workers/new?redirect=/complians-hr">Start New Correction Pack</Link>
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Workers</h2>
              <Button asChild>
                <Link href="/workers/new?redirect=/complians-hr">Start New Correction Pack</Link>
              </Button>
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
                  {workers.map((worker) => (
                    <tr key={worker.id}>
                      <td className="px-6 py-4">
                        <div className="font-medium">{worker.firstName} {worker.lastName}</div>
                        <div className="text-sm text-gray-500">{worker.email}</div>
                      </td>
                      <td className="px-6 py-4">{worker.role}</td>
                      <td className="px-6 py-4">{worker.department || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${worker.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{worker.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button onClick={() => router.push(`/complians-hr/${worker.id}`)} size="sm">Open Correction Pack</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PaymentGate>
  );
} 