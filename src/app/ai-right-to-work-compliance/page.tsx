'use client';

import { Suspense } from 'react';
import AIComplianceDashboard from '@/components/AIComplianceDashboard';

// Content component that uses useSearchParams
function RightToWorkComplianceContent() {
  return <AIComplianceDashboard />;
}

// Default export with Suspense wrapper
export default function AIRightToWorkCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RightToWorkComplianceContent />
    </Suspense>
  );
} 