'use client';

import { Suspense } from 'react';
import SkillsExperienceComplianceDashboard from '@/components/SkillsExperienceComplianceDashboard';

// Content component that uses useSearchParams
function SkillsExperienceComplianceContent() {
  return <SkillsExperienceComplianceDashboard />;
}

// Default export with Suspense wrapper
export default function SkillsExperienceCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SkillsExperienceComplianceContent />
    </Suspense>
  );
} 