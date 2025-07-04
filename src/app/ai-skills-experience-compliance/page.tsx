'use client';

export const dynamic = 'force-dynamic'

import AIComplianceDashboard from '@/components/AIComplianceDashboard';

// Content component that uses useSearchParams
function SkillsExperienceComplianceContent() {
  return <AIComplianceDashboard />;
}

// Default export with Suspense wrapper
export default function AISkillsExperienceCompliancePage() {
  return (
    <AIComplianceDashboard 
      title="AI Skills & Experience Compliance System"
      description="AI-powered skills assessment and experience verification"
      storagePrefix="skillsExperience"
      documentType="Skills/Experience Document"
      complianceType="Skills & Experience Compliance"
    />
  );
} 