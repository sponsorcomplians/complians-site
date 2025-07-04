export const dynamic = 'force-dynamic'

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
      <AIComplianceDashboard 
        title="AI Qualification Compliance System"
        description="AI-powered SOC code verification and job qualification analysis"
        storagePrefix="qualification"
        documentType="Qualification Certificate"
        complianceType="SOC Code Compliance"
      />
    </Suspense>
  );
}

