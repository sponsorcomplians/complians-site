"use client";

import { Suspense } from 'react';
import ImmigrationStatusMonitoringDashboard from '@/components/ImmigrationStatusMonitoringDashboard';

export default function AIImmigrationStatusMonitoringCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ImmigrationStatusMonitoringDashboard />
    </Suspense>
  );
} 