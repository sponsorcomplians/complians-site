'use client';

import { Suspense } from 'react';
import AIComplianceDashboard from '@/components/AIComplianceDashboard';

// Content component that uses useSearchParams
function QualificationComplianceContent() {
  return <AIComplianceDashboard />;
}

// Default export with Suspense wrapper
export default function AIQualificationCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QualificationComplianceContent />
    </Suspense>
  );
}

