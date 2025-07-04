'use client';

export const dynamic = 'force-dynamic'

import RightToWorkComplianceDashboard from '@/components/RightToWorkComplianceDashboard';

// Content component that uses useSearchParams
function RightToWorkComplianceContent() {
  return <RightToWorkComplianceDashboard />;
}

// Default export with Suspense wrapper
export default function AIRightToWorkCompliancePage() {
  return <RightToWorkComplianceDashboard />;
} 