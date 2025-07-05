"use client";

import { Suspense } from 'react';
import RecordKeepingComplianceDashboard from '@/components/RecordKeepingComplianceDashboard';

export default function AIRecordKeepingCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecordKeepingComplianceDashboard />
    </Suspense>
  );
}
