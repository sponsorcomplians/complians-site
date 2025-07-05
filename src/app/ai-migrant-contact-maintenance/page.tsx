"use client";

import { Suspense } from 'react';
import MigrantContactMaintenanceDashboard from '@/components/MigrantContactMaintenanceDashboard';

export default function AIMigrantContactMaintenancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MigrantContactMaintenanceDashboard />
    </Suspense>
  );
} 