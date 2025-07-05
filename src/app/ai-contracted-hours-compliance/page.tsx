"use client";

export const dynamic = 'force-dynamic'

import { Suspense } from 'react';
import ContractedHoursComplianceDashboard from '@/components/ContractedHoursComplianceDashboard';

export default function ContractedHoursCompliancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <ContractedHoursComplianceDashboard />
      </Suspense>
    </div>
  );
}
