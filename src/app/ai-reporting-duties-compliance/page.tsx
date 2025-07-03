'use client'

import { Suspense } from 'react';
import AIComplianceDashboard from '@/components/AIComplianceDashboard';

function ReportingDutiesComplianceContent() {
  return <AIComplianceDashboard />;
}

export default function AIReportingDutiesCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportingDutiesComplianceContent />
    </Suspense>
  );
}
