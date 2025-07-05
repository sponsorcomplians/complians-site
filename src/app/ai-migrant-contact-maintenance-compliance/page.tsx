"use client";

import { Suspense } from 'react';
import MigrantContactMaintenanceDashboard from '@/components/MigrantContactMaintenanceDashboard';

export default function AIMigrantContactMaintenanceCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MigrantContactMaintenanceDashboard />
    </Suspense>
  );
}
