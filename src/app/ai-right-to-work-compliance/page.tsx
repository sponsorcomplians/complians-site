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
    <AIComplianceDashboard 
      title="AI Right to Work Compliance System"
      description="AI-powered right to work verification and compliance analysis"
      storagePrefix="rightToWork"
      documentType="Right to Work Document"
      complianceType="Right to Work Compliance"
    />
  );
} 