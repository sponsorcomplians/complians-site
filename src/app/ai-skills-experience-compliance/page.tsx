"use client";
import { Suspense } from 'react';
import SkillsExperienceComplianceDashboard from '@/components/SkillsExperienceComplianceDashboard';

export default function AISkillsExperienceCompliancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SkillsExperienceComplianceDashboard />
    </Suspense>
  );
} 