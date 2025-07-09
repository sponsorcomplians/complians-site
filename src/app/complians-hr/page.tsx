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
      <div className="container mx-auto p-6 bg-[#F9FAFB] min-h-screen font-sans animate-fade-in">
        <h1 className="text-3xl font-bold text-[#00AEEF] mb-2">CompliANS HR Correction Packs</h1>
        <p className="text-[#6B7280] mb-6 leading-relaxed text-lg">Proactive and reactive HR compliance correction for your workforce.</p>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="w-full sm:w-auto">
            {/* Optional: Add search/filter here if needed */}
          </div>
          <button
            className="bg-[#00AEEF] text-white px-6 py-3 rounded-full hover:bg-[#0096c7] transition-all duration-150 font-semibold shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:ring-offset-2"
            onClick={() => router.push('/workers/new?redirect=/complians-hr')}
          >
            Start New Correction Pack
          </button>
        </div>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#F9FAFB]">
              <tr>
                <th className="px-6 py-4 font-medium text-[#6B7280]">Name</th>
                <th className="px-6 py-4 font-medium text-[#6B7280]">Role</th>
                <th className="px-6 py-4 font-medium text-[#6B7280]">Department</th>
                <th className="px-6 py-4 font-medium text-[#6B7280]">Status</th>
                <th className="px-6 py-4 font-medium text-[#6B7280]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-[#6B7280]">Loading...</td></tr>
              ) : workers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-[#6B7280]">No correction packs started yet.</td></tr>
              ) : (
                workers.map((worker, idx) => (
                  <tr
                    key={worker.id}
                    className={`border-b transition hover:bg-[#F3F4F6] cursor-pointer ${idx % 2 === 1 ? 'bg-[#FAFAFB]' : ''}`}
                    onClick={() => router.push(`/complians-hr/${worker.id}`)}
                  >
                    <td className="px-6 py-4 rounded-md">
                      <div className="font-medium text-[#1F2937]">{worker.firstName} {worker.lastName}</div>
                      <div className="text-sm text-[#6B7280]">{worker.email}</div>
                    </td>
                    <td className="px-6 py-4 rounded-md">{worker.role}</td>
                    <td className="px-6 py-4 rounded-md">{worker.department || 'N/A'}</td>
                    <td className="px-6 py-4 rounded-md">
                      <span className={`bg-[#D1FAE5] text-[#065F46] rounded-full px-3 py-1 text-xs font-medium ${worker.status !== 'active' ? 'bg-gray-200 text-gray-500' : ''}`}>
                        {worker.status.charAt(0).toUpperCase() + worker.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 rounded-md">
                      <button
                        className="bg-[#00AEEF] text-white px-4 py-2 rounded-full hover:bg-[#0096c7] transition-all duration-150 font-semibold shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:ring-offset-2"
                        onClick={e => { e.stopPropagation(); router.push(`/complians-hr/${worker.id}`); }}
                      >
                        Open Correction Pack
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PaymentGate>
  );
} 