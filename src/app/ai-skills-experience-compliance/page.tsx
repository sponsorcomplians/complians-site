'use client';

import { Suspense } from 'react';
import AIComplianceDashboard from '@/components/AIComplianceDashboard';

// Content component that uses useSearchParams
function SkillsExperienceComplianceContent() {
  return <AIComplianceDashboard />;
}

// Default export with Suspense wrapper
export default function AISkillsExperienceCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SkillsExperienceComplianceContent />
    </Suspense>
  );
} 